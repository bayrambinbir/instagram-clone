import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

//For chatting
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message content is required",
      });
    }
    //Find or create convertation
    let conversation = await Conversation.find({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        message: [],
      });
    }
    // Create and save the new message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });
    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    // Implement socket.IO for real-time data transfer

    return res.status(201).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.error("Error sending message", error);
    return res.status(500).json({
      message: "An error occured while sending the message",
      error: error.message,
      success: false,
    });
  }
};

// get messages
export const getMesage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;

    //Find the convertation
    const conversation = await Conversation.find({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      res.status(200).json({
        success: true,
        messages: [],
      });
    }

    // return the messages in the conversation
    res.status(200).json({
      success: true,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error("Error retriving messages", error);
    return res.status(500).json({
      error: "An error occured while retriving messages",
      success: false,
    });
  }
};
