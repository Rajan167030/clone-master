import { Router } from "express";
import {
  getCloudinaryUploadSignature,
  listAdminMembers,
  createAdminMember,
  deleteAdminMember,
} from "../controllers/admin.controller.js";
import {
  createAdminPartnerLogo,
  createAdminGalleryImage,
  createAdminBlog,
  createAdminEvent,
  createAdminTestimonial,
  createAdminSpeakerInvestorProfile,
  deleteAdminPartnerLogo,
  deleteAdminGalleryImage,
  deleteAdminBlog,
  deleteAdminEvent,
  deleteAdminTestimonial,
  deleteAdminSpeakerInvestorProfile,
  getAdminSiteNotice,
  listAdminGalleryImages,
  listAdminPartnerLogos,
  listAdminBlogs,
  listAdminEvents,
  listAdminTestimonials,
  listAdminSpeakerInvestorProfiles,
  updateAdminGalleryImage,
  updateAdminPartnerLogo,
  updateAdminSiteNotice,
  updateAdminBlog,
  updateAdminEvent,
  updateAdminTestimonial,
  updateAdminSpeakerInvestorProfile,
  listAdminSliderPromotions,
  createAdminSliderPromotion,
  updateAdminSliderPromotion,
  deleteAdminSliderPromotion,
} from "../controllers/content.controller.js";
import { listSubscribersAdmin } from "../controllers/newsletter.controller.js";
import { getConsentStats } from "../controllers/cookie-consent.controller.js";
import { sendBulkEmail } from "../controllers/email-automation.controller.js";
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  previewTemplate,
  createCampaign,
  listCampaigns,
  getCampaign,
  getCampaignLogs,
} from "../controllers/campaigns.controller.js";
import { listAdminPartnerInquiries, updateAdminPartnerInquiryStatus } from "../controllers/partner-inquiry.controller.js";
import {
  listAdminPartnerTypes,
  createAdminPartnerType,
  updateAdminPartnerType,
  deleteAdminPartnerType,
} from "../controllers/partner-type.controller.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import {
  deleteAdminActivityStartup,
  deleteAdminActivityInvestor,
  announceAdminActivityResults,
  resetAdminActivityResults,
} from "../controllers/activity-admin.controller.js";
import { requireSuperAdmin } from "../middlewares/admin.middleware.js";
import {
  createTask,
  listTasks,
  assignTask,
  updateTaskStatus,
  deleteTask,
  listAdmins,
  updateAdminRole,
  createAdmin,
  deleteAdminAccount,
} from "../controllers/task.controller.js";
import { listAdminJoinRequests, updateAdminJoinRequestStatus } from "../controllers/join.controller.js";
import { listAdminFundingApplications } from "../controllers/funding.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  listAdminEventInterests,
  listAdminMembersDetailed,
} from "../controllers/admin.controller.js";
import {
  listAdminInvestorInvites,
  createAdminInvestorInvite,
  revokeAdminInvestorInvite,
  reactivateAdminInvestorInvite,
  deleteAdminInvestorInvite,
  listAdminInvestorLeads,
  listAdminInvestorInviteJoiners,
} from "../controllers/investor-invite.controller.js";
import { auditLogger } from "../middlewares/audit.middleware.js";
import { listAuditLogs } from "../controllers/audit.controller.js";
import { sendAdminMessage, listAdminMessages, listChatParticipants } from "../controllers/admin-chat.controller.js";

import {
  getAdminTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/team.controller.js";

const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);
adminRouter.use(auditLogger);

adminRouter.get("/members", listAdminMembers);
adminRouter.post("/members", createAdminMember);
adminRouter.delete("/members/:id", deleteAdminMember);
adminRouter.post("/cloudinary/sign-upload", getCloudinaryUploadSignature);

adminRouter.get("/team", getAdminTeamMembers);
adminRouter.post("/team", createTeamMember);
adminRouter.patch("/team/:id", updateTeamMember);
adminRouter.put("/team/:id", updateTeamMember);
adminRouter.delete("/team/:id", deleteTeamMember);

adminRouter.get("/events", listAdminEvents);
adminRouter.post("/events", createAdminEvent);
adminRouter.patch("/events/:slug", updateAdminEvent);
adminRouter.delete("/events/:slug", deleteAdminEvent);


adminRouter.get("/speaker-investors", listAdminSpeakerInvestorProfiles);
adminRouter.post("/speaker-investors", createAdminSpeakerInvestorProfile);
adminRouter.patch("/speaker-investors/:slug", updateAdminSpeakerInvestorProfile);
adminRouter.delete("/speaker-investors/:slug", deleteAdminSpeakerInvestorProfile);

adminRouter.get("/blogs", listAdminBlogs);
adminRouter.post("/blogs", createAdminBlog);
adminRouter.patch("/blogs/:slug", updateAdminBlog);
adminRouter.delete("/blogs/:slug", deleteAdminBlog);

