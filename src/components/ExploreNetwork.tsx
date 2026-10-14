"use client";

import ExpandingCardStack, { type ExpandingCardItem } from "@/components/ExpandingCardStack";

const networkCards: ExpandingCardItem[] = [
  {
    category: "STARTUP EDUCATION",
    title: "COURSES & LEARNING",
    description: "Offers practical courses, business playbooks, case studies, and real-world lessons to learn directly from startup founders.",
    actionText: "READ MORE",
  },
  {
    category: "PRACTICAL EXECUTION",
    title: "COHORTS & MENTORSHIP",
    description: "Provides live programs, expert guidance, assignments, and masterclasses to build alongside actual founders.",
    actionText: "READ MORE",
  },
  {
    category: "FOUNDER NETWORK",
    title: "COMMUNITY & EVENTS",
    description: "Focuses on connecting users with founders, investors, mentors, and industry experts through curated events and networking.",
    actionText: "READ MORE",
  },
  {
    category: "MEDIA & STORYTELLING",
    title: "FOUNDER STORIES & CONTENT",
    description: "Features founder interviews, podcasts, startup news, business insights, and inspiring entrepreneurial journeys.",
    actionText: "READ MORE",
  },
  {
    category: "GROWTH & ECOSYSTEM",
    title: "STARTUP GROWTH, BRANDING & INCUBATION",
    description: "Provides access to startup growth resources, brand campaigns, college entrepreneurship programs, investor-readiness support, and venture-building opportunities.",
    actionText: "READ MORE",
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
