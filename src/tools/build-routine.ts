import { tool, generateText } from "ai"
import { z } from "zod"
import { cohere } from "@ai-sdk/cohere"

export const buildRoutine = tool({
  description:
    "Build a structured morning/evening skincare routine from selected products using an LLM. Returns a concise markdown summary.",
  inputSchema: z.object({
    products: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          brand: z.string(),
          type: z.string(),
          category: z.string().optional(),
          // Supabase DECIMAL may arrive as string; accept both
          price_usd: z.union([z.number(), z.string()]).optional(),
          purchase_link: z.string().optional(),
        })
      )
      .describe("Candidate products already filtered for the user"),
    userProfile: z
      .object({
        skinType: z.string().optional(),
        skinConcerns: z.array(z.string()).optional(),
        budget: z.string().optional(),
        gender: z.string().optional(),
      })
      .describe("User profile that influenced product selection"),
  }),
  execute: async ({ products, userProfile }) => {
    try {
      console.log("[TOOL/build_routine] inputs: products=", products?.length || 0, "profile=", userProfile)

      const productsForLLM = (products || []).slice(0, 12).map((p) => ({
        name: p.name,
        brand: p.brand,
        type: p.type,
        price: p.price_usd,
        link: p.purchase_link,
      }))

      const system = [
        "You are an expert skincare consultant.",
        "Create a clear, actionable skincare routine using ONLY the provided candidate products.",
        "Output concise markdown with sections: Morning and Evening, followed by brief tips.",
      ].join(" ")

      const prompt = `User profile (JSON):\n${JSON.stringify(userProfile || {}, null, 2)}\n\nCandidate products (JSON):\n${JSON.stringify(productsForLLM, null, 2)}\n\nWrite the routine now.`

      const { text } = await generateText({
        model: cohere("command-r-plus"),
        system,
        prompt,
      })

      console.log("[TOOL/build_routine] text:", text)

      const summary = (text || "").trim() || "Your personalized routine will appear here once enough information is collected."
      console.log("[TOOL/build_routine] summary length:", summary.length)
      return { routine: { morning: [], evening: [] }, summary }
    } catch (err) {
      console.error("[TOOL/build_routine] error:", err)
      return { routine: { morning: [], evening: [] }, summary: "" }
    }
  },
})


