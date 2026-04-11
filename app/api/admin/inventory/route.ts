import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const brand = searchParams.get('brand')
    const status = searchParams.get('status') // 'low' | 'out' | 'all'

    const where: any = {}

    if (brand && brand !== 'all') {
      where.brand = brand
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        sizeStock: {
          orderBy: { size: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Filter by status
    let filtered = products
    if (status === 'low') {
      filtered = products.filter((p) =>
        p.sizeStock.some((ss) => ss.stock > 0 && ss.stock <= 5) ||
        (p.sizeStock.length === 0 && p.stock > 0 && p.stock <= 5)
      )
    } else if (status === 'out') {
      filtered = products.filter((p) =>
        p.sizeStock.some((ss) => ss.stock === 0) || p.stock === 0
      )
    }

    return NextResponse.json({ products: filtered, total: filtered.length })
  } catch (error) {
    console.error('[INVENTORY_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

// Update stock for a specific size
export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { productId, size, stock } = body

    if (!productId || !size || stock === undefined) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const stockNum = Math.max(0, parseInt(stock) || 0)

    // Upsert size stock
    await prisma.sizeStock.upsert({
      where: {
        productId_size: { productId, size },
      },
      update: { stock: stockNum },
      create: { productId, size, stock: stockNum },
    })

    // Recalculate total product stock
    const sizeStocks = await prisma.sizeStock.findMany({
      where: { productId },
      select: { stock: true },
    })
    const totalStock = sizeStocks.reduce((sum, ss) => sum + ss.stock, 0)
    await prisma.product.update({
      where: { id: productId },
      data: { stock: totalStock },
    })

    return NextResponse.json({ success: true, totalStock })
  } catch (error) {
    console.error('[INVENTORY_PATCH]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

// Bulk restock - add stock to all sizes
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { productIds, amount } = body

    if (!productIds?.length || amount === undefined) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const addAmount = Math.max(0, parseInt(amount) || 0)

    // Add stock to all existing sizeStocks for these products
    await prisma.sizeStock.updateMany({
      where: { productId: { in: productIds } },
      data: { stock: { increment: addAmount } },
    })

    // Recalculate totals
    for (const productId of productIds) {
      const sizeStocks = await prisma.sizeStock.findMany({
        where: { productId },
        select: { stock: true },
      })
      const totalStock = sizeStocks.reduce((sum, ss) => sum + ss.stock, 0)
      await prisma.product.update({
        where: { id: productId },
        data: { stock: totalStock },
      })
    }

    return NextResponse.json({ success: true, updated: productIds.length })
  } catch (error) {
    console.error('[INVENTORY_POST]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
