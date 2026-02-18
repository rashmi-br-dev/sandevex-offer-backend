import express, { Request, Response } from 'express';

const router = express.Router();

// GET available dates for slot booking
router.get('/dates', async (_req: Request, res: Response) => {
  try {
    // Generate available dates (next 7 days including today)
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
      }
    }

    res.json({ dates });
  } catch (error: any) {
    console.error('Error fetching available dates:', error);
    res.status(500).json({ 
      message: 'Failed to fetch available dates',
      error: error?.message || 'Unknown error'
    });
  }
});

export default router;
