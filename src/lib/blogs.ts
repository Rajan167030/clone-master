import type { DynamicBlogPost } from "./api";
import { getPublicBlogsApi, getPublicBlogBySlugApi } from "./api";

export type BlogPost = DynamicBlogPost;

export const fetchBlogs = async (): Promise<BlogPost[]> => {
  const data = await getPublicBlogsApi();
  return data?.posts || [];
};

export const getBlogBySlug = async (slug: string): Promise<BlogPost | null> => {
  if (!slug) return null;
  const data = await getPublicBlogBySlugApi(slug);
  return data?.post || null;
};
