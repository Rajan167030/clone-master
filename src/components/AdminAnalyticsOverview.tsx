import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { AdminMember, AdminInvestorDetail, PartnerLogo } from "@/lib/api";

type AdminAnalyticsOverviewProps = {
  members: AdminMember[];
  investors: AdminInvestorDetail[];
  partners: PartnerLogo[];
  activityStartups: unknown[];
  activityInvestors: unknown[];
};

const numberFormatter = new Intl.NumberFormat("en-IN");

const COMMUNITY_COLORS = { Members: "#2563eb", Founders: "#7c3aed", Investors: "#10b981", Partners: "#f59e0b" };
const REGISTRATION_COLORS = { Startups: "#0f172a", Investors: "#2563eb" };

const AdminAnalyticsOverview = ({ members, investors, partners, activityStartups, activityInvestors }: AdminAnalyticsOverviewProps) => {
  const communityData = useMemo(() => {
    const memberCount = members.filter((m) => m.role === "user").length;
    const founderCount = members.filter((m) => m.role === "founder").length;
    // Includes legacy investor accounts (pre-invite-link era) plus new invite-based investor leads.
    const investorCount = members.filter((m) => m.role === "investor").length + investors.length;

    return [
      { name: "Members", value: memberCount },
      { name: "Founders", value: founderCount },
      { name: "Investors", value: investorCount },
      { name: "Partners", value: partners.length },
    ];
  }, [members, investors, partners]);

  const registrationData = useMemo(
    () => [
      { name: "Startups", value: activityStartups.length },
      { name: "Investors", value: activityInvestors.length },
    ],
    [activityStartups, activityInvestors],
  );

  const totalCommunity = communityData.reduce((sum, item) => sum + item.value, 0);
  const totalRegistrations = registrationData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Community Breakdown</CardTitle>
          <CardDescription>
            {numberFormatter.format(totalCommunity)} total — members, founders, investors, and partners.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={communityData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" allowDecimals={false} />
                <Tooltip formatter={(value) => numberFormatter.format(Number(value) || 0)} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {communityData.map((item) => (
                    <Cell key={item.name} fill={COMMUNITY_COLORS[item.name as keyof typeof COMMUNITY_COLORS]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Event Registrations</CardTitle>
          <CardDescription>
            {numberFormatter.format(totalRegistrations)} total registrations — startups and investors registered for the Bangalore event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" allowDecimals={false} />
                <Tooltip formatter={(value) => numberFormatter.format(Number(value) || 0)} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {registrationData.map((item) => (
                    <Cell key={item.name} fill={REGISTRATION_COLORS[item.name as keyof typeof REGISTRATION_COLORS]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalyticsOverview;
