import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import Sais26Room from "@/components/Sais26Room";

const AdminSais26Room = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-purple-700 mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-slate-900">SAIS'26 Room — Admin View</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Everything investors and founders see inside the shared SAIS'26 room, for oversight only.
          </p>
        </div>
      </div>
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Sais26Room viewerRole="admin" />
      </main>
    </div>
  );
};

export default AdminSais26Room;
