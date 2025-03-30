// import Owner from "../../../models/Partner/Owner/owner.js";
import Owner from "../../../models/Owner/owner.js";
import bcrypt from "bcrypt";
export const ownerSignUp = async (req, res) => {
  const { name, email, mobile, password } = req.body;

  if ((!name, !email, !mobile, !password))
    return res.status(500).json({
      message: "All fields are required",
    });

  try {
    const existingUser = await Owner.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({
        message: "Mobile or email already exists",
        status: 400,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const owner = new Owner({
      name,
      email,
      contact_number:mobile,
      password: hashedPassword,
    });

    await owner.save();

    return res.status(200).json({
      message: "Sign-Up Successful",
      data: {
        name: name,
        mobile: mobile,
        email: email,
      },
      status:200
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
