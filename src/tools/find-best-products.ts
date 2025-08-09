import { tool } from "ai"
import { z } from "zod"
import { supabase } from "@/lib/supabase"

export const findBestProducts = tool({
  description:
    "Find the best skincare products from the database based on the user's profile (skin type, concerns, budget, gender). Returns up to 10 products.",
  inputSchema: z.object({
    skinType: z.string().optional().describe("User's skin type"),
    skinConcerns: z.array(z.string()).optional().describe("User's skin concerns"),
    budget: z.string().optional().describe("User's budget: low | medium | high"),
    gender: z.string().optional().describe("User's gender or 'unisex'")
  }),
  execute: async ({ skinType, skinConcerns, budget, gender }) => {
    try {
      console.log("[TOOL/find_best_products] inputs:", { skinType, skinConcerns, budget, gender })
      let query = supabase.from("products").select("*")

      // Filter by skin type (array contains)
      if (skinType) {
        query = query.contains("skin_types", [skinType])
      }

      // Filter by concerns (array overlaps)
      if (skinConcerns && skinConcerns.length > 0) {
        query = query.overlaps("skin_concerns", skinConcerns)
      }

      // Budget exact match
      if (budget) {
        query = query.eq("budget", budget)
      }

      // Gender exact match or unisex
      if (gender) {
        query = query.in("gender", [gender, "unisex"]) as any
      }

      // Prefer popular products
      const { data, error } = await query.order("popularity_score", { ascending: false }).limit(10)
      if (error) {
        throw error
      }

      // Return a compact representation to save tokens
      const products = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        type: p.type,
        category: p.category,
        skin_types: p.skin_types,
        skin_concerns: p.skin_concerns,
        texture: p.texture,
        price_usd: p.price_usd,
        purchase_link: p.purchase_link,
        image_url: p.image_url,
      }))

      console.log("[TOOL/find_best_products] result count:", products.length)
      return { products }
    } catch (error) {
      console.error("[TOOL/find_best_products] error:", error)
      return { products: [] }
    }
  }
})


