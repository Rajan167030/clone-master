import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import RegistrationHub from "./pages/RegistrationHub.tsx";
import RegisterUser from "./pages/RegisterUser.tsx";
import RegisterInvestor from "./pages/RegisterInvestor.tsx";
import RegisterFounder from "./pages/RegisterFounder.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Profile from "./pages/Profile.tsx";
import NotFound from "./pages/NotFound.tsx";
import EventDetails from "./pages/EventDetails.tsx";
import About from "./pages/About.tsx";
import Blog from "./pages/Blog.tsx";
import BlogDetails from "./pages/BlogDetails.tsx";
import Events from "./pages/Events.tsx";
import Membership from "./pages/Membership.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import TermsOfService from "./pages/TermsOfService.tsx";
import JoinUs from "./pages/JoinUs.tsx";
import PartnerWithUs from "./pages/PartnerWithUs.tsx";
import AIChatbot from "@/components/AIChatbot";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegistrationHub />} />
          <Route path="/register/user" element={<RegisterUser />} />
          <Route path="/register/investor" element={<RegisterInvestor />} />
          <Route path="/register/founder" element={<RegisterFounder />} />
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute allowedRoles={["investor", "founder"]} redirectTo="/">
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route path="/profile/:profileId" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/join-us" element={<JoinUs />} />
          <Route path="/partner-with-us" element={<PartnerWithUs />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetails />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route
            path="/admin"
            element={(
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            )}
          />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:slug" element={<EventDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIChatbot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
