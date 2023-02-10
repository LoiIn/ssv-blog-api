const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/helper");

exports.filterDocs = (Model, paginateOptions) =>
  catchAsync(async (req, res, next) => {
    const docs = await Model.paginate(req.conditions, paginateOptions);

    res.status(200).json({
      status: "success",
      data: docs,
    });
  });

exports.createDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

exports.getDoc = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError("Not found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.updateDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("Not found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.deleteDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("Not found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: null,
    });
  });
