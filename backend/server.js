require("dotenv").config();
console.log("🚀 Starting backend...");

const express = require("express");
const cors = require("cors");

const smsRoutes = require("./routes/sms");

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        // Requests without an Origin header are server-to-server/health-check requests.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Origin not allowed by CORS"));
    }
}));
app.use(express.json());

app.use("/api/sms", smsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
