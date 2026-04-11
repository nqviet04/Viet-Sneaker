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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'orders' // orders | products | customers
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    const startDate = startDateParam ? new Date(startDateParam) : new Date(0)
    const endDate = endDateParam ? new Date(endDateParam) : new Date()

    let data: any[] = []
    let headers: string[] = []

    switch (type) {
      case 'orders': {
        const orders = await prisma.order.findMany({
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
          include: {
            user: { select: { name: true, email: true } },
            items: {
              include: { product: { select: { name: true } } },
            },
            address: true,
          },
          orderBy: { createdAt: 'desc' },
        })

        data = orders.map((o) => ({
          orderId: o.id,
          customer: o.user.name || 'Guest',
          email: o.user.email,
          items: o.items.map((i) => `${i.product.name} x${i.quantity}`).join('; '),
          address: `${o.address.street}, ${o.address.city}, ${o.address.state} ${o.address.postalCode}, ${o.address.country}`,
          status: o.status,
          total: o.total,
          date: o.createdAt.toISOString(),
        }))
        headers = ['orderId', 'customer', 'email', 'items', 'address', 'status', 'total', 'date']
        break
      }

      case 'products': {
        const products = await prisma.product.findMany({
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
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
          },
          orderBy: { createdAt: 'desc' },
        })

        data = products.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: p.price,
          originalPrice: p.originalPrice || '',
          stock: p.stock,
          gender: p.gender,
          shoeType: p.shoeType,
          sizes: p.sizes.join(', '),
          colors: p.colors.join(', '),
          createdAt: p.createdAt.toISOString(),
        }))
        headers = ['id', 'name', 'brand', 'price', 'originalPrice', 'stock', 'gender', 'shoeType', 'sizes', 'colors', 'createdAt']
        break
      }

      case 'customers': {
        const customers = await prisma.user.findMany({
          where: {
            role: Role.USER,
            createdAt: { gte: startDate, lte: endDate },
          },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            orders: {
              where: { status: 'DELIVERED' },
              select: { total: true },
            },
            _count: { select: { orders: true } },
          },
          orderBy: { createdAt: 'desc' },
        })

        data = customers.map((c) => ({
          id: c.id,
          name: c.name || 'Guest',
          email: c.email,
          totalOrders: c._count.orders,
          totalSpent: c.orders.reduce((sum, o) => sum + o.total, 0),
          joinedAt: c.createdAt.toISOString(),
        }))
        headers = ['id', 'name', 'email', 'totalOrders', 'totalSpent', 'joinedAt']
        break
      }

      default:
        return NextResponse.json({ error: 'Unknown export type' }, { status: 400 })
    }

    // Generate CSV
    const csvRows = [headers.join(',')]
    data.forEach((row) => {
      const values = headers.map((h) => {
        const val = row[h]?.toString() || ''
        // Escape commas and quotes in CSV
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`
        }
        return val
      })
      csvRows.push(values.join(','))
    })

    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
