'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, User, LogOut, X, ShoppingBag, ChevronDown, Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession, signIn, signOut } from 'next-auth/react'
import { CartBadge } from '@/components/layout/cart-badge'
import { useVisualSearchStore } from '@/store/use-visual-search'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const BRANDS = [
  { value: 'NIKE', label: 'Nike' },
  { value: 'ADIDAS', label: 'Adidas' },
  { value: 'PUMA', label: 'Puma' },
  { value: 'NEW_BALANCE', label: 'New Balance' },
  { value: 'CONVERSE', label: 'Converse' },
  { value: 'VANS', label: 'Vans' },
]

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showCameraDropdown, setShowCameraDropdown] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const {
    state: vsState,
    preview: vsPreview,
    mlInfo: vsMlInfo,
    setPreview,
    setState: setVsState,
    setResults,
    setMlInfo,
    setError,
    incrementRetry,
    reset,
  } = useVisualSearchStore()

  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCameraDropdown(false)
      }
    }
    if (showCameraDropdown) {
      document.addEventListener('mousedown', handler)
    }
    return () => document.removeEventListener('mousedown', handler)
  }, [showCameraDropdown])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      reset()
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    reset()
    router.push('/products')
  }

  const handleFileSelect = useCallback(
    (file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'File quá lớn', description: 'Vui lòng chọn ảnh dưới 10MB', variant: 'destructive' })
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    },
    [toast, setPreview]
  )

  const handleClearVisualSearch = useCallback(() => {
    setSelectedFile(null)
    reset()
    setShowCameraDropdown(false)
  }, [reset])

  const runVisualSearch = useCallback(async () => {
    if (!vsPreview) return

    setVsState('analyzing')
    setShowCameraDropdown(false)

    try {
      const response = await fetch('/api/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: vsPreview, topK: 12 }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      if (data.results && data.results.length > 0) {
        setResults(data.results)
        setMlInfo(data.mlInfo || null)
        setVsState('results')
        router.push('/products')
      } else {
        setVsState('results')
        setResults([])
        toast({
          title: 'Không tìm thấy sản phẩm',
          description: 'Không có sản phẩm nào phù hợp với hình ảnh này. Thử hình ảnh khác.',
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đã xảy ra lỗi'
      setError(msg)
      incrementRetry()

      toast({
        title: 'Lỗi tìm kiếm hình ảnh',
        description: msg,
        variant: 'destructive',
      })
    }
  }, [vsPreview, router, toast, setVsState, setResults, setMlInfo, setError, incrementRetry])

  // Auto-trigger search when preview is ready
  useEffect(() => {
    if (vsPreview && selectedFile && vsState === 'idle') {
      const timer = setTimeout(() => runVisualSearch(), 500)
      return () => clearTimeout(timer)
    }
  }, [vsPreview, selectedFile, vsState, runVisualSearch])

  return (
    <header className='border-b sticky top-0 z-50 bg-white'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <div className='flex-shrink-0'>
            <Link
              href='/'
              className='flex items-center gap-2 text-xl font-bold tracking-tight'
            >
              <ShoppingBag className='h-6 w-6' />
              <span>Viet Sneaker</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className='hidden md:flex items-center gap-1'>
            {/* Home */}
            <Link
              href='/'
              className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors'
            >
              Trang chủ
            </Link>

            {/* Products */}
            <Link
              href='/products'
              className='px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors'
            >
              Sản phẩm
            </Link>

            {/* Brands Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors'>
                  Thương hiệu
                  <ChevronDown className='h-4 w-4' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-48'>
                {BRANDS.map((brand) => (
                  <DropdownMenuItem key={brand.value} asChild>
                    <Link href={`/brands/${brand.value}`}>
                      {brand.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href='/brands' className='font-medium text-primary'>
                    Xem tất cả thương hiệu
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sale */}
            <Link
              href='/products?sort=price_asc&maxPrice=50'
              className='px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors'
            >
              Khuyến mãi
            </Link>

          </nav>

          {/* Search + Visual Search */}
          <div className='hidden sm:block flex-1 max-w-2xl mx-6'>
            <form onSubmit={handleSearch} className='relative flex items-center gap-2'>
              <div className='relative flex-1'>
                <Input
                  type='search'
                  placeholder='Tìm kiếm giày...'
                  className='w-full pl-10 pr-10 bg-gray-50 border-gray-200 focus:bg-white'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                {(searchQuery || vsState !== 'idle') && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent'
                    onClick={() => {
                      if (vsState !== 'idle') {
                        handleClearVisualSearch()
                      } else {
                        clearSearch()
                      }
                    }}
                  >
                    <X className='h-4 w-4 text-gray-400' />
                  </Button>
                )}
              </div>

              {/* Camera / Visual Search Button */}
              <div ref={dropdownRef} className='relative'>
                <Button
                  type='button'
                  variant={vsPreview ? 'default' : 'outline'}
                  size='icon'
                  className='h-10 w-10 shrink-0 relative'
                  title='Tìm giày bằng hình ảnh'
                  onClick={() => {
                    if (vsPreview) {
                      setShowCameraDropdown((v) => !v)
                    } else {
                      cameraInputRef.current?.click()
                    }
                  }}
                  disabled={vsState === 'analyzing'}
                >
                  {vsState === 'analyzing' ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : vsPreview ? (
                    <Image
                      src={vsPreview}
                      alt='Preview'
                      width={20}
                      height={20}
                      className='rounded object-cover'
                      unoptimized
                    />
                  ) : (
                    <Camera className='h-4 w-4' />
                  )}
                </Button>

                {/* Hidden file input */}
                <input
                  ref={cameraInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                    e.target.value = ''
                  }}
                />

                {/* Preview dropdown */}
                {showCameraDropdown && vsPreview && (
                  <div className='absolute top-full right-0 mt-2 z-50 bg-white rounded-xl shadow-lg border p-3 w-64'>
                    <div className='aspect-square relative rounded-lg overflow-hidden bg-gray-100 mb-3'>
                      <Image src={vsPreview} alt='Preview' fill className='object-contain' unoptimized />
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        className='flex-1 gap-1.5'
                        onClick={() => {
                          setShowCameraDropdown(false)
                          cameraInputRef.current?.click()
                        }}
                      >
                        <Camera className='h-3 w-3' />
                        Đổi ảnh
                      </Button>
                      <Button size='sm' variant='outline' onClick={handleClearVisualSearch}>
                        Xoá
                      </Button>
                    </div>
                    {vsState === 'results' && vsMlInfo && (
                      <div className='mt-3 pt-3 border-t text-xs text-muted-foreground space-y-1'>
                        <p>
                          <strong>Thương hiệu:</strong>{' '}
                          {vsMlInfo.predictedBrand.replace(/_/g, ' ')}
                        </p>
                        <p>Tìm thấy {vsMlInfo.brandScores[0]?.brand ? '' : ''} sản phẩm tương tự</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right Actions */}
          <div className='flex items-center gap-2'>
            {/* Mobile Search */}
            <Button variant='ghost' size='icon' asChild className='sm:hidden'>
              <Link href='/products'>
                <Search className='h-5 w-5' />
              </Link>
            </Button>

            <CartBadge />

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    <span className='hidden sm:inline-block max-w-[100px] truncate'>
                      {session.user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-60'>
                  <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col space-y-1'>
                      <p className='text-sm font-medium leading-none'>
                        {session.user.name}
                      </p>
                      <p className='text-xs leading-none text-muted-foreground'>
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href='/dashboard/orders'>Đơn hàng của tôi</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href='/dashboard/profile'>Hồ sơ</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href='/dashboard/addresses'>Địa chỉ</Link>
                  </DropdownMenuItem>
                  {session.user.role === 'ADMIN' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href='/admin'>Quản trị</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className='text-red-600'
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant='default' size='sm' onClick={() => signIn()}>
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
