const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Note = require("../models/Note");

const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "..", "uploads", "notes");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowed = /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt|zip)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.param, message: e.msg })),
    });
  }
  next();
};

router.post(
  "/",
  auth,
  upload.single("file"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("branch").trim().notEmpty().withMessage("Branch is required"),
    body("semester")
      .isInt({ min: 1, max: 10 })
      .withMessage("Valid semester is required"),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
  ],
  handleValidationErrors,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    try {
      const note = await Note.create({
        title: req.body.title.trim(),
        description: req.body.description?.trim() || "",
        branch: req.body.branch.trim(),
        semester: Number(req.body.semester),
        subject: req.body.subject.trim(),
        filePath: `/uploads/notes/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user._id,
        tags: req.body.tags
          ? req.body.tags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t)
          : [],
      });

      const populated = await note.populate("uploadedBy", "name role department");

      res.status(201).json({
        success: true,
        message: "Note uploaded successfully",
        data: populated,
      });
    } catch (err) {
      console.error("Create note error:", err.message);
      // Clean up uploaded file on error
      if (req.file) {
        fs.unlink(req.file.path, (e) => {
          if (e) console.error("Failed to delete file:", e);
        });
      }
      res.status(500).json({
        success: false,
        message: "Failed to upload note",
      });
    }
  }
);

router.get("/", auth, async (req, res) => {
  try {
    const { branch, semester, subject, q, limit = 20, offset = 0 } = req.query;
    const filter = {};

    if (branch) filter.branch = branch;
    if (semester) filter.semester = Number(semester);
    if (subject) filter.subject = subject;
    if (q) filter.$text = { $search: q };

    const total = await Note.countDocuments(filter);
    const notes = await Note.find(filter)
      .populate("uploadedBy", "name role department")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    res.json({
      success: true,
      data: notes,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < total,
      },
    });
  } catch (err) {
    console.error("List notes error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
    });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate(
      "uploadedBy",
      "name role department"
    );
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }
    res.json({
      success: true,
      data: note,
    });
  } catch (err) {
    console.error("Get note error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch note",
    });
  }
});

module.exports = router;

