import mongoose, { Document, Schema } from 'mongoose';

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

const StudentSchema: Schema = new Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
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
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true
  },
  cityState: {
    type: String,
    required: [true, 'City/State is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  collegeName: {
    type: String,
    required: [true, 'College name is required'],
    trim: true
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true
  },
  yearOfStudy: {
    type: String,
    required: [true, 'Year of study is required'],
    trim: true
  },
  preferredDomain: {
    type: String,
    required: [true, 'Preferred domain is required'],
    trim: true
  },
  technicalSkills: [{
    type: String,
    required: [true, 'At least one technical skill is required']
  }],
  priorExperience: {
    type: String,
    required: [true, 'Please specify if you have prior experience']
  },
  portfolioUrl: {
    type: String,
    trim: true
  },
  whySandevex: {
    type: String,
    required: [true, 'Please explain why you want to join Sandevex'],
    trim: true
  },
  declaration: {
    type: String,
    required: [true, 'Declaration is required'],
    trim: true
  },
  assignmentSent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  }
}, {
  timestamps: true
});

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
