import Course from "../models/course";
import User from "../models/user";

export const makeProvider = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOneAndUpdate(
      { email },
      {
        $addToSet: { role: "Provider" },
      },
      { new: true }
    )
      .select("-password")
      .exec();

    if (!user) return res.status(400).send("User not found!");

    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error");
  }
};

export const currentProvider = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id).select("-password").exec();
    if (!user.role.includes("Provider")) return res.sendStatus(403);
    return res.json({ ok: true });
  } catch (error) {
    console.log(error);
  }
};

export const providerCourses = async (req, res) => {
  try {
    const courses = await Course.find({ provider: req.auth._id })
      .sort({ createdAt: -1 })
      .exec();
    res.json(courses);
  } catch (error) {
    console.log(error);
  }
};
