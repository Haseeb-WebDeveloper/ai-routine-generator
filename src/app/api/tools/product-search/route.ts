import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  mapToPrismaSkinTypes,
  mapToPrismaSkinConcerns,
  mapToPrismaBudgetRange,
  mapToPrismaGender,
  PrismaGender
} from '@/types/prisma-enums'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { skinType, skinConcerns, budget, gender } = body

    // Build Prisma query with type-safe enum mapping
    let whereClause: Record<string, any> = {}
    let orderBy: Array<Record<string, 'asc' | 'desc'>> = [
      { popularityScore: 'desc' },
      { rating: 'desc' }
    ]

    if (skinType) {
      try {
        const mappedSkinType = mapToPrismaSkinTypes([skinType])
        whereClause.skinTypes = { hasSome: mappedSkinType }
      } catch (error) {
        console.warn(`[API] Invalid skin type "${skinType}", skipping skin type filter`)
      }
    }

    if (skinConcerns && skinConcerns.length > 0) {
      try {
        const mappedSkinConcerns = mapToPrismaSkinConcerns(skinConcerns)
        whereClause.skinConcerns = { hasSome: mappedSkinConcerns }
      } catch (error) {
        console.warn(`[API] Invalid skin concerns "${skinConcerns}", skipping skin concerns filter`)
      }
    }

    // if (budget) {
    //   try {
    //     const mappedBudget = mapToPrismaBudgetRange(budget)
    //     const filters = [mappedBudget]
    //     if (budget === "low") {
    //       filters.push(mapToPrismaBudgetRange("medium"))
    //     }
    //     whereClause.budget = { in: filters }
    //   } catch (error) {
    //     console.warn(`[API] Invalid budget "${budget}", skipping budget filter`)
    //   }
    // }

    if (gender) {
      try {
        const mappedGender = mapToPrismaGender(gender)
        whereClause.gender = { in: [mappedGender, "UNISEX" as PrismaGender] }
      } catch (error) {
        console.warn(`[API] Invalid gender "${gender}", skipping gender filter`)
      }
    }

    let data = await prisma.product.findMany({
      where: whereClause,
      orderBy: orderBy,
      take: 12
    })

    // Fallbacks to avoid empty results
    if (!data || data.length === 0) {
      console.log("[API] No products found with filters, falling back to top overall products")
      data = await prisma.product.findMany({
        orderBy: orderBy,
        take: 8
      })
    }

    console.log(`[API] Found ${data.length} products`)

    const candidates = data.map((p) => ({
      name: p.name,
      brand: p.brand,
      type: p.type,
      price: p.priceUsd ? Number(p.priceUsd) : null,
      link: p.purchaseLink,
    }))

    return NextResponse.json({ 
      success: true, 
      products: candidates,
      count: candidates.length
    })

  } catch (error) {
    console.error('[API] Product search error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
