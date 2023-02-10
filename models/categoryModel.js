const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Please provide name of category"],
    },
    slug: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.index({ "$**": "text" });

// vitrual populdate
categorySchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "category",
});

// handle pre save
categorySchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

categorySchema.plugin(mongoosePaginate);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
