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
    const status = searchParams.get('status')

    // Sync SizeStock: create records for products that have sizes but no sizeStock records
    await syncMissingSizeStock()

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

    // Calculate real totalStock from sizeStock and update product.stock if needed
    for (const product of products) {
      const realTotal = product.sizeStock.reduce((sum, ss) => sum + ss.stock, 0)
      if (realTotal !== product.stock) {
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: realTotal },
        })
      }
    }

    // Refetch with updated stock values
    const updatedProducts = await prisma.product.findMany({
      where,
      include: {
        sizeStock: {
          orderBy: { size: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Filter by status
    let filtered = updatedProducts
    if (status === 'low') {
      filtered = updatedProducts.filter((p) =>
        p.sizeStock.some((ss) => ss.stock > 0 && ss.stock <= 5) ||
        (p.stock > 0 && p.stock <= 5 && p.sizeStock.length === 0)
      )
    } else if (status === 'out') {
      filtered = updatedProducts.filter((p) =>
        p.sizeStock.some((ss) => ss.stock === 0) || p.stock === 0
      )
    }

    return NextResponse.json({ products: filtered, total: filtered.length })
  } catch (error) {
    console.error('[INVENTORY_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

async function syncMissingSizeStock() {
  const productsWithSizes = await prisma.product.findMany({
    where: {
      sizes: { isEmpty: false },
    },
    include: {
      sizeStock: true,
    },
  })

  for (const product of productsWithSizes) {
    if (product.sizeStock.length === 0) {
      for (const size of product.sizes) {
        await prisma.sizeStock.upsert({
          where: { productId_size: { productId: product.id, size } },
          create: { productId: product.id, size, stock: 0 },
          update: { stock: 0 },
        })
      }
    }
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
