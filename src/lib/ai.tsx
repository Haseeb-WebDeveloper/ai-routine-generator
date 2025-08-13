import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { cohere } from '@ai-sdk/cohere';
import { PROMPT_TEMPLATES } from "./ai-config";
import { agentTools } from "@/tools";

type UIPart = { type: "text"; text: string }
type UIMessage = {
  role: "user" | "assistant" | "system";
  parts: UIPart[];
  id?: string;
};

export async function aiAgent(messages: UIMessage[]) {
  try {
    console.log("\n[AI] === Processing New Message ===");
    console.log("[AI] Incoming UI messages:", JSON.stringify(messages, null, 2));

    const modelMessages = convertToModelMessages(
      messages.map((m) => ({
        role: m.role,
        content: (m.parts || []).map((p) => p.text).join(""),
        parts: m.parts,
      }))
    );

    // Create enhanced system prompt for lead conversion
    const systemPrompt = PROMPT_TEMPLATES.SYSTEM_PROMPT.replace(
      "{conversationHistory}",
      ""
    );
    console.log("[AI] systemPrompt:", systemPrompt);

    // Use streamText with enhanced prompting and tool usage
    const result = await streamText({
      model: cohere("command-r-plus"),
      messages: [{ role: "system", content: systemPrompt }, ...modelMessages],
      tools: agentTools,
      stopWhen: stepCountIs(15),
      onFinish: async (event) => {
        console.log("[AI] Stream finished:");
        console.log("[AI] Final text:", event.text);
        console.log("[AI] Usage:", event.usage);
        if (event.toolCalls?.length > 0) {
          console.log("[AI] Tool calls:", JSON.stringify(event.toolCalls, null, 2));
        }
      }
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("\n[AI] === Error in aiAgent ===");
    console.error(error);
    throw error;
  }
}
