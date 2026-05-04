import { motion } from "framer-motion";
import {
  Rocket, TrendingUp, Building2, Users, Handshake,
  MapPin, BarChart3, Calendar, Newspaper, ArrowUpRight,
} from "lucide-react";

const items = [
  { icon: Rocket, title: "Raise Funds", desc: "Fuel your startup growth", color: "from-emerald-500 to-teal-500" },
  { icon: TrendingUp, title: "Invest in Startups", desc: "High ROI early-stage deals", color: "from-emerald-500 to-teal-400" },
  { icon: Building2, title: "SME IPO", desc: "Go public on SME exchange", color: "from-teal-500 to-emerald-500" },
  { icon: Users, title: "Chapter Director", desc: "Lead our Business Network", color: "from-emerald-500 to-teal-500" },
  { icon: Handshake, title: "Venture Partner", desc: "Refer Startups & Investors", color: "from-teal-500 to-cyan-500" },
  { icon: MapPin, title: "Explore Chapters", desc: "Connect with local ecosystems", color: "from-emerald-500 to-teal-400" },
  { icon: BarChart3, title: "Unlisted Shares", desc: "Pre-IPO Company's Shares", color: "from-teal-500 to-emerald-500" },
  { icon: Calendar, title: "Demo Day Events", desc: "Explore Angel Opportunities", color: "from-emerald-500 to-teal-500" },
  { icon: Newspaper, title: "Startup News", desc: "Latest trends & global updates", color: "from-teal-500 to-cyan-500" },
];

const ExploreNetwork = () => (
  <section id="network" className="px-4 py-10 sm:px-6 lg:px-8">
    <div className="relative mx-auto w-full overflow-hidden rounded-[2.5rem] border border-emerald-100/80 bg-[#fbfdfc] px-5 py-14 shadow-[0_20px_70px_-45px_rgba(16,185,129,0.55)] sm:px-8 lg:px-12">
      <div
        className="pointer-events-none absolute inset-0 rounded-[2.5rem] opacity-55"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(16,185,129,0.14) 0.8px, transparent 1px)",
          backgroundSize: "18px 18px",
          backgroundPosition: "0 0",
        }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.08),transparent_24%),radial-gradient(circle_at_85%_18%,rgba(34,197,94,0.07),transparent_18%),radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.05),transparent_20%),linear-gradient(to_bottom,rgba(255,255,255,0.92),rgba(255,255,255,0.98))]" />
      <div className="pointer-events-none absolute left-[-10rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full border border-emerald-200/45" />
      <div className="pointer-events-none absolute left-[-2rem] top-[-2rem] h-72 w-72 rounded-full border border-emerald-100/35" />
      <div className="pointer-events-none absolute right-[-8rem] top-[2rem] h-[24rem] w-[24rem] rounded-full border border-teal-100/45" />
      <div className="pointer-events-none absolute right-[-3rem] bottom-[-9rem] h-[22rem] w-[22rem] rounded-full border border-cyan-100/45" />
      <div className="pointer-events-none absolute left-[15%] top-[12%] h-6 w-6 rounded-full border border-emerald-200/60" />
      <div className="pointer-events-none absolute right-[8%] top-[18%] h-8 w-8 rounded-full border border-emerald-200/60" />
      <div className="pointer-events-none absolute left-[9%] bottom-[14%] h-5 w-5 rounded-full border border-emerald-200/60" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative text-center max-w-3xl mx-auto mb-14"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-4 py-2 shadow-sm">
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-emerald-500 text-[10px] font-bold text-emerald-600">+</span>
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Network
          </span>
        </div>
        <h2 className="mt-6 font-heading text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Explore the <span className="text-emerald-500">Network</span>
        </h2>
        <p className="mt-4 text-lg text-slate-500 sm:text-xl">
          Everything you need to grow, fund, and scale — under one roof.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.65, ease: "easeOut", staggerChildren: 0.08 }}
        className="relative grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
      >
        {items.slice(0, 6).map((item, i) => (
          <motion.a
            key={item.title}
            href="#"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="group relative flex min-h-[154px] items-stretch overflow-hidden rounded-[2rem] border border-emerald-100 bg-white px-6 py-5 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_40px_-24px_rgba(16,185,129,0.35)]"
          >
            <div className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-bl-[2rem] bg-slate-100" />
            <div className="relative flex w-full items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} shadow-[0_12px_28px_-18px_rgba(16,185,129,0.9)] transition-transform group-hover:scale-105`}>
                  <item.icon size={22} className="text-white" />
                </div>
                <div>
                  <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700">
                    {item.title}
                  </div>
                  <div className="mt-4 max-w-[15rem] text-base leading-relaxed text-slate-500">
                    {item.desc}
                  </div>
                </div>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all group-hover:border-emerald-200 group-hover:text-emerald-500">
                <ArrowUpRight
                  size={18}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </div>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </div>
  </section>
);

export default ExploreNetwork;
