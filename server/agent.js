import { createReactAgent } from "@langchain/langgraph/prebuilt";
import axios from "axios";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  maxOutputTokens: 2048,
});

const checkPointSaver = new MemorySaver();

const weatherTool = tool(
  async ({ query }) => {
    const location = query;
    try{
      const response = await axios.get("https://serpapi.com/search", {
        params: {
          engine: "google",
          q: `weather in ${location}`,
          api_key: process.env.SERPAPI_KEY,
        },
      });
      
      const weatherData = response.data?.organic_results?.[0]?.snippet;

      if (!weatherData || typeof weatherData !== "string") {
        return `I couldn't find weather info for ${location}.`;
      }

      return `Current weather in ${location} is ${weatherData}`;
  
    }catch (error){
      console.error("[Tool] SerpAPI error:", error?.response?.data || error.message);
      return "Sorry, I couldn't retrieve the weather information right now.";
    }
  },
  {
    name: "weather",
    description: "Get the weather in a given location",
    schema: z.object({
      query: z.string().describe("The query is used in your search"),
    }),
  }
);

export const agent = createReactAgent({
  llm: model,
  tools: [weatherTool],
  checkPointSaver,
});