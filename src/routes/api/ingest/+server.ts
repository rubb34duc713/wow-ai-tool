import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import { Deepgram } from '@deepgram/sdk';
import { cfg } from '$lib/env';
import { supa } from '$lib/supa';
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
		const data = bodySchema.parse(await request.json());

		const transcript = data.paste ?? (await transcribeYouTube(data.url!));

		const summary = await summariseLLM(transcript);

		await supa.from('transcriptions').insert({
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
	const ytdl = await import('ytdl-core');
	const info = await ytdl.default.getInfo(url);
	const stream = ytdl.default.downloadFromInfo(info, { quality: 'highestaudio' });

	const chunks: Uint8Array[] = [];
	for await (const c of stream) chunks.push(c);
	const buffer = Buffer.concat(chunks);

	const dg = new Deepgram(cfg.DEEPGRAM_API_KEY);
	const { result } = await dg.transcription.preRecorded({ buffer });
	return result?.channels[0]?.alternatives[0]?.transcript ?? '';
}

async function summariseLLM(text: string) {
	// Try Grok first (xAI API is OpenAI-compatible)
	try {
		const xai = new OpenAI({
			baseURL: 'https://api.x.ai/v1',
			apiKey: cfg.GROK_API_KEY
		});
		return await callLLM(xai, text);
	} catch {
		const openai = new OpenAI({ apiKey: cfg.OPENAI_API_KEY });
		return await callLLM(openai, text);
	}
}

async function callLLM(client: OpenAI, text: string) {
	const { choices } = await client.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: 'You are a concise crypto-research summariser.' },
			{ role: 'user', content: `Summarise:\n\n${text}` }
		]
	});
	return choices[0].message.content;
}
