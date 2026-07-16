const express = require("express");
const router = express.Router();

const { sendReminder } = require("../controllers/smsController");

router.post("/send-reminder", sendReminder);

module.exports = router;