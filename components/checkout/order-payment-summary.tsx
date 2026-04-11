'use client'

import Image from 'next/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'

interface OrderItem {
  id: string
  quantity: number
  price: number
  selectedSize: string
  selectedColor: string
  product: {
    name: string
    images: string[]
  }
}

interface OrderPaymentSummaryProps {
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export function OrderPaymentSummary({
  items,
  subtotal,
  shipping,
  tax,
  total,
}: OrderPaymentSummaryProps) {
  const displaySubtotal = subtotal ?? items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const displayShipping = shipping ?? 10
  const displayTax = tax ?? displaySubtotal * 0.1
  const displayTotal = total ?? displaySubtotal + displayShipping + displayTax

  return (
    <div className='space-y-6'>
      <ScrollArea className='h-[300px] pr-4'>
        {items.map((item) => (
          <div key={item.id} className='flex items-start space-x-4 py-4'>
            <div className='relative h-16 w-16 overflow-hidden rounded-lg flex-shrink-0'>
              {item.product.images?.[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
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
              <p className='font-medium text-sm line-clamp-2'>{item.product.name}</p>
              <div className='flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500'>
                <span>
                  <span className='font-medium'>Size:</span> {item.selectedSize}
                </span>
                {item.selectedColor !== 'default' && (
                  <span>
                    <span className='font-medium'>Color:</span> {item.selectedColor}
                  </span>
                )}
                <span>
                  <span className='font-medium'>Qty:</span> {item.quantity}
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
          <span>Subtotal</span>
          <span>{formatPrice(displaySubtotal)}</span>
        </div>
        <div className='flex justify-between text-sm'>
          <span>Shipping</span>
          <span>{displayShipping === 0 ? <span className='text-green-600 font-medium'>Free</span> : formatPrice(displayShipping)}</span>
        </div>
        <div className='flex justify-between text-sm'>
          <span>Tax (10%)</span>
          <span>{formatPrice(displayTax)}</span>
        </div>
        <Separator />
        <div className='flex justify-between font-semibold text-base'>
          <span>Total</span>
          <span>{formatPrice(displayTotal)}</span>
        </div>
      </div>
    </div>
  )
}
