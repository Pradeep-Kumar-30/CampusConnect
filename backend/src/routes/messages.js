const express = require("express");
const auth = require("../middleware/auth");
const Message = require("../models/Message");

const router = express.Router();

router.get("/direct/:userId", auth, async (req, res) => {
  try {
    const otherId = req.params.userId;
    const userId = req.user._id.toString();
    const messages = await Message.find({
      type: "direct",
      $or: [
        { from: userId, to: otherId },
        { from: otherId, to: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("from to", "name department role");
    res.json(messages);
  } catch (err) {
    console.error("Get direct messages error", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/department/:department", auth, async (req, res) => {
  try {
    const { department } = req.params;
    const messages = await Message.find({
      type: "department",
      department,
    })
      .sort({ createdAt: 1 })
      .populate("from", "name department role");
    res.json(messages);
  } catch (err) {
    console.error("Get dept messages error", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

