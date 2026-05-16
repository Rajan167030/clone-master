import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { getPublicTestimonialsApi, type Testimonial } from "@/lib/api";

const testimonials = [
  {
    name: "Girraj Sharma",
    role: "Angel Investor & Founder",
    initials: "GS",
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
    quote: "This platform connected me with 15+ promising startups in just 3 months. The deal quality is exceptional.",
  },
  {
    name: "Kaushik Banerjee",
    role: "Founder, FinTech Startup",
    initials: "KB",
    profileImage: "https://randomuser.me/api/portraits/men/2.jpg",
    quote: "Raised 2 Crore Series A through this network. Their investor connections are unmatched in India.",
  },
  {
    name: "Gaurav Dua",
    role: "Founder, AI Solutions",
    initials: "GD",
    profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
    quote: "The ecosystem here helped us scale from 0 to 10 team members. Best decision for early-stage growth.",
  },
  {
    name: "Priya Nair",
    role: "Co-Founder, EdTech",
    initials: "PN",
    profileImage: "https://randomuser.me/api/portraits/women/1.jpg",
    quote: "Connected with 3 VCs who believed in our vision. This platform is a game-changer for women founders.",
  },
  {
    name: "Siddharth Joshi",
    role: "Founder & CEO, SaaS",
    initials: "SJ",
    profileImage: "https://randomuser.me/api/portraits/men/4.jpg",
    quote: "Started as a bootstrapped side project. Now we're a 50-person team thanks to investors I met here.",
  },
  {
    name: "Sneha Gupta",
    role: "Co-Founder, D2C Brand",
    initials: "SG",
    profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
    quote: "The mentorship from senior founders here was invaluable. Grew our revenue by 5x in one year.",
  },
  {
    name: "Rajiv Menon",
    role: "Founder, Logistics Startup",
    initials: "RM",
    profileImage: "https://randomuser.me/api/portraits/men/5.jpg",
    quote: "Helped us navigate the complex Indian startup ecosystem. Got angel checks within weeks.",
  },
  {
    name: "Ritika Agarwal",
    role: "Founder, Fashion Tech",
    initials: "RA",
    profileImage: "https://randomuser.me/api/portraits/women/3.jpg",
    quote: "This community taught me everything about pitching and investor relations. Absolutely brilliant.",
  },
  {
    name: "Ananya Sharma",
    role: "Co-Founder, HealthTech",
    initials: "AS",
    profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
    quote: "Secured pre-Series B funding in 6 months. The investor network here is incredibly strong.",
  },
  {
    name: "Meera Iyer",
    role: "Founder, Design Studio",
    initials: "MI",
    profileImage: "https://randomuser.me/api/portraits/women/5.jpg",
    quote: "Built a 30-person agency from this platform's connections. They believed in me when nobody did.",
  },
  {
    name: "Aditya Kumar",
    role: "Serial Entrepreneur & Investor",
    initials: "AK",
    profileImage: "https://randomuser.me/api/portraits/men/6.jpg",
    quote: "Now investing in 10+ startups from here. This platform produces the best founders I know.",
  },
  {
    name: "Neha Verma",
    role: "Founder, HR Tech",
    initials: "NV",
    profileImage: "https://randomuser.me/api/portraits/women/6.jpg",
    quote: "Got my first million-dollar cheque from an investor I met here. Dreams do come true!",
  },
];

