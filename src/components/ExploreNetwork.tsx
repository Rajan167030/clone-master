"use client";

import type React from "react";
import { Rocket, TrendingUp, Building2, Users, Handshake } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export function GlowingEffectDemoSecond() {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      <GridItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
        icon={<Rocket className="h-4 w-4 text-slate-700" />}
        title="Raise Funds"
        description="Fuel your startup growth with founder-first capital access."
      />

      <GridItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
        icon={<TrendingUp className="h-4 w-4 text-slate-700" />}
        title="Invest in Startups"
        description="Discover high-conviction early-stage opportunities."
      />

      <GridItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
        icon={<Building2 className="h-4 w-4 text-slate-700" />}
        title="SME IPO"
        description="Prepare your company for structured public-market readiness."
      />

      <GridItem
        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
        icon={<Users className="h-4 w-4 text-slate-700" />}
        title="Chapter Director"
        description="Lead city chapters and activate meaningful local ecosystems."
      />

      <GridItem
        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
        icon={<Handshake className="h-4 w-4 text-slate-700" />}
        title="Venture Partner"
        description="Unlock strategic intros with founders, operators, and investors."
      />
    </ul>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full overflow-hidden rounded-2xl border border-slate-300 bg-white p-[1px] shadow-[0_4px_16px_-12px_rgba(15,23,42,0.35)] md:rounded-3xl">
        <GlowingEffect
          blur={2}
          borderWidth={24}
          spread={300}
          glow={true}
          disabled={false}
          proximity={80}
          inactiveZone={0.01}
        />
        <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-[inherit] border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-slate-300 bg-white p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-slate-900 md:text-2xl/[1.875rem]">
                {title}
              </h3>
              <h2 className="font-sans text-sm/[1.125rem] text-slate-600 md:text-base/[1.375rem] [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

const ExploreNetwork = ({ className }: { className?: string }) => (
  <section id="network" className={`px-4 py-12 sm:px-6 lg:px-8 ${className ?? ""}`}>
    <div className="mx-auto w-full max-w-[120rem] rounded-[2rem] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3 md:p-5">
      <GlowingEffectDemoSecond />
    </div>
  </section>
);

export default ExploreNetwork;
