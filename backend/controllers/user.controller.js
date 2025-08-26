import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

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
      success: false,
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
        user,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
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
    const user = await User.findById(userId).select("-password");
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

// Edit profile
export const editProfile = async (req, res) => {
  try {
    // Retrieved from the authenticated middleware
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    // Update fields if provided in the request
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    // update profile picture url
    if (profilePicture) {
      user.profilePicture = cloudResponse.secure_url;
    }
    await user.save();
    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Suggested users logic
export const getSuggestedUsers = async (req, res) => {
  try {
    // $ne means: not equal to
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );
    if (!suggestedUsers || suggestedUsers.length == 0) {
      return res.status(400).json({
        message: "Currently do not have any users",
      });
    }
    // Return the suggested users
    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occured while fetching suggested users.",
      success: false,
    });
  }
};

// Follow and Unfollow logic
export const followOrUnfollow = async (req, res) => {
  try {
    const follower = req.id;
    const followee = req.params.id;
    if (follower === followee) {
      return res.status(400).json({
        message: "You can't follow or unfollow yourself",
        success: false,
      });
    }
    const user = await User.findById(follower);
    const targetUser = await User.findById(followee);
    if (!user || !targetUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    // Check whether to follow or unfollow
    const isFollowing = user.following.includes(followee);
    if (isFollowing) {
      // logic to unfollow user
      await Promise.all([
        User.updateOne({ _id: follower }, { $pull: { following: followee } }),
      ]);
      await Promise.all([
        User.updateOne({ _id: followee }, { $pull: { followers: follower } }),
      ]);
      return res.status(200).json({
        message: "Unfollowed successfully",
        success: true,
      });
    } else {
      // logic to follow user
      await Promise.all([
        User.updateOne({ _id: follower }, { $push: { following: followee } }),
      ]);
      await Promise.all([
        User.updateOne({ _id: followee }, { $push: { followers: follower } }),
      ]);
      return res.status(200).json({
        message: "Followed successfully",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error.",
      success: false,
    });
  }
};
