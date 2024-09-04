import User from "../models/userSchema.js";
export const AuthSignup = async (req, res) => {
  const { name, username, email, password, isAdult, gender } = req.body;
  try {
    const user = new User({ name, username, email, password, isAdult, gender });
    if (user) {
        await user.save();
      res.status(200).json({
        message: "User created",
        name,
        username,
        email,
        password,
        isAdult,
        gender,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
};
