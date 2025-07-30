import bcryptjs from "bcryptjs";
import Partner from "../../models/Partner/Employee.js";


export const addEmployee = async (req, res) => {
  const { position, name, email, mobile, clubId, password, ownerId } = req.body;

  if (!position || !name)
    return res.status(400).json({ message: "Please provide position and name" });

  if (!email || !mobile)
    return res.status(400).json({ message: "Please provide e-mail and mobile" });

  if (!clubId)
    return res.status(400).json({ message: "Please provide Club Id" });

  if (!password)
    return res.status(400).json({ message: "Please provide Password" });

  if (!ownerId)
    return res.status(400).json({ message: "Please provide Owner Id" });

  try {
    const existingUser = await Partner.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Mobile or email already exists",
        status: 400,
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const partner = new Partner({
      name,
      email,
      mobile,
      position,
      club: clubId,
      password: hashedPassword,
      ownerId,
      profilePicture: "",
    });

    await partner.save();

    // 👇 Add partner._id to club.employees array
    await Club.findByIdAndUpdate(
      clubId,
      { $addToSet: { employees: partner._id } }, // Prevents duplicate entries
      { new: true }
    );

    res.status(200).json({
      message: "New member has joined",
      state: 200,
      partner,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEmployee = async (req, res) => {
  const { clubId, ownerId } = req.query;

  if (!clubId && !ownerId) {
    return res.status(400).json({ message: "Please provide clubId or ownerId" });
  }

  try {
    // Build dynamic filter object
    const filter = {};
    if (clubId) filter.club = clubId;
    if (ownerId) filter.ownerId = ownerId;

    // Find employees matching filter
    const partners = await Partner.find(filter).populate("club", "name");

    if (partners.length === 0) {
      return res.status(404).json({ message: "No employees found" });
    }

    return res.status(200).json({
      message: "Employees found",
      data: partners,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getEmployeeDetails = async (req, res) => {
  const { partnerId } = req.params;

  if (!partnerId)
    return res.status(400).json({ message: "Please provide Club ID" });

  try {
    // Find partners (employees) associated with the club
    const partners = await Partner.findById(partnerId);

    if (partners.length === 0) {
      return res
        .status(404)
        .json({ message: "No employees found for this club" });
    }

    return res.status(200).json({
      message: "Detail of employee",
      data: partners,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
