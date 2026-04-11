'use client'

import { useCart } from '@/store/use-cart'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Trash2, ShoppingBag, Edit3 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ChangeSizeDialog } from '@/components/cart/change-size-dialog'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const cart = useCart()
  const [changeSizeItem, setChangeSizeItem] = useState<{
    productId: string
    name: string
    price: number
    image: string
    quantity: number
    selectedSize: string
    selectedColor: string
  } | null>(null)

  if (cart.items.length === 0) {
    return (
      <div className='container mx-auto px-4 py-16'>
        <Card className='max-w-md mx-auto text-center'>
          <CardHeader>
            <div className='mx-auto mb-4 w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center'>
              <ShoppingBag className='h-8 w-8 text-gray-400' />
            </div>
            <CardTitle>Giỏ hàng trống</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground text-sm'>
              Thêm sản phẩm vào giỏ hàng để xem tại đây.
            </p>
          </CardContent>
          <CardFooter className='flex justify-center'>
            <Button asChild>
              <Link href='/products'>Xem sản phẩm</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Giỏ Hàng</h1>
          <p className='text-sm text-muted-foreground'>
            {cart.itemCount()} {cart.itemCount() === 1 ? 'sản phẩm' : 'sản phẩm'}
          </p>
        </div>
        <Button variant='outline' size='sm' asChild>
          <Link href='/products'>Tiếp tục mua sắm</Link>
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Cart Items */}
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='p-0'>
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className='flex items-start gap-4 p-4 border-b last:border-0'
                >
                  {/* Image */}
                  <Link
                    href={`/products/${item.productId}`}
                    className='relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg'
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className='object-cover hover:opacity-90 transition-opacity'
                      />
                    ) : (
                      <div className='absolute inset-0 bg-gray-100 flex items-center justify-center'>
                        <span className='text-gray-400 text-xs'>No image</span>
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className='flex-1 min-w-0'>
                    <Link
                      href={`/products/${item.productId}`}
                      className='font-medium hover:underline line-clamp-2'
                    >
                      {item.name}
                    </Link>

                    {/* Size & Color */}
                    <div className='flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm'>
                      <span className='text-muted-foreground'>
                        <span className='font-medium'>Size:</span>{' '}
                        <button
                          onClick={() => setChangeSizeItem(item)}
                          className='underline underline-offset-2 hover:text-foreground transition-colors inline-flex items-center gap-1'
                        >
                          {item.selectedSize}
                          <Edit3 className='h-3 w-3' />
                        </button>
                      </span>
                      {item.selectedColor !== 'default' && (
                        <span className='text-muted-foreground'>
                          <span className='font-medium'>Màu:</span>{' '}
                          {item.selectedColor}
                        </span>
                      )}
                    </div>

                    <div className='mt-2'>
                      <span className='font-semibold text-lg'>
                        {formatPrice(item.price)}
                      </span>
                      {item.quantity > 1 && (
                        <span className='text-sm text-muted-foreground ml-1'>
                          (Tổng: {formatPrice(item.price * item.quantity)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className='flex flex-col items-end gap-2'>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() =>
                          cart.updateQuantity(
                            item.productId,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        <span className='sr-only'>Giảm</span>
                        <span>-</span>
                      </Button>
                      <Input
                        type='number'
                        min='1'
                        max='99'
                        value={item.quantity}
                        onChange={(e) =>
                          cart.updateQuantity(
                            item.productId,
                            item.selectedSize,
                            item.selectedColor,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className='w-14 h-8 text-center'
                      />
                      <Button
                        variant='outline'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() =>
                          cart.updateQuantity(
                            item.productId,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity + 1
                          )
                        }
                        disabled={item.quantity >= 99}
                      >
                        <span className='sr-only'>Tăng</span>
                        <span>+</span>
                      </Button>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-red-500 hover:text-red-600 hover:bg-red-50 h-8'
                      onClick={() =>
                        cart.removeItem(
                          item.productId,
                          item.selectedSize,
                          item.selectedColor
                        )
                      }
                    >
                      <Trash2 className='h-4 w-4 mr-1' />
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className='lg:col-span-1'>
          <Card className='sticky top-4'>
            <CardHeader>
              <CardTitle>Tóm Tắt Đơn Hàng</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Tạm tính</span>
                <span>{formatPrice(cart.total())}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Vận chuyển</span>
                <span className='text-muted-foreground'>Tính khi thanh toán</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Thuế</span>
                <span className='text-muted-foreground'>Tính khi thanh toán</span>
              </div>
              <div className='border-t pt-3 flex justify-between font-semibold text-lg'>
                <span>Tổng cộng (ước tính)</span>
                <span>{formatPrice(cart.total())}</span>
              </div>
            </CardContent>
            <CardFooter className='flex flex-col gap-2'>
              <Button className='w-full' size='lg' asChild>
                <Link href='/checkout'>Tiến Hành Thanh Toán</Link>
              </Button>
              <p className='text-xs text-center text-muted-foreground'>
                Vận chuyển & thuế được tính khi thanh toán
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Change Size Dialog */}
      <ChangeSizeDialog
        open={!!changeSizeItem}
        onOpenChange={(open) => !open && setChangeSizeItem(null)}
        item={changeSizeItem}
      />
    </div>
  )
}
