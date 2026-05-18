import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, FileText, Sparkles, X } from "lucide-react";
import StatCard from "@/components/StatCard";
import PortfolioTable from "@/components/PortfolioTable";
import ProfileCard from "@/components/ProfileCard";
import EditProfileModal from "@/components/EditProfileModal";
import QRAnalyticsDashboard from "@/components/QRAnalyticsDashboard";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  getMyDashboardApi,
  type DashboardResponse,
} from "@/lib/api";
import { clearSession, getAccount, getToken } from "@/lib/session";

type DashboardStat = {
  title: string;
  value: string;
  color: "blue" | "green" | "purple" | "amber";
};

type PortfolioItem = {
  startupName: string;
  investment: string;
  date: string;
};

type StoredUser = {
  email?: string;
  role?: "user" | "investor" | "founder";
  fullName?: string;
  referralCode?: string;
  city?: string;
  headline?: string;
  profilePhoto?: string;
  profileId?: string;
  cardColors?: any;
  roleDetails?: any;
};

const fallbackStats: Record<"user" | "investor" | "founder", DashboardStat[]> = {
  user: [
    { title: "Profile Completion", value: "0%", color: "blue" },
    { title: "Communities Joined", value: "0", color: "green" },
    { title: "Mentor Sessions", value: "0", color: "purple" },
    { title: "Saved Opportunities", value: "0", color: "amber" },
  ],
  investor: [
    { title: "Total Angel Investment", value: "INR 0", color: "blue" },
    { title: "5 Years Investment Goal", value: "INR 0", color: "green" },
    { title: "Goal Progress", value: "0%", color: "purple" },
    { title: "Startups Invested", value: "0", color: "amber" },
  ],
  founder: [
    { title: "Pitch Views", value: "0", color: "blue" },
    { title: "Interested Investors", value: "0", color: "green" },
    { title: "Funding Target", value: "INR 0", color: "purple" },
    { title: "Raised So Far", value: "INR 0", color: "amber" },
  ],
};

const roleLabels: Record<"user" | "investor" | "founder", string> = {
  user: "User",
  investor: "Investor",
  founder: "Founder",
};

const toRole = (role?: string): "user" | "investor" | "founder" => {
  if (role === "investor" || role === "founder") {
    return role;
  }
  return "user";
};

