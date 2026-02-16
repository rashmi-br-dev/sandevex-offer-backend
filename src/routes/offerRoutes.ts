import express, { Request, Response, Router } from 'express';
import { body, validationResult, query } from 'express-validator';
import Offer from '../models/Offer';
import { Student } from '../models/Student';
import { sendEmail } from '../services/emailService';
import { Types } from 'mongoose';

const router: Router = express.Router();

// Create offer record (without sending email)
router.post('/create-record', [
  body('candidateId').notEmpty().withMessage('Candidate ID is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('status').isIn(['pending', 'accepted', 'declined']).withMessage('Invalid status'),
], async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { candidateId, email, status } = req.body;

    // Check if candidate exists
    const candidate = await Student.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Check if offer already exists
    const existingOffer = await Offer.findOne({ candidateId });
    if (existingOffer) {
      return res.status(400).json({ message: 'Offer already exists for this candidate' });
    }

    // Create offer record
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours to respond

    const offer = new Offer({
      candidateId,
      email,
      status: status || 'pending',
      expiresAt,
      sentAt: new Date()
    });

    await offer.save();

    return res.status(201).json({
      message: 'Offer record created successfully',
      offer: {
        id: offer._id,
        candidateId: offer.candidateId,
        email: offer.email,
        status: offer.status,
        sentAt: offer.sentAt,
        expiresAt: offer.expiresAt
      }
    });

  } catch (error: any) {
    console.error('Error creating offer record:', error);
    return res.status(500).json({
      message: 'Failed to create offer record',
      error: error?.message || 'Unknown error'
    });
  }
});

// Send offer email
router.post('/send-offer', [
  body('candidateId').notEmpty().withMessage('Candidate ID is required'),
  body('emailData').isObject().withMessage('Email data is required'),
], async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { candidateId, emailData } = req.body;

    // Check if candidate exists
    const candidate = await Student.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Check if offer already exists
    const existingOffer = await Offer.findOne({ candidateId });
    if (existingOffer) {
      return res.status(400).json({ message: 'Offer already sent to this candidate' });
    }

    // Create offer record
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours to respond

    const offer = new Offer({
      candidateId,
      email: emailData.to,
      status: 'pending',
      expiresAt,
      sentAt: new Date()
    });

    await offer.save();

    // Send email
    await sendEmail(emailData);

    return res.status(201).json({
      message: 'Offer sent successfully',
      offer: {
        id: offer._id,
        candidateId: offer.candidateId,
        email: offer.email,
        status: offer.status,
        sentAt: offer.sentAt,
        expiresAt: offer.expiresAt
      },
      emailResponse: { success: true }
    });

  } catch (error: any) {
    console.error('Error sending offer:', error);
    return res.status(500).json({
      message: 'Failed to send offer',
      error: error?.message || 'Unknown error'
    });
  }
});

// Handle offer response (accept/decline)
router.post('/:offerId/:action', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { offerId, action } = req.params;

    // Validate action
    if (action !== 'accept' && action !== 'decline') {
      return res.status(400).json({ message: 'Invalid action. Must be accept or decline' });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ message: 'This offer has already been processed' });
    }

    if (new Date() > offer.expiresAt) {
      offer.status = 'expired';
      await offer.save();
      return res.status(400).json({ message: 'This offer has expired' });
    }

    // Update offer status
    offer.status = action === 'accept' ? 'accepted' : 'declined';
    offer.respondedAt = new Date();
    await offer.save();

    // Update candidate status if needed
    if (action === 'accept') {
      await Student.findByIdAndUpdate(offer.candidateId, {
        status: 'Offer Accepted',
        lastUpdated: new Date()
      });
    }

    // Send confirmation email
    const student = await Student.findById(offer.candidateId);
    await sendEmail({
      to: offer.email,
      subject: `Your Offer Has Been ${offer.status}`,
      html: `
        <div>
          <p>Hello ${student?.fullName || 'Candidate'},</p>
          <p>Your offer has been <strong>${offer.status}</strong>.</p>
          <p>Thank you for your response.</p>
          <p>Best regards,<br/>Sandevex Hiring Team</p>
        </div>
      `
    });

    return res.json({
      message: `Offer ${offer.status} successfully`,
      status: offer.status
    });

  } catch (error: any) {
    console.error('Error processing offer response:', error);
    return res.status(500).json({
      message: 'Failed to process offer response',
      error: error?.message || 'Unknown error'
    });
  }
});

