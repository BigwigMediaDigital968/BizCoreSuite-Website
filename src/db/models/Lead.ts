import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILead extends Document {
    name: string;
    email: string;
    phone: string;
    companyName: string;
    noOfAdmin: number;
    noOfManagers: number;
    noOfemployee: number;
    status: 'NEW' | 'CONTACTED' | 'REJECTED' | 'CLOSED' | 'PENDING';
    createdAt: Date;
}

const LeadSchema = new Schema<ILead>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        companyName: { type: String, required: true },
        noOfAdmin: { type: Number, },
        noOfManagers: { type: Number, },
        noOfemployee: { type: Number, },
        status: {
            type: String,
            enum: ['NEW', 'CONTACTED', 'REJECTED', 'CLOSED', 'PENDING'],
            default: 'NEW'
        }
    },
    { timestamps: true }
);

export const Lead: Model<ILead> =
    mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);