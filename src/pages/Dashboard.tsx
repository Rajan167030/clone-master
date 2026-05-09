import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, FileText, Sparkles } from "lucide-react";
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

  const stats = dashboard?.kpis?.length
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

          {/* Profile Card Section */}
          <div className="mb-6 xl:mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Your Founders Connect Card</h2>
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
                    // Reload dashboard data
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
    </div>
  );
};

export default Dashboard;
