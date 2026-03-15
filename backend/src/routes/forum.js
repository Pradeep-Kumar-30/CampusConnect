const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Thread = require("../models/Thread");

const router = express.Router();

router.post(
  "/threads",
  auth,
  [body("title").notEmpty(), body("body").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const thread = await Thread.create({
        title: req.body.title,
        body: req.body.body,
        tags: req.body.tags || [],
        createdBy: req.user._id,
      });
      res.status(201).json(thread);
    } catch (err) {
      console.error("Create thread error", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get("/threads", auth, async (req, res) => {
  try {
    const { tag, q } = req.query;
    const filter = {};
    if (tag) filter.tags = tag;
    if (q) filter.$text = { $search: q };

    const threads = await Thread.find(filter)
      .populate("createdBy", "name role department")
      .sort({ createdAt: -1 });
    res.json(threads);
  } catch (err) {
    console.error("List threads error", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/threads/:id", auth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate("createdBy", "name role department")
      .populate("comments.author", "name role department");
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    res.json(thread);
  } catch (err) {
    console.error("Get thread error", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/threads/:id/comments",
  auth,
  [body("body").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const thread = await Thread.findById(req.params.id);
      if (!thread)
        return res.status(404).json({ message: "Thread not found" });

      thread.comments.push({
        author: req.user._id,
        body: req.body.body,
      });
      await thread.save();

      const populated = await Thread.findById(thread._id)
        .populate("createdBy", "name role department")
        .populate("comments.author", "name role department");

      res.status(201).json(populated);
    } catch (err) {
      console.error("Add comment error", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post("/threads/:id/vote", auth, async (req, res) => {
  const { direction } = req.body; // "up" or "down"
  if (!["up", "down"].includes(direction)) {
    return res.status(400).json({ message: "Invalid vote direction" });
  }

  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    const userId = req.user._id;

    thread.upvotes = thread.upvotes.filter(
      (id) => id.toString() !== userId.toString()
    );
    thread.downvotes = thread.downvotes.filter(
      (id) => id.toString() !== userId.toString()
    );

    if (direction === "up") {
      thread.upvotes.push(userId);
    } else {
      thread.downvotes.push(userId);
    }

    await thread.save();

    res.json({
      upvotes: thread.upvotes.length,
      downvotes: thread.downvotes.length,
    });
  } catch (err) {
    console.error("Vote thread error", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