adminRouter.get("/site-notice", getAdminSiteNotice);
adminRouter.put("/site-notice", updateAdminSiteNotice);

adminRouter.get("/cookie-consent", getConsentStats);

adminRouter.get("/slider-promotions", listAdminSliderPromotions);
adminRouter.post("/slider-promotions", createAdminSliderPromotion);
adminRouter.patch("/slider-promotions/:id", updateAdminSliderPromotion);
adminRouter.delete("/slider-promotions/:id", deleteAdminSliderPromotion);

adminRouter.get("/partners", listAdminPartnerLogos);
adminRouter.post("/partners", createAdminPartnerLogo);
adminRouter.patch("/partners/:id", updateAdminPartnerLogo);
adminRouter.delete("/partners/:id", deleteAdminPartnerLogo);
adminRouter.get("/gallery", listAdminGalleryImages);
adminRouter.post("/gallery", createAdminGalleryImage);
adminRouter.patch("/gallery/:id", updateAdminGalleryImage);
adminRouter.delete("/gallery/:id", deleteAdminGalleryImage);
adminRouter.get("/testimonials", listAdminTestimonials);
adminRouter.post("/testimonials", createAdminTestimonial);
adminRouter.patch("/testimonials/:id", updateAdminTestimonial);
adminRouter.delete("/testimonials/:id", deleteAdminTestimonial);
adminRouter.get("/partner-inquiries", listAdminPartnerInquiries);
adminRouter.patch("/partner-inquiries/:id/status", updateAdminPartnerInquiryStatus);
adminRouter.get("/event-interests", listAdminEventInterests);
adminRouter.get("/partner-types", listAdminPartnerTypes);
adminRouter.post("/partner-types", createAdminPartnerType);
adminRouter.patch("/partner-types/:slug", updateAdminPartnerType);
adminRouter.delete("/partner-types/:slug", deleteAdminPartnerType);

adminRouter.get("/newsletter/subscribers", listSubscribersAdmin);
adminRouter.post("/email-automation/send", sendBulkEmail);
// Email templates
adminRouter.get('/templates', listTemplates);
adminRouter.post('/templates', createTemplate);
adminRouter.put('/templates/:id', updateTemplate);
adminRouter.delete('/templates/:id', deleteTemplate);
adminRouter.post('/templates/preview', previewTemplate);

// Campaigns
adminRouter.post('/campaigns', createCampaign);
adminRouter.get('/campaigns', listCampaigns);
adminRouter.get('/campaigns/:id', getCampaign);
adminRouter.get('/campaigns/:id/logs', getCampaignLogs);
adminRouter.get("/join-requests", listAdminJoinRequests);
adminRouter.patch("/join-requests/:id/status", updateAdminJoinRequestStatus);
adminRouter.get("/funding-applications", listAdminFundingApplications);

adminRouter.get("/investors-directory", listAdminInvestorLeads);
adminRouter.get("/members-directory", listAdminMembersDetailed);

adminRouter.delete("/activity/startups/:id", deleteAdminActivityStartup);
adminRouter.delete("/activity/investors/:id", deleteAdminActivityInvestor);
adminRouter.post("/activity/results", announceAdminActivityResults);
adminRouter.delete("/activity/results", resetAdminActivityResults);

adminRouter.get("/investor-invites", listAdminInvestorInvites);
adminRouter.post("/investor-invites", createAdminInvestorInvite);
adminRouter.get("/investor-invites/:id/joiners", listAdminInvestorInviteJoiners);
adminRouter.patch("/investor-invites/:id/revoke", revokeAdminInvestorInvite);
adminRouter.patch("/investor-invites/:id/reactivate", reactivateAdminInvestorInvite);
adminRouter.delete("/investor-invites/:id", deleteAdminInvestorInvite);

// Super-admin routes: manage admins and tasks
adminRouter.get("/super/admins", requireSuperAdmin, listAdmins);
adminRouter.patch("/super/admins/:id/role", requireSuperAdmin, updateAdminRole);
adminRouter.post("/super/admins", requireSuperAdmin, createAdmin);
adminRouter.delete("/super/admins/:id", requireSuperAdmin, deleteAdminAccount);

adminRouter.post("/super/tasks", requireSuperAdmin, createTask);
adminRouter.get("/super/tasks", requireAdmin, listTasks); // admins can view tasks
adminRouter.patch("/super/tasks/:id/assign", requireSuperAdmin, assignTask);
adminRouter.patch("/super/tasks/:id/status", requireAdmin, updateTaskStatus);
adminRouter.delete("/super/tasks/:id", requireSuperAdmin, deleteTask);

// Super-admin: activity/audit history across the admin panel
adminRouter.get("/super/audit-logs", requireSuperAdmin, listAuditLogs);

// Admin-to-admin chat (any admin or superadmin)
adminRouter.get("/chat/participants", listChatParticipants);
adminRouter.get("/chat/messages", listAdminMessages);
adminRouter.post("/chat/messages", sendAdminMessage);

export default adminRouter;
