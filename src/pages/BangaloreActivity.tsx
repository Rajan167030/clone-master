import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { setSession, isAuthenticated, getAccount, getToken } from "@/lib/session";
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
  Lock,
} from "lucide-react";
import {
  ActivityStartupItem,
  ActivityInvestorProfile,
  RatingScores,
  getBangaloreStartupsApi,
  registerBangaloreStartupApi,
  updateBangaloreStartupApi,
  getFounderAccessDashboardApi,
  getMyFounderAccessApi,
  submitStartupRatingApi,
  saveInvestorProfileApi,
  getSavedInvestorProfileLocal,
  getPublicCloudinaryUploadSignatureApi,
} from "@/lib/api";
import {
  DEFAULT_RATING_SCORES,
  RATING_CRITERIA,
  RATING_MAX_TOTAL,
  RATING_SCALE_MAX,
  ratingScoreLabel,
  sumRatingScores,
} from "@/lib/rating-criteria";

const PROMO_CODES = {
  STARTUP: "startup20",
  INVESTOR: "investor20",
};

// Remembers this browser's own Bangalore Activity founder registration so a repeat visit to
// "Register Your Startup" opens the edit form instead of a blank one — the backend also
// enforces this by email, so this is just a UX shortcut around that server-side check.
const LOCAL_STORAGE_MY_FOUNDER_ACCESS_KEY = "fc_sais26_my_founder_access";

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
  "w-full max-w-full border-[1.5px] border-[#0B0B09] rounded-none bg-white px-3 py-2.5 sm:px-3.5 sm:py-3 font-sans text-xs sm:text-sm text-[#0B0B09] placeholder:text-[#6B6558]/60 focus:outline-none focus:ring-0 focus:border-[#0B0B09] focus:shadow-[2px_2px_0px_#4C1D95] sm:focus:shadow-[3px_3px_0px_#4C1D95] transition-all box-border";

const MAX_DESCRIPTION_WORDS = 100;

const countWords = (text: string): number => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
};

// Only Google Drive share links are accepted for the pitch deck — keeps every deck viewable
// via a single, familiar flow instead of mixing in raw file uploads.
const isGoogleDriveUrl = (url: string) => /^https?:\/\/(drive|docs)\.google\.com\//i.test(url.trim());

