import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventLocationVisualizer from "@/components/EventLocationVisualizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { setSession } from "@/lib/session";
import PitchDeckViewerModal from "@/components/PitchDeckViewerModal";
import {
  Star,
  Building2,
  FileText,
  UserCheck,
  Layers,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Search,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  Trophy,
  Phone,
  Mail,
} from "lucide-react";
import {
  ActivityStartupItem,
  ActivityInvestorProfile,
  RatingScores,
  getBangaloreStartupsApi,
  saveBangaloreStartupApi,
  submitStartupRatingApi,
  saveInvestorProfileApi,
  getSavedInvestorProfileLocal,
  getPublicCloudinaryUploadSignatureApi,
} from "@/lib/api";

const PROMO_CODES = {
  STARTUP: "startup20",
  INVESTOR: "investor20",
};

const SECTORS = [
  "All",
  "AI & DeepTech",
  "FinTech",
  "HealthTech & AI",
  "CleanTech & EV",
  "SaaS & B2B",
  "EdTech",
  "Consumer & E-Commerce",
];

// Shared "form document" styling — matches the brand's ticket/registration-form look
// used elsewhere on the site (InvestorDetailsForm, RegisterInvestor).
const FORM_LABEL_CLASS = "block font-mono text-xs font-bold uppercase tracking-wider text-[#0B0B09]";
const FORM_INPUT_CLASS =
  "w-full border-[1.5px] border-[#0B0B09] rounded-none bg-white px-3.5 py-3 font-sans text-sm text-[#0B0B09] placeholder:text-[#6B6558]/60 focus:outline-none focus:ring-0 focus:border-[#0B0B09] focus:shadow-[3px_3px_0px_#4C1D95] transition-all";

