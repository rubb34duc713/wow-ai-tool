import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import OpenAI from 'openai';
import { getSupaAdmin } from '$lib/server/supaAdmin';
import { cfg } from '$lib/env';
import { getSecret } from '$lib/server/secrets';

const schema = z.object({
	conversation_id: z.string().uuid().optional(),
	message: z.string().min(1)
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const supaAdmin = getSupaAdmin();
		const { conversation_id, message } = schema.parse(await request.json());
		let convId = conversation_id;
		if (!convId) {
			const { data, error } = await supaAdmin
				.from('conversations')
				.insert({})
				.select('id')
				.single();
			if (error) throw error;
			convId = data!.id as string;
		}

		await supaAdmin.from('messages').insert({
			conversation_id: convId,
			role: 'user',
			content: message
		});

		const reply = await chatLLM(message);

		await supaAdmin.from('messages').insert({
			conversation_id: convId,
			role: 'assistant',
			content: reply
		});

		return json({ message: reply, conversation_id: convId }, { status: 200 });
	} catch (err) {
		console.error(err);
		return json({ error: (err as Error).message }, { status: 400 });
	}
};

async function chatLLM(text: string): Promise<string> {
	const grokKey = cfg.GROK_API_KEY ?? (await getSecret('GROK_API_KEY'));
	if (grokKey) {
		try {
			const xai = new OpenAI({
				baseURL: 'https://api.x.ai/v1',
				apiKey: grokKey!
			});
			return await callLLM(xai, text, 'grok-3-mini');
		} catch {
			// fall back to OpenAI
		}
	}
	const openaiKey = cfg.OPENAI_API_KEY ?? (await getSecret('OPENAI_API_KEY')) ?? '';
	const openai = new OpenAI({ apiKey: openaiKey });
	return await callLLM(openai, text, 'gpt-4o-mini');
}

async function callLLM(client: OpenAI, text: string, model: string): Promise<string> {
	const { choices } = await client.chat.completions.create({
		model,
		messages: [
			{ role: 'system', content: 'You are a helpful assistant.' },
			{ role: 'user', content: text }
		]
	});
	return choices[0].message.content ?? '';
}
