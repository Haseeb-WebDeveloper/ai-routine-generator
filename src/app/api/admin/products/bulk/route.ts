import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { IProduct } from '@/types/product'
import { 
  mapToPrismaProductType, 
  mapToPrismaGender, 
  mapToPrismaBudgetRange,
  mapToPrismaCategory,
  mapToPrismaUseTime,
  mapToPrismaSkinTypes,
  mapToPrismaSkinConcerns,
  mapToPrismaTexture,
  mapToPrismaAgeRange,
} from '@/types/prisma-enums'

export async function POST(req: NextRequest) {
  try {
    // Check admin authentication
    // TODO: Add proper admin authentication check

    const { products } = await req.json() as { products: IProduct[] }

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No valid products provided' }, { status: 400 })
    }

    // Process each product
    const results = await Promise.all(
      products.map(async (product) => {
        try {
          // Map frontend types to Prisma types
          const productData = {
            name: product.name,
            brand: product.brand,
            type: mapToPrismaProductType(product.type),
            gender: mapToPrismaGender(product.gender),
            age: product.age.map(age => mapToPrismaAgeRange(age)),
            budget: mapToPrismaBudgetRange(product.budget),
            category: mapToPrismaCategory(product.category),
            useTime: mapToPrismaUseTime(product.use_time), // Match schema field name (camelCase)
            skinTypes: mapToPrismaSkinTypes(product.skin_types), // Match schema field name (camelCase)
            skinConcerns: mapToPrismaSkinConcerns(product.skin_concerns), // Match schema field name (camelCase)
            ingredients: product.ingredients, // Store as JSON directly
            texture: mapToPrismaTexture(product.texture),
            fragranceFree: product.fragrance_free, // Match schema field name (camelCase)
            alcoholFree: product.alcohol_free, // Match schema field name (camelCase)
            instructions: product.instructions,
            price: product.price,
            purchaseLink: product.purchase_link || '', // Match schema field name (camelCase)
            imageUrl: product.image_url || '' // Match schema field name (camelCase)
          }

          // Create the product in the database
          const createdProduct = await prisma.product.create({
            data: productData as any
          })

          return { success: true, id: createdProduct.id }
        } catch (error) {
          console.error('Error creating product:', error)
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error',
            productName: product.name
          }
        }
      })
    )

    // Count successes and failures
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    const failedProducts = results
      .filter(r => !r.success)
      .map(r => ({ name: (r as any).productName, error: (r as any).error }))

    return NextResponse.json({
      added: successful,
      failed,
      failedProducts,
      total: products.length
    })
  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
