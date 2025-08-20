// This file contains TypeScript types that exactly match Prisma's enum values
// These types ensure full type safety when working with Prisma
// Updated to match the new clean product interface

export type PrismaProductType =
  | "CLEANSER"
  | "MOISTURIZER"
  | "SUNSCREEN"
  | "TONER"
  | "ESSENCE"
  | "FACE_CREAM"
  | "HYDRATOR"
  | "SERUM"
  | "AMPOULE"
  | "SPOT_TREATMENT"
  | "EXFOLIANT"
  | "RETINOID"
  | "PEPTIDE"
  | "VITAMIN_C"
  | "NIACINAMIDE"
  | "BRIGHTENING"
  | "ANTI_AGING"
  | "SLEEPING_MASK"
  | "NIGHT_CREAM"
  | "FACE_OIL"
  | "EYE_CREAM"
  | "EYE_SERUM"
  | "LIP_BALM"
  | "LIP_CARE"
  | "MAKEUP_REMOVER"
  | "CLEANSING_BALM"
  | "MICELLAR_WATER"
  | "OIL_CLEANSER"
  | "FACE_MASK"
  | "SHEET_MASK"
  | "CLAY_MASK"
  | "PEEL_MASK"
  | "SCRUB_MASK"
  | "HYDRATING_MASK"
  | "DETOX_MASK"
  | "BARRIER_CREAM"
  | "CICA_CREAM"
  | "SOOTHING_CREAM"
  | "ANTI_REDNESS"
  | "PORE_MINIMIZER"
  | "SEBUM_CONTROL"

export type PrismaSkinType = 
  | "OILY"
  | "COMBINATION"
  | "DRY"
  | "NORMAL"
  | "SENSITIVE"
  | "MATURE"
  | "ALL"
export type PrismaSkinConcern =
  | "ACNE"
  | "BLACKHEADS"
  | "DULLNESS"
  | "HYPERPIGMENTATION"
  | "CHAPPED_LIPS"
  | "LOSS_OF_FIRMNESS"
  | "FINE_LINES"
  | "WRINKLES"
  | "DEHYDRATION"
  | "DRYNESS"
  | "REDNESS"
  | "SENSITIVITY"
  | "PORES"
  | "OILINESS"
  | "UNEVEN_TEXTURE"
  | "ELASTICITY"
  | "UNEVEN_TONE"
  | "DARK_CIRCLES"
  | "PUFFINESS"
  | "SCARRING"
  | "SUN_DAMAGE"

export type PrismaGender = "MALE" | "FEMALE" | "UNISEX"

export type PrismaBudgetRange = "BUDGET_FRIENDLY" | "MID_RANGE" | "PREMIUM"

export type PrismaTexture = "GEL" | "CREAM" | "LOTION" | "FOAM" | "OIL" | "SPRAY" | "MASK" | "BALM" | "FLUID" | "LIQUID"

export type PrismaUseTime = "MORNING" | "NIGHT" | "DAY"

export type PrismaCategory = "CORE" | "TREATMENT" | "HYDRATION" | "SPECIAL" | "OPTIONAL"

export type PrismaAgeRange = "KIDS" | "TEEN" | "YOUNG" | "MATURE" | "SENIOR" | "ALL"

