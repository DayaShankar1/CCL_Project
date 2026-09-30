const { sendWhatsApp } = require("../services/twilioService");

const sendReminder = async (req, res) => {
    try {
        const { phone, employeeName } = req.body;

        if (!phone || !employeeName) {
            return res.status(400).json({
                success: false,
                message: "Phone and employee name are required"
            });
        }

        const sid = await sendWhatsApp(phone, employeeName);

        res.json({
            success: true,
            message: "WhatsApp reminder sent successfully",
            sid
        });

    } catch (err) {
        console.error("SMS Controller Error:", err);

        res.status(500).json({
            success: false,
            message: err.message || "Failed to send WhatsApp message",
            code: err.code || null,
            moreInfo: err.moreInfo || null
        });
    }
};

module.exports = {
    sendReminder
};