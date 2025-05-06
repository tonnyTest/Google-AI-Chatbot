import { createReactAgent } from "@langchain/langgraph/prebuilt";
import axios from "axios";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const weatherTool = tool(
  async ({ query }) => {


    console.log("[Tool] Query from Gemini:", query);

    // const match = query.match(/in\s+([a-zA-Z\s]+)|of\s+([a-zA-Z\s]+)/i);
    // const location = match ? (match[1] || match[2]).trim() : null;

    const location = query;

    console.log(".................[Tool] Extracted location:", location);

    // if (!location) {
    //   return "Sorry, I couldn't identify the location.";
    // }

    try{
      const response = await axios.get("https://serpapi.com/search", {
        params: {
          engine: "google",
          q: `weather in ${location}`,
          api_key: process.env.SERPAPI_KEY,
        },
      });

      console.log("//////////////////[Tool] Weather data:", response.data?.organic_results?.[0]?.snippet);

      const weatherData = response.data?.organic_results?.[0]?.snippet;

      if (!weatherData) {
        return `I couldn't find weather info for ${location}.`;
      }

      return `Current weather in ${location} is ${weatherData.temperature}, ${weatherData.description}.`;
  
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

const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro-latest",
  apiKey: process.env.GOOGLE_API_KEY,
  maxOutputTokens: 2048,
});

const checkPointSaver = new MemorySaver();

export const agent = createReactAgent({
  llm: model,
  tools: [weatherTool],
  checkPointSaver,
});