const Testimonials = ({ className }: { className?: string }) => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;

    getPublicTestimonialsApi()
      .then((response) => {
        if (mounted) {
          setItems(response.testimonials || []);
        }
      })
      .catch(() => {
        if (mounted) {
          setItems([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const displayItems = items.length ? items : testimonials;

  // Distribute items into 3 columns for masonry
  const columns = [[], [], []] as any[];
  displayItems.forEach((item, idx) => {
    columns[idx % 3].push(item);
  });

  // Generate 3 copies for seamless loop
  const col1 = [...columns[0], ...columns[0], ...columns[0]];
  const col2 = [...columns[1], ...columns[1], ...columns[1]];
  const col3 = [...columns[2], ...columns[2], ...columns[2]];

  // Masonry heights (responsive and different for visual interest)
  const getCardHeight = (index: number) => {
    const heightSets = [
      ["h-64 md:h-80", "h-72 md:h-96", "h-60 md:h-72"],
    ];
    return heightSets[0][index % 3];
  };

  // Toggle flip for a card
  const toggleFlip = (cardKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  // Render a single testimonial card
  const renderCard = (t: any, index: number, columnIndex: number) => {
    const tt: any = t;
    const height = getCardHeight(index);
    const cardKey = `col${columnIndex}-${tt._id || tt.name}-${index}`;
    const isFlipped = flippedCards[cardKey] || false;

    return (
      <div
        key={cardKey}
        className={`group mb-2 md:mb-4 cursor-pointer ${height} flex-shrink-0 transition-all duration-300`}
      >
        <div
          onClick={(e) => toggleFlip(cardKey, e)}
          className="relative w-full h-full"
          style={{ perspective: 1000 }}
        >
          {/* Flip container */}
          <div
            className="relative w-full h-full transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* FRONT - Quote */}
            <div
              className="absolute w-full h-full rounded-2xl md:rounded-3xl border border-border bg-gradient-to-br from-background/60 via-background/50 to-background/40 p-3 md:p-5 shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/40 group-hover:scale-105 group-hover:border-primary/60"
              style={{ backfaceVisibility: "hidden" }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 pointer-events-none" />

              <div className="relative z-10 h-full flex flex-col">
                {/* Quote icon and stars */}
                <div className="flex items-start justify-between mb-2 md:mb-3">
                  <Quote size={16} className="md:size-[20px] text-primary/30 flex-shrink-0" />
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={9} className="md:size-[11px] fill-primary text-primary" />
                    ))}
                  </div>
                </div>

                {/* Quote text */}
                <p className="flex-1 leading-relaxed text-foreground/75 text-xs md:text-sm mb-2 md:mb-3 line-clamp-4">
                  "{tt.quote}"
                </p>

                {/* Avatar and info */}
                <div className="mt-auto flex items-center gap-2 md:gap-2.5 border-t border-border/40 pt-2 md:pt-3">
                  {tt.profileImage || tt.avatarUrl ? (
                    <img
                      src={tt.profileImage || tt.avatarUrl}
                      alt={tt.name}
                      className="h-8 md:h-10 w-8 md:w-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="flex h-8 md:h-10 w-8 md:w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xs font-bold font-heading text-primary-foreground flex-shrink-0">
                      {tt.initials || tt.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-heading text-xs md:text-sm font-semibold text-foreground truncate">
                      {tt.name}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground truncate">{tt.role}</div>
                  </div>
                </div>

                {/* Click hint */}
                <div className="absolute bottom-2 right-2 text-xs text-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Click to flip
                </div>
              </div>
            </div>

            {/* BACK - Profile */}
            <div
              className="absolute w-full h-full rounded-2xl md:rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-primary/10 to-background/40 p-3 md:p-5 shadow-md overflow-hidden flex flex-col items-center justify-center text-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              {/* Profile avatar - larger */}
              <div className="mb-3 md:mb-4">
                {tt.profileImage || tt.avatarUrl ? (
                  <img
                    src={tt.profileImage || tt.avatarUrl}
                    alt={tt.name}
                    className="h-14 md:h-20 w-14 md:w-20 rounded-full object-cover border-2 border-primary/30"
                  />
                ) : (
                  <div className="flex h-14 md:h-20 w-14 md:w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-lg md:text-2xl font-bold font-heading text-primary-foreground border-2 border-primary/30">
                    {tt.initials || tt.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="font-heading text-sm md:text-lg font-bold text-foreground mb-1">
                {tt.name}
              </div>

              {/* Role */}
              <div className="text-xs md:text-xs text-primary/80 mb-2 md:mb-3 line-clamp-2 px-1">
                {tt.role}
              </div>

              {/* Divider */}
              <div className="h-px w-6 md:w-8 bg-primary/40 mb-2 md:mb-3" />

              {/* Click hint */}
              <div className="text-xs text-muted-foreground mt-auto">
                Click to flip back
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={`py-12 sm:py-20 md:py-24 lg:py-32 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-widest text-primary">
              Testimonials
            </span>
          </div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight">
            Success <span className="text-gradient">Stories</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 md:mt-4">
            Hear from founders and investors who've grown with us.
          </p>
        </div>

        {/* 3-Column Masonry Layout with Vertical Scroll - Mobile Responsive */}
        <div className="relative h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
          <style>{`
            @keyframes scroll-up {
              0% {
                transform: translateY(0);
              }
              100% {
                transform: translateY(calc(-33.333% - 1rem));
              }
            }
            .scroll-up-col {
              animation: scroll-up 40s linear infinite;
            }
            .scroll-up-col:hover {
              animation-play-state: paused;
            }
            .scroll-up-col-slow {
              animation: scroll-up 50s linear infinite;
            }
            .scroll-up-col-slow:hover {
              animation-play-state: paused;
            }
            .scroll-up-col-fast {
              animation: scroll-up 35s linear infinite;
            }
            .scroll-up-col-fast:hover {
              animation-play-state: paused;
            }
            @media (max-width: 640px) {
              .scroll-up-col, .scroll-up-col-slow, .scroll-up-col-fast {
                animation: none;
              }
            }
          `}</style>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-4 h-full">
            {/* Left Column */}
            <div className="overflow-hidden">
              <div className="scroll-up-col">
                {col1.map((item, idx) => renderCard(item, idx, 0))}
              </div>
            </div>

            {/* Middle Column - Offset - Hidden on mobile */}
            <div className="hidden md:block overflow-hidden md:pt-8 lg:pt-12">
              <div className="scroll-up-col-slow">
                {col2.map((item, idx) => renderCard(item, idx, 1))}
              </div>
            </div>

            {/* Right Column - Hidden on mobile/tablet */}
            <div className="hidden lg:block overflow-hidden">
              <div className="scroll-up-col-fast">
                {col3.map((item, idx) => renderCard(item, idx, 2))}
              </div>
            </div>
          </div>

          {/* Gradient overlays for fade effect - Responsive */}
          <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-b from-background to-transparent pointer-events-none z-20" />
          <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
