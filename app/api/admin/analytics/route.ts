import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Calculate date ranges
    const startOfThisMonth = new Date(currentYear, currentMonth, 1)
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1)
    const endOfLastMonth = new Date(currentYear, currentMonth, 0)

    // 1. Top sản phẩm bán chạy (từ đầu tháng đến giờ)
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          status: 'DELIVERED',
          createdAt: { gte: startOfThisMonth },
        },
      },
      _sum: { quantity: true, price: true },
      _count: { productId: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    })

    // Get product details
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, images: true, brand: true },
        })
        return {
          productId: item.productId,
          productName: product?.name || 'Unknown',
          productImage: product?.images?.[0] || null,
          brand: product?.brand || null,
          totalQuantity: item._sum.quantity || 0,
          totalRevenue: item._sum.price || 0,
        }
      })
    )

    // 2. Top khách hàng VIP (tổng chi tiêu từ đầu tháng đến giờ)
    const topCustomers = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        status: 'DELIVERED',
        createdAt: { gte: startOfThisMonth },
      },
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    })

    // Get customer details
    const topCustomersWithDetails = await Promise.all(
      topCustomers.map(async (item) => {
        const user = await prisma.user.findUnique({
          where: { id: item.userId },
          select: { id: true, name: true, email: true, image: true },
        })
        return {
          userId: item.userId,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || '',
          userImage: user?.image || null,
          totalSpent: item._sum.total || 0,
          orderCount: item._count.id,
        }
      })
    )

    // 3. So sánh doanh thu tháng này vs tháng trước
    const [thisMonthRevenue, lastMonthRevenue] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: 'DELIVERED',
          createdAt: {
            gte: startOfThisMonth,
            lt: now,
          },
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          status: 'DELIVERED',
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        _sum: { total: true },
      }),
    ])

    const thisMonthTotal = thisMonthRevenue._sum.total || 0
    const lastMonthTotal = lastMonthRevenue._sum.total || 0

    let percentageChange = 0
    if (lastMonthTotal > 0) {
      percentageChange = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
    } else if (thisMonthTotal > 0) {
      percentageChange = 100
    }

    // Get order counts for comparison
    const [thisMonthOrders, lastMonthOrders] = await Promise.all([
      prisma.order.count({
        where: {
          status: 'DELIVERED',
          createdAt: { gte: startOfThisMonth, lt: now },
        },
      }),
      prisma.order.count({
        where: {
          status: 'DELIVERED',
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
    ])

    return NextResponse.json({
      topProducts: topProductsWithDetails,
      topCustomers: topCustomersWithDetails,
      revenueComparison: {
        thisMonth: thisMonthTotal,
        lastMonth: lastMonthTotal,
        percentageChange: Math.round(percentageChange * 10) / 10,
        thisMonthOrders,
        lastMonthOrders,
      },
    })
  } catch (error) {
    console.error('Admin Analytics GET Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
