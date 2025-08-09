import { tool } from "ai"
import { z } from "zod"

export const buildRoutine = tool({
  description:
    "Build a structured morning/evening skincare routine from selected products and the user's profile. Returns a concise markdown summary.",
  inputSchema: z.object({
    products: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          brand: z.string(),
          type: z.string(),
          category: z.string().optional(),
          price_usd: z.number().optional(),
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
    console.log("[TOOL/build_routine] inputs: products=", products?.length || 0, "profile=", userProfile)
    // Simple heuristic grouping
    const pick = (predicate: (p: any) => boolean) => products.find(predicate)

    const cleanser = pick((p) => /cleanser/i.test(p.type))
    const serum = pick((p) => /serum|treatment/i.test(p.type))
    const moisturizer = pick((p) => /moisturizer/i.test(p.type))
    const sunscreen = pick((p) => /sunscreen/i.test(p.type))
    const nightTreatment = pick((p) => /retinol|treatment|mask/i.test(p.type))

    const morning = [cleanser, serum, moisturizer, sunscreen].filter(Boolean)
    const evening = [cleanser, nightTreatment || serum, moisturizer].filter(Boolean)

    const md = [
      `🌟 **Your Personalized Skincare Routine**`,
      ``,
      `Based on your profile${userProfile.skinType ? ` (${userProfile.skinType} skin)` : ""}${userProfile.budget ? ` and ${userProfile.budget} budget` : ""}.`,
      ``,
      `### 🌅 Morning`,
      ...morning.map((p: any, i) => `${i + 1}. **${p.name}** by ${p.brand} — ${p.type}${p.price_usd ? ` ($${p.price_usd})` : ""}`),
      ``,
      `### 🌙 Evening`,
      ...evening.map((p: any, i) => `${i + 1}. **${p.name}** by ${p.brand} — ${p.type}${p.price_usd ? ` ($${p.price_usd})` : ""}`),
      ``,
      `> Tip: Apply products from thinnest to thickest. Always use sunscreen in the morning.`,
    ].join("\n")

    const result = {
      routine: {
        morning: morning.map((p: any) => p.id),
        evening: evening.map((p: any) => p.id),
      },
      summary: md,
    }
    console.log("[TOOL/build_routine] output:", result.routine)
    return result
  },
})


