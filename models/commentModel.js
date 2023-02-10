const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      require: [true, "Please input comment"],
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Comment must belong to a user"],
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
      required: [true, "Comment must belong to a post"],
    },
    created_at: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.plugin(mongoosePaginate);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
