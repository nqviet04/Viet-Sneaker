'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

type PasswordFormValues = z.infer<typeof passwordFormSchema>

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  show,
  onToggle,
}: {
  value: string
  onChange: (...event: unknown[]) => void
  placeholder: string
  autoComplete: string
  show: boolean
  onToggle: () => void
}) {
  return (
    <div className='relative'>
      <FormControl>
        <Input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
        />
      </FormControl>
      <button
        type='button'
        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
        onClick={onToggle}
      >
        {show ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
      </button>
    </div>
  )
}

export function ChangePasswordDialog() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: PasswordFormValues) {
    setIsLoading(true)

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast({
          title: 'Lỗi',
          description: result.error || 'Đổi mật khẩu thất bại.',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Thành công',
        description: 'Mật khẩu của bạn đã được thay đổi.',
      })

      form.reset()
      setOpen(false)
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi. Vui lòng thử lại.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='gap-2'>
          <Lock className='h-4 w-4' />
          Đổi mật khẩu
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu hiện tại</FormLabel>
                  <PasswordInput
                    {...field}
                    show={showCurrent}
                    onToggle={() => setShowCurrent((v) => !v)}
                    placeholder='Nhập mật khẩu hiện tại'
                    autoComplete='current-password'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <PasswordInput
                    {...field}
                    show={showNew}
                    onToggle={() => setShowNew((v) => !v)}
                    placeholder='Ít nhất 6 ký tự'
                    autoComplete='new-password'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <PasswordInput
                    {...field}
                    show={showConfirm}
                    onToggle={() => setShowConfirm((v) => !v)}
                    placeholder='Nhập lại mật khẩu mới'
                    autoComplete='new-password'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type='button' variant='outline'>
                  Hủy
                </Button>
              </DialogClose>
              <Button type='submit' disabled={isLoading}>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Xác nhận
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
