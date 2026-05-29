const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "general",
    },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Memory", memorySchema);