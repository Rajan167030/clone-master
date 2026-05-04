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
    <form onSubmit={submit} className="mt-6 max-w-md space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground"
          autoComplete="name"
          maxLength={80}
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground"
          autoComplete="email"
          required
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
        {message && (
          <p className={`text-sm ${isError ? "text-destructive" : "text-muted-foreground"}`} aria-live="polite">
            {message}
          </p>
        )}
      </div>
    </form>
  );
};

export default SubscribeForm;
