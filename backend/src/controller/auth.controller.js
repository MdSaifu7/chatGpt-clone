import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

async function registerUser(req, res) {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    let isUserExist = await userModel.findOne({ email });

    if (isUserExist) {
      return res.status(400).json({
        message: "User already exist",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashPassword,
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        username,
        email,
        id: user._id,
      },
    });
  } catch (err) {
    console.log("Error in register route", err);
    res.status(500).send({
      message: "Error in register route",
      error: err.message,
    });
  }
}

async function loginUser(req, res) {
  console.log("Login route hitt");

  const { username = "", email = "", password } = req.body;
  try {
    const user = await userModel.findOne({
      $or: [{ username }, { email }],
    });
    console.log(user);

    if (!user) {
      return res.status(400).json({
        message: "No user found",
      });
    }

    const isValidPass = await bcrypt.compare(password, user.password);
    console.log("Password valid: ", isValidPass);
    if (!isValidPass) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token);

    return res.status(201).json({
      message: "User login successfully",
      loggedIn: true,
      user: {
        username: user.username,
        email: user.email,
        id: user._id,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Error in login route",
      loggedIn: false,
      error: err.message,
    });
  }
}

async function loginStatus(req, res) {
  const token = req.cookies.token;
  try {
    if (!token) {
      return res.status(401).json({
        loggedIn: false,
      });
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decode.id);
    if (!user) {
      return res.status(401).json({
        loggedIn: false,
      });
    }
    return res.status(200).json({
      loggedIn: true,
      user: {
        username: user.username,
        email: user.email,
        id: user._id,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(200).json({
      loggedIn: false,
    });
  }
}
export { registerUser, loginUser, loginStatus };
