import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cfg, SUPABASE_URL } from '$lib/env';

export function getSupaAdmin(): SupabaseClient {
	if (!SUPABASE_URL || !cfg.SUPABASE_SERVICE_KEY) {
		throw new Error('Supabase credentials are missing');
	}
	return createClient(SUPABASE_URL, cfg.SUPABASE_SERVICE_KEY);
}
