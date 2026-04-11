import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/products/related
 * Returns products related to the current product based on brand + shoeType
 * Instead of the old category-based approach
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentProductId = searchParams.get('currentProductId')
    const brand = searchParams.get('brand')
    const shoeType = searchParams.get('shoeType')

    // Must have either brand+shoeType or currentProductId
    if (!currentProductId && (!brand || !shoeType)) {
      return NextResponse.json(
        { error: 'Missing required parameters: either currentProductId or (brand + shoeType)' },
        { status: 400 }
      )
    }

    let relatedBrand = brand
    let relatedShoeType = shoeType

    // If only currentProductId is provided, get brand + shoeType from it
    if (currentProductId && (!brand || !shoeType)) {
      const currentProduct = await prisma.product.findUnique({
        where: { id: currentProductId },
        select: { brand: true, shoeType: true },
      })

      if (!currentProduct) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      relatedBrand = currentProduct.brand
      relatedShoeType = currentProduct.shoeType
    }

    // Find related products: same brand OR same shoeType, exclude current product
    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: currentProductId || '' },
        OR: [
          { brand: relatedBrand as any },
          { shoeType: relatedShoeType as any },
        ],
        stock: { gt: 0 }, // Only show in-stock products
      },
      take: 8,
      include: {
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: [
        // Prioritize same brand
        { brand: 'asc' },
        // Then by creation date
        { createdAt: 'desc' },
      ],
    })

    // Sort to put same-brand products first
    const sorted = relatedProducts.sort((a, b) => {
      const aSameBrand = a.brand === relatedBrand ? 0 : 1
      const bSameBrand = b.brand === relatedBrand ? 0 : 1
      return aSameBrand - bSameBrand
    })

    return NextResponse.json(sorted)
  } catch (error) {
    console.error('Error fetching related products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
