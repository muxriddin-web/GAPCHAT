import mongoose from "mongoose";

const connectDB = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI, {
      tls: true,
    });

    console.log("MongoDB Connected");

  } catch (error) {

    console.log("Mongo Error:", error.message);

    process.exit(1);

  }
};

export default connectDB;