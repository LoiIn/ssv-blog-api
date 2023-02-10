const mongoose = require("mongoose");
const dotenv = require("dotenv");
require("dotenv").config({ path: "./.env" });

const connectDB = () => {
  return mongoose
    .connect(process.env.DATABASE)
    .then(() => console.log("Connect to db success!"))
    .catch((err) => console.log(err));
};

module.exports = connectDB;
