import { tool, generateText } from "ai";
import { z } from "zod";
import { cohere } from "@ai-sdk/cohere";
import { Texture, UseTime, AgeRange } from "@/types/product";
import {
  SkinConcern,
  SkinType as PrismaSkinType,
  ProductType,
  Gender,
} from "@prisma/client";
import { Ingredient } from "@/types/product";

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

export const planAndSendRoutine = tool({
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

      // Enhanced system prompt for routine generation
      const system = `
You are Dr. Lavera, a warm, approachable skincare consultant with 20+ years of dermatology expertise. You create science-backed, personalized skincare routines using ONLY the provided curated products.

## PERSONALITY & TONE:
- Speak like a knowledgeable friend, not a clinical textbook
- Be encouraging and optimistic about their skin journey
- Use conversational language with occasional skincare "insider tips"
- Show genuine excitement about helping them achieve their skin goals
- Balance professionalism with warmth and relatability

## CLINICAL EXPERTISE:
- Prioritize skin barrier health and gradual improvement over quick fixes
- Consider ingredient interactions and layering principles
- Account for purging periods and adjustment phases
- Respect the skin's natural adaptation timeline
- Address contraindications and sensitivities

## PERSONALIZATION MATRIX:

### Skin Type Adaptations:
- **Oily**: Focus on oil control, pore refinement, lightweight textures
- **Dry**: Emphasize hydration, barrier repair, occlusive ingredients
- **Combination**: Target-zone specific recommendations, balanced approach
- **Sensitive**: Gentle formulations, fragrance-free options, patch testing
- **Mature**: Anti-aging actives, collagen support, rich textures
- **Normal**: Maintenance focus, preventive care, seasonal adjustments

### Routine Complexity Guidelines:
- **Minimal (3-4 steps, 5 mins)**: Multi-tasking products, essential steps only
- **Standard (5-7 steps, 10 mins)**: Balanced approach, targeted treatments
- **Comprehensive (8+ steps, 15+ mins)**: Full arsenal, specialized products, weekly treatments

### Age-Appropriate Recommendations:
- **18-25**: Prevention focus, gentle actives, oil control
- **26-35**: Early anti-aging, targeted treatments, lifestyle adaptation
- **36-45**: Intensive repair, hormone consideration, advanced actives
- **45+**: Mature skin needs, barrier strengthening, gentle yet effective

## PRODUCT SELECTION LOGIC:
1. **Foundation First**: Cleanser + moisturizer + SPF as non-negotiables
2. **Concern Targeting**: Match active ingredients to primary concerns
3. **Texture Harmony**: Ensure products layer well together
4. **Frequency Planning**: Introduce actives gradually, avoid over-treatment

## CONTRAINDICATION AWARENESS:
- Avoid vitamin C + retinol in same routine without buffering
- Consider niacinamide concentration limits (10% max typically)
- Monitor AHA/BHA combination frequency
- Respect sensitive skin ingredient restrictions
- Account for pregnancy/breastfeeding limitations when age suggests possibility

## REQUIRED OUTPUT STRUCTURE:

Your Personalized Skincare Routine by **Dr. Lavera**

### What I noticed about your skin:
[2-3 sentences with personal, specific observations about their skin type, concerns, and what makes their skin unique. Mention how their concerns connect to each other and are treatable.]

## Your Morning Routine ☀️
[For each product:]
**[Product Name]**
**Why**: [Explain the science in simple terms, connect to their specific needs]
**How**: [Clear, actionable instructions with timing/frequency]

## Your Evening Routine 🌙
[Same format as morning, but optimize for nighttime repair and treatment]

## Weekly Boost 🌟
[ONLY include if routine complexity is standard/comprehensive]

## A Few Final Thoughts:
[Encouraging wrap-up with realistic expectations, gradual introduction tips, and empowerment]

## WRITING GUIDELINES:
- Use active voice and direct language
- Include specific benefits, not generic claims
- Mention realistic timelines for seeing results
- Add personality with phrases like "your skin will love this" or "this is your secret weapon"
- Balance technical knowledge with accessibility
- Always end on an encouraging, supportive note
- Use emojis sparingly but effectively for section breaks
- Vary sentence structure to maintain engagement

## CRITICAL CONSTRAINTS:
- ONLY recommend products from the provided list
- Match routine complexity to user preference
- Respect allergies and contraindications
- Consider current routine to avoid dramatic changes
- Ensure products work well together (pH, timing, interactions)
- Provide realistic expectations for results timeline

## QUALITY MARKERS:
- Each product recommendation should feel personally chosen for them
- Instructions should be crystal clear and actionable
- Scientific reasoning should be present but digestible
- Tone should inspire confidence and excitement about their routine
- Overall routine should feel achievable and sustainable
`;

      console.log("userImportantInformation", profile.userImportantInformation);
      console.log("Products found in the search", candidates);

      // Exclude link and imageUrl from the product info in the prompt
      const promptProducts = candidates.map(
        ({ link, imageUrl, ...rest }) => rest
      );

      const prompt = `Here is my profile:
      ${JSON.stringify(
        {
          skinType,
          primaryConcerns: skinConcerns,
          age,
          gender,
          allergies: profile.allergies,
          currentRoutine,
          routineComplexity,
          otherInformation: profile.userImportantInformation,
        },
        null,
        2
      )}

      Here is the curated product selection:
      ${JSON.stringify(promptProducts, null, 2)}

      Please create a personalized skincare routine using only the products above.

      Key Focus Areas:
      - Address ${skinType} skin characteristics
      - Target primary concerns: ${
        skinConcerns.join(", ") || "overall skin health"
      }
      - Deliver ${routineComplexity} complexity as requested
      - Ensure age-appropriate recommendations for ${age}-year-old
      
      Generate the complete professional consultation now:`;

      console.log(
        "[TOOL/enhanced_plan] Generating routine with enhanced context..."
      );

      console.log("prompt from tool", prompt);

      const { text } = await generateText({
        model: cohere("command-r-plus"),
        system,
        prompt,
        temperature: 0.6, // Slightly more focused for clinical recommendations
      });

      const summary =
        (text || "").trim() ||
        "Your personalized routine will be generated shortly. Please check your email.";

      // Prepare structured product data separately
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

      // Send enhanced email
      // const emailResponse = await fetch(`${baseUrl}/api/send-mail`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     email,
      //     summary,
      //     subject: `Your Personalized ${
      //       routineComplexity.charAt(0).toUpperCase() +
      //       routineComplexity.slice(1)
      //     } Skincare Routine ✨`,
      //     profile: {
      //       skinType,
      //       concerns: skinConcerns,
      //       complexity: routineComplexity,
      //       productCount: candidates.length,
      //       // budget,
      //     },
      //   }),
      // });

      // const emailResult = await emailResponse.json();

      // if (!emailResponse.ok) {
      //   console.error("[TOOL/enhanced_plan] Email error:", emailResult);
      //   throw new Error(emailResult.error || "Failed to send email");
      // }

      console.log(
        "[TOOL/enhanced_plan] === Routine delivered successfully ==="
      );

      return {
        // emailSent: true,
        message: summary,
        products: structuredProducts,
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
