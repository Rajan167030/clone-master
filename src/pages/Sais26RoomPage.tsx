import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Sais26Room from "@/components/Sais26Room";
import { getAccount, getToken } from "@/lib/session";

const Sais26RoomPage = () => {
  const account = getAccount();
  const token = getToken() || undefined;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-purple-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-slate-900">SAIS'26 Room</h1>
        </div>
        <p className="text-sm text-slate-600 mb-6 max-w-2xl">
          Welcome, {account?.fullName || "Investor"}. Browse startups from the Bangalore event, preview pitch decks, and submit your evaluations.
        </p>
        <Sais26Room viewerRole="investor" authToken={token} />
      </main>
      <Footer />
    </div>
  );
};

export default Sais26RoomPage;