// Get offer status
router.get('/:candidateId/status', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { candidateId } = req.params;

    // Check if candidateId exists and is a string
    if (!candidateId || typeof candidateId !== 'string') {
      return res.status(400).json({ message: 'Candidate ID is required' });
    }

    // Validate if it's a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ message: 'Invalid candidate ID format' });
    }

    const offer = await Offer.findOne({
      candidateId: new Types.ObjectId(candidateId),
      status: { $in: ['pending', 'accepted', 'declined'] }
    }).sort({ sentAt: -1 });

    if (!offer) {
      return res.status(404).json({ message: 'No offer found for this candidate' });
    }

    return res.json({
      status: offer.status,
      sentAt: offer.sentAt,
      respondedAt: offer.respondedAt,
      expiresAt: offer.expiresAt
    });
  } catch (error: any) {
    console.error('Error getting offer status:', error);
    return res.status(500).json({
      message: 'Failed to get offer status',
      error: error?.message || 'Unknown error'
    });
  }
});

// Handle offer response via POST
router.post('/respond', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('status').isIn(['accept', 'decline']).withMessage('Invalid status')
], async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, status } = req.body;

    // Find candidate by email
    const candidate = await Student.findOne({ email });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Find the most recent pending offer
    const offer = await Offer.findOne({
      candidateId: candidate._id,
      status: 'pending'
    }).sort({ sentAt: -1 });

    if (!offer) {
      return res.status(404).json({ message: 'No pending offer found' });
    }

    // Check if expired
    const now = new Date();
    if (now > offer.expiresAt) {
      offer.status = 'expired';
      await offer.save();
      return res.status(400).json({ message: 'This offer has expired' });
    }

    // Update offer status
    offer.status = status === 'accept' ? 'accepted' : 'declined';
    offer.respondedAt = now;
    await offer.save();

    // Update candidate status
    await Student.findByIdAndUpdate(candidate._id, {
      status: status === 'accept' ? 'Offer Accepted' : 'Offer Declined',
      lastUpdated: now
    });

    return res.status(200).json({
      success: true,
      status: offer.status,
      message: status === 'accept'
        ? 'Offer accepted successfully! Welcome to Sandevex!'
        : 'Offer declined successfully. Thank you for your response.'
    });
  } catch (error: any) {
    console.error('Error processing offer response:', error);
    return res.status(500).json({
      message: 'Error processing offer response',
      error: error?.message || 'Unknown error'
    });
  }
});

// Check offer status without modifying it
router.get('/check-status', [
  query('email').isEmail().withMessage('Valid email is required')
], async (req: Request, res: Response): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const email = req.query.email as string;

    // Find candidate by email
    const candidate = await Student.findOne({ email });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Find the most recent offer
    const offer = await Offer.findOne({
      candidateId: candidate._id
    }).sort({ sentAt: -1 });

    if (!offer) {
      return res.status(404).json({ message: 'No offer found for this candidate' });
    }

    // Check if expired
    const now = new Date();
    if (offer.status === 'pending' && now > offer.expiresAt) {
      offer.status = 'expired';
      await offer.save();
    }

    return res.json({
      success: true,
      offer: {
        id: offer._id,
        status: offer.status,
        sentAt: offer.sentAt,
        expiresAt: offer.expiresAt,
        respondedAt: offer.respondedAt
      }
    });
  } catch (error: any) {
    console.error('Error checking offer status:', error);
    return res.status(500).json({
      message: 'Error checking offer status',
      error: error?.message || 'Unknown error'
    });
  }
});

export default router;