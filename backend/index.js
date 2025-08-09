import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Create an pspress application
const app = express();

// Middlewarepso parse JSON bodies
app.use(express.json()); // Parse JSON payloads
app.use(cookieParser()); // Parse cookies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

//CORS configuration
const corsOptions = {
  origin: "http://localhost:5173", // Allow requests from this origin
  credentials: true, // Allow cookies etc... to be sent with requests
};

app.use(cors(corsOptions));

//Define a simple route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Instagram Clone API",
    success: true,
  });
});

// Start the server on port 8000
const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
