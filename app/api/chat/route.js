import { NextResponse } from 'next/server';
import { appGraph } from './agent';
import { HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";

export async function POST(req) {
  try {
    const { messages } = await req.json();
    
    // Convert JSON messages to LangChain message classes
    const lcMessages = messages.map(m => {
      if (m.role === 'user') return new HumanMessage(m.content);
      if (m.role === 'assistant') {
        const msg = new AIMessage(m.content);
        if (m.tool_calls) msg.tool_calls = m.tool_calls;
        return msg;
      }
      if (m.role === 'tool') {
        return new ToolMessage({ content: m.content, tool_call_id: m.tool_call_id });
      }
      return new HumanMessage(m.content);
    });

    // Invoke the LangGraph multi-agent workflow
    const finalState = await appGraph.invoke({
      messages: lcMessages
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
