import cors from 'cors';
import mongoose from 'mongoose';
import studentRoutes from '../src/routes/students';
import offerRoutes from '../src/routes/offerRoutes';
import slotRoutes from '../src/routes/slotRoutes';
import appointmentRoutes from '../src/routes/appointmentRoutes';
import express from 'express';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://sandevex-offer-email.vercel.app'],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
if (!mongoose.connection.readyState) {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI);
  }
}

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/appointments", appointmentRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

export default app;
