import User from "../models/user";
import { comparePassword, hashPassword } from "../utils/auth";
import jwt from "jsonwebtoken";
import AWS from "aws-sdk";
const nanoid = require("nanoid");

export const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name) return res.status(400).send("Name is required!");
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send("Password is required with min. 6 characters");
    }
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

export const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id).select("-password").exec();
    console.log("current user", user);
    return res.json({ ok: true });
  } catch (error) {
    console.log(error);
  }
};

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const SES = new AWS.SES(awsConfig);

export const sendTestEmail = async (req, res) => {
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: ["syeh.ak@gmail.com"],
    },
    ReplyToAddresses: [process.env.EMAIL_FROM],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
          <html>
          <h1>Reset password link</h1>
          <p>Please use the following link to reset your password</p>
          </html>
          `,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Password reset link",
      },
    },
  };

  const emailSent = SES.sendEmail(params).promise();

  emailSent
    .then((data) => {
      console.log(data);
      res.json({ ok: true });
    })
    .catch((err) => console.log(err));
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const shortCode = nanoid(6).toUpperCase();

    const user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode: shortCode }
    ).exec();
    if (!user) return res.status(400).send("User not found!");

    const params = {
      Source: process.env.EMAIL_FROM,
      Destination: {
        ToAddresses: [email],
      },
      ReplyToAddresses: [process.env.EMAIL_FROM],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
            <html>
            <h1>Reset password</h1>
            <p>Please use the following code to reset your password</p>
            <h3 style="color:red;">${shortCode}</h3>
            <br/>
            <i>lelero.com</i>
            </html>
            `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Reset password",
        },
      },
    };

    const emailSent = SES.sendEmail(params).promise();

    emailSent
      .then((data) => {
        console.log(data);
        res.json({ ok: true });
      })
      .catch((err) => console.log(err));
  } catch (error) {
    console.log(error);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const hashedPassword = await hashPassword(newPassword);

    const user = await User.findOneAndUpdate(
      { email, passwordResetCode: code },
      { password: hashedPassword, passwordResetCode: "" }
    ).exec();
    if (!user)
      return res.status(400).send("User not found or verification is wrong!");

    res.json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error!");
  }
};
