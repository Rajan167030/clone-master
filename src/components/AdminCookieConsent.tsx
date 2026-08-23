import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Cookie, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminCookieConsentApi, type CookieConsentStats } from "@/lib/api";
import { getToken } from "@/lib/session";

const numberFormatter = new Intl.NumberFormat("en-IN");

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const AdminCookieConsent = () => {
  const [stats, setStats] = useState<CookieConsentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getAdminCookieConsentApi(token)
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load cookie consent data."))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error || !stats) {
    return <p className="py-10 text-center text-sm text-red-600">{error || "No data available."}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-slate-500">
              <Cookie className="h-4 w-4" /> Total Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-slate-900">{numberFormatter.format(stats.total)}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-slate-500">
              <ThumbsUp className="h-4 w-4 text-emerald-600" /> Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-emerald-600">{numberFormatter.format(stats.totalAccepted)}</p>
            <p className="mt-1 text-xs text-slate-500">{stats.acceptRate}% accept rate</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-slate-500">
              <ThumbsDown className="h-4 w-4 text-rose-600" /> Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-rose-600">{numberFormatter.format(stats.totalDenied)}</p>
            <p className="mt-1 text-xs text-slate-500">{100 - stats.acceptRate}% deny rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Last 30 Days</CardTitle>
          <CardDescription>Daily accept vs deny counts from the cookie banner.</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.daily.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No consent activity in the last 30 days yet.</p>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.daily} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accepted" name="Accepted" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="denied" name="Denied" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest 50 consent choices, most recent first.</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recent.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No consent activity yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Choice</th>
                    <th className="py-2 pr-4">Visitor</th>
                    <th className="py-2 pr-4">Page</th>
                    <th className="py-2 pr-4">When</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-100">
                      <td className="py-2 pr-4">
                        <Badge
                          variant="outline"
                          className={entry.choice === "accepted" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}
                        >
                          {entry.choice}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 text-slate-700">
                        {entry.account ? `${entry.account.fullName} (${entry.account.role})` : "Anonymous"}
                      </td>
                      <td className="py-2 pr-4 text-slate-500">{entry.path || "—"}</td>
                      <td className="py-2 pr-4 text-slate-500">{timeAgo(entry.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCookieConsent;
