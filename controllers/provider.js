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

    console.log("updated user as provider", user);
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
    console.log("current provider", user);
    return res.json({ ok: true });
  } catch (error) {
    console.log(error);
  }
};
