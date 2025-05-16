import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { agent } from "./agent.js"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message is required." });
    }

    const threadID = 42; // You can use dynamic threads later

    const result = await agent.invoke(
      {
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        configurable: { threadID },
      }
    );

    const lastAIMessage = result.messages
      .slice()
      .reverse()
      .find((msg) => msg.constructor.name === "AIMessage");

    const reply =
      typeof lastAIMessage?.content === "string"
        ? lastAIMessage.content
        : "No valid AI response.";

    res.json({ reply });
  } catch (err) {
    console.error("Chat Agent Error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
