import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Mail, Search, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminInvestorsDirectoryApi, type AdminInvestorDetail } from "@/lib/api";
import { getToken } from "@/lib/session";

const AdminInvestors = () => {
  const token = useMemo(() => getToken() || "", []);
  const [investors, setInvestors] = useState<AdminInvestorDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    return (
      investor.fullName.toLowerCase().includes(term) ||
      investor.email.toLowerCase().includes(term) ||
      investor.vcName.toLowerCase().includes(term) ||
      investor.investmentInterest.toLowerCase().includes(term)
    );
  });

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
        <Card className="w-full sm:w-64">
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

        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, VC/firm, or investment interest..."
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
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Phone</th>
                    <th className="p-4 font-medium">VC / Firm</th>
                    <th className="p-4 font-medium">Wants to Invest In</th>
                    <th className="p-4 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">Loading investors...</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">No investors found.</td>
                    </tr>
                  ) : (
                    filtered.map((investor) => (
                      <tr key={investor._id} className="hover:bg-slate-50">
                        <td className="p-4 font-semibold text-slate-900">{investor.fullName}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {investor.email}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700">{investor.phone || "—"}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            {investor.vcName}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                            {investor.investmentInterest}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{new Date(investor.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
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

export default AdminInvestors;
