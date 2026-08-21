import crypto from "crypto";

// Short, readable, still hard to guess — meant to be copy-pasted from an email, not typed.
export const generateSimplePassword = () => {
  const raw = crypto.randomBytes(6).toString("base64").replace(/[+/=]/g, "");
  return `${raw.slice(0, 8)}${crypto.randomInt(10, 99)}`;
};
