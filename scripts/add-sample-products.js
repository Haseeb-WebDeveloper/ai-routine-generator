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

const mapSkinTypes = (skinTypes) => {
  const skinTypeMap = {
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

const mapSkinConcerns = (skinConcerns) => {
  const skinConcernMap = {
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

const mapTexture = (texture) => {
  const textureMap = {
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

const mapAgeRange = (age) => {
  if (age >= 0 && age <= 1) return 'AGE_0_1'
  if (age >= 1 && age <= 3) return 'AGE_1_3'
  if (age >= 4 && age <= 12) return 'AGE_4_12'
  if (age >= 13 && age <= 17) return 'AGE_13_17'
  if (age >= 18 && age <= 25) return 'AGE_18_25'
  if (age >= 26 && age <= 35) return 'AGE_26_35'
  if (age >= 36 && age <= 45) return 'AGE_36_45'
  if (age >= 46 && age <= 60) return 'AGE_46_60'
  if (age >= 60) return 'AGE_60_PLUS'
  
  return 'AGE_18_25' // Default fallback
}

const comprehensiveProducts = [
  // CORE CATEGORY - Essential daily products
  {
    name: "Gentle Daily Cleanser",
    brand: "CeraVe",
    type: "cleanser",
    gender: "unisex",
    age: "18-25",
    budget: "budgetFriendly",
    category: "core",
    use_time: ["morning", "night"],
    skin_types: ["dry", "normal", "sensitive"],
    skin_concerns: ["dehydration", "redness"],
    ingredients: [
      { name: "Ceramides", function: "Barrier Repair" },
      { name: "Hyaluronic Acid", function: "Hydrator" }
    ],
    texture: "foam",
    fragrance_free: true,
    alcohol_free: true,
    instructions: "Apply to damp skin, gently massage in circular motions, rinse thoroughly with lukewarm water.",
    price: 14.99,
    purchase_link: "https://www.cerave.com/cleanser/facial-cleansers/hydrating-facial-cleanser",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
  },
  {
    name: "SPF 50+ Sunscreen",
    brand: "La Roche-Posay",
    type: "sunscreen",
    gender: "unisex",
    age: "18-25",
    budget: "midRange",
    category: "core",
    use_time: ["morning"],
    skin_types: ["dry", "normal", "combination", "oily", "sensitive"],
    skin_concerns: ["sun_damage", "hyperpigmentation"],
    ingredients: [
      { name: "Zinc Oxide", function: "Physical Sunscreen" },
      { name: "Titanium Dioxide", function: "Physical Sunscreen" }
    ],
    texture: "lotion",
    fragrance_free: true,
    alcohol_free: true,
    instructions: "Apply liberally 15 minutes before sun exposure. Reapply every 2 hours.",
    price: 19.99,
    purchase_link: "https://www.laroche-posay.us/anthelios-ultra-light-fluid-facial-sunscreen-spf-50",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
  },
  {
    name: "Daily Moisturizer",
    brand: "Neutrogena",
    type: "moisturizer",
    gender: "unisex",
    age: "18-25",
    budget: "budgetFriendly",
    category: "core",
    use_time: ["morning", "night"],
    skin_types: ["dry", "normal", "combination"],
    skin_concerns: ["dehydration", "dryness"],
    ingredients: [
      { name: "Glycerin", function: "Humectant" },
      { name: "Dimethicone", function: "Emollient" }
    ],
    texture: "lotion",
    fragrance_free: true,
    alcohol_free: true,
    instructions: "Apply to clean skin morning and night. Use a dime-sized amount for face and neck.",
    price: 12.99,
    purchase_link: "https://www.neutrogena.com/face/moisturizers/hydro-boost-water-gel",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
  },

  // TREATMENT CATEGORY - Targeted solutions
  {
    name: "Vitamin C Brightening Serum",
    brand: "The Ordinary",
    type: "serum",
    gender: "unisex",
    age: "26-35",
    budget: "midRange",
    category: "treatment",
    use_time: ["morning"],
    skin_types: ["normal", "combination", "oily"],
    skin_concerns: ["dullness", "hyperpigmentation", "fine_lines"],
    ingredients: [
      { name: "Ascorbic Acid", function: "Antioxidant" },
      { name: "Alpha Arbutin", function: "Brightener" }
    ],
    texture: "gel",
    fragrance_free: true,
    alcohol_free: false,
    instructions: "Apply 4-5 drops to clean, dry skin in the morning. Follow with sunscreen.",
    price: 12.90,
    purchase_link: "https://theordinary.com/product/rdn-vitamin-c-suspension-23pct-30ml",
    image_url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop"
  },
  {
    name: "Retinol Night Cream",
    brand: "Neutrogena",
    type: "retinoid",
    gender: "unisex",
    age: "26-35",
    budget: "midRange",
    category: "treatment",
    use_time: ["night"],
    skin_types: ["normal", "combination", "oily"],
    skin_concerns: ["fine_lines", "acne", "uneven_texture"],
    ingredients: [
      { name: "Retinol", function: "Cell Turnover" },
      { name: "Hyaluronic Acid", function: "Hydrator" }
    ],
    texture: "cream",
    fragrance_free: true,
    alcohol_free: true,
    instructions: "Apply a pea-sized amount to clean skin at night. Start with 2-3 times per week.",
    price: 24.99,
    purchase_link: "https://www.neutrogena.com/face/anti-aging/rapid-wrinkle-repair-regenerating-cream",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
  },
  {
    name: "Niacinamide Serum",
    brand: "The Ordinary",
    type: "serum",
    gender: "unisex",
    age: "18-25",
    budget: "budgetFriendly",
    category: "treatment",
    use_time: ["morning", "night"],
    skin_types: ["oily", "combination", "acne_prone"],
    skin_concerns: ["acne", "pores", "oiliness"],
    ingredients: [
      { name: "Niacinamide", function: "Oil Control" },
      { name: "Zinc PCA", function: "Sebum Regulation" }
    ],
    texture: "gel",
    fragrance_free: true,
    alcohol_free: true,
    instructions: "Apply 2-3 drops to clean skin. Can be used morning and night.",
    price: 8.90,
    purchase_link: "https://theordinary.com/product/rdn-niacinamide-10pct-zinc-1pct-30ml",
    image_url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop"
  },
  {
    name: "Peptide Complex Serum",
    brand: "The Inkey List",
    type: "serum",
    gender: "unisex",
    age: "36-45",
    budget: "midRange",
    category: "treatment",
    use_time: ["morning", "night"],
    skin_types: ["mature", "dry", "normal"],
    skin_concerns: ["fine_lines", "wrinkles", "dehydration"],
    ingredients: [
      { name: "Matrixyl 3000", function: "Collagen Stimulation" },
      { name: "Hyaluronic Acid", function: "Hydration" }
    ],
    texture: "gel",
    fragrance_free: true,
    alcohol_free: true,
    instructions: "Apply 2-3 drops to clean skin. Use morning and night for best results.",
    price: 16.99,
    purchase_link: "https://theinkeylist.com/products/peptide-moisturizer",
    image_url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop"
  },

  // HYDRATION CATEGORY - Moisture-focused products
  {
    name: "Hydrating Face Mask",
    brand: "Laneige",
    type: "sleepingMask",
    gender: "unisex",
    age: "18-25",
    budget: "Premium",
    category: "hydration",
    use_time: ["night"],
    skin_types: ["dry", "normal", "combination"],
    skin_concerns: ["dehydration", "dullness"],
    ingredients: [
      { name: "Hyaluronic Acid", function: "Hydrator" },
      { name: "Ceramides", function: "Barrier Repair" }
    ],
    texture: "mask",
    fragrance_free: false,
    alcohol_free: true,
    instructions: "Apply a thin layer to clean skin before bed. Leave on overnight and rinse in the morning.",
    price: 34.00,
    purchase_link: "https://www.laneige.com/us/sleeping-mask/water-sleeping-mask",
    image_url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop"
  },
  {
    name: "Hyaluronic Acid Serum",
    brand: "The Ordinary",
    type: "serum",
    gender: "unisex",
    age: "18-25",
    budget: "budgetFriendly",
    category: "hydration",
    use_time: ["morning", "night"],
    skin_types: ["dry", "dehydrated", "normal", "sensitive"],
    skin_concerns: ["dehydration", "dryness"],
    ingredients: [
      { name: "Hyaluronic Acid", function: "Hydrator" },
      { name: "B5", function: "Skin Repair" }
    ],
    texture: "gel",
    fragrance_free: true,
    alcohol_free: true,
    instructions: "Apply 2-3 drops to damp skin. Can be used morning and night.",
    price: 7.90,
    purchase_link: "https://theordinary.com/product/rdn-hyaluronic-acid-2pct-b5-30ml",
    image_url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop"
  },
  {
    name: "Intensive Moisture Cream",
    brand: "First Aid Beauty",
    type: "moisturizer",
    gender: "unisex",
    age: "26-35",
    budget: "midRange",
    category: "hydration",
    use_time: ["morning", "night"],
    skin_types: ["dry", "dehydrated", "sensitive"],
    skin_concerns: ["dehydration", "dryness", "sensitivity"],
    ingredients: [
      { name: "Colloidal Oatmeal", function: "Soothing" },
      { name: "Ceramides", function: "Barrier Repair" }
    ],
    texture: "cream",
    fragrance_free: true,
    alcohol_free: true,
    instructions: "Apply liberally to clean skin. Use morning and night for dry skin.",
    price: 28.00,
    purchase_link: "https://firstaidbeauty.com/products/ultra-repair-cream",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
  },

  // SPECIAL CATEGORY - Targeted treatments
  {
    name: "Clay Detox Mask",
    brand: "Origins",
    type: "clayMask",
    gender: "unisex",
    age: "18-25",
    budget: "midRange",
    category: "special",
    use_time: ["night"],
    skin_types: ["oily", "combination", "acne_prone"],
    skin_concerns: ["acne", "blackheads", "pores"],
    ingredients: [
      { name: "White China Clay", function: "Oil Absorption" },
      { name: "Charcoal", function: "Detoxification" }
    ],
    texture: "mask",
    fragrance_free: false,
    alcohol_free: true,
    instructions: "Apply to clean skin, leave on for 10 minutes, then rinse thoroughly.",
    price: 26.00,
    purchase_link: "https://www.origins.com/product/clear-improvement-active-charcoal-mask",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
  },
  {
    name: "Chemical Exfoliant",
    brand: "Paula's Choice",
    type: "exfoliant",
    gender: "unisex",
    age: "26-35",
    budget: "midRange",
    category: "special",
    use_time: ["night"],
    skin_types: ["normal", "combination", "oily"],
    skin_concerns: ["uneven_texture", "blackheads", "pores"],
    ingredients: [
      { name: "Salicylic Acid", function: "BHA Exfoliant" },
      { name: "Willow Bark", function: "Natural Exfoliant" }
    ],
    texture: "lotion",
    fragrance_free: true,
    alcohol_free: true,
    instructions: "Apply to clean skin with a cotton pad. Use 2-3 times per week.",
    price: 32.00,
    purchase_link: "https://www.paulaschoice.com/skin-perfecting-2-bha-liquid-exfoliant",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
  },
  {
    name: "Spot Treatment",
    brand: "Murad",
    type: "spotTreatment",
    gender: "unisex",
    age: "18-25",
    budget: "Premium",
    category: "special",
    use_time: ["night"],
    skin_types: ["acne_prone", "oily", "combination"],
    skin_concerns: ["acne", "blackheads"],
    ingredients: [
      { name: "Salicylic Acid", function: "BHA Treatment" },
      { name: "Sulfur", function: "Antibacterial" }
    ],
    texture: "cream",
    fragrance_free: true,
    alcohol_free: true,
    instructions: "Apply directly to blemishes. Use only at night.",
    price: 22.00,
    purchase_link: "https://www.murad.com/product/rapid-relief-acne-treatment",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
  },

  // OPTIONAL CATEGORY - Luxury and extras
  {
    name: "Face Oil Blend",
    brand: "Sunday Riley",
    type: "faceOil",
    gender: "unisex",
    age: "36-45",
    budget: "Premium",
    category: "optional",
    use_time: ["night"],
    skin_types: ["dry", "mature", "normal"],
    skin_concerns: ["fine_lines", "dehydration", "dullness"],
    ingredients: [
      { name: "Jojoba Oil", function: "Moisturizing" },
      { name: "Rosehip Oil", function: "Anti-aging" }
    ],
    texture: "oil",
    fragrance_free: false,
    alcohol_free: true,
    instructions: "Apply 2-3 drops to clean skin at night. Can be mixed with moisturizer.",
    price: 65.00,
    purchase_link: "https://sundayriley.com/products/juno-anti-oxidant-face-oil",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
  },
  {
    name: "Eye Cream",
    brand: "Kiehl's",
    type: "eyeCream",
    gender: "unisex",
    age: "26-35",
    budget: "Premium",
    category: "optional",
    use_time: ["morning", "night"],
    skin_types: ["normal", "dry", "mature"],
    skin_concerns: ["dark_circles", "puffiness", "fine_lines"],
    ingredients: [
      { name: "Avocado Oil", function: "Moisturizing" },
      { name: "Caffeine", function: "Depuffing" }
    ],
    texture: "cream",
    fragrance_free: true,
    alcohol_free: true,
    instructions: "Apply a small amount around the eye area morning and night.",
    price: 38.00,
    purchase_link: "https://www.kiehls.com/eye-care/creamy-eye-treatment-with-avocado",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
  },
  {
    name: "Lip Treatment",
    brand: "Laneige",
    type: "lipCare",
    gender: "unisex",
    age: "18-25",
    budget: "midRange",
    category: "optional",
    use_time: ["night"],
    skin_types: ["all"],
    skin_concerns: ["dryness"],
    ingredients: [
      { name: "Hyaluronic Acid", function: "Hydration" },
      { name: "Shea Butter", function: "Moisturizing" }
    ],
    texture: "balm",
    fragrance_free: false,
    alcohol_free: true,
    instructions: "Apply to lips before bed. Leave on overnight for intense hydration.",
    price: 18.00,
    purchase_link: "https://www.laneige.com/us/lip-care/lip-sleeping-mask",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop"
  },

]

async function addComprehensiveProducts() {
  console.log('🛍️  Adding comprehensive product collection...')
  
  let successCount = 0
  let errorCount = 0
  
  try {
    for (const product of comprehensiveProducts) {
      try {
        console.log(`\n🔄 Processing: ${product.name}...`)
        
        // Transform the data to match Prisma schema with proper enum mapping
        const productData = {
          name: product.name,
          brand: product.brand,
          type: mapProductType(product.type),
          gender: mapGender(product.gender),
          age: mapAgeRange(parseInt(product.age.split('-')[0])),
          budget: mapBudgetRange(product.budget),
          category: mapCategory(product.category),
          useTime: mapUseTime(product.use_time),
          skinTypes: mapSkinTypes(product.skin_types),
          skinConcerns: mapSkinConcerns(product.skin_concerns),
          ingredients: product.ingredients,
          texture: mapTexture(product.texture),
          fragranceFree: product.fragrance_free,
          alcoholFree: product.alcohol_free,
          instructions: product.instructions,
          price: product.price,
          purchaseLink: product.purchase_link,
          imageUrl: product.image_url
        }

        console.log(`✅ Mapped enums for ${product.name}:`)
        console.log(`   Type: ${product.type} → ${productData.type}`)
        console.log(`   Gender: ${product.gender} → ${productData.gender}`)
        console.log(`   Budget: ${product.budget} → ${productData.budget}`)
        console.log(`   Category: ${product.category} → ${productData.category}`)
        console.log(`   Texture: ${product.texture} → ${productData.texture}`)

        const createdProduct = await prisma.product.create({
          data: productData
        })

        console.log(`✅ Added: ${createdProduct.name} (${createdProduct.brand})`)
        successCount++
        
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Product "${product.name}" already exists, skipping...`)
        } else {
          console.error(`❌ Error adding ${product.name}:`, error.message)
          errorCount++
        }
      }
    }

    console.log('\n🎉 Comprehensive products processing complete!')
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
addComprehensiveProducts()
