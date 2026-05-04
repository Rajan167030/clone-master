export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  coverImage: string;
  tags: string[];
  sections: Array<{
    heading: string;
    content: string;
  }>;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-founders-should-prepare-for-investor-meetings",
    title: "How Founders Should Prepare for Investor Meetings",
    excerpt:
      "A practical framework to turn investor meetings into focused conversations around traction, clarity, and growth potential.",
    author: "Founders Connect Editorial",
    date: "12 Apr 2026",
    readTime: "6 min read",
    coverImage:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1400&q=80",
    tags: ["Fundraising", "Investors", "Startup"],
    sections: [
      {
        heading: "Start with your narrative",
        content:
          "Investors remember clarity. Open with a tight story: what you are building, why now, and what problem you solve better than alternatives.",
      },
      {
        heading: "Show proof, not promises",
        content:
          "Bring evidence. Even if numbers are early, highlight retention, activation, and customer feedback with context and honest interpretation.",
      },
      {
        heading: "End with clear next steps",
        content:
          "A strong meeting ends with one clear ask and agreed follow-up. Share your data room checklist and timeline in writing.",
      },
    ],
  },
  {
    slug: "building-high-signal-founder-network",
    title: "Building a High-Signal Founder Network",
    excerpt:
      "Why intentional networking beats random events, and how to build relationships that compound over time.",
    author: "Community Team",
    date: "08 Apr 2026",
    readTime: "5 min read",
    coverImage:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1400&q=80",
    tags: ["Networking", "Community", "Growth"],
    sections: [
      {
        heading: "Choose depth over volume",
        content:
          "Five meaningful relationships can create more momentum than fifty casual contacts. Prioritize consistent, mutual-value conversations.",
      },
      {
        heading: "Create your follow-up system",
        content:
          "A simple weekly follow-up rhythm keeps your network warm. Document context, opportunities, and intros to make each interaction useful.",
      },
      {
        heading: "Contribute before you ask",
        content:
          "Share resources, intros, and playbooks first. A contribution-first mindset builds trust and improves quality of opportunities.",
      },
    ],
  },
  {
    slug: "membership-playbook-for-early-stage-founders",
    title: "Membership Playbook for Early-Stage Founders",
    excerpt:
      "How to use founder communities to accelerate decision-making, access capital, and avoid common execution mistakes.",
    author: "Program Desk",
    date: "01 Apr 2026",
    readTime: "7 min read",
    coverImage:
      "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&w=1400&q=80",
    tags: ["Membership", "Execution", "Founder Ops"],
    sections: [
      {
        heading: "Treat community as an operating layer",
        content:
          "The best founders use communities for rapid feedback loops, tactical support, and accountability on weekly priorities.",
      },
      {
        heading: "Ask sharper questions",
        content:
          "Specific questions get specific answers. Bring your metrics, bottlenecks, and constraints to get practical guidance.",
      },
      {
        heading: "Track outcomes",
        content:
          "Measure outcomes from each session: decisions made, intros unlocked, and experiments launched. This keeps participation ROI-focused.",
      },
    ],
  },
];

export const getBlogBySlug = (slug: string) => blogPosts.find((post) => post.slug === slug);
