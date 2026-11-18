import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import RegisterUser from "./pages/RegisterUser.tsx";
import RegisterInvestor from "./pages/RegisterInvestor.tsx";
import RegisterFounder from "./pages/RegisterFounder.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Profile from "./pages/Profile.tsx";
import NotFound from "./pages/NotFound.tsx";
import AIChatbot from "@/components/AIChatbot";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminInvestors from "./pages/AdminInvestors.tsx";
import AdminMembers from "./pages/AdminMembers.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";

const AdminSpeakerInvestors = lazy(() => import("./pages/AdminSpeakerInvestors.tsx"));
const AdminCohorts = lazy(() => import("./pages/AdminCohorts.tsx"));
const AdminTeam = lazy(() => import("./pages/AdminTeam.tsx"));
const About = lazy(() => import("./pages/About.tsx"));

const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogDetails = lazy(() => import("./pages/BlogDetails.tsx"));
const Events = lazy(() => import("./pages/Events.tsx"));
const EventDetails = lazy(() => import("./pages/EventDetails.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.tsx"));
const JoinUs = lazy(() => import("./pages/JoinUs.tsx"));
const Chapters = lazy(() => import("./pages/Chapters.tsx"));
const Gallery = lazy(() => import("./pages/Gallery.tsx"));
const GetFunding = lazy(() => import("./pages/GetFunding.tsx"));
const PartnerWithUs = lazy(() => import("./pages/PartnerWithUs.tsx"));
const PastSpeakersInvestors = lazy(() => import("./pages/PastSpeakersInvestors.tsx"));
const CollegePartners = lazy(() => import("./pages/CollegePartners.tsx"));
const FundingApplication = lazy(() => import("./pages/FundingApplication.tsx"));
const ProductPage = lazy(() => import("./pages/ProductPage.tsx"));
const OurTeam = lazy(() => import("./pages/OurTeam.tsx"));
const BangaloreActivity = lazy(() => import("./pages/BangaloreActivity.tsx"));
const InvestorInviteRegister = lazy(() => import("./pages/InvestorInviteRegister.tsx"));
const QuickInvestorAccess = lazy(() => import("./pages/QuickInvestorAccess.tsx"));
const Sais26Leaderboard = lazy(() => import("./pages/Sais26Leaderboard.tsx"));
const Sais26RoomPage = lazy(() => import("./pages/Sais26RoomPage.tsx"));
const FounderRoomEntry = lazy(() => import("./pages/FounderRoomEntry.tsx"));
const InvestorRoomEntry = lazy(() => import("./pages/InvestorRoomEntry.tsx"));
const AdminSais26Room = lazy(() => import("./pages/AdminSais26Room.tsx"));
const Settings = lazy(() => import("./pages/Settings.tsx"));
const Community = lazy(() => import("./pages/Community.tsx"));
const CommunityMessages = lazy(() => import("./pages/CommunityMessages.tsx"));
const CommunityDirectory = lazy(() => import("./pages/CommunityDirectory.tsx"));
const Matchmaking = lazy(() => import("./pages/Matchmaking.tsx"));
const Mentors = lazy(() => import("./pages/Mentors.tsx"));
const MentorOnboard = lazy(() => import("./pages/MentorOnboard.tsx"));
const AdminMentorship = lazy(() => import("./pages/AdminMentorship.tsx"));
const Learn = lazy(() => import("./pages/Learn.tsx"));
const LearnCourse = lazy(() => import("./pages/LearnCourse.tsx"));
const MyLearning = lazy(() => import("./pages/MyLearning.tsx"));
const AdminLearning = lazy(() => import("./pages/AdminLearning.tsx"));
const AiTools = lazy(() => import("./pages/tools/AiTools.tsx"));
const PitchDeckBuilder = lazy(() => import("./pages/tools/PitchDeckBuilder.tsx"));
const PitchReviewPage = lazy(() => import("./pages/tools/PitchReview.tsx"));
const StartupValidation = lazy(() => import("./pages/tools/StartupValidation.tsx"));
const InvestorReadiness = lazy(() => import("./pages/tools/InvestorReadiness.tsx"));
const LearningAssistant = lazy(() => import("./pages/tools/LearningAssistant.tsx"));
const MyNetwork = lazy(() => import("./pages/network/MyNetwork.tsx"));
const EditFounderProfile = lazy(() => import("./pages/network/EditFounderProfile.tsx"));
const StartupDirectory = lazy(() => import("./pages/network/StartupDirectory.tsx"));
const StartupProfile = lazy(() => import("./pages/network/StartupProfile.tsx"));
const CofounderDiscovery = lazy(() => import("./pages/network/CofounderDiscovery.tsx"));
const CollabBoard = lazy(() => import("./pages/network/CollabBoard.tsx"));
const Groups = lazy(() => import("./pages/network/Groups.tsx"));
const GroupDetail = lazy(() => import("./pages/network/GroupDetail.tsx"));
const Opportunities = lazy(() => import("./pages/network/Opportunities.tsx"));
const OpportunityDetail = lazy(() => import("./pages/network/OpportunityDetail.tsx"));
const AdminCommunity = lazy(() => import("./pages/AdminCommunity.tsx"));
const InvestorsPublic = lazy(() => import("./pages/InvestorsPublic.tsx"));
const CityCommunities = lazy(() => import("./pages/CityCommunities.tsx"));
const CorporatePartners = lazy(() => import("./pages/CorporatePartners.tsx"));
const EcosystemPartners = lazy(() => import("./pages/EcosystemPartners.tsx"));
const CohortPage = lazy(() => import("./pages/CohortPage.tsx"));
const StartupResources = lazy(() => import("./pages/StartupResources.tsx"));
const BecomeAMember = lazy(() => import("./pages/BecomeAMember.tsx"));
const ContactUs = lazy(() => import("./pages/ContactUs.tsx"));
const FalconClub = lazy(() => import("./pages/FalconClub.tsx"));
const FalconClubVerify = lazy(() => import("./pages/FalconClubVerify.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CookieConsentBanner />
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/activity" element={<BangaloreActivity />} />
            <Route path="/bangalore-activity" element={<BangaloreActivity />} />
            <Route path="/login" element={<Login role="user" />} />
            <Route path="/login/user" element={<Login role="user" />} />
            <Route path="/login/founder" element={<Login role="founder" />} />
            <Route path="/register/user" element={<RegisterUser />} />
            <Route path="/register/investor" element={<RegisterInvestor />} />
            <Route path="/register/founder" element={<RegisterFounder />} />
            <Route path="/invite/:code" element={<InvestorInviteRegister />} />
            <Route path="/access/:code" element={<QuickInvestorAccess />} />
            <Route path="/sais26" element={<Sais26Leaderboard />} />
            <Route path="/sais26/founder/:accessToken" element={<FounderRoomEntry />} />
            <Route path="/sais26/investor/:accessToken" element={<InvestorRoomEntry />} />
            <Route
              path="/sais26/room"
              element={(
                <ProtectedRoute allowedRoles={["investor"]} redirectTo="/">
                  <Sais26RoomPage />
                </ProtectedRoute>
              )}
            />
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
            <Route
              path="/settings"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder"]} redirectTo="/">
                  <Settings />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/community"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder"]} redirectTo="/">
                  <Community />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/community/messages"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder"]} redirectTo="/">
                  <CommunityMessages />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/community/messages/:userId"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder"]} redirectTo="/">
                  <CommunityMessages />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/community/directory"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder"]} redirectTo="/">
                  <CommunityDirectory />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/matchmaking"
              element={(
                <ProtectedRoute allowedRoles={["investor", "founder"]} redirectTo="/community">
                  <Matchmaking />
                </ProtectedRoute>
              )}
            />
            <Route path="/about" element={<About />} />
            <Route path="/join-us" element={<JoinUs />} />
            <Route path="/falcon-club" element={<FalconClub />} />
            <Route path="/fable-club" element={<FalconClub />} />
            <Route path="/falcon-club/verify/:token" element={<FalconClubVerify />} />
            <Route path="/become-a-member" element={<BecomeAMember />} />
            <Route path="/membership" element={<BecomeAMember />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/chapters" element={<Chapters />} />
            <Route path="/city-communities" element={<CityCommunities />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/mentors/join/:token" element={<MentorOnboard />} />
            <Route path="/learn" element={<Learn />} />
            <Route
              path="/learn/my"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder", "admin", "superadmin"]} redirectTo="/login">
                  <MyLearning />
                </ProtectedRoute>
              )}
            />
            <Route path="/learn/:slug" element={<LearnCourse />} />
            <Route path="/tools" element={<AiTools />} />
            <Route path="/startups" element={<StartupDirectory />} />
            <Route path="/startups/:slug" element={<StartupProfile />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/opportunities/:slug" element={<OpportunityDetail />} />
            <Route
              path="/network"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder", "admin", "superadmin"]} redirectTo="/login">
                  <MyNetwork />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/network/profile"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder", "admin", "superadmin"]} redirectTo="/login">
                  <EditFounderProfile />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/network/cofounders"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder", "admin", "superadmin"]} redirectTo="/login">
                  <CofounderDiscovery />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/network/collab"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder", "admin", "superadmin"]} redirectTo="/login">
                  <CollabBoard />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/groups"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder", "admin", "superadmin"]} redirectTo="/login">
                  <Groups />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/groups/:slug"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder", "admin", "superadmin"]} redirectTo="/login">
                  <GroupDetail />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/tools/pitch-deck"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder", "admin", "superadmin"]} redirectTo="/login">
                  <PitchDeckBuilder />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/tools/pitch-review"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder", "admin", "superadmin"]} redirectTo="/login">
                  <PitchReviewPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/tools/validation"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder", "admin", "superadmin"]} redirectTo="/login">
                  <StartupValidation />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/tools/investor-readiness"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder", "admin", "superadmin"]} redirectTo="/login">
                  <InvestorReadiness />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/tools/assistant"
              element={(
                <ProtectedRoute allowedRoles={["user", "investor", "founder", "admin", "superadmin"]} redirectTo="/login">
                  <LearningAssistant />
                </ProtectedRoute>
              )}
            />
            <Route path="/investors" element={<InvestorsPublic />} />
            <Route path="/speakers" element={<PastSpeakersInvestors />} />
            <Route path="/corporate-partners" element={<CorporatePartners />} />
            <Route path="/ecosystem-partners" element={<EcosystemPartners />} />
            <Route path="/cohorts" element={<CohortPage />} />
            <Route path="/cohorts/d2c" element={<CohortPage />} />
            <Route path="/cohorts/upcoming" element={<CohortPage />} />
            <Route path="/startup-resources" element={<StartupResources />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/get-funding" element={<GetFunding />} />
            <Route path="/funding-application" element={<FundingApplication />} />
            <Route path="/college-partners" element={<CollegePartners />} />
            <Route path="/partner-with-us" element={<PartnerWithUs />} />
            <Route path="/past-speakers-investors" element={<PastSpeakersInvestors />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetails />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route
              path="/admin"
              element={(
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin/speaker-investors"
              element={(
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <AdminSpeakerInvestors />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin/community"
              element={(
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <AdminCommunity />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin/learning"
              element={(
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <AdminLearning />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin/mentorship"
              element={(
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <AdminMentorship />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin/cohorts"
              element={(
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <AdminCohorts />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin/investors"
              element={(
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <AdminInvestors />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin/members"
              element={(
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <AdminMembers />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin/team"
              element={(
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <AdminTeam />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin/sais26-room"
              element={(
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <AdminSais26Room />
                </ProtectedRoute>
              )}
            />
            <Route path="/events" element={<Events />} />

            <Route path="/events/:slug" element={<EventDetails />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/team" element={<OurTeam />} />
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
