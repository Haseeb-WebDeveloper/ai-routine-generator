import { streamText, convertToModelMessages, stepCountIs } from "ai";
// import { cohere } from '@ai-sdk/cohere';
import { google } from '@ai-sdk/google';
import { PROMPT_TEMPLATES } from "./ai-config";
import { agentTools } from "@/tools";

// Define product interface
export interface Product {
  productName: string;
  price: number;
  brand: string;
  type: string;
  imageUrl: string;
  buyLink: string;
  description?: string;
}


type UIPart = { type: "text"; text: string }
type UIMessage = {
  role: "user" | "assistant" | "system";
  parts: UIPart[];
  id?: string;
};

export async function aiAgent(messages: UIMessage[]) {
  try {

    // console.log("[AI] messages:", messages);

    const modelMessages = convertToModelMessages(
      messages.map((m) => ({
        role: m.role,
        content: (m.parts || []).map((p) => p.text).join(""),
        parts: m.parts,
      }))
    );

    // console.log("[AI] modelMessages:", modelMessages);

    const systemPrompt = PROMPT_TEMPLATES.SYSTEM_PROMPT.replace(
      "{conversationHistory}",
      ""
    );

    // console.log("[AI] systemPrompt:", systemPrompt);


    const result = await streamText({
      model: google("gemini-2.5-flash"),
      messages: [
        { role: "system", content: systemPrompt },
        ...modelMessages,
      ],
      tools: agentTools,
      stopWhen: stepCountIs(15),
      onFinish: async (event) => {
        // console.log("[AI] onFinish:", event);
      }
    });
    
    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error("\n[AI] === Error in aiAgent ===");
    console.error(error);
    throw error;
  }
}
