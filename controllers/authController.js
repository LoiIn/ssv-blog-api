const AppError = require("./../utils/appError");
const { catchAsync } = require("./../utils/helper");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const coockieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.cookie("jwt", token, coockieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// signup
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    password_confirm: req.body.password_confirm,
  });

  createToken(newUser, 201, res);
});

// login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check inputed ?
  if (!email || !password) {
    return next(new AppError("Please input email and password!", 400));
  }

  // check correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401));
  }

  // send token
  createToken(user, 200, res);
});

// logout
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

// forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address!", 404));
  }

  // generate token to reset password
  const resetToken = user.createTokenForResetPassword();
  await user.save({ validateBeforeSave: false });

  // send token to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/password-reset/${resetToken}`;
    // await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: resetToken,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("Error! Try again later!", 500));
  }
});

//reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user base on the tokern received
  const hasedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hasedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // check token
  if (!user) {
    return next(new AppError("Token is invalid or has expried", 400));
  }

  console.log(req.params.password_confirm);
  // set new password
  user.password = req.body.password;
  user.password_confirm = req.body.password_confirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //send token
  createToken(user, 200, res);
});

// update password
exports.updatePasword = catchAsync(async (req, res, next) => {
  // get user information
  const user = await User.findById(req.user.id).select("+password");
  console.log(req.body);
  // check infor
  if (!(await user.checkPassword(req.body.current_password, user.password))) {
    return next(new AppError("Your current password is in correct!", 401));
  }

  // update password
  user.password = req.body.new_password;
  user.password_confirm = req.body.password_confirm;
  await user.save();

  // send new token
  createToken(user, 200, res);
});

/**
 * protect route and permisson
 */
// protect route
exports.routeProtect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.headers.cookie && req.headers.cookie.startsWith("jwt")) {
    token = req.headers.cookie.split("=")[1];
  }
  if (!token) {
    return next(new AppError("Time out! Please login again!", 401));
  }

  // verification token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  curUser = await User.findById(decode.id);

  req.user = curUser;
  res.locals.user = curUser;
  next();
});

// permission
exports.setPermisson = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission for this action!", 403)
      );
    }
    next();
  };
};
