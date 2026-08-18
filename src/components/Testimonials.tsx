import { useEffect, useRef, useState } from "react";
import { getPublicTestimonialsApi, type Testimonial } from "@/lib/api";

/* ─── Design tokens (match spec) ─── */
const PIN_COLORS = ["#E4572E", "#6B8F71", "#E8A93D"] as const;
const ROTATIONS = ["-2.2deg", "1.6deg", "-1.3deg"] as const;
const AVATAR_GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-purple-600",
] as const;

/* ─── Fallback data (same names / roles as before, profile image preserved) ─── */
const FALLBACK: Testimonial[] = [
  { _id: "1", name: "Girraj Sharma", role: "Angel Investor & Founder", initials: "GS", avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg", quote: "This platform connected me with 15+ promising startups in just 3 months. The deal quality is exceptional and the founders here are genuinely solving real problems.", order: 0, isActive: true },
  { _id: "2", name: "Kaushik Banerjee", role: "Founder, FinTech Startup", initials: "KB", avatarUrl: "https://randomuser.me/api/portraits/men/2.jpg", quote: "Raised 2 Crore Series A through this network. Their investor connections are unmatched in India. The founder community pushes us to think bigger every single day.", order: 1, isActive: true },
  { _id: "3", name: "Gaurav Dua", role: "Founder, AI Solutions", initials: "GD", avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg", quote: "The ecosystem helped us scale from 0 to 10 team members in months. We met our first enterprise client right here. The support system is incredible.", order: 2, isActive: true },
  { _id: "4", name: "Priya Nair", role: "Co-Founder, EdTech", initials: "PN", avatarUrl: "https://randomuser.me/api/portraits/women/1.jpg", quote: "Connected with 3 VCs who believed in our vision. The mentors I met here are women CEOs and angels who truly understood our space. Game-changing.", order: 3, isActive: true },
  { _id: "5", name: "Siddharth Joshi", role: "Founder & CEO, SaaS", initials: "SJ", avatarUrl: "https://randomuser.me/api/portraits/men/4.jpg", quote: "Started as a bootstrapped side project. Now we're a 50-person team thanks to investors I met here. Every milestone felt like a community celebration.", order: 4, isActive: true },
  { _id: "6", name: "Sneha Gupta", role: "Co-Founder, D2C Brand", initials: "SG", avatarUrl: "https://randomuser.me/api/portraits/women/2.jpg", quote: "The mentorship from senior founders was invaluable. Grew our revenue by 5x in one year with strategic advice on supply chain, marketing, and fundraising.", order: 5, isActive: true },
  { _id: "7", name: "Rajiv Menon", role: "Founder, Logistics Startup", initials: "RM", avatarUrl: "https://randomuser.me/api/portraits/men/5.jpg", quote: "Helped us navigate the complex Indian startup ecosystem. Got angel checks within weeks. This platform accelerated our journey by at least 18 months.", order: 6, isActive: true },
  { _id: "8", name: "Ritika Agarwal", role: "Founder, Fashion Tech", initials: "RA", avatarUrl: "https://randomuser.me/api/portraits/women/3.jpg", quote: "This community taught me everything about pitching and investor relations. I went from being nervous about pitches to confidently presenting to tier-1 VCs.", order: 7, isActive: true },
  { _id: "9", name: "Ananya Sharma", role: "Co-Founder, HealthTech", initials: "AS", avatarUrl: "https://randomuser.me/api/portraits/women/4.jpg", quote: "Secured pre-Series B funding in 6 months. We had meetings with tier-1 VCs and got multiple term sheets. The quality of introductions made all the difference.", order: 8, isActive: true },
  { _id: "10", name: "Meera Iyer", role: "Founder, Design Studio", initials: "MI", avatarUrl: "https://randomuser.me/api/portraits/women/5.jpg", quote: "Built a 30-person agency from this platform's connections. I started with just one designer, found talented people, and now lead an incredible team.", order: 9, isActive: true },
  { _id: "11", name: "Aditya Kumar", role: "Serial Entrepreneur & Investor", initials: "AK", avatarUrl: "https://randomuser.me/api/portraits/men/6.jpg", quote: "Now investing in 10+ startups from here. The quality of founders is exceptional — scrappy, ambitious, and deeply committed to solving real problems.", order: 10, isActive: true },
  { _id: "12", name: "Neha Verma", role: "Founder, HR Tech", initials: "NV", avatarUrl: "https://randomuser.me/api/portraits/women/6.jpg", quote: "Got my first million-dollar cheque from an investor I met here. I attended an event, had coffee, and within 2 months we had a term sheet. Dreams do come true!", order: 11, isActive: true },
];

/* ─── Avatar helper ─── */
const Avatar = ({
  avatarUrl,
  profileImage,
  initials,
  name,
  gradient,
  size = 40,
}: {
  avatarUrl?: string;
  profileImage?: string;
  initials?: string;
  name: string;
  gradient: string;
  size?: number;
}) => {
  const src = avatarUrl || profileImage;
  const dim = `${size}px`;
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: dim, height: dim }}
        className="rounded-full object-cover border-2 border-white/30 shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: dim, height: dim }}
      className={`rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shrink-0`}
    >
      <span style={{ fontSize: size * 0.35 }}>
        {initials || name.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
};

/* ─── Single flip card ─── */
const FlipCard = ({
  item,
  cardKey,
  pinColor,
  rotation,
  gradient,
}: {
  item: Testimonial & { profileImage?: string };
  cardKey: string;
  pinColor: string;
  rotation: string;
  gradient: string;
}) => {
  const [flipped, setFlipped] = useState(false);

  const toggle = () => setFlipped((f) => !f);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`Testimonial from ${item.name}. Press to ${flipped ? "flip back" : "view profile"}.`}
      className="relative mb-5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#E4572E] focus-visible:ring-offset-2 rounded-2xl"
      style={{
        perspective: "1000px",
        transform: `rotate(${rotation})`,
        transition: "transform 0.2s ease",
      }}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg) translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = `rotate(${rotation})`;
      }}
    >
      {/* Flip inner */}
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.55s cubic-bezier(0.34,1.56,0.64,1)",
          position: "relative",
          width: "100%",
        }}
      >
        {/* ── FRONT ── */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          className="relative w-full rounded-2xl border border-[#E7E1D2] bg-white shadow-[0_6px_24px_rgba(27,27,31,0.12)] p-5"
        >
          {/* Pin */}
          <div
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full shadow-md z-10"
            style={{
              background: pinColor,
              boxShadow: `inset -2px -2px 4px rgba(0,0,0,0.3), inset 2px 2px 3px rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.25)`,
            }}
            aria-hidden="true"
          />

          {/* Decorative quote mark */}
          <div
            className="absolute top-4 left-4 text-[72px] leading-none select-none pointer-events-none"
            style={{
              fontFamily: "'Caveat', cursive",
              color: "#E7E1D2",
              lineHeight: 1,
            }}
            aria-hidden="true"
          >
            "
          </div>

          {/* Stars */}
          <div className="flex gap-0.5 mb-3 relative z-10">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg
                key={s}
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="#E4572E"
                aria-hidden="true"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>

          {/* Quote text */}
          <p
            className="text-[#1B1B1F] leading-relaxed text-[17px] mb-5 relative z-10"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            "{item.quote}"
          </p>

          {/* Footer: avatar + name + role */}
          <div className="flex items-center gap-3 border-t border-[#E7E1D2] pt-4 relative z-10">
            <Avatar
              avatarUrl={item.avatarUrl}
              profileImage={(item as any).profileImage}
              initials={item.initials}
              name={item.name}
              gradient={gradient}
              size={40}
            />
            <div className="min-w-0">
              <div
                className="font-bold text-[#1B1B1F] text-sm truncate"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {item.name}
              </div>
              <div
                className="text-[#6B6558] text-xs truncate"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {item.role}
              </div>
            </div>
          </div>

          {/* Flip hint */}
          <div
            className="absolute bottom-3 right-4 text-[10px] text-[#6B6558]/60 select-none pointer-events-none"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            aria-hidden="true"
          >
            click to flip →
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
          }}
          className="rounded-2xl border border-[#E7E1D2] bg-[#FAF7F0] shadow-[0_6px_24px_rgba(27,27,31,0.12)] p-6 flex flex-col items-center text-center min-h-[220px] justify-center"
        >
          {/* Pin */}
          <div
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full shadow-md z-10"
            style={{
              background: pinColor,
              boxShadow: `inset -2px -2px 4px rgba(0,0,0,0.3), inset 2px 2px 3px rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.25)`,
            }}
            aria-hidden="true"
          />

          {/* Larger avatar */}
          <div className="mb-4">
            <Avatar
              avatarUrl={item.avatarUrl}
              profileImage={(item as any).profileImage}
              initials={item.initials}
              name={item.name}
              gradient={gradient}
              size={64}
            />
          </div>

          <div
            className="font-bold text-[#1B1B1F] text-lg mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {item.name}
          </div>
          <div
            className="text-[#6B6558] text-sm mb-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {item.role}
          </div>

          {/* Bio blurb (quote reused as bio when no separate bio field) */}
          <p
            className="text-[#6B6558] text-[15px] leading-relaxed mb-5 line-clamp-3 px-2"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            "{item.quote}"
          </p>

          {/* Flip back hint */}
          <div
            className="text-[10px] text-[#6B6558]/50 mt-auto select-none pointer-events-none"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            aria-hidden="true"
          >
            ← click to flip back
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Scrolling Column ─── */
const ScrollColumn = ({
  items,
  direction,
  duration,
  columnIndex,
  offsetTop = 0,
}: {
  items: (Testimonial & { profileImage?: string })[];
  direction: "up" | "down";
  duration: number;
  columnIndex: number;
  offsetTop?: number;
}) => {
  const animName = direction === "up" ? `corkboard-scroll-up-${columnIndex}` : `corkboard-scroll-down-${columnIndex}`;
  const doubled = [...items, ...items]; // seamless loop

  return (
    <div
      className="overflow-hidden relative flex-1"
      style={{
        maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
        paddingTop: offsetTop,
      }}
    >
      <style>{`
        @keyframes ${animName} {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .corkboard-col-${columnIndex} { animation: none !important; }
        }
      `}</style>
      <div
        className={`corkboard-col-${columnIndex}`}
        style={{
          animation: `${animName} ${duration}s linear infinite ${direction === "down" ? "reverse" : ""}`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.animationPlayState = "running";
        }}
      >
        {doubled.map((item, idx) => {
          const origLen = items.length;
          const baseIdx = idx % origLen;
          return (
            <FlipCard
              key={`col${columnIndex}-${item._id || item.name}-${idx}`}
              item={item}
              cardKey={`col${columnIndex}-${item._id || item.name}-${idx}`}
              pinColor={PIN_COLORS[baseIdx % PIN_COLORS.length]}
              rotation={ROTATIONS[baseIdx % ROTATIONS.length]}
              gradient={AVATAR_GRADIENTS[(columnIndex * 4 + baseIdx) % AVATAR_GRADIENTS.length]}
            />
          );
        })}
      </div>
    </div>
  );
};

