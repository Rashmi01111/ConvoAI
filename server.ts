import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

/** Google AI Studio free tier: set GEMINI_API_KEY in .env — use gemini-2.0-flash or gemini-1.5-flash */
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";


console.log("🚀 Starting IntelliCall Server...");
console.log("📁 Environment Check:");
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   - MONGODB_URI: ${process.env.MONGODB_URI ? 'SET' : 'NOT SET (using local default)'}`);
console.log(`   - GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET (AI features will be disabled)'}`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Group Schema
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pic: { type: String, default: "https://icon-library.com/images/group-icon/group-icon-10.jpg" }
}, { timestamps: true });

const Group = mongoose.model("Group", groupSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user: { type: String, required: true }, // Sender name
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: String }, // Recipient name (for private) or Group ID (for group)
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  text: { type: String },
  image: { type: String },
  video: { type: String },
  audio: { type: String },
  timestamp: { type: String, required: true },
  profilePic: { type: String },
  isGhost: { type: Boolean, default: false },
  isAI: { type: Boolean, default: false },
  isSystem: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: String },
  isDeleted: { type: Boolean, default: false },
  sentiment: { type: String },
  reactions: { type: mongoose.Schema.Types.Mixed, default: {} },
  deletedFor: [{ type: String }]
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

// Reel Schema (Instagram-like short posts)
const reelSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByName: { type: String, required: true },
  caption: { type: String, default: '' },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
}, { timestamps: true });

const Reel = mongoose.model("Reel", reelSchema);

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pic: { 
    type: String, 
    default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" 
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// Friend Request Schema
const friendRequestSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not set in environment variables.");
    }
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err: any) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

// Middleware to check DB connection
const checkDB = (socket: any, next: any) => {
  if (mongoose.connection.readyState !== 1) {
    console.warn("⚠️ Operation attempted while MongoDB is disconnected");
  }
  next();
};

