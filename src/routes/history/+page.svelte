<script lang="ts">
	export let data: {
		items: {
			id: string;
			source: string;
			raw_url: string | null;
			summary: string;
			created_at: string;
		}[];
		page: number;
		pageCount: number;
	};
</script>

<main class="mx-auto max-w-3xl p-8">
	<h1 class="mb-4 text-2xl font-bold">History</h1>
	<table class="w-full border-collapse text-left">
		<thead>
			<tr>
				<th class="border-b p-2">Date</th>
				<th class="border-b p-2">Source</th>
				<th class="border-b p-2">Summary</th>
			</tr>
		</thead>
		<tbody>
			{#each data.items as item (item.id)}
				<tr class="align-top">
					<td class="border-b p-2">{new Date(item.created_at).toLocaleString()}</td>
					<td class="border-b p-2">{item.source}</td>
					<td class="border-b p-2 whitespace-pre-wrap">{item.summary}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="mt-4 flex justify-between">
		{#if data.page > 1}
			<a class="text-blue-600" href="?page={data.page - 1}">Previous</a>
		{/if}
		{#if data.page < data.pageCount}
			<a class="ml-auto text-blue-600" href="?page={data.page + 1}">Next</a>
		{/if}
	</div>
</main>
