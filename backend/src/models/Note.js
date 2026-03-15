const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    branch: { type: String, required: true },
    semester: { type: Number, required: true },
    subject: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number },
    mimeType: { type: String },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

NoteSchema.index({ title: "text", description: "text", subject: "text", tags: "text" });

module.exports = mongoose.model("Note", NoteSchema);

