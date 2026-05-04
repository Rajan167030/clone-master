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
];

export const getEventBySlug = (slug: string) => events.find((event) => event.slug === slug);
