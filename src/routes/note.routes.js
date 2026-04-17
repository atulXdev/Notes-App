const express = require("express");
const router = express.Router();

const {
  createNote,
  createNotesBulk,
  getNotes,
  getNoteById,
  replaceNote,
  updateNote,
  deleteNote,
  deleteNotesBulk,
} = require("../controllers/note.controller");

router.post("/", createNote);
router.post("/bulk", createNotesBulk);
router.get("/", getNotes);
router.get("/:id", getNoteById);
router.put("/:id", replaceNote);
router.patch("/:id", updateNote);
router.delete("/:id", deleteNote);
router.delete("/bulk", deleteNotesBulk);

module.exports = router;