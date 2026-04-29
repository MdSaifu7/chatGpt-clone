import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:3000",
//   withCredentials: true, // if using cookies
// });
const api = axios.create({
  baseURL: "https://arcchat-c7pj.onrender.com",
  withCredentials: true, // if using cookies
});

export default api;
