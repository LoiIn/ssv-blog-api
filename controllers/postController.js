const Post = require("./../models/postModel");
const factory = require("./factoryController");
const { catchAsync, uploadImage } = require("./../utils/helper");
const { addImage } = require("./../db/firebase");

const paginatePost = {
  page: process.env.PAGINATE_PAGE,
  limit: process.env.PAGINATE_LIMIT,
  sort: { published_at: "asc" },
};

const handleImage = async (req, res) => {
  console.log(req.body);
  let str = randomString(10);
  req.file.fileName = `post-${str}-${Date.now()}.png`;

  await sharp(req.file.buffer)
    .resize(2000, 1333)
    .toFormat("png")
    .png({ quality: 90 })
    .toFile(`public/img/posts/${req.file.fileName}`);
};

// get image url from content
const handleImgContent = async (content) => {
  try {
    const regex1 = /<img[^>]+>/g;
    const regex2 = /data[^>]+==/i;
    const tagStrs = [...content.matchAll(regex1)];

    let newContent = content;

    for await (const tag of tagStrs) {
      let imgStr = tag[0].match(regex2)[0];
      let newImgStr = await addImage(imgStr);
      newSrc = tag[0].replace(imgStr, newImgStr);
      newContent = newContent.replace(tag[0], newSrc);
    }

    return newContent;
  } catch (err) {
    console.log(err);
    return "";
  }
};

// create new post
exports.uploadImageCover = uploadImage.single("photo");
exports.createNewPost = catchAsync(async (req, res, next) => {
  // author id
  req.body.author = req.user.id;

  // add image cover
  req.body.image = await addImage(req.body.image);

  // handle content
  if (req.body.content) {
    req.body.content = await handleImgContent(req.body.content);
  }

  next();
});

// upload new post
exports.updateAndSavePost = catchAsync(async (req, res, next) => {
  // update image cover
  req.body.image =
    Object.keys(req.body.image).length !== 0
      ? await addImage(req.body.image)
      : undefined;

  // handle content
  req.body.content =
    req.body.content.length !== 0
      ? await handleImgContent(req.body.content)
      : undefined;

  next();
});

// filter posts
exports.setConditions = (req, res, next) => {
  req.conditions = {
    title: { $regex: new RegExp(req.query.title, "i") },
    summary: { $regex: new RegExp(req.query.summary, "i") },
  };
  if (req.query.author) {
    req.conditions.author = req.query.author;
  }
  if (req.query.category) {
    req.conditions.category = req.query.category;
  }
  if (req.query.tags) {
    req.conditions.tags = { $in: req.query.tags };
  }
  next();
};

/**
 * factory function
 */
exports.getPost = factory.getDoc(Post);
exports.createPost = factory.createDoc(Post);
exports.updatePost = factory.updateDoc(Post);
exports.deletePost = factory.deleteDoc(Post);
exports.filterPosts = factory.filterDocs(Post, paginatePost);
