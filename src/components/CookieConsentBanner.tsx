import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logCookieConsentApi } from "@/lib/api";
import { getToken } from "@/lib/session";

const CONSENT_KEY = "fc_cookie_consent";
const VISITOR_ID_KEY = "fc_visitor_id";

const getOrCreateVisitorId = () => {
  try {
    let id = window.localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const applyConsent = (granted: boolean) => {
  const state = granted ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
};

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CONSENT_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const choose = (choice: "accepted" | "denied") => {
    try {
      window.localStorage.setItem(CONSENT_KEY, choice);
    } catch {
      // localStorage unavailable — just dismiss for this session.
    }
    applyConsent(choice === "accepted");
    setVisible(false);

    logCookieConsentApi(
      { visitorId: getOrCreateVisitorId(), choice, path: window.location.pathname },
      getToken(),
    ).catch(() => {
      // Logging is for admin visibility only — never block the user's choice on it.
    });
  };

  if (!visible) return null;

  return (
    <div className="app-safe-bottom fixed inset-x-0 bottom-0 z-[100] px-4 pb-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
            <Cookie size={18} />
          </div>
          <p className="text-sm text-slate-600">
            We use cookies for analytics and personalization. Accept to help us improve Founders Connect, or deny and
            we'll only use what's needed to run the site. Read our{" "}
            <Link to="/privacy-policy" className="font-medium text-violet-700 underline underline-offset-2 hover:text-violet-800">
              Privacy Policy
            </Link>{" "}
            to learn more.
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => choose("denied")}>
            Deny
          </Button>
          <Button size="sm" onClick={() => choose("accepted")} className="bg-violet-600 hover:bg-violet-700">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
