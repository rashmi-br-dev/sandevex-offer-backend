"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./config/db");
const students_1 = __importDefault(require("./routes/students"));
const offerRoutes_1 = __importDefault(require("./routes/offerRoutes"));
// Load environment variables from .env.local in development
if (process.env.NODE_ENV !== 'production') {
    const envPath = path_1.default.resolve(__dirname, '../.env.local');
    dotenv_1.default.config({ path: envPath });
    console.log('🔧 Loaded environment variables from .env.local');
}
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connect to MongoDB
(0, db_1.connectDB)().catch(err => {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
});
console.log('🚀 Starting server...');
// Routes
app.use("/api/students", students_1.default);
app.use("/api/offers", offerRoutes_1.default);
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
const PORT = process.env.PORT || 5000;
// Only start the server if this file is run directly (not when imported)
if (require.main === module) {
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    });
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        console.error('Unhandled Rejection:', err);
        server.close(() => process.exit(1));
    });
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received. Shutting down gracefully...');
        server.close(() => {
            console.log('Process terminated');
            process.exit(0);
        });
    });
    // Handle Ctrl+C
    process.on('SIGINT', () => {
        console.log('SIGINT received. Shutting down gracefully...');
        server.close(() => {
            console.log('Process terminated');
            process.exit(0);
        });
    });
}
exports.default = app;
//# sourceMappingURL=server.js.map