import { motion } from "framer-motion";
import {
  ArrowRight,
  Compass,
  Sparkles,
  Target,
  TrendingUp,
  UserRoundSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Compass,
    title: "Discover Opportunities",
    tag: "Explore",
    desc: "Explore curated startups, events, and a growing ecosystem built for ambitious people.",
    number: "01",
  },
  {
    icon: UserRoundSearch,
    title: "Choose Your Role",
    tag: "Personalize",
    desc: "Join as a User, Investor, or Founder and unlock a personalized experience made for your goals.",
    number: "02",
  },
  {
    icon: Target,
    title: "Create Your Profile",
    tag: "Match",
    desc: "Complete your onboarding, set preferences, and get matched with the right people and opportunities.",
    number: "03",
  },
  {
    icon: TrendingUp,
    title: "Connect and Grow",
    tag: "Scale",
    desc: "Attend events, build trusted relationships, track progress, and scale faster with community support.",
    number: "04",
  },
];

const JourneySection = ({ className }: { className?: string }) => (
  <section className={`relative mx-3 overflow-hidden rounded-[2.25rem] border border-border/60 bg-gradient-to-b from-[#2b2d2f] via-[#232528] to-[#202224] py-24 ${className}`}>
    <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_top,_rgba(45,212,191,0.12),_transparent_58%)]" />
    <div className="container relative mx-auto px-4">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-100/40 bg-violet-50 px-4 py-1.5">
          <Sparkles size={12} className="text-violet-700" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-900">
            Your Roadmap
          </span>
        </div>
        <h2 className="font-heading text-4xl font-bold tracking-tight text-white md:text-6xl">
          Start Our <span className="bg-gradient-to-r from-violet-300 to-violet-400 bg-clip-text text-transparent">Journey</span>
        </h2>
        <p className="mt-4 text-lg text-slate-300">
          A clear path to discover, connect, and grow inside the Founders Connect ecosystem.
        </p>
      </div>

      <div className="mx-auto mb-12 hidden max-w-xl items-center justify-center gap-3 sm:flex">
        {steps.map((step, i) => (
          <div key={step.number} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-100/50 bg-violet-50 text-sm font-semibold text-violet-900">
              {step.number}
            </div>
            {i < steps.length - 1 && <div className="h-px w-10 bg-violet-100/60" />}
          </div>
        ))}
      </div>

      <div className="mx-auto mb-12 grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.45 }}
            className="group relative overflow-hidden rounded-3xl border border-white/12 bg-white/[0.03] p-6 shadow-[0_10px_35px_-22px_rgba(139,92,246,0.8)] transition-all hover:-translate-y-1 hover:border-violet-200/35 hover:bg-white/[0.05]"
          >
            <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-[2.8rem] bg-white/50 opacity-35" />

            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/25 bg-gradient-to-b from-violet-500 to-violet-600 shadow-[0_14px_30px_-18px_rgba(139,92,246,1)]">
              <step.icon size={24} className="text-violet-50" />
            </div>

            <div className="mb-3 inline-flex rounded-full border border-violet-100/35 bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-900">
              Step {step.number}: {step.tag}
            </div>

            <h3 className="font-heading text-3xl font-semibold text-white leading-tight">{step.title}</h3>
            <p className="mt-3 text-lg leading-relaxed text-slate-300">{step.desc}</p>

            <button
              type="button"
              className="mt-8 inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-100/45 bg-violet-50 text-violet-800 transition-colors group-hover:bg-violet-100"
              aria-label={`Go to ${step.title}`}
            >
              <ArrowRight size={18} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button
          size="lg"
          className="h-12 border border-violet-100/20 bg-white/[0.02] px-8 font-semibold text-white transition-all hover:bg-white/[0.06]"
        >
          Get Started Free <ArrowRight size={18} />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 border-white/20 bg-transparent px-8 font-semibold text-slate-100 hover:bg-white/10 hover:text-white"
        >
          See how it works <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  </section>
);

export default JourneySection;
