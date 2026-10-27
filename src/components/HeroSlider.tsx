import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getPublicSliderEventsApi, getPublicSliderPromotionsApi } from "@/lib/api";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

type Slide = {
  type: "event" | "promotion";
  title: string;
  highlight: string;
  link: string;
  image: string;
  alt: string;
  buttonLabel: string;
};

const SLIDER_HEIGHT = "h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]";

const HeroSlider = ({ className }: { className?: string }) => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loaded, setLoaded] = useState(false);
  const currentSlide = slides[current] ?? slides[0];

  useEffect(() => {
    // Fetch featured slider events and promotions
    const fetchSliderContent = async () => {
      try {
        const [eventsResponse, promotionsResponse] = await Promise.all([
          getPublicSliderEventsApi(),
          getPublicSliderPromotionsApi(),
        ]);

        const allSlides: Slide[] = [];

        // Add event slides (second slider onwards from admin panel)
        if (eventsResponse?.events && eventsResponse.events.length > 0) {
          const eventSlides = eventsResponse.events.map((event: any): Slide => ({
            type: "event",
            title: event.title,
            highlight: event.subtitle || event.title,
            link: `/events/${event.slug}`,
            image: optimizeCloudinaryUrl(event.bannerImage, 1600) || "",
            alt: event.bannerAlt || event.title,
            buttonLabel: "Join now",
          }));
          allSlides.push(...eventSlides);
        }

        // Add promotion slides (second feature)
        if (promotionsResponse?.promotions && promotionsResponse.promotions.length > 0) {
          const promotionSlides = promotionsResponse.promotions.map((promo: any): Slide => ({
            type: "promotion",
            title: promo.title,
            highlight: promo.description || promo.title,
            link: promo.linkUrl || "",
            image: optimizeCloudinaryUrl(promo.imageUrl, 1600) || "",
            alt: promo.altText || promo.title,
            buttonLabel: promo.buttonLabel || "View More",
          }));
          allSlides.push(...promotionSlides);
        }

        setSlides(allSlides);
      } catch (error) {
        console.error("Failed to fetch slider content:", error);
        setSlides([]);
      } finally {
        setLoaded(true);
      }
    };

    fetchSliderContent();
  }, []);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Hold the space with a plain dark block while loading, so the page doesn't jump.
  if (!loaded) {
    return (
      <section className={`relative ${className}`} aria-hidden>
        <div className={`${SLIDER_HEIGHT} w-full animate-pulse bg-slate-950`} />
      </section>
    );
  }

  // Nothing featured in the admin panel: don't render a placeholder slide.
  if (!currentSlide) return null;

  return (
    <section className={`relative ${className}`}>
      <div className="w-full">
        <div className={`relative overflow-hidden ${SLIDER_HEIGHT} bg-slate-950`}>
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
                {currentSlide.image ? (
                  <>
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
                  </>
                ) : (
                  // Event/promotion without an image: plain dark backdrop with its title.
                  <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-slate-950 px-6">
                    <span className="text-center text-2xl font-black tracking-tight text-white/90 sm:text-4xl md:text-5xl">
                      {currentSlide.title}
                    </span>
                  </div>
                )}
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
                {currentSlide.buttonLabel}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            )}
          </div>

          {slides.length > 1 && (
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
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
