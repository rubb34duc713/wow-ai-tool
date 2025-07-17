import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const url = env.PUBLIC_SUPABASE_URL;
const anon = env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
	throw new Error('PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY must be set');
}

export const supa = createClient(url, anon);
