import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  mapToPrismaSkinTypes,
  mapToPrismaSkinConcerns,
  mapToPrismaBudgetRange,
  mapToPrismaGender,
  mapToPrismaProductType,
  PrismaGender
} from '@/types/prisma-enums'
import { ProductType } from '@/types/product';

interface ProductSelectionProfile {
  skinType?: string;
  skinConcerns?: string[];
  budget?: string;
  gender?: string;
  age?: string;
  routineComplexity?: 'minimal' | 'standard' | 'comprehensive';
}

// Define essential product categories for different routine complexities
const ROUTINE_REQUIREMENTS = {
  minimal: {
    required: ['cleanser', 'moisturizer', 'sunscreen'] as ProductType[],
    optional: ['serum'] as ProductType[],
    maxProducts: 4
  },
  standard: {
    required: ['cleanser', 'moisturizer', 'sunscreen'] as ProductType[],
    preferred: ['toner', 'serum', 'eyeCream'] as ProductType[],
    optional: ['essence', 'spotTreatment'] as ProductType[],
    maxProducts: 7
  },
  comprehensive: {
    required: ['cleanser', 'moisturizer', 'sunscreen'] as ProductType[],
    preferred: ['toner', 'serum', 'eyeCream', 'essence'] as ProductType[],
    optional: ['spotTreatment', 'faceOil', 'sleepingMask', 'exfoliant', 'faceMask'] as ProductType[],
    maxProducts: 12
  }
} as const;

