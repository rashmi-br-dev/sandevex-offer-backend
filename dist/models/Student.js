"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Student = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const StudentSchema = new mongoose_1.Schema({
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
exports.Student = mongoose_1.default.model('Student', StudentSchema);
//# sourceMappingURL=Student.js.map