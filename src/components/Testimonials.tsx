import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { getPublicTestimonialsApi, type Testimonial } from "@/lib/api";

const testimonials = [
  {
    name: "Girraj Sharma",
    role: "Angel Investor & Founder",
    initials: "GS",
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
    quote: "This platform connected me with 15+ promising startups in just 3 months. The deal quality is exceptional and the founders here are genuinely solving real problems. I've invested in 3 startups already and all of them are scaling beautifully. The curator's eye for quality is what sets this apart from other networks.",
  },
  {
    name: "Kaushik Banerjee",
    role: "Founder, FinTech Startup",
    initials: "KB",
    profileImage: "https://randomuser.me/api/portraits/men/2.jpg",
    quote: "Raised 2 Crore Series A through this network. Their investor connections are unmatched in India. Not only did we get funding, but we also got mentors who understood the Indian market deeply. The founder community here pushes us to think bigger every single day. This is where magic happens.",
  },
  {
    name: "Gaurav Dua",
    role: "Founder, AI Solutions",
    initials: "GD",
    profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
    quote: "The ecosystem here helped us scale from 0 to 10 team members. Best decision for early-stage growth. We attended events, got feedback from customers, and met our first enterprise client through this platform. The support system is incredible - everyone wants to see each other succeed.",
  },
  {
    name: "Priya Nair",
    role: "Co-Founder, EdTech",
    initials: "PN",
    profileImage: "https://randomuser.me/api/portraits/women/1.jpg",
    quote: "Connected with 3 VCs who believed in our vision. This platform is a game-changer for women founders. I met mentors who are women CEOs and angels who understood the EdTech space intimately. The support and encouragement I received boosted my confidence tremendously.",
  },
  {
    name: "Siddharth Joshi",
    role: "Founder & CEO, SaaS",
    initials: "SJ",
    profileImage: "https://randomuser.me/api/portraits/men/4.jpg",
    quote: "Started as a bootstrapped side project. Now we're a 50-person team thanks to investors I met here. The product-market fit journey was guided by feedback from the community. Every milestone felt like a community celebration, not just a personal victory.",
  },
  {
    name: "Sneha Gupta",
    role: "Co-Founder, D2C Brand",
    initials: "SG",
    profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
    quote: "The mentorship from senior founders here was invaluable. Grew our revenue by 5x in one year. We got strategic advice on supply chain, marketing, and fundraising all from founders who have walked this path before. The community is generous with knowledge.",
  },
  {
    name: "Rajiv Menon",
    role: "Founder, Logistics Startup",
    initials: "RM",
    profileImage: "https://randomuser.me/api/portraits/men/5.jpg",
    quote: "Helped us navigate the complex Indian startup ecosystem. Got angel checks within weeks. The founders here understood logistics challenges and could spot the opportunity immediately. This platform accelerated our journey by at least 18 months. It's not just a network, it's a launchpad.",
  },
  {
    name: "Ritika Agarwal",
    role: "Founder, Fashion Tech",
    initials: "RA",
    profileImage: "https://randomuser.me/api/portraits/women/3.jpg",
    quote: "This community taught me everything about pitching and investor relations. Absolutely brilliant. I went from being nervous about pitches to confidently presenting to VCs. The feedback sessions were brutally honest and incredibly helpful. Everyone genuinely wants to help you succeed.",
  },
  {
    name: "Ananya Sharma",
    role: "Co-Founder, HealthTech",
    initials: "AS",
    profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
    quote: "Secured pre-Series B funding in 6 months. The investor network here is incredibly strong. We had meetings with tier-1 VCs, got term sheets from multiple firms, and chose the partner who believed in our vision. The quality of introductions made all the difference.",
  },
  {
    name: "Meera Iyer",
    role: "Founder, Design Studio",
    initials: "MI",
    profileImage: "https://randomuser.me/api/portraits/women/5.jpg",
    quote: "Built a 30-person agency from this platform's connections. They believed in me when nobody did. I started with just one designer and myself. Through this network, I met potential clients, found talented designers, and built an incredible team. It's a supportive community.",
  },
  {
    name: "Aditya Kumar",
    role: "Serial Entrepreneur & Investor",
    initials: "AK",
    profileImage: "https://randomuser.me/api/portraits/men/6.jpg",
    quote: "Now investing in 10+ startups from here. This platform produces the best founders I know. The quality of founders is exceptional. They're scrappy, ambitious, and deeply committed to solving real problems. As an investor, I've found some of my best deals here.",
  },
  {
    name: "Neha Verma",
    role: "Founder, HR Tech",
    initials: "NV",
    profileImage: "https://randomuser.me/api/portraits/women/6.jpg",
    quote: "Got my first million-dollar cheque from an investor I met here. Dreams do come true! I attended an event, connected with an investor interested in HR Tech, had coffee, and within 2 months, we had a term sheet. This platform made the impossible possible for me.",
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
      ["h-56 md:h-64", "h-64 md:h-72", "h-56 md:h-64"],
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
              className="absolute w-full h-full rounded-2xl md:rounded-3xl border border-border bg-gradient-to-br from-background/60 via-background/50 to-background/40 p-4 md:p-6 shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/40 group-hover:scale-105 group-hover:border-primary/60 flex flex-col"
              style={{ backfaceVisibility: "hidden" }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 pointer-events-none" />

              <div className="relative z-10 h-full flex flex-col">
                {/* Quote icon and stars */}
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <Quote size={18} className="md:size-[24px] text-primary/40 flex-shrink-0" />
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={11} className="md:size-[13px] fill-primary text-primary" />
                    ))}
                  </div>
                </div>

                {/* Quote text */}
                <p className="flex-1 leading-relaxed text-foreground/75 text-xs md:text-sm mb-1.5 md:mb-2 line-clamp-[12] text-left break-words">
                  "{tt.quote}"
                </p>

                {/* Avatar and info */}
                <div className="mt-auto flex items-center gap-3 border-t border-border/50 pt-1.5 md:pt-2">
                  {tt.profileImage || tt.avatarUrl ? (
                    <img
                      src={tt.profileImage || tt.avatarUrl}
                      alt={tt.name}
                      className="h-10 md:h-12 w-10 md:w-12 rounded-full object-cover flex-shrink-0 border border-primary/20"
                    />
                  ) : (
                    <div className="flex h-10 md:h-12 w-10 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xs md:text-sm font-bold font-heading text-primary-foreground flex-shrink-0 border border-primary/20">
                      {tt.initials || tt.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-heading text-xs md:text-sm font-semibold text-foreground truncate">
                      {tt.name}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground truncate">{tt.role}</div>
                  </div>
                </div>

                {/* Click hint */}
                <div className="text-xs text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1.5">
                  ✦ Click to flip
                </div>
              </div>
            </div>

            {/* BACK - Profile */}
            <div
              className="absolute w-full h-full rounded-2xl md:rounded-3xl border border-border bg-gradient-to-br from-primary/25 via-primary/15 to-background/40 p-4 md:p-6 shadow-md overflow-hidden flex flex-col items-center justify-center text-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              {/* Profile avatar - larger */}
              <div className="mb-4 md:mb-5">
                {tt.profileImage || tt.avatarUrl ? (
                  <img
                    src={tt.profileImage || tt.avatarUrl}
                    alt={tt.name}
                    className="h-16 md:h-24 w-16 md:w-24 rounded-full object-cover border-3 border-primary/40"
                  />
                ) : (
                  <div className="flex h-16 md:h-24 w-16 md:w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-2xl md:text-3xl font-bold font-heading text-primary-foreground border-3 border-primary/40">
                    {tt.initials || tt.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="font-heading text-sm md:text-xl font-bold text-foreground mb-1 px-2">
                {tt.name}
              </div>

              {/* Role */}
              <div className="text-xs md:text-sm text-primary/80 mb-3 md:mb-4 line-clamp-2 px-2 font-medium">
                {tt.role}
              </div>

              {/* Divider */}
              <div className="h-px w-8 md:w-10 bg-primary/50 mb-3 md:mb-4" />

              {/* Click hint */}
              <div className="text-xs text-muted-foreground mt-auto">
                ✦ Click to flip back
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
