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

// =============================================
// 5. PUT /api/notes/:id — Replace note fully
// =============================================
// PUT = FULL replacement. Every field must be sent.
// If you don't send a field, it will be reset to its default value.
exports.replaceNote = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID format",
        data: null,
      });
    }

    // Check if note exists first
    const existingNote = await Note.findById(id);
    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
        data: null,
      });
    }

    // findOneAndUpdate with "overwrite: true" replaces the ENTIRE document
    // "new: true" means return the UPDATED version (not the old one)
    // "runValidators: true" means still check our schema rules (like required fields)
    const replacedNote = await Note.findOneAndUpdate(
      { _id: id },        // find the note with this id
      req.body,            // replace with whatever the user sent
      { new: true, overwrite: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Note replaced successfully",
      data: replacedNote,
    });
  } catch (err) {
    // If validation fails (like missing title), mongoose throws an error
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
};

// =============================================
// 6. PATCH /api/notes/:id — Update some fields
// =============================================
// PATCH = PARTIAL update. Only send the fields you want to change.
// The rest of the fields stay as they are — nothing gets reset.
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID format",
        data: null,
      });
    }

    // Check: did the user send an empty body? (nothing to update)
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
        data: null,
      });
    }

    // findByIdAndUpdate only changes the fields that are in req.body
    // Other fields remain exactly as they were — that's the PATCH magic
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }  // return new version + validate
    );

    // If no note was found with that ID
    if (!updatedNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: updatedNote,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
};