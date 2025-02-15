import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Server } from "socket.io";
// db
import connectDB from "./db/index.js";
// routes
import { router as authRoute } from "./routes/auth.js";
import { router as deliveryRoute } from "./routes/delivery.js";
import { router as chatRoute } from "./routes/chat.js";
// middlewares
import { requireAuth } from "./middlewares/auth.js";
// models
import Message from "./models/Message.js";
import ChatRoom from "./models/ChatGroup.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
});
const PORT = process.env.PORT || 3000;
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
  }),
  cookie: {
    secure: process.env.ENV === "development" ? false : true,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  }, // 1 day
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(sessionMiddleware);

app.use("/api/auth", authRoute);
app.use("/api/delivery", requireAuth, deliveryRoute);
app.use("/api/chat", requireAuth, chatRoute);

// Apply session middleware to Socket.IO
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// WebSocket authentication middleware
io.use((socket, next) => {
  if (socket.request.session && socket.request.session.user) {
    next();
  } else {
    next(new Error("Authentication required"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", async (roomId, callback) => {
    try {
      // Get user ID from session
      const userId = socket.request.session.user._id;
      // Check if the room exists
      const room = await ChatRoom.findById(roomId);
      if (!room) {
        return callback({ error: "Chat room does not exist." });
      }

      // Check if the user is a member of the room (except for the general room)
      if (room.type === "private" && !room.members.includes(userId)) {
        return callback({ error: "You are not a member of this chat." });
      }

      socket.join(roomId);
      console.log(`User ${userId} joined room: ${roomId}`);

      // Fetch last 50 messages from MongoDB
      const messages = await Message.find({ chatRoom: roomId })
        .sort({ createdAt: -1 }) // Get newest messages first
        .limit(20)
        .lean(); // Convert to plain objects

      // Send messages back in the correct order (oldest first)
      callback({
        success: `Joined room: ${roomId}`,
        messages: messages.reverse(),
      });
    } catch (error) {
      callback({ error: "Error joining chat room." });
    }
  });

  socket.on("load_more_messages", async ({ roomId, lastMessageId }, callback) => {
    try {
      // Get messages older than `lastMessageId`
      const olderMessages = await Message.find({
        chatRoom: roomId,
        _id: { $lt: lastMessageId }, // Fetch messages older than lastMessageId
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
  
      callback({ messages: olderMessages.reverse() });
    } catch (error) {
      callback({ error: "Error loading more messages." });
    }
  });

  socket.on("send_message", async (data) => {
    const { chatRoom, message } = data;
    const userId = socket.request.session.user._id;

    const newMessage = await Message.create({
      chatRoom,
      sender: userId,
      message,
    });

    io.to(chatRoom).emit("receive_message", newMessage);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

async function startService() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to database");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to database", error);
  }
}

startService();
