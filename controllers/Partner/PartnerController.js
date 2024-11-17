import Partner from "../../models/Partner/Partner.js";
export const partnerClub = async (req, res) => {
  const { position, name, email, mobile, clubId } = req.body;

  if (!position || !name)
    return res.status(400).json({
      message: "Please provide position and name",
    });

  if (!email || !mobile)
    return res.status(400).json({
      message: "Please provide e-mail and mobile",
    });

  if (!clubId)
    return res.status(400).json({
      message: "Please provide Club Id",
    });

  try {
    const existingUser = await Partner.findOne({
      $or: [{ email }, { mobile }],
    });
    if (existingUser) {
      return res.status(400).json({
        message: "Mobile or email already exists",
        status: 400,
      });
    }

    const partner = new Partner({
      name,
      email,
      mobile,
      clubId,
      position,
      club: clubId,
    });

    await partner.save();
    res.status(200).json({
      message: "new partner has joined",
      state: 200,
      partner,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEmployee = async (req, res) => {
  const { clubId } = req.body;

  if (!clubId)
    return res.status(400).json({ message: "Please provide Club ID" });

  try {
    // Find partners (employees) associated with the club
    const partners = await Partner.find({ club: clubId });

    if (partners.length === 0) {
      return res
        .status(404)
        .json({ message: "No employees found for this club" });
    }

    return res.status(200).json({
      message: "Employees of your club",
      data: partners,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEmployeeDetails = async (req, res) => {
  const { partnerId } = req.body;

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
