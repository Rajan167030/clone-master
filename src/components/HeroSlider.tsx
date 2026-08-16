import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getPublicSliderEventsApi, getPublicSliderPromotionsApi } from "@/lib/api";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

const HERO_IMAGE = "/hero-founders-connect.webp";

const fallbackSlides = [
  {
    title: "Founders Connect",
    highlight: "Startup Meetup 2026",
    link: "/events/founders-connect-dehradun-edition-v1",
    image: HERO_IMAGE,
    alt: "Founders Connect startup meetup event",
    buttonLabel: "Join now",
  },
  {
    title: "",
    highlight: "",
    link: "/joinus",
    image: HERO_IMAGE,
    alt: "Join Founders Connect",
    buttonLabel: "Join now",
  },
  {
    title: "",
    highlight: "",
    link: "/joinus",
    image: HERO_IMAGE,
    alt: "Join Founders Connect",
    buttonLabel: "Join now",
  },
];

const HeroSlider = ({ className }: { className?: string }) => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState(fallbackSlides);
  const currentSlide = slides[current] ?? fallbackSlides[0];
  const heroTitle = useMemo(() => {
    const title = currentSlide?.title?.trim() || "Founders Connect";
    const highlight = currentSlide?.highlight?.trim() || "Join now";
    return `${title} ${highlight}`;
  }, [currentSlide]);

  useEffect(() => {
    // Fetch featured slider events and promotions
    const fetchSliderContent = async () => {
      try {
        const [eventsResponse, promotionsResponse] = await Promise.all([
          getPublicSliderEventsApi(),
          getPublicSliderPromotionsApi(),
        ]);

        // The first slide is ALWAYS hardcoded as requested
        const allSlides = [
          {
            type: "hardcoded",
            title: "Founders Connect",
            highlight: "Startup Meetup 2026",
            link: "/events/founders-connect-dehradun-edition-v1",
            image: HERO_IMAGE,
            alt: "Founders Connect startup meetup event",
            buttonLabel: "Join now",
          }
        ];

        // Add event slides (second slider onwards from admin panel)
        if (eventsResponse?.events && eventsResponse.events.length > 0) {
          const eventSlides = eventsResponse.events.map((event: any) => ({
            type: "event",
            title: event.title,
            highlight: event.subtitle || event.title,
            link: `/events/${event.slug}`,
            image: optimizeCloudinaryUrl(event.bannerImage, 1600) || HERO_IMAGE,
            alt: event.bannerAlt || event.title,
            buttonLabel: "Join now",
          }));
          allSlides.push(...eventSlides);
        }

        // Add promotion slides (second feature)
        if (promotionsResponse?.promotions && promotionsResponse.promotions.length > 0) {
          const promotionSlides = promotionsResponse.promotions.map((promo: any) => ({
            type: "promotion",
            title: promo.title,
            highlight: promo.description || promo.title,
            link: promo.linkUrl || "",
            image: optimizeCloudinaryUrl(promo.imageUrl, 1600),
            alt: promo.altText || promo.title,
            buttonLabel: promo.buttonLabel || "View More",
          }));
          allSlides.push(...promotionSlides);
        }

        setSlides(allSlides.length > 1 ? allSlides : [...allSlides, ...fallbackSlides.slice(1)]);
      } catch (error) {
        console.error("Failed to fetch slider content:", error);
        // Keep fallback slides on error
        setSlides(fallbackSlides);
      }
    };

    fetchSliderContent();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className={`relative ${className}`}>
      <div className="w-full">
        <div className="relative overflow-hidden h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-slate-950">
          <Link
            to={currentSlide.link}
            aria-label={`Open ${currentSlide.highlight}`}
            className="absolute inset-0 z-10 block"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`slide-${current}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0 w-full h-full overflow-hidden"
              >
                {/* Blurred Background */}
                <img
                  src={currentSlide.image}
                  alt=""
                  loading={current === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover scale-[1.15] blur-3xl opacity-60 saturate-150"
                  aria-hidden="true"
                />
                {/* Foreground Image */}
                <motion.img
                  src={currentSlide.image}
                  alt={currentSlide.alt}
                  width={1600}
                  height={900}
                  loading={current === 0 ? "eager" : "lazy"}
                  decoding="async"
                  // @ts-expect-error fetchPriority is a valid DOM attribute not yet in React's img typings
                  fetchpriority={current === 0 ? "high" : "auto"}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl z-10"
                />
              </motion.div>
            </AnimatePresence>
          </Link>
          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-black/45 via-black/35 to-black/60" />

          

          <div className="absolute inset-0 z-40 flex items-end justify-start pointer-events-none px-3 sm:px-6 md:px-12 pb-6 sm:pb-8 md:pb-10 lg:pb-16">
            {currentSlide.link && (
              <Link
                to={currentSlide.link}
                className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-purple-400/55 bg-purple-500/20 px-5 sm:px-7 py-2 sm:py-3 text-sm sm:text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-purple-500/35 active:scale-95"
              >
                {(currentSlide as any).buttonLabel || "Join now"}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            )}
          </div>

          <div className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  i === current ? "bg-primary w-6" : "bg-muted-foreground/40 w-2.5"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
