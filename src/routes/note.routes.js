const express = require("express");
const router = express.Router();

// Import controller functions
const { createNote, createNotesBulk } = require("../controllers/note.controller");

// Route 1: POST /api/notes — Create a single note
router.post("/", createNote);

// Route 2: POST /api/notes/bulk — Create multiple notes at once
router.post("/bulk", createNotesBulk);

module.exports = router;