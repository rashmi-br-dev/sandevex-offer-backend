import mongoose, { Schema } from "mongoose";

interface IStatusHistory {
    status: "Pending" | "Offer Sent" | "Accepted" | "Declined";
    changedAt: Date;
    notes?: string;
}

export interface ICandidate extends mongoose.Document {
    fullName: string;
    email: string;
    mobile: string;
    preferredDomain: string;
    offerStatus: {
        current: "Pending" | "Offer Sent" | "Accepted" | "Declined";
        offerSentAt?: Date;
        respondedAt?: Date;
        statusHistory: IStatusHistory[];
    };
    assignmentDetails?: {
        sent: boolean;
        sentAt?: Date;
        assignmentUrl?: string;
    };
    studentId?: mongoose.Types.ObjectId;
}

const StatusHistorySchema = new Schema<IStatusHistory>({
    status: {
        type: String,
        enum: ["Pending", "Offer Sent", "Accepted", "Declined"],
        required: true
    },
    changedAt: {
        type: Date,
        default: Date.now
    },
    notes: String
});

const CandidateSchema = new Schema<ICandidate>(
    {
        fullName: {
            type: String,
            required: true
        },
        email: { 
            type: String, 
            required: true, 
            unique: true 
        },
        mobile: String,
        preferredDomain: String,
        offerStatus: {
            current: {
                type: String,
                enum: ["Pending", "Offer Sent", "Accepted", "Declined"],
                default: "Pending"
            },
            offerSentAt: Date,
            respondedAt: Date,
            statusHistory: [StatusHistorySchema]
        },
        assignmentDetails: {
            sent: {
                type: Boolean,
                default: false
            },
            sentAt: Date,
            assignmentUrl: String
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'Student'
        }
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

export default mongoose.model<ICandidate>("Candidate", CandidateSchema);
