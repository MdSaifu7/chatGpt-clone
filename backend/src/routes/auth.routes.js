import express from "express";
import { registerUser, loginUser } from "../controller/auth.controller.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.send({
    message: "Hello world!",
  });
});

router.post("/register", registerUser);
router.post("/login", loginUser);
export default router;
