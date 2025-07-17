<script lang="ts">
	let limit = 5;
	let summary = '';
	let busy = false;

	async function submit() {
		busy = true;
		summary = '';
		const r = await fetch('/api/aggregate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ limit })
		});
		const j = await r.json();
		summary = j.summary ?? j.error;
		busy = false;
	}
</script>

<main class="mx-auto max-w-xl p-8">
	<h1 class="mb-4 text-2xl font-bold">Aggregate Summaries</h1>

	<label class="mb-2 block">
		<span class="mr-2">Count:</span>
		<input type="number" bind:value={limit} min="1" max="20" class="w-16 border p-1" />
	</label>

	<button
		on:click={submit}
		class="bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
		disabled={busy}
	>
		{busy ? 'Processing…' : 'Combine'}
	</button>

	{#if summary}
		<h2 class="mt-6 text-xl font-semibold">Result</h2>
		<pre class="mt-2 bg-gray-100 p-4 whitespace-pre-wrap">{summary}</pre>
	{/if}
</main>
