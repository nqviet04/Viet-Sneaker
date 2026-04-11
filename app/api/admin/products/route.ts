import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

const ITEMS_PER_PAGE = 12

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    console.log('[AdminProducts API] Session:', session?.user?.email, 'Role:', session?.user?.role)
    if (!session?.user || session.user.role !== Role.ADMIN) {
      console.log('[AdminProducts API] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const brand = searchParams.get('brand')
    const gender = searchParams.get('gender')
    const shoeType = searchParams.get('shoeType')
    const stockFilter = searchParams.get('stockFilter') // 'all', 'low-stock', 'out-of-stock'
    const sort = searchParams.get('sort') || 'created_desc'
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '99999999')

    // Build where clause
    const where: any = {
      price: { gte: minPrice, lte: maxPrice },
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (brand) where.brand = brand
    if (gender) where.gender = gender
    if (shoeType) where.shoeType = shoeType

    if (stockFilter === 'low-stock') {
      where.stock = { gt: 0, lte: 10 }
    } else if (stockFilter === 'out-of-stock') {
      where.stock = 0
    }

    // Order by
    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'price_asc': orderBy = { price: 'asc' }; break
      case 'price_desc': orderBy = { price: 'desc' }; break
      case 'name_asc': orderBy = { name: 'asc' }; break
      case 'name_desc': orderBy = { name: 'desc' }; break
      case 'stock_asc': orderBy = { stock: 'asc' }; break
      case 'stock_desc': orderBy = { stock: 'desc' }; break
      case 'created_desc': orderBy = { createdAt: 'desc' }; break
      case 'created_asc': orderBy = { createdAt: 'asc' }; break
    }

    console.log('[AdminProducts API] Sort:', sort, 'Where:', JSON.stringify(where))
    
    // Test raw query
    try {
      const totalRaw = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM "Product"`
      console.log('[AdminProducts API] Raw count:', totalRaw)
    } catch (e) {
      console.log('[AdminProducts API] Raw query error:', e)
    }
    
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        include: {
          _count: { select: { reviews: true } },
        },
      }),
    ])
    console.log('[AdminProducts API] Count result:', total, 'Products:', products.length)

    return NextResponse.json({
      products,
      total,
      perPage: ITEMS_PER_PAGE,
      page,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    })
  } catch (error) {
    console.error('Admin Products GET Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      price,
      images,
      brand,
      sizes,
      colors,
      gender,
      shoeType,
      stock,
      originalPrice,
      sizeStock,
    } = body

    // Validate required fields
    if (!name || !price || !brand || !gender || !shoeType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create product with size stock
    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        images: images || [],
        brand,
        sizes: sizes || [],
        colors: colors || [],
        gender,
        shoeType,
        stock: parseInt(stock) || 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        sizeStock: sizeStock && sizeStock.length > 0 ? {
          create: sizeStock.map((s: { size: string; stock: number }) => ({
            size: s.size,
            stock: parseInt(s.stock) || 0,
          })),
        } : undefined,
      },
      include: { sizeStock: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Admin Products POST Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
