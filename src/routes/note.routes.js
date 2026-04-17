const express = require("express");
const router = express.Router();

// Import controller functions
const {
  createNote,
  createNotesBulk,
  getNotes,
  getNoteById,
} = require("../controllers/note.controller");

// Route 1: POST /api/notes — Create a single note
router.post("/", createNote);

// Route 2: POST /api/notes/bulk — Create multiple notes at once
router.post("/bulk", createNotesBulk);

// Route 3: GET /api/notes — Get all notes
router.get("/", getNotes);

// Route 4: GET /api/notes/:id — Get one note by its ID
router.get("/:id", getNoteById);

module.exports = router;