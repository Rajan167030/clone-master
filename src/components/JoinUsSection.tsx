import { Link } from "react-router-dom";
import { CalendarDays, ShieldCheck, Zap } from "lucide-react";

const JoinUsSection = ({ showSocial = true }) => {
  if (!showSocial) return null;

  return (
    <section className="relative py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0a] px-6 py-10 text-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.65)] sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.26),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_28%)]" />
          <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative mx-auto max-w-4xl text-center">
            <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[64px]">
              join our vibrant founders community
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/82 sm:text-lg lg:text-lg">
              Join thousands of founders who are building stronger networks, sharper insights, and real momentum with Founders Connect.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                to="/join-us"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-black shadow-[0_12px_30px_-12px_rgba(255,255,255,0.55)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/95"
              >
                Join our community
                <span className="ml-3 text-xl leading-none">→</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-white/85 sm:gap-6">
              <div className="inline-flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                <span>Secure & Reliable</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                <span>Regular Updates</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span>Lightning Fast</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinUsSection;
