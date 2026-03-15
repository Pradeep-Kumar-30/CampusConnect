const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["mention", "reply", "message", "announcement", "bookmark"],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    relatedItemType: {
      type: String,
      enum: ["thread", "note", "message", "announcement"],
    },
    relatedItemId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model("Notification", NotificationSchema);
