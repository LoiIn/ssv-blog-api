const AppError = require("../utils/appError");
const { catchAsync, removeItem } = require("../utils/helper");
const Comment = require("./../models/commentModel");
const Post = require("./../models/postModel");
const factory = require("./factoryController");

const paginateComment = {
  page: process.env.PAGINATE_PAGE,
  limit: process.env.PAGINATE_LIMIT,
  sort: { created_at: "desc" },
};

// filter Comments
exports.setConditions = (req, res, next) => {
  next();
};

// set user and post id prepare create
exports.setPostUserId = (req, res, next) => {
  req.body.post = req.params.id;
  req.body.author = req.user.id;
  next();
};

// check permision
exports.checkUpdatePermision = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (comment.author !== req.user.id) {
    return next(
      new AppError("This comment is other! You can not do this!", 403)
    );
  }

  next();
});

exports.checkDeletePermision = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (req.user.role === "super-admin") return next();
  if (comment.author !== req.user.id) {
    return next(
      new AppError("This comment is others! You can not do this!", 403)
    );
  }
  next();
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findByIdAndDelete(req.params.id);

  if (!comment) return next(new AppError("This comment is not found!", 404));

  const post = await Post.findById(req.params.postId);
  post.comments = removeItem(post.comments, req.params.id);
  await post.save();

  res.status(201).json({
    status: "success",
    data: null,
  });
});

/**
 * factory function
 */
exports.getComment = factory.getDoc(Comment);
exports.createComment = factory.createDoc(Comment);
exports.updateComment = factory.updateDoc(Comment);
exports.filterComments = factory.filterDocs(Comment, paginateComment);
