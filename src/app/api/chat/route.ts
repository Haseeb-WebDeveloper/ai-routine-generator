import { aiAgent } from "@/lib/ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("[API/CHAT] Missing or invalid messages in request", { body });
      return new Response("Messages array is required", { status: 400 });
    }

    const response = await aiAgent(messages);
    return response;
  } catch (error) {
    console.error("[API/CHAT] Error in chat API:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
