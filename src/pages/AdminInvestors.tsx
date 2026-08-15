import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Search, TrendingUp, Users, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminInvestorsDirectoryApi, type AdminInvestorDetail } from "@/lib/api";
import { getToken } from "@/lib/session";

const formatCurrency = (value: number | undefined, currency: string | undefined) => {
  if (!Number.isFinite(Number(value))) return "—";
  return `${currency || "INR"} ${Number(value).toLocaleString("en-IN")}`;
};

const AdminInvestors = () => {
  const token = useMemo(() => getToken() || "", []);
  const [investors, setInvestors] = useState<AdminInvestorDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState("");

  useEffect(() => {
    if (!token) return;

    getAdminInvestorsDirectoryApi(token)
      .then((response) => setInvestors(response.investors || []))
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to load investors.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = investors.filter((investor) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    const sectors = (investor.roleDetails?.focusSector || []).join(" ").toLowerCase();
    return (
      investor.fullName.toLowerCase().includes(term) ||
      investor.email.toLowerCase().includes(term) ||
      investor.city.toLowerCase().includes(term) ||
      sectors.includes(term)
    );
  });

  const totalPortfolio = investors.reduce((sum, investor) => sum + Number(investor.roleDetails?.portfolioSize || 0), 0);
  const activeCount = investors.filter((investor) => investor.isActive).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">Admin</p>
            <h1 className="text-2xl font-bold text-slate-900">Investors</h1>
          </div>
          <Link to="/admin" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <main className="container mx-auto space-y-6 px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Total Investors</p>
                <p className="text-xl font-bold text-slate-900">{investors.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Active</p>
                <p className="text-xl font-bold text-slate-900">{activeCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Combined Portfolio Size</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(totalPortfolio, "INR")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, city, or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4 font-medium">Investor</th>
                    <th className="p-4 font-medium">Contact</th>
                    <th className="p-4 font-medium">Investment Range</th>
                    <th className="p-4 font-medium">Focus Sectors</th>
                    <th className="p-4 font-medium">Portfolio Size</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">Loading investors...</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">No investors found.</td>
                    </tr>
                  ) : (
                    filtered.map((investor) => {
                      const expanded = expandedId === investor._id;
                      return (
                        <Fragment key={investor._id}>
                          <tr className="cursor-pointer hover:bg-slate-50" onClick={() => setExpandedId(expanded ? "" : investor._id)}>
                            <td className="p-4">
                              <p className="font-semibold text-slate-900">{investor.fullName}</p>
                              <p className="text-xs text-slate-500">{investor.city}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-slate-700">{investor.email}</p>
                              <p className="text-xs text-slate-500">{investor.phone}</p>
                            </td>
                            <td className="p-4">
                              {formatCurrency(investor.roleDetails?.investmentRange?.min, investor.roleDetails?.investmentRange?.currency)}
                              {" – "}
                              {formatCurrency(investor.roleDetails?.investmentRange?.max, investor.roleDetails?.investmentRange?.currency)}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {(investor.roleDetails?.focusSector || []).map((sector) => (
                                  <Badge key={sector} variant="secondary" className="text-[10px]">{sector}</Badge>
                                ))}
                              </div>
                            </td>
                            <td className="p-4">{formatCurrency(investor.roleDetails?.portfolioSize, "INR")}</td>
                            <td className="p-4">
                              <Badge variant={investor.isActive ? "default" : "secondary"}>{investor.isActive ? "Active" : "Inactive"}</Badge>
                            </td>
                            <td className="p-4 text-right">
                              {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                            </td>
                          </tr>
                          {expanded && (
                            <tr className="bg-slate-50">
                              <td colSpan={7} className="p-5">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                  <DetailField label="Investor ID" value={investor.roleDetails?.investorId || "—"} />
                                  <DetailField label="Referral Code" value={investor.referralCode || "—"} />
                                  <DetailField label="Referred By" value={investor.referredBy || "—"} />
                                  <DetailField label="Profile ID" value={investor.profileId || "—"} />
                                  <DetailField label="Headline" value={investor.headline || "—"} />
                                  <DetailField label="Joined" value={new Date(investor.createdAt).toLocaleString()} />
                                  <DetailField
                                    label="Last Login"
                                    value={investor.lastLoginAt ? new Date(investor.lastLoginAt).toLocaleString() : "Never"}
                                  />
                                  <DetailField label="Last Updated" value={new Date(investor.updatedAt).toLocaleString()} />
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <p className="text-sm font-medium text-slate-800 break-words">{value}</p>
  </div>
);

export default AdminInvestors;
