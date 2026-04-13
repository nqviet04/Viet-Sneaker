'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import {
  Eye,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  RefreshCw,
  DollarSign,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrderStatus } from '@prisma/client'

interface OrderItem {
  id: string
  product: {
    id: string
    name: string
    images: string[]
    brand: string
    price: number
  }
  selectedSize: string
  selectedColor: string
  quantity: number
  price: number
}

interface ShippingAddress {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface OrderListItem {
  id: string
  user: {
    name: string | null
  }
  total: number
  status: OrderStatus
  createdAt: Date
}

interface OrderDetail {
  id: string
  total: number
  status: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  shippingAddress: ShippingAddress
  items: OrderItem[]
}

// ============================================
// CONSTANTS
// ============================================

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: {
    label: 'Chờ xử lý',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  PROCESSING: {
    label: 'Đang xử lý',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: RefreshCw,
  },
  SHIPPED: {
    label: 'Đang giao',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Đã giao',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: DollarSign,
  },
}

const statusTransitions: Record<string, string[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['REFUNDED', 'CANCELLED'],
  CANCELLED: [],
  REFUNDED: [],
}

// ============================================
// ORDER DETAIL DIALOG
// ============================================

function OrderDetailDialog({
  order,
  open,
  onOpenChange,
  onStatusUpdate,
}: {
  order: OrderDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdate?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [refunding, setRefunding] = useState(false)
  const [showRefundConfirm, setShowRefundConfirm] = useState(false)

  if (!order) return null

  const config = statusConfig[order.status]
  const StatusIcon = config?.icon

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Cập nhật thất bại')
      }

      toast({ title: 'Đã cập nhật', description: `Trạng thái đơn hàng đã được thay đổi.` })
      onStatusUpdate?.()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Đã xảy ra lỗi',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async () => {
    setRefunding(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REFUNDED' }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Hoàn tiền thất bại')
      }

      toast({
        title: 'Đã hoàn tiền',
        description: `Đã hoàn ${formatCurrency(order.total)} cho đơn hàng này.`,
      })
      setShowRefundConfirm(false)
      onStatusUpdate?.()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Đã xảy ra lỗi',
        variant: 'destructive',
      })
    } finally {
      setRefunding(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <div className='flex items-center justify-between'>
              <DialogTitle className='text-lg'>Đơn #{order.id.slice(-8)}</DialogTitle>
              <Badge className={config?.color || 'bg-gray-100'}>
                {StatusIcon && <StatusIcon className='h-3 w-3 mr-1' />}
                {config?.label || order.status}
              </Badge>
            </div>
          </DialogHeader>

          <div className='space-y-6'>
            {/* Order Info */}
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <p className='text-muted-foreground'>Ngày đặt hàng</p>
                <p className='font-medium'>
                  {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground'>Tổng đơn hàng</p>
                <p className='font-bold text-lg'>{formatCurrency(order.total)}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className='rounded-lg border p-4'>
              <h3 className='font-semibold mb-3'>Thông Tin Khách Hàng</h3>
              <div className='flex items-center gap-3'>
                {order.user.image ? (
                  <Image
                    src={order.user.image}
                    alt={order.user.name || 'Người dùng'}
                    width={40}
                    height={40}
                    className='rounded-full'
                  />
                ) : (
                  <div className='h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center'>
                    {order.user.name?.[0] || order.user.email[0]}
                  </div>
                )}
                <div>
                  <p className='font-medium'>{order.user.name || 'Khách'}</p>
                  <p className='text-sm text-muted-foreground'>{order.user.email}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className='rounded-lg border p-4'>
                <h3 className='font-semibold mb-3'>Địa Chỉ Giao Hàng</h3>
                <p className='text-sm'>{order.shippingAddress.street}</p>
                <p className='text-sm'>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p className='text-sm text-muted-foreground'>{order.shippingAddress.country}</p>
              </div>
            )}

            {/* Order Items */}
            <div className='rounded-lg border'>
              <div className='p-4 border-b'>
                <h3 className='font-semibold'>Sản phẩm ({order.items.length})</h3>
              </div>
              <div className='divide-y'>
                {order.items.map((item) => (
                  <div key={item.id} className='p-4 flex items-center gap-4'>
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={60}
                        height={60}
                        className='rounded-md object-cover'
                      />
                    ) : (
                      <div className='h-[60px] w-[60px] rounded-md bg-gray-100' />
                    )}
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium truncate'>{item.product.name}</p>
                      <p className='text-sm text-muted-foreground'>
                        {item.product.brand} | Size: {item.selectedSize} | Màu: {item.selectedColor}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium'>{formatCurrency(item.price * item.quantity)}</p>
                      <p className='text-sm text-muted-foreground'>
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className='p-4 border-t bg-gray-50 flex justify-between'>
                <span className='font-semibold'>Tổng cộng</span>
                <span className='font-bold text-lg'>{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className='flex flex-wrap gap-2 justify-end'>
              {statusTransitions[order.status]
                ?.filter((newStatus) => newStatus !== 'REFUNDED')
                ?.map((newStatus) => (
                  <Button
                    key={newStatus}
                    variant='outline'
                    size='sm'
                    onClick={() => handleStatusChange(newStatus)}
                    disabled={loading}
                  >
                    {loading ? 'Đang cập nhật...' : `Đổi sang ${statusConfig[newStatus]?.label || newStatus}`}
                  </Button>
                ))}

              {(order.status === 'DELIVERED') && (
                <Button
                  variant='outline'
                  size='sm'
                  className='text-orange-600 border-orange-200 hover:bg-orange-50'
                  onClick={() => setShowRefundConfirm(true)}
                >
                  <DollarSign className='h-4 w-4 mr-1' />
                  Hoàn tiền
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refund Confirmation */}
      <AlertDialog open={showRefundConfirm} onOpenChange={setShowRefundConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác Nhận Hoàn Tiền</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hoàn {formatCurrency(order.total)} cho đơn hàng này không?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefund}
              disabled={refunding}
              className='bg-orange-600 hover:bg-orange-700'
            >
              {refunding ? 'Đang xử lý...' : 'Xác Nhận Hoàn Tiền'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ============================================
// RECENT ORDERS COMPONENT
// ============================================

const statusColors = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.PROCESSING]: 'bg-blue-100 text-blue-800',
  [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-800',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
}

interface RecentOrdersProps {
  orders: OrderListItem[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleViewDetail = async (orderId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedOrder(data)
        setDetailOpen(true)
      }
    } catch (error) {
      console.error('Failed to fetch order detail:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin đơn hàng',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <OrderDetailDialog
        order={selectedOrder}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className='font-medium'>{order.id.slice(-8)}</TableCell>
                  <TableCell>{order.user.name || 'Anonymous'}</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge
                      variant='secondary'
                      className={statusColors[order.status]}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleViewDetail(order.id)}
                      disabled={loading}
                    >
                      <Eye className='h-4 w-4 mr-1' />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
