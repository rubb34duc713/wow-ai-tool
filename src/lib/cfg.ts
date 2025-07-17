import { env } from '$env/dynamic/private';

export const cfg = {
	SUPABASE_URL: env.SUPABASE_URL as string,
	SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY as string,
	SUPABASE_SERVICE_KEY: env.SUPABASE_SERVICE_KEY as string
};
