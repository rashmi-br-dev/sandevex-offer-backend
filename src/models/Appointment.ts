import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  candidateId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  position: string;
  date: string; // YYYY-MM-DD
  slot: '2-3' | '3-4';
  letterCollected: boolean;
  collectedAt?: Date;
  emailType: 'booking' | 'confirmation'; // Track email type
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema({
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Candidate ID is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
  },
  slot: {
    type: String,
    required: [true, 'Slot is required'],
    enum: {
      values: ['2-3', '3-4'],
      message: 'Slot must be either 2-3 or 3-4'
    }
  },
  letterCollected: {
    type: Boolean,
    default: false
  },
  collectedAt: {
    type: Date
  },
  emailType: {
    type: String,
    enum: ['booking', 'confirmation'],
    default: 'confirmation'
  }
}, {
  timestamps: true
});

// Index for efficient queries
AppointmentSchema.index({ date: 1, slot: 1 });
AppointmentSchema.index({ email: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
