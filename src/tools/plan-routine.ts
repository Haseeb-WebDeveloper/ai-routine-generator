import { tool, generateObject } from "ai";
import { z } from "zod";
import { cohere } from "@ai-sdk/cohere";
import { PROMPT_TEMPLATES } from "@/lib/ai-config";
import { Texture, UseTime, AgeRange } from "@/types/product";
import {
  SkinConcern,
  SkinType as PrismaSkinType,
  ProductType,
  Gender,
} from "@prisma/client";
import { Ingredient } from "@/types/product";
import { google } from "@ai-sdk/google";

// Type-safe interfaces for the tool
interface ProductCandidate {
  name: string;
  brand: string;
  type: ProductType;
  gender: Gender;
  age: AgeRange;
  skinTypes?: PrismaSkinType[];
  skinConcerns?: SkinConcern[];
  ingredients?: Ingredient[];
  texture?: Texture;
  price: number | null;
  link: string;
  score?: number;
  imageUrl?: string;
  instructions?: string;
  useTime?: UseTime[];
}

interface ToolProfile {
  skinType?: string;
  skinConcerns?: string[];
  gender?: string;
  age?: string;
  allergies?: string;
  // climate?: string;
  routineComplexity?: string;
  budget?: string;
  currentRoutine?: string;
  userImportantInformation?: string;
}

// Enhanced normalizers
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

// Budget inference from user profile
function inferBudgetFromProfile(profile: ToolProfile): string {
  const age = parseInt(profile.age || "25");
  const complexity = profile.routineComplexity?.toLowerCase();

  // Students/young adults typically have tighter budgets
  if (age < 22) return "budgetFriendly";

  // Comprehensive routine users are usually willing to invest more
  if (complexity === "comprehensive") return "Premium";

  // Professional age with standard routine
  if (age >= 25 && age <= 45 && complexity === "standard") return "midRange";

  // Default to mid-range for balanced approach
  return "midRange";
}

