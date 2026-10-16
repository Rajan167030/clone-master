import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, BadgeCheck, Crown, FileText, Lock, ShieldCheck, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const TIERS = [
  { name: "Achiever", threshold: "₹1 Cr+" },
  { name: "Millionaire", threshold: "₹5 Cr+" },
  { name: "Elite", threshold: "₹10 Cr+" },
  { name: "Signature", threshold: "₹25 Cr+" },
  { name: "Legacy", threshold: "₹50 Cr+" },
];

const STEPS = [
  { icon: FileText, title: "Request Access", desc: "One common application for all five levels." },
  { icon: BadgeCheck, title: "Get Verified", desc: "Every profile is manually reviewed." },
  { icon: Trophy, title: "Earn Your Place", desc: "Join the private member directory." },
];

const TRUST_POINTS = ["Manually verified", "Strictly confidential", "Invite-only"];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: "easeOut" } }),
};

const FalconClubSection = ({ className }: { className?: string }) => {
  const reduceMotion = useReducedMotion();
  const [activeTier, setActiveTier] = useState(TIERS.length - 1);

  // Cycle the tier shown on the membership card.
  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = window.setInterval(() => setActiveTier((i) => (i + 1) % TIERS.length), 2600);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const tier = TIERS[activeTier];

  return (
    <section className={cn("py-16", className)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-white p-6 sm:p-10 lg:p-14">
          {/* Soft dotted grid + corner glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#c4b5fd_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom_left,black,transparent_60%)]"
          />
          <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-300/30 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />

          <div className="relative grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            {/* Pitch */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
              <motion.div
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-sm"
              >
                <Crown size={14} className="text-amber-500" />
                FALCON Club
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-purple-700">Invite-only</span>
              </motion.div>

              <motion.h2
                variants={fadeUp}
                custom={0.1}
                className="mt-5 text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.1] tracking-tight text-slate-900"
              >
                A private circle for India’s{" "}
                <span className="relative whitespace-nowrap text-purple-700">
                  most ambitious
                  <svg
                    aria-hidden
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                    className="absolute -bottom-1.5 left-0 h-2.5 w-full text-amber-400"
                  >
                    <path d="M2 9 C 50 2, 150 2, 198 8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span>{" "}
                founders
              </motion.h2>

              <motion.p variants={fadeUp} custom={0.2} className="mt-5 text-base sm:text-lg font-semibold text-slate-800">
                Request Access. Get Verified. Earn Your Place.
              </motion.p>
              <motion.p variants={fadeUp} custom={0.25} className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                For unicorn founders, successful entrepreneurs, business owners and selected investors. Membership is
                never automatic — every application is manually verified and approved.
              </motion.p>

              {/* Steps */}
              <motion.ol variants={fadeUp} custom={0.35} className="mt-7 grid gap-3 sm:grid-cols-3">
                {STEPS.map(({ icon: Icon, title, desc }, index) => (
                  <li
                    key={title}
                    className="group relative rounded-2xl border border-purple-100 bg-white/90 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700 transition-colors group-hover:bg-purple-700 group-hover:text-white">
                        <Icon size={18} />
                      </span>
                      <span className="text-xs font-bold text-purple-200">0{index + 1}</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
                    <p className="mt-1 text-xs text-slate-500 leading-snug">{desc}</p>
                  </li>
                ))}
              </motion.ol>

              {/* CTAs */}
              <motion.div variants={fadeUp} custom={0.45} className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/falcon-club#membership-form-section"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-700/20 transition-all hover:-translate-y-0.5 hover:bg-purple-800"
                >
                  Request Access
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/falcon-club#membership-criteria"
                  className="inline-flex items-center justify-center rounded-xl border border-purple-200 bg-white px-6 py-3.5 text-sm font-semibold text-purple-800 transition-colors hover:bg-purple-50"
                >
                  View Membership Levels
                </Link>
              </motion.div>

              <motion.ul variants={fadeUp} custom={0.55} className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <ShieldCheck size={14} className="text-purple-600" />
                    {point}
                  </li>
                ))}
              </motion.ul>
            </motion.div>

            {/* Visual: membership card + tier ladder */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              {/* Membership card */}
              <motion.div
                animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 mx-auto max-w-sm -rotate-2 rounded-2xl border border-purple-200 border-t-4 border-t-purple-700 bg-white p-6 shadow-xl shadow-purple-900/10"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-700">FALCON Club</p>
                    <p className="text-[10px] text-slate-400">by Founders Connect</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200">
                    <Crown size={20} className="text-amber-500" />
                  </span>
                </div>

                <div className="mt-8">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Membership level</p>
                  <div className="relative mt-1 h-9 overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={tier.name}
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -24, opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="absolute inset-0 text-2xl font-extrabold uppercase tracking-wide text-slate-900"
                      >
                        {tier.name}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-6 flex items-end justify-between border-t border-dashed border-purple-100 pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Member</p>
                    <p className="text-sm font-semibold text-slate-700">Your name here</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    <BadgeCheck size={12} />
                    Verified
                  </span>
                </div>
              </motion.div>

              {/* Tier ladder */}
              <div className="relative -mt-6 rounded-2xl border border-purple-100 bg-white/90 p-5 pt-12 shadow-sm backdrop-blur sm:p-6 sm:pt-14">
                <div className="flex h-40 items-end gap-2 sm:gap-3">
                  {TIERS.map((t, index) => {
                    const active = index === activeTier;
                    return (
                      <button
                        key={t.name}
                        type="button"
                        onMouseEnter={() => setActiveTier(index)}
                        onFocus={() => setActiveTier(index)}
                        onClick={() => setActiveTier(index)}
                        className="group flex flex-1 flex-col items-center gap-2 focus:outline-none"
                        aria-label={`${t.name}: ${t.threshold}`}
                      >
                        <span
                          className={cn(
                            "text-[10px] sm:text-xs font-bold transition-colors",
                            active ? "text-purple-700" : "text-slate-400"
                          )}
                        >
                          {t.threshold}
                        </span>
                        <motion.span
                          initial={{ height: 0 }}
                          whileInView={{ height: `${28 + index * 18}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: 0.3 + index * 0.08, ease: "easeOut" }}
                          className={cn(
                            "w-full rounded-t-lg transition-colors duration-300",
                            active ? "bg-purple-700" : "bg-purple-100 group-hover:bg-purple-200"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex gap-2 sm:gap-3 border-t border-slate-100 pt-2">
                  {TIERS.map((t, index) => (
                    <span
                      key={t.name}
                      className={cn(
                        "flex-1 text-center text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide truncate",
                        index === activeTier ? "text-slate-900" : "text-slate-400"
                      )}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
                <p className="mt-4 flex items-start gap-2 text-[11px] leading-snug text-slate-500">
                  <Lock size={12} className="mt-0.5 shrink-0 text-purple-600" />
                  Qualify via any one: net worth, revenue or valuation (Legacy: ₹50 Cr+ net worth or ₹100 Cr+
                  revenue/valuation). Financials are never shown publicly.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FalconClubSection;
