import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, Search, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { getPublicBlogsApi, type DynamicBlogPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";

const Blog = () => {
  // SEO Hook
  useSEO({
    title: "Blog | Founders Connect",
    description: "Read insights and stories from India's startup ecosystem. Learn about founder journeys, startup tips, investor perspectives, and industry trends.",
    keywords: "startup blog, founder stories, startup insights, entrepreneurship tips, startup advice",
    ogType: "website",
    canonicalUrl: "https://founders.connect/blog",
  });
  const [posts, setPosts] = useState<DynamicBlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  useEffect(() => {
    getPublicBlogsApi()
      .then((response) => {
        if (response.posts.length) {
          setPosts(response.posts);
        }
      })
      .catch(() => {
        setPosts([]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-6 pb-16 md:pt-8">
        <div className="container mx-auto px-4">
          <BackButton className="px-0 mx-0 max-w-none mb-6 animate-reveal-left" />
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Founders Connect Blog</p>
            <h1 className="font-heading text-4xl font-extrabold md:text-5xl">Insights for founders who execute.</h1>
            <p className="mt-4 text-muted-foreground">
              Actionable writing on fundraising, community building, and startup execution from the Founders Connect ecosystem.
            </p>
          </div>

          <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="relative w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>
            <div className="relative w-full sm:w-auto flex items-center gap-2">
              <Filter size={16} className="text-slate-500 hidden sm:block" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full sm:w-48 rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm cursor-pointer"
              >
                <option value="All">All Topics</option>
                {Array.from(new Set(posts.flatMap(p => p.tags))).sort().map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.filter(post => {
              const matchesSearch = (post.title + " " + post.excerpt).toLowerCase().includes(searchTerm.toLowerCase());
              const matchesTag = selectedTag === "All" || post.tags.includes(selectedTag);
              return matchesSearch && matchesTag;
            }).map((post) => (
              <Card key={post.slug} className="overflow-hidden border-border/60 shadow-lg hover-scale">
                <img src={post.coverImage} alt={post.title} loading="lazy" decoding="async" className="h-48 w-full object-cover" />
                <CardHeader>
                  <CardTitle className="text-xl leading-snug">{post.title}</CardTitle>
                  <CardDescription>{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.date}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={13} /> {post.readTime}
                    </span>
                  </div>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    Read article <ArrowRight size={15} />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Blog;
