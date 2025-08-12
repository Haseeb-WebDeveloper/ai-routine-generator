import { tool, generateText } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

// Tool for analyzing skin type from image
export const analyzeSkinTypeFromImage = tool({
  description:
    "Analyze an uploaded image to determine skin type based on visual characteristics. Takes an image URL and returns skin type assessment.",
  inputSchema: z.object({
    imageUrl: z
      .string()
      .describe("URL of the uploaded skin image for analysis"),
  }),

  execute: async (input) => {
    try {
      console.log(
        "[TOOL/analyzeSkinTypeFromImage] === Starting image analysis ==="
      );
      console.log("[TOOL/analyzeSkinTypeFromImage] input:", input);

      if (!input.imageUrl) {
        throw new Error("Image URL is required for analysis");
      }

      // Try to fetch the image, but handle 404 and other errors gracefully
      let imageResponse: Response | null = null;
      try {
        imageResponse = await fetch(input.imageUrl);
      } catch (fetchErr) {
        throw new Error(
          `Failed to fetch image: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`
        );
      }

      if (!imageResponse || !imageResponse.ok) {
        // Provide a more user-friendly error message for 404
        if (imageResponse && imageResponse.status === 404) {
          throw new Error(
            "The image could not be found at the provided URL (404 Not Found). Please check the link and try again."
          );
        }
        throw new Error(
          `Failed to fetch image: ${
            imageResponse ? imageResponse.statusText : "Unknown error"
          }`
        );
      }

      const system = `
You are an expert dermatologist analyzing skin images for skin type assessment.
Analyze the provided skin image and determine the skin type based on visual characteristics.

Look for these visual indicators:
- Oily: Shiny appearance, visible enlarged pores, potential blackheads, overall greasy look
- Dry: Flaky patches, rough texture, fine lines, dull appearance, tight-looking skin
- Combination: Mixed areas - oily T-zone with dry cheeks, different textures in different areas
- Normal: Even texture, few imperfections, balanced appearance, healthy glow
- Sensitive: Redness, irritation, visible capillaries, inflamed areas, uneven tone

IMPORTANT: Provide detailed visual observations and be specific about what you see in the image that leads to your conclusion.

Provide your analysis in this format:
1. Most likely skin type
2. Confidence level (0-100%)
3. Detailed visual observations that led to conclusion
`;

      const prompt = `
Please analyze this skin image for skin type assessment based on the visual characteristics you can observe in the image.
`;

      // Convert image to base64
      let imageBuffer: ArrayBuffer;
      try {
        imageBuffer = await imageResponse.arrayBuffer();
      } catch (bufferErr) {
        throw new Error(
          "Failed to read the image data. The image may be corrupted or inaccessible."
        );
      }
      const imageBase64 = Buffer.from(imageBuffer).toString("base64");

      // Determine the image type from the URL or response headers
      const contentType =
        imageResponse.headers.get("content-type") || "image/jpeg";
      const imageDataUrl = `data:${contentType};base64,${imageBase64}`;

      const result = await generateText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: "system",
            content: system,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image",
                image: imageDataUrl,
              },
            ],
          },
        ],
      });

      const analysis = result.text || "";
      console.log("analysis", analysis);

      // Parse the analysis to extract structured information
      let skinType = "combination";
      let confidence = 75;
      let reasoning = "Based on visual analysis of the provided skin image";

      // Enhanced parsing for image analysis
      if (
        analysis.toLowerCase().includes("oily") &&
        !analysis.toLowerCase().includes("combination")
      ) {
        skinType = "oily";
        confidence = 80;
        reasoning = "Image analysis shows predominantly oily characteristics";
      } else if (analysis.toLowerCase().includes("dry")) {
        skinType = "dry";
        confidence = 80;
        reasoning = "Image analysis reveals dry skin characteristics";
      } else if (analysis.toLowerCase().includes("sensitive")) {
        skinType = "sensitive";
        confidence = 75;
        reasoning = "Image shows signs of skin sensitivity and potential irritation";
      } else if (analysis.toLowerCase().includes("normal")) {
        skinType = "normal";
        confidence = 70;
        reasoning = "Image analysis indicates balanced, healthy skin";
      } else if (analysis.toLowerCase().includes("combination")) {
        skinType = "combination";
        confidence = 78;
        reasoning = "Image shows mixed skin characteristics in different areas";
      }

      return {
        message: `Based on my analysis of your skin image, I can see that you have ${skinType} skin with ${confidence}% confidence. ${reasoning}. Now let's continue with your skincare assessment - What are your main skin concerns? (acne, aging, dark spots, dullness, sensitivity, etc.)`,
      };
    } catch (err) {
      console.error("[TOOL/analyzeSkinTypeFromImage] error:", err);
      let errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      // Provide a more user-friendly message for image fetch errors
      if (
        typeof errorMessage === "string" &&
        errorMessage.includes("Failed to fetch image")
      ) {
        errorMessage +=
          " (Please ensure the image URL is correct, publicly accessible, and the image exists.)";
      }
      return {
        error: errorMessage,
        analysis: "Unable to analyze image due to an error",
      };
    }
  },
});