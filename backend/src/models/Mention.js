const mongoose = require("mongoose");

const MentionSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentionedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemType: {
      type: String,
      enum: ["thread", "message", "note"],
      required: true,
    },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    context: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

MentionSchema.index({ mentionedUser: 1, isRead: 1 });
MentionSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model("Mention", MentionSchema);
