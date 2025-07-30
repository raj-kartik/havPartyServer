import Employee from "../../../models/Partner/Employee.js";

export const getEmployeesListToManager = async (req, res) => {
  const { id } = req.user; // From verified token middleware

  try {
    // Step 1: Find the requesting employee (should be manager)
    const manager = await Employee.findById(id);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // Optional: Ensure requester is a manager
    if (manager.position !== "Manager") {
      return res.status(403).json({ message: "Access denied. Not a manager." });
    }

    // Step 2: Get all employees in the same club
    const data = await Employee.find({
      club: manager.club,
      _id: { $ne: manager._id }, // Exclude self if needed
    }).select("-password"); // Don't return passwords

    return res.status(200).json({
      message: "Employees fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error fetching employees list:", error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};
