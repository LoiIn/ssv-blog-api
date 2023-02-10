const User = require("./../models/userModel");
const factory = require("./factoryController");
const { catchAsync, uploadImage, filterObj } = require("./../utils/helper");
const AppError = require("../utils/appError");
const sharp = require("sharp");

const paginateUser = {
  page: process.env.PAGINATE_PAGE,
  limit: process.env.PAGINATE_LIMIT,
  sort: { name: "desc" },
};

/**
 * user function
 */
// get my information
exports.myInformation = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// get other's information
exports.otherInformation = catchAsync(async (req, res, next) => {
  const { name, email, role, avatar } = await User.findById(req.params.id);

  if (!name) {
    return next(new AppError("User not found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: { name, email, role, avatar },
  });
});

// update my information
exports.uploadAvatar = uploadImage.single("avatar");
exports.resizeAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.updateMyInformation = catchAsync(async (req, res, next) => {
  // prevent update password
  if (req.body.passowrd || req.body.password_confirm) {
    return next(
      new AppError("This is not for change password! Use /password-update!"),
      400
    );
  }

  // allow attribute can be update
  const attrs = filterObj(req.body, "email", "password");
  if (req.file) attrs.avatar = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, attrs, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// change role
exports.changeRole = catchAsync(async (req, res, next) => {
  if (req.body.role === "super-admin" || req.params.id === req.user.id) {
    return next(
      new Error(
        "You are Super Admin!!! Can not change your role or make other become super-admin!"
      ),
      400
    );
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new Error("User not found!"), 404);
  }

  res.status(201).json({
    status: "success",
    data: user,
  });
});

// filter users
exports.setConditions = (req, res, next) => {
  if (!req.query) next();
  req.conditions = {
    name: { $regex: new RegExp(req.query.name, "i") },
    email: { $regex: new RegExp(req.query.email, "i") },
    role: req.query.role
      ? req.query.role
      : { $in: ["super-admin", "admin", "user"] },
  };
  next();
};

/**
 * factory function
 */
exports.getUser = factory.getDoc(User);
exports.createUser = factory.createDoc(User);
exports.updateUser = factory.updateDoc(User);
exports.deleteUser = factory.deleteDoc(User);
exports.filterUsers = factory.filterDocs(User, paginateUser);
