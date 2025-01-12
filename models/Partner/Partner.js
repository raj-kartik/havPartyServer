import mongoose, { Schema } from "mongoose";

const PartnerSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // Validates 10-digit mobile numbers
        },
        message: (props) => `${props.value} is not a valid mobile number!`,
      },
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      enum: ["Owner", "Manager", "Staff"],
    },
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: function () {
        return this.position !== "Owner"; // Club is required unless position is "Owner"
      },
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        validate: {
          validator: function (v) {
            return /^\d{5,6}$/.test(v); // Validates 5 or 6 digit zip codes
          },
          message: (props) => `${props.value} is not a valid zip code!`,
        },
      },
    },
    profilePicture: {
      type: String,
      default: null, // URL to the partner's profile picture
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Partner", PartnerSchema);
