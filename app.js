import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import { dbConnection } from "./database/connection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/userRouter.js";
import timelineRouter from "./routes/timelineRouter.js";
import messageRouter from "./routes/messageRouter.js";
import skillRouter from "./routes/skillRouter.js";
import softwareApplicationRouter from "./routes/softwareApplicationRouter.js";
import projectRouter from "./routes/projectRouter.js";

const app = express();
dotenv.config({ path: "./config/config.env" });

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Trust proxy for secure cookies behind Vercel/Proxies
app.set("trust proxy", 1);

// CORS configuration: allow credentials and specific frontend origin
const allowedOriginsRaw = [
  process.env.FRONTEND_URL,
  "https://portfolio-front-jet.vercel.app",
  "https://porftolio-dashboard.vercel.app",
  "https://portfolio-dashboard.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

const normalizeOrigin = (url) => (typeof url === "string" ? url.replace(/\/$/, "").toLowerCase() : url);
const allowedOrigins = allowedOriginsRaw.map(normalizeOrigin);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const normalizedOrigin = normalizeOrigin(origin);
    const isAllowed = allowedOrigins.some((allowed) => normalizedOrigin === allowed);
    if (isAllowed) return callback(null, true);
    // Do not throw; respond without CORS headers for disallowed origins
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/timeline", timelineRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/skill", skillRouter);
app.use("/api/v1/softwareapplication", softwareApplicationRouter);
app.use("/api/v1/project", projectRouter);

dbConnection();
app.use(errorMiddleware);

export default app;
