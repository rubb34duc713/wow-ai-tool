import { createClient } from '@supabase/supabase-js';
import { cfg, SUPABASE_URL } from '$lib/env';

const supabase =
	SUPABASE_URL && cfg.SUPABASE_SERVICE_KEY
		? createClient(SUPABASE_URL, cfg.SUPABASE_SERVICE_KEY)
		: null;

export async function getSecret(key: string): Promise<string | null> {
	if (!supabase) return null;
	const { data, error } = await supabase.from('secrets').select('value').eq('key', key).single();

	if (error) {
		console.error('secret fetch error', key, error.message);
		return null;
	}
	return data?.value ?? null;
}
