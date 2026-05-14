import { Link } from "react-router-dom";
import { CalendarDays, ShieldCheck, Zap } from "lucide-react";

const JoinUsSection = ({ showSocial = true, className }: { showSocial?: boolean, className?: string }) => {
  if (!showSocial) return null;

  return (
    <section className={`relative py-8 md:py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-[1720px] rounded-[28px] border border-white/10 bg-[#0a0a0a] px-5 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:px-10 md:py-16 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_40%),radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_24%)]" />
          <div className="pointer-events-none absolute inset-x-10 top-8 h-24 rounded-full bg-white/5 blur-3xl" />

          <div className="relative mx-auto max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/55">
              Join Our Community
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.3rem] lg:leading-[0.95]">
              join our vibrant founders community
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/78 sm:text-lg md:text-[1.1rem]">
             </p>

            <div className="mt-8 flex justify-center">
              <Link
                to="/join-us"
                className="inline-flex items-center gap-3 rounded-full bg-white px-9 py-4 text-lg font-medium text-black shadow-[0_10px_30px_rgba(255,255,255,0.18)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(255,255,255,0.24)]"
              >
                Join our community
                <span aria-hidden="true" className="text-xl leading-none">
                  →
                </span>
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-5 text-sm text-white/85 md:gap-8">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={18} className="text-white/85" />
                Secure & Reliable
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={18} className="text-white/85" />
                Regular Updates
              </span>
              <span className="inline-flex items-center gap-2">
                <Zap size={18} className="text-white/85" />
                Lightning Fast
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinUsSection;
