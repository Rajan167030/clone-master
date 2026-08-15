import dotenv from "dotenv";
import mongoose from "mongoose";
import { BlogContent } from "../models/blog-content.model.js";

dotenv.config({ path: "backend/.env" });
dotenv.config();

const blogs = [
  {
    slug: "raising-your-first-round",
    title: "Raising Your First Round: What Investors Actually Look For",
    excerpt:
      "A practical breakdown of pitch decks, traction metrics, and founder storytelling that gets term sheets signed.",
    author: "Founders Connect Team",
    date: "Aug 02, 2026",
    readTime: "6 min read",
    coverImage:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80&fit=crop",
    tags: ["Fundraising"],
    isPublished: true,
    sections: [
      {
        heading: "Traction beats theory",
        content:
          "Investors don't fund ideas, they fund evidence. Before you open a single fundraising conversation, be ready to show usage numbers, revenue trends, or retention curves that prove people want what you're building. A slide that says 'huge market opportunity' means nothing without a chart showing your own growth inside it.",
      },
      {
        heading: "The deck is a leave-behind, not a script",
        content:
          "Most first-time founders over-engineer their pitch deck and under-engineer the conversation. Investors skim decks in under four minutes. Your job in the room is to tell a clear story: the problem, why now, why you, and what happens if this works. The deck should support that story, not replace it.",
      },
      {
        heading: "Know your numbers cold",
        content:
          "Nothing kills investor confidence faster than a founder who can't answer 'what's your burn rate' or 'what's your CAC payback period' without checking a spreadsheet. Memorize your unit economics before every meeting — it signals operational discipline more than any slide can.",
      },
      {
        heading: "Warm intros still win",
        content:
          "Cold outreach can work, but a warm introduction from a founder or operator the investor already trusts converts at a dramatically higher rate. This is exactly why founder communities matter — the fastest path to a term sheet is often two degrees away, not a cold email.",
      },
    ],
  },
  {
    slug: "building-founder-community",
    title: "Why Community Beats Cold Outreach for Early-Stage Founders",
    excerpt:
      "How curated founder circles compound into warm intros, co-founders, and your first ten customers.",
    author: "Founders Connect Team",
    date: "Jul 21, 2026",
    readTime: "5 min read",
    coverImage:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&q=80&fit=crop",
    tags: ["Community"],
    isPublished: true,
    sections: [
      {
        heading: "Your network is a distribution channel",
        content:
          "Early-stage founders treat networking as a soft skill, but it's actually a growth channel. A room full of founders and operators is a room full of potential first customers, first hires, and first investor introductions — all without a single ad rupee spent.",
      },
      {
        heading: "Cold outreach has a ceiling",
        content:
          "Cold emails and LinkedIn DMs work occasionally, but response rates are low and trust has to be built from zero every time. A warm community relationship starts with trust already in place, which shortens every sales cycle, hiring conversation, and fundraising pitch that follows.",
      },
      {
        heading: "Show up consistently, not just when you need something",
        content:
          "The founders who get the most out of a community are the ones who show up before they need anything — sharing what they've learned, helping other founders debug a problem, introducing two people who should know each other. Reciprocity compounds; transactional networking doesn't.",
      },
      {
        heading: "Co-founders are found, not posted for",
        content:
          "Some of the strongest founding teams meet at a meetup, a hackathon, or a curated dinner — not through a co-founder matching form. Proximity and repeated interaction over months tell you far more about someone's work ethic and values than a single interview ever could.",
      },
    ],
  },
  {
    slug: "execution-over-ideas",
    title: "Execution Over Ideas: Lessons From 50+ Founder Journeys",
    excerpt:
      "Patterns from founders who scaled fast, distilled into a playbook for shipping, iterating, and staying resilient.",
    author: "Founders Connect Team",
    date: "Jul 09, 2026",
    readTime: "7 min read",
    coverImage:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80&fit=crop",
    tags: ["Startup Tips"],
    isPublished: true,
    sections: [
      {
        heading: "Ideas are cheap, shipping is expensive",
        content:
          "Across the founder journeys we've tracked, almost none succeeded because of a novel idea — most were variations on existing concepts, executed faster and with more discipline than competitors. The founders who won were the ones who shipped a rough version in week two instead of a polished version in month six.",
      },
      {
        heading: "Talk to users before you build, not after",
        content:
          "The founders who wasted the least time were the ones who ran twenty customer conversations before writing a line of code, then built the smallest possible version of the thing that solved the sharpest pain point they heard repeated.",
      },
      {
        heading: "Resilience is a founder's actual moat",
        content:
          "Every founder we've spoken to has a story about the month it almost fell apart — a lost co-founder, a funding round that fell through, a product pivot that felt like starting over. What separated the ones who made it wasn't luck, it was refusing to treat a bad month as a verdict on the company.",
      },
      {
        heading: "Iterate in public",
        content:
          "The fastest-growing startups in our network share progress openly — with users, with their community, with investors — instead of building in a black box for a year. Public iteration creates accountability and often surfaces your best customers before you've even finished the product.",
      },
    ],
  },
  {
    slug: "hiring-your-first-ten",
    title: "Hiring Your First Ten: Building a Team That Outruns You",
    excerpt:
      "Why your earliest hires define company culture more than any values doc, and how to get them right.",
    author: "Ritika Agarwal",
    date: "Jun 28, 2026",
    readTime: "6 min read",
    coverImage:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80&fit=crop",
    tags: ["Hiring", "Startup Tips"],
    isPublished: true,
    sections: [
      {
        heading: "Your first ten hires are your culture",
        content:
          "No values document survives contact with a bad early hire. The behaviors your first ten employees model — how they handle disagreement, how they treat customers, whether they cut corners under deadline pressure — become the default culture long before any handbook gets written.",
      },
      {
        heading: "Hire for trajectory, not just résumé",
        content:
          "Early-stage roles change shape every few months. The strongest early hires are the ones who've shown a pattern of learning fast and taking on ambiguous problems, even if their résumé looks less polished than a candidate from a bigger brand.",
      },
      {
        heading: "Reference calls are non-negotiable",
        content:
          "At the seed stage, a single bad hire can set a ten-person team back by a quarter. Always call references directly, and ask what the candidate was like under pressure — not just what they accomplished when things were going well.",
      },
    ],
  },
  {
    slug: "pricing-your-product-right",
    title: "Pricing Your Product Right: A Founder's Field Guide",
    excerpt:
      "Most early-stage startups underprice by default. Here's a framework for pricing with confidence from day one.",
    author: "Aditya Kumar",
    date: "Jun 12, 2026",
    readTime: "5 min read",
    coverImage:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80&fit=crop",
    tags: ["Startup Tips", "Fundraising"],
    isPublished: true,
    sections: [
      {
        heading: "Underpricing is the default mistake",
        content:
          "Most first-time founders price based on what feels comfortable to charge, not on the value they deliver. If customers aren't occasionally pushing back on price, you're very likely leaving revenue — and often, credibility — on the table.",
      },
      {
        heading: "Anchor to value, not cost",
        content:
          "Cost-plus pricing caps your upside. Instead, price against the outcome your product creates for the customer — time saved, revenue unlocked, risk avoided — and let that number, not your operating costs, set the ceiling.",
      },
      {
        heading: "Test pricing with real conversations",
        content:
          "You'll learn more about your pricing from ten sales conversations where you actually state a number than from any amount of competitor research. Watch for hesitation, not just a yes or no — hesitation tells you where the real ceiling is.",
      },
    ],
  },
  {
    slug: "founder-mental-health",
    title: "The Founder's Guide to Staying Sane During the Hard Months",
    excerpt:
      "Every startup has a brutal stretch. Here's how experienced founders protect their mental health without slowing down.",
    author: "Meera Iyer",
    date: "May 30, 2026",
    readTime: "6 min read",
    coverImage:
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80&fit=crop",
    tags: ["Community", "Startup Tips"],
    isPublished: true,
    sections: [
      {
        heading: "The hard months are not optional",
        content:
          "Nearly every founder we've interviewed has been through at least one multi-month stretch that felt unsurvivable — a failed raise, a co-founder split, a product that wasn't landing. Normalizing that this is part of the journey, not a sign of failure, is the first step to getting through it.",
      },
      {
        heading: "Isolation makes everything worse",
        content:
          "Founders who talk openly with peers going through similar pressure recover faster than founders who try to carry it alone in front of their team. A trusted founder circle gives you somewhere to be honest without it becoming a company-wide crisis of confidence.",
      },
      {
        heading: "Protect a non-negotiable routine",
        content:
          "The founders who stayed resilient longest all had one thing in common: a small, non-negotiable routine — a morning walk, a weekly call with a mentor, a fixed sleep schedule — that didn't get sacrificed even during the worst weeks.",
      },
    ],
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const blog of blogs) {
    const result = await BlogContent.findOneAndUpdate(
      { slug: blog.slug },
      { $set: blog },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log("Seeded blog:", result.slug);
  }

  await mongoose.disconnect();
  console.log(`Blog seed complete. ${blogs.length} posts upserted.`);
};

seed().catch(async (err) => {
  console.error("Blog seed failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
