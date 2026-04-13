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
      filtered = updatedProducts.filter((p) => p.stock > 0 && p.stock <= 5)
    } else if (status === 'out') {
      filtered = updatedProducts.filter((p) => p.stock === 0)
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

    // Check if size is valid for this product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sizes: true },
    })

    if (!product || !product.sizes.includes(size)) {
      return new NextResponse('Invalid size for this product', { status: 400 })
    }

    // Upsert size stock
    await prisma.sizeStock.upsert({
      where: {
        productId_size: { productId, size },
      },
      update: { stock: stockNum },
      create: { productId, size, stock: stockNum },
    })

    // Recalculate total product stock (only from valid sizes)
    const sizeStocks = await prisma.sizeStock.findMany({
      where: { productId },
      select: { stock: true, size: true },
    })

    // Filter only sizes that exist in product.sizes
    const validSizeStocks = sizeStocks.filter((ss) => product.sizes.includes(ss.size))
    const totalStock = validSizeStocks.reduce((sum, ss) => sum + ss.stock, 0)

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

// Bulk restock - add stock to all sizes of valid products only
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

    // Get products with their valid sizes
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, sizes: true },
    })

    const productSizeMap = new Map(products.map((p) => [p.id, p.sizes]))

    // Add stock only to sizeStocks that are in product.sizes
    for (const productId of productIds) {
      const validSizes = productSizeMap.get(productId) || []

      if (validSizes.length > 0) {
        // Update only valid sizes
        for (const size of validSizes) {
          const existing = await prisma.sizeStock.findUnique({
            where: { productId_size: { productId, size } },
          })

          if (existing) {
            await prisma.sizeStock.update({
              where: { productId_size: { productId, size } },
              data: { stock: { increment: addAmount } },
            })
          } else {
            await prisma.sizeStock.create({
              data: { productId, size, stock: addAmount },
            })
          }
        }

        // Recalculate total from valid sizes only
        const sizeStocks = await prisma.sizeStock.findMany({
          where: { productId },
          select: { stock: true, size: true },
        })
        const validSizeStocks = sizeStocks.filter((ss) => validSizes.includes(ss.size))
        const totalStock = validSizeStocks.reduce((sum, ss) => sum + ss.stock, 0)
        await prisma.product.update({
          where: { id: productId },
          data: { stock: totalStock },
        })
      }
    }

    return NextResponse.json({ success: true, updated: productIds.length })
  } catch (error) {
    console.error('[INVENTORY_POST]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
