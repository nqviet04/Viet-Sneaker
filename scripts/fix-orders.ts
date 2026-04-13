import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
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
      createdAt: true,
      total: true,
      status: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  if (ordersToAdjust.length === 0) {
    console.log('Không có đơn hàng nào cần điều chỉnh')
    return
  }

  console.log(`Tìm thấy ${ordersToAdjust.length} đơn hàng có thời gian sau 02:30 AM 14/04/2026:`)
  console.log('---')

  for (const order of ordersToAdjust) {
    console.log(`ID: ${order.id}`)
    console.log(`  Thời gian cũ: ${order.createdAt.toISOString()}`)
    console.log(`  Status: ${order.status}, Total: ${order.total}`)
    
    // Trừ 7 tiếng để đưa về khoảng 12:30 - 19:30 ngày 13/04
    const newTime = new Date(order.createdAt.getTime() - (7 * 60 * 60 * 1000))
    console.log(`  Thời gian mới: ${newTime.toISOString()}`)
    console.log('---')
  }

  // Cập nhật từng đơn hàng
  console.log('\nĐang cập nhật...')
  
  for (const order of ordersToAdjust) {
    const newTime = new Date(order.createdAt.getTime() - (7 * 60 * 60 * 1000))
    await prisma.order.update({
      where: { id: order.id },
      data: { createdAt: newTime }
    })
    console.log(`Đã cập nhật: ${order.id}`)
  }

  console.log(`\nHoàn tất! Đã điều chỉnh ${ordersToAdjust.length} đơn hàng`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
