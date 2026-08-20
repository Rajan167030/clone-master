import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  listFeed,
  createPost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
} from "../controllers/community.controller.js";
import {
  listConversations,
  getThread,
  sendMessage,
} from "../controllers/community-messages.controller.js";

const communityRouter = Router();

communityRouter.use(requireAuth);

communityRouter.get("/posts", listFeed);
communityRouter.post("/posts", createPost);
communityRouter.delete("/posts/:id", deletePost);
communityRouter.post("/posts/:id/like", toggleLike);
communityRouter.post("/posts/:id/comments", addComment);
communityRouter.delete("/posts/:id/comments/:commentId", deleteComment);

communityRouter.get("/messages", listConversations);
communityRouter.get("/messages/:userId", getThread);
communityRouter.post("/messages/:userId", sendMessage);

export default communityRouter;
