'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Copy, Clock, Check } from 'lucide-react'

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

interface ShippingAddress {
  fullName: string
  email: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface BankTransferContentProps {
  orderId: string
  total: number
  subtotal: number
  shipping: number
  tax: number
  orderItems: OrderItem[]
  shippingAddress: ShippingAddress
}

const BANK_INFO = {
  bankId: '970436', // TPBank
  bankName: 'TPBank',
  accountNumber: '0388663385',
  accountName: 'NGUYEN VIET SANG',
}

function buildVietQRPayload(
  bankId: string,
  accountNumber: string,
  amount: number,
  orderId: string
): string {
  const formattedAmount = Math.round(amount).toString().padStart(12, '0')
  const paddedOrderId = orderId.slice(0, 16).padEnd(16, ' ')

  const addTlv = (id: string, value: string): string => {
    const len = value.length.toString().padStart(2, '0')
    return id + len + value
  }

  const gui = '00' // GUID payload format
  const version = '01' // Version 1
  const init = '38' // Initiating institution (VietQR)

  const merchantInfo = addTlv('00', gui)
  const acquirer = addTlv('38', gui)
  const merchantId = addTlv('02', accountNumber)
  const merchantName = addTlv('03', BANK_INFO.accountName.toUpperCase())
  const amountTag = addTlv('54', formattedAmount)
  const currency = addTlv('53', '704') // VND
  const country = addTlv('58', 'VN')
  const extra = addTlv('63', '01')

  const payload = gui + version + gui + gui + gui + gui +
    merchantInfo + acquirer + merchantId + merchantName + amountTag + currency + country + extra

  const crc = addTlv('91', '04') // CRC16
  return payload + crc
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

export function BankTransferContent({
  orderId,
  total,
  subtotal,
  shipping,
  tax,
  orderItems,
  shippingAddress,
}: BankTransferContentProps) {
  const router = useRouter()
  const [paid, setPaid] = useState(false)

  const qrPayload = buildVietQRPayload(
    BANK_INFO.bankId,
    BANK_INFO.accountNumber,
    total,
    orderId
  )

  return (
    <div className='container max-w-5xl mx-auto py-20 px-4 sm:px-6 lg:px-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Thanh toán chuyển khoản</h1>
        <p className='text-muted-foreground'>
          Quét mã QR bên dưới hoặc chuyển khoản theo thông tin tài khoản
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Left: QR Code */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <QRCodeSVG
                  value={qrPayload}
                  size={220}
                  level='M'
                  bgColor='#ffffff'
                  fgColor='#000000'
                  includeMargin={false}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex justify-center'>
                <div className='inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm'>
                  <span className='font-medium text-green-600'>
                    Thanh toán: {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className='space-y-3'>
                <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
                  <div>
                    <p className='text-xs text-muted-foreground mb-0.5'>Ngân hàng</p>
                    <p className='font-semibold'>{BANK_INFO.bankName}</p>
                    <p className='text-xs text-muted-foreground'>Mã ngân hàng: {BANK_INFO.bankId}</p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => copyToClipboard(BANK_INFO.bankId)}
                  >
                    <Copy className='h-4 w-4' />
                  </Button>
                </div>

                <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
                  <div>
                    <p className='text-xs text-muted-foreground mb-0.5'>Số tài khoản</p>
                    <p className='font-semibold font-mono'>{BANK_INFO.accountNumber}</p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => copyToClipboard(BANK_INFO.accountNumber)}
                  >
                    <Copy className='h-4 w-4' />
                  </Button>
                </div>

                <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
                  <div>
                    <p className='text-xs text-muted-foreground mb-0.5'>Tên tài khoản</p>
                    <p className='font-semibold'>{BANK_INFO.accountName}</p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => copyToClipboard(BANK_INFO.accountName)}
                  >
                    <Copy className='h-4 w-4' />
                  </Button>
                </div>

                <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
                  <div>
                    <p className='text-xs text-muted-foreground mb-0.5'>Nội dung chuyển khoản</p>
                    <p className='font-semibold font-mono text-sm'>Thanh toan don hang {orderId.slice(0, 8)}</p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => copyToClipboard(`Thanh toan don hang ${orderId.slice(0, 8)}`)}
                  >
                    <Copy className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              <div className='flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm'>
                <Clock className='h-4 w-4 mt-0.5 text-amber-600 shrink-0' />
                <p className='text-amber-800'>
                  Vui lòng chuyển khoản đúng số tiền và ghi nội dung chuyển khoản chính xác để hệ thống xác nhận tự động.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Order Summary */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                {orderItems.map((item) => (
                  <div key={item.id} className='flex items-start gap-3'>
                    <div className='relative h-14 w-14 overflow-hidden rounded flex-shrink-0'>
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
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-sm line-clamp-2'>{item.product.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        Size: {item.selectedSize} | SL: {item.quantity}
                      </p>
                      <p className='text-sm font-medium'>{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Vận chuyển</span>
                  <span>{shipping === 0 ? <span className='text-green-600 font-medium'>Miễn phí</span> : formatPrice(shipping)}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Thuế (10%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <Separator />
                <div className='flex justify-between font-bold'>
                  <span>Tổng cộng</span>
                  <span className='text-primary'>{formatPrice(total)}</span>
                </div>
              </div>

              <Separator />

              <div className='space-y-1'>
                <p className='text-sm font-medium'>Địa chỉ giao hàng</p>
                <div className='text-sm text-muted-foreground'>
                  <p className='font-medium text-foreground'>{shippingAddress.fullName}</p>
                  <p>{shippingAddress.street}</p>
                  <p>{shippingAddress.city}</p>
                  <p>{shippingAddress.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              {paid ? (
                <div className='flex flex-col items-center gap-3 py-4'>
                  <CheckCircle className='h-12 w-12 text-green-500' />
                  <p className='font-semibold text-green-600'>Đã xác nhận thanh toán!</p>
                  <Button
                    className='w-full'
                    onClick={() => router.push(`/order-confirmation/${orderId}`)}
                  >
                    Xem chi tiết đơn hàng
                  </Button>
                </div>
              ) : (
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Clock className='h-4 w-4' />
                    <span>Đơn hàng sẽ được xử lý sau khi thanh toán được xác nhận.</span>
                  </div>
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={() => setPaid(true)}
                  >
                    Tôi đã chuyển khoản xong
                  </Button>
                  <p className='text-xs text-center text-muted-foreground'>
                    Nhấn nút trên sau khi đã chuyển khoản. Hệ thống sẽ xác nhận trong vài phút.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
