import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

// Full literal Tailwind class strings (not built from interpolated values) so
// the JIT scanner can pick them up — cycled per card index.
const CARD_ROTATIONS = ["rotate-[-2.2deg]", "rotate-[1.6deg]", "rotate-[-1.3deg]"];
const TAPE_COLORS = ["bg-[#E8A93D]/75", "bg-[#6B8F71]/75", "bg-[#E4572E]/75"];

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
    <section
      className={`relative bg-[#FAF7F0] bg-[radial-gradient(circle,#EFE9D8_1px,transparent_1px)] bg-[length:22px_22px] py-12 sm:py-16 md:py-24 lg:py-32 ${className}`}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
          <p className="mb-3 inline-flex items-center gap-2 font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-[0.22em] text-[#6B8F71]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#6B8F71]" />
            Notes from the field
          </p>
          <h2 className="font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-[#1B1B1F] sm:text-4xl md:text-5xl">
            From the <span className="text-[#E4572E]">blog</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 min-[900px]:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[440px] animate-pulse rounded-sm bg-white/70" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 min-[900px]:grid-cols-3">
            {displayPosts.map((post, index) => {
              const rotation = CARD_ROTATIONS[index % CARD_ROTATIONS.length];
              const tapeColor = TAPE_COLORS[index % TAPE_COLORS.length];
              const category = (post.tags[0] || "notes").toLowerCase();

              return (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className={`group relative block bg-white p-3 pb-4 shadow-[0_10px_24px_rgba(27,27,31,0.14)] transition-all duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:rotate-0 hover:shadow-[0_20px_38px_rgba(27,27,31,0.24)] focus-visible:-translate-y-1.5 focus-visible:rotate-0 focus-visible:shadow-[0_20px_38px_rgba(27,27,31,0.24)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E4572E] motion-reduce:transition-none motion-reduce:transform-none ${rotation}`}
                >
                  {/* Pushpin */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-2 right-7 z-20 h-4 w-4 rounded-full bg-[#E4572E] shadow-[inset_-2px_-2px_3px_rgba(0,0,0,0.35),inset_2px_2px_2px_rgba(255,255,255,0.5),0_2px_4px_rgba(0,0,0,0.3)]"
                  />

                  {/* Washi tape */}
                  <span
                    aria-hidden="true"
                    className={`absolute -left-4 -top-3 z-10 rotate-[-7deg] px-3 py-1 font-['Caveat'] text-base font-semibold lowercase text-[#1B1B1F]/80 ${tapeColor}`}
                  >
                    {category}
                  </span>

                  {/* Photo, framed like a Polaroid */}
                  <div className="relative overflow-hidden bg-[#F1EDE2]">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>

                  {/* Meta */}
                  <div className="mt-3 font-['IBM_Plex_Mono'] text-[11px] text-[#6B6558]">
                    {post.date} · {post.readTime}
                  </div>

                  {/* Title */}
                  <h3 className="mt-1.5 line-clamp-2 font-['Space_Grotesk'] text-[19px] font-bold leading-snug text-[#1B1B1F]">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-2 line-clamp-3 font-['Inter'] text-[13.5px] leading-relaxed text-[#6B6558]">
                    {post.excerpt}
                  </p>

                  {/* Tear line */}
                  <div className="my-4 border-t border-dashed border-[#1B1B1F]/20" />

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B1B1F] font-['IBM_Plex_Mono'] text-[10px] font-semibold text-white">
                        {initialOf(post.author)}
                      </span>
                      <span className="truncate font-['Inter'] text-xs font-medium text-[#1B1B1F]">
                        {post.author}
                      </span>
                    </div>
                    <span className="shrink-0 font-['IBM_Plex_Mono'] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#E4572E]">
                      Read →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-14 text-center md:mt-20">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-[0.18em] text-[#1B1B1F]/70 underline decoration-dashed decoration-[#1B1B1F]/30 underline-offset-4 transition-colors hover:text-[#E4572E] hover:decoration-[#E4572E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E4572E]"
          >
            View the full notebook →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
