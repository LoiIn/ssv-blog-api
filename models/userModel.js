const crypto = require("crypto");
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Please provide name of admin"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    avatar: {
      type: String,
      default: "default.jpg",
    },
    role: {
      type: String,
      enum: ["super-admin", "admin", "user"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    password_confirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    status: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual populate
userSchema.virtual("posts", {
  ref: "Post",
  foreignField: "author",
  localField: "_id",
});

// hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.password_confirm = undefined;

  next();
});

// compare input and account's password
userSchema.methods.checkPassword = async function (inputPass, curPass) {
  return await bcrypt.compare(inputPass, curPass);
};

// create token for reset password
userSchema.methods.createTokenForResetPassword = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 9 * 60 * 1000;

  return resetToken;
};

userSchema.plugin(mongoosePaginate);

const User = mongoose.model("User", userSchema);

module.exports = User;
