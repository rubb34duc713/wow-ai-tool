import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Use the Vercel adapter for deployment
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter()
	}
};

export default config;
