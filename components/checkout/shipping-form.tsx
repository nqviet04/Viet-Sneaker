'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
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
import { useCart } from '@/store/use-cart'
import { useToast } from '@/hooks/use-toast'

const shippingFormSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  city: z.string().min(2, 'Thành phố phải có ít nhất 2 ký tự'),
  state: z.string().min(2, 'Tỉnh/Quận phải có ít nhất 2 ký tự'),
  zipCode: z.string().min(5, 'Mã bưu điện phải có ít nhất 5 ký tự'),
  country: z.string().min(2, 'Quốc gia phải có ít nhất 2 ký tự'),
})

type ShippingFormValues = z.infer<typeof shippingFormSchema>

export function ShippingForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const cart = useCart()
  const { toast } = useToast()

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  })

  async function onSubmit(data: ShippingFormValues) {
    try {
      setLoading(true)

      const subtotal = cart.items.reduce((total, item) => {
        return total + item.price * item.quantity
      }, 0)

      const shipping = 10 // Fixed shipping cost
      const tax = subtotal * 0.1 // 10% tax
      const total = subtotal + shipping + tax

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.items,
          shippingInfo: data,
          subtotal,
          tax,
          shipping,
          total,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const { orderId } = await response.json()

      // Clear cart after successful order creation
      cart.clearCart()

      // Redirect to payment page
      router.push(`/payment/${orderId}`)
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

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='city'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thành phố</FormLabel>
                <FormControl>
                  <Input placeholder='TP. Hồ Chí Minh' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='state'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tỉnh/Quận</FormLabel>
                <FormControl>
                  <Input placeholder='Quận 1' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='zipCode'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã bưu điện</FormLabel>
                <FormControl>
                  <Input placeholder='700000' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='country'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quốc gia</FormLabel>
                <FormControl>
                  <Input placeholder='Việt Nam' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type='submit' className='w-full' disabled={loading}>
          {loading ? 'Đang tạo đơn...' : 'Tiếp tục thanh toán'}
        </Button>
      </form>
    </Form>
  )
}
