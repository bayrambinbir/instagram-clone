import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";

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
    if (!image.mimetype.startsWith("image/")) {
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
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: { path: "author", select: "username profilePicture" },
      });
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

// Like logic
export const likePost = async (req, res) => {
  try {
    const likerId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }
    // Like logic
    await post.updateOne({ $addToSet: { likes: likerId } });

    // Implement socket.io for real time notification

    return res.status(200).json({
      message: "Post liked",
      success: true,
    });
  } catch (error) {
    console.error("Error liking post", error);
    return res.status(500).json({
      message: "An Unexpected error occured while liking post",
      error: error.message,
      success: false,
    });
  }
};

// Dislike logic
export const dislikePost = async (req, res) => {
  try {
    const likerId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }
    // Dislike logic
    await post.updateOne({ $pull: { likes: likerId } });

    // Implement socket.io for real time notification

    return res.status(200).json({
      message: "Post disliked",
      success: true,
    });
  } catch (error) {
    console.error("Error disliking post", error);
    return res.status(500).json({
      message: "An Unexpected error occured while disliking post",
      error: error.message,
      success: false,
    });
  }
};

// add comment logic
export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commenterId = req.id;

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        message: "Text is required",
        success: false,
      });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Create a new post
    const comment = await Comment.create({
      text,
      author: commenterId,
      post: postId,
    });
    // Populate the comment author
    await comment.populate({
      path: "author",
      select: "username profilePicture",
    });

    // Add the comment to the post's comment array
    Post.comments.push(comment._id);
    await post.save();
    return res.status(200).json({
      message: "Comment Added",
      comment,
      success: true,
    });
  } catch (error) {
    console.error("Error adding comment", error);
    return res.status(500).json({
      message: "An Unexpected error occured while adding the comment",
      success: false,
    });
  }
};

// Get comments of post logic
export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }
    // Fetch the comments for the given post
    const comments = await Comment.find({ post: postId }).populate({
      path: "author",
      select: "username profilePicture",
    });

    // if no comments found, return an empty array with a success message
    if (comments.length === 0) {
      return res.status(200).json({
        message: "No comments found for this post",
        success: true,
        comments: [],
      });
    }
    // Return comments if found
    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Error fetching comments", error);
    return res.status(500).json({
      message: "An Unexpected error occured while feching comments",
      success: false,
      error: error.message,
    });
  }
};

// Delete post logic
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    // Find post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }
    // Check if the logged-in user is the owner of the post or not
    if (post.author.toString() !== authorId) {
      return res.status(403).json({
        message: "Unauthorized",
        success: false,
      });
    }
    //Delete post
    await Post.findByIdAndDelete(postId);

    // Remove the post id from user's post list
    let user = await User.findById(authorId);
    if (user) {
      user.posts = user.posts.filter((id) => id.toString() !== postId);
      await user.save();
    }
    // Delete assosiated comments
    await Comment.deleteMany({ post: postId });
    return res.status(200).json({
      message: "Post deleted",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting post", error);
    return res.status(500).json({
      message: "An Unexpected error occured while deleting the post",
      success: false,
      error: error.message,
    });
  }
};

// Bookmark Post Logic
export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    // Find post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }
    const user = await User.findById(authorId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    //Check if the bookmark is already bookmarked
    if (user.bookmarks.includes(post._id)) {
      // Post is already bookmarked -> remove from bookmarks
      await user.updateOne({ $pull: { bookmarks: post._id } });
      return res.status(200).json({
        type: "Unsaved",
        message: "Post removed from bookmarked",
        success: true,
      });
    } else {
      // Post is not found -> add to the bookmark
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      return res.status(200).json({
        type: "Saved",
        message: "Post bookmarked",
        success: true,
      });
    }
  } catch (error) {
    console.error("Error bookmarking post", error);
    return res.status(500).json({
      message: "An Unexpected error occured while processing your request",
      success: false,
      error: error.message,
    });
  }
};
