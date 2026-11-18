import { Router } from "express";
import { requireAuth, optionalAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { auditLogger } from "../middlewares/audit.middleware.js";
import * as N from "../controllers/network.controller.js";
import * as G from "../controllers/groups.controller.js";
import * as O from "../controllers/opportunities.controller.js";

/* ---------------- /api/network ---------------- */
export const networkRouter = Router();
// Public startup directory (viewer-aware when logged in)
networkRouter.get("/startups", optionalAuth, N.listStartups);
networkRouter.get("/startups/:slug", optionalAuth, N.getStartup);

networkRouter.use(requireAuth);
networkRouter.get("/summary", N.networkSummary);
networkRouter.get("/profile/me", N.getMyProfile);
networkRouter.put("/profile/me", N.updateMyProfile);
networkRouter.get("/suggestions", N.suggestions);
networkRouter.get("/connections", N.listConnections);
networkRouter.post("/connections", N.requestConnection);
networkRouter.get("/connections/with/:accountId", N.connectionWith);
networkRouter.patch("/connections/:id", N.respondConnection);
networkRouter.delete("/connections/:id", N.removeConnection);
networkRouter.get("/cofounders", N.listCofounders);
networkRouter.get("/collab", N.listCollab);
networkRouter.post("/collab", N.createCollab);
networkRouter.patch("/collab/:id", N.updateCollab);
networkRouter.delete("/collab/:id", N.deleteCollab);
networkRouter.post("/collab/:id/interest", N.expressInterest);
networkRouter.get("/collab/:id/interests", N.listInterests);

const networkAdmin = Router();
networkAdmin.use(requireAdmin, auditLogger);
networkAdmin.get("/stats", N.adminNetworkStats);
networkAdmin.get("/collab", N.adminListCollab);
networkAdmin.get("/groups", G.adminListGroups);
networkAdmin.patch("/groups/:id", G.adminUpdateGroupFlags);
networkAdmin.get("/opportunities", O.adminListOpportunities);
networkAdmin.post("/opportunities", O.adminCreateOpportunity);
networkAdmin.put("/opportunities/:id", O.adminUpdateOpportunity);
networkAdmin.delete("/opportunities/:id", O.adminDeleteOpportunity);
networkRouter.use("/admin", networkAdmin);

/* ---------------- /api/groups ---------------- */
export const groupsRouter = Router();
groupsRouter.use(requireAuth);
groupsRouter.get("/", G.listGroups);
groupsRouter.post("/", G.createGroup);
groupsRouter.get("/:slug", G.getGroup);
groupsRouter.patch("/:slug", G.updateGroup);
groupsRouter.delete("/:slug", G.archiveGroup);
groupsRouter.post("/:slug/join", G.joinGroup);
groupsRouter.delete("/:slug/join", G.leaveGroup);
groupsRouter.get("/:slug/members", G.listMembers);
groupsRouter.patch("/:slug/members/:accountId", G.manageMember);
groupsRouter.get("/:slug/posts", G.listGroupPosts);
groupsRouter.post("/:slug/posts", G.createGroupPost);
groupsRouter.delete("/:slug/posts/:postId", G.deleteGroupPost);
groupsRouter.post("/:slug/posts/:postId/like", G.toggleGroupPostLike);
groupsRouter.post("/:slug/posts/:postId/comments", G.commentGroupPost);
groupsRouter.post("/:slug/posts/:postId/pin", G.pinGroupPost);

/* ---------------- /api/opportunities ---------------- */
export const opportunitiesRouter = Router();
opportunitiesRouter.get("/", optionalAuth, O.listOpportunities);
opportunitiesRouter.post("/suggest", requireAuth, O.suggestOpportunity);
opportunitiesRouter.post("/:id/save", requireAuth, O.toggleSaveOpportunity);
opportunitiesRouter.get("/:slug", optionalAuth, O.getOpportunity);
