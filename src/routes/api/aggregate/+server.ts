import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import OpenAI from 'openai';
import { supaAdmin } from '$lib/server/supaAdmin';
import { cfg } from '$lib/env';

const bodySchema = z.object({
	limit: z.number().int().min(1).max(20).optional().default(5)
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { limit } = bodySchema.parse(await request.json());

		const { data, error } = await supaAdmin
			.from('transcriptions')
			.select('summary')
			.order('created_at', { ascending: false })
			.limit(limit);

		if (error) throw error;

		const combined = (data ?? []).map((d) => d.summary).join('\n\n');
		const summary = await summariseLLM(combined);

		await supaAdmin.from('summary_clusters').insert({ summary });

		return json({ summary }, { status: 200 });
	} catch (err) {
		console.error(err);
		return json({ error: (err as Error).message }, { status: 400 });
	}
};

async function summariseLLM(text: string) {
	try {
		const xai = new OpenAI({ baseURL: 'https://api.x.ai/v1', apiKey: cfg.GROK_API_KEY });
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
			{ role: 'system', content: 'You condense multiple crypto summaries.' },
			{ role: 'user', content: `Combine:\n\n${text}` }
		]
	});
	return choices[0].message.content;
}
