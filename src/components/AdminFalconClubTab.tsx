import { useEffect, useMemo, useState } from "react";
import {
  Crown,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  FileQuestion,
  ExternalLink,
  Download,
  Eye,
  Trash2,
  Send,
  AlertCircle,
  ShieldCheck,
  Building2,
  User,
  DollarSign,
  TrendingUp,
  Sparkles,
  RefreshCw,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  getFalconClubAdminApplicationsApi,
  getFalconClubAdminStatsApi,
  updateFalconClubApplicationApi,
  requestFalconClubVerificationApi,
  deleteFalconClubApplicationApi,
  getFalconClubDocumentUrlApi,
  type FalconClubApplication,
  type FalconClubAdminStats,
} from "@/lib/api";

const TIERS = ["Achiever", "Millionaire", "Elite", "Signature", "Legacy"];
const STATUSES = [
  "New Application",
  "Under Review",
  "Verification Required",
  "Approved",
  "Rejected",
  "Waitlisted",
];

export default function AdminFalconClubTab({ token }: { token: string }) {
  const [applications, setApplications] = useState<FalconClubApplication[]>([]);
  const [stats, setStats] = useState<FalconClubAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  // Selected application for detail modal
  const [selectedApp, setSelectedApp] = useState<FalconClubApplication | null>(null);
  const [modalStatus, setModalStatus] = useState<FalconClubApplication["status"]>("New Application");
  const [modalApprovedTier, setModalApprovedTier] = useState("");
  const [modalAdminNotes, setModalAdminNotes] = useState("");
  const [modalShowInDir, setModalShowInDir] = useState(true);
  const [modalAllowLinkedin, setModalAllowLinkedin] = useState(true);
  const [savingApp, setSavingApp] = useState(false);

  // Verification request note
  const [verificationNote, setVerificationNote] = useState("");
  const [sendingVerification, setSendingVerification] = useState(false);
  const [showVerificationBox, setShowVerificationBox] = useState(false);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [appsRes, statsRes] = await Promise.all([
        getFalconClubAdminApplicationsApi(token, {
          search: searchQuery,
          status: statusFilter,
          tier: tierFilter,
          limit: 100,
        }),
        getFalconClubAdminStatsApi(token).catch(() => null),
      ]);

      if (appsRes.success) {
        setApplications(appsRes.applications);
      }
      if (statsRes && statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error("Failed to load Falcon Club applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, statusFilter, tierFilter]);

  const openAppModal = (app: FalconClubApplication) => {
    setSelectedApp(app);
    setModalStatus(app.status);
    setModalApprovedTier(app.approvedTier || (TIERS.includes(app.suggestedTier) ? app.suggestedTier : ""));
    setModalAdminNotes(app.adminNotes || "");
    setModalShowInDir(app.showInDirectory !== false);
    setModalAllowLinkedin(app.allowPublicLinkedin !== false);
    setVerificationNote(
      app.verificationRequestNote ||
        "Please provide audited financials, valuation summary, or company incorporation certificate to verify your requested membership tier."
    );
    setShowVerificationBox(false);
  };

  const handleViewDocument = async (documentId: string) => {
    if (!selectedApp || !token) return;
    // Open the tab synchronously so popup blockers allow it, then point it at the signed URL.
    const tab = window.open("", "_blank");
    try {
      const res = await getFalconClubDocumentUrlApi(token, selectedApp._id, documentId);
      if (tab) tab.location.href = res.url;
      else window.location.href = res.url;
    } catch (err: unknown) {
      tab?.close();
      window.alert(err instanceof Error ? err.message : "Could not open document.");
    }
  };

  const handleSaveApplication = async () => {
    if (!selectedApp || !token) return;
    if (modalStatus === "Approved" && !modalApprovedTier) {
      window.alert("Select the final confirmed membership level before approving.");
      return;
    }
    setSavingApp(true);
    try {
      const res = await updateFalconClubApplicationApi(token, selectedApp._id, {
        status: modalStatus,
        approvedTier: modalApprovedTier,
        adminNotes: modalAdminNotes,
        showInDirectory: modalShowInDir,
        allowPublicLinkedin: modalAllowLinkedin,
      });

      if (res.success) {
        setApplications((prev) =>
          prev.map((item) => (item._id === res.application._id ? res.application : item))
        );
        setSelectedApp(res.application);
        window.alert("Application updated successfully.");
        loadData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed.";
      window.alert(msg);
    } finally {
      setSavingApp(false);
    }
  };

  const handleSendVerificationRequest = async () => {
    if (!selectedApp || !token) return;
    setSendingVerification(true);
    try {
      const res = await requestFalconClubVerificationApi(token, selectedApp._id, verificationNote);
      if (res.success) {
        setApplications((prev) =>
          prev.map((item) => (item._id === res.application._id ? res.application : item))
        );
        setSelectedApp(res.application);
        setModalStatus("Verification Required");
        setShowVerificationBox(false);
        window.alert("Verification request email sent to applicant successfully.");
        loadData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send verification request.";
      window.alert(msg);
    } finally {
      setSendingVerification(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to permanently delete application for ${name}?`)) {
      return;
    }

    try {
      const res = await deleteFalconClubApplicationApi(token, id);
      if (res.success) {
        setApplications((prev) => prev.filter((item) => item._id !== id));
        if (selectedApp?._id === id) setSelectedApp(null);
        loadData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed.";
      window.alert(msg);
    }
  };

  const exportCSV = () => {
    if (!applications.length) {
      window.alert("No applications to export.");
      return;
    }

    const headers = [
      "Applicant Name",
      "Email",
      "Mobile",
      "City",
      "Company Name",
      "Designation",
      "Industry",
      "Website",
      "LinkedIn",
      "Personal Net Worth",
      "Annual Revenue",
      "Valuation",
      "Valuation Basis",
      "Suggested Tier",
      "Current Status",
      "Approved Tier",
      "Referred By",
      "Applied Date",
    ];

    const rows = applications.map((a) => [
      `"${a.fullName.replace(/"/g, '""')}"`,
      `"${a.email.replace(/"/g, '""')}"`,
      `"${a.mobileNumber.replace(/"/g, '""')}"`,
      `"${a.currentCity.replace(/"/g, '""')}"`,
      `"${a.companyName.replace(/"/g, '""')}"`,
      `"${(a.customDesignation || a.designation).replace(/"/g, '""')}"`,
      `"${a.industry.replace(/"/g, '""')}"`,
      `"${(a.companyWebsite || "").replace(/"/g, '""')}"`,
      `"${(a.linkedinUrl || "").replace(/"/g, '""')}"`,
      `"${a.personalNetWorth}"`,
      `"${a.annualCompanyRevenue}"`,
      `"${a.companyValuation}"`,
      `"${a.valuationBasis}"`,
      `"${a.suggestedTier}"`,
      `"${a.status}"`,
      `"${a.approvedTier || ""}"`,
      `"${(a.referredBy || "").replace(/"/g, '""')}"`,
      `"${new Date(a.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `falcon-club-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300">Approved</Badge>;
      case "Verification Required":
        return <Badge className="bg-amber-500/15 text-amber-800 border-amber-300">Verification Required</Badge>;
      case "Under Review":
        return <Badge className="bg-blue-500/15 text-blue-700 border-blue-300">Under Review</Badge>;
      case "Waitlisted":
        return <Badge className="bg-purple-500/15 text-purple-700 border-purple-300">Waitlisted</Badge>;
      case "Rejected":
        return <Badge className="bg-red-500/15 text-red-700 border-red-300">Rejected</Badge>;
      default:
        return <Badge className="bg-slate-200 text-slate-800 border-slate-300">New Application</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Legacy":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">Legacy</span>;
      case "Signature":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">Signature</span>;
      case "Elite":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-900 border border-yellow-300">Elite</span>;
      case "Millionaire":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-900 border border-slate-300">Millionaire</span>;
      case "Achiever":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">Achiever</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs text-slate-500 bg-slate-100 border border-slate-200">Discretionary</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="text-purple-700 h-5 w-5" />
            <span className="text-xs uppercase font-bold tracking-widest text-purple-700">
              Founders Connect Circle
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">FALCON Club Admissions</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manual vetting console, verification dispatch, financial auditing & membership tier approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            className="border-purple-200 bg-white text-slate-700 hover:bg-purple-50 gap-1.5"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>

          <Button
            onClick={exportCSV}
            size="sm"
            className="bg-purple-700 hover:bg-purple-800 text-white font-semibold gap-1.5"
          >
            <Download size={14} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Received</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.total ?? applications.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs text-slate-500 font-medium">New Applications</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats?.newApps ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Under Review</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats?.underReview ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Verification Req.</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats?.verificationRequired ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Approved</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats?.approved ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Waitlisted / Rejected</p>
          <p className="text-2xl font-bold text-slate-600 mt-1">
            {(stats?.waitlisted ?? 0) + (stats?.rejected ?? 0)}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by candidate name, company, email, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadData()}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Tiers</option>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            <span className="inline-block h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Crown size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="font-medium text-slate-700">No applications found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Company & Role</th>
                  <th className="py-3 px-4">Financials (Confidential)</th>
                  <th className="py-3 px-4">Suggested Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Approved Tier</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Applicant Column */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{app.fullName}</div>
                      <div className="text-[11px] text-slate-500">{app.currentCity}</div>
                      <div className="text-[11px] text-slate-500">{app.email}</div>
                      <div className="text-[11px] text-slate-500">{app.mobileNumber}</div>
                    </td>

                    {/* Company Column */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{app.companyName}</div>
                      <div className="text-[11px] text-indigo-600 font-medium">
                        {app.customDesignation || app.designation} · {app.industry}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {app.companyWebsite && (
                          <a
                            href={app.companyWebsite}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Website</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                        {app.linkedinUrl && (
                          <a
                            href={app.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>LinkedIn</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Financial Snapshot */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5 text-[11px]">
                        <div>
                          <span className="text-slate-400">Net Worth:</span>{" "}
                          <span className="font-medium text-slate-800">{app.personalNetWorth}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Revenue:</span>{" "}
                          <span className="font-medium text-slate-800">{app.annualCompanyRevenue}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Valuation:</span>{" "}
                          <span className="font-medium text-slate-800">{app.companyValuation}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">Basis: {app.valuationBasis}</div>
                      </div>
                    </td>

                    {/* Suggested Level */}
                    <td className="py-3 px-4">
                      <div>{getTierBadge(app.suggestedTier)}</div>
                      {app.suggestedTierReason && (
                        <p className="text-[10px] text-slate-500 mt-1 max-w-[180px] leading-tight">
                          {app.suggestedTierReason}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {getStatusBadge(app.status)}
                      {(app.documents?.length ?? 0) > 0 && (
                        <div className="mt-1 text-[10px] text-purple-700 font-medium inline-flex items-center gap-1">
                          <FileText size={10} />
                          {app.documents?.length} document{app.documents?.length === 1 ? "" : "s"}
                        </div>
                      )}
                    </td>

                    {/* Approved Tier */}
                    <td className="py-3 px-4">
                      {app.approvedTier ? (
                        getTierBadge(app.approvedTier)
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Not Confirmed</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAppModal(app)}
                          className="h-7 text-xs px-2.5 gap-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          <Eye size={13} />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(app._id, app.fullName)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Verification Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
                  <Crown size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedApp.fullName}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedApp.companyName} · {selectedApp.customDesignation || selectedApp.designation} · {selectedApp.currentCity}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile & Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                    Candidate & Entity Details
                  </h4>
                  <div className="space-y-1 text-slate-700">
                    <p><strong>Email:</strong> {selectedApp.email}</p>
                    <p><strong>Mobile:</strong> {selectedApp.mobileNumber}</p>
                    <p><strong>City:</strong> {selectedApp.currentCity}</p>
                    <p><strong>Industry:</strong> {selectedApp.industry}</p>
                    {selectedApp.companyWebsite && (
                      <p>
                        <strong>Website:</strong>{" "}
                        <a href={selectedApp.companyWebsite} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {selectedApp.companyWebsite}
                        </a>
                      </p>
                    )}
                    {selectedApp.linkedinUrl && (
                      <p>
                        <strong>LinkedIn:</strong>{" "}
                        <a href={selectedApp.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {selectedApp.linkedinUrl}
                        </a>
                      </p>
                    )}
                    {selectedApp.referredBy && (
                      <p><strong>Referred By / Code:</strong> {selectedApp.referredBy}</p>
                    )}
                  </div>
                </div>

                {/* Financial Details Card */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2 text-xs">
                  <h4 className="font-semibold text-amber-900 uppercase tracking-wider text-[11px] flex items-center justify-between">
                    <span>Financial Metrics</span>
                    <span className="text-[10px] text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded">Confidential</span>
                  </h4>
                  <div className="space-y-1 text-slate-800">
                    <p><strong>Personal Net Worth:</strong> {selectedApp.personalNetWorth}</p>
                    <p><strong>Annual Revenue:</strong> {selectedApp.annualCompanyRevenue}</p>
                    <p><strong>Company Valuation:</strong> {selectedApp.companyValuation}</p>
                    <p><strong>Valuation Basis:</strong> {selectedApp.valuationBasis}</p>
                    <div className="pt-2 border-t border-amber-200/60 mt-2">
                      <p className="font-semibold text-slate-900">Suggested Level:</p>
                      <p className="text-sm font-bold text-amber-800 mt-0.5">{selectedApp.suggestedTier}</p>
                      {selectedApp.suggestedTierReason && (
                        <p className="text-[11px] text-amber-700 mt-0.5">{selectedApp.suggestedTierReason}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate Statement & Alternative Info */}
              {selectedApp.whyJoin && (
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Candidate Statement (Why Join):
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.whyJoin}
                  </p>
                </div>
              )}

              {selectedApp.alternativeInfo && (
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Alternative Corporate Information / Track Record:
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.alternativeInfo}
                  </p>
                </div>
              )}

              {/* Verification Documents */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
                <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Verification Documents (Private)</span>
                  {selectedApp.documentsSubmittedAt && (
                    <span className="text-[10px] normal-case font-medium text-emerald-700">
                      Submitted {new Date(selectedApp.documentsSubmittedAt).toLocaleDateString()}
                    </span>
                  )}
                </h5>
                {selectedApp.documents && selectedApp.documents.length > 0 ? (
                  <ul className="space-y-1.5">
                    {selectedApp.documents.map((doc) => (
                      <li key={doc._id} className="flex items-center justify-between gap-3 text-xs bg-white rounded-lg border border-slate-200 px-3 py-2">
                        <div className="min-w-0 flex items-center gap-2">
                          <FileText size={14} className="text-purple-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">{doc.label || doc.originalName}</p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {doc.label ? `${doc.originalName} · ` : ""}
                              {new Date(doc.uploadedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDocument(doc._id)}
                          className="h-7 text-xs px-2.5 gap-1 shrink-0"
                        >
                          <Eye size={12} />
                          View
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">
                    {selectedApp.verificationRequestSent
                      ? "Verification requested — waiting for the applicant to upload documents through their secure link."
                      : "No documents yet. Use “Request Verification” below to send the applicant a secure upload link."}
                  </p>
                )}
              </div>

              {/* Admin Actions Panel */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Admissions Decision & Tier Confirmation
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Application Status
                    </label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value as FalconClubApplication["status"])}
                      className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Final Confirmed Membership Level
                    </label>
                    <select
                      value={modalApprovedTier}
                      onChange={(e) => setModalApprovedTier(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Select Approved Tier --</option>
                      {TIERS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Admin Internal Review Notes (Confidential)
                    </label>
                    <Textarea
                      rows={2}
                      placeholder="Add internal notes about background check, phone conversation, MCA records, etc."
                      value={modalAdminNotes}
                      onChange={(e) => setModalAdminNotes(e.target.value)}
                      className="text-xs bg-white border-slate-300"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2 text-xs text-slate-700">
                    <p className="text-[11px] text-slate-500">
                      Applicant permission — directory listing:{" "}
                      <strong className={selectedApp.consentDirectory ? "text-emerald-700" : "text-slate-700"}>
                        {selectedApp.consentDirectory ? "Allowed" : "Not given"}
                      </strong>
                      {" · "}LinkedIn link:{" "}
                      <strong className={selectedApp.consentLinkedin ? "text-emerald-700" : "text-slate-700"}>
                        {selectedApp.consentLinkedin ? "Allowed" : "Not given"}
                      </strong>
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className={`flex items-center gap-2 ${selectedApp.consentDirectory ? "cursor-pointer" : "opacity-50"}`}>
                        <input
                          type="checkbox"
                          disabled={!selectedApp.consentDirectory}
                          checked={Boolean(selectedApp.consentDirectory) && modalShowInDir}
                          onChange={(e) => setModalShowInDir(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        <span>Show in private member directory when approved</span>
                      </label>

                      <label className={`flex items-center gap-2 ${selectedApp.consentLinkedin ? "cursor-pointer" : "opacity-50"}`}>
                        <input
                          type="checkbox"
                          disabled={!selectedApp.consentLinkedin}
                          checked={Boolean(selectedApp.consentLinkedin) && modalAllowLinkedin}
                          onChange={(e) => setModalAllowLinkedin(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        <span>Include LinkedIn link in directory</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Verification Email Dispatch Subpanel */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Request Verification Evidence
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Emails the applicant a private, 14-day upload link for supporting documents.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVerificationBox(!showVerificationBox)}
                      className="text-xs h-8 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    >
                      <Send size={12} className="mr-1.5" />
                      {showVerificationBox ? "Hide Notice Box" : "Request Verification"}
                    </Button>
                  </div>

                  {showVerificationBox && (
                    <div className="mt-3 p-3.5 rounded-lg border border-amber-300 bg-amber-50/50 space-y-2">
                      <label className="block text-xs font-semibold text-amber-900">
                        Custom Verification Note for Applicant Email:
                      </label>
                      <Textarea
                        rows={3}
                        value={verificationNote}
                        onChange={(e) => setVerificationNote(e.target.value)}
                        className="text-xs bg-white border-amber-300"
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          disabled={sendingVerification}
                          onClick={handleSendVerificationRequest}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
                        >
                          {sendingVerification ? "Sending..." : "Dispatch Verification Email"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50 sticky bottom-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedApp(null)}
                className="text-xs"
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={savingApp}
                  onClick={handleSaveApplication}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  {savingApp ? "Saving Decision..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
