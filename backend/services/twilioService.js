const twilio = require("twilio");

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const formatPhoneNumber = (phone) => {
    // Remove all whitespace and non-digit characters except '+'
    let cleaned = phone.replace(/[^\d+]/g, "");
    
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
        const formattedTo = formatPhoneNumber(to);
        const message = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
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
        throw err;
    }
};

module.exports = {
    sendWhatsApp
};
