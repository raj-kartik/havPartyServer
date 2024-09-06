import User from "../../../models/User/userSchema.js";

// Delete user by ID
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};