const Dashboard = () => {
  const token = useMemo(() => getToken(), []);
  const currentUser = useMemo<StoredUser>(() => getAccount() || {}, []);
  const [dashboard, setDashboard] = useState<DashboardResponse["dashboard"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Custom Dynamic Stats for Founder
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [customStats, setCustomStats] = useState<DashboardStat[]>([]);
  const [metricsForm, setMetricsForm] = useState({
    pitchViews: "",
    interestedInvestors: "",
    fundingTarget: "",
    raisedSoFar: "",
  });

  const handleCopyLink = () => {
    const code = currentUser.referralCode || "N/A";
    const link = `https://foundersconnect.co.in/join-us?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const openMetricsModal = () => {
    const views = customStats.find(s => s.title === "Pitch Views")?.value || "0";
    const investors = customStats.find(s => s.title === "Interested Investors")?.value || "0";
    const target = customStats.find(s => s.title === "Funding Target")?.value || "INR 0";
    const raised = customStats.find(s => s.title === "Raised So Far")?.value || "INR 0";
    
    setMetricsForm({
      pitchViews: views,
      interestedInvestors: investors,
      fundingTarget: target,
      raisedSoFar: raised,
    });
    setIsMetricsModalOpen(true);
  };

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DashboardStat[] = [
      { title: "Pitch Views", value: metricsForm.pitchViews, color: "blue" },
      { title: "Interested Investors", value: metricsForm.interestedInvestors, color: "green" },
      { title: "Funding Target", value: metricsForm.fundingTarget, color: "purple" },
      { title: "Raised So Far", value: metricsForm.raisedSoFar, color: "amber" },
    ];
    setCustomStats(updated);
    localStorage.setItem(`founder_stats_${currentUser.email}`, JSON.stringify(updated));
    setIsMetricsModalOpen(false);
  };

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    getMyDashboardApi(token)
      .then((response) => {
        setDashboard(response.dashboard);
        setErrorMessage("");
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to load dashboard.";

        if (message.toLowerCase().includes("invalid") || message.toLowerCase().includes("expired")) {
          clearSession();
        }

        setErrorMessage(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  const role = toRole(currentUser.role);
  const roleTitle = roleLabels[role];

  // Initialize Founder stats dynamically based on startup details
  useEffect(() => {
    if (role === "founder" && currentUser.email) {
      const stored = localStorage.getItem(`founder_stats_${currentUser.email}`);
      if (stored) {
        setCustomStats(JSON.parse(stored));
      } else {
        const stage = currentUser.roleDetails?.startupStage || "idea";
        const teamSize = Number(currentUser.roleDetails?.teamSize || 1);
        
        let target = "INR 10,00,000";
        let raised = "INR 0";
        let investors = "2";
        let views = String(teamSize * 24 + 15);
        
        if (stage.includes("mvp")) {
          target = "INR 25,00,000";
          raised = "INR 5,00,000";
          investors = "5";
        } else if (stage.includes("seed")) {
          target = "INR 1,00,00,000";
          raised = "INR 35,00,000";
          investors = "9";
        } else if (stage.includes("growth")) {
          target = "INR 5,00,00,000";
          raised = "INR 1,50,00,000";
          investors = "18";
        }
        
        const initialFounderStats: DashboardStat[] = [
          { title: "Pitch Views", value: views, color: "blue" },
          { title: "Interested Investors", value: investors, color: "green" },
          { title: "Funding Target", value: target, color: "purple" },
          { title: "Raised So Far", value: raised, color: "amber" },
        ];
        setCustomStats(initialFounderStats);
      }
    }
  }, [role, currentUser]);

  const stats = role === "founder" && customStats.length
    ? customStats
    : dashboard?.kpis?.length
      ? dashboard.kpis.map((item) => ({
          title: item.title,
          value: item.value,
          color: item.color as any,
        }))
      : fallbackStats[role];

  const commitmentPortfolio: PortfolioItem[] =
    dashboard?.tables?.commitmentPortfolio?.map((item) => ({
      startupName: item.startupName,
      investment: item.investment,
      date: item.date,
    })) || [];

  const investmentPortfolio: PortfolioItem[] =
    dashboard?.tables?.investmentPortfolio?.map((item) => ({
      startupName: item.startupName,
      investment: item.investment,
      date: item.date,
    })) || [];

  const userName = currentUser.fullName || "Guest User";
  const referralCode = currentUser.referralCode || "N/A";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="mb-2 font-semibold text-slate-800">Unable to load dashboard</p>
          <p className="mb-5 text-sm text-slate-600">{errorMessage}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
        <Sidebar
          isMobile={isMobile}
          mobileOpen={mobileSidebarOpen}
          onMobileOpenChange={setMobileSidebarOpen}
          onProfileClick={() => {
            setIsEditModalOpen(true);
            setMobileSidebarOpen(false);
          }}
        />

      <div className="lg:ml-64">
        <Topbar
          userRole={roleTitle}
          userName={userName}
          referralCode={referralCode}
          isMobile={isMobile}
          onMenuClick={() => setMobileSidebarOpen(true)}
          onProfileClick={() => setIsEditModalOpen(true)}
        />

        <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-violet-700">Dashboard</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{roleTitle} Workspace</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Track your core dashboard metrics, profile analytics, and startup growth in one central hub.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {role === "founder" && (
                <button
                  type="button"
                  onClick={openMetricsModal}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-bold text-purple-700 shadow-sm transition-all hover:bg-purple-100/70 hover:scale-[1.02] active:scale-95"
                >
                  <Sparkles size={16} />
                  Update Metrics
                </button>
              )}
              <Link
                to="/events"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
              >
                <CalendarDays size={16} />
                Explore Events
              </Link>
              <Link
                to="/membership"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-3 text-sm font-medium text-white shadow-sm"
              >
                <Sparkles size={16} />
                Membership Access
              </Link>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:mb-8 xl:grid-cols-4 xl:gap-6">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Card & Referral Grid */}
          <div className="mb-6 grid grid-cols-1 gap-6 xl:mb-8 lg:grid-cols-2">
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">Your Founders Connect Card</h2>
                <p className="text-sm text-slate-500">Share your professional network card with QR code</p>
              </div>
              {currentUser && currentUser.email && (
                <>
                  <ProfileCard
                    fullName={currentUser.fullName || "Founder"}
                    role={role}
                    city={currentUser.city || "India"}
                    headline={role === "founder" && currentUser.roleDetails?.startupName
                      ? `${currentUser.roleDetails.startupName} | ${currentUser.headline || "Building the future"}`
                      : currentUser.headline}
                    profilePhoto={currentUser.profilePhoto}
                    profileId={currentUser.profileId}
                    cardColors={currentUser.cardColors}
                    onEdit={() => setIsEditModalOpen(true)}
                    isEditable={true}
                  />
                  <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                      window.location.reload();
                    }}
                    initialData={{
                      headline: currentUser.headline,
                      profilePhoto: currentUser.profilePhoto,
                      cardColors: currentUser.cardColors,
                    }}
                  />
                </>
              )}
            </div>

            {/* Referral Hub column */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">Referral Center</h2>
                <p className="text-sm text-slate-500">Invite new members and grow the network</p>
              </div>

              <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-[0_10px_30px_-5px_rgba(124,58,237,0.08)] h-[calc(100%-2.5rem)] flex flex-col justify-between">
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-[inset_0_2px_4px_rgba(124,58,237,0.06)] border border-violet-100">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Your Referral Hub</h3>
                      <p className="text-xs text-slate-500">Earn exclusive member perks for successful invites</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    Help us onboard elite founders, active investors, and world-class builders. 
                    Share your personalized registration link below to directly credit your account.
                  </p>

                  {/* Sleek inline Vercel-style purple capsule */}
                  <div className="relative mb-6 rounded-2xl bg-slate-950 p-[1px] shadow-[0_4px_20px_-2px_rgba(124,58,237,0.15)] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 animate-pulse pointer-events-none opacity-45" />
                    
                    <div className="relative flex items-center justify-between rounded-[15px] bg-slate-900/95 py-2 pl-4 pr-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={`https://foundersconnect.co.in/join-us?ref=${referralCode}`}
                        className="w-full bg-transparent text-sm font-medium text-slate-200 border-none outline-none focus:ring-0 truncate" 
                      />
                      
                      <button
                        onClick={handleCopyLink}
                        className={`ml-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-300 ${copiedLink ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]" : "bg-white text-slate-900 hover:bg-slate-100 hover:scale-[1.02]"}`}
                      >
                        {copiedLink ? "Copied! 🎉" : "Copy Link"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Your Referral Code</p>
                    <p className="mt-1 text-lg font-bold text-violet-700 tracking-wider uppercase">{referralCode}</p>
                  </div>
                  
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Total referred</p>
                    <p className="mt-1 text-lg font-bold text-slate-800">
                      {dashboard?.kpis?.find(k => k.key === "referred_signups" || k.key === "referred_members")?.value || "0"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Founder Startup Info Section */}
          {role === "founder" && currentUser?.roleDetails && (
            <div className="mb-6 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4 shadow-sm sm:p-6 xl:mb-8">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Your Startup</h2>
                <p className="text-sm text-slate-500">Your registered startup information</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Startup Name</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{currentUser.roleDetails.startupName}</p>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Stage</p>
                  <p className="mt-2 text-lg font-semibold capitalize text-slate-900">{String(currentUser.roleDetails.startupStage || "").replace(/-/g, " ")}</p>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Team Size</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{currentUser.roleDetails.teamSize} people</p>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Website</p>
                  <a
                    href={currentUser.roleDetails.startupWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 truncate text-sm font-semibold text-purple-600 hover:underline"
                  >
                    {currentUser.roleDetails.startupWebsite}
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
            <PortfolioTable title="Commitment Portfolio" items={commitmentPortfolio} />
            <PortfolioTable title="Investment Portfolio" items={investmentPortfolio} />
          </div>

          {/* QR Analytics Section */}
          <section className="mt-6 xl:mt-8">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-slate-900">Your Profile Analytics</h2>
              <p className="text-sm text-slate-500">Track how many people have scanned your profile QR code</p>
            </div>
            <QRAnalyticsDashboard />
          </section>
        </main>
      </div>

      {/* Dynamic Founder Metrics Modal */}
      {isMetricsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-violet-100 bg-white p-6 shadow-[0_20px_50px_rgba(109,40,217,0.15)] animate-scale-up sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 font-heading">Update Founder Metrics</h2>
              <button 
                onClick={() => setIsMetricsModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveMetrics} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Pitch Views</label>
                <input
                  type="text"
                  value={metricsForm.pitchViews}
                  onChange={(e) => setMetricsForm(prev => ({ ...prev, pitchViews: e.target.value }))}
                  placeholder="e.g. 150"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-violet-500 focus:ring-violet-500/20 text-sm outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Interested Investors</label>
                <input
                  type="text"
                  value={metricsForm.interestedInvestors}
                  onChange={(e) => setMetricsForm(prev => ({ ...prev, interestedInvestors: e.target.value }))}
                  placeholder="e.g. 8"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-violet-500 focus:ring-violet-500/20 text-sm outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Funding Target</label>
                <input
                  type="text"
                  value={metricsForm.fundingTarget}
                  onChange={(e) => setMetricsForm(prev => ({ ...prev, fundingTarget: e.target.value }))}
                  placeholder="e.g. INR 50,00,000"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-violet-500 focus:ring-violet-500/20 text-sm outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Raised So Far</label>
                <input
                  type="text"
                  value={metricsForm.raisedSoFar}
                  onChange={(e) => setMetricsForm(prev => ({ ...prev, raisedSoFar: e.target.value }))}
                  placeholder="e.g. INR 15,00,000"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-violet-500 focus:ring-violet-500/20 text-sm outline-none transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsMetricsModalOpen(false)}
                  className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 transition-all font-bold"
                >
                  Save Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
