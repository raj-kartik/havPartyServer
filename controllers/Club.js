import mongoose from "mongoose";
import axios from "axios";
import Club from "../models/clubSchema.js";

export const ClubI = async (req, res) => {
  const { name, location, city, state, photos, menu, price, pincode } =
    req.body;
  try {
    const club = new Club({
      owner,
      club,
      location,
      city,
      state,
      photos,
      menu,
      price,
      pincode,
      license
    });
    if (club) {
      await club.save();
      res.status(200).json({
        message: "Welcome to Hook",
        state:200,
        name,
        location,
        city,
        state,
        photos,
        menu,
        price,
        pincode,
      });
    }
  } catch (err) {
    console.error(err);
  }
};
