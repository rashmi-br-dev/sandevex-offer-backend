"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const students_1 = __importDefault(require("./routes/students"));
const offerRoutes_1 = __importDefault(require("./routes/offerRoutes"));
const slotRoutes_1 = __importDefault(require("./routes/slotRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connect to MongoDB
(0, db_1.connectDB)().catch(err => {
    console.error("❌ Failed to connect to MongoDB:", err);
});
// Routes
app.use("/api/students", students_1.default);
app.use("/api/offers", offerRoutes_1.default);
app.use("/api/slots", slotRoutes_1.default);
app.use("/api/appointments", appointmentRoutes_1.default);
// Health Check Endpoint
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "OK", message: "Server is running" });
});
// Error Handling Middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});
// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`
    });
});
// Start server for local development
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 API available at: http://localhost:${PORT}/api`);
});
// Export for Vercel
exports.default = app;
//# sourceMappingURL=server.js.map