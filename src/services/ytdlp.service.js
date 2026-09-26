const ytDlp = require("yt-dlp-exec");

/**
 * Service handling YouTube data extraction and audio streaming via yt-dlp.
 * @module Services/YtDlpService
 */
class YtDlpService {
    /**
     * Searches for audio tracks on YouTube.
     *
     * @async
     * @param {string} query - Search terms.
     * @param {number} [limit=10] - Maximum number of results.
     * @returns {Promise<Array<{id: string, title: string, author: string, duration: number, thumbnail: string}>>} List of tracks.
     */
    async searchTracks(query, limit = 10) {
        try {
            const output = await ytDlp(`ytsearch${limit}:${query}`, {
                dumpSingleJson: true,
                flatPlaylist: true,
                noWarnings: true,
            });

            if (!output || !output.entries) return [];

            return output.entries.map((video) => ({
                id: video.id,
                title: video.title,
                author: video.uploader || video.channel || "Unknown Artist",
                duration: video.duration || 0,
                thumbnail: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
            }));
        } catch (error) {
            console.error("[YtDlpService] Error during search:", error.message);
            throw new Error("Unable to perform audio search.");
        }
    }

    /**
     * Pipes direct live audio stream (stdout) to the Express HTTP response.
     *
     * @param {string} videoId - YouTube video ID.
     * @param {import('express').Response} res - Express Response object.
     * @returns {import('child_process').ChildProcess} The child process running yt-dlp.
     */
    pipeAudioStream(videoId, res) {
        const url = `https://www.youtube.com/watch?v=${videoId}`;

        // Generic MIME type supported by HTML5 audio element and Web Audio API (AudioContext)
        res.setHeader("Content-Type", "audio/webm");
        res.setHeader("Accept-Ranges", "bytes");

        // Uses the executable binary automatically provided by the yt-dlp-exec npm package
        const subprocess = ytDlp.exec(url, {
            output: "-",
            format: "ba/ba*",
            noPlaylist: true,
        });

        subprocess.stdout.pipe(res);

        subprocess.stderr.on("data", (data) => {
            const msg = data.toString();
            if (!msg.includes("WARNING")) {
                console.log(`[yt-dlp debug]: ${msg}`);
            }
        });

        subprocess.on("error", (err) => {
            console.error("[yt-dlp Process Error]:", err.message);
        });

        return subprocess;
    }
}

module.exports = new YtDlpService();
