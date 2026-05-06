import slide1 from "@/assets/hero-slide1.jpg";
import slide2 from "@/assets/hero-slide2.jpg";
import slide3 from "@/assets/hero-slide3.jpg";

export type EventFaq = {
  question: string;
  answer: string;
};

export type EventData = {
  slug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  bannerImage: string;
  bannerAlt: string;
  hostName: string;
  hostLogoText: string;
  dateLabel: string;
  locationLabel: string;
  mapUrl: string;
  calendarUrl: string;
  registrationUrl: string;
  ticketLabel: string;
  refundPolicy: string;
  about: string[];
  expectations: string[];
  differentiators: string[];
  audience: string[];
  tags: string[];
  photos: string[];
  videos: string[];
  faqs: EventFaq[];
};

export const events: EventData[] = [
  {
    slug: "founders-connect-dehradun-edition-v1",
    title: "Founder's Connect Dehradun Edition",
    subtitle: "v1.0 | Startup Networking & Investor Connect",
    shortDescription:
      "A curated startup meetup designed to connect founders, builders, and ecosystem leaders in one high-value room.",
    bannerImage: slide1,
    bannerAlt: "Founders Connect Dehradun Edition banner",
    hostName: "Founders Connect Team",
    hostLogoText: "FC",
    dateLabel: "Fri, 15 May - 03:00 PM (IST)",
    locationLabel: "Dehradun, India",
    mapUrl: "https://maps.google.com/?q=Dehradun,+India",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Founder%27s+Connect+Dehradun+Edition+v1.0&details=Startup+Networking+%26+Investor+Connect&location=Dehradun%2C+India&dates=20260515T093000Z/20260515T123000Z",
    registrationUrl: "/register/user",
    ticketLabel:
      "Tickets for Founder's Connect Dehradun Edition | v1.0 | Startup Networking & Investor Connect can be booked here.",
    refundPolicy:
      "All ticket sales are final. No refunds will be issued. Refunds may only be granted if the event is cancelled by the organizer.",
    about: [
      "Founder's Connect brings its Dehradun Edition v1.0, a curated startup meetup designed to connect founders, builders, and ecosystem leaders in one powerful room.",
      "This is a high-value, no-fluff networking experience where you do not just exchange contacts - you build real relationships, explore opportunities, and gain actionable insights from people actively working in the startup ecosystem.",
    ],
    expectations: [
      "Insightful speaker sessions from experienced professionals",
      "Opportunity to interact with active investors",
      "Startup-focused discussions and practical learning",
      "Curated networking with serious founders and builders",
      "Real conversations around growth, scaling, and funding",
    ],
    differentiators: [
      "Curated room of serious founders and builders",
      "Direct access to the startup ecosystem",
      "Practical insights over generic theory",
      "Opportunity to showcase and pitch your startup",
      "High-quality networking with no random crowd",
    ],
    audience: [
      "Startup Founders and Co-founders",
      "Early-stage Builders",
      "Aspiring Entrepreneurs",
      "Freelancers and Operators",
      "Anyone serious about startups",
    ],
    tags: ["Entrepreneurship", "Startup", "Conferences", "Meetups", "Business"],
    photos: ["Event photo", "Event photo", "Event photo"],
    videos: ["Event video"],
    faqs: [
      {
        question:
          "When and where is Founder's Connect Dehradun Edition | v1.0 | Startup Networking & Investor Connect being held?",
        answer: "It is scheduled for Fri, 15 May at 03:00 PM (IST) in Dehradun, India.",
      },
      {
        question:
          "How much do tickets cost for Founder's Connect Dehradun Edition | v1.0 | Startup Networking & Investor Connect?",
        answer:
          "Ticket pricing and availability are shown on the registration page. Slots are limited and entry is approval-based.",
      },
      {
        question:
          "What is the refund policy for Founder's Connect Dehradun Edition | v1.0 | Startup Networking & Investor Connect?",
        answer:
          "All ticket sales are final, and refunds are only considered if the event is cancelled by the organizer.",
      },
      {
        question:
          "Who is organizing Founder's Connect Dehradun Edition | v1.0 | Startup Networking & Investor Connect?",
        answer: "The event is hosted and organized by the Founders Connect Team.",
      },
      {
        question: "What has been the experience of attendees at Founders Connect events?",
        answer:
          "Attendees typically report high-signal conversations, actionable startup insights, and meaningful founder-investor connections.",
      },
    ],
  },
  {
    slug: "founders-connect-investor-networking-night",
    title: "Founders Connect Investor Networking Night",
    subtitle: "Pitch, Connect, and Collaborate",
    shortDescription:
      "An evening format that brings selected founders, operators, and early-stage investors together for focused deal and growth conversations.",
    bannerImage: slide2,
    bannerAlt: "Founders Connect Investor Networking Night banner",
    hostName: "Founders Connect Events Desk",
    hostLogoText: "FC",
    dateLabel: "Sat, 29 Jun - 06:30 PM (IST)",
    locationLabel: "Gurugram, India",
    mapUrl: "https://maps.google.com/?q=Gurugram,+India",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Founders+Connect+Investor+Networking+Night&details=Pitch%2C+Connect%2C+and+Collaborate&location=Gurugram%2C+India&dates=20260629T130000Z/20260629T153000Z",
    registrationUrl: "/register/user",
    ticketLabel: "Tickets are live now with limited founder and investor seats.",
    refundPolicy:
      "Tickets are non-refundable unless the event is cancelled by Founders Connect.",
    about: [
      "This curated evening is built for founders looking for meaningful investor access and operator-level advice.",
      "Expect structured introductions, quick pitch moments, and practical conversations around traction and fundraising readiness.",
    ],
    expectations: [
      "Investor office-hour format",
      "Founder lightning introductions",
      "Operator growth playbooks",
      "Warm intros and follow-up support",
    ],
    differentiators: [
      "Invite-prioritized attendee mix",
      "High-context networking over vanity attendance",
      "Direct visibility for serious founders",
    ],
    audience: [
      "Early-stage startup founders",
      "Angel investors",
      "Growth operators",
      "Startup ecosystem enablers",
    ],
    tags: ["Investor Connect", "Networking", "Startup", "Pitching"],
    photos: ["Networking floor", "Founder pitch moment"],
    videos: ["Event recap clip"],
    faqs: [
      {
        question: "Is this event open to all founders?",
        answer: "Seats are limited and approvals are prioritized for active founders with clear startup context.",
      },
      {
        question: "Can I pitch at the event?",
        answer: "Yes, selected attendees get short pitch windows as part of the evening format.",
      },
    ],
  },
  {
    slug: "founders-connect-membership",
    title: "Founders Connect Membership",
    subtitle: "Build With the Right Community",
    shortDescription:
      "Get year-round access to curated founders, investor circles, and members-only startup sessions.",
    bannerImage: slide3,
    bannerAlt: "Founders Connect Membership banner",
    hostName: "Founders Connect Community",
    hostLogoText: "FC",
    dateLabel: "Always Open",
    locationLabel: "Online + City Chapters",
    mapUrl: "https://maps.google.com/?q=India",
    calendarUrl: "/register/user",
    registrationUrl: "/register/user",
    ticketLabel: "Choose your membership tier and join the founders-only ecosystem.",
    refundPolicy: "Membership plans can be cancelled as per the terms on checkout.",
    about: [
      "Membership is designed for founders who want consistent momentum, warm intros, and strategic accountability.",
    ],
    expectations: [
      "Monthly closed-room founder sessions",
      "Investor office-hours and feedback loops",
      "Partner deals and startup resources",
    ],
    differentiators: ["Quality-focused member curation", "Execution-first support", "Founder-led community"],
    audience: ["Startup founders", "Co-founders", "Serious builders"],
    tags: ["Membership", "Community", "Founders"],
    photos: ["Community meetup"],
    videos: ["Membership walkthrough"],
    faqs: [
      {
        question: "How do I join membership?",
        answer: "Click Become a Member and complete the quick profile and onboarding flow.",
      },
    ],
  },
  {
    slug: "founders-connect-mumbai-edition",
    title: "Founders Connect Mumbai Edition",
    subtitle: "Funding & Growth Strategies",
    shortDescription:
      "A high-energy evening with India's top founders and investors discussing Series A fundraising and scaling playbooks.",
    bannerImage: slide1,
    bannerAlt: "Founders Connect Mumbai Edition banner",
    hostName: "Founders Connect Team",
    hostLogoText: "FC",
    dateLabel: "Wed, 22 May - 05:00 PM (IST)",
    locationLabel: "Mumbai, India",
    mapUrl: "https://maps.google.com/?q=Mumbai,+India",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Founders+Connect+Mumbai+Edition&details=Funding+%26+Growth+Strategies&location=Mumbai%2C+India&dates=20260522T113000Z/20260522T143000Z",
    registrationUrl: "/register/user",
    ticketLabel: "Limited seats available. Register now for confirmed access.",
    refundPolicy: "Full refund available up to 48 hours before the event.",
    about: [
      "Mumbai's premier startup networking event brings together 80+ founders, VCs, and angel investors.",
      "Focus on practical fundraising strategies, Series A readiness, and post-funding growth execution.",
      "Exclusive fireside chat with a unicorn founder followed by structured networking.",
    ],
    expectations: [
      "Fireside chat with Series A founder",
      "VC feedback on live pitch deck reviews",
      "Growth panel discussion",
      "Founder-investor speed networking",
    ],
    differentiators: [
      "Direct access to 5+ Series A investors",
      "Deck review sessions",
      "Post-event online community for follow-ups",
    ],
    audience: ["Pre-seed to Series A founders", "Active angels", "Growth-stage operators"],
    tags: ["Fundraising", "Growth", "Investor Connect", "Mumbai"],
    photos: ["Venue setup", "Panel speakers"],
    videos: ["Promotional video"],
    faqs: [
      {
        question: "Should I bring my pitch deck?",
        answer: "Yes! Investors will provide direct feedback in our deck review sessions.",
      },
      {
        question: "Is this hybrid or in-person only?",
        answer: "In-person only in Mumbai. No virtual attendance option.",
      },
    ],
  },
  {
    slug: "founders-connect-bangalore-investor-summit",
    title: "Founders Connect Bangalore Investor Summit",
    subtitle: "Q2 2026 Deal Flow & Opportunities",
    shortDescription:
      "India's largest investor gathering with 100+ VCs, angels, and corporates exploring next-gen startups and deal syndication.",
    bannerImage: slide2,
    bannerAlt: "Bangalore Investor Summit banner",
    hostName: "Founders Connect x InvestIndia",
    hostLogoText: "FC",
    dateLabel: "Thu, 05 Jun - 09:00 AM (IST)",
    locationLabel: "Bangalore, India (Prestige Convention Centre)",
    mapUrl: "https://maps.google.com/?q=Prestige+Convention+Centre+Bangalore",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Bangalore+Investor+Summit&details=Q2+2026+Deal+Flow&location=Bangalore%2C+India&dates=20260605T033000Z/20260605T093000Z",
    registrationUrl: "/register/user",
    ticketLabel: "Investor passes available. Founder applications open now.",
    refundPolicy: "Refunds available until 72 hours before event start.",
    about: [
      "The largest investor-focused event in India bringing together decision-makers from top VCs, family offices, and corporate ventures.",
      "Showcase 50 promising startups. Participate in panel discussions on market trends, sector deep-dives, and investment strategies.",
      "Networking dedicated to founder-investor connections and large-ticket syndication opportunities.",
    ],
    expectations: [
      "100+ investors in one room",
      "50 vetted startup pitches",
      "Sector-specific panel discussions",
      "Deal syndication workshops",
    ],
    differentiators: [
      "Largest investor concentration",
      "Corporate venture participation",
      "Sector deep-dives (FinTech, SaaS, Climate)",
    ],
    audience: ["VCs and angels", "Startup founders seeking growth capital", "Corporate innovators"],
    tags: ["Investment", "Summit", "Investor Connect", "Bangalore"],
    photos: ["Summit hall", "Founders pitching"],
    videos: ["2025 Summit Recap"],
    faqs: [
      {
        question: "How do I pitch at the summit?",
        answer: "Apply as a founder. Selected startups get a 5-min pitch slot on the main stage.",
      },
      {
        question: "Can I attend as an investor even if I'm not from a fund?",
        answer: "Angel investors welcome. Corporate investors and LPs can apply for special passes.",
      },
    ],
  },
  {
    slug: "women-founders-workshop-and-networking",
    title: "Women Founders Workshop & Networking",
    subtitle: "Scaling, Fundraising & Leadership",
    shortDescription:
      "An intimate workshop for women founders covering fundraising strategies, board dynamics, and building world-class teams.",
    bannerImage: slide3,
    bannerAlt: "Women Founders Workshop banner",
    hostName: "Founders Connect Women's Initiative",
    hostLogoText: "FC",
    dateLabel: "Mon, 26 May - 03:00 PM (IST)",
    locationLabel: "Delhi, India",
    mapUrl: "https://maps.google.com/?q=Delhi,+India",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Women+Founders+Workshop&details=Scaling%2C+Fundraising+%26+Leadership&location=Delhi%2C+India&dates=20260526T093000Z/20260526T143000Z",
    registrationUrl: "/register/user",
    ticketLabel: "Intimate group of 40 women founders. Early bird pricing available.",
    refundPolicy: "Full refund 1 week before event.",
    about: [
      "Dedicated workshop for women founders to share learnings, challenges, and growth strategies.",
      "Facilitated by women founders who have raised $100M+, built world-class teams, and navigated board dynamics.",
      "Focused on practical frameworks and peer support in a safe, non-judgmental space.",
    ],
    expectations: [
      "Deep-dive sessions on Series A & B fundraising",
      "Board dynamics and founder-investor relations",
      "Team building and hiring strategies",
      "Peer mastermind groups",
    ],
    differentiators: [
      "Women-only safe space",
      "Mentorship from successful women founders",
      "Ongoing cohort-based support",
    ],
    audience: ["Women founders", "Female co-founders", "First-time founders"],
    tags: ["Women", "Founders", "Fundraising", "Leadership", "Workshop"],
    photos: ["Workshop session", "Networking"],
    videos: ["Testimonial video"],
    faqs: [
      {
        question: "Is this event open only to women?",
        answer: "Yes, this is a women-only space to encourage open conversations.",
      },
      {
        question: "Do I need to have a registered company to attend?",
        answer: "No. Aspiring and early-stage women founders are also welcome.",
      },
    ],
  },
  {
    slug: "founders-connect-bootcamp-pre-launch",
    title: "Founders Connect Bootcamp: Pre-Launch Edition",
    subtitle: "From Idea to Product-Market Fit in 12 Weeks",
    shortDescription:
      "An intensive cohort-based bootcamp for first-time founders going from idea validation to their first 100 users.",
    bannerImage: slide1,
    bannerAlt: "Bootcamp Pre-Launch Edition banner",
    hostName: "Founders Connect Academy",
    hostLogoText: "FC",
    dateLabel: "Jun 15 - Sep 5 (12 Weeks)",
    locationLabel: "Hybrid (Delhi Hub + Online)",
    mapUrl: "https://maps.google.com/?q=Delhi,+India",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Founders+Bootcamp&details=12-week+pre-launch+program&location=Delhi%2C+India&dates=20260615/20260905",
    registrationUrl: "/register/user",
    ticketLabel: "Cohort size: 25 founders max. Applications close May 30.",
    refundPolicy: "Refund available within first 2 weeks of bootcamp start.",
    about: [
      "A structured 12-week program designed for non-technical co-founders, designers, and domain experts ready to launch their startup.",
      "Combines weekly masterclasses, peer learning, 1-on-1 mentorship, and real customer validation exercises.",
      "Goal: Validate your idea, build your MVP, and secure your first 100 users by week 12.",
    ],
    expectations: [
      "2 in-person days per week in Delhi hub",
      "Weekly live masterclasses (online)",
      "1-on-1 founder-mentor sessions",
      "Customer discovery assignments",
      "Pitch deck and investor prep",
    ],
    differentiators: [
      "Cohort-based peer learning",
      "Real-time customer feedback loops",
      "Investor network access",
      "Post-bootcamp acceleration program",
    ],
    audience: [
      "First-time founders",
      "Idea-stage entrepreneurs",
      "Career switchers entering startup ecosystem",
    ],
    tags: ["Bootcamp", "Pre-launch", "Startup Academy", "Mentorship"],
    photos: ["Cohort collaboration", "Mentor session"],
    videos: ["Program overview", "Alumni stories"],
    faqs: [
      {
        question: "Do I need technical skills to join?",
        answer:
          "No. We welcome non-technical founders. You'll work with technical co-founders or dev partners during the program.",
      },
      {
        question: "What happens after the bootcamp?",
        answer:
          "Top 5 startups get access to our accelerator program and $25K seed grant applications.",
      },
    ],
  },
  {
    slug: "quarterly-partner-summit-q2-2026",
    title: "Founders Connect Quarterly Partner Summit",
    subtitle: "Collaborate, Build, & Grow Together",
    shortDescription:
      "Exclusive gathering of Founders Connect partners including banks, corporate investors, service providers, and VCs.",
    bannerImage: slide2,
    bannerAlt: "Partner Summit Q2 2026 banner",
    hostName: "Founders Connect Partnerships Team",
    hostLogoText: "FC",
    dateLabel: "Wed, 10 Jun - 02:00 PM (IST)",
    locationLabel: "Hyderabad, India",
    mapUrl: "https://maps.google.com/?q=Hyderabad,+India",
    calendarUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Partner+Summit+Q2&details=Collaboration+and+Growth&location=Hyderabad%2C+India&dates=20260610T083000Z/20260610T123000Z",
    registrationUrl: "/register/user",
    ticketLabel: "Partner-only event. Invitation required.",
    refundPolicy: "Partners can reschedule for next quarter.",
    about: [
      "Quarterly meeting of Founders Connect's 50+ institutional partners including financial institutions, corporate VCs, and service providers.",
      "Discuss partnership opportunities, joint initiatives, founder success stories, and co-marketing plans.",
      "Preview of upcoming launches and new partner benefits.",
    ],
    expectations: [
      "Partner success stories & case studies",
      "New partnership opportunities",
      "Founder success metrics review",
      "Co-marketing planning sessions",
    ],
    differentiators: [
      "Invite-only for vetted partners",
      "Executive-level discussions",
      "Dedicated partnership framework review",
    ],
    audience: ["Corporate partners", "Bank reps", "Service providers", "Institutional partners"],
    tags: ["Partnership", "B2B", "Corporate", "Quarterly"],
    photos: ["Partner networking"],
    videos: ["Partner testimonials"],
    faqs: [
      {
        question: "How do we become a partner?",
        answer:
          "Reach out to partnerships@foundersconnect.com. We evaluate fit based on founder value alignment.",
      },
    ],
  },
];

export const getEventBySlug = (slug: string) => events.find((event) => event.slug === slug);
