import { tool, generateText } from "ai";
import { z } from "zod";
import { cohere } from "@ai-sdk/cohere";

// Type-safe interfaces for the tool
interface ProductCandidate {
  name: string;
  brand: string;
  type: string;
  price: number | null;
  link: string;
}

interface ToolProfile {
  skinType?: string;
  skinConcerns?: string[];
  gender?: string;
  age?: string;
  allergies?: string;
  climate?: string;
  routineComplexity?: string;
  email: string;
}

// Simple normalizers to keep inputs resilient
function toStringOpt(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return undefined;
}

function toStringArrayOpt(value: unknown): string[] | undefined {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[,;\n]|\band\b/gi)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
}

export const planAndSendRoutine = tool({
  description:
    "Find best-fit products for the user's profile, generate a skincare routine routine, and send it to the user's email all in one step. Use this tool only after all 9 questions are answered.",
  inputSchema: z
    .object({
      skinType: z.string().optional().describe("User's skin type. (dry, oily, combination, sensitive, normal, asphyxiated)"),
      skinConcerns: z
        .array(z.string())
        .optional()
        .describe("User's skin concerns in array format like [acne, aging, dark spots, dullness, sensitivity, etc.] for no skin concerns provide empty array []."),
      gender: z.string().optional().describe("User's gender. (male, female)"),
      age: z.string().optional().describe("User's age. (18-25, 26-35, 36-45, 46-55, 56+)"),
      allergies: z.string().optional().describe("User's allergies. (fragrance-free, avoid retinoids, etc.) If no allergies then ignore this field as it is optional."),
      climate: z.string().optional().describe("User's climate. (humid, dry, cold, hot)"),
      routineComplexity: z
        .string()
        .optional()
        .describe("User's routine complexity. (minimal, standard, comprehensive)"),
      email: z.string().describe("User's email address to send the routine to. (example@gmail.com)"),
    })
    .describe(
      "User profile inputs and email. Make sure all provided fields are valid. Never use the word 'null' in any field."
    ),

  execute: async (profile: ToolProfile) => {
    try {
      console.log(
        "[TOOL/plan_and_send] === Starting routine planning and email sending ==="
      );
      console.log("[TOOL/plan_and_send] profile:", profile);

      // Defensive normalization for required types
      const skinType = toStringOpt(profile.skinType);
      const gender = toStringOpt(profile.gender);
      const skinConcerns = toStringArrayOpt(profile.skinConcerns);
      const email = profile.email;

      // Get base URL for API calls
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";

      console.log("[TOOL/plan_and_send] normalized inputs:", {
        skinType,
        skinConcerns,
        gender,
        email,
      });

      // Validate required types for skinType and skinConcerns
      if (skinType && typeof skinType !== "string") {
        throw new Error("property skinType must have a type");
      }
      if (skinConcerns && !Array.isArray(skinConcerns)) {
        throw new Error("property skinConcerns must have a type");
      }

      // Call the product search API instead of using Prisma directly

      const searchResponse = await fetch(
        `${baseUrl}/api/tools/product-search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skinType,
            skinConcerns,
            gender,
          }),
        }
      );

      if (!searchResponse.ok) {
        throw new Error("Failed to search for products");
      }

      const searchResult = await searchResponse.json();

      if (!searchResult.success) {
        throw new Error(searchResult.error || "Product search failed");
      }

      const candidates: ProductCandidate[] = searchResult.products || [];
      console.log(
        `[TOOL/plan_and_send] Found ${candidates.length} products via API`
      );

      const system = `
      You are an expert skincare consultant.
      Create a clear, actionable morning and evening routine using ONLY the provided candidate products by name.
      Be concise and practical. Include 3-5 steps per routine and a short tip section.
      IMPORTANT: At the very end of your response, include the products you mentioned in this EXACT JSON format:
      [PRODUCTS_JSON]
        [
          {
            "productName": "Product Name",
            "price": 29.99,
            "imageUrl": "image_url",
            "brand": "Brand Name",
            "buyLink": "purchase_link"
          }
        ]
      [/PRODUCTS_JSON]
      `;

      const prompt = `User profile (JSON):\n${JSON.stringify(
        profile || {},
        null,
        2
      )}\n\nCandidate products (JSON):\n${JSON.stringify(
        candidates,
        null,
        2
      )}\n\nWrite the routine in markdown now.`;

      const { text } = await generateText({
        model: cohere("command-r-plus"),
        system,
        prompt,
      });
      const summary =
        (text || "").trim() ||
        "Your personalized routine will appear here after we finish collecting your preferences.";

      const response = await fetch(`${baseUrl}/api/send-mail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          summary,
          subject: "Your Personalized Skincare Routine ✨",
        }),
      });

      const result = await response.json();

      console.log("[TOOL/plan_and_send] API response status:", response.status);
      console.log("[TOOL/plan_and_send] API response:", result);

      if (!response.ok) {
        console.error("[TOOL/plan_and_send] API error:", result);
        throw new Error(result.error || "Failed to send email");
      }

      console.log("[TOOL/plan_and_send] === Email sent successfully ===");

      return {
        summary,
        emailSent: true,
        message: `Here is your personalized skincare routine: ${summary} \n\n We also have sent it to your email address: ${email}. Thank you for using our service!`,
      };
    } catch (err) {
      console.error("[TOOL/plan_and_send] error:", err);
      return {
        summary: "",
        emailSent: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    } finally {
      // Cleanup completed
    }
  },
});
