import chatModel from "../models/chat.model.js";
// import { generateTitle } from "../services/groq.ai.service.js";
import { generateTitle } from "../services/openai.service.js";
import messageModel from "../models/message.model.js";
async function createChat(req, res) {
  const { title } = req.body;

  try {
    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }
    const chat = await chatModel.create({
      user: req.user._id,
      title,
    });

    return res.status(201).json({
      message: "Chat created successfully",
      chat,
    });
  } catch (err) {
    console.log("Error in create chat route", err);
    res.status(500).send({
      message: "Error in create chat route",
      error: err.message,
    });
  }
}

async function createTitle(req, res) {
  const { content } = req.body;
  try {
    const title = await generateTitle(content);
    console.log(title);

    return res.status(201).json({
      message: "Title created",
      title,
    });
  } catch (err) {
    console.log("Error in create title route", err);
    res.status(500).send({
      message: "Error in create title route",
      error: err.message,
    });
  }
}

async function deleteChat(req, res) {
  const { chatId } = req.body;
  try {
    if (!chatId) {
      return res.status(400).json({
        message: "Chat ID is required",
      });
    }

    const deletedChat = await chatModel.findOneAndDelete({
      _id: chatId,
      user: req.user._id,
    });
    const deletedMessages = await messageModel.deleteMany({
      chat: chatId,
    });
    console.log("Deleted messages: ", deletedMessages);
    console.log("Deleted chat: ", deletedChat);
    return res.status(200).json({
      message: "Chat deleted successfully",
      deletedChat,
    });
  } catch (err) {
    console.log("Error in delete chat route", err);
    res.status(500).send({
      message: "Error in delete chat route",
      error: err.message,
    });
  }
}

async function getMessage(req, res) {
  const { chatId } = req.params;
  const allChats = await messageModel
    .find({
      user: req.user._id,
      chat: chatId,
    })
    .select("content role -_id");

  return res.status(200).json({
    message: "Chat fetched",
    allChats,
  });
}

async function getChat(req, res) {
  const allChats = await chatModel
    .find({
      user: req.user._id,
    })
    .select("title _id");

  return res.status(200).json({
    message: "Chat fetched",
    allChats,
  });
}

export { createChat, deleteChat, getMessage, getChat, createTitle };
