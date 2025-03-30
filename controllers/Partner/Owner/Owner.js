// import Owner from "../../../models/Partner/Owner/owner.js";
import Owner from "../../../models/Owner/owner.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const ownerSignUp = async (req, res) => {
  const { name, email, mobile, password } = req.body;

  if ((!name, !email, !mobile, !password))
    return res.status(500).json({
      message: "All fields are required",
    });

  try {
    const existingUser = await Owner.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({
        message: "Mobile or email already exists",
        status: 400,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const owner = new Owner({
      name,
      email,
      contact_number: mobile,
      password: hashedPassword,
    });

    await owner.save();

    return res.status(200).json({
      message: "Sign-Up Successful",
      data: {
        name: name,
        mobile: mobile,
        email: email,
      },
      status: 200,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const ownerSignIn = async (req, res) => {
  const { mobile, password } = req.body;

  

  if ((!mobile, !password))
    return res.status(500).json({
      message: "All fields are required",
    });

  try {
    const user = await Owner.findOne({ contact_number: mobile });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isBlocked || user.isBanned) {
      return res.status(403).json({ message: "User is blocked or banned." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate a never-expiring JWT token
    const token = jwt.sign(
      { ownerId: user._id, email: user?.email, mobile: user?.mobile },
      process.env.JWT_SECRET // No 'expiresIn' option means the token will not expire
    );

    // Respond with user details and token
    return res.status(200).json({
      message: "Login successful.",
      user,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
