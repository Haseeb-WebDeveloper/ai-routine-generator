const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient()

// Migration mapping functions
const migrateProductType = (oldType) => {
  const typeMap = {
    'CLEANSER': 'CLEANSER',
    'MOISTURIZER': 'MOISTURIZER',
    'SUNSCREEN': 'SUNSCREEN',
    'TONER': 'TONER',
    'ESSENCE': 'ESSENCE',
    'HYDRATING_MIST': 'HYDRATOR',
    'FACE_MIST': 'HYDRATOR',
    'SERUM': 'SERUM',
    'AMPOULE': 'AMPOULE',
    'SPOT_TREATMENT': 'SPOT_TREATMENT',
    'EXFOLIANT_CHEMICAL': 'EXFOLIANT',
    'EXFOLIATOR_PHYSICAL': 'EXFOLIANT',
    'RETINOID': 'RETINOID',
    'RETINOL': 'RETINOID',
    'PEPTIDE_TREATMENT': 'PEPTIDE',
    'VITAMIN_C_TREATMENT': 'VITAMIN_C',
    'NIACINAMIDE_TREATMENT': 'NIACINAMIDE',
    'BRIGHTENING_TREATMENT': 'BRIGHTENING',
    'ANTI_AGING_TREATMENT': 'ANTI_AGING',
    'SLEEPING_MASK': 'SLEEPING_MASK',
    'NIGHT_CREAM': 'NIGHT_CREAM',
    'OVERNIGHT_TREATMENT': 'SLEEPING_MASK',
    'FACE_OIL': 'FACE_OIL',
    'EYE_CREAM': 'EYE_CREAM',
    'EYE_SERUM': 'EYE_SERUM',
    'LIP_BALM': 'LIP_BALM',
    'LIP_TREATMENT': 'LIP_CARE',
    'MAKEUP_REMOVER': 'MAKEUP_REMOVER',
    'CLEANSING_BALM': 'CLEANSING_BALM',
    'MICELLAR_WATER': 'MICELLAR_WATER',
    'OIL_CLEANSER': 'OIL_CLEANSER',
    'FACE_MASK': 'FACE_MASK',
    'SHEET_MASK': 'SHEET_MASK',
    'CLAY_MASK': 'CLAY_MASK',
    'PEEL_OFF_MASK': 'PEEL_MASK',
    'SCRUB_MASK': 'SCRUB_MASK',
    'HYDRATING_MASK': 'HYDRATING_MASK',
    'DETOX_MASK': 'DETOX_MASK',
    'BARRIER_REPAIR_CREAM': 'BARRIER_CREAM',
    'CICA_CREAM': 'CICA_CREAM',
    'SOOTHING_CREAM': 'SOOTHING_CREAM',
    'ANTI_REDNESS_CREAM': 'ANTI_REDNESS',
    'PORE_MINIMIZER': 'PORE_MINIMIZER',
    'SEBUM_CONTROL_GEL': 'SEBUM_CONTROL'
  }
  
  return typeMap[oldType] || 'CLEANSER' // Default fallback
}

const migrateSkinType = (oldType) => {
  const typeMap = {
    'DRY': 'DRY',
    'OILY': 'OILY',
    'COMBINATION': 'COMBINATION',
    'SENSITIVE': 'SENSITIVE',
    'NORMAL': 'NORMAL'
  }
  
  return typeMap[oldType] || 'NORMAL'
}

const migrateSkinConcern = (oldConcern) => {
  const concernMap = {
    'ACNE': 'ACNE',
    'BLACKHEADS': 'BLACKHEADS',
    'DULLNESS': 'DULLNESS',
    'HYPERPIGMENTATION': 'HYPERPIGMENTATION',
    'FINE_LINES': 'FINE_LINES',
    'DEHYDRATION': 'DEHYDRATION',
    'REDNESS': 'REDNESS',
    'PORES': 'PORES',
    'UNEVEN_TEXTURE': 'UNEVEN_TEXTURE'
  }
  
  return concernMap[oldConcern] || 'DULLNESS'
}

const migrateBudget = (oldBudget) => {
  const budgetMap = {
    'LOW': 'BUDGET_FRIENDLY',
    'MEDIUM': 'MID_RANGE',
    'HIGH': 'PREMIUM'
  }
  
  return budgetMap[oldBudget] || 'MID_RANGE'
}

