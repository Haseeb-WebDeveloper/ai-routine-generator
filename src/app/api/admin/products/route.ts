import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Ingredient, ProductCreateData } from '@/types/product'
import {
  mapToPrismaProductType,
  mapToPrismaGender,
  mapToPrismaBudgetRange,
  mapToPrismaCategory,
  mapToPrismaUseTime,
  mapToPrismaFrequency,
  mapToPrismaSkinTypes,
  mapToPrismaSkinConcerns,
  mapToPrismaTexture
} from '@/types/prisma-enums'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match frontend expectations
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      type: product.type,
      gender: product.gender,
      age: product.age,
      budget: product.budget,
      category: product.category,
      use_time: product.useTime,
      frequency: product.frequency,
      skin_types: product.skinTypes,
      skin_concerns: product.skinConcerns,
      ingredients: product.ingredients,
      avoid_with: product.avoidWith,
      texture: product.texture,
      comedogenic: product.comedogenic,
      fragrance_free: product.fragranceFree,
      alcohol_free: product.alcoholFree,
      cruelty_free: product.crueltyFree,
      vegan: product.vegan,
      instructions: product.instructions,
      benefits: product.benefits,
      warnings: product.warnings,
      price_usd: product.priceUsd,
      purchase_link: product.purchaseLink,
      image_url: product.imageUrl,
      popularity_score: product.popularityScore,
      rating: product.rating,
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString()
    }))

    return NextResponse.json({ products: transformedProducts })
  } catch (error) {
    console.error('Error in products GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ProductCreateData = await request.json()

    // Validate required fields
    if (!body.name || !body.brand || !body.type) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, brand, type' 
      }, { status: 400 })
    }

    // Insert the product
    const product = await prisma.product.create({
      data: {
        name: body.name,
        brand: body.brand,
        type: mapToPrismaProductType(body.type),
        gender: mapToPrismaGender(body.gender),
        age: body.age,
        budget: mapToPrismaBudgetRange(body.budget),
        category: mapToPrismaCategory(body.category),
        useTime: mapToPrismaUseTime(body.use_time),
        frequency: mapToPrismaFrequency(body.frequency),
        skinTypes: mapToPrismaSkinTypes(body.skin_types),
        skinConcerns: mapToPrismaSkinConcerns(body.skin_concerns),
        ingredients: body.ingredients as any,
        avoidWith: body.avoid_with as any,
        texture: mapToPrismaTexture(body.texture),
        comedogenic: body.comedogenic,
        fragranceFree: body.fragrance_free,
        alcoholFree: body.alcohol_free,
        crueltyFree: body.cruelty_free,
        vegan: body.vegan,
        instructions: body.instructions,
        benefits: body.benefits,
        warnings: body.warnings,
        priceUsd: body.price_usd,
        purchaseLink: body.purchase_link,
        imageUrl: body.image_url
      }
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error in products POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
