import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import dbConnect from "@/lib/db/mongoose";
import Product from "@/models/Product";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { SystemMessage } from "@langchain/core/messages";

// 1. Define Fallback LLM Models
const groqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || "dummy",
  model: "llama-3.1-70b-versatile", // Primary model
  temperature: 0.2
});

const openRouterModel = new ChatOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "dummy",
  configuration: {
    baseURL: "https://openrouter.ai/api/v1"
  },
  model: "meta-llama/llama-3.1-70b-instruct", // Secondary model
  temperature: 0.2
});

const geminiModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy",
  model: "gemini-2.5-flash", // Tertiary model
  temperature: 0.2
});

// Fallbacks will be applied after tools are bound

// 2. Define the Catalog Search Tool
export const searchCatalogTool = tool(
  async ({ query, category, maxPrice }) => {
    await dbConnect();
    const filter = {};
    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }
    if (category && category !== 'All') {
      filter.category = { $regex: category, $options: "i" };
    }
    if (maxPrice) {
      filter.price = { $lte: maxPrice };
    }
    
    // Find matching products
    const products = await Product.find(filter).limit(4).lean();
    
    if (products.length === 0) {
      return "No products found matching the criteria in our catalog.";
    }
    
    // Return structured JSON for the LLM and UI to consume
    return JSON.stringify(products.map(p => ({
      _id: p._id.toString(),
      name: p.name,
      price: p.price,
      category: p.category,
      isDeal: p.isDeal,
      imageUrl: p.imageUrl,
      discountPercentage: p.discountPercentage
    })));
  },
  {
    name: "search_catalog",
    description: "Search the real product catalog in the database. Returns a JSON list of active products. ALWAYS use this to find real products before recommending anything.",
    schema: z.object({
      query: z.string().optional().describe("Search keyword (e.g. 'headphones', 'shirt')"),
      category: z.string().optional().describe("Category of the product"),
      maxPrice: z.number().optional().describe("Maximum price in INR"),
    })
  }
);

// 3. Define the LangGraph Nodes
const tools = [searchCatalogTool];
const toolNode = new ToolNode(tools);

// Bind tools to each model individually, then compose with fallbacks
const modelWithTools = groqModel.bindTools(tools).withFallbacks({
  fallbacks: [
    openRouterModel.bindTools(tools),
    geminiModel.bindTools(tools)
  ]
});

async function agentNode(state) {
  const messages = [
    new SystemMessage(
      "You are the Bentely AI Shopping Assistant. You help users find products, compare them, and discover deals. " +
      "CRITICAL: ALWAYS use the `search_catalog` tool to fetch real products from the database. NEVER hallucinate or invent products! " +
      "Format your responses using Markdown. Use bolding and bullet points to compare products clearly. " +
      "If you found products via the tool, summarize them enthusiastically. The frontend will automatically display the product cards below your text, so you don't need to output image URLs."
    ),
    ...state.messages,
  ];
  
  const response = await modelWithTools.invoke(messages);
  return { messages: [response] };
}

// 4. Construct the Graph
function shouldContinue(state) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
}

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", agentNode)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

export const appGraph = workflow.compile();
