import express from "express";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.routes.js";
import chatRoute from "./routes/chat.routes.js";
import cors from "cors";
const app = express();

// using middleware
app.use(
  cors({
    origin: "http://localhost:5173", // exact frontend URL
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/chat", chatRoute);

export default app;
