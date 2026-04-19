"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Check, ChevronsUpDown, Search, Banknote, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useCart } from '@/store/use-cart'
import { useToast } from '@/hooks/use-toast'
import { PROVINCES, WARDS, type Province, type Ward } from '@/lib/vietnam-regions'

const shippingFormSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  province: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  ward: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  paymentMethod: z.enum(['cod', 'bank_transfer'], {
    required_error: 'Vui lòng chọn phương thức thanh toán',
  }),
})

type ShippingFormValues = z.infer<typeof shippingFormSchema>

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

interface ComboboxProps {
  value: string
  onValueChange: (value: string) => void
  items: readonly { value: string; label: string }[]
  placeholder: string
  emptyMessage?: string
  disabled?: boolean
}

function Combobox({
  value,
  onValueChange,
  items,
  placeholder,
  emptyMessage = 'Không tìm thấy.',
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = items.find((item) => item.value === value)

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = normalize(search)
    return items.filter((item) => normalize(item.label).includes(q))
  }, [items, search])

  return (
      <Popover open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) setSearch('')
      }}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          {selected?.label || placeholder}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
        <div className='flex items-center border-b px-3'>
          <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
          <input
            autoFocus
            className='flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setOpen(false)
              }
            }}
          />
        </div>
        <div className='max-h-[280px] overflow-y-auto'>
          {filtered.length === 0 ? (
            <p className='py-6 text-center text-sm text-muted-foreground'>
              {emptyMessage}
            </p>
          ) : (
            <ul className='p-1'>
              {filtered.map((item) => (
                <li
                  key={item.value}
                  onClick={() => {
                    onValueChange(item.value)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none',
                    value === item.value
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4 shrink-0',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function ShippingForm() {
  const [loading, setLoading] = useState(false)
  const [provinceCode, setProvinceCode] = useState('')
  const router = useRouter()
  const cart = useCart()
  const { toast } = useToast()

  const wards = provinceCode ? (WARDS[provinceCode] || []) : []

  const provinceItems = PROVINCES.map((p: Province) => ({
    value: p.code,
    label: p.name,
  }))

  const wardItems = wards.map((w: Ward) => ({
    value: w.code,
    label: w.name,
  }))

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      address: '',
      province: '',
      ward: '',
      paymentMethod: 'cod',
    },
  })

  function handleProvinceChange(code: string) {
    setProvinceCode(code)
    form.setValue('province', code)
    form.setValue('ward', '')
  }

  async function onSubmit(data: ShippingFormValues) {
    try {
      setLoading(true)

      const buyNowRaw = sessionStorage.getItem('buy-now-item')
      let items: any[] = []
      let subtotal = 0

      if (buyNowRaw) {
        try {
          const buyNow = JSON.parse(buyNowRaw)
          items = [buyNow]
          subtotal = buyNow.price * buyNow.quantity
        } catch {
          items = cart.items
          subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0)
        }
      } else {
        items = cart.items
        subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0)
      }

      if (!items.length) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không có sản phẩm nào để thanh toán.',
        })
        return
      }

      const FREE_SHIPPING_THRESHOLD = 2500000 // ₫2.500.000
      const SHIPPING_COST = 150000 // ₫150.000
      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
      const tax = subtotal * 0.1
      const total = subtotal + shipping + tax

      const provinceName =
        PROVINCES.find((p) => p.code === data.province)?.name || data.province
      const wardName =
        wards.find((w) => w.code === data.ward)?.name || data.ward

      const shippingInfo = {
        fullName: data.fullName,
        email: data.email,
        address: data.address,
        city: `${wardName}, ${provinceName}`,
        state: '',
        zipCode: '',
        country: 'Việt Nam',
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingInfo,
          subtotal,
          shipping,
          tax,
          total,
          paymentMethod: data.paymentMethod,
        }),
      })

      if (!response.ok) {
        let msg = 'Đã xảy ra lỗi. Vui lòng thử lại.'
        try {
          const errData = await response.json()
          if (errData?.error) msg = errData.error
        } catch { /* ignore */ }
        toast({ variant: 'destructive', title: 'Lỗi', description: msg })
        return
      }

      const { orderId } = await response.json()

      cart.clearCart()
      cart.clearBuyNowItem()

      if (data.paymentMethod === 'cod') {
        router.push(`/order-confirmation/${orderId}`)
      } else {
        router.push(`/bank-transfer/${orderId}`)
      }
    } catch (error) {
      console.error('[SHIPPING_FORM]', error)
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi. Vui lòng thử lại.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='fullName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và Tên</FormLabel>
              <FormControl>
                <Input placeholder='Nguyễn Văn A' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='email@example.com' type='email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ</FormLabel>
              <FormControl>
                <Input placeholder='123 Đường ABC' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 gap-4'>
          <FormField
            control={form.control}
            name='province'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>Tỉnh / Thành phố</FormLabel>
                <Combobox
                  value={provinceCode}
                  onValueChange={handleProvinceChange}
                  items={provinceItems}
                  placeholder='-- Tìm hoặc chọn Tỉnh / Thành phố --'
                  emptyMessage='Không tìm thấy tỉnh/thành phố.'
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='ward'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>Phường / Xã</FormLabel>
                <Combobox
                  value={form.watch('ward')}
                  onValueChange={(val) => form.setValue('ward', val)}
                  items={wardItems}
                  placeholder='-- Tìm hoặc chọn Phường / Xã --'
                  emptyMessage='Không tìm thấy phường/xã.'
                  disabled={!provinceCode}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='space-y-3'>
          <FormLabel>Phương thức thanh toán</FormLabel>
          <div className='grid grid-cols-2 gap-3'>
            <FormField
              control={form.control}
              name='paymentMethod'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <button
                      type='button'
                      onClick={() => field.onChange('cod')}
                      className={cn(
                        'w-full h-20 flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 text-sm font-medium transition-colors',
                        field.value === 'cod'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50 hover:bg-accent'
                      )}
                    >
                      <Banknote className='h-5 w-5' />
                      Thanh toán khi nhận hàng
                    </button>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='paymentMethod'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <button
                      type='button'
                      onClick={() => field.onChange('bank_transfer')}
                      className={cn(
                        'w-full h-20 flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 text-sm font-medium transition-colors',
                        field.value === 'bank_transfer'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50 hover:bg-accent'
                      )}
                    >
                      <QrCode className='h-5 w-5' />
                      Chuyển khoản ngân hàng
                    </button>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormMessage />
        </div>

        <Button type='submit' className='w-full' disabled={loading}>
          {loading ? 'Đang tạo đơn...' : 'Tiếp tục thanh toán'}
        </Button>
      </form>
    </Form>
  )
}
