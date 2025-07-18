import ytdlp from 'yt-dlp-exec';

import ytdlp from 'yt-dlp-exec';

/**
 * Fetch and clean auto-generated English captions from YouTube.
 * Returns empty string on failure, so callers know to fall back.
 */
export async function fetchYouTubeCaptions(url: string): Promise<string> {
  try {
    // Download VTT to stdout via the exec API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { stdout } = await (ytdlp as any).exec(url, {
      skipDownload: true,
      writeAutoSub: true,
      subLang:      'en',
      subFormat:    'vtt',
      output:       '-'
    });
    return cleanVtt(stdout);
  } catch {
    return '';
  }
}

function cleanVtt(vtt: string): string {
  return vtt
    .split('\n')
    .filter(
      (line) =>
        line.trim() &&
        !line.startsWith('WEBVTT') &&
        // strip lines like "00:01.234 --> 00:04.567"
        !/^\d{2}:\d{2}\.\d{3} -->/.test(line)
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
			skipDownload: true,
			writeAutoSub: true,
			subLang: 'en',
			subFormat: 'vtt',
			output: '-'
9c25l6-codex/deploy-sveltekit-app-to-vercel
		});
=======
		})) as unknown as { stdout: string };
main
		return cleanVtt(stdout);
	} catch {
		return '';
	}
}

function cleanVtt(vtt: string): string {
	return vtt
		.split('\n')
9c25l6-codex/deploy-sveltekit-app-to-vercel
		.filter((line) => !line.startsWith('WEBVTT') && !/\d+:\d+:\d+\.\d+ -->/.test(line))
=======
		.filter(
			(line) => line.trim() && !line.startsWith('WEBVTT') && !/^\d+:\d{2}\.\d{3} -->/.test(line)
		)
main
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}
