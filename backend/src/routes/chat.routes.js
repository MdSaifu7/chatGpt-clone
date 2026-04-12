import express from "express";
import protectRoutes from "../middleware/protect.routes.js";
import {
  createChat,
  getMessage,
  getChat,
  deleteChat,
} from "../controller/chat.controller.js";
const router = express.Router();

router.post("/", protectRoutes, createChat);
router.get("/getchat", protectRoutes, getChat);
router.get("/messages/:chatId", protectRoutes, getMessage);
router.post("/delete", protectRoutes, deleteChat);
export default router;
