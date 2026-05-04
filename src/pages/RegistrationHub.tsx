import { User, TrendingUp, Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface RegistrationOption {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  highlights: string[];
  bgGradient: string;
}

const RegistrationHub = () => {
  const registrationOptions: RegistrationOption[] = [
    {
      title: "Join as a User",
      description: "Explore opportunities, network with founders and investors, and grow your professional network.",
      icon: <User size={40} />,
      color: "blue",
      path: "/register/user",
      highlights: [
        "Access to member events",
        "Networking opportunities",
        "Job marketplace",
        "Startup resources",
      ],
      bgGradient: "from-blue-50 to-blue-100",
    },
    {
      title: "Join as an Investor",
      description: "Discover promising startups, access curated founders directory, and manage your investment portfolio.",
      icon: <TrendingUp size={40} />,
      color: "green",
      path: "/register/investor",
      highlights: [
        "Founders directory",
        "Deal flow alerts",
        "Pitch events",
        "Portfolio tracking",
      ],
      bgGradient: "from-green-50 to-green-100",
    },
    {
      title: "Join as a Founder",
      description: "Get investor introductions, mentor support, and resources to help you scale your startup.",
      icon: <Rocket size={40} />,
      color: "purple",
      path: "/register/founder",
      highlights: [
        "Investor matchmaking",
        "Mentor calls",
        "Pitch feedback",
        "Exclusive resources",
      ],
      bgGradient: "from-purple-50 to-purple-100",
    },
  ];

  const colorClasses = {
    blue: {
      border: "border-blue-200",
      bg: "bg-blue-50",
      hover: "hover:border-blue-400 hover:shadow-lg hover:shadow-blue-200/50",
      icon: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
    },
    green: {
      border: "border-green-200",
      bg: "bg-green-50",
      hover: "hover:border-green-400 hover:shadow-lg hover:shadow-green-200/50",
      icon: "text-green-600",
      button: "bg-green-600 hover:bg-green-700",
    },
    purple: {
      border: "border-purple-200",
      bg: "bg-purple-50",
      hover: "hover:border-purple-400 hover:shadow-lg hover:shadow-purple-200/50",
      icon: "text-purple-600",
      button: "bg-purple-600 hover:bg-purple-700",
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Choose Your Role and <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-600 to-purple-600">Get Started</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Select the registration path that matches your role in the startup ecosystem. Each registration gives you access to tailored features and opportunities.
            </p>
          </div>

          {/* Registration Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {registrationOptions.map((option) => {
              const colors = colorClasses[option.color as keyof typeof colorClasses];
              return (
                <Link key={option.path} to={option.path}>
                  <Card
                    className={`h-full transition-all duration-300 cursor-pointer border-2 ${colors.border} ${colors.hover}`}
                  >
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-lg ${colors.bg} flex items-center justify-center mb-4 ${colors.icon}`}>
                        {option.icon}
                      </div>
                      <CardTitle className="text-2xl">{option.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600">{option.description}</p>

                      <div className="space-y-2 py-4">
                        <p className="text-sm font-semibold text-gray-900 uppercase tracking-widest">
                          You'll get:
                        </p>
                        <ul className="space-y-2">
                          {option.highlights.map((highlight, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-gray-700 flex items-center gap-2"
                            >
                              <div className={`w-2 h-2 rounded-full ${colors.bg}`} />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        className={`w-full ${colors.button} text-white font-semibold gap-2`}
                        size="lg"
                      >
                        Register Now <ArrowRight size={18} />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Your Role?</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold mt-1">✓</span>
                    <span>Personalized onboarding experience tailored to your goals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>Access to role-specific tools and resources</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold mt-1">✓</span>
                    <span>Connect with the right people in your category</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold mt-1">✓</span>
                    <span>Unlock exclusive benefits and opportunities</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Can You Change Later?</h3>
                <p className="text-gray-700 mb-4">
                  Yes! You can change your role or register with multiple accounts at any time. Some users create accounts in different roles to access all the benefits of the Founders Connect ecosystem.
                </p>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">Have questions?</span> Contact our support team at support@foundersconnect.in for assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Quick Links */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6">
              Want to learn more about our membership options?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/membership">
                  View Membership Plans <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black gap-2">
                <Link to="/login">
                  Already Have an Account? <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default RegistrationHub;
