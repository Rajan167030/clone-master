import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getPublicSliderEventsApi } from "@/lib/api";

const cloudinaryImages = {
  slide1: "https://res.cloudinary.com/founders-connect/image/upload/c_fill,w_1200,h_600/hero/slide1.jpg",
  slide2: "https://res.cloudinary.com/founders-connect/image/upload/c_fill,w_1200,h_600/hero/slide2.jpg",
  slide3: "https://res.cloudinary.com/founders-connect/image/upload/c_fill,w_1200,h_600/hero/slide3.jpg",
};

const fallbackSlides = [
  {
    title: "Founders Connect",
    highlight: "Startup Meetup 2026",
    link: "/events/founders-connect-dehradun-edition-v1",
    image: cloudinaryImages.slide1,
    alt: "Founders Connect startup meetup event",
  },
  {
    title: "Founders Connect",
    highlight: "Investor Networking Night",
    link: "/events/founders-connect-investor-networking-night",
    image: cloudinaryImages.slide2,
    alt: "Founders Connect investor networking event",
  },
  {
    title: "Join the",
    highlight: "Founders Connect Membership",
    link: "/membership",
    image: cloudinaryImages.slide3,
    alt: "Founders Connect membership community",
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
    // Fetch featured slider events
    const fetchSliderEvents = async () => {
      try {
        const data = await getPublicSliderEventsApi();
        if (data?.events && data.events.length > 0) {
          // Convert events to slides format
          const eventSlides = data.events.map((event: any) => ({
            title: event.title,
            highlight: event.subtitle || event.title,
            link: `/events/${event.slug}`,
            image: event.bannerImage || cloudinaryImages.slide1,
            alt: event.bannerAlt || event.title,
          }));
          setSlides(eventSlides.length > 0 ? eventSlides : fallbackSlides);
        }
      } catch (error) {
        console.error("Failed to fetch slider events:", error);
        // Keep fallback slides on error
      }
    };

    fetchSliderEvents();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className={`relative pt-16 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="relative rounded-2xl overflow-hidden h-[360px] md:h-[460px]">
          <Link
            to={currentSlide.link}
            aria-label={`Open ${currentSlide.highlight}`}
            className="absolute inset-0 z-10 block"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={`img-${current}`}
                src={currentSlide.image}
                alt={currentSlide.alt}
                width={1600}
                height={900}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
          </Link>
          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-black/45 via-black/35 to-black/60" />

          

          <div className="absolute inset-0 z-40 flex items-end justify-start pointer-events-none px-6 md:px-12 pb-10 md:pb-16">
            <Link
              to={currentSlide.link}
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-purple-400/55 bg-purple-500/20 px-7 py-3 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-purple-500/35 active:scale-95 ml-0 md:ml-8"
            >
              Join now
              <ArrowRight className="h-5 w-5" />
            </Link>
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
