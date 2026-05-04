import { Router } from "express";
import {
  getPublicBlogBySlug,
  getPublicEventBySlug,
  listPublicPartnerLogos,
  getPublicSiteNotice,
  listPublicBlogs,
  listPublicEvents,
} from "../controllers/content.controller.js";
import { subscribeNewsletter, unsubscribeNewsletter } from "../controllers/newsletter.controller.js";
import { submitJoinRequest } from "../controllers/join.controller.js";
import { submitPartnerInquiry } from "../controllers/partner-inquiry.controller.js";

const contentRouter = Router();

contentRouter.get("/events", listPublicEvents);
contentRouter.get("/events/:slug", getPublicEventBySlug);
contentRouter.get("/blogs", listPublicBlogs);
contentRouter.get("/blogs/:slug", getPublicBlogBySlug);
contentRouter.get("/site-notice", getPublicSiteNotice);
contentRouter.get("/partners", listPublicPartnerLogos);
contentRouter.post("/newsletter/subscribe", subscribeNewsletter);
contentRouter.get("/newsletter/unsubscribe", unsubscribeNewsletter);
contentRouter.post("/join-us", submitJoinRequest);
contentRouter.post("/partner-inquiry", submitPartnerInquiry);

export default contentRouter;
