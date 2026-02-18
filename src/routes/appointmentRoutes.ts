import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Appointment } from '../models/Appointment';
import { Student } from '../models/Student';
import { sendSimpleEmail } from '../services/simpleEmailService';

const router = express.Router();

// Helper function to check if a slot is still bookable based on cutoff time
const isSlotBookable = (slot: '2-3' | '3-4', currentDate: Date): boolean => {
  const currentHour = currentDate.getHours();
  
  if (slot === '2-3') {
    // 2-3 PM slot closes at 11:00 AM (3 hours before 2 PM)
    return currentHour < 11;
  } else {
    // 3-4 PM slot closes at 12:00 PM (3 hours before 3 PM)
    return currentHour < 12;
  }
};

// POST book appointment
router.post('/', [
  body('candidateId').notEmpty().withMessage('Candidate ID is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('position').trim().notEmpty().withMessage('Position is required'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
  body('slot').isIn(['2-3', '3-4']).withMessage('Slot must be either 2-3 or 3-4')
], async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { candidateId, name, email, phone, position, date, slot } = req.body;

    // Verify candidate exists
    const candidate = await Student.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Check for duplicate booking
    console.log('Checking for existing appointment with email:', email);
    const existingAppointment = await Appointment.findOne({ email });
    console.log('Found existing appointment:', existingAppointment);
    
    if (existingAppointment) {
      console.log('Comparing - Existing date:', existingAppointment.date, 'New date:', date);
      console.log('Comparing - Existing slot:', existingAppointment.slot, 'New slot:', slot);
      
      // Allow updating if same date and slot, otherwise prevent duplicate
      if (existingAppointment.date === date && existingAppointment.slot === slot) {
        console.log('Same date and slot - blocking duplicate booking');
        return res.status(400).json({ message: 'This slot is already booked for this email' });
      }
      
      // Delete existing appointment to allow new booking
      console.log('Different date/slot - deleting old appointment');
      await Appointment.deleteOne({ email });
    }

    // Validate date range
    const now = new Date();
    const requestedDate = new Date(date);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Check if requested date is in the past
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

    // Check if it's today and apply cutoff logic
    const isToday = requestedDate.toDateString() === now.toDateString();
    if (isToday && !isSlotBookable(slot as '2-3' | '3-4', now)) {
      return res.status(400).json({ message: 'Booking cutoff time has passed for this slot' });
    }

    // Create appointment
    const appointment = new Appointment({
      candidateId,
      name,
      email,
      phone,
      position,
      date,
      slot,
      emailType: 'booking' // Mark as booking email
    });

    await appointment.save();

    // Fetch complete student data
    const student = await Student.findById(candidateId);

    // Send confirmation email to candidate
    const slotTime = slot === '2-3' ? '2:00 PM - 3:00 PM' : '3:00 PM - 4:00 PM';
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const candidateMessage = `
Dear ${name},

Your offer letter collection slot has been confirmed!

📅 Date: ${formattedDate}
⏰ Time: ${slotTime}
📍 Location: ${process.env.OFFICE_ADDRESS || 'Sandevex | SandHut India Private Limited, Bangalore'}

Kindly carry a copy of your Aadhar Card and PAN Card for verification purposes.

Best regards,
Sandevex Hiring Team
    `;

    await sendSimpleEmail({
      to: email,
      subject: 'Offer Letter Collection Slot Confirmed',
      message: candidateMessage
    });

    // Send notification email to HR with complete student data
    const hrEmail = process.env.HR_NOTIFY_EMAIL || 'hr@sandevex.com';
    
    let studentDataSection = 'Student data not available';
    if (student) {
      const studentDetails = [];
      studentDetails.push(`Full Name: ${student.fullName}`);
      studentDetails.push(`Email: ${student.email}`);
      studentDetails.push(`Mobile: ${student.mobile}`);
      studentDetails.push(`City: ${student.cityState}`);
      studentDetails.push(`Address: ${student.address}`);
      studentDetails.push(`College: ${student.collegeName}`);
      studentDetails.push(`Degree: ${student.degree}`);
      studentDetails.push(`Branch: ${student.branch}`);
      studentDetails.push(`Year of Study: ${student.yearOfStudy}`);
      studentDetails.push(`Preferred Domain: ${student.preferredDomain}`);
      studentDetails.push(`Technical Skills: ${student.technicalSkills ? student.technicalSkills.join(', ') : 'None'}`);
      studentDetails.push(`Prior Experience: ${student.priorExperience}`);
      studentDetails.push(`Portfolio: ${student.portfolioUrl || 'Not provided'}`);
      studentDetails.push(`Why Sandevex: ${student.whySandevex}`);
      studentDetails.push(`Declaration: ${student.declaration}`);
      studentDataSection = studentDetails.join('\n');
    }

    const hrMessage = 'New appointment booked:\n\n' +
      'Candidate: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Phone: ' + phone + '\n' +
      'Position: ' + position + '\n' +
      'Date: ' + formattedDate + '\n' +
      'Time: ' + slotTime + '\n\n' +
      'Complete Student Data:\n' + studentDataSection + '\n\n' +
      'Best regards,\nSandevex Hiring Team';

    await sendSimpleEmail({
      to: hrEmail,
      subject: 'New Offer Letter Slot Booked',
      message: hrMessage
    });

    return res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id,
        name: appointment.name,
        email: appointment.email,
        date: appointment.date,
        slot: appointment.slot,
        createdAt: appointment.createdAt
      }
    });

  } catch (error: any) {
    console.error('Error booking appointment:', error);
    return res.status(500).json({
      message: 'Failed to book appointment',
      error: error?.message || 'Unknown error'
    });
  }
});

