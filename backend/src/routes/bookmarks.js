const express = require("express");
const router = express.Router();
const Bookmark = require("../models/Bookmark");
const auth = require("../middleware/auth");
const { body, validationResult, param } = require("express-validator");

// Get all bookmarks for current user
router.get("/", auth, async (req, res) => {
  try {
    const { type, limit = 20, offset = 0 } = req.query;

    let query = { user: req.user.id };
    if (type) {
      query.itemType = type; // thread or note
    }

    const total = await Bookmark.countDocuments(query);
    const bookmarks = await Bookmark.find(query)
      .populate("user", "name email avatar")
      .populate("itemId")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json({
      success: true,
      data: bookmarks,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total,
      },
    });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookmarks",
    });
  }
});

// Check if item is bookmarked
router.get(
  "/check/:itemType/:itemId",
  auth,
  param("itemType").isIn(["thread", "note"]),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Invalid item type",
          errors: errors.array(),
        });
      }

      const bookmark = await Bookmark.findOne({
        user: req.user.id,
        itemType: req.params.itemType,
        itemId: req.params.itemId,
      });

      res.json({
        success: true,
        data: {
          isBookmarked: !!bookmark,
          bookmarkId: bookmark?._id,
        },
      });
    } catch (error) {
      console.error("Check bookmark error:", error);
      res.status(500).json({
        success: false,
        message: "Error checking bookmark",
      });
    }
  }
);

// Add bookmark
router.post(
  "/",
  auth,
  [
    body("itemType")
      .isIn(["thread", "note"])
      .withMessage("Invalid item type"),
    body("itemId").isMongoId().withMessage("Invalid item ID"),
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

      const { itemType, itemId } = req.body;

      // Check if already bookmarked
      const existing = await Bookmark.findOne({
        user: req.user.id,
        itemType,
        itemId,
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Item already bookmarked",
        });
      }

      const bookmark = await Bookmark.create({
        user: req.user.id,
        itemType,
        itemId,
      });

      await bookmark.populate("user", "name email avatar");

      res.status(201).json({
        success: true,
        message: "Bookmark added successfully",
        data: bookmark,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Item already bookmarked",
        });
      }
      console.error("Add bookmark error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating bookmark",
      });
    }
  }
);

// Remove bookmark
router.delete("/:bookmarkId", auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.bookmarkId);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    // Verify ownership
    if (bookmark.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - cannot delete other users' bookmarks",
      });
    }

    await Bookmark.findByIdAndDelete(req.params.bookmarkId);

    res.json({
      success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    console.error("Delete bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting bookmark",
    });
  }
});

module.exports = router;
