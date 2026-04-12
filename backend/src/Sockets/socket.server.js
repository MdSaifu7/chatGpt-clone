import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import userModel from "../models/user.model.js";
import chatModel from "../models/chat.model.js";
import { generateResponse } from "../services/ai.service.js";
import { generateGroqResponse } from "../services/groq.ai.service.js";
import messageModel from "../models/message.model.js";

import { createMemory, queryMemory } from "../db/vector.db.js";
import { createMemoryQD, queryMemoryQD } from "../db/qd.vector.db.js";
import { convertToVector } from "../services/vector.service.js";
import { v4 as uuidv4 } from "uuid";
const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");

    if (!cookies.token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decode = jwt.verify(cookies.token, process.env.JWT_SECRET);

      const user = await userModel.findById(decode.id);
      socket.user = user;
      next();
    } catch (err) {
      return next(new Error("Authentication error: " + err.message));
    }
  });

  try {
    io.on("connection", async (socket) => {
      console.log("A user connected!!");
      socket.on("user-message", async ({ content, chat }) => {
        console.log("user-message listened! " + content);
        console.log("Chat ID: ", chat);
        //generate title for new chat

        const [userMessage, user_vector] = await Promise.all([
          messageModel.create({
            user: socket.user._id,
            chat: chat,
            content: content,
            role: "user",
          }),
          convertToVector(content),
        ]);

        const [chatHistory, similiarVectors] = await Promise.all([
          messageModel
            .find({ chat: chat })
            .sort({ timestamp: -1 })
            .limit(10)
            .select("content role -_id"),

          queryMemoryQD({
            queryVector: user_vector,
            limit: 5,
            metadata: {
              userId: socket.user._id.toString(),
              chatId: chat.toString(),
            },
          }),
        ]);
        chatHistory.reverse();
        const stm = chatHistory;
        const ltm = similiarVectors?.length && {
          role: "system",
          content:
            "Previous conversation snippet: " +
            similiarVectors?.map((item) => item.payload.text).join("\n"),
        };

        const [_, response] = await Promise.all([
          createMemoryQD({
            vectors: user_vector,
            metadata: {
              userId: socket.user._id.toString(),
              chatId: chat.toString(),
              text: content,
            },
            messageId: uuidv4(),
          }),
          generateGroqResponse([
            ...(ltm ? [ltm] : []),
            ...stm,
            {
              role: "user",
              content: content,
            },
          ]),
        ]);

        socket.emit("ai-response", {
          user: content,
          ai: response,
        });

        const [aiMessage, ai_vector] = await Promise.all([
          messageModel.create({
            user: socket.user._id,
            chat: chat,
            content: response,
            role: "assistant",
          }),
          convertToVector(response),
        ]);

        await createMemoryQD({
          vectors: ai_vector,
          metadata: {
            userId: socket.user._id.toString(),
            chatId: chat.toString(),
            text: response,
          },
          messageId: uuidv4(),
        });
      });
    });
  } catch (err) {
    console.log("error in socket server");
    return err.message;
  }
};

export default initSocketServer;
