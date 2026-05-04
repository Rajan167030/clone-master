import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileCard from "@/components/ProfileCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, MapPin, Briefcase, Calendar } from "lucide-react";
import { toast } from "sonner";
import { getToken } from "@/lib/session";

interface PublicProfile {
  id: string;
  fullName: string;
  role: "user" | "investor" | "founder";
  city: string;
  headline?: string;
  profilePhoto?: string;
  profileId: string;
  roleDetails?: Record<string, any>;
  createdAt?: string;
}

const roleInfo: Record<string, { label: string; icon: string; color: string }> = {
  user: { label: "Community Member", icon: "👤", color: "bg-blue-100 text-blue-700" },
  investor: { label: "Investor", icon: "💰", color: "bg-green-100 text-green-700" },
  founder: { label: "Founder", icon: "🚀", color: "bg-purple-100 text-purple-700" },
};

const PublicProfile = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const token = useMemo(() => getToken(), []);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) {
      setError("Profile ID not provided");
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `/api/profile/public/${profileId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError("Profile not found");
          } else {
            setError("Failed to load profile");
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setProfile(data.profile);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-lg font-semibold text-red-900 mb-4">
              {error || "Profile not found"}
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const info = roleInfo[profile.role] || roleInfo.user;
  const createdDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <ProfileCard
              fullName={profile.fullName}
              role={profile.role}
              city={profile.city}
              headline={profile.headline || "Building the future"}
              profilePhoto={profile.profilePhoto}
              profileId={profile.profileId}
              cardColors={profile.cardColors}
            />
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="mb-4 inline-block">
                <span className={`${info.color} rounded-full px-4 py-2 text-sm font-semibold`}>
                  {info.icon} {info.label}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {profile.fullName}
              </h1>
              {profile.headline && (
                <p className="text-lg text-gray-600 italic">"{profile.headline}"</p>
              )}
            </div>

            {/* Basic Info Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <MapPin size={16} />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile.city}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Calendar size={16} />
                    Joined
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-gray-900">
                    {createdDate || "Recently"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Role-Specific Info */}
            {profile.role === "founder" && profile.roleDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase size={18} />
                    Startup Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.roleDetails.startupName && (
                    <div>
                      <p className="text-sm text-gray-600">Startup</p>
                      <p className="font-semibold text-gray-900">
                        {profile.roleDetails.startupName}
                      </p>
                    </div>
                  )}
                  {profile.roleDetails.startupStage && (
                    <div>
                      <p className="text-sm text-gray-600">Stage</p>
                      <p className="font-semibold text-gray-900 capitalize">
                        {profile.roleDetails.startupStage.replace("-", " ")}
                      </p>
                    </div>
                  )}
                  {profile.roleDetails.teamSize && (
                    <div>
                      <p className="text-sm text-gray-600">Team Size</p>
                      <p className="font-semibold text-gray-900">
                        {profile.roleDetails.teamSize} members
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {profile.role === "investor" && profile.roleDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase size={18} />
                    Investment Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.roleDetails.investmentRange && (
                    <div>
                      <p className="text-sm text-gray-600">Investment Range</p>
                      <p className="font-semibold text-gray-900">
                        {profile.roleDetails.investmentRange.currency}{" "}
                        {profile.roleDetails.investmentRange.min} -{" "}
                        {profile.roleDetails.investmentRange.max}
                      </p>
                    </div>
                  )}
                  {profile.roleDetails.focusSector && (
                    <div>
                      <p className="text-sm text-gray-600">Focus Sectors</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {profile.roleDetails.focusSector.map((sector: string) => (
                          <span
                            key={sector}
                            className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                          >
                            {sector}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Connect Button */}
            {token && (
              <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
                <MessageSquare size={18} className="mr-2" />
                Connect & Message
              </Button>
            )}

            {!token && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="mb-4 text-gray-600">
                    Sign in to connect with {profile.fullName}
                  </p>
                  <Button
                    onClick={() => navigate("/login")}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PublicProfile;
