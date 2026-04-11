'use client'

import { useCart } from '@/store/use-cart'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export function OrderSummary() {
  const cart = useCart()
  const items = cart.items

  const subtotal = items.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)

  const FREE_SHIPPING_THRESHOLD = 2500000 // ₫2.500.000
  const SHIPPING_COST = 150000 // ₫150.000
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  return (
    <div className='space-y-6'>
      <ScrollArea className='h-[300px] pr-4'>
        {items.map((item) => (
          <div key={item.id} className='flex items-start space-x-4 py-4'>
            <div className='relative h-16 w-16 overflow-hidden rounded-lg flex-shrink-0'>
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className='object-cover'
                />
              ) : (
                <div className='absolute inset-0 bg-gray-100 flex items-center justify-center'>
                  <span className='text-[8px] text-gray-400'>No img</span>
                </div>
              )}
            </div>
            <div className='flex-1 space-y-1 min-w-0'>
              <h3 className='font-medium text-sm line-clamp-2'>{item.name}</h3>
              <div className='flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500'>
                <span>
                  <span className='font-medium'>Size:</span> {item.selectedSize}
                </span>
                <span>
                  <span className='font-medium'>Màu:</span> {item.selectedColor}
                </span>
                <span>
                  <span className='font-medium'>SL:</span> {item.quantity}
                </span>
              </div>
              <p className='text-sm font-medium'>
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </ScrollArea>

      <Separator />

      <div className='space-y-3'>
        <div className='flex justify-between text-sm'>
          <span>Tạm tính</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className='flex justify-between text-sm'>
          <span>Vận chuyển</span>
          <span>
            {shipping === 0 ? (
              <span className='text-green-600 font-medium'>Miễn phí</span>
            ) : (
              formatPrice(shipping)
            )}
          </span>
        </div>
        {subtotal >= FREE_SHIPPING_THRESHOLD && (
          <p className='text-xs text-green-600 -mt-1'>
            Miễn phí vận chuyển cho đơn từ ₫2.500.000
          </p>
        )}
        <div className='flex justify-between text-sm'>
          <span>Thuế (10%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <Separator />
        <div className='flex justify-between font-semibold text-base'>
          <span>Tổng cộng</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
