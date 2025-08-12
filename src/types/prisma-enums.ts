// This file contains TypeScript types that exactly match Prisma's enum values
// These types ensure full type safety when working with Prisma

export type PrismaProductType =
  // Core
  | "CLEANSER"
  | "MOISTURIZER"
  | "SUNSCREEN"

  // Prep & Hydration
  | "TONER"
  | "ESSENCE"
  | "HYDRATING_MIST"
  | "FACE_MIST"

  // Treatment-Focused
  | "SERUM"
  | "AMPOULE"
  | "SPOT_TREATMENT"
  | "EXFOLIANT_CHEMICAL"
  | "EXFOLIATOR_PHYSICAL"
  | "RETINOID"
  | "RETINOL"
  | "PEPTIDE_TREATMENT"
  | "VITAMIN_C_TREATMENT"
  | "NIACINAMIDE_TREATMENT"
  | "BRIGHTENING_TREATMENT"
  | "ANTI_AGING_TREATMENT"

  // Night Care / Repair
  | "SLEEPING_MASK"
  | "NIGHT_CREAM"
  | "OVERNIGHT_TREATMENT"
  | "FACE_OIL"

  // Targeted Areas
  | "EYE_CREAM"
  | "EYE_SERUM"
  | "LIP_BALM"
  | "LIP_TREATMENT"

  // Cleansing Extras
  | "MAKEUP_REMOVER"
  | "CLEANSING_BALM"
  | "MICELLAR_WATER"
  | "OIL_CLEANSER"

  // Occasional Treatments
  | "FACE_MASK"
  | "SHEET_MASK"
  | "CLAY_MASK"
  | "PEEL_OFF_MASK"
  | "SCRUB_MASK"
  | "HYDRATING_MASK"
  | "DETOX_MASK"

  // Special Purpose
  | "BARRIER_REPAIR_CREAM"
  | "CICA_CREAM"
  | "SOOTHING_CREAM"
  | "ANTI_REDNESS_CREAM"
  | "PORE_MINIMIZER"
  | "SEBUM_CONTROL_GEL"

export type PrismaSkinType = "DRY" | "OILY" | "COMBINATION" | "SENSITIVE" | "NORMAL"

export type PrismaSkinConcern =
  | "ACNE"
  | "BLACKHEADS"
  | "DULLNESS"
  | "HYPERPIGMENTATION"
  | "FINE_LINES"
  | "DEHYDRATION"
  | "REDNESS"
  | "PORES"
  | "UNEVEN_TEXTURE"

export type PrismaGender = "MALE" | "FEMALE" | "UNISEX"

export type PrismaBudgetRange = "LOW" | "MEDIUM" | "HIGH"

export type PrismaTexture = "GEL" | "CREAM" | "LOTION" | "FOAM" | "OIL" | "SPRAY"

export type PrismaFrequency = "DAILY" | "TWO_THREE_TIMES_WEEK" | "AS_NEEDED"

export type PrismaUseTime = "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT"

export type PrismaCategory = "CORE" | "TREATMENT" | "HYDRATION" | "SPECIAL" | "OPTIONAL"

// Mapping functions for converting frontend types to Prisma types
export const mapToPrismaProductType = (type: string): PrismaProductType => {
  const typeMap: Record<string, PrismaProductType> = {
    'cleanser': 'CLEANSER',
    'moisturizer': 'MOISTURIZER',
    'sunscreen': 'SUNSCREEN',
    'toner': 'TONER',
    'essence': 'ESSENCE',
    'hydrating mist': 'HYDRATING_MIST',
    'face mist': 'FACE_MIST',
    'serum': 'SERUM',
    'ampoule': 'AMPOULE',
    'spot treatment': 'SPOT_TREATMENT',
    'exfoliant (chemical)': 'EXFOLIANT_CHEMICAL',
    'exfoliator (physical)': 'EXFOLIATOR_PHYSICAL',
    'retinoid': 'RETINOID',
    'retinol': 'RETINOL',
    'peptide treatment': 'PEPTIDE_TREATMENT',
    'vitamin c treatment': 'VITAMIN_C_TREATMENT',
    'niacinamide treatment': 'NIACINAMIDE_TREATMENT',
    'brightening treatment': 'BRIGHTENING_TREATMENT',
    'anti-aging treatment': 'ANTI_AGING_TREATMENT',
    'sleeping mask': 'SLEEPING_MASK',
    'night cream': 'NIGHT_CREAM',
    'overnight treatment': 'OVERNIGHT_TREATMENT',
    'face oil': 'FACE_OIL',
    'eye cream': 'EYE_CREAM',
    'eye serum': 'EYE_SERUM',
    'lip balm': 'LIP_BALM',
    'lip treatment': 'LIP_TREATMENT',
    'makeup remover': 'MAKEUP_REMOVER',
    'cleansing balm': 'CLEANSING_BALM',
    'micellar water': 'MICELLAR_WATER',
    'oil cleanser': 'OIL_CLEANSER',
    'face mask': 'FACE_MASK',
    'sheet mask': 'SHEET_MASK',
    'clay mask': 'CLAY_MASK',
    'peel-off mask': 'PEEL_OFF_MASK',
    'scrub mask': 'SCRUB_MASK',
    'hydrating mask': 'HYDRATING_MASK',
    'detox mask': 'DETOX_MASK',
    'barrier repair cream': 'BARRIER_REPAIR_CREAM',
    'cica cream': 'CICA_CREAM',
    'soothing cream': 'SOOTHING_CREAM',
    'anti-redness cream': 'ANTI_REDNESS_CREAM',
    'pore minimizer': 'PORE_MINIMIZER',
    'sebum control gel': 'SEBUM_CONTROL_GEL'
  }
  
  const mapped = typeMap[type.toLowerCase()]
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
    'low': 'LOW',
    'medium': 'MEDIUM',
    'high': 'HIGH'
  }
  
  const mapped = budgetMap[budget.toLowerCase()]
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
    'afternoon': 'AFTERNOON',
    'evening': 'EVENING',
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

export const mapToPrismaFrequency = (frequency: string): PrismaFrequency => {
  const frequencyMap: Record<string, PrismaFrequency> = {
    'daily': 'DAILY',
    '2-3x/week': 'TWO_THREE_TIMES_WEEK',
    'as needed': 'AS_NEEDED'
  }
  
  const mapped = frequencyMap[frequency.toLowerCase()]
  if (!mapped) {
    throw new Error(`Invalid frequency: ${frequency}. Valid frequencies: ${Object.keys(frequencyMap).join(', ')}`)
  }
  return mapped
}

export const mapToPrismaSkinTypes = (skinTypes: string[]): PrismaSkinType[] => {
  const skinTypeMap: Record<string, PrismaSkinType> = {
    'dry': 'DRY',
    'oily': 'OILY',
    'combination': 'COMBINATION',
    'sensitive': 'SENSITIVE',
    'normal': 'NORMAL'
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
    'fine lines': 'FINE_LINES',
    'dehydration': 'DEHYDRATION',
    'redness': 'REDNESS',
    'pores': 'PORES',
    'uneven texture': 'UNEVEN_TEXTURE',
    'sun damage': 'HYPERPIGMENTATION' // Map 'sun damage' to closest concern
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
    'serum': 'GEL' // Map 'serum' to 'GEL' as closest texture
  }
  
  const mapped = textureMap[texture.toLowerCase()]
  if (!mapped) {
    throw new Error(`Invalid texture: ${texture}. Valid textures: ${Object.keys(textureMap).join(', ')}`)
  }
  return mapped
}
