"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
}
const MONGODB_URI = process.env.MONGODB_URI;
const connectDB = async () => {
    try {
        if (mongoose_1.default.connection.readyState >= 1) {
            console.log('Using existing database connection');
            return;
        }
        console.log('Connecting to MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('MongoDB connected successfully');
        // Log the database name to verify connection
        console.log('Connected to database:', mongoose_1.default.connection.db?.databaseName || 'unknown');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
// Handle MongoDB connection events
mongoose_1.default.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});
// Close the MongoDB connection when the Node process ends
process.on('SIGINT', async () => {
    await mongoose_1.default.connection.close();
    process.exit(0);
});
//# sourceMappingURL=db.js.map