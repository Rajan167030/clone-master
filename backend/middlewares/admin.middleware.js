export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  return next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "superadmin") {
    return res.status(403).json({ message: "Super admin access required." });
  }

  return next();
};
