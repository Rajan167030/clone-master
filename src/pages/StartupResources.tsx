import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import {
  FileText,
  Download,
  BookOpen,
  DollarSign,
  Briefcase,
  Compass,
  ArrowRight,
  ExternalLink,
  Search,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

type ResourceCategory = "All" | "Fundraising" | "Legal & Compliance" | "Growth & Marketing" | "Templates & Tools";

interface ResourceItem {
  id: string;
  title: string;
  category: "Fundraising" | "Legal & Compliance" | "Growth & Marketing" | "Templates & Tools";
  description: string;
  format: "PDF Guide" | "Notion Doc" | "Spreadsheet" | "Checklist";
  downloads: string;
  isPopular?: boolean;
  linkText: string;
  href: string;
}

const resources: ResourceItem[] = [
  {
    id: "1",
    title: "Seed Stage Pitch Deck Template",
    category: "Fundraising",
    description: "Battle-tested 12-slide template used by 45+ portfolio startups to raise pre-seed and seed rounds.",
    format: "PDF Guide",
    downloads: "2.4k+ founders",
    isPopular: true,
    linkText: "Download Deck",
    href: "/get-funding",
  },
  {
    id: "2",
    title: "Startup Incorporation & Equity Split Guide",
    category: "Legal & Compliance",
    description: "Step-by-step checklist on Indian Pvt Ltd registration, founder vesting, and IP assignment contracts.",
    format: "Checklist",
    downloads: "1.8k+ founders",
    linkText: "View Checklist",
    href: "#",
  },
  {
    id: "3",
    title: "Cap Table & Dilution Calculator Model",
    category: "Fundraising",
    description: "Interactive financial model mapping out pre/post money valuation, SAFE notes, and option pools.",
    format: "Spreadsheet",
    downloads: "3.1k+ founders",
    isPopular: true,
    linkText: "Get Spreadsheet",
    href: "#",
  },
  {
    id: "4",
    title: "Early-Stage GTM & B2B Sales Playbook",
    category: "Growth & Marketing",
    description: "Proven frameworks to identify ICP, outbound cold email scripts, and convert first 10 enterprise pilots.",
    format: "Notion Doc",
    downloads: "1.2k+ founders",
    linkText: "Read Playbook",
    href: "#",
  },
  {
    id: "5",
    title: "Term Sheet Breakdown & Negotiation Bible",
    category: "Fundraising",
    description: "Detailed breakdown of liquidation preferences, board control, drag-along, and protective provisions.",
    format: "PDF Guide",
    downloads: "2.9k+ founders",
    isPopular: true,
    linkText: "Read Guide",
    href: "/get-funding",
  },
  {
    id: "6",
    title: "Hiring Scorecard & Tech Interview Framework",
    category: "Templates & Tools",
    description: "Standardized evaluation metrics for engineering, product, and growth roles in early-stage startups.",
    format: "Spreadsheet",
    downloads: "950+ founders",
    linkText: "Get Templates",
    href: "#",
  },
  {
    id: "7",
    title: "Government Grants & Startup India Exemption Checklist",
    category: "Legal & Compliance",
    description: "Comprehensive guide to Section 80-IAC tax exemptions, DPIIT certification, and SISFS grants.",
    format: "Checklist",
    downloads: "1.5k+ founders",
    linkText: "View Guide",
    href: "/get-funding",
  },
  {
    id: "8",
    title: "Product-Market Fit Validation Framework",
    category: "Growth & Marketing",
    description: "Qualitative & quantitative benchmarks, customer interview questions, and Sean Ellis PMF survey kit.",
    format: "Notion Doc",
    downloads: "1.7k+ founders",
    linkText: "Read Framework",
    href: "#",
  },
];

const categories: ResourceCategory[] = [
  "All",
  "Fundraising",
  "Legal & Compliance",
  "Growth & Marketing",
  "Templates & Tools",
];

const StartupResources = () => {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useSEO({
    title: "Startup Resources & Founder Toolkits | Founders Connect",
    description: "Free founder playbooks, pitch deck templates, cap table calculators, term sheet guides, and legal frameworks curated by Founders Connect.",
    keywords: "startup resources, pitch deck template, cap table spreadsheet, term sheet guide, founder playbook",
    ogType: "website",
    canonicalUrl: "https://founders.connect/startup-resources",
  });

  const filteredResources = resources.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#FAF7F0] bg-[radial-gradient(circle,#EFE9D8_1px,transparent_1px)] bg-[length:22px_22px] pt-8 pb-16 md:pt-12 md:pb-20 border-b border-[#1B1B1F]/10">
        <div className="container mx-auto px-4">
          <BackButton className="px-0 mx-0 max-w-none mb-6 animate-reveal-left" />

          <div className="max-w-3xl mx-auto text-center">
            <p className="mb-3 inline-flex items-center gap-2 font-['IBM_Plex_Mono'] text-xs font-semibold uppercase tracking-[0.22em] text-[#6B8F71]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#6B8F71]" />
              Founders Connect Library
            </p>
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1B1B1F]">
              Curated Resources to <span className="text-[#E4572E]">Accelerate</span> Your Journey
            </h1>
            <p className="mt-4 text-base md:text-lg text-[#6B6558] max-w-2xl mx-auto leading-relaxed">
              Access field-tested templates, legal checklists, cap table models, and growth frameworks used by top founders across India.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur rounded-lg border border-[#1B1B1F]/10 p-4 text-center shadow-sm">
              <div className="text-2xl md:text-3xl font-extrabold text-[#1B1B1F]">50+</div>
              <div className="text-xs text-[#6B6558] uppercase font-mono mt-1">Founder Toolkits</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-lg border border-[#1B1B1F]/10 p-4 text-center shadow-sm">
              <div className="text-2xl md:text-3xl font-extrabold text-[#E4572E]">₹250Cr+</div>
              <div className="text-xs text-[#6B6558] uppercase font-mono mt-1">Capital Raised</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-lg border border-[#1B1B1F]/10 p-4 text-center shadow-sm">
              <div className="text-2xl md:text-3xl font-extrabold text-[#6B8F71]">15k+</div>
              <div className="text-xs text-[#6B6558] uppercase font-mono mt-1">Downloads</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-lg border border-[#1B1B1F]/10 p-4 text-center shadow-sm">
              <div className="text-2xl md:text-3xl font-extrabold text-purple-600">100%</div>
              <div className="text-xs text-[#6B6558] uppercase font-mono mt-1">Free & Open</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Content Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Search and Categories */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-[#1B1B1F] text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-full border border-slate-200 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            {/* Resource Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((item) => (
                <Card
                  key={item.id}
                  className="flex flex-col justify-between border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all rounded-xl overflow-hidden group bg-white"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200">
                        {item.category}
                      </Badge>
                      {item.isPopular && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Sparkles size={12} /> Popular
                        </span>
                      )}
                    </div>

                    <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono bg-purple-50 text-purple-700 px-2 py-1 rounded">
                        {item.format}
                      </span>
                      <span>{item.downloads}</span>
                    </div>
                  </CardContent>

                  <div className="px-6 pb-6 pt-0">
                    <Button
                      asChild
                      className="w-full bg-slate-900 hover:bg-purple-600 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Link to={item.href}>
                        <Download size={14} />
                        {item.linkText}
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="mx-auto text-slate-300 mb-3" size={48} />
                <h3 className="text-lg font-bold text-slate-700">No resources found</h3>
                <p className="text-sm text-slate-500 mt-1">Try refining your search or selecting another category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Resource Request / Submit CTA */}
      <section className="py-16 bg-[#FAF7F0] border-t border-slate-200">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Badge className="mb-3 bg-purple-100 text-purple-700 border-none px-3 py-1 text-xs">
            Founder Community
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">
            Need a Specific Template or Playbook?
          </h2>
          <p className="mt-3 text-slate-600 text-sm md:text-base">
            Our network of seasoned founders and venture partners regularly publishes open-source playbooks. Tell us what you need or submit your own.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Button asChild className="btn-metallic btn-metallic-purple text-white px-6">
              <Link to="/contact-us">
                Request a Resource <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-300 hover:bg-white">
              <Link to="/get-funding">
                Explore Funding Programs
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StartupResources;
