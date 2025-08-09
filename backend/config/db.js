import mongoose from "mongoose";
let cashedDBConnection = null;

const connectDB = async () => {
  try {
    if (cashedDBConnection) {
      return cashedDBConnection;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected to "${conn.connection.name}" app`);
    cashedDBConnection = conn;
    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
