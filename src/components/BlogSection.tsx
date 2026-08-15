import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock3 } from "lucide-react";
import { getPublicBlogsApi, type DynamicBlogPost } from "@/lib/api";

const fallbackPosts: DynamicBlogPost[] = [
  {
    slug: "raising-your-first-round",
    title: "Raising Your First Round: What Investors Actually Look For",
    excerpt:
      "A practical breakdown of pitch decks, traction metrics, and founder storytelling that gets term sheets signed.",
    author: "Founders Connect Team",
    date: "Aug 02, 2026",
    readTime: "6 min read",
    coverImage:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&q=80&fit=crop",
    tags: ["Fundraising"],
    sections: [],
  },
  {
    slug: "building-founder-community",
    title: "Why Community Beats Cold Outreach for Early-Stage Founders",
    excerpt:
      "How curated founder circles compound into warm intros, co-founders, and your first ten customers.",
    author: "Founders Connect Team",
    date: "Jul 21, 2026",
    readTime: "5 min read",
    coverImage:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=900&q=80&fit=crop",
    tags: ["Community"],
    sections: [],
  },
  {
    slug: "execution-over-ideas",
    title: "Execution Over Ideas: Lessons From 50+ Founder Journeys",
    excerpt:
      "Patterns from founders who scaled fast, distilled into a playbook for shipping, iterating, and staying resilient.",
    author: "Founders Connect Team",
    date: "Jul 09, 2026",
    readTime: "7 min read",
    coverImage:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=80&fit=crop",
    tags: ["Startup Tips"],
    sections: [],
  },
];

const initialOf = (name: string) => (name || "F").trim().charAt(0).toUpperCase();

const BlogSection = ({ className }: { className?: string }) => {
  const [posts, setPosts] = useState<DynamicBlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getPublicBlogsApi()
      .then((response) => {
        if (mounted) {
          setPosts(response.posts || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setPosts([]);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const displayPosts = (posts.length ? posts : fallbackPosts).slice(0, 3);

  return (
    <section className={`py-12 sm:py-16 md:py-24 lg:py-32 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 md:mb-14 border-b border-border pb-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Journal
            </p>
            <h2 className="font-heading font-semibold text-3xl sm:text-4xl text-foreground tracking-tight">
              Notes from the field
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-3">
              Fundraising playbooks, community stories, and startup execution from the Founders Connect ecosystem.
            </p>
          </div>
          <Link
            to="/blog"
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground border-b border-foreground/30 pb-0.5 transition-colors duration-200 hover:border-foreground w-fit"
          >
            View all articles
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[420px] rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-lg"
              >
                {/* Cover image with badge */}
                <div className="relative aspect-[16/11] w-full overflow-hidden bg-muted">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {post.tags[0] && (
                    <span className="absolute left-4 top-4 rounded-full border border-border bg-background/95 px-3 py-1 font-mono text-[11px] font-medium text-foreground backdrop-blur-sm">
                      {post.tags[0]}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-3 font-mono text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={13} /> {post.date}
                    </span>
                    <span className="text-border">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={13} /> {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-semibold leading-snug text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto pt-5 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                        {initialOf(post.author)}
                      </span>
                      <span className="text-sm font-medium text-foreground truncate">{post.author}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground shrink-0">
                      Read
                      <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