// Mapping functions for converting frontend types to Prisma types
export const mapToPrismaProductType = (type: string): PrismaProductType => {
  const typeMap: Record<string, PrismaProductType> = {
    'cleanser': 'CLEANSER',
    'moisturizer': 'MOISTURIZER',
    'sunscreen': 'SUNSCREEN',
    'toner': 'TONER',
    'essence': 'ESSENCE',
    'faceCream': 'FACE_CREAM',
    'hydrator': 'HYDRATOR',
    'serum': 'SERUM',
    'ampoule': 'AMPOULE',
    'spotTreatment': 'SPOT_TREATMENT',
    'exfoliant': 'EXFOLIANT',
    'retinoid': 'RETINOID',
    'peptide': 'PEPTIDE',
    'vitaminC': 'VITAMIN_C',
    'niacinamide': 'NIACINAMIDE',
    'brightening': 'BRIGHTENING',
    'antiAging': 'ANTI_AGING',
    'sleepingMask': 'SLEEPING_MASK',
    'nightCream': 'NIGHT_CREAM',
    'faceOil': 'FACE_OIL',
    'eyeCream': 'EYE_CREAM',
    'eyeSerum': 'EYE_SERUM',
    'lipBalm': 'LIP_BALM',
    'lipCare': 'LIP_CARE',
    'makeupRemover': 'MAKEUP_REMOVER',
    'cleansingBalm': 'CLEANSING_BALM',
    'micellarWater': 'MICELLAR_WATER',
    'oilCleanser': 'OIL_CLEANSER',
    'faceMask': 'FACE_MASK',
    'sheetMask': 'SHEET_MASK',
    'clayMask': 'CLAY_MASK',
    'peelMask': 'PEEL_MASK',
    'scrubMask': 'SCRUB_MASK',
    'hydratingMask': 'HYDRATING_MASK',
    'detoxMask': 'DETOX_MASK',
    'barrierCream': 'BARRIER_CREAM',
    'cicaCream': 'CICA_CREAM',
    'soothingCream': 'SOOTHING_CREAM',
    'antiRedness': 'ANTI_REDNESS',
    'poreMinimizer': 'PORE_MINIMIZER',
    'sebumControl': 'SEBUM_CONTROL'
  }
  
  const mapped = typeMap[type]
  if (!mapped) {
    throw new Error(`Invalid product type: ${type}. Valid types: ${Object.keys(typeMap).join(', ')}`)
  }
  return mapped
}

export const mapToPrismaGender = (gender: string): PrismaGender => {
  const genderMap: Record<string, PrismaGender> = {
    'male': 'MALE',
    'female': 'FEMALE',
    'unisex': 'UNISEX'
  }
  
  const mapped = genderMap[gender.toLowerCase()]
  if (!mapped) {
    throw new Error(`Invalid gender: ${gender}. Valid genders: ${Object.keys(genderMap).join(', ')}`)
  }
  return mapped
}

export const mapToPrismaBudgetRange = (budget: string): PrismaBudgetRange => {
  const budgetMap: Record<string, PrismaBudgetRange> = {
    'budgetFriendly': 'BUDGET_FRIENDLY',
    'midRange': 'MID_RANGE',
    'premium': 'PREMIUM'
  }
  
  const mapped = budgetMap[budget]
  if (!mapped) {
    throw new Error(`Invalid budget: ${budget}. Valid budgets: ${Object.keys(budgetMap).join(', ')}`)
  }
  return mapped
}

export const mapToPrismaCategory = (category: string): PrismaCategory => {
  const categoryMap: Record<string, PrismaCategory> = {
    'core': 'CORE',
    'treatment': 'TREATMENT',
    'hydration': 'HYDRATION',
    'special': 'SPECIAL',
    'optional': 'OPTIONAL'
  }
  
  const mapped = categoryMap[category.toLowerCase()]
  if (!mapped) {
    throw new Error(`Invalid category: ${category}. Valid categories: ${Object.keys(categoryMap).join(', ')}`)
  }
  return mapped
}

export const mapToPrismaUseTime = (useTime: string[]): PrismaUseTime[] => {
  const useTimeMap: Record<string, PrismaUseTime> = {
    'morning': 'MORNING',
    'night': 'NIGHT',
    'day': 'DAY'
  }
  
  return useTime.map(t => {
    const mapped = useTimeMap[t.toLowerCase()]
    if (!mapped) {
      throw new Error(`Invalid use time: ${t}. Valid use times: ${Object.keys(useTimeMap).join(', ')}`)
    }
    return mapped
  })
}

export const mapToPrismaSkinTypes = (skinTypes: string[]): PrismaSkinType[] => {
  const skinTypeMap: Record<string, PrismaSkinType> = {
    'oily': 'OILY',
    'combination': 'COMBINATION',
    'dry': 'DRY',
    'normal': 'NORMAL',
    'sensitive': 'SENSITIVE',
    'mature': 'MATURE',
    'all': 'ALL',
  }
  
  return skinTypes.map(t => {
    const mapped = skinTypeMap[t.toLowerCase()]
    if (!mapped) {
      throw new Error(`Invalid skin type: ${t}. Valid skin types: ${Object.keys(skinTypeMap).join(', ')}`)
    }
    return mapped
  })
}