const BangaloreActivity: React.FC = () => {
  const { toast } = useToast();

  // Selected Role: null | "startup" | "investor"
  const [selectedRole, setSelectedRole] = useState<"startup" | "investor" | null>(null);

  // Promo code gate state
  const [promoInput, setPromoInput] = useState("");
  const [isPromoVerified, setIsPromoVerified] = useState(false);
  const [promoError, setPromoError] = useState("");

  // Startups & Leaderboard state
  const [startups, setStartups] = useState<ActivityStartupItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");

  // Investor state
  const [investorProfile, setInvestorProfile] = useState<ActivityInvestorProfile | null>(null);

  // Bumped after a registration grants a session, forcing the Navbar to remount and
  // pick up the new session immediately (it only reads localStorage at mount time).
  const [navbarSessionKey, setNavbarSessionKey] = useState(0);

  // Startup Founder Form state
  const [founderName, setFounderName] = useState("");
  const [founderEmail, setFounderEmail] = useState("");
  const [founderPhone, setFounderPhone] = useState("");
  const [startupName, setStartupName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("AI & DeepTech");
  const [stage, setStage] = useState("Seed");
  const [pitchDeckUrl, setPitchDeckUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isStartupSubmitted, setIsStartupSubmitted] = useState(false);
  const [founderAccessToken, setFounderAccessToken] = useState<string | null>(null);

  // Investor Form state
  const [invFullName, setInvFullName] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invPhone, setInvPhone] = useState("");
  const [invFirmName, setInvFirmName] = useState("");
  const [invDesignation, setInvDesignation] = useState("");
  const [invSectors, setInvSectors] = useState("AI, FinTech, SaaS");
  const [invTicketSize, setInvTicketSize] = useState("$25k - $100k");
  const [invLinkedin, setInvLinkedin] = useState("");
  const [invBio, setInvBio] = useState("");
  const [invPhotoUrl, setInvPhotoUrl] = useState("");

  // Rating Modal state
  const [ratingTargetStartup, setRatingTargetStartup] = useState<ActivityStartupItem | null>(null);
  const UNRATED_SCORES: RatingScores = {
    innovation: 0,
    market: 0,
    traction: 0,
    team: 0,
    pitch: 0,
  };
  const [ratingScores, setRatingScores] = useState<RatingScores>(UNRATED_SCORES);
  const [ratingComment, setRatingComment] = useState("");

  // Pitch Deck Viewer Modal state
  const [viewStartupProfile, setViewStartupProfile] = useState<ActivityStartupItem | null>(null);
  const [viewDeckStartup, setViewDeckStartup] = useState<ActivityStartupItem | null>(null);

  // Loading state for initial fetch
  const [isLoadingStartups, setIsLoadingStartups] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Upload progress states
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingDeck, setIsUploadingDeck] = useState(false);
  const [isUploadingInvestorPhoto, setIsUploadingInvestorPhoto] = useState(false);

  // Show newest registrations first — ranking is not pre-decided for visitors.
  const sortStartups = (items: ActivityStartupItem[]) => {
    return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Function to refresh live startups from API
  const refreshLiveStartups = async (showLoader = false) => {
    if (showLoader) setIsLoadingStartups(true);
    const freshStartups = await getBangaloreStartupsApi();
    setStartups(sortStartups(freshStartups));
    setLastSyncTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    setIsLoadingStartups(false);
  };

  // Load stored data on mount & start 4s live polling
  useEffect(() => {
    void refreshLiveStartups(true);

    const savedInvestor = getSavedInvestorProfileLocal();
    if (savedInvestor) {
      setInvestorProfile(savedInvestor);
    }

    // Live polling every 4 seconds for real-time updates during live event
    const interval = setInterval(() => {
      void refreshLiveStartups(false);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Handle Promo Code submission
  const handleVerifyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");

    const cleanInput = promoInput.trim().toLowerCase();

    if (selectedRole === "startup") {
      if (cleanInput === PROMO_CODES.STARTUP) {
        setIsPromoVerified(true);
        toast({
          title: "Promo Code Verified! 🎉",
          description: "Access granted to Startup Registration Form for Bangalore Event.",
        });
      } else {
        setPromoError("Invalid Promo Code! Only 'startup20' is allowed for Startups.");
        toast({
          variant: "destructive",
          title: "Invalid Promo Code",
          description: "Please enter 'startup20' to proceed as a Startup Founder.",
        });
      }
    } else if (selectedRole === "investor") {
      if (cleanInput === PROMO_CODES.INVESTOR) {
        setIsPromoVerified(true);
        toast({
          title: "Promo Code Verified! 💼",
          description: "Access granted! Please complete your Investor Profile.",
        });
      } else {
        setPromoError("Invalid Promo Code! Only 'investor20' is allowed for Investors.");
        toast({
          variant: "destructive",
          title: "Invalid Promo Code",
          description: "Please enter 'investor20' to proceed as an Investor.",
        });
      }
    }
  };

  // Submit Startup Form
  const handleStartupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!founderName || !founderEmail || !startupName || !tagline || !description) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    const defaultLogo = logoUrl.trim() || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80";
    const defaultDeck = pitchDeckUrl.trim() || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

    const savedStartup = await saveBangaloreStartupApi({
      founderName,
      founderEmail,
      founderPhone,
      startupName,
      tagline,
      description,
      category,
      stage,
      location: "Bangalore",
      logoUrl: defaultLogo,
      pitchDeckUrl: defaultDeck,
    });

    if (savedStartup.accessToken) {
      setFounderAccessToken(savedStartup.accessToken);
      localStorage.setItem(`fc_sais26_founder_access_${savedStartup.id}`, savedStartup.accessToken);
    }

    if (savedStartup.token && savedStartup.account) {
      // Full founder access, site-wide — same as logging in.
      setSession(savedStartup.token, savedStartup.account);
      setNavbarSessionKey((n) => n + 1);
    }

    await refreshLiveStartups();
    setIsStartupSubmitted(true);

    toast({
      title: "Startup Registered Successfully! 🚀",
      description: `${startupName} has been submitted for the Bangalore Event Activity Session!`,
    });
  };

  // Submit Investor Profile Form
  const handleInvestorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invFullName || !invEmail || !invFirmName) {
      toast({
        variant: "destructive",
        title: "Missing Required Fields",
        description: "Full Name, Email, and Investment Firm Name are required.",
      });
      return;
    }

    const defaultPhoto = invPhotoUrl.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
    const sectorsArray = invSectors.split(",").map((s) => s.trim()).filter(Boolean);

    const profile = await saveInvestorProfileApi({
      fullName: invFullName,
      email: invEmail,
      phone: invPhone,
      firmName: invFirmName,
      designation: invDesignation || "Investor",
      sectors: sectorsArray,
      ticketSize: invTicketSize,
      linkedin: invLinkedin,
      bio: invBio,
      photoUrl: defaultPhoto,
      promoCodeUsed: PROMO_CODES.INVESTOR,
    });

    setInvestorProfile(profile);

    if (profile.token && profile.account) {
      // Full investor access, site-wide — same as logging in.
      setSession(profile.token, profile.account);
      setNavbarSessionKey((n) => n + 1);
    }

    toast({
      title: "Investor Profile Unlocked! 🔑",
      description: "You now have full access to view, evaluate, and rate Bangalore Event Startups.",
    });
  };

  // Submit Rating for a Startup
  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ratingTargetStartup || !investorProfile) {
      toast({
        variant: "destructive",
        title: "Action Required",
        description: "You must be logged in as a verified investor to submit ratings.",
      });
      return;
    }

    const hasUnratedCriteria = Object.values(ratingScores).some((score) => score < 1);
    if (hasUnratedCriteria) {
      toast({
        variant: "destructive",
        title: "Rate every criterion",
        description: "Please give at least 1 star on all 5 criteria before submitting.",
      });
      return;
    }

    const updatedList = await submitStartupRatingApi(
      ratingTargetStartup.id,
      investorProfile,
      ratingScores,
      ratingComment
    );

    setStartups(sortStartups(updatedList));
    setRatingTargetStartup(null);
    setRatingComment("");

    toast({
      title: "Rating Submitted! ⭐",
      description: `Your evaluation for ${ratingTargetStartup.startupName} has been recorded on the Leaderboard!`,
    });
  };

  // Real Cloudinary upload handler
  const handleCloudinaryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFn: (val: string) => void,
    setUploading: (v: boolean) => void,
    folder: string,
    resourceType: "image" | "auto" = "image"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const signature = await getPublicCloudinaryUploadSignatureApi({
        folder,
        resourceType,
      });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signature.apiKey);
      formData.append("timestamp", String(signature.timestamp));
      formData.append("signature", signature.signature);
      formData.append("folder", signature.folder);
      formData.append("resource_type", resourceType);
      if (signature.publicId) formData.append("public_id", signature.publicId);

      const uploadRes = await fetch(signature.uploadUrl, { method: "POST", body: formData });
      const uploadData = (await uploadRes.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };

      if (!uploadRes.ok || !uploadData.secure_url) {
        throw new Error(uploadData.error?.message || "Upload failed.");
      }
      setFn(uploadData.secure_url);
      toast({ title: "Upload Successful! ✅", description: `${file.name} uploaded successfully.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      toast({ variant: "destructive", title: "Upload Failed", description: msg });
    } finally {
      setUploading(false);
    }
  };

  // Filter startups by search and sector
  const filteredStartups = startups.filter((s) => {
    const matchesSearch =
      s.startupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.founderName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSector =
      selectedSector === "All" || s.category.toLowerCase().includes(selectedSector.toLowerCase());

    return matchesSearch && matchesSector;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar key={navbarSessionKey} />

      {/* Hero Header Banner — image shown in full inside a bordered rectangular frame, nothing cropped off */}
      <section className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto relative rounded-none border-2 border-[#0B0B09] bg-slate-950 overflow-hidden aspect-[4/3] sm:aspect-[21/9] shadow-[6px_6px_0px_#0B0B09]">
          <img
            src="https://res.cloudinary.com/dbgsxczyi/image/upload/f_auto,q_auto,w_1200/v1786221218/founders-connect/events/hlgcvpxdhuu9bdaerg1c.jpg"
            srcSet="
              https://res.cloudinary.com/dbgsxczyi/image/upload/f_auto,q_auto,w_640/v1786221218/founders-connect/events/hlgcvpxdhuu9bdaerg1c.jpg 640w,
              https://res.cloudinary.com/dbgsxczyi/image/upload/f_auto,q_auto,w_828/v1786221218/founders-connect/events/hlgcvpxdhuu9bdaerg1c.jpg 828w,
              https://res.cloudinary.com/dbgsxczyi/image/upload/f_auto,q_auto,w_1200/v1786221218/founders-connect/events/hlgcvpxdhuu9bdaerg1c.jpg 1200w,
              https://res.cloudinary.com/dbgsxczyi/image/upload/f_auto,q_auto,w_1920/v1786221218/founders-connect/events/hlgcvpxdhuu9bdaerg1c.jpg 1920w
            "
            sizes="(max-width: 1280px) 100vw, 1280px"
            alt="Startup & Investors Summit, Bangalore"
            className="absolute inset-0 h-full w-full object-contain"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent pointer-events-none"></div>

          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8 text-white">
            <div className="max-w-3xl space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white text-xs sm:text-sm font-semibold tracking-wide uppercase w-fit">
                <MapPin className="w-4 h-4 text-purple-300" />
                Bangalore Event Special Activity
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">

        {/* Event Venue & Startup Registration — one combined section */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6 items-stretch">
          <div className={selectedRole ? "lg:col-span-5" : "lg:col-span-3"}>
            <EventLocationVisualizer
              locationLabel="https://maps.app.goo.gl/G7QZT98YNpR6CGQg6"
              eventTitle="Startup & Investors summit-2026"
            />
          </div>

          {!selectedRole && (
            <div className="lg:col-span-2 flex flex-col">
              {/* Startup Founder — form-card in the site's ticket/document style */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedRole("startup");
                  setIsPromoVerified(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedRole("startup");
                    setIsPromoVerified(true);
                  }
                }}
                className="group cursor-pointer flex-1 flex flex-col border-2 border-[#0B0B09] bg-[#FBFAF5] rounded-none shadow-[6px_6px_0px_#0B0B09] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_#0B0B09] active:translate-x-0 active:translate-y-0 active:shadow-[6px_6px_0px_#0B0B09] transition-all duration-200 ease-out overflow-hidden"
              >
                {/* Header Strip */}
                <div className="flex items-center justify-between border-b-2 border-[#0B0B09] bg-[#FBFAF5] px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-[#0B0B09]">
                  <span className="font-bold">Form No. FC/BLR-2026</span>
                  <span className="bg-[#0B0B09] text-white px-2 py-0.5 font-bold">For Founders</span>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="w-14 h-14 border-2 border-[#0B0B09] bg-purple-50 text-[#4C1D95] flex items-center justify-center mb-4">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <h2 className="font-heading text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#0B0B09]">
                    Register Your Startup
                  </h2>
                  <p className="mt-2 text-sm text-[#6B6558] font-sans">
                    For founders participating in the Bangalore Event. Submit your startup details, logo, and pitch deck to get evaluated.
                  </p>

                  <div className="mt-auto pt-5 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-[#4C1D95]">
                    Start Registration
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Step 3: Startup Founder Form & Details */}
        {selectedRole === "startup" && isPromoVerified && (
          <div className="max-w-4xl mx-auto">
            <div className="border-2 border-[#0B0B09] bg-[#FBFAF5] rounded-none shadow-[6px_6px_0px_#0B0B09] overflow-hidden">
              {/* Header Strip */}
              <div className="flex items-center justify-between border-b-2 border-[#0B0B09] bg-[#FBFAF5] px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-[#0B0B09]">
                <span className="font-bold">Form No. FC/BLR-2026</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsPromoVerified(false);
                    setSelectedRole(null);
                  }}
                  className="text-[#6B6558] hover:text-[#0B0B09] font-bold"
                >
                  Cancel
                </button>
              </div>

              {isStartupSubmitted ? (
                <div className="p-6 sm:p-10 flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#4C1D95] to-[#6D28D9] border-2 border-[#0B0B09] text-white shadow-[3px_3px_0px_#0B0B09] mb-4">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="font-heading text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#0B0B09]">
                    Registration Received
                  </h3>
                  <p className="mt-2 text-sm text-[#6B6558] max-w-md font-sans">
                    {startupName || "Your startup"} has been added to the Bangalore Event startup directory.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-5">
                    {founderAccessToken && (
                      <Button asChild className="bg-[#0B0B09] hover:bg-[#0B0B09]/90 text-white rounded-none font-mono text-xs uppercase tracking-wider">
                        <Link to={`/sais26/founder/${founderAccessToken}`}>Your SAIS'26 Dashboard</Link>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="rounded-none border-2 border-[#0B0B09] font-mono text-xs uppercase tracking-wider text-[#0B0B09] hover:bg-[#0B0B09] hover:text-white"
                      onClick={() => {
                        setIsStartupSubmitted(false);
                        setStartupName("");
                      }}
                    >
                      Submit Another Startup
                    </Button>
                  </div>
                  {founderAccessToken && (
                    <p className="text-xs text-[#6B6558] pt-4 font-sans">
                      We've also emailed this private dashboard link to {founderEmail || "you"} — save it, it's how you'll get back in.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-5 sm:p-8">
                  <div className="mb-6">
                    <h2 className="font-heading text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#0B0B09]">
                      Startup Registration
                    </h2>
                    <p className="mt-1.5 text-sm text-[#6B6558] font-sans">
                      Founder details, startup summary, logo, and pitch deck.
                    </p>
                  </div>

                  <form onSubmit={handleStartupSubmit} className="space-y-7">
                    {/* Section 1: Founder Info */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-[#0B0B09]/15 pb-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#0B0B09] text-white font-mono text-[10px] font-bold">1</span>
                        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B0B09]">Founder Information</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className={FORM_LABEL_CLASS}>Full Name <span className="text-[#4C1D95]">*</span></label>
                          <input
                            className={FORM_INPUT_CLASS}
                            placeholder="e.g. Ananya Rao"
                            value={founderName}
                            onChange={(e) => setFounderName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={FORM_LABEL_CLASS}>Email <span className="text-[#4C1D95]">*</span></label>
                          <input
                            type="email"
                            className={FORM_INPUT_CLASS}
                            placeholder="e.g. founder@startup.in"
                            value={founderEmail}
                            onChange={(e) => setFounderEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={FORM_LABEL_CLASS}>Phone <span className="font-normal normal-case text-[#6B6558]">(optional)</span></label>
                          <input
                            className={FORM_INPUT_CLASS}
                            placeholder="+91 98765 43210"
                            value={founderPhone}
                            onChange={(e) => setFounderPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Startup Details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-[#0B0B09]/15 pb-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#0B0B09] text-white font-mono text-[10px] font-bold">2</span>
                        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B0B09]">Startup Overview</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className={FORM_LABEL_CLASS}>Startup Name <span className="text-[#4C1D95]">*</span></label>
                          <input
                            className={FORM_INPUT_CLASS}
                            placeholder="e.g. Bangalore Dynamics"
                            value={startupName}
                            onChange={(e) => setStartupName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={FORM_LABEL_CLASS}>Sector <span className="text-[#4C1D95]">*</span></label>
                          <select
                            className={FORM_INPUT_CLASS}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                          >
                            {SECTORS.filter((s) => s !== "All").map((sec) => (
                              <option key={sec} value={sec}>{sec}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className={FORM_LABEL_CLASS}>Funding Stage</label>
                          <select
                            className={FORM_INPUT_CLASS}
                            value={stage}
                            onChange={(e) => setStage(e.target.value)}
                          >
                            <option value="Pre-Seed">Pre-Seed</option>
                            <option value="Seed">Seed</option>
                            <option value="Series A">Series A</option>
                            <option value="Bootstrapped">Bootstrapped</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className={FORM_LABEL_CLASS}>Elevator Pitch <span className="text-[#4C1D95]">*</span></label>
                        <input
                          className={FORM_INPUT_CLASS}
                          placeholder="e.g. Next-gen autonomous drone logistics built for Indian tier-1 cities."
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={FORM_LABEL_CLASS}>Description <span className="text-[#4C1D95]">*</span></label>
                        <textarea
                          className={`${FORM_INPUT_CLASS} min-h-[90px] resize-y`}
                          placeholder="Describe your product, market opportunity, target audience, and business traction..."
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Section 3: Pitch Deck & Startup Logo */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-[#0B0B09]/15 pb-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#0B0B09] text-white font-mono text-[10px] font-bold">3</span>
                        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B0B09]">Logo &amp; Pitch Deck</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Startup Logo */}
                        <div className="space-y-2 p-4 border-[1.5px] border-[#0B0B09]/20 bg-white">
                          <label className={FORM_LABEL_CLASS}>Logo <span className="text-[#4C1D95]">*</span></label>
                          <input
                            type="url"
                            className={FORM_INPUT_CLASS}
                            placeholder="https://example.com/logo.png"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                          />
                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            <span className="text-xs text-[#6B6558]">or upload:</span>
                            <label className={`inline-flex items-center gap-1.5 cursor-pointer px-3 py-1.5 border-[1.5px] border-[#0B0B09] font-mono text-[11px] font-bold uppercase tracking-wide transition-colors ${
                              isUploadingLogo
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-white text-[#0B0B09] hover:bg-[#0B0B09] hover:text-white"
                            }`}>
                              {isUploadingLogo ? (
                                <><svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Uploading…</>
                              ) : (
                                <><Upload className="w-3 h-3" /> Choose File</>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploadingLogo}
                                onChange={(e) => void handleCloudinaryUpload(e, setLogoUrl, setIsUploadingLogo, "founders-connect/activity-logos", "image")}
                              />
                            </label>
                          </div>

                          {/* Preview Logo */}
                          {logoUrl && (
                            <div className="flex items-center gap-3 mt-2 p-2 bg-[#FBFAF5] border border-[#0B0B09]/15">
                              <img src={logoUrl} alt="Logo Preview" className="w-10 h-10 object-cover border border-[#0B0B09]/20" />
                              <span className="text-xs font-medium text-[#6B6558]">Logo ready</span>
                            </div>
                          )}
                        </div>

                        {/* Pitch Deck */}
                        <div className="space-y-2 p-4 border-[1.5px] border-[#0B0B09]/20 bg-white">
                          <label className={FORM_LABEL_CLASS}>Pitch Deck <span className="text-[#4C1D95]">*</span></label>
                          <input
                            type="url"
                            className={FORM_INPUT_CLASS}
                            placeholder="https://drive.google.com/your-pitch-deck.pdf"
                            value={pitchDeckUrl}
                            onChange={(e) => setPitchDeckUrl(e.target.value)}
                          />
                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            <span className="text-xs text-[#6B6558]">or upload:</span>
                            <label className={`inline-flex items-center gap-1.5 cursor-pointer px-3 py-1.5 border-[1.5px] border-[#0B0B09] font-mono text-[11px] font-bold uppercase tracking-wide transition-colors ${
                              isUploadingDeck
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-white text-[#0B0B09] hover:bg-[#0B0B09] hover:text-white"
                            }`}>
                              {isUploadingDeck ? (
                                <><svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Uploading…</>
                              ) : (
                                <><Upload className="w-3 h-3" /> Choose File</>
                              )}
                              <input
                                type="file"
                                accept=".pdf,.ppt,.pptx"
                                className="hidden"
                                disabled={isUploadingDeck}
                                onChange={(e) => void handleCloudinaryUpload(e, setPitchDeckUrl, setIsUploadingDeck, "founders-connect/activity-decks", "auto")}
                              />
                            </label>
                          </div>
                          {pitchDeckUrl && !pitchDeckUrl.startsWith("data:") && (
                            <p className="text-[11px] text-[#4C1D95] font-medium pt-1">Deck ready</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] text-white font-mono text-sm md:text-base font-bold uppercase tracking-wider border-2 border-[#0B0B09] rounded-none py-3.5 px-6 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0B0B09] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-200 ease-out"
                    >
                      Submit Registration
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Investor Complete Profile Form */}
        {selectedRole === "investor" && isPromoVerified && !investorProfile && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Complete Investor Profile</h2>
                <p className="text-sm text-slate-600">Fill your profile and upload your photo to unlock evaluation & rating access.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsPromoVerified(false);
                  setSelectedRole(null);
                }}
              >
                Exit Session
              </Button>
            </div>

            <Card className="border shadow-md bg-white">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  Investor Verification & Profile Form
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleInvestorSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                      <Input
                        placeholder="e.g. Vikram Mehta"
                        value={invFullName}
                        onChange={(e) => setInvFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                      <Input
                        type="email"
                        placeholder="e.g. vikram@apexventures.com"
                        value={invEmail}
                        onChange={(e) => setInvEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Investment Firm / Angel Network *</label>
                      <Input
                        placeholder="e.g. Apex Venture Partners / Angel"
                        value={invFirmName}
                        onChange={(e) => setInvFirmName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Designation / Role</label>
                      <Input
                        placeholder="e.g. Managing Partner / Angel Investor"
                        value={invDesignation}
                        onChange={(e) => setInvDesignation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Preferred Sectors</label>
                      <Input
                        placeholder="e.g. AI, FinTech, CleanTech"
                        value={invSectors}
                        onChange={(e) => setInvSectors(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Ticket Size Range</label>
                      <Input
                        placeholder="e.g. $25k - $100k"
                        value={invTicketSize}
                        onChange={(e) => setInvTicketSize(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">LinkedIn Profile URL</label>
                      <Input
                        type="url"
                        placeholder="https://linkedin.com/in/investorname"
                        value={invLinkedin}
                        onChange={(e) => setInvLinkedin(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                      <Input
                        placeholder="+91 98765 00000"
                        value={invPhone}
                        onChange={(e) => setInvPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Brief Bio / Investment Philosophy</label>
                    <Textarea
                      placeholder="Early stage investor focused on B2B SaaS and AI innovation in India..."
                      rows={2}
                      value={invBio}
                      onChange={(e) => setInvBio(e.target.value)}
                    />
                  </div>

                  {/* Investor Photo Upload */}
                  <div className="space-y-2 p-4 border rounded-xl bg-slate-50">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-600" /> Investor Profile Photo (Upload or URL) *
                    </label>
                    <Input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                      value={invPhotoUrl}
                      onChange={(e) => setInvPhotoUrl(e.target.value)}
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400">or upload photo file:</span>
                      <label className={`inline-flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        isUploadingInvestorPhoto
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                      }`}>
                        {isUploadingInvestorPhoto ? (
                          <><svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Uploading…</>
                        ) : (
                          <><Upload className="w-3 h-3" /> Choose Profile Photo</>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingInvestorPhoto}
                          onChange={(e) => void handleCloudinaryUpload(e, setInvPhotoUrl, setIsUploadingInvestorPhoto, "founders-connect/activity-investors", "image")}
                        />
                      </label>
                    </div>

                    {invPhotoUrl && (
                      <div className="flex items-center gap-3 mt-2 p-2 bg-white rounded border">
                        <img src={invPhotoUrl} alt="Investor Preview" className="w-12 h-12 rounded-full object-cover border" />
                        <span className="text-xs font-medium text-slate-600">Investor Photo Preview ✅</span>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-base shadow-lg">
                    Unlock Investor Portal & Start Rating 🌟
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Startup Directory — always visible, ranking is never pre-decided by the page itself */}
        <div className="space-y-10">
          {startups.some((s) => s.resultRank) && (
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                Results
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {(["gold", "silver", "bronze"] as const).map((rank) => {
                  const winner = startups.find((s) => s.resultRank === rank);
                  if (!winner) return null;
                  const medal = rank === "gold" ? "🥇" : rank === "silver" ? "🥈" : "🥉";
                  const ring =
                    rank === "gold"
                      ? "border-amber-300 bg-amber-50"
                      : rank === "silver"
                      ? "border-slate-300 bg-slate-50"
                      : "border-orange-300 bg-orange-50";
                  return (
                    <Card
                      key={rank}
                      onClick={() => setViewStartupProfile(winner)}
                      className={`cursor-pointer border ${ring} hover:shadow-md transition-shadow`}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <span className="text-2xl">{medal}</span>
                        <img src={winner.logoUrl} alt={winner.startupName} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{rank}</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{winner.startupName}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {investorProfile && (
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 border border-indigo-800">
              <div className="flex items-center gap-4">
                <img
                  src={investorProfile.photoUrl}
                  alt={investorProfile.fullName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-indigo-400 object-cover shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold text-white">{investorProfile.fullName}</h3>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs">
                      Verified Investor
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {investorProfile.designation} at <strong className="text-white">{investorProfile.firmName}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInvestorProfile(null)}
                  className="flex-1 md:flex-initial bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs"
                >
                  Edit Investor Profile
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedRole("startup");
                    setIsPromoVerified(true);
                  }}
                  className="flex-1 md:flex-initial bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  + Add New Startup
                </Button>
              </div>
            </div>
          )}

          {/* Startup Directory */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  Startup Directory ({startups.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Newest registrations first. Tap a card to see the full profile, pitch deck & investor feedback.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-semibold">LIVE</span>
                  {lastSyncTime && <span className="text-emerald-600 hidden xs:inline">· {lastSyncTime}</span>}
                </div>
                <button
                  onClick={() => void refreshLiveStartups(true)}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-purple-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-full hover:border-purple-300 transition-colors"
                  title="Refresh now"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingStartups ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[140px] sm:flex-initial">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search startup..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs w-full sm:w-48 bg-white"
                />
              </div>
              <select
                className="h-9 px-3 text-xs border border-slate-300 rounded-md bg-white text-slate-700 focus:ring-2 focus:ring-purple-500"
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
              >
                {SECTORS.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            {/* Loading Spinner — only on first load */}
            {isLoadingStartups && startups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-purple-600" />
                <p className="text-slate-500 text-sm font-medium">Connecting to live database…</p>
              </div>
            ) : filteredStartups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl">🚀</div>
                <p className="text-slate-700 font-semibold">No Startups Registered Yet</p>
                <p className="text-slate-400 text-xs max-w-xs">Startups will appear here once founders submit their details during the Bangalore Event Activity.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {filteredStartups.map((startup) => (
                  <Card
                    key={startup.id}
                    onClick={() => setViewStartupProfile(startup)}
                    className="border border-slate-200 bg-white hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                  >
                    <CardContent className="p-5 flex flex-col flex-1 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={startup.logoUrl}
                          alt={startup.startupName}
                          className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate">{startup.startupName}</h3>
                          <p className="text-[11px] text-slate-500 truncate">{startup.category} · {startup.stage}</p>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 line-clamp-2 flex-1">{startup.tagline}</p>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                        <span className="truncate">{startup.founderName}</span>
                        <span className="flex items-center gap-1 font-medium text-slate-700 shrink-0">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {startup.averageScore > 0 ? startup.averageScore.toFixed(1) : "—"}
                          <span className="text-slate-400">({startup.totalRatingsCount})</span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>

      {/* --- RATING MODAL DIALOG --- */}
      {ratingTargetStartup && investorProfile && (
        <Dialog open={!!ratingTargetStartup} onOpenChange={() => setRatingTargetStartup(null)}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto bg-white p-4 sm:p-6 rounded-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400 flex-shrink-0" />
                <span>Rate Startup: {ratingTargetStartup.startupName}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                Score this startup across the 5 evaluation criteria (1 to 5 stars each).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRatingSubmit} className="space-y-4 pt-3">
              {[
                { key: "innovation", label: "1. Innovation & Product Tech" },
                { key: "market", label: "2. Market Opportunity & Scalability" },
                { key: "traction", label: "3. Business Model & Traction" },
                { key: "team", label: "4. Team & Execution Capability" },
                { key: "pitch", label: "5. Pitch & Presentation Quality" },
              ].map((criteria) => {
                const currentVal = (ratingScores as any)[criteria.key] || 0;
                const starLabels = ["Poor", "Average", "Good", "Very Good", "Excellent"];

                return (
                  <div key={criteria.key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{criteria.label}</span>
                      <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[11px] font-bold">
                        {currentVal > 0 ? `${currentVal} / 5 ⭐ (${starLabels[currentVal - 1]})` : "Not rated yet"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() =>
                              setRatingScores({ ...ratingScores, [criteria.key]: starVal })
                            }
                            title={`${starVal} Star - ${starLabels[starVal - 1]}`}
                            className="p-1 hover:scale-125 transition-transform focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                starVal <= currentVal
                                  ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                                  : "text-slate-300 hover:text-amber-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <span className="text-[11px] font-semibold text-slate-500">
                        {currentVal} / 5
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="space-y-1 pt-2">
                <label className="text-xs font-semibold text-slate-700">Investor Feedback / Notes (Optional)</label>
                <Textarea
                  placeholder="Add constructive notes or key impressions for the founder..."
                  rows={2}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                />
              </div>

              <div className="bg-slate-100 p-3 rounded-lg flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Total Score:</span>
                <span className="text-base text-amber-600 font-extrabold">
                  {ratingScores.innovation +
                    ratingScores.market +
                    ratingScores.traction +
                    ratingScores.team +
                    ratingScores.pitch}{" "}
                  / 25 ({((ratingScores.innovation + ratingScores.market + ratingScores.traction + ratingScores.team + ratingScores.pitch) / 5).toFixed(1)} ★)
                </span>
              </div>

              <Button
                type="submit"
                disabled={Object.values(ratingScores).some((score) => score < 1)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit & Update Leaderboard
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* --- STARTUP PROFILE MODAL DIALOG --- */}
      {viewStartupProfile && (
        <Dialog open={!!viewStartupProfile} onOpenChange={() => setViewStartupProfile(null)}>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-0 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 sm:p-6 text-white">
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={viewStartupProfile.logoUrl}
                    alt={viewStartupProfile.startupName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-white/40 shadow-md shrink-0"
                  />
                  <div className="min-w-0">
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                      {viewStartupProfile.startupName}
                    </DialogTitle>
                    <DialogDescription className="text-purple-100 text-sm mt-1">
                      {viewStartupProfile.tagline}
                    </DialogDescription>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <Badge className="bg-white/15 border-white/30 text-white text-xs">{viewStartupProfile.category}</Badge>
                      <Badge className="bg-white/15 border-white/30 text-white text-xs">{viewStartupProfile.stage}</Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">About the Startup</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{viewStartupProfile.description}</p>
              </div>

              {/* Founder contact */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Founder</h4>
                <p className="text-sm font-bold text-slate-900">{viewStartupProfile.founderName}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {viewStartupProfile.founderEmail}</span>
                  {viewStartupProfile.founderPhone && (
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {viewStartupProfile.founderPhone}</span>
                  )}
                </div>
              </div>

              {/* Rating summary */}
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  <div>
                    <p className="text-lg font-extrabold text-amber-700">
                      {viewStartupProfile.averageScore > 0 ? viewStartupProfile.averageScore.toFixed(1) : "Unrated"}
                    </p>
                    <p className="text-[11px] text-amber-600 font-medium">
                      {viewStartupProfile.totalRatingsCount} Investor {viewStartupProfile.totalRatingsCount === 1 ? "Rating" : "Ratings"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs"
                    onClick={() => setViewDeckStartup(viewStartupProfile)}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" /> Pitch Deck
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (investorProfile) {
                        setRatingScores(UNRATED_SCORES);
                        setRatingComment("");
                        setRatingTargetStartup(viewStartupProfile);
                        setViewStartupProfile(null);
                      } else {
                        toast({
                          title: "Investor access required",
                          description: "Only registered SAIS'26 investors can rate startups.",
                        });
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                  >
                    <Star className="w-3.5 h-3.5 mr-1.5 fill-white" /> Rate
                  </Button>
                </div>
              </div>

              {/* Investor feedback */}
              {viewStartupProfile.ratings && viewStartupProfile.ratings.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Investor Feedback</h4>
                  <div className="space-y-2">
                    {viewStartupProfile.ratings.map((rev, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <img
                            src={rev.investorPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                            alt={rev.investorName}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800">{rev.investorName} <span className="font-normal text-slate-500">· {rev.investorFirm}</span></p>
                            {rev.comment && <p className="text-xs text-slate-600 italic mt-0.5">"{rev.comment}"</p>}
                          </div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 shrink-0">
                          {(rev.totalScore / 5).toFixed(1)} ★
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <PitchDeckViewerModal startup={viewDeckStartup} onClose={() => setViewDeckStartup(null)} />

      <Footer />
    </div>
  );
};

export default BangaloreActivity;
