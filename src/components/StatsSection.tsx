import { motion } from "framer-motion";
import { TrendingUp, Building2, Users, DollarSign } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const useCountingEffect = (value: string | number, duration: number = 2000) => {
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Extract numeric value from string (handles "1.5cr", "50", "₹315Cr", "1,000+")
    const extractNumber = (val: string | number) => {
      const str = String(val).toLowerCase();
      const match = str.match(/\d+\.?\d*/);
      return match ? parseFloat(match[0]) : 0;
    };

    // Get original format details
    const originalStr = String(value);
    const numericValue = extractNumber(originalStr);
    const hasComma = originalStr.includes(",");
    const hasCr = originalStr.includes("cr");
    const hasRupee = originalStr.includes("₹");
    const hasPlus = originalStr.includes("+");
    const hasDecimal = originalStr.includes(".");

    if (numericValue === 0) {
      setDisplayValue(value);
      return;
    }

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      const currentValue = Math.floor(numericValue * easeOutQuad);

      let formatted = String(currentValue);

      if (hasDecimal) {
        formatted = (numericValue * easeOutQuad).toFixed(1);
      }

      if (hasComma && currentValue >= 1000) {
        formatted = currentValue.toLocaleString();
      }

      if (hasCr) {
        formatted += "cr";
      }
      if (hasRupee) {
        formatted = "₹" + formatted;
      }
      if (hasCr) {
        formatted += "";
      }
      if (hasPlus && progress === 1) {
        formatted += "+";
      }

      setDisplayValue(formatted);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return displayValue;
};

const stats = [
  { value: "1.5cr", label: "Raised in VC", icon: DollarSign },
  { value: "50", label: "listed startup", icon: Building2 },
  { value: "₹315Cr", label: "Angel Capital", icon: TrendingUp },
  { value: "1,000+", label: "Angel Investors", icon: Users },
];

const StatCard = ({ stat, delay }: { stat: typeof stats[0]; delay: number }) => {
  const countedValue = useCountingEffect(stat.value, 2500);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group relative card-gradient border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <stat.icon size={20} className="text-primary" />
      </div>
      <div className="font-heading font-bold text-3xl md:text-4xl text-foreground tabular-nums">
        {countedValue}
      </div>
      <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">
        {stat.label}
      </div>
    </motion.div>
  );
};

const StatsSection = ({ className }: { className?: string }) => (
  <section id="stats" className={`py-24 relative ${className}`}>
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            Our Impact
          </span>
        </div>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-foreground tracking-tight">
          A Complete <span className="text-gradient">Business Ecosystem</span>
        </h2>
        <p className="text-muted-foreground mt-4">
          Numbers that reflect the trust of founders and investors worldwide.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} delay={i * 0.08} />
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