// GET all appointments (for admin)
router.get('/', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const appointments = await Appointment.find()
      .populate('candidateId', 'fullName email')
      .sort({ date: 1, slot: 1 });

    return res.json({
      appointments: appointments.map(apt => ({
        id: apt._id,
        candidateId: apt.candidateId,
        name: apt.name,
        email: apt.email,
        phone: apt.phone,
        position: apt.position,
        date: apt.date,
        slot: apt.slot,
        letterCollected: apt.letterCollected,
        collectedAt: apt.collectedAt,
        createdAt: apt.createdAt
      }))
    });

  } catch (error: any) {
    console.error('Error getting appointments:', error);
    return res.status(500).json({
      message: 'Failed to get appointments',
      error: error?.message || 'Unknown error'
    });
  }
});

// PATCH update appointment (mark letter as collected)
router.patch('/:id/collected', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = _req.params;
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.letterCollected = true;
    appointment.collectedAt = new Date();
    await appointment.save();

    return res.json({
      message: 'Letter marked as collected',
      appointment: {
        id: appointment._id,
        letterCollected: appointment.letterCollected,
        collectedAt: appointment.collectedAt
      }
    });

  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return res.status(500).json({
      message: 'Failed to update appointment',
      error: error?.message || 'Unknown error'
    });
  }
});

// POST send booking email to student
router.post('/send-booking-email', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, position, candidateId } = req.body;

    // Validate required fields
    if (!name || !email || !candidateId) {
      return res.status(400).json({ message: 'Name, email, and candidateId are required' });
    }

    // Generate booking link
    const bookingLink = `${process.env.FRONTEND_URL}/candidate/book-slot?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&position=${encodeURIComponent(position)}&candidateId=${candidateId}`;

    // Send booking email via simple email service
    const bookingMessage = `
Dear ${name},

Congratulations on accepting the offer for the ${position} role at Sandevex – SandHut India Private Limited.

Please select a convenient time slot to collect your official offer letter from our office.

📍 Office Location: ${process.env.OFFICE_ADDRESS || 'Sandevex Technologies Pvt Ltd, Bangalore'}

🔗 Book your slot here: ${bookingLink}

Available dates: Until 21st February 2026
Available timings:
• 2:00 PM – 3:00 PM (Booking closes at 11:00 AM)
• 3:00 PM – 4:00 PM (Booking closes at 12:00 PM)

Note: Slots must be booked at least 3 hours before the scheduled time.

Best regards,
Sandevex Hiring Team
    `;

    await sendSimpleEmail({
      to: email,
      subject: 'Book Your Offer Letter Collection Slot',
      message: bookingMessage
    });

    return res.json({ 
      success: true, 
      message: 'Booking email sent successfully' 
    });

  } catch (error: any) {
    console.error('Error sending booking email:', error);
    return res.status(500).json({
      message: 'Failed to send booking email',
      error: error?.message || 'Unknown error'
    });
  }
});

export default router;
