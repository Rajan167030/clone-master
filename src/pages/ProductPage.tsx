import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/useSEO";
import Ballpit from "@/components/Ballpit";

const ProductPage = () => {
  useSEO({
    title: "Our Product | Coming Soon",
    description: "We're building something amazing. Sign up for early access and be the first to know when we launch.",
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
      );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage("");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const res = await fetch(`${API_URL}/api/early-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("🎉 You're on the list! Check your email.");
        setEmail("");
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const waitlistUsers = [
    { imgUrl: 'https://avatars.githubusercontent.com/u/111780029' },
    { imgUrl: 'https://avatars.githubusercontent.com/u/123104247' },
    { imgUrl: 'https://avatars.githubusercontent.com/u/115650165' },
    { imgUrl: 'https://avatars.githubusercontent.com/u/71373838' },
  ];

  return (
    <div className="relative min-h-screen font-body text-foreground" ref={containerRef}>
      {/* Fixed Background Layer */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-background to-secondary/20" />
      <div className="fixed inset-0 -z-10" style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
        <Ballpit
          count={100}
          gravity={0.01}
          friction={0.9975}
          wallBounce={0.95}
          followCursor={true}
          colors={[0x3b82f6, 0x8b5cf6, 0xec4899]}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center pt-10">
            <div className="mx-auto max-w-2xl gsap-header">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                A new way to build is coming
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                We're putting the finishing touches on our next big thing. Join our early access list to be notified when we launch and get exclusive early access.
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="mt-10 mx-auto max-w-md flex flex-col sm:flex-row gap-4 gsap-form relative"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-grow text-center sm:text-left bg-background/80 backdrop-blur-sm"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[140px]" disabled={loading}>
                {loading ? "Sending..." : "Get Early Access"}
              </Button>
            </form>
            {message && (
              <p className="mt-4 text-sm font-medium animate-fade-in text-primary gsap-form">
                {message}
              </p>
            )}

            {/* Waitlist Avatars */}
            <div className="mt-10 flex items-center justify-center gap-3 gsap-form bg-background/30 backdrop-blur-md w-fit mx-auto px-5 py-2.5 rounded-full border border-border/50 shadow-sm">
              <div className="flex -space-x-3 overflow-hidden">
                {waitlistUsers.map((user, i) => (
                  <img
                    key={i}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover bg-secondary"
                    src={user.imgUrl}
                    alt="User avatar"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">
                Join <span className="font-bold text-primary">500+ founders</span> already on the waitlist
              </span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default ProductPage;
