const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

// Get current user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
});

// Get user by ID (public profile)
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "name email avatar bio department semester isOnline lastSeen createdAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
    });
  }
});

// Search users (for @mentions and profiles)
router.get("/search/users", async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { rollNumber: { $regex: q, $options: "i" } },
      ],
    })
      .select("_id name email avatar rollNumber department")
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching users",
    });
  }
});

// Update user profile
router.put(
  "/:userId",
  auth,
  [
    body("bio").optional().trim().isLength({ max: 500 }),
    body("avatar").optional().isURL(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      // Check if user is updating their own profile
      if (req.user.id !== req.params.userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized - cannot update other users' profiles",
        });
      }

      const { bio, avatar } = req.body;
      const updateData = {};

      if (bio !== undefined) updateData.bio = bio;
      if (avatar !== undefined) updateData.avatar = avatar;

      const user = await User.findByIdAndUpdate(req.params.userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-passwordHash");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating profile",
      });
    }
  }
);

// Get user online status
router.get("/:userId/status", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "isOnline lastSeen"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      },
    });
  } catch (error) {
    console.error("Get status error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user status",
    });
  }
});

module.exports = router;
