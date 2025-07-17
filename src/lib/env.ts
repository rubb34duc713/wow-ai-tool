import { z } from 'zod';
import { env } from '$env/dynamic/private';

export const cfg = z
	.object({
		SUPABASE_SERVICE_KEY: z.string(),
		DEEPGRAM_API_KEY: z.string(),
		OPENAI_API_KEY: z.string(),
		YOUTUBE_API_KEY: z.string().optional(),
		GROK_API_KEY: z.string().optional(),
		LLM_PROMPT: z.string().optional()
	})
	.parse(env);
