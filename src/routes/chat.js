import express from "express";
import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = express.Router();

// send message to a chat room
router.post("/send", async (req, res) => {
  try {
    const { chatRoom, sender, message } = req.body;

    const room = await ChatRoom.findById(chatRoom);
    if (!room) return res.status(404).json({ error: "Chat room not found" });

    const msg = await Message.create({ chatRoom, sender, message });

    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ error: "Error sending message" });
  }
});

// Get chat messages
router.get("/:roomId/messages", async (req, res) => {
  try {
    const messages = await Message.find({
      chatRoom: req.params.roomId,
    }).populate("sender", "name");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});

router.post("/private", async (req, res) => {
  try {
    const { manufacturerId, wholesalerId } = req.body;

    const manufacturer = await User.findById(manufacturerId);
    const wholesaler = await User.findById(wholesalerId);

    if (!manufacturer || !wholesaler) {
      return res.status(404).json({ error: "User not found" });
    }

    if (
      manufacturer.role !== "manufacturer" ||
      wholesaler.role !== "wholesaler"
    ) {
      return res
        .status(403)
        .json({
          error:
            "Private chats must be between a manufacturer and a wholesaler",
        });
    }

    // Check if chat room already exists
    let chatRoom = await ChatRoom.findOne({
      members: { $all: [manufacturerId, wholesalerId] },
      type: "private",
    });

    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        members: [manufacturerId, wholesalerId],
        type: "private",
      });
    }

    res.status(201).json(chatRoom);
  } catch (error) {
    res.status(500).json({ error: "Error creating private chat" });
  }
});

export default router;
