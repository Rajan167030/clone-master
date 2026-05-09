import { lazy, Suspense } from "react";
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
import AIChatbot from "@/components/AIChatbot";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminSpeakerInvestors from "./pages/AdminSpeakerInvestors.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";

const About = lazy(() => import("./pages/About.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogDetails = lazy(() => import("./pages/BlogDetails.tsx"));
const Events = lazy(() => import("./pages/Events.tsx"));
const EventDetails = lazy(() => import("./pages/EventDetails.tsx"));
const Membership = lazy(() => import("./pages/Membership.tsx"));
const Welcome = lazy(() => import("./pages/Welcome.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.tsx"));
const JoinUs = lazy(() => import("./pages/JoinUs.tsx"));
const Gallery = lazy(() => import("./pages/Gallery.tsx"));
const GetFunding = lazy(() => import("./pages/GetFunding.tsx"));
const PartnerWithUs = lazy(() => import("./pages/PartnerWithUs.tsx"));
const PastSpeakersInvestors = lazy(() => import("./pages/PastSpeakersInvestors.tsx"));
const CollegePartners = lazy(() => import("./pages/CollegePartners.tsx"));
const FundingApplication = lazy(() => import("./pages/FundingApplication.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegistrationHub />} />
            <Route path="/register/user" element={<RegisterUser />} />
            <Route path="/register/investor" element={<RegisterInvestor />} />
            <Route path="/register/founder" element={<RegisterFounder />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/dashboard"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder"]} redirectTo="/">
                  <Dashboard />
                </ProtectedRoute>
              )}
            />
            <Route path="/profile/:profileId" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/join-us" element={<JoinUs />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/get-funding" element={<GetFunding />} />
            <Route path="/funding-application" element={<FundingApplication />} />
            <Route path="/college-partners" element={<CollegePartners />} />
            <Route path="/partner-with-us" element={<PartnerWithUs />} />
            <Route path="/past-speakers-investors" element={<PastSpeakersInvestors />} />
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
            <Route
              path="/admin/speaker-investors"
              element={(
                <ProtectedRoute allowedRole="admin">
                  <AdminSpeakerInvestors />
                </ProtectedRoute>
              )}
            />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetails />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <AIChatbot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
