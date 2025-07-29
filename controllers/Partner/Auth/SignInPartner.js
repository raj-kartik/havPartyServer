import bcrypt from "bcryptjs"; // For password comparison
import jwt from "jsonwebtoken"; // For generating JWT
import Employee from "../../../models/Partner/Employee.js";


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
        type: owner?.position,
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
