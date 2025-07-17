import { createClient } from '@supabase/supabase-js';
import { cfg } from './cfg';

export const supabaseService = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_SERVICE_KEY);
