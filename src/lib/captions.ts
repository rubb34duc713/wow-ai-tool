import ytdlp from 'yt-dlp-exec';

export async function fetchYouTubeCaptions(url: string): Promise<string> {
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { stdout } = await (ytdlp as any).exec(url, {
			skipDownload: true,
			writeAutoSub: true,
			subLang: 'en',
			subFormat: 'vtt',
			output: '-'
		});
		return cleanVtt(stdout);
	} catch {
		return '';
	}
}

function cleanVtt(vtt: string): string {
	return vtt
		.split('\n')
		.filter((line) => !line.startsWith('WEBVTT') && !/\d+:\d+:\d+\.\d+ -->/.test(line))
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}
