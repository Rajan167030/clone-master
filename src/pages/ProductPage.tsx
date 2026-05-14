import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Rocket, Zap, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/useSEO";

const ProductPage = () => {
  useSEO({
    title: "Our Product | Coming Soon",
    description: "We're building something amazing. Sign up for early access and be the first to know when we launch.",
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1 }
    )
      .fromTo(
        ".gsap-header",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.5"
      )
      .fromTo(
        ".gsap-form",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        "-=0.6"
      )
      .fromTo(
        ".gsap-feature",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.2 },
        "-=0.5"
      );
  }, []);

  const features = [
    {
      icon: <Rocket className="h-8 w-8 text-primary" />,
      title: "Innovative Features",
      description: "Discover tools that will revolutionize your workflow and boost productivity.",
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Blazing Fast Performance",
      description: "Experience a seamless and responsive interface designed for speed.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Community Focused",
      description: "Connect with other users and share your creations in a vibrant community.",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-body text-foreground" ref={containerRef}>
      <Navbar />
      <main className="py-20 sm:py-24">
        <div className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-secondary/20" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <div className="mx-auto max-w-2xl gsap-header">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                A new way to build is coming
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                We're putting the finishing touches on our next big thing. Join our mailing list to be notified when we launch and get exclusive early access.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-10 mx-auto max-w-md flex flex-col sm:flex-row gap-4 gsap-form"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-grow text-center sm:text-left"
                aria-label="Email address"
                required
              />
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Notify Me
              </Button>
            </form>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-20 sm:mt-24">
          <div className="mx-auto max-w-2xl lg:max-w-none text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              What to expect
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center gsap-feature">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    {feature.icon}
                  </div>
                  <h3 className="mt-6 font-heading text-xl font-semibold leading-7 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage;
