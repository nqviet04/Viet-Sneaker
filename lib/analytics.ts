import prisma from '@/lib/prisma'
import { OrderStatus, Role } from '@prisma/client'
import { startOfDay, subDays, format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

// ============================================
// REVENUE & ORDER STATS
// ============================================

export async function getRevenueData(days: number = 30) {
  const endDate = startOfDay(new Date())
  const startDate = subDays(endDate, days)

  const orders = await prisma.order.findMany({
    where: {
      status: OrderStatus.DELIVERED,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Group orders by date and calculate daily revenue
  const dailyRevenue = orders.reduce((acc, order) => {
    const date = format(order.createdAt, 'MMM d')
    acc[date] = (acc[date] || 0) + order.total
    return acc
  }, {} as Record<string, number>)

  // Convert to array format for Recharts
  const data = Object.entries(dailyRevenue).map(([date, revenue]) => ({
    date,
    revenue,
  }))

  return data
}

export async function getOrderStats() {
  const endDate = new Date()
  const startDate = subDays(endDate, 30)

  const orderStats = await prisma.order.groupBy({
    by: ['status'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: true,
  })

  return orderStats.map((stat) => ({
    name: stat.status,
    value: stat._count,
  }))
}

export async function getRecentOrders(limit: number = 5) {
  const orders = await prisma.order.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      total: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  return orders
}

// ============================================
// INVENTORY & STOCK MANAGEMENT
// ============================================

const LOW_STOCK_THRESHOLD = 5 // < 5 pairs = low stock

export async function getInventoryData() {
  const products = await prisma.product.findMany({
    include: {
      sizeStock: {
        orderBy: { size: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    image: p.images[0] || '',
    totalStock: p.stock,
    sizes: p.sizeStock.map((ss) => ({
      size: ss.size,
      stock: ss.stock,
      isLow: ss.stock > 0 && ss.stock <= LOW_STOCK_THRESHOLD,
      isOut: ss.stock === 0,
    })),
    hasLowStock:
      p.sizeStock.some((ss) => ss.stock > 0 && ss.stock <= LOW_STOCK_THRESHOLD) ||
      (p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD && p.sizeStock.length === 0),
    hasOutOfStock:
      p.sizeStock.some((ss) => ss.stock === 0) || p.stock === 0,
  }))
}

export async function getLowStockAlertsDetailed() {
  const products = await prisma.product.findMany({
    include: {
      sizeStock: {
        orderBy: { size: 'asc' },
      },
    },
  })

  // Low stock: size stock between 1 and 5
  const lowStockProducts = products
    .filter((p) =>
      p.sizeStock.some((ss) => ss.stock > 0 && ss.stock <= LOW_STOCK_THRESHOLD) ||
      (p.sizeStock.length === 0 && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD)
    )
    .map((p) => {
      const lowSizes = p.sizeStock
        .filter((ss) => ss.stock > 0 && ss.stock <= LOW_STOCK_THRESHOLD)
        .map((ss) => ({ size: ss.size, stock: ss.stock }))
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        images: p.images,
        totalStock: p.stock,
        lowSizes: lowSizes.length > 0 ? lowSizes : null,
      }
    })
    .sort((a, b) => {
      const aLow = a.lowSizes?.[0]?.stock ?? a.totalStock
      const bLow = b.lowSizes?.[0]?.stock ?? b.totalStock
      return aLow - bLow
    })

  // Out of stock: has sizes with 0 stock
  const outOfStockProducts = products
    .filter((p) => p.sizeStock.some((ss) => ss.stock === 0))
    .map((p) => {
      const outSizes = p.sizeStock
        .filter((ss) => ss.stock === 0)
        .map((ss) => ss.size)
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        images: p.images,
        outSizes,
      }
    })
    .sort((a, b) => (b.outSizes?.length ?? 0) - (a.outSizes?.length ?? 0))

  return { lowStockProducts, outOfStockProducts }
}

// ============================================
// LOW STOCK ALERTS (legacy, keep for compatibility)
// ============================================

export async function getLowStockProducts(limit: number = 10) {
  const products = await prisma.product.findMany({
    where: {
      stock: {
        lte: LOW_STOCK_THRESHOLD,
        gt: 0,
      },
    },
    select: {
      id: true,
      name: true,
      stock: true,
      images: true,
      brand: true,
    },
    orderBy: {
      stock: 'asc',
    },
    take: limit,
  })

  return products
}

export async function getOutOfStockProducts() {
  const products = await prisma.product.findMany({
    where: {
      stock: 0,
    },
    select: {
      id: true,
      name: true,
      stock: true,
      images: true,
      brand: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return products
}

// ============================================
// TOP PRODUCTS
// ============================================

export async function getTopProducts(
  limit: number = 10,
  timeRange: '7d' | '30d' | '90d' | 'all' = '30d'
) {
  let startDate: Date | undefined

  if (timeRange !== 'all') {
    const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30
    startDate = subDays(startOfDay(new Date()), days)
  }

  const orders = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: startDate
      ? {
          order: {
            createdAt: { gte: startDate },
            status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PROCESSING] },
          },
        }
      : {
          order: {
            status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PROCESSING] },
          },
        },
    _sum: {
      quantity: true,
    },
    _count: true,
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take: limit,
  })

  const productIds = orders.map((o) => o.productId)

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      price: true,
      images: true,
      brand: true,
      stock: true,
    },
  })

  const productMap = new Map(products.map((p) => [p.id, p]))

  return orders
    .map((order) => {
      const product = productMap.get(order.productId)
      if (!product) return null
      return {
        ...product,
        totalSold: order._sum.quantity || 0,
        orderCount: order._count,
      }
    })
    .filter(Boolean)
}

