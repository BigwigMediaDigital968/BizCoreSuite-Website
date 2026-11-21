export type PostStatus = "DRAFT" | "PUBLISHED";

export interface Faq {
  question: string;
  answer: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  status: PostStatus;
  coverImage?: string;
  coverImageAlt?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  faqs?: Faq[];
  updatedAt: string;
  publishedAt?: string;
}

export interface PostFormValues {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  status: PostStatus;
  coverImage: string;
  coverImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  tagsInput: string;
  faqs: Faq[];
}