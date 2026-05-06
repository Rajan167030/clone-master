import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JoinUsSection from "@/components/JoinUsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";

const About = () => {
  // SEO Hook
  useSEO({
    title: "About Founders Connect",
    description: "Learn about Founders Connect - India's most valuable founder network connecting builders, founders, and investors with intent. Discover our mission and events.",
    keywords: "about founders connect, founder network, startup ecosystem, investor network India",
    ogType: "website",
    canonicalUrl: "https://founders.connect/about",
  });
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative pt-24 pb-16">
        <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full bg-blob" />
        <div className="pointer-events-none absolute right-0 top-32 h-80 w-80 rounded-full bg-blob" />

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">About Founders Connect</p>
            <h1 className="font-heading text-4xl font-extrabold leading-tight md:text-6xl">
              Building India&apos;s most valuable founder network.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Founders Connect is a curated ecosystem where founders, builders, and investors meet with intent, not noise.
              We design high-signal events and membership experiences that help startups grow faster.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="card-gradient shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Enable founders to access the right people, practical insights, and growth opportunities at every stage.
              </CardContent>
            </Card>

            <Card className="card-gradient shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">What We Run</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Founder meetups, investor networking nights, and members-only sessions focused on execution and outcomes.
              </CardContent>
            </Card>

            <Card className="card-gradient shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Who It&apos;s For</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Startup founders, co-founders, and serious builders looking for real conversations and quality connections.
              </CardContent>
            </Card>
          </div>

          <JoinUsSection showSocial={true} />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
