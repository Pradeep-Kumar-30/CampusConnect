const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

// Get all notifications for current user
router.get("/", auth, async (req, res) => {
  try {
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    let query = { recipient: req.user.id };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .populate("relatedUser", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
    });
  }
});

// Get unread notification count
router.get("/unread/count", auth, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    res.json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching unread count",
    });
  }
});

// Mark notification as read
router.patch(
  "/:notificationId/read",
  auth,
  async (req, res) => {
    try {
      const notification = await Notification.findById(req.params.notificationId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      // Verify ownership
      if (notification.recipient.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized - cannot update other users' notifications",
        });
      }

      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();

      res.json({
        success: true,
        message: "Notification marked as read",
        data: notification,
      });
    } catch (error) {
      console.error("Mark read error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating notification",
      });
    }
  }
);

// Mark all notifications as read
router.patch("/mark/all-read", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notifications",
    });
  }
});

// Delete notification
router.delete("/:notificationId", auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Verify ownership
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - cannot delete other users' notifications",
      });
    }

    await Notification.findByIdAndDelete(req.params.notificationId);

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
    });
  }
});

// Delete all notifications
router.delete("/", auth, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });

    res.json({
      success: true,
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    console.error("Delete all notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notifications",
    });
  }
});

module.exports = router;
