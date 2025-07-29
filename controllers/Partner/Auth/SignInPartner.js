import bcrypt from "bcryptjs"; // For password comparison
import jwt from "jsonwebtoken"; // For generating JWT
import Employee from "../../../models/Partner/Employee.js";

export const signInEmployee = async (req, res) => {
  const { mobile, password } = req.body;

  try {
    if (!mobile || !password) {
      return res
        .status(400)
        .json({ message: "Mobile number and password are required" });
    }

    const employee = await Employee.findOne({ mobile });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Determine role based on employee.position
    const role = employee.position === "Manager" ? "manager" : "employee";

    const token = jwt.sign(
      {
        id: employee._id,
        mobile: employee.mobile,
        role, // Will be "manager" or "employee"
      },
      process.env.JWT_SECRET
      // { expiresIn: "2h" }
    );

    return res.status(200).json({
      message: "Sign-in successful",
      data: employee,
      token,
    });
  } catch (error) {
    console.error("Employee Sign-in Error:", error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

export const employeeDetails = async (req, res) => {
  const authHeader = req.headers.authorization;
  const ticket = authHeader?.split(" ")[1]; // extract token

  // console.log("Ticket received:", ticket);

  try {
    if (!ticket) {
      return res.status(401).json({ message: "Ticket is required" });
    }

    const decoded = jwt.verify(ticket, process.env.JWT_SECRET);
    const owner = await Employee.findById(decoded.id).select("-password");

    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    return res.status(200).json({
      message: "Owner details fetched successfully",
      data: {
        name: owner?.name,
        id: owner?.id,
        mobile: owner?.mobile,
        email: owner?.email,
        club: owner?.club, // Assuming club is a field in the Owner model
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
