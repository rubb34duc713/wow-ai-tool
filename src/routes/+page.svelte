<script lang="ts">
	let url = '';
	let summary = '';
	let busy = false;
 70wrfu-codex/deploy-sveltekit-app-to-vercel

=======
 main
	async function submit() {
		busy = true;
		summary = '';
		const r = await fetch('/api/ingest', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ source: 'youtube', url })
		});
		const j = await r.json();
		summary = j.summary ?? j.error;
		busy = false;
	}
</script>

<main class="mx-auto max-w-xl p-8">
	<h1 class="mb-6 text-3xl font-bold">WOW AI Tool MVP-0</h1>

	<input class="mb-2 w-full border p-2" placeholder="Paste YouTube URL" bind:value={url} />

	<button
		on:click={submit}
		class="bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
		disabled={busy || !url}
	>
		{busy ? 'Processing…' : 'Summarise'}
	</button>

	{#if summary}
		<h2 class="mt-6 text-xl font-semibold">Result</h2>
		<pre class="mt-2 bg-gray-100 p-4 whitespace-pre-wrap">{summary}</pre>
	{/if}
</main>
