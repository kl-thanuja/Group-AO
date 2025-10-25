import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import "./passport.js";
import User from "./models/User.js";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(passport.initialize());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DataBase connected"))
  .catch((err) => console.error("Database connection error:", err));

app.get("/", (req, res) => {
  res.send("Google OAuth Server Running Properly");
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000",
    session: false,
  }),
  async (req, res) => {
    try {
      const token = jwt.sign({ id: req.user._id }, "Rahull", process.env.JWT_SECRET);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
      });
      req.user.token = token;
      await req.user.save();

      res.redirect(`http://localhost:3000/dashboard?token=${token}`);
    } catch (err) {
      console.error("OAuth callback error:", err);
      res.redirect("http://localhost:3000");
    }
  }
);

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["email"], session: false })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "http://localhost:3000",
    session: false,
  }),
  async (req, res) => {
    try {
      const token = jwt.sign({ id: req.user._id }, "Rahull", process.env.JWT_SECRET);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
      });
      req.user.token = token;
      await req.user.save();

      res.redirect(`http://localhost:3000/dashboard?token=${token}`);
    } catch (err) {
      console.error("OAuth callback error:", err);
      res.redirect("http://localhost:3000");
    }
  }
);

function verifyToken(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
}
app.get("/profile", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ user });
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
app.post("/generate-quiz", async (req, res) => {
  try {
    console.log("hello");
    console.log(process.env.GEMINI_API_KEY)
    const { transcript, scope = "general", numQuestions = 5 } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required." });
    }

    const prompt = `You are an intelligent quiz generator. 
Your task is to read the given conversation transcript, understand the *core subject or concept* being discussed (for example, if the transcript is about "machine learning basics," identify that the main topic is "machine learning"). 

Then, generate a quiz that tests conceptual understanding of that subject — not the dialogue itself. 
The questions should be based on the *topic of discussion*, not on who said what or what was directly mentioned in the transcript. 

Each question should:
- Be conceptual and educational.
- Avoid referring to the speakers or the conversation.
- Focus only on the domain knowledge implied by the conversation (e.g., if transcript is about databases, questions should test database concepts).
- Include 4 options (A, B, C, D), a correct answer, and a brief explanation.

Output in the following JSON format only:

{
  "quiz": [
    {
      "question": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "answer": "B",
      "explanation": "..."
    }
  ]
}

Transcript:
${transcript}
Number of questions to generate: ${numQuestions}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log(text);
    let quizData;
    try {
      const cleanText = text
        .replace(/```json/i, "")
        .replace(/```/g, "")
        .trim();
      quizData = JSON.parse(cleanText);
    } catch (err) {
      console.warn("Could not parse model output as JSON:", err);
      return res.status(500).json({ error: "Invalid response from AI model", raw: text });
    }

    res.json(quizData);
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: "Failed to generate quiz", details: error.message });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // frontend URL
    methods: ["GET", "POST"]
  }
});

const rooms = {}; // store socket IDs in each room

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(socket.id);

    console.log(`${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit("user-joined", socket.id);

    socket.on("offer", (data) => {
      socket.to(data.to).emit("offer", {
        from: socket.id,
        sdp: data.sdp,
      });
    });

    socket.on("answer", (data) => {
      socket.to(data.to).emit("answer", {
        from: socket.id,
        sdp: data.sdp,
      });
    });

    socket.on("ice-candidate", (data) => {
      socket.to(data.to).emit("ice-candidate", {
        from: socket.id,
        candidate: data.candidate,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      rooms[roomId] = rooms[roomId]?.filter((id) => id !== socket.id);
      socket.to(roomId).emit("user-left", socket.id);
    });
  });
});


server.listen(8000, () => console.log("Server + Socket.IO running on port 8000"));