import { Router } from "express";
import {
  getPublicBlogBySlug,
  getPublicEventBySlug,
  listPublicGalleryImages,
  listPublicPartnerLogos,
  listPublicSpeakerInvestorProfiles,
  getPublicSiteNotice,
  listPublicBlogs,
  listPublicEvents,
  listPublicSliderEvents,
  listPublicTestimonials,
  getPublicCloudinaryUploadSignature,
} from "../controllers/content.controller.js";
import { listPublicPartnerTypes } from "../controllers/partner-type.controller.js";
import { subscribeNewsletter, unsubscribeNewsletter } from "../controllers/newsletter.controller.js";
import { submitJoinRequest } from "../controllers/join.controller.js";
import { submitPartnerInquiry } from "../controllers/partner-inquiry.controller.js";
import { submitFundingApplication } from "../controllers/funding.controller.js";

const contentRouter = Router();

contentRouter.get("/events", listPublicEvents);
contentRouter.get("/events/slider", listPublicSliderEvents);
contentRouter.get("/events/:slug", getPublicEventBySlug);
contentRouter.get("/blogs", listPublicBlogs);
contentRouter.get("/blogs/:slug", getPublicBlogBySlug);
contentRouter.get("/site-notice", getPublicSiteNotice);
contentRouter.get("/gallery", listPublicGalleryImages);
contentRouter.get("/partners", listPublicPartnerLogos);
contentRouter.get("/speakers-investors", listPublicSpeakerInvestorProfiles);
contentRouter.get("/testimonials", listPublicTestimonials);
contentRouter.get("/partner-types", listPublicPartnerTypes);
contentRouter.post("/cloudinary/sign-upload", getPublicCloudinaryUploadSignature);
contentRouter.post("/newsletter/subscribe", subscribeNewsletter);
contentRouter.get("/newsletter/unsubscribe", unsubscribeNewsletter);
contentRouter.post("/join-us", submitJoinRequest);
contentRouter.post("/partner-inquiry", submitPartnerInquiry);
contentRouter.post("/get-funding", submitFundingApplication);

export default contentRouter;