// Priority scoring for different product types based on skin concerns
const CONCERN_PRIORITY_MAP = {
  acne: ['spotTreatment', 'serum', 'cleanser', 'toner'],
  blackheads: ['exfoliant', 'cleanser', 'toner', 'poreMinimizer'],
  hyperpigmentation: ['serum', 'vitaminC', 'brightening', 'sunscreen'],
  fine_lines: ['serum', 'retinoid', 'eyeCream', 'antiAging'],
  wrinkles: ['retinoid', 'peptide', 'antiAging', 'eyeCream'],
  dullness: ['exfoliant', 'vitaminC', 'brightening', 'essence'],
  dehydration: ['hydrator', 'essence', 'hydratingMask', 'serum'],
  dryness: ['moisturizer', 'faceOil', 'barrierCream', 'hydratingMask'],
  redness: ['soothingCream', 'cicaCream', 'antiRedness', 'barrierCream'],
  sensitivity: ['barrierCream', 'soothingCream', 'cicaCream'],
  pores: ['poreMinimizer', 'niacinamide', 'exfoliant', 'toner'],
  oiliness: ['sebumControl', 'niacinamide', 'toner', 'cleanser']
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const profile: ProductSelectionProfile = body

    console.log('[API] Received profile:', profile)
    console.log('[API] Available routine complexities:', Object.keys(ROUTINE_REQUIREMENTS))

    // Determine routine complexity (default to standard)
    const complexity = (profile.routineComplexity || 'standard').toLowerCase()
    const routineReq = ROUTINE_REQUIREMENTS[complexity as keyof typeof ROUTINE_REQUIREMENTS]
    
    console.log('[API] Routine complexity:', profile.routineComplexity)
    console.log('[API] Normalized complexity:', complexity)
    console.log('[API] Routine requirements:', routineReq)
    
    if (!routineReq) {
      console.warn(`[API] Unknown routine complexity: ${complexity}, defaulting to standard`)
      const fallbackComplexity = 'standard' as keyof typeof ROUTINE_REQUIREMENTS
      const fallbackReq = ROUTINE_REQUIREMENTS[fallbackComplexity]
      console.log('[API] Using fallback routine requirements:', fallbackReq)
      
      // Instead of returning an error, use the fallback
      const finalRoutineReq = fallbackReq
      console.log('[API] Using fallback routine requirements for processing')
      
      // Continue with the fallback requirements
      const requiredProducts = await fetchRequiredProducts(profile, finalRoutineReq.required)
      const concernProducts = await fetchConcernSpecificProducts(profile, finalRoutineReq.maxProducts - requiredProducts.length)
      const remainingSlots = finalRoutineReq.maxProducts - requiredProducts.length - concernProducts.length
      const fillerProducts = await fetchFillerProducts(profile, remainingSlots, [...requiredProducts, ...concernProducts])
      
      const allProducts = [...requiredProducts, ...concernProducts, ...fillerProducts]
      const uniqueProducts = deduplicateProducts(allProducts)
      const scoredProducts = scoreProducts(uniqueProducts, profile)
      const finalProducts = scoredProducts.slice(0, finalRoutineReq.maxProducts)
      
      console.log(`[API] Selected ${finalProducts.length} products using fallback routine`)
      
      const candidates = finalProducts.map((p) => ({
        name: p.name,
        brand: p.brand,
        type: p.type,
        price: p.price ? Number(p.price) : null,
        link: p.purchaseLink,
        score: p.score,
        imageUrl: p.imageUrl,
        instructions: p.instructions || '',
        useTime: p.useTime,
        texture: p.texture,
        skinTypes: p.skinTypes,
        skinConcerns: p.skinConcerns,
        ingredients: p.ingredients,
      }))
      
      return NextResponse.json({ 
        success: true, 
        products: candidates,
        count: candidates.length,
        routineComplexity: fallbackComplexity,
        note: `Used fallback complexity: ${fallbackComplexity} (original: ${profile.routineComplexity})`
      })
    }

    // Get age-appropriate budget multiplier
    const budgetMultiplier = getBudgetMultiplier(profile.age, profile.budget)

    // Step 1: Get required products (cleanser, moisturizer, sunscreen)
    const requiredProducts = await fetchRequiredProducts(profile, routineReq.required)

    // Step 2: Get concern-specific products
    const concernProducts = await fetchConcernSpecificProducts(profile, routineReq.maxProducts - requiredProducts.length)

    // Step 3: Fill remaining slots with preferred/optional products
    const remainingSlots = routineReq.maxProducts - requiredProducts.length - concernProducts.length
    const fillerProducts = await fetchFillerProducts(profile, remainingSlots, [...requiredProducts, ...concernProducts])

    // Step 4: Combine and deduplicate
    const allProducts = [...requiredProducts, ...concernProducts, ...fillerProducts]
    const uniqueProducts = deduplicateProducts(allProducts)

    // Step 5: Apply final scoring and limit
    const scoredProducts = scoreProducts(uniqueProducts, profile)
    const finalProducts = scoredProducts.slice(0, routineReq.maxProducts)

    console.log(`[API] Selected ${finalProducts.length} products for ${complexity} routine`)

    const candidates = finalProducts.map((p) => ({
      name: p.name,
      brand: p.brand,
      type: p.type,
      price: p.price ? Number(p.price) : null,
      link: p.purchaseLink,
      score: p.score,
      imageUrl: p.imageUrl,
      instructions: p.instructions || '',
      useTime: p.useTime,
      texture: p.texture,
      skinTypes: p.skinTypes,
      skinConcerns: p.skinConcerns,
      ingredients: p.ingredients,
    }))

    return NextResponse.json({ 
      success: true, 
      products: candidates,
      count: candidates.length,
      routineComplexity: complexity
    })

  } catch (error) {
    console.error('[API] Product search error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

async function fetchRequiredProducts(profile: ProductSelectionProfile, requiredTypes: readonly ProductType[]) {
  const products = []
  
  for (const type of requiredTypes) {
    const whereClause = buildBaseWhereClause(profile)
    // Convert frontend type to Prisma enum type
    whereClause.type = mapToPrismaProductType(type)

    const product = await prisma.product.findFirst({
      where: whereClause,
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    if (product) {
      products.push(product)
    } else {
      // Fallback: get any product of this type
      const fallback = await prisma.product.findFirst({
        where: { type: mapToPrismaProductType(type) },
        orderBy: [{ createdAt: 'desc' }]
      })
      if (fallback) products.push(fallback)
    }
  }

  return products
}

async function fetchConcernSpecificProducts(profile: ProductSelectionProfile, maxCount: number) {
  if (!profile.skinConcerns || profile.skinConcerns.length === 0) {
    return []
  }

  const products = []
  const usedTypes = new Set<ProductType>()

  // Get priority product types for each concern
  for (const concern of profile.skinConcerns) {
    const priorityTypes = CONCERN_PRIORITY_MAP[concern as keyof typeof CONCERN_PRIORITY_MAP] || []
    
    for (const type of priorityTypes) {
      if (usedTypes.has(type as ProductType) || products.length >= maxCount) continue

      const whereClause = buildBaseWhereClause(profile)
      
      // Look for products that target this specific concern
      try {
        const mappedConcerns = mapToPrismaSkinConcerns([concern])
        whereClause.skinConcerns = { hasSome: mappedConcerns }
        whereClause.type = mapToPrismaProductType(type)
      } catch (error) {
        continue // Skip invalid concerns
      }

      const product = await prisma.product.findFirst({
        where: whereClause,
        orderBy: [{ createdAt: 'desc' }]
      })

      if (product) {
        products.push(product)
        usedTypes.add(type as ProductType)
      }
    }
  }

  return products
}

async function fetchFillerProducts(profile: ProductSelectionProfile, maxCount: number, existingProducts: any[]) {
  if (maxCount <= 0) return []

  const existingTypes = new Set(existingProducts.map(p => p.type))
  const whereClause = buildBaseWhereClause(profile)
  
  // Exclude already selected product types
  whereClause.type = { notIn: Array.from(existingTypes) }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: [{ createdAt: 'desc' }],
    take: maxCount
  })

  return products
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

  if (profile.budget) {
    try {
      const mappedBudget = mapToPrismaBudgetRange(profile.budget)
      const budgetFilters = [mappedBudget]
      
      // Include lower budget ranges as well
      if (profile.budget === "Premium") {
        budgetFilters.push(mapToPrismaBudgetRange("midRange"))
        budgetFilters.push(mapToPrismaBudgetRange("budgetFriendly"))
      } else if (profile.budget === "midRange") {
        budgetFilters.push(mapToPrismaBudgetRange("budgetFriendly"))
      }
      
      whereClause.budget = { in: budgetFilters }
    } catch (error) {
      console.warn(`[API] Invalid budget "${profile.budget}"`)
    }
  }

  if (profile.gender) {
    try {
      const mappedGender = mapToPrismaGender(profile.gender)
      whereClause.gender = { in: [mappedGender, "UNISEX" as PrismaGender] }
    } catch (error) {
      console.warn(`[API] Invalid gender "${profile.gender}"`)
    }
  }

  // Add age filtering if needed
  if (profile.age) {
    whereClause.age = getAgeRangeFilter(profile.age)
  }

  return whereClause
}

function deduplicateProducts(products: any[]) {
  const seen = new Set<string>()
  return products.filter(product => {
    const key = `${product.brand}-${product.name}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function scoreProducts(products: any[], profile: ProductSelectionProfile) {
  return products.map(product => {
    let score = 0

    // Base score for skin type match
    if (profile.skinType && product.skinTypes?.includes(profile.skinType)) {
      score += 10
    }

    // Score for concern matches
    if (profile.skinConcerns) {
      const concernMatches = profile.skinConcerns.filter(concern => 
        product.skinConcerns?.includes(concern)
      ).length
      score += concernMatches * 5
    }

    // Score for budget appropriateness
    if (profile.budget) {
      if (product.budget === profile.budget) {
        score += 3
      } else if (isBudgetCompatible(product.budget, profile.budget)) {
        score += 1
      }
    }

    // Score for gender match
    if (profile.gender && (product.gender === profile.gender || product.gender === 'UNISEX')) {
      score += 2
    }

    return { ...product, score }
  }).sort((a, b) => b.score - a.score)
}

function getBudgetMultiplier(age?: string, budget?: string) {
  // Younger users might prefer budget options, older users might invest more
  if (!age) return 1
  const ageNum = parseInt(age)
  if (ageNum < 25 && budget === 'budgetFriendly') return 1.2
  if (ageNum > 35 && budget === 'Premium') return 1.1
  return 1
}

function getAgeRangeFilter(age: string) {
  const ageNum = parseInt(age)
  
  if (ageNum >= 13 && ageNum <= 17) return { in: ['AGE_13_17', 'AGE_18_25'] }
  if (ageNum >= 18 && ageNum <= 25) return { in: ['AGE_18_25', 'AGE_26_35'] }
  if (ageNum >= 26 && ageNum <= 35) return { in: ['AGE_18_25', 'AGE_26_35', 'AGE_36_45'] }
  if (ageNum >= 36 && ageNum <= 45) return { in: ['AGE_26_35', 'AGE_36_45', 'AGE_46_60'] }
  if (ageNum >= 46 && ageNum <= 60) return { in: ['AGE_36_45', 'AGE_46_60', 'AGE_60_PLUS'] }
  if (ageNum > 60) return { in: ['AGE_46_60', 'AGE_60_PLUS'] }
  
  // Default: include most common ranges
  return { in: ['AGE_18_25', 'AGE_26_35', 'AGE_36_45'] }
}

function isBudgetCompatible(productBudget: string, userBudget: string) {
  const budgetHierarchy = ['budgetFriendly', 'midRange', 'Premium']
  const productIndex = budgetHierarchy.indexOf(productBudget)
  const userIndex = budgetHierarchy.indexOf(userBudget)
  
  // Users can typically afford products at or below their budget level
  return productIndex <= userIndex
}