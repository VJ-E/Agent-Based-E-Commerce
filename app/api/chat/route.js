import { NextResponse } from 'next/server';
import { createAppGraph } from './agent';
import { HumanMessage, AIMessage, ToolMessage, SystemMessage } from "@langchain/core/messages";
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import User from '@/models/User';

export async function POST(req) {
  try {
    const { messages, cart } = await req.json();
    
    // Convert JSON messages to LangChain message classes
    const lcMessages = messages.map(m => {
      const safeContent = m.content || "";
      if (m.role === 'user') return new HumanMessage(safeContent);
      if (m.role === 'assistant') {
        const msg = new AIMessage(safeContent);
        if (m.tool_calls) msg.tool_calls = m.tool_calls;
        return msg;
      }
      if (m.role === 'tool') {
        return new ToolMessage({ content: safeContent, tool_call_id: m.tool_call_id });
      }
      return new HumanMessage(safeContent);
    });

    // Inject cart context
    if (cart && cart.length > 0) {
      const cartSummary = cart.map(item => `${item.quantity}x ${item.name} (₹${item.price})`).join(', ');
      lcMessages.unshift(new SystemMessage(`CART CONTEXT: The user currently has the following items in their cart: ${cartSummary}. Keep this in mind when making upselling recommendations.`));
    }

    // Retrieve user's Groq API Key if logged in
    let userGroqApiKey = null;
    try {
      const token = cookies().get('token')?.value;
      if (token) {
        const decoded = await verifyToken(token);
        if (decoded) {
          await dbConnect();
          const user = await User.findById(decoded.userId).lean();
          if (user && user.groqApiKey) {
            userGroqApiKey = user.groqApiKey;
          }
        }
      }
    } catch (e) {
      console.error("Failed to load user API key", e);
    }

    // Invoke the LangGraph multi-agent workflow
    const appGraph = createAppGraph(userGroqApiKey);
    const finalState = await appGraph.invoke({
      messages: lcMessages,
      cart: cart || []
    });

    // Extract the new messages to send back
    const newMessages = finalState.messages.slice(lcMessages.length);
    
    // Intercept tool outputs to inject MiniProductCards in the frontend
    let recommendedProducts = [];
    for (const msg of newMessages) {
      if (msg._getType() === 'tool' && msg.name === 'search_catalog') {
        try {
          const parsed = JSON.parse(msg.content);
          if (Array.isArray(parsed)) {
            // Deduplicate in case multiple tool calls return same items
            parsed.forEach(p => {
              if (!recommendedProducts.find(ext => ext._id === p._id)) {
                recommendedProducts.push(p);
              }
            });
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    }

    const lastAiMessage = newMessages.reverse().find(m => m._getType() === 'ai');
    
    return NextResponse.json({
      role: 'assistant',
      content: lastAiMessage ? lastAiMessage.content : "I encountered an error processing that.",
      products: recommendedProducts
    });
    
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
