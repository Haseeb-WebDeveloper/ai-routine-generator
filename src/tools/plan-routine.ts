import { tool, generateText } from "ai"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { cohere } from "@ai-sdk/cohere"

// Simple normalizers to keep inputs resilient
function toStringOpt(value: unknown): string | undefined {
  if (value == null) return undefined
  if (typeof value === "string") return value.trim() || undefined
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return undefined
}

function toStringArrayOpt(value: unknown): string[] | undefined {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean)
  if (typeof value === "string") {
    return value
      .split(/[,;\n]|\band\b/gi)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return undefined
}

export const planRoutine = tool({
  description:
    "Find best-fit products for the user's profile and generate a concise markdown skincare routine summary in one step.",
  inputSchema: z
    .object({
      skinType: z.string().optional().describe("User's skin type"),
      skinConcerns: z.array(z.string()).optional().describe("User's skin concerns"),
      budget: z.string().optional().describe("User's budget"),
      gender: z.string().optional().describe("User's gender"),
      age: z.string().optional().describe("User's age"),
      allergies: z.string().optional().describe("User's allergies"),
      climate: z.string().optional().describe("User's climate"),
      routineComplexity: z.string().optional().describe("User's routine complexity"),
    })
    .describe("User profile inputs; all fields are optional and tolerant of free text"),
  execute: async (profile) => {
    try {
      // Defensive normalization for required types
      const skinType = toStringOpt(profile.skinType)
      const budget = toStringOpt(profile.budget)
      const gender = toStringOpt(profile.gender)
      const skinConcerns = toStringArrayOpt(profile.skinConcerns)

      console.log(skinType, skinConcerns, gender,budget)

      // Validate required types for skinType and skinConcerns
      if (skinType && typeof skinType !== "string") {
        throw new Error("property skinType must have a type")
      }
      if (skinConcerns && !Array.isArray(skinConcerns)) {
        throw new Error("property skinConcerns must have a type")
      }

      let query = supabase.from("products").select("*")

      if (skinType) query = query.contains("skin_types", [skinType])
      if (skinConcerns && skinConcerns.length > 0) query = query.overlaps("skin_concerns", skinConcerns)
      if (budget) {
        const filters = [budget]
        if (budget === "low") filters.push("medium")
        query = query.in("budget", filters)
      }
      if (gender) query = query.in("gender", [gender, "unisex"]) as any

      let { data, error } = await query
        .order("popularity_score", { ascending: false })
        .order("rating", { ascending: false })
        .limit(12)
      if (error) throw error

      // Fallbacks to avoid empty results
      if (!data || data.length === 0) {
        const topOverall = await supabase
          .from("products")
          .select("*")
          .order("popularity_score", { ascending: false })
          .order("rating", { ascending: false })
          .limit(8)
        data = topOverall.data || []
      }

      const candidates = (data || []).map((p) => ({
        name: p.name,
        brand: p.brand,
        type: p.type,
        price: p.price_usd,
        link: p.purchase_link,
      }))

      const system = [
        "You are an expert skincare consultant.",
        "Create a clear, actionable morning and evening routine using ONLY the provided candidate products by name.",
        "Be concise and practical. Include 3-5 steps per routine and a short tip section.",
      ].join(" ")

      const prompt = `User profile (JSON):\n${JSON.stringify(profile || {}, null, 2)}\n\nCandidate products (JSON):\n${JSON.stringify(
        candidates,
        null,
        2
      )}\n\nWrite the routine in markdown now.`

      const { text } = await generateText({ model: cohere("command-r-plus"), system, prompt })
      const summary = (text || "").trim() ||
        "Your personalized routine will appear here after we finish collecting your preferences."

      console.log("[TOOL/plan_routine] === Generated summary ===");
      console.log("[TOOL/plan_routine] summary length:", summary.length);
      console.log("[TOOL/plan_routine] summary preview:", summary.substring(0, 200) + "...");
      console.log("[TOOL/plan_routine] summary:", summary);

      console.log("[TOOL/plan_routine] candidates:", candidates.length, "summary length:", summary.length)
      console.log("[TOOL/plan_routine] === Returning summary ===");
      console.log("[TOOL/plan_routine] return value:", { summary });
      return { summary }
    } catch (err) {
      // Check for known error message and return in responseBody format if present
      if (
        err instanceof Error &&
        err.message &&
        err.message.includes("property skinType must have a type")
      ) {
        return {
          responseBody: '{"id":"0dc995cb-62f4-420e-9ad7-3d2b5310d9bb","message":"property skinType must have a type"}',
          isRetryable: false,
          data: { message: "property skinType must have a type" }
        }
      }
      console.error("[TOOL/plan_routine] error:", err)
      return { summary: "" }
    }
  },
})
