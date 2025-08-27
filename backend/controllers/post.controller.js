import sharp from "sharp";
import cloudinary from "../utils/cloudinary";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;
    if (!image) {
      return res.status(400).json({
        message: "Image is required",
      });
    }
    // Validation caption
    if (
      !caption ||
      typeof caption !== "string" ||
      caption.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Caption is required and should be not string",
      });
    }
    // Ensure file is an image
    if (!image.mimitype.startsWith("image/")) {
      return res.status(400).json({
        message: "Upload file must be an image",
      });
    }

    // Image optimization
    let optimizedImageBuffer;
    try {
      optimizedImageBuffer = await sharp(image.buffer)
        .resize({
          width: 800,
          height: 800,
          fit: "inside",
        })
        .toFormat("jpeg", { quality: 80 })
        .toBuffer();
    } catch (error) {
      console.log("Error processing image with sharp", error);
      return res.status(500).json({
        message: "Error processing image",
        error: error.message,
      });
    }
    // Convert buffer to data URI
    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;
    // Upload to cloudinary
    let cloudResponse;
    try {
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    } catch (error) {
      console.log("Error with uploading image to cloudinary", error);
      return res.status(500).json({
        message: "Error with uploading image",
        error: error.message,
      });
    }
    // Create post in the database
    const post = Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });
    // Update the users post array
    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }
    // Populate the post auther field excluding password
    await post.populate({ path: "author", select: "-password" });
    return res.status(201).json({
      message: "New post added",
      post,
      success: true,
    });
  } catch (error) {
    console.log("Unexpected error occured", error);
    return res.status(500).json({
      message: "An Unexpected error occured",
      error: error.message,
    });
  }
};

// Get all post logic
export const getAllPost = async (req, res) => {
  try {
    // Fetch posts with sorting and population
    const posts = await Post.find()
      .sort({
        createdAt: -1,
      })
      .populate({ path: "author", select: "username profilePicture" })
      .populate(
        { path: "comments", createdAt: -1 },
        populate({ path: "author", select: "username profilePicture" })
      );
    // Return the fetched posts
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching posts", error);
    return res.status(500).json({
      message: "An Unexpected error occured while fetching the posts",
      error: error.message,
      success: false,
    });
  }
};

// get individual user post logic
export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({
        createdAt: -1,
      })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "username profilePicture" },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
    console.error("Error fetching user posts", error);
    return res.status(500).json({
      message: "An Unexpected error occured while fetching user posts",
      error: error.message,
      success: false,
    });
  }
};
