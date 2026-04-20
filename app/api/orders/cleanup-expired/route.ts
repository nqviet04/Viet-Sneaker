import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const expiredOrders = await prisma.order.findMany({
      where: {
        status: 'AWAITING_PAYMENT',
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },
    })

    if (expiredOrders.length === 0) {
      return NextResponse.json({ success: true, cancelled: 0 })
    }

    await prisma.order.updateMany({
      where: {
        id: {
          in: expiredOrders.map((o) => o.id),
        },
      },
      data: {
        status: 'CANCELLED',
      },
    })

    return NextResponse.json({
      success: true,
      cancelled: expiredOrders.length,
    })
  } catch (error) {
    console.error('[CLEANUP_EXPIRED_ORDERS_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
