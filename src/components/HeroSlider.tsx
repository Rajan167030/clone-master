import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import slide1 from "@/assets/hero-slide1.jpg";
import slide2 from "@/assets/hero-slide2.jpg";
import slide3 from "@/assets/hero-slide3.jpg";

const slides = [
  {
    title: "Founders Connect",
    highlight: "Startup Meetup 2026",
    link: "/events/founders-connect-dehradun-edition-v1",
    image: slide1,
    alt: "Founders Connect startup meetup event",
  },
  {
    title: "Founders Connect",
    highlight: "Investor Networking Night",
    link: "/events/founders-connect-investor-networking-night",
    image: slide2,
    alt: "Founders Connect investor networking event",
  },
  {
    title: "Join the",
    highlight: "Founders Connect Membership",
    link: "/membership",
    image: slide3,
    alt: "Founders Connect membership community",
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="relative rounded-2xl overflow-hidden h-[420px] md:h-[480px]">
          <Link
            to={slides[current].link}
            aria-label={`Open ${slides[current].highlight}`}
            className="absolute inset-0 z-10 block"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={`img-${current}`}
                src={slides[current].image}
                alt={slides[current].alt}
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
          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-background via-background/70 to-transparent" />

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-center px-8 md:px-16"
            >
              <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-foreground leading-tight">
                {slides[current].title}
                <br />
                <span className="text-gradient">{slides[current].highlight}</span>
              </h1>
              <button
                onClick={() => navigate(slides[current].link)}
                className="pointer-events-auto mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:gap-3 active:scale-95"
              >
                Explore Now
                <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>
          </AnimatePresence>

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
