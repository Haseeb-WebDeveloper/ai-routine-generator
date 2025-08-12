const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient()

// Type-safe enum mapping functions
const mapProductType = (type) => {
  const typeMap = {
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

const mapGender = (gender) => {
  const genderMap = {
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

const mapBudgetRange = (budget) => {
  const budgetMap = {
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

const mapCategory = (category) => {
  const categoryMap = {
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

const mapUseTime = (useTime) => {
  const useTimeMap = {
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

const mapFrequency = (frequency) => {
  const frequencyMap = {
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

const mapSkinTypes = (skinTypes) => {
  const skinTypeMap = {
    'dry': 'DRY',
    'oily': 'OILY',
    'combination': 'COMBINATION',
    'sensitive': 'SENSITIVE',
    'normal': 'NORMAL',
    'all': 'DRY' // Map 'all' to 'DRY' as a default, or you could use multiple types
  }
  
  return skinTypes.map(t => {
    const mapped = skinTypeMap[t.toLowerCase()]
    if (!mapped) {
      throw new Error(`Invalid skin type: ${t}. Valid skin types: ${Object.keys(skinTypeMap).join(', ')}`)
    }
    return mapped
  })
}

const mapSkinConcerns = (skinConcerns) => {
  const skinConcernMap = {
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

const mapTexture = (texture) => {
  const textureMap = {
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

const sampleProducts = [
  {
    name: "Gentle Daily Cleanser",
    brand: "CeraVe",
    type: "cleanser",
    gender: "unisex",
    age: 18,
    budget: "low",
    category: "core",
    use_time: ["morning", "evening"],
    frequency: "daily",
    skin_types: ["dry", "normal", "sensitive"],
    skin_concerns: ["dehydration", "redness"],
    ingredients: [
      {
        name: "Ceramides",
        function: "Barrier Repair",
        strength: "3 essential ceramides",
        comedogenic_rating: 0,
        irritancy_score: 0,
        compatible_with: ["All ingredients"],
        avoid_with: []
      },
      {
        name: "Hyaluronic Acid",
        function: "Hydrator",
        strength: "1%",
        comedogenic_rating: 0,
        irritancy_score: 0,
        compatible_with: ["All ingredients"],
        avoid_with: []
      }
    ],
    avoid_with: [],
    texture: "foam",
    comedogenic: false,
    fragrance_free: true,
    alcohol_free: true,
    cruelty_free: true,
    vegan: false,
    instructions: "Apply to damp skin, gently massage in circular motions, rinse thoroughly with lukewarm water.",
    benefits: [
      "Removes dirt and oil without stripping",
      "Strengthens skin barrier",
      "Suitable for sensitive skin",
      "Non-comedogenic formula"
    ],
    warnings: [
      "Avoid contact with eyes",
      "Discontinue use if irritation occurs"
    ],
    price_usd: 14.99,
    purchase_link: "https://www.cerave.com/cleanser/facial-cleansers/hydrating-facial-cleanser",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
  },
  {
    name: "Vitamin C Brightening Serum",
    brand: "The Ordinary",
    type: "serum",
    gender: "unisex",
    age: 25,
    budget: "medium",
    category: "treatment",
    use_time: ["morning"],
    frequency: "daily",
    skin_types: ["normal", "combination", "oily"],
    skin_concerns: ["dullness", "hyperpigmentation", "fine lines"],
    ingredients: [
      {
        name: "Ascorbic Acid",
        function: "Antioxidant",
        strength: "23%",
        comedogenic_rating: 1,
        irritancy_score: 2,
        compatible_with: ["Vitamin E", "Ferulic Acid"],
        avoid_with: ["Niacinamide", "Retinol"]
      },
      {
        name: "Alpha Arbutin",
        function: "Brightener",
        strength: "2%",
        comedogenic_rating: 0,
        irritancy_score: 0,
        compatible_with: ["All ingredients"],
        avoid_with: []
      }
    ],
    avoid_with: [
      {
        name: "Niacinamide",
        function: "Vitamin B3",
        strength: "10%",
        comedogenic_rating: 0,
        irritancy_score: 1,
        compatible_with: ["Most ingredients"],
        avoid_with: ["Vitamin C"]
      }
    ],
    texture: "serum",
    comedogenic: false,
    fragrance_free: true,
    alcohol_free: false,
    cruelty_free: true,
    vegan: true,
    instructions: "Apply 4-5 drops to clean, dry skin in the morning. Follow with sunscreen.",
    benefits: [
      "Brightens skin tone",
      "Reduces dark spots",
      "Protects against free radicals",
      "Improves skin texture"
    ],
    warnings: [
      "Use sunscreen during the day",
      "Start with lower frequency if sensitive",
      "Avoid using with niacinamide"
    ],
    price_usd: 12.90,
    purchase_link: "https://theordinary.com/product/rdn-vitamin-c-suspension-23pct-30ml",
    image_url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop"
  },
  {
    name: "Retinol Night Cream",
    brand: "Neutrogena",
    type: "retinol",
    gender: "unisex",
    age: 30,
    budget: "medium",
    category: "treatment",
    use_time: ["night"],
    frequency: "2-3x/week",
    skin_types: ["normal", "combination", "oily"],
    skin_concerns: ["fine lines", "acne", "uneven texture"],
    ingredients: [
      {
        name: "Retinol",
        function: "Cell Turnover",
        strength: "0.3%",
        comedogenic_rating: 1,
        irritancy_score: 3,
        compatible_with: ["Peptides", "Hyaluronic Acid"],
        avoid_with: ["Vitamin C", "AHA", "BHA"]
      },
      {
        name: "Hyaluronic Acid",
        function: "Hydrator",
        strength: "1%",
        comedogenic_rating: 0,
        irritancy_score: 0,
        compatible_with: ["All ingredients"],
        avoid_with: []
      }
    ],
    avoid_with: [
      {
        name: "Vitamin C",
        function: "Antioxidant",
        strength: "20%",
        comedogenic_rating: 1,
        irritancy_score: 2,
        compatible_with: ["Vitamin E"],
        avoid_with: ["Retinol", "AHA", "BHA"]
      }
    ],
    texture: "cream",
    comedogenic: false,
    fragrance_free: true,
    alcohol_free: true,
    cruelty_free: false,
    vegan: false,
    instructions: "Apply a pea-sized amount to clean skin at night. Start with 2-3 times per week.",
    benefits: [
      "Reduces fine lines and wrinkles",
      "Improves skin texture",
      "Unclogs pores",
      "Stimulates collagen production"
    ],
    warnings: [
      "Use only at night",
      "Always wear sunscreen during the day",
      "Start slowly to avoid irritation",
      "Avoid using with other exfoliants"
    ],
    price_usd: 24.99,
    purchase_link: "https://www.neutrogena.com/face/anti-aging/rapid-wrinkle-repair-regenerating-cream",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
  },
  {
    name: "SPF 50+ Sunscreen",
    brand: "La Roche-Posay",
    type: "sunscreen",
    gender: "unisex",
    age: 18,
    budget: "medium",
    category: "core",
    use_time: ["morning"],
    frequency: "daily",
    skin_types: ["dry", "normal", "combination", "oily", "sensitive"], // Changed from "all" to specific types
    skin_concerns: ["sun damage", "hyperpigmentation"],
    ingredients: [
      {
        name: "Zinc Oxide",
        function: "Physical Sunscreen",
        strength: "12%",
        comedogenic_rating: 0,
        irritancy_score: 0,
        compatible_with: ["All ingredients"],
        avoid_with: []
      },
      {
        name: "Titanium Dioxide",
        function: "Physical Sunscreen",
        strength: "5%",
        comedogenic_rating: 0,
        irritancy_score: 0,
        compatible_with: ["All ingredients"],
        avoid_with: []
      }
    ],
    avoid_with: [],
    texture: "lotion",
    comedogenic: false,
    fragrance_free: true,
    alcohol_free: true,
    cruelty_free: true,
    vegan: false,
    instructions: "Apply liberally 15 minutes before sun exposure. Reapply every 2 hours.",
    benefits: [
      "Broad spectrum protection",
      "Water resistant",
      "Non-comedogenic",
      "Suitable for sensitive skin"
    ],
    warnings: [
      "Reapply every 2 hours",
      "Reapply after swimming or sweating",
      "Keep out of eyes"
    ],
    price_usd: 19.99,
    purchase_link: "https://www.laroche-posay.us/anthelios-ultra-light-fluid-facial-sunscreen-spf-50",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
  },
  {
    name: "Hydrating Face Mask",
    brand: "Laneige",
    type: "sleeping mask",
    gender: "unisex",
    age: 20,
    budget: "high",
    category: "hydration",
    use_time: ["night"],
    frequency: "2-3x/week",
    skin_types: ["dry", "normal", "combination"],
    skin_concerns: ["dehydration", "dullness"],
    ingredients: [
      {
        name: "Hyaluronic Acid",
        function: "Hydrator",
        strength: "Multiple weights",
        comedogenic_rating: 0,
        irritancy_score: 0,
        compatible_with: ["All ingredients"],
        avoid_with: []
      },
      {
        name: "Ceramides",
        function: "Barrier Repair",
        strength: "3 essential ceramides",
        comedogenic_rating: 0,
        irritancy_score: 0,
        compatible_with: ["All ingredients"],
        avoid_with: []
      }
    ],
    avoid_with: [],
    texture: "gel",
    comedogenic: false,
    fragrance_free: false,
    alcohol_free: true,
    cruelty_free: false,
    vegan: false,
    instructions: "Apply a thin layer to clean skin before bed. Leave on overnight and rinse in the morning.",
    benefits: [
      "Intense hydration",
      "Improves skin texture",
      "Reduces fine lines",
      "Brightens complexion"
    ],
    warnings: [
      "Contains fragrance",
      "Use only at night",
      "Avoid if sensitive to fragrance"
    ],
    price_usd: 34.00,
    purchase_link: "https://www.laneige.com/us/sleeping-mask/water-sleeping-mask",
    image_url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop"
  }
]

async function addSampleProducts() {
  console.log('Adding sample products to database...')
  
  let successCount = 0
  let errorCount = 0
  
  try {
    for (const product of sampleProducts) {
      try {
        console.log(`\n🔄 Processing: ${product.name}...`)
        
        // Transform the data to match Prisma schema with proper enum mapping
        const productData = {
          name: product.name,
          brand: product.brand,
          type: mapProductType(product.type),
          gender: mapGender(product.gender),
          age: product.age,
          budget: mapBudgetRange(product.budget),
          category: mapCategory(product.category),
          useTime: mapUseTime(product.use_time),
          frequency: mapFrequency(product.frequency),
          skinTypes: mapSkinTypes(product.skin_types),
          skinConcerns: mapSkinConcerns(product.skin_concerns),
          ingredients: product.ingredients,
          avoidWith: product.avoid_with,
          texture: mapTexture(product.texture),
          comedogenic: product.comedogenic,
          fragranceFree: product.fragrance_free,
          alcoholFree: product.alcohol_free,
          crueltyFree: product.cruelty_free,
          vegan: product.vegan,
          instructions: product.instructions,
          benefits: product.benefits,
          warnings: product.warnings,
          priceUsd: product.price_usd,
          purchaseLink: product.purchase_link,
          imageUrl: product.image_url
        }

        console.log(`✅ Mapped enums for ${product.name}:`)
        console.log(`   Type: ${product.type} → ${productData.type}`)
        console.log(`   Gender: ${product.gender} → ${productData.gender}`)
        console.log(`   Budget: ${product.budget} → ${productData.budget}`)
        console.log(`   Category: ${product.category} → ${productData.category}`)
        console.log(`   Frequency: ${product.frequency} → ${productData.frequency}`)
        console.log(`   Texture: ${product.texture} → ${productData.texture}`)

        const createdProduct = await prisma.product.create({
          data: productData
        })

        console.log(`✅ Added: ${createdProduct.name} (${createdProduct.brand})`)
        successCount++
        
      } catch (error) {
        console.error(`❌ Error adding ${product.name}:`, error.message)
        errorCount++
      }
    }

    console.log('\n🎉 Sample products processing complete!')
    console.log(`✅ Successfully added: ${successCount} products`)
    if (errorCount > 0) {
      console.log(`❌ Failed to add: ${errorCount} products`)
    }
    console.log('You can now view them in the admin panel under Products.')
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
addSampleProducts()
