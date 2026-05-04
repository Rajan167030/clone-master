import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { getToken } from "@/lib/session";

interface AnalyticsData {
  totalScans: number;
  scansOverTime: Array<{ _id: { date: string }; count: number }>;
  scansByRole: Array<{ _id: string; count: number }>;
  scansByDevice: Array<{ _id: string; count: number }>;
  recentScans: Array<{
    scannedAt: string;
    scannedBy: string;
    role: string;
    device: string;
    method: string;
  }>;
}

const COLORS = ["#667eea", "#764ba2", "#40e0d0", "#ff6b6b"];

export const QRAnalyticsDashboard = () => {
  const token = useMemo(() => getToken(), []);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/profile/analytics/scans", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const data = await response.json();
        setAnalytics(data.analytics);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load analytics";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-700">{error || "No analytics data available"}</p>
        </CardContent>
      </Card>
    );
  }

  // Format data for charts
  const scansOverTimeData = analytics.scansOverTime?.map((item) => ({
    date: item._id?.date || "Unknown",
    scans: item.count || 0,
  })) || [];

  const scansByRoleData = analytics.scansByRole?.map((item) => ({
    name: item._id?.charAt(0).toUpperCase() + item._id?.slice(1) || "Unknown",
    value: item.count || 0,
  })) || [];

  const scansByDeviceData = analytics.scansByDevice?.map((item) => ({
    name: item._id?.charAt(0).toUpperCase() + item._id?.slice(1) || "Unknown",
    value: item.count || 0,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>QR Code Scan Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
              <p className="text-sm font-medium text-blue-600">Total Scans</p>
              <p className="mt-2 text-3xl font-bold text-blue-900">{analytics.totalScans}</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4">
              <p className="text-sm font-medium text-purple-600">Unique Roles</p>
              <p className="mt-2 text-3xl font-bold text-purple-900">
                {analytics.scansByRole?.length || 0}
              </p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4">
              <p className="text-sm font-medium text-green-600">Devices Used</p>
              <p className="mt-2 text-3xl font-bold text-green-900">
                {analytics.scansByDevice?.length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Scans Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Scans Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {scansOverTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scansOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="scans" stroke="#667eea" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-10 text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Scans by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Scans by User Role</CardTitle>
          </CardHeader>
          <CardContent>
            {scansByRoleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={scansByRoleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {scansByRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-10 text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Scans by Device */}
        <Card>
          <CardHeader>
            <CardTitle>Scans by Device Type</CardTitle>
          </CardHeader>
          <CardContent>
            {scansByDeviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scansByDeviceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#764ba2" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-10 text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Scans */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentScans && analytics.recentScans.length > 0 ? (
              <div className="space-y-3">
                {analytics.recentScans.map((scan, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                    <div>
                      <p className="font-medium text-gray-900">{scan.scannedBy}</p>
                      <p className="text-xs text-gray-500">
                        {scan.role} • {scan.device}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-700">{scan.method.toUpperCase()}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(scan.scannedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-10 text-gray-500">No recent scans</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRAnalyticsDashboard;
