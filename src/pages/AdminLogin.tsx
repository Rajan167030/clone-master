import { useNavigate } from "react-router-dom";
import { Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminLoginApi } from "@/lib/api";
import { setSession } from "@/lib/session";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();

    if (!email || !password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    adminLoginApi({ email, password })
      .then((response) => {
        toast({
          title: "Admin Authenticated",
          description: "Login successful. Redirecting to portal...",
        });
        setSession(response.token, response.account);
        setTimeout(() => navigate("/admin", { replace: true }), 1000);
      })
      .catch((error) => {
        toast({
          title: "Access Denied",
          description: error instanceof Error ? error.message : "Invalid credentials.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 sm:px-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-center text-3xl font-heading font-bold text-white tracking-tight">Staff Portal</h2>
          <p className="mt-2 text-center text-sm text-slate-400">Restricted access area. Unauthorized access is forbidden.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Admin Email"
                className="h-12 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                className="h-12 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full rounded-xl bg-rose-600 text-base font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
          >
            {isLoading ? "Authenticating..." : "AUTHORIZE"}
            <Lock className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </main>
  );
};

export default AdminLogin;
