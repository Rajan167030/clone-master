import { Account, CommunityPost } from "../models/index.js";

const toSafePost = (post, viewerId) => ({
  _id: post._id,
  authorId: post.authorId,
  authorName: post.authorName,
  authorRole: post.authorRole,
  authorPhoto: post.authorPhoto,
  authorHeadline: post.authorHeadline,
  content: post.content,
  imageUrl: post.imageUrl,
  likeCount: post.likes?.length || 0,
  likedByMe: viewerId ? post.likes?.some((id) => String(id) === String(viewerId)) : false,
  comments: (post.comments || []).map((c) => ({
    _id: c._id,
    authorId: c.authorId,
    authorName: c.authorName,
    authorRole: c.authorRole,
    authorPhoto: c.authorPhoto,
    content: c.content,
    createdAt: c.createdAt,
  })),
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

export const listFeed = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const before = req.query.before ? new Date(String(req.query.before)) : null;

    const filter = { isRemoved: false };
    if (before && !Number.isNaN(before.getTime())) {
      filter.createdAt = { $lt: before };
    }

    const posts = await CommunityPost.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

    return res.status(200).json({ posts: posts.map((p) => toSafePost(p, req.user?.sub)) });
  } catch (error) {
    return next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const content = String(req.body?.content || "").trim();
    const imageUrl = String(req.body?.imageUrl || "").trim();

    if (!content) {
      return res.status(400).json({ message: "Post content is required." });
    }
    if (content.length > 3000) {
      return res.status(400).json({ message: "Post is too long (max 3000 characters)." });
    }

    const author = await Account.findById(req.user.sub).lean();
    if (!author) {
      return res.status(404).json({ message: "Account not found." });
    }

    const post = await CommunityPost.create({
      authorId: author._id,
      authorName: author.fullName,
      authorRole: author.role,
      authorPhoto: author.profilePhoto || "",
      authorHeadline: author.headline || "",
      content,
      imageUrl,
    });

    return res.status(201).json({ message: "Post published.", post: toSafePost(post, req.user.sub) });
  } catch (error) {
    return next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const isAuthor = String(post.authorId) === String(req.user.sub);
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "You can only delete your own posts." });
    }

    await CommunityPost.deleteOne({ _id: id });
    return res.status(200).json({ message: "Post deleted." });
  } catch (error) {
    return next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const alreadyLiked = post.likes.some((likerId) => String(likerId) === String(req.user.sub));
    const updated = await CommunityPost.findByIdAndUpdate(
      id,
      alreadyLiked ? { $pull: { likes: req.user.sub } } : { $addToSet: { likes: req.user.sub } },
      { new: true },
    ).lean();

    return res.status(200).json({ post: toSafePost(updated, req.user.sub) });
  } catch (error) {
    return next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const content = String(req.body?.content || "").trim();

    if (!content) {
      return res.status(400).json({ message: "Comment content is required." });
    }
    if (content.length > 1000) {
      return res.status(400).json({ message: "Comment is too long (max 1000 characters)." });
    }

    const author = await Account.findById(req.user.sub).lean();
    if (!author) {
      return res.status(404).json({ message: "Account not found." });
    }

    const post = await CommunityPost.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            authorId: author._id,
            authorName: author.fullName,
            authorRole: author.role,
            authorPhoto: author.profilePhoto || "",
            content,
          },
        },
      },
      { new: true },
    ).lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    return res.status(201).json({ post: toSafePost(post, req.user.sub) });
  } catch (error) {
    return next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const isAuthor = String(comment.authorId) === String(req.user.sub);
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "You can only delete your own comments." });
    }

    comment.deleteOne();
    await post.save();

    return res.status(200).json({ post: toSafePost(post.toObject(), req.user.sub) });
  } catch (error) {
    return next(error);
  }
};
