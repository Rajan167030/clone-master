import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublishedActivityResultsApi, type PublishedResultItem } from "@/lib/api";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const ResultCard = ({ item, index }: { item: PublishedResultItem; index: number }) => {
  const medal = MEDALS[item.rank] || `#${item.rank}`;
  const featuredFeedback = item.feedback[0];
  const isTopThree = item.rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`relative flex flex-col rounded-2xl border bg-gradient-to-br from-purple-50 to-white p-5 sm:p-6 shadow-sm hover:shadow-lg transition-shadow ${
        isTopThree ? "border-purple-300" : "border-purple-100"
      }`}
    >
      <div className="absolute -top-3 -left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-purple-200 shadow text-lg font-bold">
        {medal}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <img
          src={item.logoUrl}
          alt={item.startupName}
          className="h-12 w-12 rounded-xl object-cover border border-purple-200 shrink-0"
        />
        <div className="min-w-0">
          <h3 className="font-heading text-base font-bold text-slate-900 truncate">{item.startupName}</h3>
          <p className="text-xs text-slate-500 truncate">{item.founderName}</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{item.tagline}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700">
          {item.category}
        </span>
        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700">
          {item.stage}
        </span>
      </div>

      <div className="flex items-center gap-1 mb-1 text-amber-500">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        <span className="text-xs font-bold text-slate-700">{item.averageScore.toFixed(1)}</span>
        <span className="text-[10px] text-slate-400">({item.totalRatingsCount} investor ratings)</span>
      </div>

      {featuredFeedback && (
        <div className="mt-3 pt-3 border-t border-purple-100">
          <p className="text-xs italic text-slate-600 line-clamp-3">"{featuredFeedback.comment}"</p>
          <p className="mt-1.5 text-[11px] font-semibold text-purple-700">
            — {featuredFeedback.investorName}
            {featuredFeedback.investorFirm ? `, ${featuredFeedback.investorFirm}` : ""}
          </p>
        </div>
      )}
    </motion.div>
  );
};

const ActivityResultsSection = ({ className }: { className?: string }) => {
  const [results, setResults] = useState<PublishedResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPublishedActivityResultsApi()
      .then((res) => {
        if (!mounted) return;
        setResults([...(res.results || [])].sort((a, b) => a.rank - b.rank));
      })
      .catch(() => {
        if (mounted) setResults([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // No published results yet (or still loading) — stay invisible rather than show an empty section.
  if (loading || results.length === 0) return null;

  return (
    <section className={`relative py-16 sm:py-24 bg-white ${className ?? ""}`}>
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5">
            <Trophy className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-700">
              SAIS'26 · Bangalore
            </span>
          </div>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Top 5 Startups, Backed by <span className="text-purple-600">Investor Verdict</span>
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Ranked live by the investors who sat across the table — real scores, real feedback.
          </p>
        </div>

        <div className="mx-auto mb-10 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item, i) => (
            <ResultCard key={`${item.rank}-${item.startupName}`} item={item} index={i} />
          ))}
        </div>

        <div className="flex justify-center">
          <Button asChild size="lg" className="h-12 bg-purple-600 px-8 font-semibold text-white hover:bg-purple-700">
            <a href="/bangalore-activity">
              Explore All Startups <ArrowRight size={18} className="ml-1" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ActivityResultsSection;
