import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  Lightbulb,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getPublicMentorsApi, type SpeakerInvestorProfile } from "@/lib/api";
import MentorConnectDialog from "@/components/MentorConnectDialog";

const Mentors = () => {
  const [mentors, setMentors] = useState<SpeakerInvestorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeExpertise, setActiveExpertise] = useState<string>("");
  const [connectMentor, setConnectMentor] = useState<SpeakerInvestorProfile | null>(null);

  const expertiseOptions = useMemo(() => {
    const counts = new Map<string, number>();
    mentors.forEach((m) => (m.metadata?.expertise || []).forEach((e) => counts.set(e, (counts.get(e) || 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([e]) => e);
  }, [mentors]);

  const visibleMentors = useMemo(
    () => (activeExpertise ? mentors.filter((m) => (m.metadata?.expertise || []).includes(activeExpertise)) : mentors),
    [mentors, activeExpertise],
  );

  useSEO({
    title: "Mentorship Network | Founders Connect",
    description: "Get guidance from seasoned founders, angel investors, and domain experts in the Founders Connect mentorship network.",
    keywords: "startup mentorship, founder advice, business mentor India, startup advisor, executive coaching",
    ogType: "website",
    canonicalUrl: "https://founders.connect/mentors",
  });

  useEffect(() => {
    getPublicMentorsApi()
      .then((res) => {
        setMentors(res.mentors || res.profiles || []);
      })
      .catch(() => setMentors([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#FAF7F0] bg-[radial-gradient(circle,#EFE9D8_1px,transparent_1px)] bg-[length:22px_22px] pt-8 pb-16 md:pt-12 md:pb-20 border-b border-[#1B1B1F]/10">
        <div className="container mx-auto px-4">
          <BackButton className="px-0 mx-0 max-w-none mb-6 animate-reveal-left" />

          <div className="max-w-3xl mx-auto text-center">
            <p className="mb-3 inline-flex items-center gap-2 font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-[0.22em] text-[#6B8F71]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#6B8F71]" />
              Expert Guidance
            </p>
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1B1B1F]">
              Learn From Operators Who Have <span className="text-[#E4572E]">Done It</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-[#6B6558] max-w-2xl mx-auto leading-relaxed">
              1-on-1 strategic mentorship sessions with vetted operators, exited founders, and functional experts who understand the trenches.
            </p>
          </div>
        </div>
      </section>

      {/* Mentors Content Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : mentors.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] text-slate-900">
                    Verified Mentors ({mentors.length})
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Request a 1-on-1 conversation. Our team reviews and makes the intro.</p>
                </div>
                <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
                  <Link to="/contact-us">Want to mentor? Request an invite</Link>
                </Button>
              </div>

              {expertiseOptions.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
                  {["", ...expertiseOptions].map((e) => (
                    <button
                      key={e || "all"}
                      type="button"
                      onClick={() => setActiveExpertise(e)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        activeExpertise === e
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"
                      }`}
                    >
                      {e || "All"}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {visibleMentors.map((mentor) => (
                  <div
                    key={mentor.slug}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-4">
                      {mentor.photoUrl ? (
                        <img
                          src={mentor.photoUrl}
                          alt={mentor.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-purple-50 text-purple-600 font-bold text-2xl">
                          {mentor.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-lg text-slate-900">{mentor.name}</h3>
                      <p className="text-xs font-semibold text-purple-700 mt-0.5">{mentor.designation}</p>
                      {mentor.company && (
                        <p className="text-xs text-slate-500 mt-0.5">{mentor.company}</p>
                      )}
                      {(mentor.summary || mentor.introduction) && (
                        <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                          {mentor.summary || mentor.introduction}
                        </p>
                      )}
                    </div>
                    {(mentor.metadata?.expertise || []).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(mentor.metadata?.expertise || []).slice(0, 4).map((e) => (
                          <span key={e} className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                            {e}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {mentor.linkedinUrl ? (
                        <a
                          href={mentor.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700"
                        >
                          <ExternalLink size={13} /> LinkedIn
                        </a>
                      ) : (
                        <span />
                      )}
                      <Button size="sm" className="h-8 bg-violet-600 hover:bg-violet-700 text-xs" onClick={() => setConnectMentor(mentor)}>
                        Request to Connect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto text-center py-14 px-6 sm:px-10 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Clock size={32} />
              </div>
              
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-3.5 py-1 text-xs mb-3 font-semibold">
                Coming Soon
              </Badge>

              <h2 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] text-slate-900 leading-snug">
                Curated Mentorship Network Launching Soon
              </h2>

              <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed max-w-xl mx-auto">
                We are carefully vetting and onboarding experienced operators, serial founders, and domain experts across Product Strategy, B2B Sales, Tech Architecture, and Fundraising.
              </p>

              <div className="mt-8 pt-8 border-t border-slate-200/80 max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Verified Operators</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Direct 1-on-1 Sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Zero Equity Pressure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Custom Bottleneck Matching</span>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                <Button asChild className="btn-metallic btn-metallic-purple text-white px-6">
                  <Link to="/contact-us">
                    Request a Mentor Invite <ArrowRight size={16} className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-300">
                  <Link to="/join-us">Join Founder Community</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#FAF7F0] border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Badge className="mb-3 bg-purple-100 text-purple-700 border-none px-3 py-1 text-xs">
            Founder Support
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
            Need Immediate Founder Guidance?
          </h2>
          <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed">
            Connect with active founders and community leaders across our private WhatsApp & Slack channels today.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Button asChild className="btn-metallic btn-metallic-purple text-white px-6">
              <Link to="/join-us">Join Founders Connect</Link>
            </Button>
          </div>
        </div>
      </section>

      <MentorConnectDialog mentor={connectMentor} onOpenChange={(open) => !open && setConnectMentor(null)} />

      <Footer />
    </div>
  );
};

export default Mentors;
