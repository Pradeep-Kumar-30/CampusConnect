const path = require("path");
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

dotenv.config();

// Logging utility
const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
};

const app = express();
const server = http.createServer(app);

/* ---------------- SOCKET SETUP ---------------- */
const io = new Server(server, {
  cors: {
    origin: true, // Allow all LAN origins
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* ---------------- DATABASE CONNECTION ---------------- */
const connectDB = async () => {
  try {
    const uri =
      process.env.MONGODB_URI ||
      "mongodb://127.0.0.1:27017/campus_intranet";

    await mongoose.connect(uri);
    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

/* ---------------- MODELS ---------------- */
const User = require("./src/models/User");
const Message = require("./src/models/Message");
const Announcement = require("./src/models/Announcement");

/* ---------------- MIDDLEWARE SETUP & SECURITY ---------------- */
// Security headers
app.use(helmet());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // stricter limit for auth endpoints
  skipSuccessfulRequests: true,
  message: "Too many login attempts, please try again later.",
});

app.use(generalLimiter);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true, // Allow all LAN
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

/* ---------------- STATIC FILES ---------------- */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", authLimiter, require("./src/routes/auth"));
app.use("/api/users", require("./src/routes/users"));
app.use("/api/bookmarks", require("./src/routes/bookmarks"));
app.use("/api/notifications", require("./src/routes/notifications"));
app.use("/api/notes", require("./src/routes/notes"));
app.use("/api/forum", require("./src/routes/forum"));
app.use("/api/messages", require("./src/routes/messages"));
app.use("/api/announcements", require("./src/routes/announcements"));
app.use("/api/search", require("./src/routes/search"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Campus intranet backend running",
  });
});

/* ---------------- SOCKET EVENTS ---------------- */
io.on("connection", (socket) => {
  logger.info(`New client connected: ${socket.id}`);

  socket.on("joinDepartment", (dept) => {
    if (!dept) return;
    socket.join(`dept:${dept}`);
    logger.info(`Client ${socket.id} joined department: ${dept}`);
  });

  socket.on("joinDirect", (userId) => {
    if (!userId) return;
    socket.join(`user:${userId}`);
    logger.info(`Client ${socket.id} joined direct: ${userId}`);
  });

  socket.on("sendDirectMessage", async (payload) => {
    try {
      const { from, to, text } = payload;
      if (!from || !to || !text) {
        logger.warn("Invalid direct message payload");
        return;
      }

      const msg = await Message.create({
        from,
        to,
        text,
        type: "direct",
      });

      io.to(`user:${to}`)
        .to(`user:${from}`)
        .emit("newDirectMessage", msg);
    } catch (err) {
      logger.error(`sendDirectMessage error: ${err.message}`);
    }
  });

  socket.on("sendDepartmentMessage", async (payload) => {
    try {
      const { from, department, text } = payload;
      if (!from || !department || !text) {
        logger.warn("Invalid department message payload");
        return;
      }

      const msg = await Message.create({
        from,
        department,
        text,
        type: "department",
      });

      io.to(`dept:${department}`).emit(
        "newDepartmentMessage",
        msg
      );
    } catch (err) {
      logger.error(`sendDepartmentMessage error: ${err.message}`);
    }
  });

  socket.on("sendAnnouncement", async (payload) => {
    try {
      const { title, body, createdBy, isUrgent } = payload;
      if (!title || !body || !createdBy) {
        logger.warn("Invalid announcement payload");
        return;
      }

      const ann = await Announcement.create({
        title,
        body,
        createdBy,
        isUrgent: !!isUrgent,
      });

      io.emit("newAnnouncement", ann);
      logger.info(`New announcement: ${title}`);
    } catch (err) {
      logger.error(`sendAnnouncement error: ${err.message}`);
    }
  });

  // Presence tracking
  socket.on("setPresence", async (data) => {
    try {
      const { userId, isOnline } = data;
      if (!userId) return;

      await User.findByIdAndUpdate(userId, {
        isOnline,
        lastSeen: new Date(),
      });

      io.emit("userPresenceChanged", { userId, isOnline });
      logger.info(`User ${userId} presence: ${isOnline}`);
    } catch (err) {
      logger.error(`setPresence error: ${err.message}`);
    }
  });

  socket.on("userTyping", (data) => {
    try {
      const { userId, department } = data;
      if (!userId || !department) return;

      io.to(`dept:${department}`).emit("userTypingInDept", {
        userId,
        department,
      });
    } catch (err) {
      logger.error(`userTyping error: ${err.message}`);
    }
  });

  socket.on("userStoppedTyping", (data) => {
    try {
      const { userId, department } = data;
      if (!userId || !department) return;

      io.to(`dept:${department}`).emit("userStoppedTypingInDept", {
        userId,
        department,
      });
    } catch (err) {
      logger.error(`userStoppedTyping error: ${err.message}`);
    }
  });

  // Mention/notification broadcast
  socket.on("sendMention", async (data) => {
    try {
      const { authorId, mentionedUserId, itemType, itemId, context } = data;
      if (!authorId || !mentionedUserId || !itemType || !itemId) return;

      const Mention = require("./src/models/Mention");
      const mention = await Mention.create({
        author: authorId,
        mentionedUser: mentionedUserId,
        itemType,
        itemId,
        context,
      });

      io.to(`user:${mentionedUserId}`).emit("mentioned", {
        mention,
      });

      logger.info(`User ${mentionedUserId} mentioned by ${authorId}`);
    } catch (err) {
      logger.error(`sendMention error: ${err.message}`);
    }
  });

  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

/* ---------------- SEED USERS ---------------- */
const seedInitialUsers = async () => {
  const count = await User.countDocuments();
  if (count > 0) {
    logger.info(`Database already has ${count} users, skipping seed`);
    return;
  }

  const users = [
    {
      name: "Admin User",
      email: "admin@iiitbh.intranet",
      rollNumber: "ADMIN001",
      password: "admin123",
      role: "admin",
      department: "CSE",
      semester: 0,
    },
    {
      name: "pradeep kumar",
      email: "pradeep.240101023@iiitbh.ac.in",
      rollNumber: "240101023",
      password: "pradeep123",
      role: "admin",
      department: "CSE",
      semester: 0,
    },
    {
      name: "Faculty User",
      email: "faculty@iiitbh.intranet",
      rollNumber: "FAC001",
      password: "faculty123",
      role: "faculty",
      department: "CSE",
      semester: 0,
    },
    {
      name: "Student User",
      email: "student@iiitbh.intranet",
      rollNumber: "STU001",
      password: "student123",
      role: "student",
      department: "CSE",
      semester: 5,
    },
  ];

  try {
    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10);
      await User.create({
        name: u.name,
        email: u.email,
        rollNumber: u.rollNumber,
        passwordHash: hash,
        role: u.role,
        department: u.department,
        semester: u.semester,
      });
    }
    logger.info("Seeded initial users successfully");
  } catch (err) {
    logger.error(`Failed to seed users: ${err.message}`);
  }
};

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedInitialUsers();

  server.listen(PORT, "0.0.0.0", () => {
    logger.info(`✓ Server listening on http://localhost:${PORT}`);
    logger.info(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
  });
});

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled rejection: ${err.message}`);
  process.exit(1);
});
