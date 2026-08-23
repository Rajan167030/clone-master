import { verifyAuthToken } from "../utils/jwt.js";

export const requireAuth = (req, res, next) => {
  try {
    const rawAuth = req.headers.authorization || "";
    const token = rawAuth.startsWith("Bearer ") ? rawAuth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Authorization token missing." });
    }

    const payload = verifyAuthToken(token);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Founder and investor accounts are the platform's premium tier — gates premium-only features.
export const requirePremium = (req, res, next) => {
  if (!["founder", "investor"].includes(req.user?.role)) {
    return res.status(403).json({ message: "This feature is available to premium (founder/investor) members only." });
  }
  return next();
};

// Attaches req.user when a valid token is present, but never blocks the request.
export const optionalAuth = (req, res, next) => {
  try {
    const rawAuth = req.headers.authorization || "";
    const token = rawAuth.startsWith("Bearer ") ? rawAuth.slice(7) : null;
    if (token) {
      req.user = verifyAuthToken(token);
    }
  } catch (error) {
    // Ignore invalid/expired tokens on optional routes.
  }
  return next();
};
