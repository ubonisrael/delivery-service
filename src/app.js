import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import connectDB from "./db/index.js";
// routes
import { router as authRoute } from "./routes/auth.js";
import { router as deliveryRoute } from "./routes/delivery.js";
// middlewares
import { requireAuth } from "./middlewares/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "sessions",
      }),
      cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
    })
  );

app.use("/api/auth", authRoute);
app.use("/api/delivery", requireAuth, deliveryRoute)

async function startService() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to database");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to database", error);
  }
}

startService();
