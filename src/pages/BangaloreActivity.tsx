import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventLocationVisualizer from "@/components/EventLocationVisualizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Trophy,
  Star,
  Building2,
  FileText,
  UserCheck,
  Sparkles,
  Lock,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Layers,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Search,
  Filter,
  Upload,
  Image as ImageIcon,
  Award,
  RefreshCw,
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
  const [ratingScores, setRatingScores] = useState<RatingScores>({
    innovation: 4,
    market: 4,
    traction: 4,
    team: 4,
    pitch: 4,
  });
  const [ratingComment, setRatingComment] = useState("");

  // Pitch Deck Viewer Modal state
  const [viewDeckStartup, setViewDeckStartup] = useState<ActivityStartupItem | null>(null);

  // Loading state for initial fetch
  const [isLoadingStartups, setIsLoadingStartups] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Upload progress states
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingDeck, setIsUploadingDeck] = useState(false);
  const [isUploadingInvestorPhoto, setIsUploadingInvestorPhoto] = useState(false);

  // Sort startups by average score descending
  const sortStartups = (items: ActivityStartupItem[]) => {
    return [...items].sort((a, b) => {
      if (b.averageScore !== a.averageScore) {
        return b.averageScore - a.averageScore;
      }
      return b.totalRatingsCount - a.totalRatingsCount;
    });
  };

  // Function to refresh live startups from API
  const refreshLiveStartups = async (showLoader = false) => {
    if (showLoader) setIsLoadingStartups(true);
    const fresh = await getBangaloreStartupsApi();
    setStartups(sortStartups(fresh));
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

    await saveBangaloreStartupApi({
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
      <Navbar />

      {/* Hero Header Banner */}
      <section className="relative bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-900 text-white py-16 px-4 sm:px-6 lg:px-8 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent opacity-60"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs sm:text-sm font-semibold tracking-wide uppercase">
                <MapPin className="w-4 h-4 text-purple-400" />
                Bangalore Event Special Activity
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Bangalore Startup & Investor <span className="bg-gradient-to-r from-amber-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">Connect Session</span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg">
                Exclusive Bangalore Event Activity Portal. Startup Founders upload pitch decks & logos, while Investors evaluate, rate, and discover top-performing startups in real-time.
              </p>
            </div>

            {/* Quick Promo Badges */}
            <div className="flex flex-col gap-2 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 w-full sm:w-auto">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Required Promo Codes:</div>
              <div className="flex items-center gap-2 text-xs">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-mono">
                  Startup Code: startup20
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-mono">
                  Investor Code: investor20
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">

        {/* Event Venue & Map Visualizer Section */}
        <EventLocationVisualizer
          locationLabel="Indiranagar & Koramangala Hubs, Bengaluru, Karnataka, India"
          eventTitle="Bangalore Startup & Investor Connect Session"
        />

        {/* Step 1: Role Selection */}
        {!selectedRole && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Select Your Role for Bangalore Event Activity</h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Choose whether you are participating as a Startup Founder looking to pitch or an Investor reviewing startups.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Startup Founder Card */}
              <Card
                className="group relative cursor-pointer border-2 hover:border-purple-500 transition-all duration-300 hover:shadow-xl bg-white overflow-hidden"
                onClick={() => setSelectedRole("startup")}
              >
                <div className="h-3 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
                <CardHeader className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">Startup Founder</CardTitle>
                  <CardDescription className="text-slate-600 text-sm mt-2">
                    For founders participating in the Bangalore Event. Submit your startup details, logo, and Pitch Deck to get evaluated by investors.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 bg-purple-50 p-2.5 rounded-lg border border-purple-100">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    Requires Promo Code: <span className="font-mono underline">startup20</span>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium group-hover:gap-3 transition-all">
                    Register Startup <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Investor Card */}
              <Card
                className="group relative cursor-pointer border-2 hover:border-indigo-500 transition-all duration-300 hover:shadow-xl bg-white overflow-hidden"
                onClick={() => setSelectedRole("investor")}
              >
                <div className="h-3 bg-gradient-to-r from-indigo-600 to-amber-500"></div>
                <CardHeader className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">Investor</CardTitle>
                  <CardDescription className="text-slate-600 text-sm mt-2">
                    For investors & venture funds. Complete your profile with photo, unlock access to pitch decks, evaluate startups, and view the live Leaderboard.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Requires Promo Code: <span className="font-mono underline">investor20</span>
                  </div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium group-hover:gap-3 transition-all">
                    Investor Access & Ratings <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Promo Code Verification Gate */}
        {selectedRole && !isPromoVerified && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedRole(null);
                  setPromoInput("");
                  setPromoError("");
                }}
                className="text-slate-600 hover:text-slate-900"
              >
                ← Change Role
              </Button>
              <Badge className="capitalize font-semibold bg-purple-100 text-purple-800 border-purple-200">
                Role: {selectedRole}
              </Badge>
            </div>

            <Card className="border shadow-lg bg-white">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Enter Promo Code for {selectedRole === "startup" ? "Startup Founder" : "Investor"}
                </CardTitle>
                <CardDescription className="text-slate-600 text-xs">
                  Promo code is required to access the Bangalore Event Activity session.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <form onSubmit={handleVerifyPromo} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                      Bangalore Event Promo Code
                    </label>
                    <Input
                      type="text"
                      placeholder={selectedRole === "startup" ? "e.g. startup20" : "e.g. investor20"}
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoError("");
                      }}
                      className="font-mono text-center text-base uppercase tracking-widest py-3"
                    />
                    {promoError && (
                      <p className="text-xs font-medium text-red-600 text-center bg-red-50 p-2 rounded border border-red-200">
                        {promoError}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5">
                    Verify Promo Code & Continue
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="bg-slate-50 border-t px-6 py-3 text-center text-xs text-slate-500">
                <span>Hint for testing: Use <strong className="font-mono text-purple-700">{selectedRole === "startup" ? "startup20" : "investor20"}</strong></span>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Step 3: Startup Founder Form & Details */}
        {selectedRole === "startup" && isPromoVerified && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Bangalore Event Startup Registration</h2>
                <p className="text-sm text-slate-600">Provide your founder details, startup summary, logo, and Pitch Deck link.</p>
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

            {isStartupSubmitted ? (
              <Card className="border-2 border-emerald-500 bg-emerald-50/40 text-slate-900 p-8 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-bold text-slate-900">Startup Submitted Successfully!</h3>
                <p className="text-slate-600 max-w-md mx-auto text-sm">
                  Your startup has been registered for the Bangalore Event Activity session. Investors are now able to view your Pitch Deck and submit evaluations.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <Button
                    onClick={() => {
                      setSelectedRole("investor");
                      setIsPromoVerified(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    View Investor Evaluation Portal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsStartupSubmitted(false);
                      setStartupName("");
                    }}
                  >
                    Submit Another Startup
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="border shadow-md bg-white">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    Startup & Founder Information Form
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleStartupSubmit} className="space-y-6">
                    {/* Section 1: Founder Info */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-1">
                        1. Founder Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700">Full Name *</label>
                          <Input
                            placeholder="e.g. Ananya Rao"
                            value={founderName}
                            onChange={(e) => setFounderName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700">Email Address *</label>
                          <Input
                            type="email"
                            placeholder="e.g. founder@startup.in"
                            value={founderEmail}
                            onChange={(e) => setFounderEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700">Phone Number</label>
                          <Input
                            placeholder="+91 98765 43210"
                            value={founderPhone}
                            onChange={(e) => setFounderPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Startup Details */}
                    <div className="space-y-4 pt-2">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-1">
                        2. Startup Overview
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700">Startup Name *</label>
                          <Input
                            placeholder="e.g. Bangalore Dynamics"
                            value={startupName}
                            onChange={(e) => setStartupName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700">Sector / Category *</label>
                          <select
                            className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-purple-500"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                          >
                            {SECTORS.filter((s) => s !== "All").map((sec) => (
                              <option key={sec} value={sec}>{sec}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700">Funding Stage</label>
                          <select
                            className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-purple-500"
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

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">Elevator Pitch (One Line) *</label>
                        <Input
                          placeholder="e.g. Next-gen autonomous drone logistics built for Indian tier-1 cities."
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700">Detailed Description *</label>
                        <Textarea
                          placeholder="Describe your product, market opportunity, target audience, and business traction..."
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Section 3: Pitch Deck & Startup Logo */}
                    <div className="space-y-4 pt-2">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-1">
                        3. Startup Logo & Pitch Deck Upload
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Startup Logo */}
                        <div className="space-y-2 p-4 border rounded-xl bg-slate-50">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-purple-600" /> Startup Logo (URL or Upload) *
                          </label>
                          <Input
                            type="url"
                            placeholder="https://example.com/logo.png"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                          />
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-slate-400">or upload logo file:</span>
                            <label className={`inline-flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                              isUploadingLogo
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                            }`}>
                              {isUploadingLogo ? (
                                <><svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Uploading…</>
                              ) : (
                                <><Upload className="w-3 h-3" /> Choose Logo Image</>  
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
                            <div className="flex items-center gap-3 mt-2 p-2 bg-white rounded border">
                              <img src={logoUrl} alt="Logo Preview" className="w-12 h-12 object-cover rounded-md border" />
                              <span className="text-xs font-medium text-slate-600">Logo Preview ✅</span>
                            </div>
                          )}
                        </div>

                        {/* Pitch Deck */}
                        <div className="space-y-2 p-4 border rounded-xl bg-slate-50">
                          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-purple-600" /> Pitch Deck (PDF / Drive URL) *
                          </label>
                          <Input
                            type="url"
                            placeholder="https://drive.google.com/your-pitch-deck.pdf"
                            value={pitchDeckUrl}
                            onChange={(e) => setPitchDeckUrl(e.target.value)}
                          />
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-slate-400">or upload deck PDF:</span>
                            <label className={`inline-flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                              isUploadingDeck
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                            }`}>
                              {isUploadingDeck ? (
                                <><svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Uploading…</>
                              ) : (
                                <><Upload className="w-3 h-3" /> Choose PDF File</>  
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
                            <p className="text-[11px] text-emerald-600 font-medium">✅ Deck uploaded / linked</p>
                          )}
                          <p className="text-[11px] text-slate-500">Provide direct PDF or Google Drive/Doc link for investors to view.</p>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 text-base shadow-lg">
                      Submit Startup for Bangalore Event Leaderboard 🚀
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
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

        {/* Step 5: Investor Evaluation Portal & Leaderboard */}
        {(investorProfile || (selectedRole === "investor" && isPromoVerified)) && investorProfile && (
          <div className="space-y-8">
            {/* Investor Welcome Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-800">
              <div className="flex items-center gap-4">
                <img
                  src={investorProfile.photoUrl}
                  alt={investorProfile.fullName}
                  className="w-16 h-16 rounded-full border-2 border-indigo-400 object-cover shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{investorProfile.fullName}</h3>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs">
                      Verified Investor
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {investorProfile.designation} at <strong className="text-white">{investorProfile.firmName}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInvestorProfile(null)}
                  className="bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs"
                >
                  Edit Investor Profile
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedRole("startup");
                    setIsPromoVerified(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  + Add New Startup
                </Button>
              </div>
            </div>

            {/* Main Tabs: Leaderboard vs All Startups */}
            <Tabs defaultValue="leaderboard" className="w-full space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
                <TabsList className="bg-slate-200 p-1 rounded-xl">
                  <TabsTrigger value="leaderboard" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold">
                    <Trophy className="w-4 h-4 text-amber-500 mr-2" />
                    Bangalore Leaderboard 🏆
                  </TabsTrigger>
                  <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold">
                    <Layers className="w-4 h-4 text-purple-600 mr-2" />
                    All Startups ({startups.length})
                  </TabsTrigger>
                </TabsList>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="text"
                      placeholder="Search startup..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs sm:w-48 bg-white"
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
              </div>

              {/* Tab 1: Leaderboard */}
              <TabsContent value="leaderboard" className="space-y-6">
                <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 p-4 rounded-xl border border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow">
                      🏆
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Real-Time Investor Ranking</h4>
                      <p className="text-xs text-slate-600">Startups are ordered dynamically by total &amp; average investor ratings. Top rated startups appear on top!</p>
                    </div>
                  </div>
                  {/* Live Sync Indicator */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="font-semibold">LIVE</span>
                      {lastSyncTime && <span className="text-emerald-600">· {lastSyncTime}</span>}
                    </div>
                    <button
                      onClick={() => void refreshLiveStartups(true)}
                      className="flex items-center gap-1 text-xs text-slate-600 hover:text-purple-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-full hover:border-purple-300 transition-colors"
                      title="Refresh now"
                    >
                      <svg className={`w-3 h-3 ${isLoadingStartups ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Loading Spinner — only on first load */}
                {isLoadingStartups && startups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <svg className="w-10 h-10 animate-spin text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <p className="text-slate-500 text-sm font-medium">Connecting to live database…</p>
                  </div>
                ) : filteredStartups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl">🚀</div>
                    <p className="text-slate-700 font-semibold">No Startups Registered Yet</p>
                    <p className="text-slate-400 text-xs max-w-xs">Startups will appear here once founders submit their details during the Bangalore Event Activity.</p>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-6">
                  {filteredStartups.map((startup, index) => {
                    const isTopThree = index < 3;
                    const rankBadges = ["🥇 #1 Rank", "🥈 #2 Rank", "🥉 #3 Rank"];

                    return (
                      <Card
                        key={startup.id}
                        className={`transition-all duration-300 border-2 ${
                          index === 0
                            ? "border-amber-400 shadow-xl bg-gradient-to-r from-amber-50/30 to-white"
                            : index === 1
                            ? "border-slate-300 shadow-lg bg-white"
                            : index === 2
                            ? "border-amber-700/30 shadow-md bg-white"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            
                            {/* Left Info: Rank + Logo + Summary */}
                            <div className="flex items-start gap-4">
                              <div className="relative flex-shrink-0">
                                <img
                                  src={startup.logoUrl}
                                  alt={startup.startupName}
                                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-slate-200 shadow-sm"
                                />
                                <Badge
                                  className={`absolute -top-3 -left-3 font-extrabold shadow ${
                                    index === 0
                                      ? "bg-amber-500 text-white text-xs px-2 py-0.5"
                                      : index === 1
                                      ? "bg-slate-700 text-white text-xs px-2 py-0.5"
                                      : index === 2
                                      ? "bg-amber-800 text-white text-xs px-2 py-0.5"
                                      : "bg-slate-200 text-slate-700 text-xs"
                                  }`}
                                >
                                  {isTopThree ? rankBadges[index] : `#${index + 1}`}
                                </Badge>
                              </div>

                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-xl font-bold text-slate-900">{startup.startupName}</h3>
                                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                    {startup.category}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {startup.stage}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium text-slate-700">{startup.tagline}</p>
                                <p className="text-xs text-slate-500">
                                  Founder: <span className="font-semibold text-slate-700">{startup.founderName}</span> ({startup.founderEmail})
                                </p>
                              </div>
                            </div>

                            {/* Center Rating Score */}
                            <div className="flex flex-row md:flex-col items-center justify-between md:justify-center p-3 bg-slate-50 rounded-xl border border-slate-200 w-full md:w-36 text-center">
                              <div className="flex items-center gap-1 text-amber-500 font-extrabold text-2xl">
                                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                                {startup.averageScore > 0 ? startup.averageScore : "N/A"}
                              </div>
                              <span className="text-xs font-semibold text-slate-500">
                                {startup.totalRatingsCount} Investor {startup.totalRatingsCount === 1 ? "Rating" : "Ratings"}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                              <Button
                                onClick={() => setViewDeckStartup(startup)}
                                variant="outline"
                                className="flex-1 md:flex-initial text-xs border-purple-300 hover:bg-purple-50 text-purple-700 font-semibold"
                              >
                                <FileText className="w-4 h-4 mr-1.5" /> View Pitch Deck
                              </Button>

                              <Button
                                onClick={() => setRatingTargetStartup(startup)}
                                className="flex-1 md:flex-initial text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                              >
                                <Star className="w-4 h-4 mr-1.5 fill-white" /> Rate Startup
                              </Button>
                            </div>
                          </div>

                          {/* Expansion for Ratings comments */}
                          {startup.ratings && startup.ratings.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                                Recent Investor Feedback:
                              </span>
                              <div className="space-y-2">
                                {startup.ratings.slice(0, 2).map((rev, i) => (
                                  <div key={i} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg text-xs">
                                    <div className="flex items-center gap-2">
                                      <img src={rev.investorPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"} alt={rev.investorName} className="w-6 h-6 rounded-full object-cover" />
                                      <span className="font-semibold text-slate-800">{rev.investorName} ({rev.investorFirm}):</span>
                                      <span className="text-slate-600 italic">"{rev.comment || "Rated startup."}"</span>
                                    </div>
                                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                      {(rev.totalScore / 5).toFixed(1)} ★
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Tab 2: All Startups Grid */}
              <TabsContent value="all" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredStartups.map((startup) => (
                    <Card key={startup.id} className="border shadow-md bg-white flex flex-col justify-between hover:shadow-xl transition-all">
                      <CardHeader className="p-5">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <img src={startup.logoUrl} alt={startup.startupName} className="w-12 h-12 rounded-lg object-cover border" />
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                            {startup.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg font-bold text-slate-900">{startup.startupName}</CardTitle>
                        <CardDescription className="text-xs text-slate-600 line-clamp-2">{startup.tagline}</CardDescription>
                      </CardHeader>
                      <CardContent className="px-5 py-0 space-y-3">
                        <p className="text-xs text-slate-500 line-clamp-3">{startup.description}</p>
                        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded">
                          <span>Stage: <strong>{startup.stage}</strong></span>
                          <span className="flex items-center gap-1 font-bold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {startup.averageScore > 0 ? startup.averageScore : "Unrated"}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-5 pt-4 border-t mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewDeckStartup(startup)}
                          className="flex-1 text-xs"
                        >
                          Pitch Deck
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setRatingTargetStartup(startup)}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                        >
                          Rate
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

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
                        {currentVal} / 5 ⭐ ({starLabels[currentVal - 1] || "Unrated"})
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

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5">
                Submit & Update Leaderboard
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* --- PITCH DECK MODAL DIALOG --- */}
      {viewDeckStartup && (
        <Dialog open={!!viewDeckStartup} onOpenChange={() => setViewDeckStartup(null)}>
          <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-4 sm:p-6 rounded-2xl shadow-2xl space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center justify-between">
                <span>Pitch Deck: {viewDeckStartup.startupName}</span>
                <a
                  href={viewDeckStartup.pitchDeckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1"
                >
                  Open in New Tab <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                Founder: {viewDeckStartup.founderName} ({viewDeckStartup.founderEmail}) | Category: {viewDeckStartup.category}
              </DialogDescription>
            </DialogHeader>

            <div className="border rounded-xl bg-slate-900 h-96 flex flex-col items-center justify-center text-white space-y-4 p-6 text-center">
              <FileText className="w-16 h-16 text-purple-400 animate-pulse" />
              <div>
                <h4 className="text-lg font-bold">{viewDeckStartup.startupName} Pitch Presentation</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Click below to view the official presentation deck for this startup.
                </p>
              </div>
              <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                <a href={viewDeckStartup.pitchDeckUrl} target="_blank" rel="noopener noreferrer">
                  View Pitch Deck PDF <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
};

export default BangaloreActivity;