export const planRoutine = tool({
  description:
    "Find best-fit products for the user's profile, generate a personalized skincare routine, and send it to the user's email all in one step. Use this tool only after all 8 questions are answered.",
  inputSchema: z
    .object({
      skinType: z
        .enum([...(Object.values(PrismaSkinType) as [string, ...string[]])])
        .optional()
        .describe(
          "User's skin type (choose only one from: oily, dry, combination, normal, sensitive, mature)"
        ),
      skinConcerns: z
        .array(
          z.enum([...(Object.values(SkinConcern) as [string, ...string[]])])
        )
        .optional()
        .describe(
          "User's skin concerns array like [ACNE, BLACKHEADS, DARK_CIRCLES, DULLNESS, FINE_LINES]. Use empty array [] if no concerns."
        ),
      gender: z
        .enum([...(Object.values(Gender) as [string, ...string[]])])
        .optional()
        .describe("User's gender (male, female, unisex)"),
      age: z
        .string()
        .optional()
        .describe("User's age as a string (e.g., '25', '48'). For age ranges (e.g'18-25'), use the middle value like '21'"),
      allergies: z
        .string()
        .optional()
        .describe("User's allergies or ingredients to avoid. Optional field."),
      // climate: z
      //   .string()
      //   .optional()
      //   .describe("User's climate (hot, cold, moderate)"),
      routineComplexity: z
        .string()
        .optional()
        .describe(
          "User's desired routine complexity (minimal, standard, comprehensive). Make sure lowercase."
        ),
      // budget: z
      //   .string()
      //   .optional()
      //   .describe(
      //     "User's skincare budget range (budgetFriendly, midRange, Premium)"
      //   ),
      currentRoutine: z
        .string()
        .optional()
        .describe("User's current skincare routine"),
      // email: z
      //   .string()
      //   .describe("User's email address for sending the routine"),
      userImportantInformation: z
        .string()
        .optional()
        .describe(
          "Summarize the most important details you know about the user in 2-3 simple sentences. Focus on facts that help us choose the best skincare routine for them (like their main concerns, allergies, preferences, or goals etc). Make it clear and easy to understand, as if you are explaining the user's needs to another skincare expert."
        ),
    })
    .describe(
      "Complete user profile for personalized skincare routine generation"
    ),

  execute: async (profile: ToolProfile) => {
    try {
      // Normalize inputs
      const skinType = toStringOpt(profile.skinType);
      const gender = toStringOpt(profile.gender);
      const skinConcerns = toStringArrayOpt(profile.skinConcerns) || [];
      const age = toStringOpt(profile.age);
      const routineComplexity =
      toStringOpt(profile.routineComplexity) || "standard";
      const currentRoutine = toStringOpt(profile.currentRoutine);
      
      // const climate = toStringOpt(profile.climate);
      // const email = profile.email;
      // Fix: always use explicit budget if provided, otherwise infer
      // const budget =
      //   toStringOpt(profile.budget) || inferBudgetFromProfile(profile);
      // Validate required fields
      // if (!email || !skinType) {
      //   throw new Error("Email and skin type are required fields");
      // }

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";

      // Enhanced search payload
      const searchPayload = {
        skinType,
        skinConcerns,
        gender,
        age,
        // budget,
        routineComplexity,
        // climate,
      };

      // Call enhanced product search API
      const searchResponse = await fetch(
        `${baseUrl}/api/tools/product-search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchPayload),
        }
      );

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json().catch(() => ({}));
        throw new Error(
          `Product search failed: ${errorData.error || "Unknown error"}`
        );
      }

      const searchResult = await searchResponse.json();

      if (!searchResult.success) {
        throw new Error(searchResult.error || "Product search failed");
      }

      const candidates: ProductCandidate[] = searchResult.products || [];

      if (candidates.length === 0) {
        throw new Error(
          "No suitable products found for your profile. Please try adjusting your preferences."
        );
      }

      // Use system prompt from ai-config.ts
      const system = PROMPT_TEMPLATES.ROUTINE_GENERATION_PROMPT;

      console.log("userImportantInformation", profile.userImportantInformation);
      console.log("Products found in the search", candidates);

      // Define Zod schema for structured routine (remove .url() as Cohere doesn't support format constraints)
      const routineSchema = z.object({
        routines: z.array(
          z.object({
            title: z.string().describe("Routine title like 'Morning Routine', 'Evening Routine', or 'Weekly Boost'"),
            steps: z.array(
              z.object({
                id: z.number().describe("Sequential step number starting from 1 for each routine"),
                productName: z.string().describe("Exact product name from candidates list"),
                productImage: z.string().describe("Product image URL from candidates"),
                productLink: z.string().describe("Product buy link from candidates"),
                productPrice: z.number().describe("Product price from candidates"),
                why: z.string().describe("Simple 1-2 sentence explanation why this product is good for their specific skin needs"),
                how: z.string().describe("Short Clear, actionable instructions on how to use this product with timing/frequency")
              })
            )
          })
        ),
        summary: z.string().describe("Brief encouraging summary of the routine for display")
      });

      console.log(
        "[TOOL/enhanced_plan] Generating structured routine with single LLM call..."
      );

      const enhancedPrompt = `Create a personalized skincare routine for this profile:
        PROFILE:
        ${JSON.stringify({
          skinType,
          primaryConcerns: skinConcerns,
          age,
          gender,
          allergies: profile.allergies,
          currentRoutine,
          routineComplexity,
          otherInformation: profile.userImportantInformation,
        }, null, 2)}

        AVAILABLE PRODUCTS (use EXACT names):
        ${JSON.stringify(candidates.map(p => ({
          name: p.name,
          imageUrl: p.imageUrl,
          link: p.link,
          price: p.price,
          type: p.type,
          useTime: p.useTime
        })), null, 2)}

        REQUIREMENTS:
        - Address ${skinType} skin characteristics  
        - Target primary concerns: ${skinConcerns.join(", ") || "overall skin health"}
        - Deliver ${routineComplexity} complexity routine
        - Age-appropriate for ${age}-year-old
        - Use ONLY products from the list above
        - Match product names EXACTLY
        - Create Morning and Evening routines
        - Only add Weekly Boost if complexity is standard/comprehensive
        - For each step: sequential ID, exact product name, why it helps their skin, how to use it
        - Include encouraging summary`;

      const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: routineSchema,
        system,
        prompt: enhancedPrompt,
        temperature: 0.6,
      });

      const structuredRoutine = object.routines || [];
      const summary = object.summary || "Your personalized routine has been created!";

      // Prepare structured product data separately (keep for backward compatibility)
      const structuredProducts = candidates.map((product) => ({
        productName: product.name,
        brand: product.brand,
        price: product.price,
        imageUrl: product.imageUrl,
        buyLink: product.link,
        type: product.type,
        description: `Perfect for ${skinType} skin with ${
          skinConcerns.join(", ") || "general care"
        } concerns`,
      }));


      console.log(
        "[TOOL/enhanced_plan] === Routine delivered successfully ===", structuredRoutine, summary
      );

      return {
        // emailSent: true,
        message: summary,
        products: structuredProducts,
        structuredRoutine: structuredRoutine,
        routineSummary: summary,
      };
    } catch (err) {
      console.error("[TOOL/enhanced_plan] Error:", err);
      return {
        summary: "",
        // emailSent: false,
        error: err instanceof Error ? err.message : "Unknown error occurred",
        message: `I apologize, but there was an issue creating your routine: ${
          err instanceof Error ? err.message : "Unknown error"
        }. Please try again or contact support if the problem persists.`,
      };
    }
  },
});
