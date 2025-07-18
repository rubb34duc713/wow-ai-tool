import ytdlp from 'yt-dlp-exec';

/**
 * Fetch and clean auto-generated English captions from YouTube.
 * Returns empty string on failure, so callers know to fall back.
 */
export async function fetchYouTubeCaptions(url: string): Promise<string> {
	try {
		// Download VTT to stdout
		const { stdout } = (await ytdlp(url, {
			skipDownload: true,
			writeAutoSub: true,
			subLang: 'en',
			subFormat: 'vtt',
			output: '-'
		})) as unknown as { stdout: string };
		return cleanVtt(stdout);
	} catch {
		return '';
	}
}

function cleanVtt(vtt: string): string {
	return vtt
		.split('\n')
		.filter(
			(line) => line.trim() && !line.startsWith('WEBVTT') && !/^\d+:\d{2}\.\d{3} -->/.test(line)
		)
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}
