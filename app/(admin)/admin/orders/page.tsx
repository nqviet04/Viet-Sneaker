import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'
import { AdminOrdersClient } from '@/components/admin/admin-orders-client'

export default async function AdminOrdersPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const [orders, statuses] = await Promise.all([
    prisma.order.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    Promise.resolve(Object.values(OrderStatus)),
  ])

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Đơn Hàng</h2>
        <p className='text-muted-foreground'>
          Quản lý đơn hàng, cập nhật trạng thái và xử lý hoàn tiền.
        </p>
      </div>
      <AdminOrdersClient initialOrders={orders} statuses={statuses} />
    </div>
  )
}