async function startServer() {
  await connectDB();
  if (!process.env.GEMINI_API_KEY) {
    console.log("ℹ️  GEMINI_API_KEY not set — summarizer uses offline text; add key in .env for full Gemini (free tier: AI Studio).");
  } else {
    console.log(`🤖 Gemini: model=${GEMINI_MODEL}`);
  }
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  const PORT = 3000;

  // Debug logger
  app.use((req, res, next) => {
    console.log(`[DEBUG] Request: ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json());
  app.use(cors());

  // Login Route
  app.post("/api/user/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        // Emit user_logged_in event
        console.log("Emitting user_logged_in (login):", user._id);
        io.emit("user_logged_in", {
          _id: user._id,
          name: user.name,
          email: user.email,
          pic: user.pic,
        });
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
      const userExists = await User.findOne({ $or: [{ email }, { name }] });
      if (userExists) {
        return res.status(400).json({ message: "User with this email or name already exists" });
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
        // Emit user_logged_in event
        io.emit("user_logged_in", {
          _id: user._id,
          name: user.name,
          email: user.email,
          pic: user.pic,
        });
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

  // --- Reels Routes ---
  app.get("/api/reels", async (req, res) => {
    try {
      const reels = await Reel.find().sort({ createdAt: -1 }).limit(30);
      const mapped = reels.map((r: any) => ({
        ...r.toObject(),
        createdBy: r.createdBy?.toString?.() ?? r.createdBy,
        likes: (r.likes || []).map((id: any) => id.toString()),
      }));
      res.json(mapped);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reels" });
    }
  });

  app.post("/api/reels", async (req, res) => {
    try {
      const { userId, caption, mediaUrl, mediaType } = req.body || {};
      if (!userId || !mediaUrl) {
        return res.status(400).json({ message: "userId and mediaUrl are required" });
      }
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const reel = await Reel.create({
        createdBy: user._id,
        createdByName: user.name,
        caption: caption || '',
        mediaUrl,
        mediaType: mediaType === 'video' ? 'video' : 'image',
      });

      // Real-time update to all clients.
      const normalized = {
        ...reel.toObject(),
        createdBy: reel.createdBy?.toString?.() ?? reel.createdBy,
        likes: (reel.likes || []).map((id: any) => id.toString()),
      };
      io.emit("reel_created", normalized);
      res.status(201).json(reel);
    } catch (error) {
      res.status(500).json({ message: "Error creating reel" });
    }
  });

  app.put("/api/reels/:reelId", async (req, res) => {
    try {
      const { reelId } = req.params;
      const { userId, caption, mediaUrl, mediaType } = req.body || {};
      if (!userId) return res.status(400).json({ message: "userId required" });

      const reel = await Reel.findById(reelId);
      if (!reel) return res.status(404).json({ message: "Reel not found" });
      if (reel.createdBy.toString() !== userId) return res.status(403).json({ message: "Not allowed" });

      if (typeof caption === "string") reel.caption = caption;
      if (typeof mediaUrl === "string" && mediaUrl.trim()) reel.mediaUrl = mediaUrl.trim();
      if (mediaType === "image" || mediaType === "video") reel.mediaType = mediaType;

      await reel.save();

      const normalized = {
        ...reel.toObject(),
        createdBy: reel.createdBy?.toString?.() ?? reel.createdBy,
        likes: (reel.likes || []).map((id: any) => id.toString()),
      };
      io.emit("reel_updated", normalized);
      res.json(normalized);
    } catch (error) {
      res.status(500).json({ message: "Error updating reel" });
    }
  });

  app.post("/api/reels/:reelId/like", async (req, res) => {
    try {
      const { reelId } = req.params;
      const { userId } = req.body || {};
      if (!userId) return res.status(400).json({ message: "userId required" });

      const reel = await Reel.findById(reelId);
      if (!reel) return res.status(404).json({ message: "Reel not found" });

      const uid = new mongoose.Types.ObjectId(userId);
      const hasLiked = reel.likes.some((id: any) => id.toString() === userId);

      if (hasLiked) {
        reel.likes = reel.likes.filter((id: any) => id.toString() !== userId);
      } else {
        reel.likes.push(uid);
      }

      await reel.save();

      const normalized = {
        ...reel.toObject(),
        createdBy: reel.createdBy?.toString?.() ?? reel.createdBy,
        likes: (reel.likes || []).map((id: any) => id.toString()),
      };
      io.emit("reel_like_updated", { reelId: reel._id.toString(), likes: normalized.likes });
      res.json(normalized);
    } catch (error) {
      res.status(500).json({ message: "Error liking reel" });
    }
  });

  app.delete("/api/reels/:reelId", async (req, res) => {
    try {
      const { reelId } = req.params;
      const { userId } = req.body || {};
      if (!userId) return res.status(400).json({ message: "userId required" });

      const reel = await Reel.findById(reelId);
      if (!reel) return res.status(404).json({ message: "Reel not found" });
      if (reel.createdBy.toString() !== userId) return res.status(403).json({ message: "Not allowed" });

      await Reel.findByIdAndDelete(reelId);
      io.emit("reel_deleted", { reelId: reel._id.toString() });
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting reel" });
    }
  });

  /** Wipe all chat data (messages, groups, friend requests) — fresh demo start */
  app.post("/api/admin/reset-database", async (req, res) => {
    try {
      const { confirm } = req.body || {};
      if (confirm !== "RESET_ALL_DATA") {
        return res.status(400).json({ message: "Type RESET_ALL_DATA to confirm" });
      }
      await Message.deleteMany({});
      await FriendRequest.deleteMany({});
      await Group.deleteMany({});
      await Reel.deleteMany({});
      await User.deleteMany({});
      res.json({ ok: true, message: "Database cleared. Register a new account to continue." });
    } catch (e: any) {
      console.error("reset-database:", e);
      res.status(500).json({ message: e.message || "Reset failed" });
    }
  });

  /** Delete own account + related messages & requests */
  app.delete("/api/user/account", async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const uid = user._id;
      const name = user.name;
      await Message.deleteMany({
        $or: [{ user: name }, { to: name }]
      });
      await FriendRequest.deleteMany({ $or: [{ from: uid }, { to: uid }] });
      await Reel.deleteMany({ createdBy: uid });
      await User.updateMany({ friends: uid }, { $pull: { friends: uid } });
      await Group.updateMany({ members: uid }, { $pull: { members: uid } });
      await User.findByIdAndDelete(uid);
      res.json({ ok: true, message: "Account deleted" });
    } catch (e: any) {
      console.error("delete account:", e);
      res.status(500).json({ message: e.message || "Delete failed" });
    }
  });

  // Fetch Messages Route
  app.get("/api/messages", async (req, res) => {
    try {
      const { user, to, groupId } = req.query;
      let query: any = { isDeleted: { $ne: true } };

      if (groupId) {
        query.groupId = groupId;
      } else if (to === 'My Assistant' || user === 'My Assistant') {
        // AI Chat is private to the user
        query.$or = [
          { user: user, to: 'My Assistant' },
          { user: 'My Assistant', to: user }
        ];
      } else if (to && user) {
        // Private Chat
        query.$or = [
          { user: user, to: to },
          { user: to, to: user }
        ];
      } else {
        // Global Chat (fallback or if no recipient specified)
        query.to = { $exists: false };
      }

      const messages = await Message.find(query).sort({ createdAt: 1 });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  // Fetch All Users Route
  app.get("/api/users", async (req, res) => {
    try {
      const users = await User.find(
        { email: { $nin: ["assistant@intelli-call.io"] } },
        { password: 0 }
      );
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Search Users Route
  app.get("/api/users/search", async (req, res) => {
    try {
      const { query } = req.query;
      const users = await User.find({
        email: { $nin: ["assistant@intelli-call.io"] },
        $or: [
          { name: { $regex: query as string, $options: "i" } },
          { email: { $regex: query as string, $options: "i" } },
        ],
      } as any, { password: 0 });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error searching users" });
    }
  });

  // Fetch Groups Route
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await Group.find().populate('members', '-password').populate('admin', '-password');
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Error fetching groups" });
    }
  });

  // Add Member to Group Route
  app.post("/api/groups/:groupId/members", async (req, res) => {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });
      
      if (!group.members.includes(userId)) {
        group.members.push(userId);
        await group.save();
      }
      const updatedGroup = await Group.findById(groupId).populate('members', '-password').populate('admin', '-password');
      res.json(updatedGroup);
    } catch (error) {
      res.status(500).json({ message: "Error adding member to group" });
    }
  });

  // Create Group Route
  app.post("/api/groups", async (req, res) => {
    try {
      const { name, description, members, admin } = req.body;
      const group = await Group.create({
        name,
        description,
        members,
        admin: admin
      });
      res.status(201).json(group);
    } catch (error) {
      res.status(500).json({ message: "Error creating group" });
    }
  });

  // Delete Group Route
  app.delete("/api/groups/:groupId", async (req, res) => {
    try {
      const { groupId } = req.params;
      await Group.findByIdAndDelete(groupId);
      // Also delete messages for this group
      await Message.deleteMany({ groupId });
      res.json({ message: "Group and its messages deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting group" });
    }
  });

  // Exit Group Route
  app.delete("/api/groups/:groupId/members/:userId", async (req, res) => {
    try {
      const { groupId, userId } = req.params;
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });
      
      group.members = group.members.filter(m => m.toString() !== userId);
      
      // If admin leaves, assign new admin or delete group if empty
      if (group.admin && group.admin.toString() === userId) {
        if (group.members.length > 0) {
          group.admin = group.members[0];
        } else {
          await Group.findByIdAndDelete(groupId);
          await Message.deleteMany({ groupId });
          return res.json({ message: "Group deleted as it has no members" });
        }
      }
      
      await group.save();
      const updatedGroup = await Group.findById(groupId).populate('members', '-password').populate('admin', '-password');
      res.json(updatedGroup);
    } catch (error) {
      res.status(500).json({ message: "Error exiting group" });
    }
  });

  // Delete All Messages Route
  app.delete("/api/messages/all", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      await Message.deleteMany({ sender: userId });
      res.json({ message: "User messages deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting messages" });
    }
  });

  // Delete Conversation Messages Route
  app.delete("/api/messages/conversation", async (req, res) => {
    try {
      const { user, to, groupId } = req.query;
      let query: any = {};
      if (groupId) {
        query.groupId = groupId;
      } else if (user && to) {
        query.$or = [
          { user: user, to: to },
          { user: to, to: user }
        ];
      } else {
        return res.status(400).json({ message: "Missing parameters" });
      }
      await Message.deleteMany(query);
      res.json({ message: "Conversation deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting conversation" });
    }
  });

  // --- AI Routes ---
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { prompt } = req.body;
      const groqKey = process.env.GROQ_API_KEY;

      // Prefer Groq for "AI Explain" UX (faster + clean text).
      if (groqKey) {
        const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            temperature: 0.4,
            messages: [
              {
                role: "system",
                content: "You are a friendly and helpful companion. Keep responses clear and easy to understand. Respond in the same language as the user (Hindi/English/Hinglish).",
              },
              { role: "user", content: prompt },
            ],
          }),
        });

        const data: any = await response.json().catch(() => ({}));
        const text = data?.choices?.[0]?.message?.content;
        return res.json({ text: text || "Sorry, I couldn't generate an explanation right now." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback simple response if no AI key
        const responses = [
          "I'm currently in offline mode because GROQ_API_KEY and GEMINI_API_KEY are not set.",
          "Hello! I'm your assistant. My AI is offline right now. Try again later.",
          "You can still chat, but explanation needs AI keys on the server."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        return res.json({ text: randomResponse });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `You are My Assistant, a friendly and helpful companion. 
        A user is talking to you: "${prompt}". 
        
        Your Personality:
        - You are a real friend. Talk naturally, like a human would.
        - Respond in the SAME LANGUAGE as the user (Hindi, English, or Hinglish).
        - Be warm, empathetic, and casual.
        - You can chat about anything.
        - Keep it simple and easy to understand.
        
        Respond now as a close friend.`,
      });

      res.json({ text: response.text || "I'm sorry, I couldn't process that." });
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ message: "AI Node is currently busy or offline." });
    }
  });

  app.post("/api/ai/summarize", async (req, res) => {
    try {
      const { history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      const raw = (history || "").trim();
      if (!raw) {
        return res.json({ text: "Nothing to summarize yet." });
      }

      const lines = raw.split("\n").filter(Boolean);
      const safeLine = (line: string) => {
        const i = line.indexOf(":");
        if (i === -1) return line.trim();
        return line.slice(i + 1).trim();
      };

      if (!apiKey) {
        const first = safeLine(lines[0]);
        const last = safeLine(lines[lines.length - 1]);
        const summary =
          lines.length === 1
            ? `Quick summary (offline): "${first.slice(0, 280)}${first.length > 280 ? "…" : ""}"`
            : `Quick summary (${lines.length} messages, no API key): First: "${first.slice(0, 140)}${first.length > 140 ? "…" : ""}" · Latest: "${last.slice(0, 140)}${last.length > 140 ? "…" : ""}"`;
        return res.json({ text: summary });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Summarize this chat history concisely and highlight the main points:\n\n${history}`,
      });

      res.json({ text: response.text || "Could not generate summary." });
    } catch (error) {
      console.error("AI Summarize Error:", error);
      res.status(500).json({ message: "AI Summarization failed." });
    }
  });

  app.post("/api/ai/smart-replies", async (req, res) => {
    try {
      const { message } = req.body || {};
      if (!message || typeof message !== "string") {
        return res.json({ replies: ["OK", "Thanks", "Sure"] });
      }
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ replies: ["👍", "Got it", "Thanks"] });
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Return ONLY a JSON array of exactly 3 short reply strings (1–4 words each) to this message: "${message.slice(0, 500)}". Example format: ["Thanks","OK","Sure"]`,
      });
      let replies: string[] = [];
      try {
        const raw = (response.text || "").trim();
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        replies = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      } catch {
        replies = ["OK", "Thanks", "Sure"];
      }
      res.json({ replies: Array.isArray(replies) ? replies.slice(0, 3) : ["OK", "Thanks", "Sure"] });
    } catch (e) {
      console.error("smart-replies", e);
      res.json({ replies: ["OK", "Thanks", "Sure"] });
    }
  });

  app.post("/api/ai/translate", async (req, res) => {
    try {
      const { text } = req.body || {};
      if (!text || typeof text !== "string") {
        return res.status(400).json({ message: "Missing text" });
      }
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          text: `${text}\n\n(Translation needs GEMINI_API_KEY on the server — add it in .env)`,
        });
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Translate to Hindi (Hinglish if natural): "${text.slice(0, 4000)}". Return ONLY the translation.`,
      });
      res.json({ text: response.text || text });
    } catch (e) {
      console.error("translate", e);
      res.status(500).json({ message: "Translation failed" });
    }
  });

  app.post("/api/ai/draw", async (req, res) => {
    try {
      const { prompt } = req.body || {};
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ message: "Missing prompt" });
      }
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ message: "Set GEMINI_API_KEY on the server for AI features." });
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `User wants a picture of: "${prompt.slice(0, 500)}". Reply with ONE short vivid paragraph describing the scene (we show this as text when inline image is not available).`,
      });
      res.json({ imageUrl: null, textFallback: response.text || "" });
    } catch (e) {
      console.error("draw", e);
      res.status(500).json({ message: "Image request failed" });
    }
  });

  // --- Friend Request Routes ---
  app.post("/api/friends/request", async (req, res) => {
    try {
      const { from, to } = req.body;
      const existingRequest = await FriendRequest.findOne({ from, to, status: 'pending' });
      if (existingRequest) return res.status(400).json({ message: "Request already sent" });
      
      const request = await FriendRequest.create({ from, to });
      const populatedRequest = await FriendRequest.findById(request._id).populate('from', '-password');
      io.to(to.toString()).emit("friend_request_received", populatedRequest);
      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ message: "Error sending friend request" });
    }
  });

  app.get("/api/friends/requests/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const requests = await FriendRequest.find({ to: userId, status: 'pending' }).populate('from', 'name pic email');
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching requests" });
    }
  });

  app.post("/api/friends/respond", async (req, res) => {
    try {
      const { requestId, status } = req.body;
      const request = await FriendRequest.findById(requestId);
      if (!request) return res.status(404).json({ message: "Request not found" });
      
      request.status = status;
      await request.save();

      if (status === 'accepted') {
        await User.findByIdAndUpdate(request.from, { $addToSet: { friends: request.to } });
        await User.findByIdAndUpdate(request.to, { $addToSet: { friends: request.from } });
        
        const userB = await User.findById(request.to);
        if (userB) {
          io.to(request.from.toString()).emit("friend_request_accepted", { from: userB.name });
        }
      }
      res.json({ message: `Request ${status}` });
    } catch (error) {
      res.status(500).json({ message: "Error responding to request" });
    }
  });

  app.get("/api/friends/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).populate('friends', 'name pic email');
      res.json(user?.friends || []);
    } catch (error) {
      res.status(500).json({ message: "Error fetching friends" });
    }
  });

  // Remove Friend Route
  app.delete("/api/friends/:userId/:friendId", async (req, res) => {
    try {
      const { userId, friendId } = req.params;
      await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
      await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
      
      // Also delete messages between them? 
      // User said "uska sara data bhi fir nadikhe"
      const userA = await User.findById(userId);
      const userB = await User.findById(friendId);
      if (userA && userB) {
        await Message.deleteMany({
          $or: [
            { user: userA.name, to: userB.name },
            { user: userB.name, to: userA.name }
          ]
        });
      }
      
      res.json({ message: "Friend removed and conversation deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error removing friend" });
    }
  });

  // Socket.io Setup (Merging user's logic)
  const onlineUserIds = new Set<string>();
  const socketIdToUserId = new Map<string, string>();

  const broadcastOnline = async () => {
    try {
      const ids = Array.from(onlineUserIds);
      if (ids.length === 0) {
        io.emit("user_status_change", []);
        return;
      }
      const users = await User.find({ _id: { $in: ids } }, { password: 0 }).select("_id name pic email");
      const mapped = users.map((u: any) => ({
        _id: u._id.toString(),
        name: u.name,
        pic: u.pic,
        email: u.email,
        isOnline: true,
      }));
      io.emit("user_status_change", mapped);
    } catch (e) {
      console.error("broadcastOnline error:", e);
    }
  };

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
      if (userData && userData._id) {
        const uid = userData._id.toString();
        socket.join(uid);
        socketIdToUserId.set(socket.id, uid);
        onlineUserIds.add(uid);
        console.log("User Setup: " + userData._id);
        socket.emit("connected");
        broadcastOnline();
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

    socket.on("new message", async (newMessageReceived) => {
      const chat = newMessageReceived.chat;
      const groupId = newMessageReceived.groupId;
      
      // Save to MongoDB
      if (mongoose.connection.readyState === 1) {
        try {
          await Message.create({
            id: newMessageReceived.id,
            user: newMessageReceived.sender.name,
            senderId: newMessageReceived.sender._id,
            to: newMessageReceived.to,
            groupId: groupId,
            text: newMessageReceived.content,
            image: newMessageReceived.image,
            video: newMessageReceived.video,
            audio: newMessageReceived.audio,
            timestamp: new Date().toISOString(),
            profilePic: newMessageReceived.sender.pic,
            isGhost: newMessageReceived.isGhost,
            isAI: newMessageReceived.isAI,
            isSystem: newMessageReceived.isSystem,
            reactions: {}
          });
        } catch (err: any) {
          console.error("Error saving message to MongoDB:", err.message);
        }
      }

      if (groupId) {
        socket.to(String(groupId)).emit("message received", newMessageReceived);
        return;
      }

      if (!chat || !chat.users) return;

      // Global broadcast if 'all' is in users
      if (chat.users.some((u: any) => u._id === 'all')) {
        socket.broadcast.emit("message received", newMessageReceived);
        return;
      }

      chat.users.forEach((user: any) => {
        if (user._id === newMessageReceived.sender._id) return;
        socket.in(user._id).emit("message received", newMessageReceived);
      });
    });

    socket.on("join group", (groupId) => {
      socket.join(groupId);
      console.log("User Joined Group: " + groupId);
    });

    // Support for the "Quantum" UI events if they differ
    socket.on("send_message", async (data: any) => {
      try {
        await Message.create({
          id: data.id || Math.random().toString(36).substr(2, 9),
          user: data.user,
          to: data.to,
          groupId: data.groupId,
          text: data.text,
          image: data.image,
          video: data.video,
          audio: data.audio,
          timestamp: data.timestamp || new Date().toISOString(),
          profilePic: data.profilePic,
          isGhost: data.isGhost,
          isAI: data.isAI,
          isSystem: data.isSystem,
          reactions: data.reactions || {}
        });
      } catch (err) {
        console.error("Error saving message to MongoDB:", err);
      }
      // Targeted delivery — avoid broadcasting every chat to every socket
      if (data.groupId) {
        io.to(String(data.groupId)).emit("receive_message", data);
        return;
      }
      if (data.to) {
        try {
          const recipient = await User.findOne({ name: data.to });
          if (recipient) {
            io.to(recipient._id.toString()).emit("receive_message", data);
          }
        } catch (e) {
          console.error("send_message target lookup:", e);
        }
        return;
      }
      io.emit("receive_message", data);
    });

    // Message Reactions
    socket.on("add_reaction", async ({ messageId, emoji, username }) => {
      try {
        const message = await Message.findOne({ id: messageId });
        if (message) {
          const reactions = message.reactions || {};
          if (!reactions[emoji]) reactions[emoji] = [];
          
          const userIndex = reactions[emoji].indexOf(username);
          if (userIndex > -1) {
            reactions[emoji].splice(userIndex, 1);
          } else {
            reactions[emoji].push(username);
          }

          await Message.updateOne({ id: messageId }, { $set: { reactions } });
          io.emit("reaction_updated", { messageId, reactions });
        }
      } catch (err) {
        console.error("Error updating reaction in MongoDB:", err);
      }
    });

    // WebRTC Signaling — prefer user rooms so multiple clients don't cross-talk
    socket.on("offer", (data: any) => {
      console.log(`📞 Call Offer from ${data.from} (${data.type})`);
      if (data.toUserId) {
        io.to(String(data.toUserId)).emit("offer", data);
      } else {
        socket.broadcast.emit("offer", data);
      }
    });

    socket.on("answer", (data: any) => {
      console.log(`📞 Call Answer to ${data.toUserId || data.to}`);
      if (data.toUserId) {
        io.to(String(data.toUserId)).emit("answer", data);
      } else {
        socket.broadcast.emit("answer", data);
      }
    });

    socket.on("ice-candidate", (data: any) => {
      if (data.toUserId) {
        io.to(String(data.toUserId)).emit("ice-candidate", data);
      } else {
        socket.broadcast.emit("ice-candidate", data);
      }
    });

    socket.on("end_call", (data?: { toUserId?: string }) => {
      console.log("📞 Call Ended");
      if (data?.toUserId) {
        io.to(String(data.toUserId)).emit("call_ended");
      } else {
        socket.broadcast.emit("call_ended");
      }
    });

    // Edit Message
    socket.on("edit_message", async (editedMsg) => {
      if (mongoose.connection.readyState === 1) {
        try {
          await Message.updateOne(
            { id: editedMsg.id },
            { $set: { text: editedMsg.text, isEdited: true, editedAt: editedMsg.editedAt } }
          );
          socket.broadcast.emit("message_edited", editedMsg);
        } catch (err: any) {
          console.error("Error editing message in MongoDB:", err.message);
        }
      } else {
        socket.broadcast.emit("message_edited", editedMsg); // Still broadcast even if DB fails
      }
    });

    // Delete Message
    socket.on("delete_message", async ({ id }) => {
      console.log(`🗑️ Deleting message: ${id}`);
      if (mongoose.connection.readyState === 1) {
        try {
          const result = await Message.updateOne(
            { id },
            { $set: { isDeleted: true, text: "🚫 This message was deleted" } }
          );
          console.log(`🗑️ Delete result: ${JSON.stringify(result)}`);
          io.emit("message_deleted", { id });
        } catch (err: any) {
          console.error("Error deleting message in MongoDB:", err.message);
        }
      } else {
        io.emit("message_deleted", { id }); // Still broadcast even if DB fails
      }
    });

    // Delete All Messages (Socket)
    socket.on("delete_all_messages", async () => {
      try {
        await Message.deleteMany({});
        io.emit("all_messages_deleted");
      } catch (err) {
        console.error("Error deleting all messages:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("USER DISCONNECTED");
      const uid = socketIdToUserId.get(socket.id);
      if (uid) {
        onlineUserIds.delete(uid);
        socketIdToUserId.delete(socket.id);
        broadcastOnline();
      }
    });
  });

  // Vite middleware for development
  // Force development mode if not explicitly production
  if (process.env.NODE_ENV !== "production") {
    process.env.NODE_ENV = "development";
  }
  const isProduction = process.env.NODE_ENV === "production";
  console.log(`🚀 Running in ${isProduction ? "Production" : "Development"} Mode`);

  if (!isProduction) {
    console.log("🚀 Running in Development Mode - Enabling Vite Middleware");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("🚀 Running in Production Mode - Serving static files");
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
