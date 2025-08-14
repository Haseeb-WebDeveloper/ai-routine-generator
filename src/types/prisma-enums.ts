// This file contains TypeScript types that exactly match Prisma's enum values
// These types ensure full type safety when working with Prisma
// Updated to match the new clean product interface

export type PrismaProductType =
  | "CLEANSER"
  | "MOISTURIZER"
  | "SUNSCREEN"
  | "TONER"
  | "ESSENCE"
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
  | "ASPHYXIATED"
  | "DEHYDRATED"
  | "MATURE"
  | "ACNE_PRONE"

export type PrismaSkinConcern =
  | "ACNE"
  | "BLACKHEADS"
  | "DULLNESS"
  | "HYPERPIGMENTATION"
  | "FINE_LINES"
  | "WRINKLES"
  | "DEHYDRATION"
  | "DRYNESS"
  | "REDNESS"
  | "SENSITIVITY"
  | "PORES"
  | "OILINESS"
  | "UNEVEN_TEXTURE"
  | "DARK_CIRCLES"
  | "PUFFINESS"
  | "SCARRING"
  | "SUN_DAMAGE"

export type PrismaGender = "MALE" | "FEMALE" | "UNISEX"

export type PrismaBudgetRange = "BUDGET_FRIENDLY" | "MID_RANGE" | "PREMIUM"

export type PrismaTexture = "GEL" | "CREAM" | "LOTION" | "FOAM" | "OIL" | "SPRAY" | "MASK" | "BALM"

export type PrismaUseTime = "MORNING" | "NIGHT"

export type PrismaCategory = "CORE" | "TREATMENT" | "HYDRATION" | "SPECIAL" | "OPTIONAL"

export type PrismaAgeRange = 
  | "AGE_0_1"
  | "AGE_1_3"
  | "AGE_4_12"
  | "AGE_13_17"
  | "AGE_18_25"
  | "AGE_26_35"
  | "AGE_36_45"
  | "AGE_46_60"
  | "AGE_60_PLUS"

// Mapping functions for converting frontend types to Prisma types
export const mapToPrismaProductType = (type: string): PrismaProductType => {
  const typeMap: Record<string, PrismaProductType> = {
    'cleanser': 'CLEANSER',
    'moisturizer': 'MOISTURIZER',
    'sunscreen': 'SUNSCREEN',
    'toner': 'TONER',
    'essence': 'ESSENCE',
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
    'Premium': 'PREMIUM'
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
    'night': 'NIGHT'
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
    'asphyxiated': 'ASPHYXIATED',
    'dehydrated': 'DEHYDRATED',
    'mature': 'MATURE',
    'acne_prone': 'ACNE_PRONE'
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
    'fine_lines': 'FINE_LINES',
    'wrinkles': 'WRINKLES',
    'dehydration': 'DEHYDRATION',
    'dryness': 'DRYNESS',
    'redness': 'REDNESS',
    'sensitivity': 'SENSITIVITY',
    'pores': 'PORES',
    'oiliness': 'OILINESS',
    'uneven_texture': 'UNEVEN_TEXTURE',
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
    'balm': 'BALM'
  }
  
  const mapped = textureMap[texture.toLowerCase()]
  if (!mapped) {
    throw new Error(`Invalid texture: ${texture}. Valid textures: ${Object.keys(textureMap).join(', ')}`)
  }
  return mapped
}

export const mapToPrismaAgeRange = (age: number): PrismaAgeRange => {
  if (age >= 0 && age <= 1) return 'AGE_0_1'
  if (age >= 1 && age <= 3) return 'AGE_1_3'
  if (age >= 4 && age <= 12) return 'AGE_4_12'
  if (age >= 13 && age <= 17) return 'AGE_13_17'
  if (age >= 18 && age <= 25) return 'AGE_18_25'
  if (age >= 26 && age <= 35) return 'AGE_26_35'
  if (age >= 36 && age <= 45) return 'AGE_36_45'
  if (age >= 46 && age <= 60) return 'AGE_46_60'
  if (age >= 60) return 'AGE_60_PLUS'
  
  throw new Error(`Invalid age: ${age}. Age must be a positive number.`)
}
