import { io } from "socket.io-client";

// const URL = "http://localhost:3000";
const URL = "https://arcchat-c7pj.onrender.com";

const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
});
export { socket };
