"use client";

import ExpandingCardStack, { type ExpandingCardItem } from "@/components/ExpandingCardStack";

const networkCards: ExpandingCardItem[] = [
  {
    title: "Networking & Community",
    description: "Connect with founders, investors, and industry experts at curated events.",
  },
  {
    title: "Talent & Hiring",
    description: "Find co-founders, early employees, and advisors for your startup.",
  },
  {
    title: "Legal & Compliance",
    description: "Contracts, IP protection, and regulatory compliance made simple.",
  },
  {
    title: "Growth & Marketing",
    description: "Customer acquisition strategies and growth playbooks for early-stage startups.",
  },
  {
    title: "Pitch Deck & Fundraising Prep",
    description: "Craft investor-ready pitch decks and fundraising strategy.",
  },
];

const ExploreNetwork = ({ className }: { className?: string }) => (
  <section id="network" className={`px-4 py-12 sm:px-6 lg:px-8 ${className ?? ""}`}>
    <div className="mx-auto w-full max-w-[120rem] rounded-[2rem] border border-white/10 bg-black p-3 md:p-5">
      <ExpandingCardStack cards={networkCards} trigger="click" />
    </div>
  </section>
);

export default ExploreNetwork;
