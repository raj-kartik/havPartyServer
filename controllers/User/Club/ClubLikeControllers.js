import Club from "../../../models/Partner/Club/clubSchema.js";
import User from "../../../models/User/userSchema.js";

export const likeClub = async (req, res) => {
  const { userId, clubId } = req.body;

  try {
    // Validate request
    if (!userId) return res.status(400).json({ message: "Provide UserId" });
    if (!clubId) return res.status(400).json({ message: "Provide ClubId" });

    // Validate user and club existence
    const [user, club] = await Promise.all([
      User.findById(userId),
      Club.findById(clubId),
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!club) return res.status(404).json({ message: "Club not found" });

    // Toggle like
    const isLiked = user.clubLikes.includes(clubId);
    const clubIsLiked = club.likes.includes(userId);

    if (isLiked) {
      user.clubLikes = user.clubLikes.filter((id) => id.toString() !== clubId);
    } else {
      user.clubLikes.push(clubId);
    }

    if (clubIsLiked) {
      club.likes = club.likes.filter((id) => id.toString() !== userId);
    } else {
      club.likes.push(userId);
    }

    await user.save();
    await club.save();

    return res.status(200).json({
      message: isLiked ? "Club removed from likes" : "Club added to likes",
      data: user.clubLikes,
    });
  } catch (error) {
    console.error("Error during toggling club like:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};
