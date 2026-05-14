import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { getPublicTestimonialsApi, type Testimonial } from "@/lib/api";

const testimonials = [
  {
    name: "Girraj Sharma",
    role: "Angel Investor",
    initials: "GS",
    quote: "The transparency and deal quality at StartupLanes is unmatched in the Indian ecosystem.",
  },
  {
    name: "Kaushik Banerjee",
    role: "CEO, Fluttr",
    initials: "KB",
    quote: "Raised over 1 Crore with the help of the SL network. They are more than just a platform; they are partners.",
  },
  {
    name: "Gaurav Dua",
    role: "Founder, Hobit",
    initials: "GD",
    quote: "The perfect place for early-stage startups to find the right eyes and the right capital.",
  },
];

const Testimonials = ({ className }: { className?: string }) => {
  const [items, setItems] = useState<Testimonial[]>([]);

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

  const marqueeTestimonials = items.length ? [...items, ...items] : [...testimonials, ...testimonials];

  return (
    <section className={`py-24 sm:py-32 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Testimonials
            </span>
          </div>
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-foreground tracking-tight">
            Success <span className="text-gradient">Stories</span>
          </h2>
          <p className="text-muted-foreground mt-4">
            Hear from founders and investors who've grown with us.
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />

          <div className="testimonial-track flex w-max gap-6 px-4 py-2">
            {marqueeTestimonials.map((t, i) => (
              <motion.div
                key={`${t._id || t.name}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % (items.length || testimonials.length)) * 0.1 }}
                className="card-gradient flex w-[320px] flex-col rounded-2xl border border-border p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <Quote size={28} className="text-primary/40" />
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className="fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <p className="flex-1 leading-relaxed text-foreground/80">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  {t.avatarUrl ? (
                    <img src={t.avatarUrl} alt={t.name} className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold font-heading text-primary-foreground">
                      {t.initials || t.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-heading text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
