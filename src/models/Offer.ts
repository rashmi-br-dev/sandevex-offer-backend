import mongoose, { Document, Schema } from 'mongoose';

export interface IOffer extends Document {
  candidateId: mongoose.Types.ObjectId;
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  respondedAt?: Date;
  sentAt: Date;
  expiresAt: Date;
}

const OfferSchema = new Schema<IOffer>({
  candidateId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Student',
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending' 
  },
  respondedAt: { 
    type: Date 
  },
  sentAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date,
    required: true
  }
});

// Index for faster querying
OfferSchema.index({ candidateId: 1 });
OfferSchema.index({ status: 1 });

export default mongoose.model<IOffer>('Offer', OfferSchema);
