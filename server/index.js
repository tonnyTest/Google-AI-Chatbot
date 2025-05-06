import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { agent } from "./agent.js"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*"}));
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    console.log("----- Received message:", message);

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message is required." });
    }

    const threadID = 42;

    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    },{
      configurable: { threadID },
    });

    // Log all messages (already done in your case)
    console.log("----- Agent result:", result);

    // Get last AI message from the conversation
    const lastAIMessage = result.messages
    .slice()
    .reverse()
    .find((msg) => msg.constructor.name === "AIMessage");

      console.log("----- lastAIMessage message:", lastAIMessage);

    const reply = typeof lastAIMessage?.content === "string"
      ? lastAIMessage.content
      : "No valid AI response.";

      console.log("----- reply message:", reply);

    res.json({ reply });
  } catch (err) {
    console.error("Agent error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
