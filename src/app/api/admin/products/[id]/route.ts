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
  mapToPrismaAgeRange
} from '@/types/prisma-enums'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Transform the data to match frontend expectations
    const transformedProduct = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      type: product.type,
      gender: product.gender,
      age: product.age,
      budget: product.budget,
      category: product.category,
      use_time: product.useTime,
      skin_types: product.skinTypes,
      skin_concerns: product.skinConcerns,
      ingredients: product.ingredients,
      texture: product.texture,
      fragrance_free: product.fragranceFree,
      alcohol_free: product.alcoholFree,
      instructions: product.instructions,
      price: product.price,
      purchase_link: product.purchaseLink,
      image_url: product.imageUrl,
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString()
    }

    return NextResponse.json({ product: transformedProduct })
  } catch (error) {
    console.error('Error in product GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: IProduct = await request.json()

    // Validate required fields
    if (!body.name || !body.brand || !body.type) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, brand, type' 
      }, { status: 400 })
    }

    // Update the product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        brand: body.brand,
        type: mapToPrismaProductType(body.type),
        gender: mapToPrismaGender(body.gender),
        age: mapToPrismaAgeRange(body.age),
        budget: mapToPrismaBudgetRange(body.budget),
        category: mapToPrismaCategory(body.category),
        useTime: mapToPrismaUseTime(body.use_time),
        skinTypes: mapToPrismaSkinTypes(body.skin_types),
        skinConcerns: mapToPrismaSkinConcerns(body.skin_concerns),
        ingredients: body.ingredients as any,
        texture: mapToPrismaTexture(body.texture),
        fragranceFree: body.fragrance_free,
        alcoholFree: body.alcohol_free,
        instructions: body.instructions,
        price: body.price,
        purchaseLink: body.purchase_link,
        imageUrl: body.image_url
      }
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error in product PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error in product DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