// ============================================
// CUSTOMER INSIGHTS
// ============================================

export async function getCustomerInsights() {
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)
  const sixtyDaysAgo = subDays(now, 60)

  const [
    totalCustomers,
    newCustomersThisMonth,
    newCustomersLastMonth,
    totalOrdersDelivered,
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.USER } }),
    prisma.user.count({
      where: {
        role: Role.USER,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.user.count({
      where: {
        role: Role.USER,
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
    prisma.order.count({
      where: { status: OrderStatus.DELIVERED },
    }),
  ])

  const returningCustomers = totalOrdersDelivered - newCustomersThisMonth
  const newVsReturningRate = totalCustomers > 0
    ? ((newCustomersThisMonth / totalCustomers) * 100)
    : 0

  const customerGrowth =
    newCustomersLastMonth > 0
      ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100
      : 0

  return {
    totalCustomers,
    newCustomersThisMonth,
    returningCustomers,
    newVsReturningRate,
    customerGrowth,
  }
}

export async function getCustomerAcquisitionData(days: number = 30) {
  const endDate = startOfDay(new Date())
  const startDate = subDays(endDate, days)

  const users = await prisma.user.findMany({
    where: {
      role: Role.USER,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  const dailyNew = users.reduce((acc, user) => {
    const date = format(user.createdAt, 'MMM d')
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const data = Object.entries(dailyNew).map(([date, count]) => ({
    date,
    customers: count,
  }))

  return data
}

export async function getTopCustomers(limit: number = 10) {
  const customers = await prisma.user.findMany({
    where: { role: Role.USER },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      orders: {
        select: {
          id: true,
          total: true,
          status: true,
        },
      },
    },
    take: limit,
  })

  return customers
    .map((user) => {
      const totalSpent = user.orders
        .filter((o) => o.status === OrderStatus.DELIVERED)
        .reduce((sum, o) => sum + o.total, 0)
      const orderCount = user.orders.length

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        totalSpent,
        orderCount,
      }
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
}

// ============================================
// SALES OVERVIEW (for Reports)
// ============================================

export async function getSalesOverview(
  startDate: Date,
  endDate: Date
) {
  const [totalOrders, totalRevenue, averageOrderValue] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: OrderStatus.DELIVERED,
      },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: OrderStatus.DELIVERED,
      },
      _avg: { total: true },
    }),
  ])

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    averageOrderValue: averageOrderValue._avg.total || 0,
  }
}

export async function getOrdersForExport(
  startDate: Date,
  endDate: Date
) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
      address: true,
      items: {
        include: {
          product: {
            select: { name: true, brand: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return orders
}

export async function getProductsForExport() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      brand: true,
      price: true,
      originalPrice: true,
      stock: true,
      gender: true,
      shoeType: true,
      sizes: true,
      colors: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return products
}

export async function getCustomersForExport() {
  const customers = await prisma.user.findMany({
    where: { role: Role.USER },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      orders: {
        select: { total: true, status: true },
      },
      _count: {
        select: { orders: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    image: c.image,
    createdAt: c.createdAt,
    totalOrders: c._count.orders,
    totalSpent: c.orders
      .filter((o) => o.status === OrderStatus.DELIVERED)
      .reduce((sum, o) => sum + o.total, 0),
  }))
}
