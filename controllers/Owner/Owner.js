// import Owner from "../../../models/Partner/Owner/owner.js";
import Owner from "../../models/Owner/owner.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const ownerSignUp = async (req, res) => {
  const { name, email, mobile, password } = req.body;

  if ((!name, !email, !mobile, !password))
    return res.status(400).json({
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

  if (!mobile || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await Owner.findOne({ contact_number: mobile });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isBlocked || user.isBanned) {
      return res.status(403).json({ message: "User is blocked or banned" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        type: "owner",
      },
      process.env.JWT_SECRET
    );

    const { _id, name, email, contact_number } = user;

    return res.status(200).json({
      message: "Login successful",
      user: {
        _id,
        name,
        email,
        mobile: contact_number,
        type: "owner",
      },
      token,
    });
  } catch (err) {
    console.error("Owner SignIn Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const ownerDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  const ticket = authHeader?.split(" ")[1]; // extract token

  // console.log("Ticket received:", ticket);

  try {
    if (!ticket) {
      return res.status(401).json({ message: "Ticket is required" });
    }

    const decoded = jwt.verify(ticket, process.env.JWT_SECRET);
    const owner = await Owner.findById(decoded.id).select("-password");

    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    return res.status(200).json({
      message: "Owner details fetched successfully",
      data: {
        name: owner?.name,
        id: owner?.id,
        mobile: owner?.contact_number,
        email: owner?.email,
        club: owner?.clubs_owned || [], // Assuming club is a field in the Owner model
        active: owner?.active, // Assuming active is a field in the Owner model
        isBlocked: owner?.isBlocked, // Assuming isBlocked is a field in the Owner model
        registration_date: owner?.registration_date,
      },
      status: 200,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
