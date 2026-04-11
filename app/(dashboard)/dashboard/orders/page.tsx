import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

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
      <div className='space-y-4'>
        {orders.length === 0 ? (
          <p className='text-muted-foreground'>Không tìm thấy đơn hàng nào</p>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Đơn #{order.id.slice(-8)}</p>
                      <p className='text-sm text-muted-foreground'>
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <Badge
                      variant={
                        order.status === 'DELIVERED'
                          ? 'default'
                          : order.status === 'CANCELLED'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className='capitalize'
                    >
                      {order.status === 'PENDING' ? 'Chờ xử lý' : 
                       order.status === 'PROCESSING' ? 'Đang xử lý' : 
                       order.status === 'SHIPPED' ? 'Đang giao' : 
                       order.status === 'DELIVERED' ? 'Đã giao' : 
                       order.status === 'CANCELLED' ? 'Đã hủy' : order.status.toLowerCase()}
                    </Badge>
                  </div>
                  <div className='divide-y'>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className='flex items-center justify-between py-4'
                      >
                        <div className='flex items-center space-x-4'>
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className='h-16 w-16 rounded-md object-cover'
                          />
                          <div>
                            <p className='font-medium'>{item.product.name}</p>
                            <p className='text-sm text-muted-foreground'>
                              Số lượng: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className='font-medium'>
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className='flex justify-between border-t pt-4'>
                    <div>
                      <p className='font-medium'>Địa chỉ giao hàng:</p>
                      <p className='text-sm text-muted-foreground'>
                        {order.shippingAddress.street}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {order.shippingAddress.city},{' '}
                        {order.shippingAddress.state}{' '}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {order.shippingAddress.country}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm text-muted-foreground'>Tổng cộng</p>
                      <p className='text-2xl font-bold'>
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