const BangaloreActivity: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
  const [isEditingStartup, setIsEditingStartup] = useState(false);

  // Investor Form state
  const [invFullName, setInvFullName] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invFirmName, setInvFirmName] = useState("");
  const [invDesignation, setInvDesignation] = useState("");
  const [invSectors, setInvSectors] = useState("AI, FinTech, SaaS");
  const [invTicketSize, setInvTicketSize] = useState("$25k - $100k");
  const [invLinkedin, setInvLinkedin] = useState("");
  const [invBio, setInvBio] = useState("");
  const [invPhotoUrl, setInvPhotoUrl] = useState("");

  // Rating Modal state
  const [ratingTargetStartup, setRatingTargetStartup] = useState<ActivityStartupItem | null>(null);
  const UNRATED_SCORES: RatingScores = DEFAULT_RATING_SCORES;
  const [ratingScores, setRatingScores] = useState<RatingScores>(UNRATED_SCORES);
  const [ratingComment, setRatingComment] = useState("");

  // Pitch Deck Viewer Modal state
  const [viewStartupProfile, setViewStartupProfile] = useState<ActivityStartupItem | null>(null);
  const [viewDeckStartup, setViewDeckStartup] = useState<ActivityStartupItem | null>(null);
  // Logo lightbox — anyone can open this, no login required
  const [viewLogoStartup, setViewLogoStartup] = useState<ActivityStartupItem | null>(null);

  // Loading state for initial fetch
  const [isLoadingStartups, setIsLoadingStartups] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Upload progress states
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingInvestorPhoto, setIsUploadingInvestorPhoto] = useState(false);

  // Show newest registrations first — ranking is not pre-decided for visitors.
  const sortStartups = (items: ActivityStartupItem[]) => {
    return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Function to refresh live startups from API
  const refreshLiveStartups = async (showLoader = false) => {
    if (showLoader) setIsLoadingStartups(true);
    const freshStartups = await getBangaloreStartupsApi(getToken());
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

    // Coming from the "Edit Profile" link on the founder's SAIS'26 dashboard — jump straight
    // into the edit form instead of making them find the "Register Your Startup" card again.
    const editToken = searchParams.get("edit");
    if (editToken) {
      void loadStartupForEditing(editToken);
    }

    // A logged-in founder may already have a Bangalore registration from a previous session
    // (different browser, cleared storage, etc.) — sync it into localStorage so clicking
    // "Register Your Startup" opens the edit form instead of letting them attempt a duplicate.
    const account = getAccount();
    if (isAuthenticated() && account?.role === "founder") {
      const token = getToken();
      if (token) {
        getMyFounderAccessApi(token)
          .then((res) => {
            if (res?.accessToken) {
              localStorage.setItem(LOCAL_STORAGE_MY_FOUNDER_ACCESS_KEY, res.accessToken);
            }
          })
          .catch(() => {});
      }
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

  // Pull an existing registration into the form and switch to edit mode — used both when the
  // backend reports a duplicate on submit, and when we already know (via localStorage or the
  // founder's session) that this person has registered before.
  const loadStartupForEditing = async (accessToken: string) => {
    try {
      const res = await getFounderAccessDashboardApi(accessToken);
      const startup = res.startup as ActivityStartupItem;

      setFounderName(startup.founderName || "");
      setFounderEmail(startup.founderEmail || "");
      setFounderPhone(startup.founderPhone || "");
      setStartupName(startup.startupName || "");
      setTagline(startup.tagline || "");
      setDescription(startup.description || "");
      setCategory(startup.category || "AI & DeepTech");
      setStage(startup.stage || "Seed");
      setPitchDeckUrl(startup.pitchDeckUrl || "");
      setLogoUrl(startup.logoUrl || "");

      setFounderAccessToken(accessToken);
      setIsEditingStartup(true);
      setIsStartupSubmitted(false);
      setSelectedRole("startup");
      setIsPromoVerified(true);
      localStorage.setItem(LOCAL_STORAGE_MY_FOUNDER_ACCESS_KEY, accessToken);
    } catch {
      // Stale/invalid accessToken — fall through to a normal blank registration form.
      setSelectedRole("startup");
      setIsPromoVerified(true);
    }
  };

  // Handle description change with 250 words limit
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const words = val.trim().split(/\s+/).filter(Boolean);
    if (words.length > MAX_DESCRIPTION_WORDS) {
      // Truncate to maximum allowed words
      const truncated = words.slice(0, MAX_DESCRIPTION_WORDS).join(" ");
      setDescription(truncated);
      toast({
        variant: "destructive",
        title: "Word Limit Reached",
        description: `Description cannot exceed ${MAX_DESCRIPTION_WORDS} words.`,
      });
    } else {
      setDescription(val);
    }
  };

  // Submit Startup Form — registers a new startup, or (once already registered) updates it.
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

    if (countWords(description) > MAX_DESCRIPTION_WORDS) {
      toast({
        variant: "destructive",
        title: "Word Limit Exceeded",
        description: `Description must be ${MAX_DESCRIPTION_WORDS} words or fewer. Current count: ${countWords(description)} words.`,
      });
      return;
    }

    if (pitchDeckUrl.trim() && !isGoogleDriveUrl(pitchDeckUrl)) {
      toast({
        variant: "destructive",
        title: "Invalid Pitch Deck Link",
        description: "Pitch deck must be a Google Drive link (https://drive.google.com/...).",
      });
      return;
    }

    const defaultLogo = logoUrl.trim() || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80";
    const defaultDeck = pitchDeckUrl.trim();

    try {
      if (isEditingStartup && founderAccessToken) {
        await updateBangaloreStartupApi(founderAccessToken, {
          founderName,
          founderPhone,
          startupName,
          tagline,
          description,
          category,
          stage,
          logoUrl: defaultLogo,
          pitchDeckUrl: defaultDeck,
        });

        await refreshLiveStartups();
        setIsStartupSubmitted(true);

        toast({
          title: "Profile Updated ✅",
          description: `${startupName}'s Bangalore Event profile has been updated.`,
        });
        return;
      }

      const result = await registerBangaloreStartupApi({
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

      if (result.status === "duplicate") {
        toast({
          title: "Already Registered",
          description: result.message || "You've already registered for the Bangalore Event — edit your existing profile below.",
        });
        if (result.accessToken) {
          await loadStartupForEditing(result.accessToken);
        }
        return;
      }

      const savedStartup = result.startup;

      if (savedStartup.accessToken) {
        setFounderAccessToken(savedStartup.accessToken);
        localStorage.setItem(`fc_sais26_founder_access_${savedStartup.id}`, savedStartup.accessToken);
        localStorage.setItem(LOCAL_STORAGE_MY_FOUNDER_ACCESS_KEY, savedStartup.accessToken);
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save your registration.";
      toast({ variant: "destructive", title: "Something went wrong", description: message });
    }
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
        description: `Please give at least 1 point on all ${RATING_CRITERIA.length} criteria before submitting.`,
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden w-full max-w-full">
      <Navbar key={navbarSessionKey} />

      {/* Hero Header Banner — image shown in full inside a bordered rectangular frame, nothing cropped off */}
      <section className="px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 w-full max-w-full">
        <div className="max-w-7xl mx-auto relative rounded-none border-2 border-[#0B0B09] bg-slate-950 overflow-hidden aspect-[16/10] sm:aspect-[21/9] shadow-[4px_4px_0px_#0B0B09] sm:shadow-[6px_6px_0px_#0B0B09]">
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

          <div className="absolute inset-0 flex flex-col justify-end p-3.5 sm:p-6 lg:p-8 text-white">
            <div className="max-w-3xl space-y-2 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white text-[11px] sm:text-sm font-semibold tracking-wide uppercase w-fit">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300" />
                Bangalore Event Special Activity
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full space-y-6 sm:space-y-10 box-border">

        {/* Event Venue & Startup Registration — one combined section */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 items-stretch w-full">
          <div className={selectedRole ? "lg:col-span-5" : "lg:col-span-3"}>
            <EventLocationVisualizer
              locationLabel="https://maps.app.goo.gl/G7QZT98YNpR6CGQg6"
              eventTitle="Startup & Investors summit-2026"
            />
          </div>

          {!selectedRole && (
            <div className="lg:col-span-2 flex flex-col w-full">
              {/* Startup Founder — form-card in the site's ticket/document style */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  const savedToken = localStorage.getItem(LOCAL_STORAGE_MY_FOUNDER_ACCESS_KEY);
                  if (savedToken) {
                    void loadStartupForEditing(savedToken);
                  } else {
                    setSelectedRole("startup");
                    setIsPromoVerified(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    const savedToken = localStorage.getItem(LOCAL_STORAGE_MY_FOUNDER_ACCESS_KEY);
                    if (savedToken) {
                      void loadStartupForEditing(savedToken);
                    } else {
                      setSelectedRole("startup");
                      setIsPromoVerified(true);
                    }
                  }
                }}
                className="group cursor-pointer flex-1 flex flex-col border-2 border-[#0B0B09] bg-[#FBFAF5] rounded-none shadow-[4px_4px_0px_#0B0B09] sm:shadow-[6px_6px_0px_#0B0B09] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#0B0B09] sm:hover:shadow-[8px_8px_0px_#0B0B09] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_#0B0B09] transition-all duration-200 ease-out overflow-hidden w-full"
              >
                {/* Header Strip */}
                <div className="flex items-center justify-between border-b-2 border-[#0B0B09] bg-[#FBFAF5] px-3.5 sm:px-4 py-2 sm:py-2.5 font-mono text-[11px] sm:text-xs uppercase tracking-wider text-[#0B0B09]">
                  <span className="font-bold truncate">Form No. FC/BLR-2026</span>
                  <span className="bg-[#0B0B09] text-white px-2 py-0.5 font-bold shrink-0 ml-2">For Founders</span>
                </div>

                <div className="p-4 sm:p-6 flex-1 flex flex-col">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-[#0B0B09] bg-purple-50 text-[#4C1D95] flex items-center justify-center mb-3 sm:mb-4">
                    <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h2 className="font-heading text-lg sm:text-2xl font-extrabold uppercase tracking-tight text-[#0B0B09]">
                    {localStorage.getItem(LOCAL_STORAGE_MY_FOUNDER_ACCESS_KEY) ? "Edit Your Startup" : "Register Your Startup"}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[#6B6558] font-sans">
                    {localStorage.getItem(LOCAL_STORAGE_MY_FOUNDER_ACCESS_KEY)
                      ? "You're already registered for the Bangalore Event — update your startup details, logo, or pitch deck here."
                      : "For founders participating in the Bangalore Event. Submit your startup details, logo, and pitch deck to get evaluated."}
                  </p>

                  <div className="mt-auto pt-4 sm:pt-5 flex items-center justify-between font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#4C1D95]">
                    {localStorage.getItem(LOCAL_STORAGE_MY_FOUNDER_ACCESS_KEY) ? "Edit Details" : "Start Registration"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Step 3: Startup Founder Form & Details */}
        {selectedRole === "startup" && isPromoVerified && (
          <div className="max-w-4xl mx-auto w-full">
            <div className="border-2 border-[#0B0B09] bg-[#FBFAF5] rounded-none shadow-[4px_4px_0px_#0B0B09] sm:shadow-[6px_6px_0px_#0B0B09] overflow-hidden w-full">
              {/* Header Strip */}
              <div className="flex items-center justify-between border-b-2 border-[#0B0B09] bg-[#FBFAF5] px-3.5 sm:px-4 py-2 sm:py-2.5 font-mono text-[11px] sm:text-xs uppercase tracking-wider text-[#0B0B09]">
                <span className="font-bold">Form No. FC/BLR-2026</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsPromoVerified(false);
                    setSelectedRole(null);
                    setIsEditingStartup(false);
                  }}
                  className="text-[#6B6558] hover:text-[#0B0B09] font-bold"
                >
                  Cancel
                </button>
              </div>

              {isStartupSubmitted ? (
                <div className="p-4 sm:p-10 flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#4C1D95] to-[#6D28D9] border-2 border-[#0B0B09] text-white shadow-[3px_3px_0px_#0B0B09] mb-3 sm:mb-4">
                    <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <h3 className="font-heading text-lg sm:text-2xl font-extrabold uppercase tracking-tight text-[#0B0B09]">
                    {isEditingStartup ? "Profile Updated" : "Registration Received"}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#6B6558] max-w-md font-sans">
                    {isEditingStartup
                      ? `${startupName || "Your startup"}'s Bangalore Event profile has been updated.`
                      : `${startupName || "Your startup"} has been added to the Bangalore Event startup directory.`}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-4 sm:pt-5 w-full">
                    {founderAccessToken && (
                      <Button asChild className="bg-[#0B0B09] hover:bg-[#0B0B09]/90 text-white rounded-none font-mono text-xs uppercase tracking-wider w-full sm:w-auto">
                        <Link to={`/sais26/founder/${founderAccessToken}`}>Your SAIS'26 Dashboard</Link>
                      </Button>
                    )}
                    {founderAccessToken && (
                      <Button
                        variant="outline"
                        className="rounded-none border-2 border-[#0B0B09] font-mono text-xs uppercase tracking-wider text-[#0B0B09] hover:bg-[#0B0B09] hover:text-white w-full sm:w-auto"
                        onClick={() => {
                          setIsStartupSubmitted(false);
                          setIsEditingStartup(true);
                        }}
                      >
                        Edit Your Details
                      </Button>
                    )}
                  </div>
                  {founderAccessToken && !isEditingStartup && (
                    <p className="text-[11px] sm:text-xs text-[#6B6558] pt-3 sm:pt-4 font-sans">
                      We've also emailed this private dashboard link to {founderEmail || "you"} — save it, it's how you'll get back in.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 sm:p-8">
                  <div className="mb-5 sm:mb-6">
                    <h2 className="font-heading text-lg sm:text-2xl font-extrabold uppercase tracking-tight text-[#0B0B09]">
                      {isEditingStartup ? "Edit Your Startup Profile" : "Startup Registration"}
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-[#6B6558] font-sans">
                      {isEditingStartup
                        ? "You've already registered — update your founder details, startup summary, logo, and pitch deck below."
                        : "Founder details, startup summary, logo, and pitch deck."}
                    </p>
                  </div>

                  <form onSubmit={handleStartupSubmit} className="space-y-5 sm:space-y-7">
                    {/* Section 1: Founder Info */}
                    <div className="space-y-3.5 sm:space-y-4">
                      <div className="flex items-center gap-2 border-b border-[#0B0B09]/15 pb-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#0B0B09] text-white font-mono text-[10px] font-bold">1</span>
                        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B0B09]">Founder Information</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
                            className={`${FORM_INPUT_CLASS} ${isEditingStartup ? "bg-slate-100 cursor-not-allowed text-[#6B6558]" : ""}`}
                            placeholder="e.g. founder@startup.in"
                            value={founderEmail}
                            onChange={(e) => setFounderEmail(e.target.value)}
                            readOnly={isEditingStartup}
                            required
                          />
                          {isEditingStartup && (
                            <p className="text-[11px] text-[#6B6558]">Email can't be changed here.</p>
                          )}
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
                    <div className="space-y-3.5 sm:space-y-4">
                      <div className="flex items-center gap-2 border-b border-[#0B0B09]/15 pb-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#0B0B09] text-white font-mono text-[10px] font-bold">2</span>
                        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B0B09]">Startup Overview</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <label className={FORM_LABEL_CLASS}>
                            Description <span className="text-[#4C1D95]">*</span>
                          </label>
                          <span
                            className={`font-mono text-[11px] sm:text-xs font-semibold ${
                              countWords(description) >= MAX_DESCRIPTION_WORDS
                                ? "text-red-600 font-bold"
                                : countWords(description) >= 90
                                ? "text-amber-600"
                                : "text-[#6B6558]"
                            }`}
                          >
                            {countWords(description)} / {MAX_DESCRIPTION_WORDS} words
                          </span>
                        </div>
                        <textarea
                          className={`${FORM_INPUT_CLASS} min-h-[95px] sm:min-h-[110px] resize-y`}
                          placeholder="Describe your product, market opportunity, target audience, and business traction (maximum 100 words)..."
                          rows={4}
                          value={description}
                          onChange={handleDescriptionChange}
                          required
                        />
                        {countWords(description) >= MAX_DESCRIPTION_WORDS && (
                          <p className="text-[11px] text-red-600 font-mono">
                            Maximum limit of 100 words reached.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Section 3: Pitch Deck & Startup Logo */}
                    <div className="space-y-3.5 sm:space-y-4">
                      <div className="flex items-center gap-2 border-b border-[#0B0B09]/15 pb-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#0B0B09] text-white font-mono text-[10px] font-bold">3</span>
                        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#0B0B09]">Logo &amp; Pitch Deck</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Startup Logo */}
                        <div className="space-y-2 p-3.5 sm:p-4 border-[1.5px] border-[#0B0B09]/20 bg-white overflow-hidden">
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
                            <label className={`inline-flex items-center gap-1.5 cursor-pointer px-2.5 sm:px-3 py-1.5 border-[1.5px] border-[#0B0B09] font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wide transition-colors ${
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
                            <div className="flex items-center gap-2.5 mt-2 p-2 bg-[#FBFAF5] border border-[#0B0B09]/15">
                              <img src={logoUrl} alt="Logo Preview" className="w-9 h-9 object-cover border border-[#0B0B09]/20 shrink-0" />
                              <span className="text-xs font-medium text-[#6B6558] truncate">Logo ready</span>
                            </div>
                          )}
                        </div>

                        {/* Pitch Deck — Google Drive link only, no direct file upload */}
                        <div className="space-y-2 p-3.5 sm:p-4 border-[1.5px] border-[#0B0B09]/20 bg-white overflow-hidden">
                          <label className={FORM_LABEL_CLASS}>Pitch Deck (Google Drive Link) <span className="text-[#6B6558] font-normal normal-case">(optional)</span></label>
                          <input
                            type="url"
                            className={FORM_INPUT_CLASS}
                            placeholder="https://drive.google.com/file/d/your-pitch-deck/view"
                            value={pitchDeckUrl}
                            onChange={(e) => setPitchDeckUrl(e.target.value)}
                          />
                          <p className="text-[11px] text-[#6B6558] pt-1 break-words">
                            Upload your deck to Google Drive, set sharing to "Anyone with the link", and paste that link here.
                          </p>
                          {pitchDeckUrl && isGoogleDriveUrl(pitchDeckUrl) && (
                            <p className="text-[11px] text-[#4C1D95] font-medium pt-1">Deck link ready</p>
                          )}
                          {pitchDeckUrl && !isGoogleDriveUrl(pitchDeckUrl) && (
                            <p className="text-[11px] text-red-600 font-medium pt-1">Must be a drive.google.com link.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] text-white font-mono text-xs sm:text-base font-bold uppercase tracking-wider border-2 border-[#0B0B09] rounded-none py-3 sm:py-3.5 px-4 sm:px-6 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0B0B09] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-200 ease-out"
                    >
                      {isEditingStartup ? "Update Profile" : "Submit Registration"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Investor Complete Profile Form */}
        {selectedRole === "investor" && isPromoVerified && !investorProfile && (
          <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto w-full">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Complete Investor Profile</h2>
                <p className="text-xs sm:text-sm text-slate-600">Fill your profile and upload your photo to unlock evaluation & rating access.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsPromoVerified(false);
                  setSelectedRole(null);
                }}
                className="text-xs"
              >
                Exit Session
              </Button>
            </div>

            <Card className="border shadow-md bg-white overflow-hidden">
              <CardHeader className="bg-slate-50 border-b p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  Investor Verification & Profile Form
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleInvestorSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    <label className="text-xs font-semibold text-slate-700">Brief Bio / Investment Philosophy</label>
                    <Textarea
                      placeholder="Early stage investor focused on B2B SaaS and AI innovation in India..."
                      rows={2}
                      value={invBio}
                      onChange={(e) => setInvBio(e.target.value)}
                    />
                  </div>

                  {/* Investor Photo Upload */}
                  <div className="space-y-2 p-3.5 sm:p-4 border rounded-xl bg-slate-50 overflow-hidden">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-600" /> Investor Profile Photo (Upload or URL) *
                    </label>
                    <Input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                      value={invPhotoUrl}
                      onChange={(e) => setInvPhotoUrl(e.target.value)}
                    />
                    <div className="flex items-center gap-2 flex-wrap pt-1">
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
                        <img src={invPhotoUrl} alt="Investor Preview" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border shrink-0" />
                        <span className="text-xs font-medium text-slate-600 truncate">Investor Photo Preview ✅</span>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 sm:py-3 text-sm sm:text-base shadow-lg">
                    Unlock Investor Portal & Start Rating 🌟
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Startup Directory — always visible, ranking is never pre-decided by the page itself */}
        <div className="space-y-6 sm:space-y-10 w-full">
          {startups.some((s) => s.resultRank) && (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  Results — SAIS'26
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Ranked by investor feedback. Tap a card for the full profile & investor comments.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {(["1", "2", "3", "4", "5"] as const).map((rank) => {
                  const winner = startups.find((s) => s.resultRank === rank);
                  if (!winner) return null;
                  const medal = rank === "1" ? "🥇" : rank === "2" ? "🥈" : rank === "3" ? "🥉" : `#${rank}`;
                  const topFeedback = [...(winner.ratings || [])]
                    .filter((r) => r.comment)
                    .sort((a, b) => b.totalScore - a.totalScore)[0];
                  return (
                    <Card
                      key={rank}
                      onClick={() => setViewStartupProfile(winner)}
                      className="cursor-pointer border border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-3.5 sm:p-4 space-y-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl sm:text-2xl shrink-0">{medal}</span>
                          <img src={winner.logoUrl} alt={winner.startupName} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover border border-purple-200 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-600">Rank {rank}</p>
                            <p className="text-sm font-bold text-slate-900 truncate">{winner.startupName}</p>
                          </div>
                        </div>
                        {topFeedback && (
                          <p className="text-[11px] text-slate-600 italic line-clamp-2 border-t border-purple-100 pt-2">
                            "{topFeedback.comment}" — {topFeedback.investorName}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {investorProfile && (
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-4 sm:p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 border border-indigo-800 w-full">
              <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                <img
                  src={investorProfile.photoUrl}
                  alt={investorProfile.fullName}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-indigo-400 object-cover shadow-md shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-xl font-bold text-white truncate">{investorProfile.fullName}</h3>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] sm:text-xs">
                      Verified Investor
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 truncate">
                    {investorProfile.designation} at <strong className="text-white">{investorProfile.firmName}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInvestorProfile(null)}
                  className="flex-1 md:flex-initial bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs"
                >
                  Edit Profile
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const savedToken = localStorage.getItem(LOCAL_STORAGE_MY_FOUNDER_ACCESS_KEY);
                    if (savedToken) {
                      void loadStartupForEditing(savedToken);
                    } else {
                      setSelectedRole("startup");
                      setIsPromoVerified(true);
                    }
                  }}
                  className="flex-1 md:flex-initial bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  {localStorage.getItem(LOCAL_STORAGE_MY_FOUNDER_ACCESS_KEY) ? "Edit Startup" : "+ Add Startup"}
                </Button>
              </div>
            </div>
          )}

          {/* Startup Directory */}
          <div className="space-y-4 sm:space-y-5 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  Startup Directory ({startups.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Newest registrations first. Tap a card to see the full profile, pitch deck & investor feedback.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-semibold">LIVE</span>
                  {lastSyncTime && <span className="text-emerald-600 hidden xs:inline">· {lastSyncTime}</span>}
                </div>
                <button
                  onClick={() => void refreshLiveStartups(true)}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-purple-700 bg-white border border-slate-200 px-2.5 py-1 sm:py-1.5 rounded-full hover:border-purple-300 transition-colors"
                  title="Refresh now"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingStartups ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search startup or founder..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs w-full sm:w-64 bg-white"
                />
              </div>
              <select
                className="h-9 px-3 text-xs border border-slate-300 rounded-md bg-white text-slate-700 focus:ring-2 focus:ring-purple-500 w-full sm:w-auto"
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
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl sm:text-3xl">🚀</div>
                <p className="text-slate-700 font-semibold text-sm sm:text-base">No Startups Registered Yet</p>
                <p className="text-slate-400 text-xs max-w-xs">Startups will appear here once founders submit their details during the Bangalore Event Activity.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-5 w-full">
                {filteredStartups.map((startup) => (
                  <Card
                    key={startup.id}
                    onClick={() => setViewStartupProfile(startup)}
                    className="border border-slate-200 bg-white hover:shadow-md transition-shadow cursor-pointer flex flex-col overflow-hidden"
                  >
                    <CardContent className="p-4 sm:p-5 flex flex-col flex-1 gap-2.5 sm:gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={startup.logoUrl}
                          alt={startup.startupName}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewLogoStartup(startup);
                          }}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover border border-slate-200 shrink-0 cursor-zoom-in hover:opacity-80 transition-opacity"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-slate-900 truncate">{startup.startupName}</h3>
                          <p className="text-[11px] text-slate-500 truncate">{startup.category} · {startup.stage}</p>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 flex-1">{startup.tagline}</p>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2.5 sm:pt-3 border-t border-slate-100">
                        <span className="truncate max-w-[150px]">{startup.founderName}</span>
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
          <DialogContent className="w-[94vw] sm:max-w-md max-h-[90vh] overflow-y-auto bg-white p-3.5 sm:p-6 rounded-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400 flex-shrink-0" />
                <span className="truncate">Rate: {ratingTargetStartup.startupName}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                Score this startup across the {RATING_CRITERIA.length} evaluation criteria (1 to {RATING_SCALE_MAX} each).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRatingSubmit} className="space-y-3.5 sm:space-y-4 pt-2 sm:pt-3">
              {RATING_CRITERIA.map((criteria, index) => {
                const currentVal = (ratingScores as any)[criteria.key] || 0;

                return (
                  <div key={criteria.key} className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="text-xs font-bold text-slate-800">
                        {index + 1}. {criteria.label}
                      </span>
                      <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] sm:text-[11px] font-bold">
                        {currentVal > 0 ? `${currentVal} / ${RATING_SCALE_MAX} (${ratingScoreLabel(currentVal)})` : "Unrated"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-1">
                      {Array.from({ length: RATING_SCALE_MAX }, (_, i) => i + 1).map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRatingScores({ ...ratingScores, [criteria.key]: val })}
                          title={`${val} / ${RATING_SCALE_MAX}`}
                          className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border text-[10px] sm:text-[11px] font-bold transition-colors focus:outline-none ${
                            val <= currentVal
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "bg-white border-slate-300 text-slate-500 hover:border-indigo-400"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="space-y-1 pt-1 sm:pt-2">
                <label className="text-xs font-semibold text-slate-700">Investor Feedback / Notes (Optional)</label>
                <Textarea
                  placeholder="Add constructive notes or key impressions for the founder..."
                  rows={2}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                />
              </div>

              <div className="bg-slate-100 p-2.5 sm:p-3 rounded-lg flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Total Score:</span>
                <span className="text-sm sm:text-base text-amber-600 font-extrabold">
                  {sumRatingScores(ratingScores)} / {RATING_MAX_TOTAL} ({(sumRatingScores(ratingScores) / RATING_CRITERIA.length).toFixed(1)} avg)
                </span>
              </div>

              <Button
                type="submit"
                disabled={Object.values(ratingScores).some((score) => score < 1)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 sm:py-2.5 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
          <DialogContent className="w-[94vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-0 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 sm:p-6 text-white">
              <DialogHeader>
                <div className="flex items-start gap-3 sm:gap-4">
                  <img
                    src={viewStartupProfile.logoUrl}
                    alt={viewStartupProfile.startupName}
                    onClick={() => setViewLogoStartup(viewStartupProfile)}
                    className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-white/40 shadow-md shrink-0 cursor-zoom-in hover:opacity-90 transition-opacity"
                  />
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-lg sm:text-2xl font-bold text-white truncate">
                      {viewStartupProfile.startupName}
                    </DialogTitle>
                    <DialogDescription className="text-purple-100 text-xs sm:text-sm mt-1 line-clamp-2">
                      {viewStartupProfile.tagline}
                    </DialogDescription>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-2">
                      <Badge className="bg-white/15 border-white/30 text-white text-[10px] sm:text-xs">{viewStartupProfile.category}</Badge>
                      <Badge className="bg-white/15 border-white/30 text-white text-[10px] sm:text-xs">{viewStartupProfile.stage}</Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">About the Startup</h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed break-words">{viewStartupProfile.description}</p>
              </div>

              {/* Founder contact */}
              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Founder</h4>
                <p className="text-sm font-bold text-slate-900">{viewStartupProfile.founderName}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {viewStartupProfile.founderEmail}</span>
                  {isAuthenticated() ? (
                    viewStartupProfile.founderPhone && (
                      <span className="flex items-center gap-1.5 truncate"><Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {viewStartupProfile.founderPhone}</span>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        toast({
                          title: "Login Required",
                          description: "Sign in or register to view the founder's phone number.",
                        });
                        navigate("/login");
                      }}
                      className="flex items-center gap-1.5 text-purple-700 hover:underline text-xs"
                    >
                      <Lock className="w-3.5 h-3.5 text-purple-400" /> Login to view phone number
                    </button>
                  )}
                </div>
              </div>

              {/* Rating summary */}
              <div className="flex items-center justify-between p-3.5 sm:p-4 bg-amber-50 rounded-xl border border-amber-200 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-400 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-base sm:text-lg font-extrabold text-amber-700">
                      {(() => {
                        const startupRatings = viewStartupProfile.ratings || [];
                        if (startupRatings.length === 0) return "Unrated";
                        const live =
                          startupRatings.reduce((acc, r) => acc + sumRatingScores(r.scores) / RATING_CRITERIA.length, 0) /
                          startupRatings.length;
                        return live.toFixed(1);
                      })()}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-amber-600 font-medium">
                      {(viewStartupProfile.ratings || []).length} Investor {(viewStartupProfile.ratings || []).length === 1 ? "Rating" : "Ratings"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {viewStartupProfile.pitchDeckUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs flex-1 sm:flex-initial"
                      onClick={() => setViewDeckStartup(viewStartupProfile)}
                    >
                      <FileText className="w-3.5 h-3.5 mr-1.5" /> Pitch Deck
                    </Button>
                  )}
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
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs flex-1 sm:flex-initial"
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
                      <div key={i} className="flex items-start justify-between gap-3 bg-slate-50 p-2.5 sm:p-3 rounded-lg border border-slate-100">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <img
                            src={rev.investorPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                            alt={rev.investorName}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800">{rev.investorName} <span className="font-normal text-slate-500">· {rev.investorFirm}</span></p>
                            {rev.comment && <p className="text-xs text-slate-600 italic mt-0.5 break-words">"{rev.comment}"</p>}
                          </div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 shrink-0 text-[10px] sm:text-xs">
                          {(sumRatingScores(rev.scores) / RATING_CRITERIA.length).toFixed(1)} / {RATING_SCALE_MAX} ★
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

      {/* --- LOGO LIGHTBOX — open to everyone, no login required --- */}
      {viewLogoStartup && (
        <Dialog open={!!viewLogoStartup} onOpenChange={() => setViewLogoStartup(null)}>
          <DialogContent className="w-[92vw] sm:max-w-lg bg-white p-3.5 sm:p-5 rounded-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 truncate">{viewLogoStartup.startupName}</DialogTitle>
            </DialogHeader>
            <img
              src={viewLogoStartup.logoUrl}
              alt={viewLogoStartup.startupName}
              className="w-full max-h-[70vh] object-contain rounded-xl border border-slate-200 bg-slate-50"
            />
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
};

export default BangaloreActivity;
