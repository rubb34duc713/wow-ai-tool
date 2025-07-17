import { createClient } from '@supabase/supabase-js';
import { cfg } from '$lib/env';

const supabase = createClient(import.meta.env.PUBLIC_SUPABASE_URL!, cfg.SUPABASE_SERVICE_KEY ?? '');

export async function getSecret(key: string): Promise<string | null> {
	const { data, error } = await supabase.from('secrets').select('value').eq('key', key).single();

	if (error) {
		console.error('secret fetch error', key, error.message);
		return null;
	}
	return data?.value ?? null;
}
