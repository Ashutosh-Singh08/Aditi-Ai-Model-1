const express = require("express");
const router = express.Router();

const {
  chatWithAI,
  getChatHistory,
} = require("../controllers/chatController");

router.post("/", chatWithAI);
router.get("/history", getChatHistory);

module.exports = router;