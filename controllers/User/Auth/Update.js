import User from "../../../models/User/userSchema.js";
import bcrypt from 'bcrypt'
// Update user by ID
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, password, name, gender, isAdult } = req.body;
  
    try {
      let user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      let hashedPassword = user.password;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }
      user = await User.findByIdAndUpdate(
        id,
        {
          username: username || user.username,
          email: email || user.email,
          password: hashedPassword,
          name: name || user.name,
          gender: gender || user.gender,
          isAdult: isAdult !== undefined ? isAdult : user.isAdult,
        },
        { new: true, runValidators: true }
      ).select("-password");
  
      return res.status(200).json({
        message: "User updated successfully.",
        user,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Server error. Please try again later." });
    }
  };