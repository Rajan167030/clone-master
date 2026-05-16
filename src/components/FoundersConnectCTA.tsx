import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const highlights = [
  {
    icon: Users,
    title: "Curated network",
    desc: "Meet founders, investors, and builders who are actively growing in the ecosystem.",
  },
  {
    icon: CalendarDays,
    title: "Founder events",
    desc: "Join meetups, panels, and private sessions designed for real connections.",
  },
  {
    icon: ShieldCheck,
    title: "Verified access",
    desc: "Build trust with a network that values quality, credibility, and intent.",
  },
];

const FoundersConnectCTA = ({ className }: { className?: string }) => {
  return (
    <section className={`relative overflow-hidden border-t border-border/70 bg-background py-20 sm:py-24 ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),_transparent_35%)]" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-[#0c0f16] px-6 py-10 shadow-[0_30px_90px_-45px_rgba(0,0,0,0.8)] sm:px-10 sm:py-14 lg:px-12 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
              <Sparkles size={13} className="text-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Founders Connect
              </span>
            </div>

            <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Build the right room for your next move.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Join a focused founder and investor network where real partnerships, funding conversations, and community growth happen.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon size={20} />
                </div>
                <h3 className="font-heading text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-12 px-8 font-semibold">
              Join the network <ArrowRight size={18} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/20 bg-transparent px-8 font-semibold text-white hover:bg-white/10 hover:text-white"
            >
              Explore events <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoundersConnectCTA;