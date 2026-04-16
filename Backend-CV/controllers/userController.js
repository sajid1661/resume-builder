import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET,{ expiresIn: "2d" });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const isExist = await userModel.findOne({ email: email });
    if (!isExist) {
      // hash password
      if (password.length < 8) {
        return res.json({ success: false, message: "Use Stronge Password" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      let response = new userModel({ name, email, password: hashedPassword });
      let newUser = await response.save();
      console.log(newUser);
      const token = createToken(newUser._id);
      return res.json({ success: true,message:"User registered successfully", token });
    }
    res.json({ success: false, message: "This email already exists" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await userModel.findOne({ email: email });
    if (!user) {
      return res.json({ success: false, message: "User not Exists" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }
    const token = createToken(user._id);
    res.json({ success: true, message:"Login successful", token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { registerUser, loginUser };
