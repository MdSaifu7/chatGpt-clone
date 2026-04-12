import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
const protectRoutes = async (req, res, next) => {
  console.log("Protected route hit!");

  const token = req.cookies.token;
  try {
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decode.id);
    if (!user) {
      return res.status(401).json({
        message: "Invalid token or token expired",
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: err.message,
    });
  }
};
export default protectRoutes;
