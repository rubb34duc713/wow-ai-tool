import type { PageServerLoad } from './$types';
import { getSupaAdmin } from '$lib/server/supaAdmin';

export const load: PageServerLoad = async ({ url }) => {
	const supaAdmin = getSupaAdmin();
	const page = Number(url.searchParams.get('page') ?? '1');
	const limit = 10;
	const from = (page - 1) * limit;
	const to = from + limit - 1;

	const { data, error, count } = await supaAdmin
		.from('transcriptions')
		.select('id, source, raw_url, summary, created_at', { count: 'exact' })
		.order('created_at', { ascending: false })
		.range(from, to);

	if (error) {
		console.error(error);
		return { items: [], page, pageCount: 1 };
	}

	const pageCount = count ? Math.ceil(count / limit) : 1;

	return { items: data ?? [], page, pageCount };
};
