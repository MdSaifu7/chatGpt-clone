import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("DB connected");
  } catch (err) {
    console.log("DB connection error", err);
  }
}
export default connectDB;
