import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { Role, OrderStatus } from '@prisma/client'

const ITEMS_PER_PAGE = 15

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const sort = searchParams.get('sort') || 'created_desc'

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    // Order by
    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'created_desc': orderBy = { createdAt: 'desc' }; break
      case 'created_asc': orderBy = { createdAt: 'asc' }; break
      case 'total_desc': orderBy = { total: 'desc' }; break
      case 'total_asc': orderBy = { total: 'asc' }; break
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy,
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          address: true,
          items: {
            include: {
              product: { select: { name: true, images: true, brand: true } },
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      orders,
      total,
      perPage: ITEMS_PER_PAGE,
      page,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    })
  } catch (error) {
    console.error('Admin Orders GET Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
