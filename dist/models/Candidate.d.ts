import mongoose from "mongoose";
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
declare const _default: mongoose.Model<ICandidate, {}, {}, {}, mongoose.Document<unknown, {}, ICandidate, {}, mongoose.DefaultSchemaOptions> & ICandidate & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICandidate>;
export default _default;
//# sourceMappingURL=Candidate.d.ts.map