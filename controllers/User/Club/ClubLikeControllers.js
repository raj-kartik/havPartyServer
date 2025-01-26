import Club from "../../../models/Partner/Club/clubSchema.js";
import User from "../../../models/User/userSchema.js";

export const likeClub = async (req, res) => {
  const { userId, clubId } = req.body;
  try {
    // Validate request
    if (!userId) return res.status(400).json({ message: "Provide UserId" });
    if (!clubId) return res.status(400).json({ message: "Provide ClubId" });

    // Check if club and user exist
    const club = await Club.findById(clubId);
    const user = await User.findById(userId);

    if (!club) return res.status(404).json({ message: "Club not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the club is already liked
    const isLiked = user.clubLikes.includes(clubId);

    if (isLiked) {
      // If liked, remove the clubId from the array
      user.clubLikes = user.clubLikes.filter((id) => id.toString() !== clubId);
      await user.save();
      console.log("Club removed from user's likes.");
      return res.status(200).json({
        message: "Club removed from likes",
        data: user.clubLikes,
      });
    } else {
      // If not liked, add the clubId to the array
      user.clubLikes.push(clubId);
      await user.save();
      console.log("Club added to user's likes.");
      return res.status(200).json({
        message: "Club added to likes",
        data: user.clubLikes,
      });
    }
  } catch (error) {
    console.error("Error during toggling club like:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};
