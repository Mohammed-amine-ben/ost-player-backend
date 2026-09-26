const express = require("express");
const musicController = require("../controllers/music.controller");

const router = express.Router();

/** @route GET /api/search */
router.get("/search", (req, res) => musicController.search(req, res));

/** @route GET /api/stream/:id */
router.get("/stream/:id", (req, res) => musicController.stream(req, res));

module.exports = router;
