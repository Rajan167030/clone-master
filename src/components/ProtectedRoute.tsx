import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAccount, getToken } from "@/lib/session";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: string[];
  allowedRole?: string; // Kept for backward compatibility
  redirectTo?: string;
};

const ProtectedRoute = ({
  children,
  allowedRoles,
  allowedRole,
  redirectTo = "/",
}: ProtectedRouteProps) => {
  const location = useLocation();
  const token = getToken();
  const account = getAccount();

  if (!token) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  // Check single role (backward compatibility)
  if (allowedRole && account?.role !== allowedRole) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check multiple roles
  if (allowedRoles && !allowedRoles.includes(account?.role || "")) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
