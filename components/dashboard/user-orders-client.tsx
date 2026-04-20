'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { X } from 'lucide-react'
import type { Order, OrderItem, Address, Product } from '@prisma/client'

type OrderWithRelations = Order & {
  items: (OrderItem & { product: Product })[]
  shippingAddress: Address
}

const STATUS_LABELS: Record<string, string> = {
  AWAITING_PAYMENT: 'Chờ thanh toán',
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
}

const CANCELLABLE_STATUSES = ['PENDING', 'AWAITING_PAYMENT']

interface UserOrdersClientProps {
  initialOrders: OrderWithRelations[]
}

export function UserOrdersClient({ initialOrders }: UserOrdersClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<OrderWithRelations[]>(initialOrders)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const handleCancel = async (orderId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return

    setCancellingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'PATCH' })
      const data = await res.json()

      if (!res.ok) {
        toast({
          title: 'Lỗi',
          description: data.error || 'Không thể hủy đơn hàng.',
          variant: 'destructive',
        })
        return
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: 'CANCELLED' as const } : o
        )
      )

      toast({
        title: 'Thành công',
        description: 'Đơn hàng đã được hủy thành công.',
      })

      router.refresh()
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi. Vui lòng thử lại.',
        variant: 'destructive',
      })
    } finally {
      setCancellingId(null)
    }
  }

  if (orders.length === 0) {
    return (
      <p className='text-muted-foreground'>Không tìm thấy đơn hàng nào</p>
    )
  }

  return (
    <div className='space-y-4'>
      {orders.map((order) => {
        const canCancel = CANCELLABLE_STATUSES.includes(order.status)
        return (
          <Card key={order.id}>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='font-medium'>Đơn #{order.id.slice(-8)}</p>
                    <p className='text-sm text-muted-foreground'>
                      {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                      })}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant={
                        order.status === 'DELIVERED'
                          ? 'default'
                          : order.status === 'CANCELLED'
                          ? 'destructive'
                          : order.status === 'REFUNDED'
                          ? 'secondary'
                          : 'secondary'
                      }
                      className='capitalize'
                    >
                      {STATUS_LABELS[order.status] || order.status.toLowerCase()}
                    </Badge>
                    {canCancel && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='text-destructive hover:text-destructive'
                        disabled={cancellingId === order.id}
                        onClick={() => handleCancel(order.id)}
                      >
                        <X className='h-4 w-4 mr-1' />
                        {cancellingId === order.id ? 'Đang hủy...' : 'Hủy đơn'}
                      </Button>
                    )}
                  </div>
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
                            Size: {item.selectedSize} | Màu: {item.selectedColor} | Số lượng: {item.quantity}
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
                    {order.shippingAddress.phone && (
                      <p className='text-sm text-muted-foreground'>
                        SĐT: {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-muted-foreground'>Phương thức</p>
                    <p className='text-sm font-medium mb-1'>
                      {order.paymentMethod === 'COD' ? 'COD' :
                       order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' :
                       order.paymentMethod || 'Không xác định'}
                    </p>
                    <p className='text-sm text-muted-foreground'>Tổng cộng</p>
                    <p className='text-2xl font-bold'>
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
