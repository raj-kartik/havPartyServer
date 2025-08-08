import Owner from "../../models/Owner/owner.js";
import Employee from "../../models/Partner/Employee.js";
import { postS3ClubObject } from "../../utils/awsFunction.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export const getUploadUrl = async (req, res) => {
  const { type, id } = req.user;
  const { fileName, contentType, pathType } = req.body;

  if (!fileName || !contentType) {
    return res.status(400).json({ message: "Missing fileName or contentType" });
  }

  const validPathTypes = ["clubs", "users", "events"];
  if (!validPathTypes.includes(pathType)) {
    return res
      .status(400)
      .json({ message: "Invalid pathType. Allowed: clubs, users, events" });
  }

  try {
    if (type === "owner") {
      const owner = await Owner.findById(id);
      if (!owner) {
        return res.status(404).json({ message: "User not found" });
      }
    } else if (type === "manager") {
      const manager = await Employee.findById(id);
      if (!manager) {
        return res.status(404).json({ message: "User not found" });
      }
    } else {
      return res.status(400).json({ message: "Invalid user type" });
    }

    const ext = path.extname(fileName);
    const uniqueFileName = `${uuidv4()}${ext}`;

    const signedUrl = await postS3ClubObject(
      uniqueFileName,
      contentType,
      pathType
    );
    const s3Path = `${pathType}/uploads/${uniqueFileName}`;
    const publicUrl = `https://vivmedia-pvt.s3.eu-north-1.amazonaws.com/${s3Path}`;

    return res.status(200).json({
      uploadUrl: signedUrl,
      path: s3Path,
      publicUrl: publicUrl,
      status: 200,
    });
  } catch (err) {
    console.error("Error in the file uploading URL", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
