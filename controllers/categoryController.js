const Category = require("./../models/categoryModel");
const factory = require("./factoryController");

const paginateCategory = {
  page: process.env.PAGINATE_PAGE,
  limit: process.env.PAGINATE_LIMIT,
  sort: { namme: "desc" },
};

// filter categories
exports.setConditions = (req, res, next) => {
  req.conditions = {
    name: { $regex: new RegExp(req.query.name, "i") },
    slug: { $regex: new RegExp(req.query.slug, "i") },
  };
  next();
};

/**
 * factory function
 */
exports.getCategory = factory.getDoc(Category);
exports.createCategory = factory.createDoc(Category);
exports.updateCategory = factory.updateDoc(Category);
exports.deleteCategory = factory.deleteDoc(Category);
exports.filterCategories = factory.filterDocs(Category, paginateCategory);
