const twilio = require("twilio");

const getClient = () => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) {
        throw new Error("Twilio Account SID or Auth Token is missing in environment variables.");
    }
    return twilio(sid, token);
};

const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    let cleaned = String(phone).replace(/[^\d+]/g, "");
    
    // If it doesn't start with '+', normalize it
    if (!cleaned.startsWith("+")) {
        // If it starts with '91' and is 12 digits, prepend '+'
        if (cleaned.length === 12 && cleaned.startsWith("91")) {
            cleaned = "+" + cleaned;
        } 
        // If it is 10 digits, prepend '+91' (assuming India country code as default for CCL)
        else if (cleaned.length === 10) {
            cleaned = "+91" + cleaned;
        }
        // Fallback: prepend '+' to ensure it starts with '+' for E.164 compliance
        else {
            cleaned = "+" + cleaned;
        }
    }
    return cleaned;
};

const sendWhatsApp = async (to, employeeName) => {
    try {
        const client = getClient();
        const formattedTo = formatPhoneNumber(to);
        if (!formattedTo) {
            throw new Error("Invalid or empty phone number provided.");
        }

        let fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "";
        if (!fromNumber) {
            throw new Error("TWILIO_WHATSAPP_NUMBER is missing in environment variables.");
        }
        if (!fromNumber.startsWith("whatsapp:")) {
            fromNumber = `whatsapp:${fromNumber}`;
        }

        const message = await client.messages.create({
            from: fromNumber,
            to: `whatsapp:${formattedTo}`,
            body: `🏥 CCL Gandhinagar Hospital

Dear ${employeeName},

This is a reminder that your Periodic Medical Examination (PME) is due.

Please visit CCL Hospital to complete your medical examination.

Regards,
CCL Medical Department`
        });

        return message.sid;
    } catch (err) {
        console.error("Twilio sendWhatsApp Error:", err);
        throw err;
    }
};

module.exports = {
    sendWhatsApp
};
