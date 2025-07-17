import { createClient } from '@supabase/supabase-js';
import { cfg } from '$lib/env';

export const supaAdmin = createClient(
	import.meta.env.PUBLIC_SUPABASE_URL!,
	cfg.SUPABASE_SERVICE_KEY ?? ''
);
