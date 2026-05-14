import { motion } from "framer-motion";
import { TrendingUp, Building2, Users, DollarSign } from "lucide-react";

const stats = [
  { value: "1.5cr", label: "Raised in VC", icon: DollarSign },
  { value: "50", label: "listed startup", icon: Building2 },
  { value: "₹315Cr", label: "Angel Capital", icon: TrendingUp },
  { value: "1,000+", label: "Angel Investors", icon: Users },
];

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
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="group relative card-gradient border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <stat.icon size={20} className="text-primary" />
            </div>
            <div className="font-heading font-bold text-3xl md:text-4xl text-foreground tabular-nums">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
