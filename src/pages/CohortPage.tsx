import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  Rocket,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getPublicCohortsApi, type Cohort } from "@/lib/api";

const CohortPage = () => {
  const location = useLocation();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useSEO({
    title: "Cohorts & Programs | Founders Connect",
    description: "Founders Connect cohort programs for early-stage tech startups and D2C brands. Real accelerator programs backed by operators and investors.",
    keywords: "startup accelerator, D2C cohort, founder bootcamp, startup program India, early stage cohort",
    ogType: "website",
    canonicalUrl: "https://founders.connect/cohorts",
  });

  useEffect(() => {
    // If route is /cohorts/d2c, auto-select d2c
    if (location.pathname.includes("/d2c")) {
      setActiveCategory("d2c");
    } else if (location.pathname.includes("/upcoming")) {
      setActiveCategory("upcoming");
    } else {
      setActiveCategory("all");
    }
  }, [location.pathname]);

  useEffect(() => {
    setLoading(true);
    getPublicCohortsApi()
      .then((res) => {
        setCohorts(res.cohorts || []);
      })
      .catch(() => setCohorts([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredCohorts =
    activeCategory === "all"
      ? cohorts
      : cohorts.filter((c) => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#FAF7F0] bg-[radial-gradient(circle,#EFE9D8_1px,transparent_1px)] bg-[length:22px_22px] pt-8 pb-14 md:pt-12 md:pb-18 border-b border-[#1B1B1F]/10">
        <div className="container mx-auto px-4">
          <BackButton className="px-0 mx-0 max-w-none mb-6 animate-reveal-left" />

          <div className="max-w-3xl mx-auto text-center">
            <p className="mb-3 inline-flex items-center gap-2 font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-[0.22em] text-[#6B8F71]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#6B8F71]" />
              Accelerator Programs
            </p>
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1B1B1F]">
              Founders Connect <span className="text-[#E4572E]">Cohorts</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-[#6B6558] max-w-2xl mx-auto leading-relaxed">
              High-intensity, structured accelerator cohorts designed to take early-stage founders and D2C brands from validation to scale with capital, operator mentorship, and community.
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic Cohorts Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : cohorts.length > 0 ? (
            <div>
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] text-slate-900">
                    Active & Upcoming Cohorts ({cohorts.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Select a program to review curriculum details and apply.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: "all", label: "All Programs" },
                    { key: "startup", label: "Startup Cohorts" },
                    { key: "d2c", label: "D2C Cohorts" },
                    { key: "upcoming", label: "Upcoming" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveCategory(tab.key)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        activeCategory === tab.key
                          ? "bg-purple-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Real Cohort Cards from Database */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredCohorts.map((cohort) => (
                  <div
                    key={cohort.slug}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Banner Image */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                      {cohort.imageUrl ? (
                        <img
                          src={cohort.imageUrl}
                          alt={cohort.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900 to-slate-900 text-purple-200">
                          <Rocket size={42} />
                        </div>
                      )}

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <Badge className="bg-slate-900/85 backdrop-blur-md text-white border-white/20 text-[11px] font-bold uppercase tracking-wider">
                          {cohort.category}
                        </Badge>
                      </div>

                      <div className="absolute top-3 right-3">
                        <Badge className="bg-emerald-600/90 text-white border-none text-[11px] font-semibold">
                          {cohort.status || "Waitlist Open"}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 flex flex-col justify-between p-6">
                      <div>
                        <h3 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 leading-snug group-hover:text-purple-600 transition-colors">
                          {cohort.title}
                        </h3>

                        {cohort.tagline && (
                          <p className="mt-1 text-xs font-semibold text-purple-700">
                            {cohort.tagline}
                          </p>
                        )}

                        {cohort.description && (
                          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                            {cohort.description}
                          </p>
                        )}

                        {/* Meta Tags */}
                        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          {cohort.duration && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1">
                              <Clock size={12} className="text-purple-600" /> {cohort.duration}
                            </span>
                          )}
                          {cohort.mode && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1">
                              <MapPin size={12} className="text-purple-600" /> {cohort.mode}
                            </span>
                          )}
                          {cohort.startDate && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1">
                              <Calendar size={12} className="text-purple-600" /> {cohort.startDate}
                            </span>
                          )}
                        </div>

                        {/* Highlights List */}
                        {cohort.highlights && cohort.highlights.length > 0 && (
                          <ul className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                            {cohort.highlights.slice(0, 3).map((item, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                <span className="line-clamp-1">{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        {cohort.applicationUrl.startsWith("http") ? (
                          <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2 font-semibold">
                            <a href={cohort.applicationUrl} target="_blank" rel="noopener noreferrer">
                              Apply Now <ExternalLink size={14} />
                            </a>
                          </Button>
                        ) : (
                          <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2 font-semibold">
                            <Link to={cohort.applicationUrl || "/join-us"}>
                              Apply for Cohort <ArrowRight size={14} />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Coming Soon State if DB has 0 cohorts */
            <div className="max-w-3xl mx-auto text-center py-14 px-6 sm:px-12 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Clock size={32} />
              </div>

              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-3.5 py-1 text-xs mb-3 font-semibold">
                Coming Soon
              </Badge>

              <h2 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] text-slate-900 leading-snug">
                Accelerator Cohorts Launching Soon
              </h2>

              <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed max-w-xl mx-auto">
                We are curating high-intensity accelerator batches for early-stage founders and consumer brands. New cohorts will be published here directly from our leadership network.
              </p>

              <div className="mt-8 pt-8 border-t border-slate-200/80 max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>1-on-1 Operator Mentorship</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Direct VC Demo Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Zero Equity Pressure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>$100K+ Cloud Perks</span>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white px-6">
                  <Link to="/join-us">
                    Join Waitlist & Get Notified <ArrowRight size={16} className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-300">
                  <Link to="/get-funding">Explore Funding Programs</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Program Benefits */}
      <section className="py-16 bg-[#FAF7F0] border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge className="mb-3 bg-purple-100 text-purple-700 border-none px-3 py-1 text-xs">
            Founder First
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
            Zero Equity. Pure Value.
          </h2>
          <p className="mt-3 text-slate-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Our upcoming cohorts will operate on a founder-friendly structure with hands-on operator office hours, pitch demo days, and cloud perk grants.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white px-6">
              <Link to="/contact-us">Inquire About Cohort Sponsorships</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CohortPage;
