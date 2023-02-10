const multer = require("multer");
const AppError = require("./appError");

// try catch function
exports.catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// upload file options
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new AppError("Only can upload image!", 400), false);
};

exports.uploadImage = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// filter attributes
exports.filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// remove item at array
exports.removeItem = (arr, clearItem) => {
  return arr.filter((item) => item != clearItem);
};
