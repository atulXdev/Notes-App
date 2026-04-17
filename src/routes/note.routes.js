const express = require("express");
const router = express.Router();

// Import only the controller functions that exist right now
const { createNote } = require("../controllers/note.controller");

// Route 1: POST /api/notes — Create a single note
router.post("/", createNote);

module.exports = router;