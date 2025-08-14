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
  score?: number;
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
    "Find best-fit products for the user's profile, generate a personalized skincare routine, and send it to the user's email all in one step. Use this tool only after all 9 questions are answered.",
  inputSchema: z
    .object({
      skinType: z
        .string()
        .optional()
        .describe(
          "User's skin type (oily, dry, combination, sensitive, normal, etc.)"
        ),
      skinConcerns: z
        .array(z.string())
        .optional()
        .describe(
          "User's skin concerns array like [acne, aging, dark spots, dullness, sensitivity]. Use empty array [] if no concerns."
        ),
      gender: z
        .string()
        .optional()
        .describe("User's gender (male, female, nonbinary)"),
      age: z
        .string()
        .optional()
        .describe("User's age as string (e.g., '25', '34')"),
      allergies: z
        .string()
        .optional()
        .describe("User's allergies or ingredients to avoid. Optional field."),
      climate: z
        .string()
        .optional()
        .describe("User's climate (hot, cold, moderate, humid, dry)"),
      routineComplexity: z
        .string()
        .optional()
        .describe(
          "User's desired routine complexity (minimal, standard, comprehensive). Make sure lowercase."
        ),
      email: z
        .string()
        .describe("User's email address for sending the routine"),
    })
    .describe(
      "Complete user profile for personalized skincare routine generation"
    ),

  execute: async (profile: ToolProfile) => {
    try {
      console.log(
        "[TOOL/enhanced_plan] === Starting enhanced routine planning ==="
      );
      console.log(
        "[TOOL/enhanced_plan] Input profile:",
        JSON.stringify(profile, null, 2)
      );

      // Normalize inputs
      const skinType = toStringOpt(profile.skinType);
      const gender = toStringOpt(profile.gender);
      const skinConcerns = toStringArrayOpt(profile.skinConcerns) || [];
      const age = toStringOpt(profile.age);
      const climate = toStringOpt(profile.climate);
      const routineComplexity =
        toStringOpt(profile.routineComplexity) || "standard";
      const email = profile.email;

      // Infer budget if not explicitly provided
      const inferredBudget = inferBudgetFromProfile(profile);

      // Validate required fields
      if (!email || !skinType) {
        throw new Error("Email and skin type are required fields");
      }

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
        budget: inferredBudget,
        routineComplexity,
        climate,
      };

      console.log(
        "[TOOL/enhanced_plan] Search payload:",
        JSON.stringify(searchPayload, null, 2)
      );

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
      console.log(
        `[TOOL/enhanced_plan] Found ${candidates.length} personalized products`
      );

      if (candidates.length === 0) {
        throw new Error(
          "No suitable products found for your profile. Please try adjusting your preferences."
        );
      }

      // Enhanced system prompt for routine generation
      const system = `
        You are Dr. Lavera, a warm, encouraging skincare consultant with 20+ years of dermatology expertise. Create a science-backed, personalized skincare routine using ONLY the provided curated products.

        ## CLINICAL APPROACH:
        - Prioritize skin barrier health and gradual improvement
        - Layer products from thinnest to thickest consistency  
        - Consider ingredient interactions and pH requirements
        - Account for climate impact on product selection
        - Respect routine complexity preference and time constraints
        - Address primary concerns with evidence-based actives

        ## PERSONALIZATION FACTORS:
        - Skin Type: ${skinType} (adjust product weights and frequencies)
        - Primary Concerns: ${skinConcerns.join(", ") || "general skin health"}
        - Age: ${age} (age-appropriate active concentrations)
        - Climate: ${climate} (texture and occlusive adjustments)
        - Routine Preference: ${routineComplexity} complexity
        - Budget Consideration: Balanced value and efficacy

        ## REQUIRED OUTPUT FORMAT:
        # Your Personalized Skincare Routine by Dr. Lavera

        ## Morning Routine ☀️
        1. **[Product Name]** by [Brand] 
           *Why this works*: [Scientific rationale for your skin type/concerns]
           *How to use*: [Specific application technique and amount]
           *Pro insight*: [Clinical tip or what to expect]

        2. **[Next Product]**...
        [Continue for all AM products]

        ## Evening Routine 🌙
        [Same detailed format for PM products]


        ## Advanced Tips
        - [1-2 professional tips for maximizing routine effectiveness]

        CRITICAL: End with EXACT JSON format for e-commerce integration:
        [PRODUCTS_JSON]
        [{"productName": "Exact Product Name", "price": 29.99, "imageUrl": "url", "brand": "Brand Name", "buyLink": "purchase_link"}]
        [/PRODUCTS_JSON]

        Make this feel like a premium dermatology consultation worth hundreds of dollars. Be specific, scientific, yet warm and encouraging.
      `;

      const prompt = `CLINICAL CONSULTATION REQUEST:

      PATIENT PROFILE:
      ${JSON.stringify(
        {
          skinType,
          primaryConcerns: skinConcerns,
          age,
          gender,
          climate,
          routineComplexity,
          allergies: profile.allergies,
          budget: inferredBudget,
        },
        null,
        2
      )}

      CURATED PRODUCT SELECTION:
      ${JSON.stringify(candidates, null, 2)}

      CONSULTATION OBJECTIVE: 
      Create a comprehensive, personalized skincare routine using ONLY the curated products above. This should feel like a premium dermatological consultation where every product choice is scientifically justified and tailored to the patient's unique profile.

      Key Focus Areas:
      - Address ${skinType} skin characteristics
      - Target primary concerns: ${
        skinConcerns.join(", ") || "overall skin health"
      }
      - Optimize for ${climate} climate conditions
      - Deliver ${routineComplexity} complexity as requested
      - Ensure age-appropriate recommendations for ${age}-year-old
      
      Generate the complete professional consultation now:`;

      console.log(
        "[TOOL/enhanced_plan] Generating routine with enhanced context..."
      );

      const { text } = await generateText({
        model: cohere("command-r-plus"),
        system,
        prompt,
        temperature: 0.6, // Slightly more focused for clinical recommendations
      });

      const summary =
        (text || "").trim() ||
        "Your personalized routine will be generated shortly. Please check your email.";

      console.log(
        "[TOOL/enhanced_plan] Generated routine length:",
        summary.length
      );

      // Send enhanced email
      const emailResponse = await fetch(`${baseUrl}/api/send-mail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          summary,
          subject: `Your Personalized ${
            routineComplexity.charAt(0).toUpperCase() +
            routineComplexity.slice(1)
          } Skincare Routine ✨`,
          profile: {
            skinType,
            concerns: skinConcerns,
            complexity: routineComplexity,
            productCount: candidates.length,
          },
        }),
      });

      const emailResult = await emailResponse.json();

      if (!emailResponse.ok) {
        console.error("[TOOL/enhanced_plan] Email error:", emailResult);
        throw new Error(emailResult.error || "Failed to send email");
      }

      console.log(
        "[TOOL/enhanced_plan] === Routine delivered successfully ==="
      );

      return {
        summary,
        emailSent: true,
        productCount: candidates.length,
        routineComplexity,
        message: `Perfect! I've created your personalized ${routineComplexity} skincare routine with ${
          candidates.length
        } carefully selected products. 

Here's your complete routine:

${summary}

📧 **I've also sent this routine to ${email}** - check your inbox (and spam folder) for the detailed guide with purchase links and professional tips.

Your routine is tailored specifically for ${skinType} skin with focus on ${
          skinConcerns.join(", ") || "overall skin health"
        }. Each product was selected based on your climate, age, and preferences.

Thank you for trusting me with your skincare journey! 🌟`,
      };
    } catch (err) {
      console.error("[TOOL/enhanced_plan] Error:", err);
      return {
        summary: "",
        emailSent: false,
        error: err instanceof Error ? err.message : "Unknown error occurred",
        message: `I apologize, but there was an issue creating your routine: ${
          err instanceof Error ? err.message : "Unknown error"
        }. Please try again or contact support if the problem persists.`,
      };
    }
  },
});
