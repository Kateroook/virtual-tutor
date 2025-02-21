const express = require("express");
const { handleUserQuery } = require("../controllers/chatController");

const router = express.Router();
router.post("/ask", handleUserQuery);

module.exports = router;
