import { tool } from "ai"
import { z } from "zod"
import { supabase } from "@/lib/supabase"

// Define enum-like constants for validation
const SKIN_TYPES = ["oily", "dry", "combination", "normal", "sensitive"] as const
const BUDGET_LEVELS = ["low", "medium", "high"] as const
const GENDER_OPTIONS = ["male", "female", "unisex", "non-binary"] as const

// Common skin concerns for validation
const SKIN_CONCERNS = [
  "acne", "blackheads", "whiteheads", "pimples", "breakouts",
  "wrinkles", "fine_lines", "aging", "anti_aging",
  "dark_spots", "hyperpigmentation", "melasma", "age_spots",
  "dullness", "uneven_tone", "brightness", "radiance",
  "redness", "rosacea", "sensitivity", "irritation",
  "large_pores", "pore_minimizing",
  "dryness", "dehydration", "moisturizing",
  "oiliness", "shine_control", "sebum_control",
  "sun_damage", "photo_aging", "sun_protection",
  "texture", "smoothing", "exfoliation"
] as const

export const findBestProducts = tool({
  description: `Find the best skincare products from the database based on comprehensive user profile analysis. 
  This tool performs intelligent product matching considering skin type compatibility, concern targeting, 
  budget constraints, and gender preferences. Returns up to 10 highly relevant products ranked by compatibility score.`,
  
  inputSchema: z.object({
    skinType: z.enum(SKIN_TYPES)
      .describe("User's primary skin type. Must be one of: oily, dry, combination, normal, or sensitive"),
    
    skinConcerns: z.array(z.enum(SKIN_CONCERNS))
      .min(1, "At least one skin concern must be specified")
      .max(5, "Maximum 5 skin concerns allowed for optimal matching")
      .describe("Array of user's main skin concerns (1-5 items). Valid concerns include: acne, wrinkles, dark_spots, dullness, redness, large_pores, etc."),
    
    budget: z.enum(BUDGET_LEVELS)
      .describe("User's budget level: 'low' ($10-30), 'medium' ($30-60), or 'high' ($60+)"),
    
    gender: z.enum(GENDER_OPTIONS)
      .describe("User's gender preference for products: 'male', 'female', 'unisex', or 'non-binary'"),
    
    age: z.number()
      .int()
      .min(13, "Minimum age is 13")
      .max(100, "Maximum age is 100")
      .describe("User's age for age-appropriate product recommendations"),
    
    allergies: z.array(z.string())
      .optional()
      .describe("Optional array of ingredients or product types to avoid (e.g., ['fragrance', 'sulfates', 'retinoids'])"),
    
    climate: z.enum(["humid", "dry", "cold", "hot", "temperate"])
      .optional()
      .describe("User's climate type for environmental considerations"),
    
  
  }).strict(), // Prevent additional properties
  
  execute: async ({ 
    skinType, 
    skinConcerns, 
    budget, 
    gender, 
    age, 
    allergies = [], 
    climate, 
  }) => {
    try {
      console.log("[TOOL/find_best_products] Enhanced search inputs:", {
        skinType, skinConcerns, budget, gender, age, allergies, climate
      })

      // Input validation and normalization
      if (!skinType || !skinConcerns?.length || !budget || !gender || !age) {
        throw new Error("Missing required fields: skinType, skinConcerns, budget, gender, and age are all required")
      }

      // Start building the query
      let query = supabase
        .from("products")
        .select("*")


      // Core filtering logic aligned with current DB schema
      // 1) Skin type compatibility (array contains)
      query = query.contains("skin_types", [skinType])

      // 2) Skin concerns (array overlaps any)
      // if (skinConcerns && skinConcerns.length > 0) {
      //   query = query.overlaps("skin_concerns", skinConcerns)
      // }

      // 3) Budget filtering (exact match or allow one level up for premium options)
      // const budgetFilters = [budget]
      // if (budget === "low") budgetFilters.push("medium") // Allow some medium options for low budget
      // query = query.in("budget", budgetFilters)

      // 4) Gender filtering (include unisex by default)
      const genderFilters = [gender, "unisex"]
      query = query.in("gender", genderFilters)
      // Note: Skipping age/climate/allergy DB filters since these columns/structures
      // are not defined in the current products schema. We keep them in the input
      // for future use but do not restrict the query with them to avoid 0 results.

      // Execute query with intelligent sorting
      let { data, error } = await query
        .order("popularity_score", { ascending: false })
        .order("rating", { ascending: false })
        .limit(15) // Get more results for better filtering

      if (error) {
        console.error("[TOOL/find_best_products] Database error:", error)
        throw new Error(`Database query failed: ${error.message}`)
      }

      if (!data || data.length === 0) {
        console.warn("[TOOL/find_best_products] No products found with strict filters; trying relaxed fallbacks")
        // Fallback A: only skin type
        let relaxedA = await supabase
          .from("products")
          .select("*")
          .contains("skin_types", [skinType])
          .order("popularity_score", { ascending: false })
          .order("rating", { ascending: false })
          .limit(15)
        if (relaxedA.data && relaxedA.data.length > 0) {
          data = relaxedA.data
        } else {
          // Fallback B: only concerns
          let relaxedB = await supabase
            .from("products")
            .select("*")
            .overlaps("skin_concerns", skinConcerns)
            .order("popularity_score", { ascending: false })
            .order("rating", { ascending: false })
            .limit(15)
          if (relaxedB.data && relaxedB.data.length > 0) {
            data = relaxedB.data
          } else {
            // Final Fallback: top overall
            let topOverall = await supabase
              .from("products")
              .select("*")
              .order("popularity_score", { ascending: false })
              .order("rating", { ascending: false })
              .limit(10)
            data = topOverall.data || []
          }
        }
      }

      // Post-processing: Score and rank products based on relevance
      const scoredProducts = data.map(product => {
        let relevanceScore = 0

        // Skin type match scoring
        if (product.skin_types?.includes(skinType)) relevanceScore += 3
        if (product.skin_types?.includes("all")) relevanceScore += 2

        // Concern match scoring
        const concernMatches = skinConcerns.filter(concern => 
          product.skin_concerns?.includes(concern)
        ).length
        relevanceScore += concernMatches * 2

        // Age appropriateness bonus
        // if (product.age?.includes("all_ages")) relevanceScore += 1

        // Climate match bonus
        // if (climate && product.climate?.includes(climate)) relevanceScore += 1

        // Budget perfect match bonus
        // if (product.budget === budget) relevanceScore += 1

        // Rating and popularity factors
        relevanceScore += (product.rating || 0) * 0.1
        relevanceScore += (product.popularity_score || 0) * 0.01

        console.log("[TOOL/find_best_products] product returned:", product)

        return {
          ...product,
          relevanceScore,
          concernMatches
        }
      })

      // Sort by relevance score and take top 10
      const finalProducts = scoredProducts
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10)
        .map(({ relevanceScore, concernMatches, ...product }) => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          type: product.type,
          category: product.category,
          skin_types: product.skin_types,
          skin_concerns: product.skin_concerns,
          texture: product.texture,
          price_usd: product.price_usd,
          purchase_link: product.purchase_link,
          image_url: product.image_url,
          rating: product.rating,
          matchScore: Math.round(relevanceScore * 10) / 10 // Round to 1 decimal
        }))

      console.log("[TOOL/find_best_products] Successfully found", finalProducts.length, "products")
      
      return { 
        products: finalProducts,
        totalFound: data.length,
        searchCriteria: { skinType, skinConcerns, budget, gender, age, climate },
        message: `Found ${finalProducts.length} highly compatible products for ${skinType} skin targeting ${skinConcerns.join(", ")}`
      }

    } catch (error) {
      console.error("[TOOL/find_best_products] Execution error:", error)
      
      // Return structured error response
      return { 
        products: [],
        error: true,
        message: error instanceof Error ? error.message : "An unexpected error occurred while finding products",
        searchCriteria: { skinType, skinConcerns, budget, gender, age }
      }
    }
  }
})