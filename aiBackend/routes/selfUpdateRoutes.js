const express = require("express");
const router = express.Router();

const { selfUpdate } = require("../controllers/selfUpdateController");

router.post("/", selfUpdate);

module.exports = router;