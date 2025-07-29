// import Transaction from "@models/Partner/Transactions/Transactions.js";
import Owner from "../../models/Owner/owner.js";
import Employee from "../../models/Partner/Employee.js";
import Transaction from "../../models/User/Transaction/transactionSchema.js";


export const getAllClubTransactions = async (req, res) => {
  const { ownerId, partnerId } = req.query;

  try {
    // Validate query params
    if (!ownerId && !partnerId) {
      return res.status(400).json({
        message: "Owner ID or Partner ID is required",
      });
    }

    let clubs = [];

    // Get clubs from Owner
    if (ownerId) {
      const owner = await Owner.findById(ownerId).populate("clubs_owned", "name");
      if (!owner) {
        return res.status(404).json({ message: "Owner not found" });
      }
      clubs = owner.clubs_owned;
    }

    // Get clubs from Employee (Partner)
    if (partnerId) {
      const employee = await Employee.findById(partnerId).populate("club", "name");
      if (!employee) {
        return res.status(404).json({ message: "Partner (Employee) not found" });
      }
      clubs = employee.club;
    }

    const clubIds = clubs.map((club) => club._id);

    // Fetch transactions for all clubs and populate club name
    const transactions = await Transaction.find({ club: { $in: clubIds } })
      .populate("club", "name");

    return res.status(200).json({
      transactions,
      count: transactions.length,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

