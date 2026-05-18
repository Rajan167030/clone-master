import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ShieldCheck, Zap } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const SparklesCore = ({
  id = "sparkles",
  background = "transparent",
  particleDensity = 120,
  className = "",
}: {
  id?: string;
  background?: string;
  particleDensity?: number;
  className?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      fadeSpeed: number;
    }> = [];

    // Generate particles
    for (let i = 0; i < particleDensity; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        speedY: -(Math.random() * 0.15 + 0.05),
        speedX: (Math.random() * 0.08 - 0.04),
        opacity: Math.random(),
        fadeSpeed: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();

        p.y += p.speedY;
        p.x += p.speedX;

        p.opacity += p.fadeSpeed;
        if (p.opacity > 1 || p.opacity < 0) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0 || p.x > width) {
          p.x = Math.random() * width;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleDensity]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      style={{ background }}
      className={className}
    />
  );
};

const JoinUsSection = ({ showSocial = true, className }: { showSocial?: boolean, className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSocial) return;

    const ctx = gsap.context(() => {
      gsap.to(".reveal-word-join", {
        y: "0%",
        opacity: 1,
        rotate: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.06,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [showSocial]);

  if (!showSocial) return null;

  const headingText = "founders community";
  const headingWords = headingText.split(" ");

  return (
    <section ref={containerRef} className={`relative py-4 md:py-6 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-[1100px] rounded-[36px] border border-white/10 bg-black px-5 py-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.45)] md:px-10 md:py-12 relative overflow-hidden">
          
          {/* Background Horizon Curve, Purple Backglow & Sparkles Core */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none [mask-image:radial-gradient(50%_50%,white,transparent)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#a855f7,transparent_70%)] before:opacity-60 after:absolute after:top-[50%] after:-left-[25%] after:aspect-[1/0.8] after:w-[150%] after:rounded-[100%] after:border-t-2 after:border-purple-500/80 after:bg-[#0a0a0a] after:shadow-[0_-8px_40px_-5px_rgba(168,85,247,0.45)]">
            <SparklesCore
              id="tsparticles"
              background="transparent"
              particleDensity={140}
              className="absolute inset-x-0 bottom-0 h-full w-full opacity-60 [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
            />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/55">
              Join Our Community
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.3rem] lg:leading-[0.95] flex flex-wrap justify-center gap-x-3 overflow-hidden py-2 capitalize">
              {headingWords.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden pb-2">
                  <span className="reveal-word-join inline-block translate-y-[110%] opacity-0 rotate-[4deg] transition-transform duration-75">
                    {word}
                  </span>
                </span>
              ))}
            </h2>
          

            <div className="mt-8 flex justify-center">
              <Link
                to="/join-us"
                className="inline-flex items-center gap-3 rounded-full bg-white px-9 py-4 text-lg font-medium text-black shadow-[0_10px_30px_rgba(255,255,255,0.18)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(255,255,255,0.24)]"
              >
                Join us
                <span aria-hidden="true" className="text-xl leading-none">
                  →
                </span>
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-5 text-sm text-white/85 md:gap-8">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={18} className="text-white/85" />
                Secure & Reliable
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={18} className="text-white/85" />
                Regular Updates
              </span>
              <span className="inline-flex items-center gap-2">
                <Zap size={18} className="text-white/85" />
                Lightning Fast
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinUsSection;