export const mapToPrismaSkinConcerns = (skinConcerns: string[]): PrismaSkinConcern[] => {
  const skinConcernMap: Record<string, PrismaSkinConcern> = {
    'acne': 'ACNE',
    'blackheads': 'BLACKHEADS',
    'dullness': 'DULLNESS',
    'hyperpigmentation': 'HYPERPIGMENTATION',
    'chapped_lips': 'CHAPPED_LIPS',
    'loss_of_firmness': 'LOSS_OF_FIRMNESS',
    'fine_lines': 'FINE_LINES',
    'wrinkles': 'WRINKLES',
    'dehydration': 'DEHYDRATION',
    'dryness': 'DRYNESS',
    'redness': 'REDNESS',
    'sensitivity': 'SENSITIVITY',
    'pores': 'PORES',
    'oiliness': 'OILINESS',
    'uneven_texture': 'UNEVEN_TEXTURE',
    'elasticity': 'ELASTICITY',
    'uneven_tone': 'UNEVEN_TONE',
    'dark_circles': 'DARK_CIRCLES',
    'puffiness': 'PUFFINESS',
    'scarring': 'SCARRING',
    'sun_damage': 'SUN_DAMAGE'
  }
  
  return skinConcerns.map(c => {
    const mapped = skinConcernMap[c.toLowerCase()]
    if (!mapped) {
      throw new Error(`Invalid skin concern: ${c}. Valid skin concerns: ${Object.keys(skinConcernMap).join(', ')}`)
    }
    return mapped
  })
}

export const mapToPrismaTexture = (texture: string): PrismaTexture => {
  const textureMap: Record<string, PrismaTexture> = {
    'gel': 'GEL',
    'cream': 'CREAM',
    'lotion': 'LOTION',
    'foam': 'FOAM',
    'oil': 'OIL',
    'spray': 'SPRAY',
    'mask': 'MASK',
    'balm': 'BALM',
    'fluid': 'FLUID',
    'liquid': 'LIQUID'
  }
  
  const mapped = textureMap[texture.toLowerCase()]
  if (!mapped) {
    throw new Error(`Invalid texture: ${texture}. Valid textures: ${Object.keys(textureMap).join(', ')}`)
  }
  return mapped
}

export const mapToPrismaAgeRange = (age: string): PrismaAgeRange => {
  const ageMap: Record<string, PrismaAgeRange> = {
    'kids': 'KIDS',
    'teen': 'TEEN',
    'young': 'YOUNG',
    'mature': 'MATURE',
    'senior': 'SENIOR',
    'all': 'ALL'
  }
  
  const mapped = ageMap[age]
  if (!mapped) {
    throw new Error(`Invalid age range: ${age}. Valid age ranges: ${Object.keys(ageMap).join(', ')}`)
  }
  return mapped
}

// Reverse mapping functions for converting Prisma types back to frontend types
export const mapFromPrismaProductType = (type: PrismaProductType): string => {
  const typeMap: Record<PrismaProductType, string> = {
    'CLEANSER': 'cleanser',
    'MOISTURIZER': 'moisturizer',
    'SUNSCREEN': 'sunscreen',
    'TONER': 'toner',
    'ESSENCE': 'essence',
    'FACE_CREAM': 'faceCream',
    'HYDRATOR': 'hydrator',
    'SERUM': 'serum',
    'AMPOULE': 'ampoule',
    'SPOT_TREATMENT': 'spotTreatment',
    'EXFOLIANT': 'exfoliant',
    'RETINOID': 'retinoid',
    'PEPTIDE': 'peptide',
    'VITAMIN_C': 'vitaminC',
    'NIACINAMIDE': 'niacinamide',
    'BRIGHTENING': 'brightening',
    'ANTI_AGING': 'antiAging',
    'SLEEPING_MASK': 'sleepingMask',
    'NIGHT_CREAM': 'nightCream',
    'FACE_OIL': 'faceOil',
    'EYE_CREAM': 'eyeCream',
    'EYE_SERUM': 'eyeSerum',
    'LIP_BALM': 'lipBalm',
    'LIP_CARE': 'lipCare',
    'MAKEUP_REMOVER': 'makeupRemover',
    'CLEANSING_BALM': 'cleansingBalm',
    'MICELLAR_WATER': 'micellarWater',
    'OIL_CLEANSER': 'oilCleanser',
    'FACE_MASK': 'faceMask',
    'SHEET_MASK': 'sheetMask',
    'CLAY_MASK': 'clayMask',
    'PEEL_MASK': 'peelMask',
    'SCRUB_MASK': 'scrubMask',
    'HYDRATING_MASK': 'hydratingMask',
    'DETOX_MASK': 'detoxMask',
    'BARRIER_CREAM': 'barrierCream',
    'CICA_CREAM': 'cicaCream',
    'SOOTHING_CREAM': 'soothingCream',
    'ANTI_REDNESS': 'antiRedness',
    'PORE_MINIMIZER': 'poreMinimizer',
    'SEBUM_CONTROL': 'sebumControl'
  }
  
  return typeMap[type] || type.toLowerCase()
}

