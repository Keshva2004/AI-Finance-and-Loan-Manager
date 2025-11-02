import mongoose from "mongoose";

const connectDB = async () => {
  const URL = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/financeDB";
  try {
    await mongoose.connect(URL);
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Error connecting to DB:", err.message);
  }
};

export default connectDB;
