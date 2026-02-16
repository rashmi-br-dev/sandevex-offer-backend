import mongoose, { Document } from 'mongoose';
export interface IStudent extends Document {
    fullName: string;
    email: string;
    mobile: string;
    cityState: string;
    address: string;
    collegeName: string;
    degree: string;
    branch: string;
    yearOfStudy: string;
    preferredDomain: string;
    technicalSkills: string[];
    priorExperience: string;
    portfolioUrl?: string;
    whySandevex: string;
    declaration: string;
    assignmentSent: boolean;
    sentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Student: mongoose.Model<IStudent, {}, {}, {}, mongoose.Document<unknown, {}, IStudent, {}, mongoose.DefaultSchemaOptions> & IStudent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IStudent>;
//# sourceMappingURL=Student.d.ts.map