import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://chat-app:chatapp@chat-app.fyqzgmq.mongodb.net/chat-app?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
    
    // Seed default users if they don't exist
    const demoUsers = [
      { name: "Demo User", email: "guest@example.com", password: "password123" },
      { name: "Intelli-Call Assistant", email: "assistant@intelli-call.io", password: "password123" }
    ];

    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        await User.create({ ...u, password: hashedPassword });
        console.log(`👤 Seeded demo user: ${u.email}`);
      }
    }
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
};

connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pic: { 
    type: String, 
    default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" 
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // --- Auth Routes ---

  // Login Route
  app.post("/api/user/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          pic: user.pic,
          status: "success"
        });
      } else {
        res.status(401).json({ message: "Invalid Email or Password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  });

  // Register Route (For testing)
  app.post("/api/user/register", async (req, res) => {
    const { name, email, password, pic } = req.body;
    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        pic
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          pic: user.pic,
          status: "success"
        });
      } else {
        res.status(400).json({ message: "Invalid user data" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running.." });
  });

  // Socket.io Setup (Merging user's logic)
  const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
      if (userData && userData._id) {
        socket.join(userData._id);
        console.log("User Setup: " + userData._id);
        socket.emit("connected");
      }
    });

    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => {
      socket.in(room).emit("typing");
    });

    socket.on("stop typing", (room) => {
      socket.in(room).emit("stop typing");
    });

    socket.on("new message", (newMessageReceived) => {
      const chat = newMessageReceived.chat;
      if (!chat || !chat.users) return console.log("chat.users not defined");

      chat.users.forEach((user: any) => {
        if (user._id === newMessageReceived.sender._id) return;
        socket.in(user._id).emit("message received", newMessageReceived);
      });
    });

    // Support for the "Quantum" UI events if they differ
    socket.on("send_message", (data) => {
      io.emit("receive_message", data);
    });

    // WebRTC Signaling
    socket.on("offer", (data) => {
      socket.broadcast.emit("offer", data);
    });

    socket.on("answer", (data) => {
      socket.broadcast.emit("answer", data);
    });

    socket.on("ice-candidate", (data) => {
      socket.broadcast.emit("ice-candidate", data);
    });

    socket.on("end_call", () => {
      socket.broadcast.emit("call_ended");
    });

    socket.on("disconnect", () => {
      console.log("USER DISCONNECTED");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
