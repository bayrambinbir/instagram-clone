import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//Registration Logic
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        success: false,
      });
    }
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

//Login Logic
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required",
        success: false,
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }
    // Check if password matches
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // Exclude the password from the return user object
    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
    };

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Logout logic
export const logout = async (_, res) => {
  try {
    //Clear the cookies that hold the JWT toke
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// Get user profile logic
export const getProfile = async (req, res) => {
  try {
    // use req.params.id to get User ID from the route parameter
    const userId = req.params.id;
    // find user by userId
    const user = await User.findById(userId);
    // return 404 if user is not found
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    // return the user object if found
    if (user) {
      return res.status(200).json({
        user,
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};