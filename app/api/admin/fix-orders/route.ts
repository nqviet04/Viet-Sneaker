import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function POST() {
  const session = await auth()
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Thời gian hiện tại: 14/04/2026 02:30 AM VN = 13/04/2026 19:30 UTC
    const now = new Date('2026-04-13T19:30:00.000Z')
    
    // Tìm tất cả đơn hàng có createdAt sau thời điểm này
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gt: now
        }
      },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        total: true,
        status: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    if (orders.length === 0) {
      return NextResponse.json({ 
        message: 'Không có đơn hàng nào cần điều chỉnh',
        count: 0
      })
    }

    // Tính toán thời gian mới - giảm đi để đưa về trước thời điểm 02:30 AM
    const updates = orders.map(order => {
      // Tính độ lệch để đưa về khoảng 23:xx ngày 13/04/2026
      // Mỗi đơn hàng sẽ có thời gian khác nhau trong khoảng 1 tiếng trước đó
      const currentTime = order.createdAt.getTime()
      const offsetMs = currentTime - now.getTime()
      
      // Điều chỉnh: trừ đi khoảng 1 ngày và 1 phần của offset để tạo thời gian hợp lý
      const newTime = new Date(currentTime - (7 * 60 * 60 * 1000)) // Trừ 7 tiếng để đưa về tối 13/04
      
      return {
        id: order.id,
        oldTime: order.createdAt,
        newTime: newTime
      }
    })

    return NextResponse.json({
      message: `Tìm thấy ${orders.length} đơn hàng có thời gian sau 02:30 AM 14/04/2026`,
      orders: updates.map(u => ({
        id: u.id,
        customer: u.id, // sẽ map với user info
        oldTime: u.oldTime.toISOString(),
        newTime: u.newTime.toISOString()
      })),
      count: orders.length
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await auth()
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { orderIds, action } = body

    if (action === 'adjust') {
      // Thời gian hiện tại: 14/04/2026 02:30 AM VN = 13/04/2026 19:30 UTC
      const now = new Date('2026-04-13T19:30:00.000Z')
      
      // Tìm tất cả đơn hàng có createdAt sau thời điểm này
      const ordersToAdjust = await prisma.order.findMany({
        where: {
          createdAt: {
            gt: now
          }
        },
        select: {
          id: true,
          createdAt: true
        }
      })

      if (ordersToAdjust.length === 0) {
        return NextResponse.json({ 
          message: 'Không có đơn hàng nào cần điều chỉnh',
          updated: 0
        })
      }

      // Cập nhật từng đơn hàng - trừ 7 tiếng để đưa về khoảng 12:30 - 19:30 ngày 13/04
      const updatePromises = ordersToAdjust.map(order => {
        const newTime = new Date(order.createdAt.getTime() - (7 * 60 * 60 * 1000))
        return prisma.order.update({
          where: { id: order.id },
          data: { createdAt: newTime }
        })
      })

      await prisma.$transaction(updatePromises)

      return NextResponse.json({
        message: `Đã điều chỉnh thời gian ${ordersToAdjust.length} đơn hàng`,
        updated: ordersToAdjust.length
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
