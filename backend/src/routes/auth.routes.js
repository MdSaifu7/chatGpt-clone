import express from "express";
import {
  registerUser,
  loginUser,
  loginStatus,
} from "../controller/auth.controller.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.send({
    message: "Hello world!",
  });
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/login-status", loginStatus);
export default router;
