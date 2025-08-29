import bcrypt from "bcryptjs";
import Owner from "../models/Owner/owner.js";
import Employee from "../models/Partner/Employee.js";
import jwt from "jsonwebtoken";

export const signInClub = async (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({ message: "Mobile number and password are required" });
  }

  // console.log("--- mobile",mobile,"and password ----" ,password)

  try {
    // Step 1: Try to find Owner
    const owner = await Owner.findOne({ contact_number: mobile });
    if (owner) {
      if (owner.isBlocked || owner.isBanned) {
        return res.status(403).json({ message: "Owner is blocked or banned" });
      }

      const isPasswordValid = await bcrypt.compare(password, owner.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          id: owner._id,
          type: "owner",
        },
        process.env.JWT_SECRET
      );

      return res.status(200).json({
        message: "Login successful",
        user: {
          _id: owner._id,
          name: owner.name,
          email: owner.email,
          mobile: owner.contact_number,
          type: "owner",
        },
        token,
      });
    }

    // Step 2: Try to find Employee
    const employee = await Employee.findOne({ mobile });
    if (!employee) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const role = employee.position === "Manager" ? "manager" : "employee";

    const token = jwt.sign(
      {
        id: employee._id,
        mobile: employee.mobile,
        type: role,
      },
      process.env.JWT_SECRET
    );

    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: employee._id,
        name: employee.name,
        mobile: employee.mobile,
        type: role,
      },
      token,
    });
  } catch (err) {
    console.error("SignIn Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};