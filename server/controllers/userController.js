/* User Controller */
import User from "../models/userModel.js";
import jwtSign from "../utils/jwtSign.js";
import bcyrpt from "bcrypt";

export const userSignUp = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const existedUser = await User.findOne({ email: email });
    if (existedUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcyrpt.genSalt(10);
    const hashedPassword = await bcyrpt.hash(password, salt);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    const token = jwtSign({ userId: user._id });
    return res
      .status(200)
      .json({ message: "User created successfully", user, token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const userSignIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcyrpt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwtSign({ userId: user._id });
    const data = {
      _id: user._id,
      username: user.username,
      email: user.email,
    };
    return res
      .status(200)
      .json({ message: "User signed in successfully", data, token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
