import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CalendarCheck2, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSession, getAccount, isAuthenticated } from "@/lib/session";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const authed = isAuthenticated();
  const account = getAccount();

  const navLinks = [
    { to: "/about", label: "About" },
    { to: "/events", label: "Events" },
    { to: "/blog", label: "Blog" },
    
    { to: "/partner-with-us", label: "Partner With Us" },
    { to: "/membership", label: "Membership" },
  ];
  const isAdmin = account?.role === "admin";

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={authed ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="font-heading text-lg font-bold text-foreground">Founders Connect</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`transition-colors hover:text-foreground ${
                location.pathname === link.to ? "text-foreground" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {authed ? (
            <>
              <div className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                Signed in as {account?.fullName || account?.email || "Member"}
              </div>
              <Button asChild size="sm" variant="outline" className="gap-2">
                <Link to="/events">
                  <CalendarCheck2 size={15} />
                  Events
                </Link>
              </Button>
              {isAdmin && (
                <Button asChild size="sm" variant="outline" className="gap-2">
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
              <Button asChild size="sm" className="gap-2 bg-gradient-primary text-primary-foreground">
                <Link to={isAdmin ? "/admin" : "/dashboard"}>
                  <LayoutDashboard size={15} />
                  {isAdmin ? "Admin Panel" : "Dashboard"}
                </Link>
              </Button>
              <Button type="button" size="sm" variant="ghost" className="gap-2" onClick={handleLogout}>
                <LogOut size={15} />
                Logout
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="bg-gradient-primary font-semibold text-primary-foreground hover:opacity-90">
              <Link to="/login">Member Login</Link>
            </Button>
          )}
        </div>

        <button
          type="button"
          className="text-foreground md:hidden"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-3 border-t border-border bg-background/95 px-4 py-4 text-sm text-muted-foreground md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="transition-colors hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {authed ? (
            <>
              <Link
                to={isAdmin ? "/admin" : "/dashboard"}
                className="transition-colors hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                {isAdmin ? "Admin Panel" : "Dashboard"}
              </Link>
              <button
                type="button"
                className="text-left transition-colors hover:text-foreground"
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Button asChild size="sm" className="mt-1 bg-gradient-primary font-semibold text-primary-foreground hover:opacity-90">
              <Link to="/login" onClick={() => setIsOpen(false)}>
                Member Login
              </Link>
            </Button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
