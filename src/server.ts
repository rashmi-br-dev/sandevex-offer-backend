import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db";
import studentRoutes from "./routes/students";
import offerRoutes from "./routes/offerRoutes";

// Load environment variables from .env.local in development
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(__dirname, '../.env.local');
  dotenv.config({ path: envPath });
  console.log('🔧 Loaded environment variables from .env.local');
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB().catch(err => {
  console.error("❌ Failed to connect to MongoDB:", err);
  process.exit(1);
});

console.log('🚀 Starting server...');

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/offers", offerRoutes);

// Health Check Endpoint
app.get("/health", (_req: express.Request, res: express.Response) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Error Handling Middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
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
  process.on('unhandledRejection', (err: Error) => {
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

export default app;
