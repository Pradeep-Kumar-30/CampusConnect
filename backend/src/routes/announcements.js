const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const Announcement = require("../models/Announcement");

const router = express.Router();

router.post(
  "/",
  auth,
  requireRole("faculty", "admin"),
  [body("title").notEmpty(), body("body").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, body: text, isUrgent } = req.body;
      const ann = await Announcement.create({
        title,
        body: text,
        createdBy: req.user._id,
        isUrgent: !!isUrgent,
      });
      res.status(201).json(ann);
    } catch (err) {
      console.error("Create announcement error", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get("/", auth, async (req, res) => {
  try {
    const anns = await Announcement.find({})
      .populate("createdBy", "name role department")
      .sort({ createdAt: -1 });
    res.json(anns);
  } catch (err) {
    console.error("List announcements error", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

