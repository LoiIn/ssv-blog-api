const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const slugify = require("slugify");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
    },
    title: {
      type: String,
      required: [true, "A blog must have a title"],
      unique: true,
      trim: true,
      maxlength: [
        100,
        "A blog title must have less or equal then 40 characters",
      ],
      minlength: [
        10,
        "A blog title must have more or equal then 10 characters",
      ],
    },
    slug: String,
    summary: {
      type: String,
      trim: true,
      required: [true, "A post must have a summary"],
    },
    image: {
      type: String,
      required: [true, "A post must have a cover image"],
      default:
        "https://firebasestorage.googleapis.com/v0/b/fir-sample2-c12cf.appspot.com/o/images%2Fposts%2Fcat.jpg?alt=media&token=12b74210-ff53-470f-97d1-570fdeba0f8a",
    },
    content: {
      type: String,
      trim: true,
      require: [true, "A post must have a content"],
    },
    created_at: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    published_flag: {
      type: Boolean,
      default: false,
    },
    published_at: {
      type: Date,
      default: Date.now(),
    },
    tags: [String],
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// handle pre save
postSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// handle pre find
postSchema.pre(/^find/, function (next) {
  this.populate([
    { path: "author", select: "name" },
    { path: "category", select: "name" },
  ]);
  next();
});

// virtual populate
postSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "post",
  localField: "_id",
});

postSchema.plugin(mongoosePaginate);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
