import type { RequestHandler } from '@sveltejs/kit';
import { supabaseService } from '$lib/supa_service';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { error } = await supabaseService.from('ingest').insert(data);
		if (error) {
			return new Response(JSON.stringify({ error: error.message }), { status: 500 });
		}
		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
	}
};