/* ─── Main Testimonials section ─── */
const Testimonials = ({ className }: { className?: string }) => {
  const [items, setItems] = useState<(Testimonial & { profileImage?: string })[]>([]);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    getPublicTestimonialsApi()
      .then((res) => {
        if (mounted) setItems(res.testimonials?.length ? res.testimonials : FALLBACK);
      })
      .catch(() => { if (mounted) setItems(FALLBACK); });
    return () => { mounted = false; };
  }, []);

  const display = items.length ? items : FALLBACK;

  // Distribute into 3 columns
  const col1: typeof display = [];
  const col2: typeof display = [];
  const col3: typeof display = [];
  display.forEach((item, i) => {
    if (i % 3 === 0) col1.push(item);
    else if (i % 3 === 1) col2.push(item);
    else col3.push(item);
  });

  return (
    <section
      className={`relative py-16 sm:py-24 lg:py-32 overflow-hidden ${className ?? ""}`}
      style={{ background: "#FAF7F0" }}
    >
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #D6CFC0 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          opacity: 0.5,
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p
            className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#6B8F71]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#6B8F71]" aria-hidden="true" />
            Notes of thanks
          </p>
          <h2
            className="text-4xl font-extrabold tracking-tight text-[#1B1B1F] sm:text-5xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Success{" "}
            <span style={{ color: "#E4572E" }}>Stories</span>
          </h2>
          <p
            className="mt-4 text-sm sm:text-base text-[#6B6558]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Hear from the founders and investors who've grown with us.
          </p>
        </div>

        {/* Live region for screen readers */}
        <div
          ref={liveRef}
          aria-live="polite"
          className="sr-only"
        />

        {/* 3-column corkboard */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
          style={{ height: "700px" }}
        >
          {/* Column 1 — scrolls up, 26s */}
          <ScrollColumn
            items={col1.length ? col1 : display.slice(0, 4)}
            direction="up"
            duration={26}
            columnIndex={0}
          />

          {/* Column 2 — scrolls DOWN, 30s, offset so columns feel staggered */}
          <div className="hidden md:flex">
            <ScrollColumn
              items={col2.length ? col2 : display.slice(4, 8)}
              direction="down"
              duration={30}
              columnIndex={1}
              offsetTop={40}
            />
          </div>

          {/* Column 3 — scrolls up, 24s */}
          <div className="hidden lg:flex">
            <ScrollColumn
              items={col3.length ? col3 : display.slice(8, 12)}
              direction="up"
              duration={24}
              columnIndex={2}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
