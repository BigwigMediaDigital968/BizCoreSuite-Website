import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlog extends Document {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    status: 'DRAFT' | 'PUBLISHED';
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        excerpt: { type: String, default: "" },
        content: { type: String, default: "" },
        author: { type: String, default: "BizCore Team" },
        status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' },
        publishedAt: { type: Date },
    },
    { timestamps: true }
);

export const Blog: Model<IBlog> =
    mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
