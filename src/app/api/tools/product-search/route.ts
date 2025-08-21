import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  mapToPrismaSkinTypes,
  mapToPrismaSkinConcerns,
  // mapToPrismaBudgetRange, // Budget code commented out
  mapToPrismaGender,
  mapToPrismaProductType,
  PrismaGender
} from '@/types/prisma-enums'
import { ProductType } from '@/types/product'


interface ProductSelectionProfile {
  skinType?: string;
  skinConcerns?: string[];
  budget?: string;
  gender?: string;
  age?: string;
  routineComplexity?: 'minimal' | 'standard' | 'comprehensive';
  climate?: string;
}

// Enhanced routine requirements with scoring weights
const ROUTINE_REQUIREMENTS = {
  minimal: {
    required: ['cleanser', 'moisturizer', 'sunscreen'] as ProductType[],
    optional: ['serum'] as ProductType[],
    maxProducts: 4,
    weights: { skinTypeMatch: 20, concernMatch: 15, /* budgetFit: 8, */ rating: 12 }
  },
  standard: {
    required: ['cleanser', 'moisturizer', 'sunscreen'] as ProductType[],
    preferred: ['toner', 'serum', 'eyeCream'] as ProductType[],
    optional: ['essence', 'spotTreatment'] as ProductType[],
    maxProducts: 7,
    weights: { skinTypeMatch: 15, concernMatch: 12, /* budgetFit: 6, */ rating: 10 }
  },
  comprehensive: {
    required: ['cleanser', 'moisturizer', 'sunscreen'] as ProductType[],
    preferred: ['toner', 'serum', 'eyeCream', 'essence'] as ProductType[],
    optional: ['spotTreatment', 'faceOil', 'sleepingMask', 'exfoliant', 'faceMask'] as ProductType[],
    maxProducts: 12,
    weights: { skinTypeMatch: 12, concernMatch: 10, /* budgetFit: 5, */ rating: 8 }
  }
} as const

// Enhanced concern priority mapping with weights
const CONCERN_PRIORITY_MAP = {
  acne: { types: ['spotTreatment', 'serum', 'cleanser', 'toner'], weight: 1.5 },
  blackheads: { types: ['exfoliant', 'cleanser', 'toner', 'poreMinimizer'], weight: 1.3 },
  hyperpigmentation: { types: ['serum', 'vitaminC', 'brightening', 'sunscreen'], weight: 1.4 },
  fine_lines: { types: ['serum', 'retinoid', 'eyeCream', 'antiAging'], weight: 1.2 },
  wrinkles: { types: ['retinoid', 'peptide', 'antiAging', 'eyeCream'], weight: 1.4 },
  dullness: { types: ['exfoliant', 'vitaminC', 'brightening', 'essence'], weight: 1.1 },
  dehydration: { types: ['hydrator', 'essence', 'hydratingMask', 'serum'], weight: 1.3 },
  dryness: { types: ['moisturizer', 'faceOil', 'barrierCream', 'hydratingMask'], weight: 1.4 },
  redness: { types: ['soothingCream', 'cicaCream', 'antiRedness', 'barrierCream'], weight: 1.3 },
  sensitivity: { types: ['barrierCream', 'soothingCream', 'cicaCream'], weight: 1.5 },
  pores: { types: ['poreMinimizer', 'niacinamide', 'exfoliant', 'toner'], weight: 1.2 },
  oiliness: { types: ['sebumControl', 'niacinamide', 'toner', 'cleanser'], weight: 1.3 },
  chapped_lips: { types: ['lipBalm', 'lipCare', 'exfoliant'], weight: 1.1 },
  loss_of_firmness: { types: ['retinoid', 'peptide', 'antiAging', 'eyeCream'], weight: 1.4 }
}

interface ScoringWeights {
  skinTypeMatch: number
  concernMatch: number
  // budgetFit: number // Budget code commented out
  rating: number
  reviewCount: number
  brandTrust: number
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const profile: ProductSelectionProfile = body

    console.log('[API] Received validated profile:', profile)

    // Determine routine complexity with fallback
    const complexity = (profile.routineComplexity || 'standard').toLowerCase() as keyof typeof ROUTINE_REQUIREMENTS
    const routineReq = ROUTINE_REQUIREMENTS[complexity] || ROUTINE_REQUIREMENTS.standard

    console.log(`[API] Using ${complexity} routine complexity`)

    // OPTIMIZED: Single comprehensive search instead of multiple sequential calls
    const searchResults = await performOptimizedProductSearch(profile, routineReq)
    
