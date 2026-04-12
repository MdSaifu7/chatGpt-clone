import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { createServer } from "http";
import initSocketServer from "./src/Sockets/socket.server.js";
import connectDB from "./src/db/db.js";

connectDB();

const httpServer = createServer(app);

initSocketServer(httpServer);
httpServer.listen(3000, () => {
  console.log("server is running on port 3000");
});
