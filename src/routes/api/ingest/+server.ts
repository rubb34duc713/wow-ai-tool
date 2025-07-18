import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import { Deepgram } from '@deepgram/sdk';
import { cfg } from '$lib/env';
import { getSupaAdmin } from '$lib/server/supaAdmin';
import { getSecret } from '$lib/server/secrets';
import OpenAI from 'openai';

const bodySchema = z
	.object({
		source: z.enum(['youtube', 'doc']),
		url: z.string().url().optional(),
		paste: z.string().optional()
	})
	.refine((d) => d.url || d.paste, {
		message: 'Either "url" or "paste" is required'
	});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const supaAdmin = getSupaAdmin();
		const data = bodySchema.parse(await request.json());

		const transcript = data.paste ?? (await transcribeYouTube(data.url!));

		const summary = await summariseLLM(transcript);

		await supaAdmin.from('transcriptions').insert({
			source: data.source,
			raw_url: data.url ?? null,
			transcript,
			summary
		});

		return json({ summary }, { status: 200 });
	} catch (err) {
		console.error(err);
		return json({ error: (err as Error).message }, { status: 400 });
	}
};

/* ---------- helpers ---------- */

async function transcribeYouTube(url: string) {
	try {
		const { default: ytdl } = await import('ytdl-core');
		const info = await ytdl.getInfo(url);
		const stream = ytdl.downloadFromInfo(info, { quality: 'highestaudio' });

		const chunks: Uint8Array[] = [];
		for await (const c of stream) chunks.push(c);
		const buffer = Buffer.concat(chunks);

		const dgKey = cfg.DEEPGRAM_API_KEY ?? (await getSecret('DEEPGRAM_API_KEY')) ?? '';
		const dg = new Deepgram(dgKey);
		// @ts-expect-error deepgram SDK types don't expose `transcription`
		const { result } = await dg.transcription.preRecorded({ buffer });
		return result?.channels[0]?.alternatives[0]?.transcript ?? '';
	} catch (err) {
		const e = err as { statusCode?: number; status?: number };
		const code = e.statusCode ?? e.status;
		if (code === 410) {
			throw new Error('YouTube returned 410 (video unavailable)');
		}
		console.error('transcribeYouTube failed:', err);
		throw err;
	}
}

async function summariseLLM(text: string) {
	try {
		// Try Grok first (xAI API is OpenAI-compatible)
		const grokKey = cfg.GROK_API_KEY ?? (await getSecret('GROK_API_KEY'));
		if (grokKey) {
			try {
				const xai = new OpenAI({
					baseURL: 'https://api.x.ai/v1',
					apiKey: grokKey
				});
				return await callLLM(xai, text, 'grok-3-mini');
			} catch (err) {
				console.warn('Grok failed, falling back to OpenAI', err);
			}
		}
		const openaiKey = cfg.OPENAI_API_KEY ?? (await getSecret('OPENAI_API_KEY')) ?? '';
		const openai = new OpenAI({ apiKey: openaiKey });
		return await callLLM(openai, text, 'gpt-4o-mini');
	} catch (err) {
		console.error('summariseLLM failed:', err);
		throw err;
	}
}

async function callLLM(client: OpenAI, text: string, model: string) {
	const { choices } = await client.chat.completions.create({
		model,
		messages: [
			{ role: 'system', content: 'You are a concise crypto-research summariser.' },
			{ role: 'user', content: `Summarise:\n\n${text}` }
		]
	});
	return choices[0].message.content;
}
import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import { Deepgram } from '@deepgram/sdk';
import { cfg } from '$lib/env';
import { getSupaAdmin } from '$lib/server/supaAdmin';
import { getSecret } from '$lib/server/secrets';
import { fetchYouTubeCaptions } from '$lib/captions';
import OpenAI from 'openai';

const bodySchema = z
	.object({
		source: z.enum(['youtube', 'doc']),
		url: z.string().url().optional(),
		paste: z.string().optional()
	})
	.refine((d) => d.url || d.paste, {
		message: 'Either "url" or "paste" is required'
	});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const supaAdmin = getSupaAdmin();
		const data = bodySchema.parse(await request.json());

		let transcript = '';
		if (data.url && data.source === 'youtube') {
			transcript = await fetchYouTubeCaptions(data.url);
		}

		if (!transcript) {
			transcript = data.paste ? data.paste : await transcribeYouTube(data.url!);
		}

		const summary = await summariseLLM(transcript);

		await supaAdmin.from('transcriptions').insert({
			source: data.source,
			raw_url: data.url ?? null,
			transcript,
			summary
		});

		return json({ summary }, { status: 200 });
	} catch (err) {
		console.error(err);
		return json({ error: (err as Error).message }, { status: 400 });
	}
};

/* ---------- helpers ---------- */

async function transcribeYouTube(url: string) {
	try {
		const { default: ytdl } = await import('ytdl-core');
		const info = await ytdl.getInfo(url);
		const stream = ytdl.downloadFromInfo(info, { quality: 'highestaudio' });

		const chunks: Uint8Array[] = [];
		for await (const c of stream) chunks.push(c);
		const buffer = Buffer.concat(chunks);

		const dgKey = cfg.DEEPGRAM_API_KEY ?? (await getSecret('DEEPGRAM_API_KEY')) ?? '';
		const dg = new Deepgram(dgKey);
		// @ts-expect-error deepgram SDK types don't expose `transcription`
		const { result } = await dg.transcription.preRecorded({ buffer });
		return result?.channels[0]?.alternatives[0]?.transcript ?? '';
	} catch (err) {
		const e = err as { statusCode?: number; status?: number };
		const code = e.statusCode ?? e.status;
		if (code === 410) {
			throw new Error('YouTube returned 410 (video unavailable)');
		}
		console.error('transcribeYouTube failed:', err);
		throw err;
	}
}

async function summariseLLM(text: string) {
	try {
		// Try Grok first (xAI API is OpenAI-compatible)
		const grokKey = cfg.GROK_API_KEY ?? (await getSecret('GROK_API_KEY'));
		if (grokKey) {
			try {
				const xai = new OpenAI({
					baseURL: 'https://api.x.ai/v1',
					apiKey: grokKey
				});
				return await callLLM(xai, text, 'grok-3-mini');
			} catch (err) {
				console.warn('Grok failed, falling back to OpenAI', err);
			}
		}
		const openaiKey = cfg.OPENAI_API_KEY ?? (await getSecret('OPENAI_API_KEY')) ?? '';
		const openai = new OpenAI({ apiKey: openaiKey });
		return await callLLM(openai, text, 'gpt-4o-mini');
	} catch (err) {
		console.error('summariseLLM failed:', err);
		throw err;
	}
}

async function callLLM(client: OpenAI, text: string, model: string) {
	const { choices } = await client.chat.completions.create({
		model,
		messages: [
			{ role: 'system', content: 'You are a concise crypto-research summariser.' },
			{ role: 'user', content: `Summarise:\n\n${text}` }
		]
	});
	return choices[0].message.content;
}
