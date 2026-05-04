import { useEffect, useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  sendEmailVerificationCodeApi,
  verifyEmailCodeApi,
  type EmailVerificationPurpose,
} from "@/lib/api";

type EmailVerificationBoxProps = {
  email: string;
  purpose: EmailVerificationPurpose;
  token: string;
  onVerified: (token: string) => void;
  onReset?: () => void;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const EmailVerificationBox = ({
  email,
  purpose,
  token,
  onVerified,
  onReset,
}: EmailVerificationBoxProps) => {
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [sentTo, setSentTo] = useState("");

  const normalizedEmail = normalizeEmail(email);
  const canSend = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail);
  const isVerified = Boolean(token);

  useEffect(() => {
    if (sentTo && normalizedEmail !== sentTo) {
      setCode("");
      setMessage("");
      setSentTo("");
      onReset?.();
    }
  }, [normalizedEmail, onReset, sentTo]);

  const sendCode = async () => {
    if (!canSend) {
      setMessage("Enter a valid email address first.");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      const response = await sendEmailVerificationCodeApi({ email: normalizedEmail, purpose });
      setSentTo(normalizedEmail);
      setCode("");
      onReset?.();
      setMessage(response.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send verification code.");
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      setMessage("Enter the 6-digit code from your email.");
      return;
    }

    setVerifying(true);
    setMessage("");

    try {
      const response = await verifyEmailCodeApi({
        email: normalizedEmail,
        purpose,
        code: code.trim(),
      });
      onVerified(response.verificationToken);
      setMessage(response.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to verify code.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          {isVerified ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Mail className="h-4 w-4 text-slate-500" />}
          {isVerified ? "Email verified" : "Verify this email before submitting"}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={sendCode} disabled={sending || !canSend}>
          {sending ? "Sending..." : sentTo === normalizedEmail ? "Resend code" : "Send code"}
        </Button>
      </div>

      {!isVerified && sentTo === normalizedEmail && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit code"
            inputMode="numeric"
            maxLength={6}
            className="bg-white"
          />
          <Button type="button" onClick={verifyCode} disabled={verifying || code.length !== 6}>
            {verifying ? "Verifying..." : "Verify"}
          </Button>
        </div>
      )}

      {message && <p className="mt-2 text-xs text-slate-600">{message}</p>}
    </div>
  );
};

export default EmailVerificationBox;
