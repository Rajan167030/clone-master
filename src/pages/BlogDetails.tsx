import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import NotFound from "./NotFound";
import { getPublicBlogBySlugApi, type DynamicBlogPost } from "@/lib/api";
import { useSEO, useStructuredData } from "@/hooks/useSEO";

const BlogDetails = () => {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<DynamicBlogPost | null>(null);

  const seoTitle = post?.title || "Blog Post";
  const seoDescription = post?.excerpt || "Read the latest insights from Founders Connect.";
  const seoKeywords = post?.tags?.length ? `${post.tags.join(", ")}, startup blog, founder insights, Founders Connect` : "startup blog, founder insights, Founders Connect";

  useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    ogImage: post?.coverImage || "",
    ogType: "article",
    canonicalUrl: `https://founders.connect/blog/${slug}`,
  });

  useStructuredData({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: seoTitle,
    description: seoDescription,
    image: post?.coverImage || undefined,
    author: {
      "@type": "Person",
      name: post?.author || "Founders Connect Editorial",
    },
    datePublished: post?.date || undefined,
    mainEntityOfPage: `https://founders.connect/blog/${slug}`,
    keywords: seoKeywords,
  });

  useEffect(() => {
    getPublicBlogBySlugApi(slug).then((response) => setPost(response.post)).catch(() => setPost(null));
  }, [slug]);

  if (!post) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 pb-16">
        <div className="container mx-auto max-w-4xl px-4">
          <Link to="/blog" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft size={15} /> Back to Blog
          </Link>

          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="mb-8 h-[300px] w-full rounded-2xl object-cover shadow-xl md:h-[420px]"
          />

          <h1 className="font-heading text-3xl font-extrabold leading-tight md:text-5xl">{post.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>{post.author}</span>
            <span>{post.date}</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={14} /> {post.readTime}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <Card className="mt-8 border-border/60 shadow-lg">
            <CardContent className="space-y-8 p-6 md:p-10">
              {post.sections.map((section) => (
                <article key={section.heading}>
                  <h2 className="mb-3 text-2xl font-bold">{section.heading}</h2>
                  <p className="text-muted-foreground leading-7">{section.content}</p>
                </article>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BlogDetails;
