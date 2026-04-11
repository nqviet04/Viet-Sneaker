/**
 * /api/categories - API endpoint for product categories
 * NOTE: In the new shoe store schema, categories are replaced by:
 *   - Brand (NIKE, ADIDAS, PUMA, NEW_BALANCE, CONVERSE, VANS)
 *   - Gender (MEN, WOMEN, UNISEX)
 *   - ShoeType (RUNNING, CASUAL, BOOTS, etc.)
 * This endpoint returns combined filter options for backward compatibility.
 */
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Brand, Gender, ShoeType } from '@prisma/client'

export async function GET() {
  try {
    // Get unique brands from products
    const brands = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    })

    // Return as "categories" for backward compatibility
    const categories = [
      // Brand categories
      ...brands.map((b) => ({
        id: `brand:${b.brand}`,
        name: b.brand,
        type: 'brand',
      })),
      // Gender categories
      ...Object.values(Gender).map((g) => ({
        id: `gender:${g}`,
        name: g.charAt(0) + g.slice(1).toLowerCase(),
        type: 'gender',
      })),
      // Shoe type categories
      ...Object.values(ShoeType).map((s) => ({
        id: `shoeType:${s}`,
        name: s.charAt(0) + s.slice(1).toLowerCase(),
        type: 'shoeType',
      })),
    ]

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Categories API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
