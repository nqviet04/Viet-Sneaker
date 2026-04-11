'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, User, LogOut, X, ShoppingBag, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession, signIn, signOut } from 'next-auth/react'
import { CartBadge } from '@/components/layout/cart-badge'
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

  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    router.push('/products')
  }

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

          {/* Search */}
          <div className='hidden sm:block flex-1 max-w-2xl mx-6'>
            <form onSubmit={handleSearch} className='relative'>
              <Input
                type='search'
                placeholder='Tìm kiếm giày...'
                className='w-full pl-10 pr-10 bg-gray-50 border-gray-200 focus:bg-white'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              {searchQuery && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent'
                  onClick={clearSearch}
                >
                  <X className='h-4 w-4 text-gray-400' />
                </Button>
              )}
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
