import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, productIds, data } = body

    if (!action || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    switch (action) {
      case 'delete': {
        // Check which products have orders
        const productsWithOrders = await prisma.orderItem.findMany({
          where: { productId: { in: productIds } },
          select: { productId: true },
        })
        const productsWithOrdersSet = new Set(productsWithOrders.map((p) => p.productId))
        const canHardDelete = productIds.filter((id) => !productsWithOrdersSet.has(id))
        const canSoftDelete = productIds.filter((id) => productsWithOrdersSet.has(id))

        // Hard delete products without orders
        if (canHardDelete.length > 0) {
          await prisma.product.deleteMany({ where: { id: { in: canHardDelete } } })
        }

        // Soft delete products with orders
        if (canSoftDelete.length > 0) {
          await prisma.product.updateMany({
            where: { id: { in: canSoftDelete } },
            data: { stock: 0 },
          })
        }

        return NextResponse.json({
          success: true,
          hardDeleted: canHardDelete.length,
          softDeleted: canSoftDelete.length,
        })
      }

      case 'update-stock': {
        if (typeof data.stock !== 'number') {
          return NextResponse.json({ error: 'Invalid stock value' }, { status: 400 })
        }

        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { stock: data.stock },
        })

        return NextResponse.json({ success: true, updated: productIds.length })
      }

      case 'update-brand': {
        if (!data.brand) {
          return NextResponse.json({ error: 'Invalid brand value' }, { status: 400 })
        }

        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { brand: data.brand },
        })

        return NextResponse.json({ success: true, updated: productIds.length })
      }

      case 'restock': {
        if (typeof data.amount !== 'number') {
          return NextResponse.json({ error: 'Invalid amount value' }, { status: 400 })
        }

        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { stock: { increment: data.amount } },
        })

        return NextResponse.json({ success: true, updated: productIds.length })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Bulk Action Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
