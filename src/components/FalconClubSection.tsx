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
    <section className={cn("py-10", className)}>
      <div className="mx-auto w-full px-3 sm:max-w-[95%] sm:px-6 lg:px-8 2xl:max-w-[1500px]">
        <div className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] border border-[#C2A980]/20 bg-[#050505] px-5 py-8 sm:px-10 sm:py-8 lg:px-16 lg:py-10">
          {/* Soft dotted grid + corner glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#C2A980_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom_left,black,transparent_60%)]"
          />
          <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#C2A980]/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-[#665442]/30 blur-3xl" />

          <div className="relative grid gap-8 lg:gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            {/* Pitch */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
              <motion.div
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2 rounded-full border border-[#C2A980]/30 bg-white/[0.03] px-3 py-1.5 text-[11px] sm:px-3.5 sm:text-xs font-semibold uppercase tracking-wider text-[#E6D5B8]"
              >
                <Crown size={14} className="text-[#C2A980]" />
                FALCON Club
                <span className="h-1 w-1 rounded-full bg-[#C2A980]/40" />
                <span className="text-[#C2A980]">Invite-only</span>
              </motion.div>

              <motion.h2
                variants={fadeUp}
                custom={0.1}
                className="mt-5 text-[1.85rem] sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.1] tracking-tight text-[#F5EFE6]"
              >
                A private circle for India’s{" "}
                <span className="relative whitespace-nowrap text-[#C2A980]">
                  most ambitious
                  <svg
                    aria-hidden
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                    className="absolute -bottom-1.5 left-0 h-2.5 w-full text-[#8F7751]"
                  >
                    <path d="M2 9 C 50 2, 150 2, 198 8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span>{" "}
                founders
              </motion.h2>

              <motion.p variants={fadeUp} custom={0.2} className="mt-4 text-[15px] sm:mt-5 sm:text-lg font-semibold text-[#D9C29C]">
                Request Access. Get Verified. Earn Your Place.
              </motion.p>
              <motion.p variants={fadeUp} custom={0.25} className="mt-2 text-sm sm:text-base text-[#A39A8C] leading-relaxed max-w-xl">
                For unicorn founders, successful entrepreneurs, business owners and selected investors. Membership is
                never automatic — every application is manually verified and approved.
              </motion.p>

              {/* Steps */}
              <motion.ol variants={fadeUp} custom={0.35} className="mt-6 grid gap-2.5 sm:mt-7 sm:grid-cols-3 sm:gap-3">
                {STEPS.map(({ icon: Icon, title, desc }, index) => (
                  <li
                    key={title}
                    className="group relative rounded-2xl border border-[#C2A980]/15 flex items-center gap-3 bg-white/[0.03] p-3 sm:block sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#C2A980]/50 hover:bg-[#B59667]/10"
                  >
                    <div className="flex shrink-0 items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B59667]/10 text-[#C2A980] transition-colors group-hover:bg-[#C2A980] group-hover:text-black">
                        <Icon size={18} />
                      </span>
                      <span className="hidden text-xs font-bold text-[#C2A980]/40 sm:inline">0{index + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#F5EFE6] sm:mt-3">{title}</p>
                      <p className="mt-0.5 text-xs text-stone-500 leading-snug sm:mt-1">{desc}</p>
                    </div>
                  </li>
                ))}
              </motion.ol>

              {/* CTAs */}
              <motion.div variants={fadeUp} custom={0.45} className="mt-7 flex flex-col sm:mt-8 sm:flex-row gap-3">
                <Link
                  to="/falcon-club#membership-form-section"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#C2A980] px-6 py-3.5 text-sm font-semibold text-black shadow-lg shadow-[#C2A980]/20 transition-all hover:-translate-y-0.5 hover:bg-[#D9C29C]"
                >
                  Request Access
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/falcon-club#membership-criteria"
                  className="inline-flex items-center justify-center rounded-xl border border-[#C2A980]/40 bg-transparent px-6 py-3.5 text-sm font-semibold text-[#E6D5B8] transition-colors hover:border-[#C2A980] hover:bg-[#C2A980]/10"
                >
                  View Membership Levels
                </Link>
              </motion.div>

              <motion.ul variants={fadeUp} custom={0.55} className="mt-5 flex flex-wrap gap-x-4 gap-y-2 sm:mt-6 sm:gap-x-5">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A39A8C]">
                    <ShieldCheck size={14} className="text-[#C2A980]" />
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
                className="relative z-10 mx-auto w-[92%] max-w-sm sm:-rotate-2 rounded-2xl border border-[#C2A980]/25 border-t-4 border-t-[#C2A980] bg-[#0c0b09] p-5 sm:p-6 shadow-2xl shadow-black/60"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C2A980]">FALCON Club</p>
                    <p className="text-[10px] text-stone-500">by Founders Connect</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B59667]/10 ring-1 ring-[#C2A980]/30">
                    <Crown size={20} className="text-[#C2A980]" />
                  </span>
                </div>

                <div className="mt-6 sm:mt-8">
                  <p className="text-[10px] uppercase tracking-widest text-stone-500">Membership level</p>
                  <div className="relative mt-1 h-9 overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={tier.name}
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -24, opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="absolute inset-0 text-2xl font-extrabold uppercase tracking-wide text-[#F5EFE6]"
                      >
                        {tier.name}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-6 flex items-end justify-between border-t border-dashed border-[#C2A980]/15 pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-stone-500">Member</p>
                    <p className="text-sm font-semibold text-stone-300">Your name here</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                    <BadgeCheck size={12} />
                    Verified
                  </span>
                </div>
              </motion.div>

              {/* Tier ladder */}
              <div className="relative -mt-6 rounded-2xl border border-[#C2A980]/15 bg-[#0b0a08]/90 p-4 pt-11 backdrop-blur sm:p-6 sm:pt-14">
                <div className="flex h-32 items-end gap-1.5 sm:h-40 sm:gap-3">
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
                            "whitespace-nowrap text-[9px] sm:text-xs font-bold transition-colors",
                            active ? "text-[#C2A980]" : "text-stone-500"
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
                            active ? "bg-[#C2A980]" : "bg-[#C2A980]/15 group-hover:bg-[#C2A980]/30"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
                {/* Phones: one readable label for the selected level instead of five cramped ones */}
                <p className="mt-2 border-t border-white/10 pt-2 text-center text-[11px] font-semibold uppercase tracking-wider text-[#F5EFE6] sm:hidden">
                  {tier.name} <span className="text-[#C2A980]">· {tier.threshold}</span>
                </p>
                <div className="mt-2 hidden gap-2 sm:flex sm:gap-3 border-t border-white/10 pt-2">
                  {TIERS.map((t, index) => (
                    <span
                      key={t.name}
                      className={cn(
                        "flex-1 text-center text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide truncate",
                        index === activeTier ? "text-[#F5EFE6]" : "text-stone-500"
                      )}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
                <p className="mt-4 flex items-start gap-2 text-[11px] leading-snug text-stone-500">
                  <Lock size={12} className="mt-0.5 shrink-0 text-[#C2A980]" />
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
