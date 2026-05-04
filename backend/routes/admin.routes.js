import { Router } from "express";
import {
  getCloudinaryUploadSignature,
  listAdminEventInterests,
  listAdminMembers,
} from "../controllers/admin.controller.js";
import {
  createAdminPartnerLogo,
  createAdminBlog,
  createAdminEvent,
  deleteAdminPartnerLogo,
  deleteAdminBlog,
  deleteAdminEvent,
  getAdminSiteNotice,
  listAdminPartnerLogos,
  listAdminBlogs,
  listAdminEvents,
  updateAdminPartnerLogo,
  updateAdminSiteNotice,
  updateAdminBlog,
  updateAdminEvent,
} from "../controllers/content.controller.js";
import { listSubscribersAdmin } from "../controllers/newsletter.controller.js";
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
import { listAdminPartnerInquiries } from "../controllers/partner-inquiry.controller.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { listAdminJoinRequests } from "../controllers/join.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/members", listAdminMembers);
adminRouter.get("/event-interests", listAdminEventInterests);
adminRouter.post("/cloudinary/sign-upload", getCloudinaryUploadSignature);

adminRouter.get("/events", listAdminEvents);
adminRouter.post("/events", createAdminEvent);
adminRouter.patch("/events/:slug", updateAdminEvent);
adminRouter.delete("/events/:slug", deleteAdminEvent);

adminRouter.get("/blogs", listAdminBlogs);
adminRouter.post("/blogs", createAdminBlog);
adminRouter.patch("/blogs/:slug", updateAdminBlog);
adminRouter.delete("/blogs/:slug", deleteAdminBlog);

adminRouter.get("/site-notice", getAdminSiteNotice);
adminRouter.put("/site-notice", updateAdminSiteNotice);

adminRouter.get("/partners", listAdminPartnerLogos);
adminRouter.post("/partners", createAdminPartnerLogo);
adminRouter.patch("/partners/:id", updateAdminPartnerLogo);
adminRouter.delete("/partners/:id", deleteAdminPartnerLogo);
adminRouter.get("/partner-inquiries", listAdminPartnerInquiries);

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

export default adminRouter;
