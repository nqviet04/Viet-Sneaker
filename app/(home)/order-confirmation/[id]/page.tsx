import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Banknote, QrCode } from 'lucide-react'
import { Order, OrderItem, Product, Address, PaymentMethod } from '@prisma/client'

type OrderParams = Promise<{ id: string }>

interface PageProps {
  params: OrderParams
}

interface OrderWithRelations extends Order {
  items: (OrderItem & {
    product: Product
  })[]
  shippingAddress: Address
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  const order = (await prisma.order.findUnique({
    where: {
      id: id,
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
  })) as OrderWithRelations | null

  if (!order) {
    redirect('/')
  }

  const subtotal = order.subtotal ?? order.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = order.shipping ?? (subtotal >= 250 ? 0 : 10)
  const tax = order.tax ?? subtotal * 0.1

  const paymentMethodLabel = order.paymentMethod === 'COD'
    ? 'Thanh toán khi nhận hàng (COD)'
    : order.paymentMethod === 'BANK_TRANSFER'
      ? 'Chuyển khoản ngân hàng'
      : 'Chưa thanh toán'

  const paymentMethodIcon = order.paymentMethod === 'COD'
    ? <Banknote className='h-4 w-4' />
    : order.paymentMethod === 'BANK_TRANSFER'
      ? <QrCode className='h-4 w-4' />
      : null

  return (
    <div className='min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4'>
      <div className='w-full max-w-2xl'>
        <div className='rounded-lg border p-8 space-y-6 bg-white shadow-sm'>
          <div className='flex items-center space-x-4'>
            <CheckCircle className='h-8 w-8 text-green-500' />
            <div>
              <h1 className='text-2xl font-bold'>Đặt hàng thành công!</h1>
              <p className='text-gray-500'>Mã đơn hàng #{id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className='space-y-4'>
            <h2 className='text-lg font-semibold'>Tóm tắt đơn hàng</h2>
            <div className='divide-y'>
              {order.items.map((item) => (
                <div key={item.id} className='flex justify-between py-4'>
                  <div>
                    <p className='font-medium'>{item.product.name}</p>
                    <p className='text-sm text-gray-500'>
                      SL: {item.quantity} | Size: {item.selectedSize}
                      {item.selectedColor !== 'default' ? ` | Màu: ${item.selectedColor}` : ''}
                    </p>
                  </div>
                  <p className='font-medium'>
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>Tạm tính</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className='flex justify-between'>
              <span>Vận chuyển</span>
              <span>{shipping === 0 ? <span className='text-green-600'>Miễn phí</span> : formatPrice(shipping)}</span>
            </div>
            <div className='flex justify-between'>
              <span>Thuế (10%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className='flex justify-between font-bold'>
              <span>Tổng cộng</span>
              <span className='text-primary'>{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className='space-y-2'>
            <h2 className='text-lg font-semibold'>Phương thức thanh toán</h2>
            <div className='flex items-center gap-2 text-sm'>
              {paymentMethodIcon}
              <span>{paymentMethodLabel}</span>
            </div>
          </div>

          <div className='space-y-2'>
            <h2 className='text-lg font-semibold'>Địa chỉ giao hàng</h2>
            <div className='text-gray-500'>
              <strong className='text-foreground'>{order.shippingAddress.fullName}</strong>
              <br />
              {order.shippingAddress.street}
              <br />
              {order.shippingAddress.city}
              <br />
              Email: {order.shippingAddress.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
