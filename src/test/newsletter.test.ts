import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.resetModules();
  vi.clearAllMocks();
});

describe("newsletter email utilities", () => {
  it("detects missing SMTP configuration", async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;

    const { isEmailConfigured } = await import("../../backend/utils/email.js");

    expect(isEmailConfigured()).toBe(false);
  });

  it("detects SMTP configuration from SMTP env vars", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "sender@example.com";
    process.env.SMTP_PASS = "secret";

    const { isEmailConfigured } = await import("../../backend/utils/email.js");

    expect(isEmailConfigured()).toBe(true);
  });

  it("throws when sending is required but SMTP is missing", async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;

    const { sendEmail } = await import("../../backend/utils/email.js");

    await expect(
      sendEmail({
        to: "founder@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
        requireConfigured: true,
      }),
    ).rejects.toThrow("SMTP is not configured");
  });

  it("marks dev sends as skipped when SMTP is missing and not required", async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;

    const { sendEmail } = await import("../../backend/utils/email.js");

    await expect(
      sendEmail({
        to: "founder@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
      }),
    ).resolves.toMatchObject({ ok: false, skipped: true, info: "smtp-not-configured" });
  });
});
