import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Brand, Gender, ShoeType } from '@prisma/client'

const ITEMS_PER_PAGE = 12

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search')
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '10000000') // VND max
    const sort = searchParams.get('sort') || 'created_desc'

    // ==========================================
    // MULTI-SELECT FILTERS FOR SHOE STORE
    // ==========================================
    // brands, sizes, colors are comma-separated multi-select values
    const brandsParam = searchParams.get('brands')
    const sizesParam = searchParams.get('sizes')
    const colorsParam = searchParams.get('colors')
    const gender = searchParams.get('gender')
    const shoeType = searchParams.get('shoeType')
    const inStock = searchParams.get('inStock')

    // Parse multi-select params into arrays
    const selectedBrands = brandsParam
      ? brandsParam.split(',').filter((b) => Object.values(Brand).includes(b as Brand))
      : []
    const selectedSizes = sizesParam ? sizesParam.split(',').filter(Boolean) : []
    const selectedColors = colorsParam ? colorsParam.split(',').map((c) => c.trim()).filter(Boolean) : []

    // Build where clause for filtering
    const where: any = {
      price: { gte: minPrice, lte: maxPrice },
    }

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Filter by brands (multi-select: OR condition)
    if (selectedBrands.length > 0) {
      where.brand = { in: selectedBrands }
    }

    // Filter by gender (single select)
    if (gender && Object.values(Gender).includes(gender as Gender)) {
      where.gender = gender
    }

    // Filter by shoe type (single select)
    if (shoeType && Object.values(ShoeType).includes(shoeType as ShoeType)) {
      where.shoeType = shoeType
    }

    // Filter by stock availability
    if (inStock === 'true') {
      where.stock = { gt: 0 }
    }

    // Filter by sizes (multi-select: OR condition via sizeStock)
    if (selectedSizes.length > 0) {
      where.sizeStock = {
        some: {
          size: { in: selectedSizes },
          stock: { gt: 0 },
        },
      }
    }

    // Filter by colors (multi-select: OR condition)
    if (selectedColors.length > 0) {
      where.colors = {
        hasSome: selectedColors,
      }
    }

    // Build orderBy clause for sorting
    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'name_asc':
        orderBy = { name: 'asc' }
        break
      case 'name_desc':
        orderBy = { name: 'desc' }
        break
      case 'stock_desc':
        orderBy = { stock: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Get total count for pagination
    const total = await prisma.product.count({ where })

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        _count: { select: { reviews: true } },
      },
    })

    // Get unique values for filter dropdowns (only from in-stock products)
    const [brands, sizes] = await Promise.all([
      prisma.product.findMany({
        where: { stock: { gt: 0 } },
        select: { brand: true },
        distinct: ['brand'],
      }),
      prisma.sizeStock.findMany({
        where: { stock: { gt: 0 } },
        select: { size: true },
        distinct: ['size'],
        orderBy: { size: 'asc' },
      }),
    ])

    return NextResponse.json({
      products,
      total,
      perPage: ITEMS_PER_PAGE,
      page,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
      filters: {
        brands: brands.map((b) => b.brand),
        sizes: sizes.map((s) => s.size),
      },
    })
  } catch (error) {
    console.error('Products API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
