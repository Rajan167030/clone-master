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
