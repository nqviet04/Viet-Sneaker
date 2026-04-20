'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { PROVINCES, WARDS, type Province, type Ward } from '@/lib/vietnam-regions'

const addressFormSchema = z.object({
  street: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  province: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  ward: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  isDefault: z.boolean().default(false),
})

type AddressFormValues = z.infer<typeof addressFormSchema>

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

export function AddressForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [provinceCode, setProvinceCode] = useState('')

  const wards = provinceCode ? (WARDS[provinceCode] || []) : []

  const provinceItems = PROVINCES.map((p: Province) => ({
    value: p.code,
    label: p.name,
  }))

  const wardItems = wards.map((w: Ward) => ({
    value: w.code,
    label: w.name,
  }))

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      street: '',
      province: '',
      ward: '',
      isDefault: false,
    },
  })

  function handleProvinceChange(code: string) {
    setProvinceCode(code)
    form.setValue('province', code)
    form.setValue('ward', '')
  }

  async function onSubmit(data: AddressFormValues) {
    setIsLoading(true)

    try {
      const provinceName =
        PROVINCES.find((p) => p.code === data.province)?.name || data.province
      const wardName =
        wards.find((w) => w.code === data.ward)?.name || data.ward

      const payload = {
        street: data.street,
        city: `${wardName}, ${provinceName}`,
        state: '',
        postalCode: '',
        country: 'Việt Nam',
        isDefault: data.isDefault,
      }

      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to add address')
      }

      toast({
        title: 'Thành công',
        description: 'Địa chỉ giao hàng đã được thêm.',
      })

      form.reset()
      setProvinceCode('')
      router.refresh()
    } catch (error) {
      console.error(error)
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='street'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ cụ thể</FormLabel>
              <FormControl>
                <Input placeholder='123 Đường ABC, Phường XYZ' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name='isDefault'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel className='cursor-pointer'>Đặt làm địa chỉ mặc định</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isLoading} className='w-full'>
          {isLoading ? 'Đang thêm...' : 'Thêm địa chỉ'}
        </Button>
      </form>
    </Form>
  )
}
