import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import "./passport.js";
import RoomNotes from "./routes/RoomNotes.js";
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
app.use(cookieParser());
app.use(passport.initialize());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));

app.get("/", (req, res) => res.send("Server OK"));

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
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET || "Rahull"
    );
    req.user.token = token;
    await req.user.save();
    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
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
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET || "Rahull"
    );
    req.user.token = token;
    await req.user.save();
    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  }
);

function verifyToken(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "Rahull");
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
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
    const { transcript, numQuestions = 5 } = req.body;
    console.log({ transcript, numQuestions });

    const prompt = `You are an intelligent quiz generator. 
Your task is to read the given conversation transcript, understand the *core subject or concept* being discussed (for example, if the transcript is about "machine learning basics," identify that the main topic is "machine learning"). 

Then, generate a quiz that tests conceptual understanding of that subject — not the dialogue itself. 
The questions should be based on the *topic of discussion*, not on who said what or what was directly mentioned in the transcript. 

Each question should:
- Be conceptual and educational.
- Avoid referring to the speakers or the conversation.
- Focus only on the domain knowledge implied by the conversation (e.g., if transcript is about databases, questions should test database concepts).
- Include 4 options (A, B, C, D), a correct answer, and a brief explanation.
- Generate only 5 questions

Output in the following JSON format only:

Output JSON in the following format:
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
`;
    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    res.json(JSON.parse(text));
  } catch (error) {
    res
      .status(500)
      .json({ error: "Quiz generation failed", details: error.message });
  }
});

app.post("/generate-notes", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript)
      return res.status(400).json({ error: "Transcript missing" });
    const prompt = `
    Summarize this group discussion into:
    {
      "summaryNotes": ["..."],
      "actionItems": ["..."],
      "recap": "..."
    }
    Transcript:
    ${transcript}`;
    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```(json)?/g, "")
      .trim();
    const jsonText = text.match(/\{[\s\S]*\}/);
    const notes = jsonText ? JSON.parse(jsonText[0]) : {};
    // const savedNotes = await RoomNotes.create({
    //   roomId: req.body.roomId,
    //   userId: req.user.id,
    //   summaryNotes: notes.summaryNotes,
    //   actionItems: notes.actionItems,
    //   recap: notes.recap,
    // });
    // io.to(roomId).emit("receive-notes", savedNotes);

    res.json(notes);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Note generation failed", details: err.message });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, user }) => {
    socket.join(roomId);
    socket.userId = user.id; // save userId for later
    socket.userName = user.name;
    socket
      .to(roomId)
      .emit("user-joined", { userId: socket.id, userName: user.name });
    socket.on("send-notes", async (data) => {
      const { roomId, notes } = data;

      // Get all sockets in the room
      const sockets = await io.in(roomId).fetchSockets();

      // Save notes for each user
      const savedNotes = [];
      for (const s of sockets) {
        if (!s.userId) continue; 
        const note = await RoomNotes.create({
          roomId,
          userId: s.userId,
          summaryNotes: notes.summaryNotes,
          actionItems: notes.actionItems,
          recap: notes.recap,
        });
        savedNotes.push(note);
      }

      // Broadcast to all users in room
      io.to(roomId).emit("receive-notes", savedNotes);
    });
    socket.on("offer", (data) =>
      socket
        .to(data.to)
        .emit("offer", { from: socket.id, sdp: data.sdp, userName: user.name })
    );
    socket.on("answer", (data) =>
      socket.to(data.to).emit("answer", { from: socket.id, sdp: data.sdp })
    );
    socket.on("ice-candidate", (data) =>
      socket
        .to(data.to)
        .emit("ice-candidate", { from: socket.id, candidate: data.candidate })
    );
    socket.on("disconnect", () =>
      socket.to(roomId).emit("user-left", socket.id)
    );
  });
});

server.listen(8000, () => console.log("Server + Socket.IO running on 8000"));
