'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { generateVietQR } from 'vietqr-ts'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Copy, Clock, XCircle } from 'lucide-react'

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
  phone?: string | null
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
  orderDate?: string
}

const BANK_INFO = {
  bankId: '970422', // MBBank
  bankName: 'MBBank',
  accountNumber: '0339995273',
  accountName: 'NGUYEN QUOC VIET',
}

function buildVietQRPayload(
  bankId: string,
  accountNumber: string,
  amount: number,
  orderId: string
): string {
  const shortOrderId = orderId.slice(-8)
  const purpose = `TT ${shortOrderId}`

  const result = generateVietQR({
    bankBin: bankId,
    accountNumber: accountNumber,
    serviceCode: 'QRIBFTTA',
    initiationMethod: '12',
    amount: Math.round(amount).toString(),
    purpose,
  })

  return result.rawData
}

function getTransferPurpose(orderId: string): string {
  const shortOrderId = orderId.slice(-8)
  return `TT ${shortOrderId}`
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
  orderDate,
}: BankTransferContentProps) {
  const router = useRouter()
  const [paid, setPaid] = useState(false)
  const [expired, setExpired] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes = 300 seconds
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [showCancelledUI, setShowCancelledUI] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasCancelledRef = useRef(false)
  const cancelledStateRef = useRef(false)
  const isMountedRef = useRef(true)

  // Track component mount state
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Sync cancelled state to ref to avoid stale closure
  useEffect(() => {
    cancelledStateRef.current = cancelled
  }, [cancelled])

  const cancelOrder = useCallback(async (isExpired = false) => {
    if (hasCancelledRef.current || cancelledStateRef.current || !isMountedRef.current) return
    hasCancelledRef.current = true
    cancelledStateRef.current = true
    if (timerRef.current) clearInterval(timerRef.current)
    if (isExpired) setExpired(true)
    try {
      await fetch('/api/orders/cancel-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
    } catch { /* ignore */ }
    setCancelled(true)
    setShowCancelledUI(true)
  }, [orderId])

  // Countdown timer - only counts down, does NOT cancel
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Handle time expiration separately - checks mount state to prevent race
  useEffect(() => {
    if (timeLeft === 0) {
      cancelOrder(true)
    }
  }, [timeLeft])

  const formattedOrderDate = orderDate
    ? new Date(orderDate).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

  const qrPayload = buildVietQRPayload(
    BANK_INFO.bankId,
    BANK_INFO.accountNumber,
    total,
    orderId
  )

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timerColor = timeLeft <= 60 ? 'text-red-500' : timeLeft <= 120 ? 'text-orange-500' : 'text-primary'
  const isTimerWarning = timeLeft <= 60

  useEffect(() => {
    QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'L',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    }).then((url) => {
      setQrDataUrl(url)
    }).catch((err) => {
      console.error('QR generation error:', err)
    })
  }, [qrPayload])

  return (
    <div className='container max-w-5xl mx-auto py-20 px-4 sm:px-6 lg:px-8'>
      {(paid || showCancelledUI) && (
        <>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold mb-2'>Thanh toán chuyển khoản</h1>
          </div>

          {paid ? (
            <div className='flex flex-row items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg mb-6'>
              <CheckCircle className='h-10 w-10 text-green-500 shrink-0' />
              <div className='flex-1'>
                <p className='font-semibold text-green-700'>Đã xác nhận thanh toán!</p>
                <p className='text-sm text-green-600'>
                  Cảm ơn bạn! Đơn hàng của bạn đang được xử lý.
                </p>
              </div>
              <Button onClick={() => router.push(`/order-confirmation/${orderId}`)}>
                Xem chi tiết đơn hàng
              </Button>
            </div>
          ) : (
            <div className='flex flex-row items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg mb-6'>
              <XCircle className='h-10 w-10 text-red-500 shrink-0' />
              <div className='flex-1'>
                <p className='font-semibold text-red-700'>Đơn hàng đã bị hủy!</p>
                <p className='text-sm text-red-600'>
                  Đơn hàng của bạn đã bị hủy. Bạn có thể đặt hàng lại nếu muốn.
                </p>
              </div>
              <Button onClick={() => router.push('/products')}>
                Tiếp tục mua sắm
              </Button>
            </div>
          )}
        </>
      )}

      {!paid && !showCancelledUI && (
        <>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold mb-2'>Thanh toán chuyển khoản</h1>
            <p className='text-muted-foreground'>
              Quét mã QR bên dưới hoặc chuyển khoản theo thông tin tài khoản
            </p>
          </div>

          <div className='mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3'>
            <Clock className={`h-5 w-5 shrink-0 ${timerColor}`} />
            <div className='flex-1'>
              <p className='text-sm font-medium text-amber-800'>
                Vui lòng hoàn tất thanh toán trong{' '}
                <span className={`font-mono font-bold text-base ${timerColor}`}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </p>
              <p className='text-xs text-amber-600'>
                Đơn hàng sẽ tự động hủy nếu bạn rời trang hoặc hết thời gian.
              </p>
            </div>
          </div>
        </>
      )}

      <div className={paid || showCancelledUI ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-2 gap-8'}>
        {/* Left: QR Code */}
        {!paid && !showCancelledUI && (
          <div className='space-y-6'>
            <Card>
            <CardHeader>
              <div className='flex flex-col items-center gap-3'>
                {qrDataUrl ? (
                  <Image
                    src={qrDataUrl}
                    alt='VietQR Payment Code'
                    width={300}
                    height={300}
                    className='rounded-lg'
                    unoptimized
                  />
                ) : (
                  <div className='w-[300px] h-[300px] flex items-center justify-center bg-muted rounded-lg'>
                    <span className='text-muted-foreground'>Đang tạo mã QR...</span>
                  </div>
                )}
                <div className='flex items-center gap-2 px-4 py-2 bg-muted rounded-lg'>
                  <Clock className={`h-5 w-5 ${timerColor}`} />
                  <span className={`font-mono font-bold text-lg ${timerColor}`}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                  <span className='text-sm text-muted-foreground'>để thanh toán</span>
                </div>
              </div>
              <CardTitle className='sr-only'>Thanh toán VietQR</CardTitle>
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
                    <p className='font-semibold font-mono text-sm'>{getTransferPurpose(orderId)}</p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => copyToClipboard(getTransferPurpose(orderId))}
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
        )}

        {/* Right: Order Summary */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between px-3 py-2 bg-muted rounded-lg'>
                <span className='text-sm text-muted-foreground'>Mã đơn hàng</span>
                <span className='font-mono font-semibold text-sm'>#{orderId.slice(-8)}</span>
              </div>

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
                        Size: {item.selectedSize} | SL: {item.quantity} | Màu: {item.selectedColor}
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
                <p className='text-sm font-medium'>Thời gian đặt hàng</p>
                <p className='text-sm text-muted-foreground'>{formattedOrderDate}</p>
              </div>

              <Separator />

              <div className='space-y-1'>
                <p className='text-sm font-medium'>Địa chỉ giao hàng</p>
                <div className='text-sm text-muted-foreground'>
                  <p className='font-medium text-foreground'>{shippingAddress.fullName}</p>
                  <p>{shippingAddress.street}</p>
                  <p>{shippingAddress.city}</p>
                  <p>Email: {shippingAddress.email}</p>
                  <p>SĐT: {shippingAddress.phone || 'Không có'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!paid && !showCancelledUI && (
            <Card>
            <CardContent className='pt-6'>
              <div className='space-y-3'>
                <div className='flex items-center justify-center gap-2 p-3 bg-muted rounded-lg'>
                  <Clock className={`h-5 w-5 ${timerColor}`} />
                  <span className={`font-mono font-bold text-lg ${timerColor}`}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                  <span className='text-sm text-muted-foreground'>còn lại</span>
                </div>

                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Clock className='h-4 w-4' />
                  <span>Đơn hàng sẽ được xử lý sau khi thanh toán được xác nhận.</span>
                </div>

                <Button
                  variant='default'
                  className='w-full'
                  disabled={cancelling}
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/orders/confirm-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId }),
                      })
                      if (res.ok) {
                        if (timerRef.current) clearInterval(timerRef.current)
                        setPaid(true)
                      } else {
                        const data = await res.json()
                        alert(data.error || 'Xác nhận thất bại. Vui lòng thử lại.')
                      }
                    } catch {
                      alert('Đã xảy ra lỗi. Vui lòng thử lại.')
                    }
                  }}
                >
                  Tôi đã chuyển khoản xong
                </Button>

                <Button
                  variant='outline'
                  className='w-full text-muted-foreground'
                  disabled={cancelling}
                  onClick={async () => {
                    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
                    setCancelling(true)
                    await cancelOrder()
                  }}
                >
                  Hủy thanh toán
                </Button>

                <p className='text-xs text-center text-muted-foreground'>
                  Nhấn nút trên sau khi đã chuyển khoản. Hệ thống sẽ xác nhận trong vài phút.
                </p>
              </div>
            </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
