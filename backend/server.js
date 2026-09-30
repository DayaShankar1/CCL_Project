const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
console.log("🚀 Starting backend...");

const express = require("express");
const cors = require("cors");

const smsRoutes = require("./routes/sms");

const app = express();
const defaultOrigins = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5001"];
const envOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(cors({
    origin(origin, callback) {
        // Requests without an Origin header are server-to-server/health-check requests.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Origin not allowed by CORS"));
    }
}));
app.use(express.json());

app.use("/api/sms", smsRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
