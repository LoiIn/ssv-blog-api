const express = require("express");
const authController = require("./../controllers/authController");
const postController = require("./../controllers/postController");
const commentController = require("./../controllers/commentController");

const router = express.Router();
/**
 * login middleware
 */
router.use(authController.routeProtect);

// comment in post
router.get(
  "/:id/comments",
  commentController.setPostUserId,
  commentController.getComment
);

router.post(
  "/:id/comments",
  commentController.setPostUserId,
  commentController.createComment
);

router.patch(
  "/:postId/comments/:id",
  commentController.checkUpdatePermision,
  commentController.updateComment
);

router.delete(
  "/:postId/comments/:id",
  commentController.checkDeletePermision,
  commentController.deleteComment
);

// super-admin: Post management
router.use(authController.setPermisson("super-admin", "admin"));
router
  .route("/")
  .get(postController.setConditions, postController.filterPosts)
  .post(postController.createNewPost, postController.createPost);

router
  .route("/:id")
  .get(postController.getPost)
  .patch(postController.updateAndSavePost, postController.updatePost)
  .delete(postController.deletePost);

module.exports = router;
