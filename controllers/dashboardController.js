const Category = require("../models/categoryModel");
const Post = require("../models/postModel");
const User = require("./../models/userModel");
const { catchAsync } = require("./../utils/helper");

// count post of admin
exports.countPostByAgent = catchAsync(async (req, res, next) => {
  const agent = req.params.agent;
  const model = agent === "admin" ? User : Category;
  let feild = agent === "admin" ? "author" : "category";
  let pMatch =
    agent === "category"
      ? undefined
      : {
          role: { $in: ["super-admin", "admin"] },
        };
  const pipeline = {
    match: pMatch,
    lookup: {
      from: "posts",
      localField: "_id",
      foreignField: feild,
      as: "posts",
    },
    addFields: {
      postCounts: { $size: "$posts" },
    },
    sort: {
      postCounts: -1,
    },
    project: {
      name: 1,
      postCounts: 1,
    },
  };

  const docs = await aggregationPipeline(model, pipeline);

  res.status(200).json({
    status: "success",
    data: docs,
  });
});

// rank post by likes
exports.rankPostByReaction = catchAsync(async (req, res, next) => {
  const react = req.params.type;
  const pLookup =
    react === "like"
      ? undefined
      : {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "comments",
        };
  let pipeline = {
    lookup: pLookup,
    addFields: {
      reactCounts: { $size: `$${react}s` },
    },
    sort: {
      reactCounts: -1,
    },
    project: {
      title: 1,
      summary: 1,
      reactCounts: 1,
    },
    limit: 5,
  };
  const docs = await aggregationPipeline(Post, pipeline);

  res.status(200).json({
    status: "success",
    data: docs,
  });
});

const aggregationPipeline = async (Model, pipeline) => {
  let query = Model.aggregate();
  if (pipeline.match) query.match(pipeline.match);
  if (pipeline.lookup) query.lookup(pipeline.lookup);

  query
    .addFields(pipeline.addFields)
    .sort(pipeline.sort)
    .project(pipeline.project);

  if (pipeline.limit) query.limit(pipeline.limit);

  return await query;
};
