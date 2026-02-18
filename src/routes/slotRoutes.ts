import express, { Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { Appointment } from '../models/Appointment';

const router = express.Router();

// Helper function to check if a slot is still bookable based on cutoff time
const isSlotBookable = (slot: '2-3' | '3-4', currentDate: Date): boolean => {
  const currentHour = currentDate.getHours();
  
  if (slot === '2-3') {
    // 2-3 PM slot closes at 10:00 AM
    return currentHour < 10;
  } else {
    // 3-4 PM slot closes at 11:00 AM
    return currentHour < 11;
  }
};

// GET available dates for booking
router.get('/dates', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Check if current date is past 21st
    if (currentDay > 21) {
      return res.json({ dates: [] });
    }

    const availableDates: string[] = [];
    
    // Generate dates from today to 21st of current month
    for (let day = currentDay; day <= 21; day++) {
      // Create date string manually to avoid timezone issues
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Check if any slots are bookable (considering cutoff times for today)
      let slotsBookable = true;
      
      // If it's today, apply cutoff logic
      if (day === currentDay) {
        const slot2Bookable = isSlotBookable('2-3', now);
        const slot3Bookable = isSlotBookable('3-4', now);
        slotsBookable = slot2Bookable || slot3Bookable;
      }
      
      // Only include date if slots are bookable
      if (slotsBookable) {
        availableDates.push(dateString);
      }
    }

    return res.json({ dates: availableDates });

  } catch (error: any) {
    console.error('Error getting available dates:', error);
    return res.status(500).json({
      message: 'Failed to get available dates',
      error: error?.message || 'Unknown error'
    });
  }
});

// GET slot availability for a specific date
router.get('/', [
  query('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format')
], async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ message: 'Date parameter is required' });
    }
    const now = new Date();
    const requestedDate = new Date(date);
    
    // Check if requested date is in the past
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    if (requestedDate < todayStart) {
      return res.status(400).json({ message: 'Cannot book slots for past dates' });
    }

    // Check if requested date is beyond 21st
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const maxDate = new Date(currentYear, currentMonth, 21);
    
    if (requestedDate > maxDate) {
      return res.status(400).json({ message: 'Booking only available until 21st of current month' });
    }

    // Get current bookings for each slot
    const slot2Bookings = await Appointment.countDocuments({
      date: date,
      slot: '2-3'
    });

    const slot3Bookings = await Appointment.countDocuments({
      date: date,
      slot: '3-4'
    });

    // Return current booking counts (unlimited capacity)
    const availability: Record<string, number> = {
      '2-3': slot2Bookings,
      '3-4': slot3Bookings
    };

    // If it's today, apply cutoff logic
    const isToday = requestedDate.toDateString() === now.toDateString();
    if (isToday) {
      const slot2Bookable = isSlotBookable('2-3', now);
      const slot3Bookable = isSlotBookable('3-4', now);
      
      if (!slot2Bookable) {
        availability['2-3'] = 0;
      }
      if (!slot3Bookable) {
        availability['3-4'] = 0;
      }
    }

    return res.json(availability);

  } catch (error: any) {
    console.error('Error getting slot availability:', error);
    return res.status(500).json({
      message: 'Failed to get slot availability',
      error: error?.message || 'Unknown error'
    });
  }
});

export default router;