    if (!searchResults.success) {
      // Fallback search with relaxed criteria
      console.log('[API] Primary search failed, attempting fallback')
      const fallbackResults = await performFallbackSearch(profile, routineReq)
      
      if (!fallbackResults.success) {
        throw new Error('All search strategies failed')
      }
      
      return NextResponse.json({
        success: true,
        products: fallbackResults.products || [],
        count: fallbackResults.products?.length || 0,
        routineComplexity: complexity,
        searchLatency: Date.now() - startTime,
        note: 'Used fallback search due to limited matches'
      })
    }

    const searchLatency = Date.now() - startTime
    console.log(`[API] Search completed in ${searchLatency}ms with ${searchResults.products?.length || 0} products`)

    return NextResponse.json({
      success: true,
      products: searchResults.products || [],
      count: searchResults.products?.length || 0,
      routineComplexity: complexity,
      searchLatency
    })

  } catch (error) {
    console.error('[API] Product search error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      searchLatency: Date.now() - startTime
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

async function performOptimizedProductSearch(
  profile: ProductSelectionProfile, 
  routineReq: typeof ROUTINE_REQUIREMENTS[keyof typeof ROUTINE_REQUIREMENTS]
) {
  try {
    const baseWhere = buildBaseWhereClause(profile)
    
    // OPTIMIZATION 1: Batch fetch all products in fewer queries
    const [requiredProducts, concernProducts, additionalProducts] = await Promise.all([
      // Get required products (cleanser, moisturizer, sunscreen)
      fetchRequiredProductsBatch(profile, routineReq.required, baseWhere),
      
      // Get concern-specific products
      fetchConcernProductsBatch(profile, baseWhere),
      
      // Get additional products for preferred/optional categories
      fetchAdditionalProductsBatch(profile, routineReq, baseWhere)
    ])

    // OPTIMIZATION 2: Advanced deduplication and scoring
    const allProducts = [...requiredProducts, ...concernProducts, ...additionalProducts]
    const uniqueProducts = deduplicateProductsAdvanced(allProducts)
    const scoredProducts = scoreProductsAdvanced(uniqueProducts, profile, routineReq.weights)
    
    // Ensure we have at least the required products
    const finalProducts = ensureRequiredProducts(scoredProducts, routineReq.required, routineReq.maxProducts)

    const candidates = finalProducts.map(formatProductResponse)

    return {
      success: true,
      products: candidates
    }
  } catch (error) {
    console.error('[API] Optimized search failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function fetchRequiredProductsBatch(
  profile: ProductSelectionProfile,
  requiredTypes: readonly ProductType[],
  baseWhere: any
) {
  const mappedTypes = requiredTypes.map(mapToPrismaProductType)
  
  // Single query to get all required products
  const products = await prisma.product.findMany({
    where: {
      AND: [
        baseWhere,
        { type: { in: mappedTypes } }
      ]
    },
    orderBy: [

      { createdAt: 'desc' }
    ],
    take: requiredTypes.length * 3 // Get multiple options per type
  })

  // Ensure we have at least one product per required type
  const productsByType = new Map()
  const result = []
  
  for (const product of products) {
    const typeCount = productsByType.get(product.type) || 0
    if (typeCount < 2) { // Take top 2 per type for better selection
      result.push(product)
      productsByType.set(product.type, typeCount + 1)
    }
  }

  // Fallback for missing required types
  for (const type of requiredTypes) {
    const mappedType = mapToPrismaProductType(type)
    if (!result.some(p => p.type === mappedType)) {
      const fallback = await prisma.product.findFirst({
        where: { type: mappedType },
        orderBy: [{ createdAt: 'desc' }]
      })
      if (fallback) result.push(fallback)
    }
  }

  return result
}

async function fetchConcernProductsBatch(
  profile: ProductSelectionProfile,
  baseWhere: any
) {
  if (!profile.skinConcerns || profile.skinConcerns.length === 0) {
    return []
  }

  try {
    const mappedConcerns = mapToPrismaSkinConcerns(profile.skinConcerns)
    
    // Single query for all concern-related products
    const products = await prisma.product.findMany({
      where: {
        AND: [
          baseWhere,
          { skinConcerns: { hasSome: mappedConcerns } }
        ]
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: 15 // Get more products for better selection
    })

    return products
  } catch (error) {
    console.warn('[API] Concern products fetch failed:', error)
    return []
  }
}

async function fetchAdditionalProductsBatch(
  profile: ProductSelectionProfile,
  routineReq: any,
  baseWhere: any
) {
  const allOptionalTypes = [...(routineReq.preferred || []), ...(routineReq.optional || [])]
  
  if (allOptionalTypes.length === 0) return []

  try {
    const mappedTypes = allOptionalTypes.map(mapToPrismaProductType)
    
    const products = await prisma.product.findMany({
      where: {
        AND: [
          baseWhere,
          { type: { in: mappedTypes } }
        ]
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: 20
    })

    return products
  } catch (error) {
    console.warn('[API] Additional products fetch failed:', error)
    return []
  }
}

function deduplicateProductsAdvanced(products: any[]): any[] {
  const seen = new Map<string, any>()
  
  return products.filter(product => {
    // Create multiple deduplication keys
    const keys = [
      `${product.brand?.toLowerCase()}-${product.name?.toLowerCase()}`,
      `${product.brand?.toLowerCase()}-${normalizeProductName(product.name)}`,
      product.id?.toString()
    ].filter(Boolean)
    
    // Check if any variant already exists
    for (const key of keys) {
      if (seen.has(key)) {
        const existing = seen.get(key)
        // Keep the more recently created product
        if (new Date(product.createdAt) > new Date(existing.createdAt)) {
          // Update all keys to point to the better product
          keys.forEach(k => seen.set(k, product))
          return true
        }
        return false
      }
    }
    
    // Add all keys for this product
    keys.forEach(key => seen.set(key, product))
    return true
  })
}

function normalizeProductName(name: string): string {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function scoreProductsAdvanced(
  products: any[], 
  profile: ProductSelectionProfile,
  weights: any
): any[] {
  const adaptiveWeights = getAdaptiveWeights(profile, weights)
  
  return products.map(product => {
    let score = 0

    // Skin type matching with partial compatibility
    if (profile.skinType && product.skinTypes) {
      const exactMatch = product.skinTypes.includes(profile.skinType)
      const compatibleTypes = getCompatibleSkinTypes(profile.skinType)
      const hasCompatible = product.skinTypes.some((type: string) => compatibleTypes.includes(type))
      
      score += exactMatch ? adaptiveWeights.skinTypeMatch : (hasCompatible ? adaptiveWeights.skinTypeMatch * 0.6 : 0)
    }

    // Enhanced concern matching with priority weights
    if (profile.skinConcerns && product.skinConcerns) {
      let concernScore = 0
      for (const concern of profile.skinConcerns) {
        if (product.skinConcerns.includes(concern)) {
          const concernWeight = CONCERN_PRIORITY_MAP[concern as keyof typeof CONCERN_PRIORITY_MAP]?.weight || 1
          concernScore += adaptiveWeights.concernMatch * concernWeight
        }
      }
      score += concernScore
    }

    // Budget compatibility with graduated scoring
    // if (profile.budget && product.budget) {
    //   const budgetScore = calculateBudgetScore(product.budget, profile.budget)
    //   score += budgetScore * adaptiveWeights.budgetFit
    // }

    // Gender appropriateness
    if (profile.gender && (product.gender === profile.gender || product.gender === 'UNISEX')) {
      score += 3
    }

    // Age appropriateness
    if (profile.age) {
      const ageScore = calculateAgeAppropriatenessScore(product, profile.age)
      score += ageScore * 2
    }

    return { ...product, score: Math.round(score * 100) / 100 }
  }).sort((a, b) => b.score - a.score)
}

function getAdaptiveWeights(profile: ProductSelectionProfile, baseWeights: any): ScoringWeights {
  // Remove budgetFit from weights
  const { budgetFit, ...restBaseWeights } = baseWeights
  const weights = { ...restBaseWeights, reviewCount: 2, brandTrust: 3 }

  // Adapt weights based on profile
  if (profile.skinType === 'sensitive') {
    weights.skinTypeMatch += 5
    weights.concernMatch += 3
  }

  // if (profile.age && parseInt(profile.age) < 25) {
  //   weights.budgetFit += 2
  // }

  if (profile.skinConcerns && profile.skinConcerns.length > 2) {
    weights.concernMatch += 2
  }

  return weights as ScoringWeights
}

function getCompatibleSkinTypes(skinType: string): string[] {
  const compatibility = {
    'oily': ['combination', 'normal'],
    'dry': ['normal', 'sensitive'],
    'combination': ['oily', 'normal'],
    'sensitive': ['dry', 'normal'],
    'normal': ['oily', 'dry', 'combination', 'sensitive']
  }
  return compatibility[skinType as keyof typeof compatibility] || []
}

// function calculateBudgetScore(productBudget: string, userBudget: string): number {
//   const budgetValues = { 'budgetFriendly': 1, 'midRange': 2, 'Premium': 3 }
//   const productValue = budgetValues[productBudget as keyof typeof budgetValues] || 1
//   const userValue = budgetValues[userBudget as keyof typeof budgetValues] || 2

//   if (productValue === userValue) return 5
//   if (productValue < userValue) return 3 // Under budget is good
//   if (productValue === userValue + 1) return 1 // Slightly over budget
//   return 0 // Way over budget
// }

function calculateAgeAppropriatenessScore(product: any, age: string): number {
  const ageNum = parseInt(age)
  
  if (!product.age || product.age.includes('ALL')) return 3
  
  const ageRanges = {
    'TEEN': [13, 19],
    'YOUNG': [20, 29], 
    'MATURE': [30, 49],
    'SENIOR': [50, 100]
  }

  for (const [range, [min, max]] of Object.entries(ageRanges)) {
    if (product.age.includes(range) && ageNum >= min && ageNum <= max) {
      return 4
    }
  }

  return 1 // Not specifically targeted but not penalized
}

function ensureRequiredProducts(
  scoredProducts: any[],
  requiredTypes: readonly ProductType[],
  maxProducts: number
): any[] {
  const result = []
  const usedTypes = new Set()

  // First, ensure we have required products
  for (const requiredType of requiredTypes) {
    const mappedType = mapToPrismaProductType(requiredType)
    const requiredProduct = scoredProducts.find(p => p.type === mappedType && !usedTypes.has(p.type))
    
    if (requiredProduct) {
      result.push(requiredProduct)
      usedTypes.add(requiredProduct.type)
    }
  }

  // Fill remaining slots with best scoring products
  const remainingSlots = maxProducts - result.length
  const remainingProducts = scoredProducts
    .filter(p => !usedTypes.has(p.type))
    .slice(0, remainingSlots)

  return [...result, ...remainingProducts]
}

async function performFallbackSearch(
  profile: ProductSelectionProfile,
  routineReq: any
) {
  try {
    // Simplified search with relaxed criteria
    const products = await prisma.product.findMany({
      where: {
        type: { in: routineReq.required.map(mapToPrismaProductType) }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: routineReq.maxProducts * 2
    })

    const scoredProducts = scoreProductsAdvanced(products, profile, routineReq.weights)
    const finalProducts = ensureRequiredProducts(scoredProducts, routineReq.required, routineReq.maxProducts)
    
    return {
      success: true,
      products: finalProducts.map(formatProductResponse)
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

function formatProductResponse(product: any) {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    type: product.type,
    price: product.price ? Number(product.price) : null,
    link: product.purchaseLink,
    score: product.score,
    imageUrl: product.imageUrl,
    instructions: product.instructions || '',
    useTime: product.useTime,
    texture: product.texture,
    skinTypes: product.skinTypes,
    skinConcerns: product.skinConcerns,
    ingredients: product.ingredients,
    createdAt: product.createdAt
  }
}

function buildBaseWhereClause(profile: ProductSelectionProfile) {
  let whereClause: Record<string, any> = {}

  if (profile.skinType) {
    try {
      const mappedSkinType = mapToPrismaSkinTypes([profile.skinType])
      whereClause.skinTypes = { hasSome: mappedSkinType }
    } catch (error) {
      console.warn(`[API] Invalid skin type "${profile.skinType}"`)
    }
  }

  // if (profile.budget) {
  //   try {
  //     const mappedBudget = mapToPrismaBudgetRange(profile.budget)
  //     const budgetFilters = [mappedBudget]
      
  //     // Include lower budget ranges as well
  //     if (profile.budget === "Premium") {
  //       budgetFilters.push(mapToPrismaBudgetRange("midRange"))
  //       budgetFilters.push(mapToPrismaBudgetRange("budgetFriendly"))
  //     } else if (profile.budget === "midRange") {
  //       budgetFilters.push(mapToPrismaBudgetRange("budgetFriendly"))
  //     }
      
  //     whereClause.budget = { in: budgetFilters }
  //   } catch (error) {
  //     console.warn(`[API] Invalid budget "${profile.budget}"`)
  //   }
  // }

  if (profile.gender) {
    try {
      const mappedGender = mapToPrismaGender(profile.gender)
      whereClause.gender = { in: [mappedGender, "UNISEX" as PrismaGender] }
    } catch (error) {
      console.warn(`[API] Invalid gender "${profile.gender}"`)
    }
  }

  if (profile.age) {
    whereClause.age = getAgeRangeFilter(profile.age)
  }

  return whereClause
}

function getAgeRangeFilter(age: string) {
  const ageNum = parseInt(age)
  
  if (ageNum >= 13 && ageNum <= 19) return { hasSome: ['TEEN', 'YOUNG', 'ALL'] }
  if (ageNum >= 20 && ageNum <= 29) return { hasSome: ['YOUNG', 'ALL'] }
  if (ageNum >= 30 && ageNum <= 49) return { hasSome: ['MATURE', 'ALL'] }
  if (ageNum >= 50) return { hasSome: ['SENIOR', 'MATURE', 'ALL'] }
  
  return { hasSome: ['ALL', 'YOUNG', 'MATURE'] }
}