const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection error");
    console.log(error.message);
    process.exit(1);
  }
};


module.exports = dbConnect;