export const mapFromPrismaGender = (gender: PrismaGender): string => {
  const genderMap: Record<PrismaGender, string> = {
    'MALE': 'male',
    'FEMALE': 'female',
    'UNISEX': 'unisex'
  }
  
  return genderMap[gender] || gender.toLowerCase()
}

export const mapFromPrismaBudgetRange = (budget: PrismaBudgetRange): string => {
  const budgetMap: Record<PrismaBudgetRange, string> = {
    'BUDGET_FRIENDLY': 'budgetFriendly',
    'MID_RANGE': 'midRange',
    'PREMIUM': 'premium'
  }
  
  return budgetMap[budget] || budget.toLowerCase()
}

export const mapFromPrismaCategory = (category: PrismaCategory): string => {
  const categoryMap: Record<PrismaCategory, string> = {
    'CORE': 'core',
    'TREATMENT': 'treatment',
    'HYDRATION': 'hydration',
    'SPECIAL': 'special',
    'OPTIONAL': 'optional'
  }
  
  return categoryMap[category] || category.toLowerCase()
}

export const mapFromPrismaUseTime = (useTime: PrismaUseTime[]): string[] => {
  const useTimeMap: Record<PrismaUseTime, string> = {
    'MORNING': 'morning',
    'NIGHT': 'night',
    'DAY': 'day'
  }
  
  return useTime.map(t => useTimeMap[t] || t.toLowerCase())
}

export const mapFromPrismaSkinTypes = (skinTypes: PrismaSkinType[]): string[] => {
  const skinTypeMap: Record<PrismaSkinType, string> = {
    'OILY': 'oily',
    'COMBINATION': 'combination',
    'DRY': 'dry',
    'NORMAL': 'normal',
    'SENSITIVE': 'sensitive',
    'MATURE': 'mature',
    'ALL': 'all',
  }
  
  return skinTypes.map(t => skinTypeMap[t] || t.toLowerCase())
}

export const mapFromPrismaSkinConcerns = (skinConcerns: PrismaSkinConcern[]): string[] => {
  const skinConcernMap: Record<PrismaSkinConcern, string> = {
    'ACNE': 'acne',
    'BLACKHEADS': 'blackheads',
    'DULLNESS': 'dullness',
    'HYPERPIGMENTATION': 'hyperpigmentation',
    'CHAPPED_LIPS': 'chapped_lips',
    'LOSS_OF_FIRMNESS': 'loss_of_firmness',
    'FINE_LINES': 'fine_lines',
    'WRINKLES': 'wrinkles',
    'DEHYDRATION': 'dehydration',
    'DRYNESS': 'dryness',
    'REDNESS': 'redness',
    'SENSITIVITY': 'sensitivity',
    'PORES': 'pores',
    'OILINESS': 'oiliness',
    'UNEVEN_TEXTURE': 'uneven_texture',
    'ELASTICITY': 'elasticity',
    'UNEVEN_TONE': 'uneven_tone',
    'DARK_CIRCLES': 'dark_circles',
    'PUFFINESS': 'puffiness',
    'SCARRING': 'scarring',
    'SUN_DAMAGE': 'sun_damage'
  }
  
  return skinConcerns.map(c => skinConcernMap[c] || c.toLowerCase())
}

export const mapFromPrismaTexture = (texture: PrismaTexture): string => {
  const textureMap: Record<PrismaTexture, string> = {
    'GEL': 'gel',
    'CREAM': 'cream',
    'LOTION': 'lotion',
    'FOAM': 'foam',
    'OIL': 'oil',
    'SPRAY': 'spray',
    'MASK': 'mask',
    'BALM': 'balm',
    'FLUID': 'fluid',
    'LIQUID': 'liquid'
  }
  
  return textureMap[texture] || texture.toLowerCase()
}

export const mapFromPrismaAgeRange = (age: PrismaAgeRange): string => {
  const ageMap: Record<PrismaAgeRange, string> = {
    'KIDS': 'kids',
    'TEEN': 'teen',
    'YOUNG': 'young',
    'MATURE': 'mature',
    'SENIOR': 'senior',
    'ALL': 'all'
  }
  
  return ageMap[age] || age.toLowerCase()
}

