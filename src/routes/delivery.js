import express from "express";
import Delivery from "../models/Delivery.js";
import User from "../models/User.js";
import { getDistance } from "../utils/getDistance.js";

export const router = express.Router();
const RATE_PER_KM = 2;

router.post("/calculate", async (req, res) => {
  try {
    const { manufacturerId, wholesalerId } = req.body;

    const manufacturer = await User.findById(manufacturerId);
    const wholesaler = await User.findById(wholesalerId);

    if (!manufacturer || !wholesaler) {
      return res.status(404).json({ error: "User not found" });
    }

    const distance = getDistance(manufacturer.location.coordinates, wholesaler.location.coordinates);
    const fee = distance * RATE_PER_KM;

    await Delivery.create({ manufacturerId, wholesalerId, distance, fee });
    res.json({ distance: distance.toFixed(2), fee: fee.toFixed(2) });
  } catch (error) {
    res.status(500).json({ error: "Error calculating fee" });
  }
});

export default router;
