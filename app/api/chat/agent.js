import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import dbConnect from "@/lib/db/mongoose";
import Product from "@/models/Product";
import AuditLog from "@/models/AuditLog";
import Order from "@/models/Order";
import crypto from "crypto";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { SystemMessage, BaseMessage } from "@langchain/core/messages";

const StateAnnotation = Annotation.Root({
  messages: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  cart: Annotation({
    reducer: (x, y) => y,
    default: () => [],
  })
});

// Note: LLM Models will be initialized dynamically per request in createAppGraph

// 2. Define the Catalog Search Tool
export const searchCatalogTool = tool(
  async ({ query, category, maxPrice }) => {
    await dbConnect();
    const filter = {};
    if (query) {
      // Basic singularization to match "headsets" to "headset"
      let cleanQuery = query.toLowerCase();
      if (cleanQuery.endsWith('s') && cleanQuery.length > 3 && !cleanQuery.endsWith('ss')) {
        cleanQuery = cleanQuery.slice(0, -1);
      }
      const regex = { $regex: cleanQuery, $options: "i" };
      filter.$or = [
        { name: regex },
        { category: regex },
        { description: regex },
        { brandName: regex }
      ];
    }
    if (category && category !== 'All') {
      filter.category = { $regex: category, $options: "i" };
    }
    if (maxPrice) {
      filter.price = { $lte: maxPrice };
    }
    
    // Find matching products
    let products = await Product.find(filter).limit(4).lean();
    
    // Fallback: If no products found, try a looser search (ignore category/price)
    if (products.length === 0 && filter.$or) {
      products = await Product.find({ $or: filter.$or }).limit(4).lean();
    }
    
    if (products.length === 0) {
      return "No products found matching the criteria in our catalog. Suggest related queries or clear the filters.";
    }
    
    await AuditLog.create({
      action: 'search_catalog',
      entityType: 'search',
      details: { query, category, maxPrice },
      reason: 'AI searching for products to recommend',
      status: 'success'
    });
    
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

// 3. Define the Checkout Tool (with Policy Gatekeeper)
export const checkoutCartTool = tool(
  async ({}, config) => {
    await dbConnect();
    
    // Extract the deterministic cart from the graph state
    const state = config?.configurable?.state || {};
    const cart = state.cart || [];

    if (!cart || cart.length === 0) {
      await AuditLog.create({ action: 'checkout', reason: 'Cart is empty', status: 'blocked' });
      return "BLOCKED: The user's cart is empty. They cannot checkout.";
    }

    const total = cart.reduce((sum, item) => {
      const price = item.isDeal ? item.price * (1 - item.discountPercentage / 100) : item.price;
      return sum + (price * item.quantity);
    }, 0);
    
    // SPEND BOUNDING POLICY
    if (total > 5000) {
      await AuditLog.create({ 
        action: 'checkout', 
        details: { total, cart },
        reason: `Cart total ₹${total} exceeds the strict ₹5,000 policy limit.`, 
        status: 'blocked' 
      });
      return `BLOCKED: The cart total (₹${total}) exceeds the ₹5,000 limit. You MUST apologize to the user and tell them they need to remove items before they can checkout.`;
    }

    // IDEMPOTENCY CHECK
    const cartHash = crypto.createHash('sha256').update(JSON.stringify(cart)).digest('hex');
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60000);
    const existingOrder = await Order.findOne({ cartHash, createdAt: { $gte: fifteenMinsAgo } });
    
    if (existingOrder) {
      return "SUCCESS: The mock payment was processed successfully (Idempotent response). Tell the user their order is confirmed.";
    }

    // INVENTORY LOCKING
    for (const item of cart) {
      const product = await Product.findById(item._id);
      if (!product || product.stockCount < item.quantity) {
        await AuditLog.create({ action: 'checkout', reason: `Item ${item.name} out of stock.`, status: 'blocked' });
        return `BLOCKED: ${item.name} is out of stock or does not have enough quantity. Apologize and tell the user to remove it.`;
      }
    }

    // Decrement inventory
    for (const item of cart) {
      await Product.findByIdAndUpdate(item._id, { $inc: { stockCount: -item.quantity } });
    }

    // CREATE ORDER
    await Order.create({
      sessionId: config?.configurable?.sessionId || 'default-session',
      cartHash,
      totalAmount: total,
      items: cart.map(i => ({ productId: i._id, name: i.name, quantity: i.quantity, priceAtPurchase: i.price })),
      status: 'paid'
    });

    await AuditLog.create({ 
      action: 'checkout', 
      details: { total, cart },
      reason: 'Checkout processed successfully', 
      status: 'success' 
    });

    return "SUCCESS: The mock payment was processed successfully. Tell the user their order is confirmed.";
  },
  {
    name: "checkout_cart",
    description: "Use this to process a checkout when the user asks to buy what's in their cart. Requires no arguments, as it reads the cart from the backend state securely.",
    schema: z.object({})
  }
);

// 4. Define the LangGraph Nodes
const tools = [searchCatalogTool, checkoutCartTool];
const toolNode = new ToolNode(tools);

function shouldContinue(state) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
}

// 5. Export a factory function to create the graph per-request with the correct API key
export function createAppGraph(userGroqApiKey) {
  const groqKey = userGroqApiKey || process.env.GROQ_API_KEY || "dummy";
  
  const groqModel = new ChatGroq({
    apiKey: groqKey,
    model: "groq/compound-mini", 
    temperature: 0.2
  });

  const secondaryGroqModel = new ChatGroq({
    apiKey: groqKey,
    model: "openai/gpt-oss-20b", 
    temperature: 0.2
  });

  const geminiModel = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || "dummy",
    model: "gemini-2.5-flash", 
    temperature: 0.2
  });

  const modelWithTools = groqModel.bindTools(tools).withFallbacks({
    fallbacks: [
      secondaryGroqModel.bindTools(tools),
      geminiModel.bindTools(tools)
    ]
  });

  async function agentNode(state) {
    const messages = [
      new SystemMessage(
        "You are the Bentely AI Shopping Assistant. You help users find products, compare them, and discover deals. " +
        "CRITICAL RULES: \n" +
        "1. ALWAYS use the `search_catalog` tool to fetch real products from the database. NEVER hallucinate or invent products! \n" +
        "2. If you see CART CONTEXT provided, and the user asks for recommendations, explicitly analyze their cart and recommend exactly ONE complementary item using `search_catalog`.\n" +
        "3. If the user says they want to checkout, buy, or pay for their cart, invoke the `checkout_cart` tool immediately.\n" +
        "4. Format your responses using Markdown. Use bolding and bullet points to compare products clearly. Do not output image URLs."
      ),
      ...state.messages,
    ];
    
    const response = await modelWithTools.invoke(messages);
    return { messages: [response] };
  }

  const workflow = new StateGraph(StateAnnotation)
    .addNode("agent", agentNode)
    .addNode("tools", async (state, config) => {
      return await toolNode.invoke(state, { ...config, configurable: { ...config?.configurable, state } });
    })
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  return workflow.compile();
}
