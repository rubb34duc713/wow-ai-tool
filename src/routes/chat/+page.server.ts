import type { PageServerLoad } from './$types';
import { supaAdmin } from '$lib/server/supaAdmin';

export const load: PageServerLoad = async ({ cookies }) => {
	let convId = cookies.get('conv');
	if (!convId) {
		const { data, error } = await supaAdmin.from('conversations').insert({}).select('id').single();
		if (error) throw error;
		convId = data!.id as string;
		cookies.set('conv', convId, { path: '/', httpOnly: true, sameSite: 'lax' });
	}

	const { data: messages } = await supaAdmin
		.from('messages')
		.select('id, role, content, created_at')
		.eq('conversation_id', convId)
		.order('created_at');

	return { conversationId: convId, messages: messages ?? [] };
};
