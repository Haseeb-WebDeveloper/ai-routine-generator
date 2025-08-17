import { streamText, convertToModelMessages, stepCountIs } from "ai";
// import { cohere } from '@ai-sdk/cohere';
import { google } from '@ai-sdk/google';
import { PROMPT_TEMPLATES } from "./ai-config";
import { agentTools } from "@/tools";
import { create } from 'zustand';

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
        // console.log("Event call", event.toolCalls);
        // console.log("Event Content", event.content);
        // console.log("Event toolResults", event.toolResults);
        // console.log("Event response", event.response);
        
        // Check if there are tool results with products
        // if (event.toolResults && event.toolResults.length > 0) {
        //   for (const toolResult of event.toolResults) {
        //     // Check if this is the plan_and_send_routine tool
        //     if (toolResult.toolName === 'plan_and_send_routine') {
        //       try {
        //         const output = toolResult.output;
        //         if (output && typeof output === 'object' && 'value' in output) {
        //           const value = output.value as any;
                  
        //           // Check if the output has products
        //           if (value && Array.isArray(value.products) && value.products.length > 0) {
        //             console.log("[AI] Found products in tool response:", value.products);
                    
        //             // Store products in the global store
        //             // useProductStore.getState().setProducts(value.products);
        //           }
        //         }
        //       } catch (error) {
        //         console.error("[AI] Error processing tool result:", error);
        //       }
        //     }
        //   }
        // }
      }
    });
    
    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error("\n[AI] === Error in aiAgent ===");
    console.error(error);
    throw error;
  }
}
