import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import ChatRoom from "../models/ChatGroup.js";

export const router = express.Router();

// Ensure the general chat room exists
const getGeneralRoom = async () => {
  let room = await ChatRoom.findOne({ type: "general" });
  if (!room) {
    room = await ChatRoom.create({
      name: "General Chat",
      members: [],
      type: "general",
    });
  }
  return room;
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;

    if (
      !location ||
      !location.coordinates ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        error: "Invalid location format. Expected [longitude, latitude].",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      location,
    });

    // Add user to the general chat room
    const generalRoom = await getGeneralRoom();
    generalRoom.members.push(user._id);
    await generalRoom.save();

    res
      .status(201)
      .json({ message: "User registered and added to General Chat" });
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

  const chatRooms = await ChatRoom.find({ members: user._id });
  const chats = await Promise.all(
    chatRooms.map(async (room) => {
      let roomName;
      if (room.type === "general") {
        roomName = room.name;
      } else {
        const memberId = room.members.filter(
          (member) => String(member) !== String(user._id)
        )[0];
        const member = await User.findById(memberId);
        roomName = member.name;
      }
      
      return { _id: room._id, name: roomName.replace(/ /g, "_"), type: room.type };
    })
  );
  
  req.session.user = { ...user._doc, password: null, chats };
  res.json({ message: "Login successful", user: req.session.user });
});

router.post("/me", async (req, res) => {
  const chatRooms = await ChatRoom.find({ members: req.session.user._id });
  console.log(chatRooms);
  
  const chats = await Promise.all(
    chatRooms.map(async (room) => {
      let roomName;
      if (room.type === "general") {
        roomName = room.name;
      } else {
        const memberId = room.members.filter(
          (member) => String(member) !== String(req.session.user._id)
        )[0];
        const member = await User.findById(memberId);
        roomName = member.name;
      }
      
      return { _id: room._id, name: roomName.replace(/ /g, "_"), type: room.type };
    })
  );

  req.session.user = { ...req.session.user._doc, password: null, chats };
  res.json({ user: req.session.user });
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
