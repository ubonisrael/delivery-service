import "./jobs/cronJobs.js";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import cluster from "node:cluster";
import { Server } from "socket.io";
import { availableParallelism } from "node:os";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";
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
import redis from "./utils/redisClient.js";

dotenv.config();

if (cluster.isPrimary) {
  const numCPUS = availableParallelism();
  console.log(numCPUS);

  // create one worker per available core
  for (let i = 0; i < numCPUS; i++) {
    cluster.fork({
      PORT: 3000 + i,
    });
  }
  // set up the adapter on the primary thread
  setupPrimary();
  // Restart workers if they crash
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
    connectionStateRecovery: {},
    // set up the adapter on each worker thread
    adapter: createAdapter(),
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
        // Try fetching messages from Redis
        let messages = await redis.lrange(`chat:${roomId}`, 0, -1);
        messages = messages.map(JSON.parse); // Convert stored strings to objects

        // If Redis cache is empty, load from MongoDB and cache it
        if (messages.length === 0) {
          messages = await Message.find({ chatRoom: roomId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

          // Cache messages in Redis
          if (messages.length > 0) {
            const cacheData = messages.map((msg) => JSON.stringify(msg));
            await redis.lpush(`chat:${roomId}`, ...cacheData);
            await redis.ltrim(`chat:${roomId}`, 0, 19); // Store only the latest 20
          }
        }

        // Reset expiration time on access
        await redis.expire(`chat:${roomId}`, 86400);

        // Send messages back in the correct order (oldest first)
        callback({
          success: `Joined room: ${roomId}`,
          messages: messages.reverse(),
        });
      } catch (error) {
        callback({ error: "Error joining chat room." });
      }
    });

    socket.on(
      "load_more_messages",
      async ({ roomId, lastMessageId }, callback) => {
        try {
          // Try to get messages from Redis
          let messages = await redis.lrange(`chat:${roomId}`, -50, -1);
          messages = messages.map(JSON.parse);

          // If Redis cache is insufficient, fetch from MongoDB
          if (messages.length < 20) {
            const olderMessages = await Message.find({
              chatRoom: roomId,
              _id: { $lt: lastMessageId }, // Fetch messages older than lastMessageId
            })
              .sort({ createdAt: -1 })
              .limit(20)
              .lean();

            callback({ messages: olderMessages.reverse() });

            // Cache older messages
            if (olderMessages.length > 0) {
              const cacheData = olderMessages.map((msg) => JSON.stringify(msg));
              await redis.rpush(`chat:${roomId}`, ...cacheData);
            }
          } else {
            callback({ messages: messages.reverse() });
          }

          // Reset expiration time on access
          await redis.expire(`chat:${roomId}`, 86400);
        } catch (error) {
          callback({ error: "Error loading more messages." });
        }
      }
    );

    socket.on("send_message", async (data) => {
      const { chatRoom, message } = data;
      const userId = socket.request.session.user._id;

      const newMessage = {
        chatRoom,
        sender: userId,
        message,
        createdAt: new Date(),
      };

      // Store in Redis
      await redis.lpush(`chat:${chatRoom}`, JSON.stringify(newMessage));
      await redis.ltrim(`chat:${chatRoom}`, 0, 19); // Keep last 20 messages
      await redis.expire(`chat:${chatRoom}`, 86400); // Expire after 24 hours

      // Save to MongoDB
      await Message.create(newMessage);

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
}
