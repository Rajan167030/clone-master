import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Rocket, Search, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminMembersDirectoryApi, type AdminMemberDetail } from "@/lib/api";
import { getToken } from "@/lib/session";

type Classification = "user" | "founder";

const AdminMembers = () => {
  const token = useMemo(() => getToken() || "", []);
  const [members, setMembers] = useState<AdminMemberDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classification, setClassification] = useState<Classification>("user");
  const [expandedId, setExpandedId] = useState("");

  useEffect(() => {
    if (!token) return;

    getAdminMembersDirectoryApi(token)
      .then((response) => setMembers(response.members || []))
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to load members.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const byClassification = members.filter((member) => member.role === classification);
  const memberCount = members.filter((member) => member.role === "user").length;
  const founderCount = members.filter((member) => member.role === "founder").length;

  const filtered = byClassification.filter((member) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      member.fullName.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term) ||
      member.city.toLowerCase().includes(term) ||
      (member.roleDetails?.startupName || "").toLowerCase().includes(term) ||
      (member.roleDetails?.occupation || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">Admin</p>
            <h1 className="text-2xl font-bold text-slate-900">Members Directory</h1>
          </div>
          <Link to="/admin" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <main className="container mx-auto space-y-6 px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => { setClassification("user"); setExpandedId(""); }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                classification === "user" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <User className="h-4 w-4" />
              Members ({memberCount})
            </button>
            <button
              onClick={() => { setClassification("founder"); setExpandedId(""); }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                classification === "founder" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Rocket className="h-4 w-4" />
              Founders ({founderCount})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={classification === "founder" ? "Search by name, email, startup..." : "Search by name, email, occupation..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Contact</th>
                    {classification === "founder" ? (
                      <>
                        <th className="p-4 font-medium">Startup</th>
                        <th className="p-4 font-medium">Stage</th>
                        <th className="p-4 font-medium">Team Size</th>
                      </>
                    ) : (
                      <>
                        <th className="p-4 font-medium">Occupation</th>
                        <th className="p-4 font-medium">Interest</th>
                        <th className="p-4 font-medium">Experience</th>
                      </>
                    )}
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">Loading members...</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">No {classification === "founder" ? "founders" : "members"} found.</td>
                    </tr>
                  ) : (
                    filtered.map((member) => {
                      const expanded = expandedId === member._id;
                      return (
                        <Fragment key={member._id}>
                          <tr className="cursor-pointer hover:bg-slate-50" onClick={() => setExpandedId(expanded ? "" : member._id)}>
                            <td className="p-4">
                              <p className="font-semibold text-slate-900">{member.fullName}</p>
                              <p className="text-xs text-slate-500">{member.city}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-slate-700">{member.email}</p>
                              <p className="text-xs text-slate-500">{member.phone}</p>
                            </td>
                            {classification === "founder" ? (
                              <>
                                <td className="p-4">
                                  <p className="font-medium text-slate-800">{member.roleDetails?.startupName || "—"}</p>
                                  {member.roleDetails?.startupWebsite && (
                                    <a
                                      href={member.roleDetails.startupWebsite}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-xs text-violet-600 hover:underline"
                                    >
                                      {member.roleDetails.startupWebsite}
                                    </a>
                                  )}
                                </td>
                                <td className="p-4">
                                  <Badge variant="outline" className="capitalize">{member.roleDetails?.startupStage || "—"}</Badge>
                                </td>
                                <td className="p-4">{member.roleDetails?.teamSize ?? "—"}</td>
                              </>
                            ) : (
                              <>
                                <td className="p-4">{member.roleDetails?.occupation || "—"}</td>
                                <td className="p-4">{member.roleDetails?.interest || "—"}</td>
                                <td className="p-4">
                                  <Badge variant="outline" className="capitalize">{member.roleDetails?.experienceLevel || "—"}</Badge>
                                </td>
                              </>
                            )}
                            <td className="p-4">
                              <Badge variant={member.isActive ? "default" : "secondary"}>{member.isActive ? "Active" : "Inactive"}</Badge>
                            </td>
                            <td className="p-4 text-right">
                              {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                            </td>
                          </tr>
                          {expanded && (
                            <tr className="bg-slate-50">
                              <td colSpan={7} className="p-5">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                  <DetailField label="Referral Code" value={member.referralCode || "—"} />
                                  <DetailField label="Referred By" value={member.referredBy || "—"} />
                                  <DetailField label="Profile ID" value={member.profileId || "—"} />
                                  <DetailField label="Headline" value={member.headline || "—"} />
                                  <DetailField label="Joined" value={new Date(member.createdAt).toLocaleString()} />
                                  <DetailField
                                    label="Last Login"
                                    value={member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString() : "Never"}
                                  />
                                  <DetailField label="Last Updated" value={new Date(member.updatedAt).toLocaleString()} />
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

export default AdminMembers;
