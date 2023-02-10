const fs = require("fs");
const User = require("../models/userModel");
const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const Category = require("../models/categoryModel");
const connectDB = require("./connect");

// Read json file
const path = `${__dirname}/data/`;
const admins = JSON.parse(fs.readFileSync(`${path}users.json`, "utf-8"));
const categories = JSON.parse(
  fs.readFileSync(`${path}categories.json`, "utf-8")
);
const posts = JSON.parse(fs.readFileSync(`${path}posts.json`, "utf-8"));
const comments = JSON.parse(fs.readFileSync(`${path}comments.json`, "utf-8"));

// import data to db
const importData = async () => {
  try {
    await User.create(admins);
    await Category.create(categories);
    await Post.create(posts);
    await Comment.create(comments);
    console.log("Uploaded data successfully!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// remove data from db
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Post.deleteMany();
    await Category.deleteMany();
    await Comment.deleteMany();
    console.log("Deleted data successfully!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const start = async () => {
  try {
    await connectDB();

    if (process.argv[2] === "--import") {
      importData();
    } else {
      deleteData();
    }
  } catch (err) {
    console.log(err);
  }
};

start();
