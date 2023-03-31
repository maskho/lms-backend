import User from "../models/user";
import { comparePassword, hashPassword } from "../utils/auth";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name) return res.status(400).send("Name is required!");
    if (!password || password.length < 6)
      return res
        .status(400)
        .send("Password is required with min. 6 characters");
    let emailExist = await User.findOne({ email }).exec();
    let usernameExist = await User.findOne({ username }).exec();

    if (emailExist) return res.status(400).send("Email is taken!");
    if (usernameExist) return res.status(400).send("Username is taken!");

    const hashedPassword = await hashPassword(password);
    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    console.log("saved user", user);
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send("User not found!");

    const match = await comparePassword(password, user.password);

    if (!match) return res.status(400).send("Wrong password!");

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    user.password = undefined;
    res.cookie("token", token, { httpOnly: true });
    res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error");
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "Logout success!" });
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error");
  }
};
