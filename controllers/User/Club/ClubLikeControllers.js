import Club from "../../../models/Partner/Club/clubSchema.js";
import User from "../../../models/User/userSchema.js";

export const likeClub = async (req, res) => {
  const { userId, clubId } = req.body;

  try {
    if (!userId) return res.status(400).json({ message: "Provide UserId" });

    if (!clubId) return res.status(400).json({ message: "Provide ClubId" });

    const club = await Club.findById(clubId);
    const user = await User.findById(userId);

    if (!club) return res.status(404).json({ message: "Club not found" });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.clubLikes.includes(clubId)) {
      user.clubLikes.push(clubId);
      await user.save();
      console.log("Club added to user's likes.");

      return res
        .status(200)
        .json({ message: "Club added to likes", data: user?.clubLikes });
    } else {
      console.log("Club is already liked.");
      return res
        .status(409) // Conflict status code for already liked
        .json({ message: "Club is already liked" });
    }
  } catch (error) {
    console.error("Error during fetching clubs:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};
