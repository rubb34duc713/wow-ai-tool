<script lang="ts">
	export let data: {
		conversationId: string;
		messages: { id: string; role: string; content: string; created_at: string }[];
	};
	let input = '';
	let busy = false;

	async function send() {
		if (!input) return;
		busy = true;
		const r = await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ conversation_id: data.conversationId, message: input })
		});
		const j = await r.json();
		if (j.message) {
			data.messages.push({
				id: crypto.randomUUID(),
				role: 'user',
				content: input,
				created_at: new Date().toISOString()
			});
			data.messages.push({
				id: crypto.randomUUID(),
				role: 'assistant',
				content: j.message,
				created_at: new Date().toISOString()
			});
		}
		input = '';
		busy = false;
	}
</script>

<main class="mx-auto max-w-xl p-8">
	<h1 class="mb-4 text-2xl font-bold">Chat</h1>
	<div class="mb-4 space-y-2">
		{#each data.messages as m (m.id)}
			<div class="rounded bg-gray-100 p-2">
				<strong>{m.role}:</strong>
				{m.content}
			</div>
		{/each}
	</div>
	<textarea class="mb-2 w-full border p-2" bind:value={input} rows="3"></textarea>
	<button on:click={send} class="bg-blue-600 px-4 py-2 text-white" disabled={busy || !input}>
		{busy ? 'Sending…' : 'Send'}
	</button>
</main>
