import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import studentRoutes from "./routes/students";
import offerRoutes from "./routes/offerRoutes";
import slotRoutes from "./routes/slotRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB().catch(err => {
  console.error("❌ Failed to connect to MongoDB:", err);
});

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/appointments", appointmentRoutes);

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

// Start server for local development
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API available at: http://localhost:${PORT}/api`);
});

// Export for Vercel
export default app;
