import { useState } from "react";
import { newsletterSubscribeApi } from "@/lib/api";

const SubscribeForm = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    if (!email.trim()) {
      setIsError(true);
      setMessage("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await newsletterSubscribeApi({ email: email.trim(), name: name.trim() });
      setMessage(res.message || "Subscribed!");
      setEmail("");
      setName("");
    } catch (err: any) {
      setIsError(true);
      setMessage(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-2 w-full space-y-3">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
          autoComplete="name"
          maxLength={80}
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
          autoComplete="email"
          required
        />
      </div>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/95 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 px-5 py-2.5"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
        {message && (
          <p className={`text-sm font-medium ${isError ? "text-red-500" : "text-emerald-500 dark:text-emerald-400"}`} aria-live="polite">
            {message}
          </p>
        )}
      </div>
    </form>
  );
};

export default SubscribeForm;
