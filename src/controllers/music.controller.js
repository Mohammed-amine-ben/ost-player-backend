const ytDlpService = require("../services/ytdlp.service");

/**
 * Controller handling HTTP requests for track searching and audio streaming.
 * @module Controllers/MusicController
 */
class MusicController {
    /**
     * Handles GET /api/search requests.
     * Searches for YouTube audio tracks based on a query parameter.
     *
     * @async
     * @param {import('express').Request} req - Express request object.
     * @param {import('express').Response} res - Express response object.
     * @returns {Promise<import('express').Response>} JSON response with search results or error payload.
     */
    async search(req, res) {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                error: 'Search query parameter "q" is required.',
            });
        }

        try {
            const results = await ytDlpService.searchTracks(q);
            return res.status(200).json(results);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Handles GET /api/stream/:id requests.
     * Pipes the binary audio stream to the client and manages process cleanup on disconnect.
     *
     * @param {import('express').Request} req - Express request object containing the video ID parameter.
     * @param {import('express').Response} res - Express response object.
     */
    stream(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: "Video ID parameter is required.",
            });
        }

        const subprocess = ytDlpService.pipeAudioStream(id, res);

        // Automatically terminate the streaming process on client disconnection
        req.on("close", () => {
            console.log(
                `[Stream] Client disconnected. Terminating yt-dlp process for ID: ${id}`,
            );

            if (subprocess) {
                if (subprocess.stdout) subprocess.stdout.destroy();
                if (subprocess.stderr) subprocess.stderr.destroy();
                subprocess.kill("SIGKILL");
            }
        });
    }
}

module.exports = new MusicController();
