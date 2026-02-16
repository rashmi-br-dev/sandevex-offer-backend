import mongoose, { Document } from "mongoose";
export interface ICandidate extends Document {
    fullName: string;
    email: string;
    mobile: string;
    preferredDomain: string;
    assignmentSent?: boolean;
    sentAt?: Date;
    status: "Pending" | "Accepted" | "Declined";
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