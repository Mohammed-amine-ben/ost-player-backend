const express = require("express");
const cors = require("cors");
require("dotenv").config();

const musicRoutes = require("./routes/music.routes");

const app = express();

const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({ origin: "*" }));
app.use(express.json());

// API Routes
app.use("/api", musicRoutes);

/**
 * Health check endpoint to verify backend status.
 */
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Backend Audio Proxy Operational",
    });
});

// Global error handling for uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("[Crash] Uncaught exception:", err.message);
    console.error(err);
});

// Global error handling for unhandled promise rejections
process.on("unhandledRejection", (reason) => {
    console.error("[Crash] Unhandled rejection:", reason);
});

// Start HTTP server
const server = app.listen(PORT, () => {
    console.log(`[Server] Server running on http://localhost:${PORT}`);
});

// Listener for server setup errors
server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(
            `[Error] Port ${PORT} is already in use. Please try another port.`,
        );
    } else {
        console.error("[Server Error]:", err.message);
    }
});
