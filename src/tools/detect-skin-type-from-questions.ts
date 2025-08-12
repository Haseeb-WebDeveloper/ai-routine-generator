import { tool, generateText } from "ai";
import { z } from "zod";
import { cohere } from "@ai-sdk/cohere";

// Tool for analyzing skin type from user responses to diagnostic questions
export const detectSkinTypeFromQuestions = tool({
    description: "Analyze user responses to skin type diagnostic questions to determine their skin type accurately.",
    inputSchema: z.object({
      userResponses: z.string().describe("Please provide your responses to all five skin type diagnostic questions, including the question number followed by your answer.")
    }),
  
    execute: async (input) => {
      try {
        console.log("[TOOL/detectSkinTypeFromQuestions] === Analyzing skin type from responses ===");
        console.log("[TOOL/detectSkinTypeFromQuestions] input:", input);
  
        // System prompt for skin type analysis
        const system = `
You are an expert dermatologist analyzing skin type assessment responses. Based on the user's answers to 5 diagnostic questions, determine their skin type.

SKIN TYPES TO DETERMINE:
- Oily: Shiny appearance, enlarged pores, prone to blackheads and acne
- Dry: Flaky, rough texture, tight feeling, visible fine lines
- Combination: Oily T-zone (forehead, nose, chin) with dry cheeks
- Normal: Well-balanced, few imperfections, no severe sensitivity
- Sensitive: Easily irritated, redness, burning or stinging sensations

ANALYSIS INSTRUCTIONS:
- Analyze the user's responses carefully
- Determine the most likely skin type
`;

        const prompt = `
User has answered all skin type assessment questions. Here are their responses:
${input.userResponses}

  Please analyze these responses and provide the most likely skin type. You have to respond like this (do not extend it):
  "Based on your responses, I can determine that you have [skin type] skin."
`;

        const { text } = await generateText({
          model: cohere("command-r-plus"),
          system,
          prompt,
        });

        const analysis = text || "";
        console.log("[TOOL/detectSkinTypeFromQuestions] AI analysis:", analysis);
       

        return {
          message: `${analysis} \n\n Now let's move to the next question: what are your main skin concerns? like acne, aging, dark spots, dullness, sensitivity, etc.`,
        };

      } catch (error) {
        console.error("[TOOL/detectSkinTypeFromQuestions] Error:", error);
        return {
          message: "I encountered an error analyzing your skin type. Let me ask you directly: what skin concerns do you experience most often? (oily, dry, sensitive, etc.)",
          skinType: "unknown",
          confidence: 0,
          reasoning: "Error in analysis"
        };
      }
    }
});
  