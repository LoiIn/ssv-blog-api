const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./db/connect");
const AppError = require("./utils/appError");

const userRouter = require("./routes/userRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const postRouter = require("./routes/postRoutes");
const commentRouter = require("./routes/commentRoutes");
const dashboardRouter = require("./routes/dashboardRoutes");
const ErrorHandle = require("./controllers/errorController");
const { catchAsync } = require("./utils/helper");

const app = express();
app.use(express.json({ limit: "20mb" }));
const envDomain = process.env.CORS_DOMAIN || "";
const whiteList = envDomain.split(",").map((item) => item.trim());
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "public")));

// setting route
app.use("/ssv-blog/api/v1/users", userRouter);
app.use("/ssv-blog/api/v1/categories", categoryRouter);
app.use("/ssv-blog/api/v1/posts", postRouter);
app.use("/ssv-blog/api/v1/comments", commentRouter);
app.use("/ssv-blog/api/v1", dashboardRouter);

// handle 404 route
app.all("*", (req, res, next) => {
  next(new AppError(`Sorry! The ${req.originalUrl} was not found!`, 404));
  next();
});

// error handle
app.use(ErrorHandle);

// connect to db and run server
const start = async () => {
  // connect to db
  await connectDB();

  // start server
  let port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`API is running in port ${port} ...`);
  });
};

process.env.TZ = "Asia/Tokyo";

start();
