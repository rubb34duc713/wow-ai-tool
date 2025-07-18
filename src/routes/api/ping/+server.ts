import { json } from '@sveltejs/kit';
import { env }  from '$env/dynamic/public';

export function GET() {
  return json({
    supaUrl:    env.PUBLIC_SUPABASE_URL,
    hasAnonKey: Boolean(env.PUBLIC_SUPABASE_ANON_KEY)
  });
}
