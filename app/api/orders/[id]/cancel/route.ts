import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 })
    }

    if (order.status !== 'PENDING' && order.status !== 'AWAITING_PAYMENT') {
      return NextResponse.json(
        { error: 'Chỉ có thể hủy đơn hàng đang chờ xử lý hoặc chờ thanh toán' },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
      })

      for (const item of order.items) {
        await tx.sizeStock.update({
          where: {
            productId_size: {
              productId: item.productId,
              size: item.selectedSize,
            },
          },
          data: {
            stock: { increment: item.quantity },
          },
        })

        const sizeStocks = await tx.sizeStock.findMany({
          where: { productId: item.productId },
          select: { stock: true },
        })
        const totalStock = sizeStocks.reduce((sum, ss) => sum + ss.stock, 0)
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: totalStock },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ORDER_CANCEL]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
