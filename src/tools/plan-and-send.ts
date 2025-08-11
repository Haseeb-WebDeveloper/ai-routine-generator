import { tool, generateText } from "ai";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { cohere } from "@ai-sdk/cohere";

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
    "Find best-fit products for the user's profile, generate a skincare routine summary, and send it to the user's email all in one step.",
  inputSchema: z
    .object({
      skinType: z.string().optional().describe("User's skin type"),
      skinConcerns: z
        .array(z.string())
        .optional()
        .describe("User's skin concerns"),
      budget: z.string().optional().describe("User's budget"),
      gender: z.string().optional().describe("User's gender"),
      age: z.string().optional().describe("User's age"),
      allergies: z.string().optional().describe("User's allergies"),
      climate: z.string().optional().describe("User's climate"),
      routineComplexity: z
        .string()
        .optional()
        .describe("User's routine complexity"),
      email: z.string().describe("User's email address to send the routine to"),
    })
    .describe(
      "User profile inputs and email; all profile fields are optional and tolerant of free text"
    ),
  execute: async (profile) => {
    try {
      console.log(
        "[TOOL/plan_and_send] === Starting routine planning and email sending ==="
      );
      console.log("[TOOL/plan_and_send] profile:", profile);

      // Defensive normalization for required types
      const skinType = toStringOpt(profile.skinType);
      const budget = toStringOpt(profile.budget);
      const gender = toStringOpt(profile.gender);
      const skinConcerns = toStringArrayOpt(profile.skinConcerns);
      const email = profile.email;

      console.log("[TOOL/plan_and_send] normalized inputs:", {
        skinType,
        skinConcerns,
        gender,
        budget,
        email,
      });

      // Validate required types for skinType and skinConcerns
      if (skinType && typeof skinType !== "string") {
        throw new Error("property skinType must have a type");
      }
      if (skinConcerns && !Array.isArray(skinConcerns)) {
        throw new Error("property skinConcerns must have a type");
      }

      let query = supabase.from("products").select("*");

      if (skinType) query = query.contains("skin_types", [skinType]);
      if (skinConcerns && skinConcerns.length > 0)
        query = query.overlaps("skin_concerns", skinConcerns);
      if (budget) {
        const filters = [budget];
        if (budget === "low") filters.push("medium");
        query = query.in("budget", filters);
      }
      if (gender) query = query.in("gender", [gender, "unisex"]) as any;

      let { data, error } = await query
        .order("popularity_score", { ascending: false })
        .order("rating", { ascending: false })
        .limit(12);
      if (error) throw error;

      // Fallbacks to avoid empty results
      if (!data || data.length === 0) {
        const topOverall = await supabase
          .from("products")
          .select("*")
          .order("popularity_score", { ascending: false })
          .order("rating", { ascending: false })
          .limit(8);
        data = topOverall.data || [];
      }

      const candidates = (data || []).map((p) => ({
        name: p.name,
        brand: p.brand,
        type: p.type,
        price: p.price_usd,
        link: p.purchase_link,
      }));

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

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";

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
    }
  },
});
