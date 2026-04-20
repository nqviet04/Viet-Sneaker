import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { UserOrdersClient } from '@/components/dashboard/user-orders-client'

export default async function OrdersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/sign-in')
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Lịch Sử Đơn Hàng</h2>
        <p className='text-muted-foreground'>
          Xem và quản lý lịch sử đơn hàng của bạn
        </p>
      </div>
      <UserOrdersClient initialOrders={orders} />
    </div>
  )
}
