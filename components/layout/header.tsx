'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, User, LogOut, X, ShoppingBag, ChevronDown, Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession, signOut } from 'next-auth/react'
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
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const mobileCameraInputRef = useRef<HTMLInputElement>(null)
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

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)

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
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setPreview(dataUrl)
        setVsState('analyzing')
        setShowCameraDropdown(false)

        fetch('/api/visual-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl, topK: 12 }),
        })
          .then((res) => res.json())
          .then((data) => {
            // FIX: check success field from API response
            if (data.success && data.results?.length > 0) {
              setResults(data.results)
              setMlInfo(data.mlInfo || null)
              setVsState('results')
              router.push('/products')
            } else if (data.success && data.results?.length === 0) {
              // API succeeded but no products found
              setVsState('results')
              setResults([])
              setMlInfo(data.mlInfo || null)
              toast({
                title: 'Không tìm thấy sản phẩm',
                description: 'Không có sản phẩm nào phù hợp với hình ảnh này. Thử hình ảnh khác.',
              })
            } else {
              // API returned an error
              const errorMsg = data.error || 'Đã xảy ra lỗi khi tìm kiếm'
              setError(errorMsg)
              incrementRetry()
              setVsState('error')
              toast({
                title: 'Lỗi tìm kiếm hình ảnh',
                description: errorMsg,
                variant: 'destructive',
              })
            }
          })
          .catch((err) => {
            const msg = err instanceof Error ? err.message : 'Không thể kết nối đến server'
            setError(msg)
            incrementRetry()
            setVsState('error')
            toast({
              title: 'Lỗi tìm kiếm hình ảnh',
              description: msg,
              variant: 'destructive',
            })
          })
      }
      reader.readAsDataURL(file)
    },
    [toast, router, setPreview, setVsState, setShowCameraDropdown, setResults, setMlInfo, setError, incrementRetry]
  )

  const handleClearVisualSearch = useCallback(() => {
    setSelectedFile(null)
    reset()
    setShowCameraDropdown(false)
  }, [reset])

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (mobileSearchQuery.trim()) {
      setSearchQuery(mobileSearchQuery.trim())
      reset()
      router.push(`/products?search=${encodeURIComponent(mobileSearchQuery.trim())}`)
      setMobileSearchOpen(false)
    }
  }

  const handleMobileFileSelect = useCallback(
    (file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'File quá lớn', description: 'Vui lòng chọn ảnh dưới 10MB', variant: 'destructive' })
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setPreview(dataUrl)
        setVsState('analyzing')
        setShowCameraDropdown(false)

        fetch('/api/visual-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl, topK: 12 }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.results?.length > 0) {
              setResults(data.results)
              setMlInfo(data.mlInfo || null)
              setVsState('results')
              router.push('/products')
              setMobileSearchOpen(false)
            } else if (data.success && data.results?.length === 0) {
              setVsState('results')
              setResults([])
              setMlInfo(data.mlInfo || null)
              toast({
                title: 'Không tìm thấy sản phẩm',
                description: 'Không có sản phẩm nào phù hợp với hình ảnh này. Thử hình ảnh khác.',
              })
            } else {
              const errorMsg = data.error || 'Đã xảy ra lỗi khi tìm kiếm'
              setError(errorMsg)
              incrementRetry()
              setVsState('error')
              toast({
                title: 'Lỗi tìm kiếm hình ảnh',
                description: errorMsg,
                variant: 'destructive',
              })
            }
          })
          .catch((err) => {
            const msg = err instanceof Error ? err.message : 'Không thể kết nối đến server'
            setError(msg)
            incrementRetry()
            setVsState('error')
            toast({
              title: 'Lỗi tìm kiếm hình ảnh',
              description: msg,
              variant: 'destructive',
            })
          })
      }
      reader.readAsDataURL(file)
    },
    [toast, router, setPreview, setVsState, setShowCameraDropdown, setResults, setMlInfo, setError, incrementRetry]
  )

  return (
    <header className='border-b sticky top-0 z-50 bg-white'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4'>
          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='lg:hidden flex-shrink-0'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Mở menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='w-72 p-0'>
              <SheetTitle className='sr-only'>Menu</SheetTitle>
              <div className='flex flex-col h-full'>
                <div className='flex items-center gap-2 p-4 border-b'>
                  <ShoppingBag className='h-5 w-5' />
                  <span className='text-lg font-bold'>Viet Sneaker</span>
                </div>
                <nav className='flex-1 overflow-y-auto py-2'>
                  <Link
                    href='/'
                    onClick={() => setMobileMenuOpen(false)}
                    className='flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors'
                  >
                    Trang chủ
                  </Link>
                  <Link
                    href='/products'
                    onClick={() => setMobileMenuOpen(false)}
                    className='flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors'
                  >
                    Sản phẩm
                  </Link>
                  <div className='px-4 py-2'>
                    <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1'>Thương hiệu</p>
                    <div className='space-y-1'>
                      {BRANDS.map((brand) => (
                        <Link
                          key={brand.value}
                          href={`/brands/${brand.value}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className='flex items-center px-2 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors'
                        >
                          {brand.label}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href='/brands'
                      onClick={() => setMobileMenuOpen(false)}
                      className='flex items-center px-2 py-2 text-sm font-medium text-primary hover:bg-gray-50 rounded-md transition-colors mt-1'
                    >
                      Xem tất cả thương hiệu
                    </Link>
                  </div>
                  <div className='border-t mt-2 pt-2'>
                    <Link
                      href='/products?hasDiscount=true'
                      onClick={() => setMobileMenuOpen(false)}
                      className='flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors'
                    >
                      Khuyến mãi
                    </Link>
                  </div>
                </nav>
                {session && (
                  <div className='border-t p-4'>
                    <p className='text-xs text-gray-400 mb-2'>Tài khoản</p>
                    <Link
                      href='/dashboard/orders'
                      onClick={() => setMobileMenuOpen(false)}
                      className='block py-2 text-sm font-medium text-gray-700 hover:text-gray-900'
                    >
                      Đơn hàng của tôi
                    </Link>
                    <Link
                      href='/dashboard/profile'
                      onClick={() => setMobileMenuOpen(false)}
                      className='block py-2 text-sm font-medium text-gray-700 hover:text-gray-900'
                    >
                      Hồ sơ
                    </Link>
                    <Link
                      href='/dashboard/addresses'
                      onClick={() => setMobileMenuOpen(false)}
                      className='block py-2 text-sm font-medium text-gray-700 hover:text-gray-900'
                    >
                      Địa chỉ
                    </Link>
                    {session.user.role === 'ADMIN' && (
                      <Link
                        href='/admin'
                        onClick={() => setMobileMenuOpen(false)}
                        className='block py-2 text-sm font-medium text-gray-700 hover:text-gray-900'
                      >
                        Quản trị
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Left: Logo */}
          <div className='flex-shrink-0'>
            <Link
              href='/'
              className='flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight'
            >
              <ShoppingBag className='h-5 w-5 sm:h-6 sm:w-6' />
              <span className='hidden lg:inline'>Viet-Sneaker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden lg:flex items-center gap-1'>
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
              href='/products?hasDiscount=true'
              className='px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors'
            >
              Khuyến mãi
            </Link>
          </nav>

          {/* Spacer */}
          <div className='flex-1' />

          {/* Right Actions */}
          <div className='flex items-center gap-1 sm:gap-2'>
            {/* Mobile Search Sheet (md and below) */}
            <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
              <SheetTrigger asChild>
                <Button variant='ghost' size='icon' className='lg:hidden flex-shrink-0'>
                  <Search className='h-5 w-5' />
                  <span className='sr-only'>Tìm kiếm</span>
                </Button>
              </SheetTrigger>
              <SheetContent side='top' className='p-0 pt-14'>
                <SheetTitle className='sr-only'>Tìm kiếm</SheetTitle>
                <div className='p-4'>
                  <form onSubmit={handleMobileSearch} className='flex items-center gap-2'>
                    <div className='relative flex-1'>
                      <Input
                        ref={mobileSearchInputRef}
                        type='search'
                        placeholder='Tìm kiếm giày...'
                        className='w-full pl-10 pr-10 bg-gray-50 border-gray-200'
                        value={mobileSearchQuery}
                        onChange={(e) => setMobileSearchQuery(e.target.value)}
                        autoFocus
                      />
                      <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                      {mobileSearchQuery && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent'
                          onClick={() => setMobileSearchQuery('')}
                        >
                          <X className='h-4 w-4 text-gray-400' />
                        </Button>
                      )}
                    </div>
                    <Button type='submit' size='icon' disabled={!mobileSearchQuery.trim()}>
                      <Search className='h-4 w-4' />
                    </Button>
                    {/* Visual Search Camera */}
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      onClick={() => {
                        mobileCameraInputRef?.current?.click()
                      }}
                      title='Tìm giày bằng hình ảnh'
                    >
                      <Camera className='h-4 w-4' />
                    </Button>
                  </form>
                  <input
                    ref={mobileCameraInputRef}
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleMobileFileSelect(file)
                      e.target.value = ''
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Tablet/Desktop Search (md and up) */}
            <div className='hidden lg:flex min-w-[400px] flex-1 justify-center px-2'>
              <form onSubmit={handleSearch} className='relative flex items-center gap-2 w-full'>
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
                          <p>Tìm thấy sản phẩm tương tự</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </form>
            </div>

            <CartBadge />

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    <span className='hidden sm:inline-block max-w-[120px] truncate'>
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
              <div className='flex items-center gap-2'>
                <Button variant='ghost' size='sm' asChild>
                  <Link href='/sign-in'>Đăng nhập</Link>
                </Button>
                <Button variant='default' size='sm' asChild>
                  <Link href='/sign-up'>Đăng ký</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
