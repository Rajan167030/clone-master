import jwt from "jsonwebtoken";

const DEFAULT_SECRET = "change-this-in-production";

const resolveRole = (account) =>
  account?.role ||
  account?.get?.("role") ||
  account?.toObject?.()?.role ||
  null;

export const signAuthToken = (account) => {
  const payload = {
    id: String(account._id),
    sub: String(account._id),
    role: resolveRole(account),
    email: account.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || DEFAULT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyAuthToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET || DEFAULT_SECRET);
