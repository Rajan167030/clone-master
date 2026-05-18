import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { gsap } from "gsap";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/useSEO";
import Ballpit from "@/components/Ballpit";

const ProductPage = () => {
  const navigate = useNavigate();
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
          {/* Back Button */}
          <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-4 text-left pt-10">
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-100 backdrop-blur-md shadow-md transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-95"
            >
              <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
              Go Back
            </button>
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <div className="mx-auto max-w-2xl gsap-header">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                A new way to build is coming
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                We're putting the finishing touches on our next big thing. Join our early access list to be notified when we launch and get exclusive early access.
              </p>
            </div>
            <div className="relative mx-auto mt-10 max-w-lg gsap-form">
              {/* Ultra-subtle luxury ambient glow behind the input */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-25 blur-xl pointer-events-none" />

              <form 
                onSubmit={handleSubmit} 
                className="relative flex items-center p-1.5 rounded-full border border-white/12 bg-black/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus-within:border-purple-500/40 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all duration-300"
              >
                {/* Sleek Mail SVG Icon */}
                <div className="pl-4 text-white/35 shrink-0 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>

                {/* Blended Borderless Input */}
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full bg-transparent border-0 text-white placeholder-white/35 pl-3 pr-2 focus:ring-0 focus:outline-none text-base outline-none"
                  aria-label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {/* Nested Premium White Pill Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="shrink-0 h-11 px-6 rounded-full bg-white text-black font-semibold hover:bg-white/92 active:scale-95 transition-all duration-200 shadow-[0_4px_12px_rgba(255,255,255,0.25)] flex items-center justify-center gap-1.5 text-sm"
                >
                  {loading ? "Adding..." : "Get Access"}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 mt-[1px]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </form>
              
              {message && (
                <p className="mt-4 text-sm font-semibold animate-fade-in text-purple-400">
                  {message}
                </p>
              )}
            </div>

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
