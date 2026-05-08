import express from "express";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.routes.js";
import chatRoute from "./routes/chat.routes.js";
import cors from "cors";
const app = express();

// using middleware

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        "http://localhost:5173",
        "https://arc-chat-rust.vercel.app",
        /^https:\/\/.*\.vercel\.app$/, // ✅ allows ALL vercel preview URLs
      ];
      if (
        !origin ||
        allowed.some((o) =>
          typeof o === "string" ? o === origin : o.test(origin)
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/chat", chatRoute);

export default app;
