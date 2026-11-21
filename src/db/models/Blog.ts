import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlog extends Document {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    status: 'DRAFT' | 'PUBLISHED';
    coverImage?: string;
    coverImageAlt?: string;
    metaTitle?: string;
    metaDescription?: string;
    tags: string[];
    faqs: { question: string; answer: string }[];
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
        coverImage: { type: String, default: "" },
        coverImageAlt: { type: String, default: "" },
        metaTitle: { type: String, default: "", trim: true },
        metaDescription: { type: String, default: "", trim: true },
        tags: { type: [String], default: [] },
        faqs: {
            type: [{ question: { type: String, required: true }, answer: { type: String, required: true }, _id: false }],
            default: [],
        },
        publishedAt: { type: Date },
    },
    { timestamps: true }
);

export const Blog: Model<IBlog> =
    mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
