const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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
    skin_types: ["all"],
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
  
  try {
    for (const product of sampleProducts) {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()

      if (error) {
        console.error(`Error adding ${product.name}:`, error)
      } else {
        console.log(`✅ Added: ${product.name} (${product.brand})`)
      }
    }

    console.log('\n🎉 Sample products added successfully!')
    console.log('You can now view them in the admin panel under Products.')
    
  } catch (error) {
    console.error('Error adding sample products:', error)
  }
}

// Run the script
addSampleProducts()
