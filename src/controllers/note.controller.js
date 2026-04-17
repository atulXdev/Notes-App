// We import (require) our Note model so we can talk to MongoDB
const Note = require("../models/note.model");
const mongoose = require("mongoose");

// ==========================================
// 1. POST /api/notes — Create a single note
// ==========================================
exports.createNote = async (req, res) => {
  try {
    // Pull out title, content, category, isPinned from what the user sent
    const { title, content, category, isPinned } = req.body;

    // Check: did the user forget to send title or content?
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
        data: null,
      });
    }

    // Everything looks good — create the note in MongoDB
    const note = await Note.create({ title, content, category, isPinned });

    // Send back the created note with status 201 (201 = "something was created")
    res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: note,
    });
  } catch (err) {
    // If something unexpected goes wrong (like DB is down), send 500
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
};

// =============================================
// 2. POST /api/notes/bulk — Create many notes
// =============================================
exports.createNotesBulk = async (req, res) => {
  try {
    // The user sends an object like { notes: [ {...}, {...} ] }
    const { notes } = req.body;

    // Check: did the user forget to send the "notes" array, or is it empty?
    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a non-empty array of notes",
        data: null,
      });
    }

    // insertMany() creates all the notes in one go — very fast!
    const createdNotes = await Note.insertMany(notes);

    // Send back all created notes with 201
    res.status(201).json({
      success: true,
      message: `${createdNotes.length} notes created successfully`,
      data: createdNotes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
};

// ==========================================
// 3. GET /api/notes — Get all notes
// ==========================================
exports.getNotes = async (req, res) => {
  try {
    // Find ALL notes in the database (no filter = get everything)
    const notes = await Note.find();

    // Send them back with 200 (200 = "OK, here you go")
    res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      data: notes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
};

// =============================================
// 4. GET /api/notes/:id — Get one note by ID
// =============================================
exports.getNoteById = async (req, res) => {
  try {
    // The :id from the URL comes in req.params.id
    const { id } = req.params;

    // First check: is this even a valid MongoDB ObjectId?
    // MongoDB IDs look like "64b1f2c3e4d5a6b7c8d9e0f1" — if someone sends "abc", that's invalid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID format",
        data: null,
      });
    }

    // Try to find the note with this ID
    const note = await Note.findById(id);

    // If no note was found, it means that ID doesn't exist in our database
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
        data: null,
      });
    }

    // Found it! Send it back
    res.status(200).json({
      success: true,
      message: "Note fetched successfully",
      data: note,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
};