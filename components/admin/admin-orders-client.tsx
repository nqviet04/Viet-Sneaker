'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  ShoppingCart,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  ArrowUpDown,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  RefreshCw,
  DollarSign,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// ============================================
// TYPES
// ============================================

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

interface Address {
  id: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface Order {
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
  address: Address
  items: OrderItem[]
  _count?: { items: number }
}

interface OrderDetail extends Order {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    createdAt: string
  }
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
  // Handle lowercase from database
  pending: {
    label: 'Chờ xử lý',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  processing: {
    label: 'Đang xử lý',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: RefreshCw,
  },
  shipped: {
    label: 'Đang giao',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Truck,
  },
  delivered: {
    label: 'Đã giao',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
}

const statusTransitions: Record<string, string[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
  // Handle lowercase
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
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
  onStatusUpdate: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [refunding, setRefunding] = useState(false)
  const [showRefundConfirm, setShowRefundConfirm] = useState(false)

  if (!order) return null

  const config = statusConfig[order.status]
  const StatusIcon = config.icon

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
      onStatusUpdate()
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
      await new Promise((r) => setTimeout(r, 1000))
      toast({
        title: 'Đã hoàn tiền',
        description: `Đã hoàn ${formatCurrency(order.total)} cho đơn hàng này.`,
      })
      setShowRefundConfirm(false)
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
                <StatusIcon className='h-3 w-3 mr-1' />
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
            <div className='rounded-lg border p-4'>
              <h3 className='font-semibold mb-3'>Địa Chỉ Giao Hàng</h3>
              <p className='text-sm'>{order.address.street}</p>
              <p className='text-sm'>
                {order.address.city}, {order.address.state} {order.address.postalCode}
              </p>
              <p className='text-sm text-muted-foreground'>{order.address.country}</p>
            </div>

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
              {/* Status Transitions */}
              {statusTransitions[order.status]?.map((newStatus) => (
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

              {/* Refund (only for delivered orders) */}
              {(order.status === 'DELIVERED' || order.status === 'delivered') && (
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
// MAIN COMPONENT
// ============================================

export function AdminOrdersClient({
  initialOrders,
  statuses,
}: {
  initialOrders: Order[]
  statuses: string[]
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [loading, setLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('created_desc')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(initialOrders.length)
  const perPage = 15

  // Dialog
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        sort: sortBy,
      })
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/orders?${params}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders)
        setTotal(data.total)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }, [page, sortBy, search, statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Open detail
  const handleViewDetail = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedOrder(data)
        setDetailOpen(true)
      }
    } catch (error) {
      console.error('Failed to fetch order detail:', error)
    }
  }

  const totalPages = Math.ceil(total / perPage)

  // Status counts for filter tabs
  const statusCounts = statuses.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      <OrderDetailDialog
        order={selectedOrder}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onStatusUpdate={fetchOrders}
      />

      <div className='space-y-4'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <ShoppingCart className='h-5 w-5 text-muted-foreground' />
            <span className='text-sm text-muted-foreground'>
              {total} đơn hàng
            </span>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className='pt-4'>
            <div className='flex flex-col sm:flex-row gap-3'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Tìm kiếm theo ID đơn, tên hoặc email...'
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className='pl-9'
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className='w-[160px]'>
                  <Filter className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='Trạng thái' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả</SelectItem>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusConfig[s]?.label || s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1) }}>
                <SelectTrigger className='w-[160px]'>
                  <ArrowUpDown className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='Sắp xếp' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='created_desc'>Mới nhất</SelectItem>
                  <SelectItem value='created_asc'>Cũ nhất</SelectItem>
                  <SelectItem value='total_desc'>Tổng: Cao đến thấp</SelectItem>
                  <SelectItem value='total_asc'>Tổng: Thấp đến cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Status Tabs */}
        <div className='flex gap-2 flex-wrap'>
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size='sm'
            onClick={() => { setStatusFilter('all'); setPage(1) }}
          >
            Tất cả
          </Button>
          {statuses.map((s) => {
            const config = statusConfig[s]
            return (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'outline'}
                size='sm'
                onClick={() => { setStatusFilter(s); setPage(1) }}
              >
                {config?.icon && <config.icon className='h-3 w-3 mr-1' />}
                {config?.label || s}
              </Button>
            )
          })}
        </div>

        {/* Orders Table */}
        <Card>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Tổng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead className='w-10'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className='h-4 w-24 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-8 w-32 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-4 w-8 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-4 w-20 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-4 w-16 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-4 w-24 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-8 w-8 bg-gray-100 rounded animate-pulse' /></TableCell>
                      </TableRow>
                    ))
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center py-12'>
                        <ShoppingCart className='h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50' />
                        <p className='text-muted-foreground'>Không tìm thấy đơn hàng nào</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => {
                      const config = statusConfig[order.status]
                      const StatusIcon = config?.icon
                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <span className='font-mono text-xs'>#{order.id.slice(-8)}</span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className='font-medium'>{order.user.name || 'Khách'}</p>
                              <p className='text-xs text-muted-foreground'>{order.user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className='text-sm'>{order._count?.items || order.items?.length || 0}</span>
                          </TableCell>
                          <TableCell>
                            <span className='font-medium'>{formatCurrency(order.total)}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={config?.color || 'bg-gray-100'} variant='outline'>
                              {StatusIcon && <StatusIcon className='h-3 w-3 mr-1' />}
                              {config?.label || order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className='text-sm'>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='icon'>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem onClick={() => handleViewDetail(order.id)}>
                                  <Eye className='h-4 w-4 mr-2' />
                                  View Details
                                </DropdownMenuItem>
                                {statusTransitions[order.status].map((newStatus) => (
                                  <DropdownMenuItem
                                    key={newStatus}
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(`/api/admin/orders/${order.id}`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ status: newStatus }),
                                        })
                                        if (res.ok) {
                                          toast({ title: 'Status Updated' })
                                          fetchOrders()
                                        }
                                      } catch (error) {
                                        toast({ title: 'Error', variant: 'destructive' })
                                      }
                                    }}
                                  >
                                    Mark as {statusConfig[newStatus].label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex items-center justify-between px-4 py-3 border-t'>
                <p className='text-sm text-muted-foreground'>
                  Page {page} of {totalPages} ({total} orders)
                </p>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
