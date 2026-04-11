import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PackageSearch, MapPin, Heart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/sign-in')
  }

  const [orders, addresses, user] = await Promise.all([
    prisma.order.count({
      where: {
        userId: session.user.id,
      },
    }),
    prisma.address.count({
      where: {
        userId: session.user.id,
      },
    }),
    prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        orders: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    }),
  ])

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>
          Chào mừng, {user?.name}
        </h2>
        <p className='text-muted-foreground'>
          Tổng quan tài khoản của bạn
        </p>
      </div>
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng Đơn Hàng</CardTitle>
            <PackageSearch className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{orders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Địa Chỉ Đã Lưu
            </CardTitle>
            <MapPin className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{addresses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Yêu Thích
            </CardTitle>
            <Heart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
          </CardContent>
        </Card>
      </div>
      <div className='space-y-4'>
        <h3 className='text-xl font-semibold'>Đơn Hàng Gần Đây</h3>
        {user?.orders.length === 0 ? (
          <p className='text-muted-foreground'>Chưa có đơn hàng nào</p>
        ) : (
          <div className='grid gap-4'>
            {user?.orders.map((order) => (
              <Card key={order.id}>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Đơn #{order.id.slice(-8)}</p>
                      <p className='text-sm text-muted-foreground'>
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium'>{formatPrice(order.total)}</p>
                      <p className='text-sm capitalize text-muted-foreground'>
                        {order.status.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