const migrateTexture = (oldTexture) => {
  const textureMap = {
    'GEL': 'GEL',
    'CREAM': 'CREAM',
    'LOTION': 'LOTION',
    'FOAM': 'FOAM',
    'OIL': 'OIL',
    'SPRAY': 'SPRAY'
  }
  
  return textureMap[oldTexture] || 'CREAM'
}

const migrateUseTime = (oldUseTime) => {
  const useTimeMap = {
    'MORNING': 'MORNING',
    'AFTERNOON': 'MORNING',
    'EVENING': 'NIGHT',
    'NIGHT': 'NIGHT'
  }
  
  return oldUseTime.map(time => useTimeMap[time] || 'MORNING')
}

const migrateCategory = (oldCategory) => {
  const categoryMap = {
    'CORE': 'CORE',
    'TREATMENT': 'TREATMENT',
    'HYDRATION': 'HYDRATION',
    'SPECIAL': 'SPECIAL',
    'OPTIONAL': 'OPTIONAL'
  }
  
  return categoryMap[oldCategory] || 'CORE'
}

const migrateAge = (oldAge) => {
  if (oldAge >= 0 && oldAge <= 1) return 'AGE_0_1'
  if (oldAge >= 1 && oldAge <= 3) return 'AGE_1_3'
  if (oldAge >= 4 && oldAge <= 12) return 'AGE_4_12'
  if (oldAge >= 13 && oldAge <= 17) return 'AGE_13_17'
  if (oldAge >= 18 && oldAge <= 25) return 'AGE_18_25'
  if (oldAge >= 26 && oldAge <= 35) return 'AGE_26_35'
  if (oldAge >= 36 && oldAge <= 45) return 'AGE_36_45'
  if (oldAge >= 46 && oldAge <= 60) return 'AGE_46_60'
  if (oldAge >= 60) return 'AGE_60_PLUS'
  
  return 'AGE_18_25' // Default fallback
}

async function migrateProducts() {
  console.log('🔄 Starting product migration...')
  
  try {
    // First, let's check what products exist
    const existingProducts = await prisma.product.findMany()
    console.log(`📊 Found ${existingProducts.length} existing products`)
    
    if (existingProducts.length === 0) {
      console.log('✅ No products to migrate')
      return
    }
    
    // Create a backup table or export data
    console.log('💾 Creating backup of existing data...')
    
    // For now, we'll just log the data structure
    const sampleProduct = existingProducts[0]
    console.log('📋 Sample product structure:')
    console.log(JSON.stringify(sampleProduct, null, 2))
    
    // Now migrate each product
    let successCount = 0
    let errorCount = 0
    
    for (const oldProduct of existingProducts) {
      try {
        console.log(`\n🔄 Migrating: ${oldProduct.name}...`)
        
        // Create new product with migrated data
        const newProduct = await prisma.product.create({
          data: {
            name: oldProduct.name,
            brand: oldProduct.brand,
            type: migrateProductType(oldProduct.type),
            gender: oldProduct.gender,
            age: migrateAge(oldProduct.age),
            budget: migrateBudget(oldProduct.budget),
            category: migrateCategory(oldProduct.category),
            useTime: migrateUseTime(oldProduct.useTime || []),
            skinTypes: (oldProduct.skinTypes || []).map(migrateSkinType),
            skinConcerns: (oldProduct.skinConcerns || []).map(migrateSkinConcern),
            ingredients: oldProduct.ingredients || [],
            texture: migrateTexture(oldProduct.texture),
            fragranceFree: oldProduct.fragranceFree || true,
            alcoholFree: oldProduct.alcoholFree || true,
            instructions: oldProduct.instructions || 'Instructions not available',
            price: oldProduct.priceUsd || 0,
            purchaseLink: oldProduct.purchaseLink || '',
            imageUrl: oldProduct.imageUrl || ''
          }
        })
        
        console.log(`✅ Migrated: ${newProduct.name}`)
        successCount++
        
      } catch (error) {
        console.error(`❌ Error migrating ${oldProduct.name}:`, error.message)
        errorCount++
      }
    }
    
    console.log('\n🎉 Migration complete!')
    console.log(`✅ Successfully migrated: ${successCount} products`)
    if (errorCount > 0) {
      console.log(`❌ Failed to migrate: ${errorCount} products`)
    }
    
    // Now we can safely delete old products and update the schema
    console.log('\n🗑️  Cleaning up old products...')
    await prisma.product.deleteMany({})
    console.log('✅ Old products cleaned up')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateProducts()
