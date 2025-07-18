import { z } from 'zod';
 70wrfu-codex/deploy-sveltekit-app-to-vercel
import { env } from '$env/dynamic/private';

export const cfg = z
	.object({
		SUPABASE_SERVICE_KEY: z.string(),
		DEEPGRAM_API_KEY: z.string(),
		OPENAI_API_KEY: z.string(),
		GROK_API_KEY: z.string().optional()
	})
	.parse(env);
=======
import { env as priv } from '$env/dynamic/private';
import { env as pub } from '$env/dynamic/public';

export const cfg = z
	.object({
		SUPABASE_URL: z.string().optional(),
		SUPABASE_SERVICE_KEY: z.string().optional(),
		DEEPGRAM_API_KEY: z.string().optional(),
		OPENAI_API_KEY: z.string().optional(),
		GROK_API_KEY: z.string().optional()
	})
	.parse({ ...priv, ...pub });

export const SUPABASE_URL = cfg.SUPABASE_URL ?? pub.PUBLIC_SUPABASE_URL;
 main
