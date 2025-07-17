import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import { Deepgram } from '@deepgram/sdk';
import { cfg } from '$lib/env';
import { supaAdmin } from '$lib/server/supaAdmin';
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
	const { getInfo, downloadFromInfo } = await import('ytdl-core');
	const info = await getInfo(url);
	const stream = downloadFromInfo(info, { quality: 'highestaudio' });

	const chunks: Uint8Array[] = [];
	for await (const c of stream) chunks.push(c);
	const buffer = Buffer.concat(chunks);

	const dg = new Deepgram(cfg.DEEPGRAM_API_KEY);
	// @ts-expect-error deepgram SDK types don't expose `transcription`
	const { result } = await dg.transcription.preRecorded({ buffer });
	return result?.channels[0]?.alternatives[0]?.transcript ?? '';
}

async function summariseLLM(text: string) {
	// Try Grok first (xAI API is OpenAI-compatible)
	if (cfg.GROK_API_KEY) {
		try {
			const xai = new OpenAI({
				baseURL: 'https://api.x.ai/v1',
				apiKey: cfg.GROK_API_KEY
			});
			return await callLLM(xai, text, 'grok-3-mini');
		} catch {
			// fall through to OpenAI
		}
	}
	const openai = new OpenAI({ apiKey: cfg.OPENAI_API_KEY });
	return await callLLM(openai, text, 'gpt-4o-mini');
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
