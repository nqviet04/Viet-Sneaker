import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

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
    const roleFilter = searchParams.get('role')
    const sort = searchParams.get('sort') || 'created_desc'

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (roleFilter && roleFilter !== 'all') {
      where.role = roleFilter
    }

    // Order by
    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'created_desc': orderBy = { createdAt: 'desc' }; break
      case 'created_asc': orderBy = { createdAt: 'asc' }; break
      case 'name_asc': orderBy = { name: 'asc' }; break
      case 'email_asc': orderBy = { email: 'asc' }; break
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
          orders: {
            where: { status: 'DELIVERED' },
            select: { total: true },
          },
        },
      }),
    ])

    // Calculate total spent for each user
    const usersWithSpent = users.map((user) => ({
      ...user,
      totalSpent: user.orders.reduce((sum, o) => sum + o.total, 0),
      orders: undefined, // Don't send raw orders array
    }))

    return NextResponse.json({
      users: usersWithSpent,
      total,
      perPage: ITEMS_PER_PAGE,
      page,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    })
  } catch (error) {
    console.error('Admin Users GET Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
