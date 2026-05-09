import mongoose from "mongoose";

const { Schema } = mongoose;

const BlogSectionSchema = new Schema(
  {
    heading: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const BlogContentSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: "", trim: true },
    author: { type: String, default: "", trim: true },
    date: { type: String, default: "", trim: true },
    readTime: { type: String, default: "", trim: true },
    coverImage: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    sections: { type: [BlogSectionSchema], default: [] },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, collection: "blog_contents" },
);

export const BlogContent =
  mongoose.models.BlogContent || mongoose.model("BlogContent", BlogContentSchema);
