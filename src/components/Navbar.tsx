import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, LayoutDashboard, LogOut } from "lucide-react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { clearSession, getAccount, isAuthenticated } from "@/lib/session";

type NavCardLink = {
  label: string;
  href: string;
  ariaLabel: string;
};

type NavCardItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: NavCardLink[];
};

const navCards: NavCardItem[] = [
  {
    label: "About",
    bgColor: "#F8FAFC",
    textColor: "#0F172A",
    links: [
      { label: "Company", href: "/about", ariaLabel: "About Company" },
      { label: "Events", href: "/events", ariaLabel: "About Events" },
      { label: "Blog", href: "/blog", ariaLabel: "Blog" },
    ],
  },
  {
    label: "Explore",
    bgColor: "#EEF2FF",
    textColor: "#0F172A",
    links: [
      { label: "Speakers & Investors", href: "/past-speakers-investors", ariaLabel: "Past Speakers and Investors" },
    
      { label: "College Partners", href: "/college-partners", ariaLabel: "College Partners" },
         { label: "Membership", href: "/membership", ariaLabel: "Membership" },
],
  },
  {
    label: "Connect",
    bgColor: "#F1F5F9",
    textColor: "#0F172A",
    links: [
      { label: "Partner With Us", href: "/partner-with-us", ariaLabel: "Partner With Us" },
      { label: "Join Us", href: "/join-us", ariaLabel: "Join Us" },
      { label: "Get Funding", href: "/get-funding", ariaLabel: "Get Funding" },
      
    ],
  },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const authed = isAuthenticated();
  const account = getAccount();
  const isAdmin = account?.role === "admin";

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 72, overflow: "visible" });
    gsap.set(contentRef.current, { opacity: 0, y: -8, pointerEvents: "none" });
    gsap.set(cardsRef.current, { y: 20, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(
      contentRef.current,
      { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.25, ease: "power2.out" },
      0,
    );
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.35, ease: "power3.out", stagger: 0.08 }, "-=0.2");

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsHamburgerOpen(false);
    tlRef.current?.reverse(0);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;

    // Re-create timeline on open to ensure animations work
    tlRef.current?.kill();
    tlRef.current = createTimeline();
    tlRef.current?.play(0);

    const handleResize = () => {
      // Just maintain the overlay position
      if (contentRef.current) {
        gsap.set(contentRef.current, { opacity: 1, y: 0 });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;

    if (!isOpen) {
      setIsOpen(true);
      setIsHamburgerOpen(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback("onReverseComplete", () => setIsOpen(false));
      tl.reverse();
    }
  };

  const setCardRef = (index: number) => (el: HTMLDivElement | null) => {
    cardsRef.current[index] = el;
  };

  const topButtonLabel = authed ? (isAdmin ? "Admin Panel" : "Dashboard") : "Login";
  const topButtonTo = authed ? (isAdmin ? "/admin" : "/dashboard") : "/login";

  return (
    <div className="fixed left-0 right-0 top-0 z-50 px-3 pt-4 sm:px-4 sm:pt-8">
      <nav
        ref={navRef}
        className="mx-auto w-full max-w-[920px] rounded-[14px] sm:rounded-[18px] border border-white/20 bg-white/90 shadow-[0_14px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl"
      >
        <div className="relative flex h-16 sm:h-[72px] items-center justify-between px-3 sm:px-4 md:px-5 gap-2">
          <button
            type="button"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-slate-800 transition-colors hover:bg-slate-100 flex-shrink-0"
            onClick={toggleMenu}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            <div className="flex flex-col items-center justify-center gap-1.5">
              <span className={`h-0.5 w-5 sm:w-6 rounded-full bg-current transition-transform duration-300 ${isHamburgerOpen ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`h-0.5 w-5 sm:w-6 rounded-full bg-current transition-transform duration-300 ${isHamburgerOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </div>
          </button>

          <Link
            to={authed ? "/dashboard" : "/"}
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 hidden sm:flex"
          >
            <span className="rounded-full bg-purple-700 px-3 py-1 text-xs sm:text-sm font-semibold tracking-wide text-white whitespace-nowrap">
              Founders Connect
            </span>
          </Link>

          <Button asChild className="h-9 sm:h-10 rounded-lg sm:rounded-xl bg-purple-600 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-white hover:bg-purple-700 transition-colors flex-shrink-0">
            <Link to={topButtonTo}>{topButtonLabel}</Link>
          </Button>
        </div>

        <div
          ref={contentRef}
          className="pointer-events-none absolute left-0 right-0 top-full z-40 grid gap-2 px-2 py-2 sm:gap-3 sm:px-3 sm:py-3 grid-cols-1 md:grid-cols-3 md:items-start md:gap-3 md:px-3 md:py-3"
          style={{ background: "transparent" }}
          aria-hidden={!isOpen}
        >
          {navCards.map((item, index) => (
            <div
              key={item.label}
              ref={setCardRef(index)}
              className="relative min-h-[120px] sm:min-h-[140px] rounded-[14px] sm:rounded-[18px] p-3 sm:p-4 shadow-lg transition-transform duration-300 hover:-translate-y-1"
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="text-lg sm:text-[22px] font-medium tracking-[-0.04em]">{item.label}</div>
              <div className="mt-3 sm:mt-4 flex flex-col gap-1.5 sm:gap-2">
                {item.links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    aria-label={link.ariaLabel}
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      setIsOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 sm:gap-2 text-sm sm:text-[15px] transition-opacity hover:opacity-75"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {authed && isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 flex items-center justify-between border-t border-slate-200 px-3 py-2 sm:px-4 sm:py-3 text-xs text-slate-500 md:hidden bg-white/90 rounded-b-[14px] sm:rounded-b-[18px]">
            <span className="truncate mr-2">Signed in as {account?.fullName || account?.email || "Member"}</span>
            <button type="button" className="inline-flex items-center gap-1 text-slate-700 flex-shrink-0 hover:text-purple-600 transition-colors" onClick={handleLogout}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </nav>

      {isOpen && <button type="button" className="fixed inset-0 -z-10 cursor-default bg-black/5" aria-label="Close menu overlay" onClick={toggleMenu} />}
    </div>
  );
};

export default Navbar;
