import express from "express";
import Message from "../models/Message.js";

export const router = express.Router();

router.post("/private", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const message = await Message.create({ senderId, receiverId, content });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Message sending failed" });
  }
});

router.post("/group", async (req, res) => {
  try {
    const { senderId, groupId, content } = req.body;
    const message = await Message.create({ senderId, groupId, content });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Message sending failed" });
  }
});

export default router;
