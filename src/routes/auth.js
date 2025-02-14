import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js";

export const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;

    if (
      !location ||
      !location.coordinates ||
      location.coordinates.length !== 2
    ) {
      return res
        .status(400)
        .json({
          error: "Invalid location format. Expected [longitude, latitude].",
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      location,
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  req.session.user = { id: user._id, role: user.role };
  res.json({ message: "Login successful", user: req.session.user });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json(req.session.user);
});
