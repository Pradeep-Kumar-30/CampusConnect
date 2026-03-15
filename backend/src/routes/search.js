const express = require("express");
const auth = require("../middleware/auth");
const Note = require("../models/Note");
const Thread = require("../models/Thread");
const Message = require("../models/Message");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ message: "Missing query 'q'" });
  }

  try {
    const [notes, threads, messages] = await Promise.all([
      Note.find({ $text: { $search: q } }).limit(10),
      Thread.find({ $text: { $search: q } }).limit(10),
      Message.find({ text: new RegExp(q, "i") })
        .limit(10)
        .populate("from to", "name"),
    ]);

    res.json({ notes, threads, messages });
  } catch (err) {
    console.error("Search error", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

