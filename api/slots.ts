import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import mongoose from 'mongoose';

// CORS middleware
const corsMiddleware = cors({
  origin: ['http://localhost:3000', 'https://sandevex-offer-email.vercel.app', 'https://sandevex-offer-frontend.vercel.app'],
  credentials: true
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apply CORS middleware
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  if (req.method === 'GET' && req.url?.includes('/dates')) {
    try {
      // Return available slot dates for the next 30 days
      const dates = [];
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Skip weekends (Saturday = 6, Sunday = 0)
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          dates.push({
            date: date.toISOString().split('T')[0],
            dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
            available: true
          });
        }
      }

      return res.status(200).json({ dates });
    } catch (error: any) {
      console.error('Error fetching slot dates:', error);
      return res.status(500).json({
        message: 'Failed to fetch slot dates',
        error: error?.message || 'Unknown error'
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const { date } = req.query;
      
      if (!date) {
        return res.status(400).json({ message: 'Date parameter is required' });
      }

      // Return available time slots for a specific date
      const timeSlots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
        '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
      ];

      return res.status(200).json({ 
        date,
        timeSlots: timeSlots.map(time => ({ time, available: true }))
      });
    } catch (error: any) {
      console.error('Error fetching time slots:', error);
      return res.status(500).json({
        message: 'Failed to fetch time slots',
        error: error?.message || 'Unknown error'
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
