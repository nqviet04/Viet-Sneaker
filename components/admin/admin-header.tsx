'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  BarChart,
  ShoppingBag,
  LayoutGrid,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useState } from 'react'

const navigation = [
  { name: 'Bảng điều khiển', href: '/admin', icon: LayoutDashboard },
  { name: 'Tồn kho', href: '/admin/inventory', icon: LayoutGrid },
  { name: 'Sản phẩm', href: '/admin/products', icon: Package },
  { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Khách hàng', href: '/admin/customers', icon: Users },
  { name: 'Phân tích', href: '/admin/analytics', icon: BarChart },
  { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
]

export function AdminHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className='border-b bg-white'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-14 sm:h-16 items-center justify-between gap-4'>
          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='md:hidden flex-shrink-0'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='w-64 p-0'>
              <SheetTitle className='sr-only'>Menu</SheetTitle>
              <div className='flex flex-col h-full'>
                <div className='flex items-center gap-2 p-4 border-b'>
                  <ShoppingBag className='h-5 w-5' />
                  <span className='text-lg font-bold'>Admin</span>
                </div>
                <nav className='flex-1 overflow-y-auto py-2'>
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                          isActive
                            ? 'text-black bg-gray-100'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        )}
                      >
                        <item.icon className='h-4 w-4' />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo and Navigation */}
          <div className='flex items-center gap-4 sm:gap-6'>
            <div className='flex items-center gap-3 sm:gap-4'>
              <Link
                href='/'
                className='flex items-center gap-2 text-lg sm:text-xl font-bold'
              >
                <ShoppingBag className='h-5 w-5 sm:h-6 sm:w-6' />
                <span className='hidden xs:inline'>Viet Sneaker</span>
              </Link>
              <div className='h-5 sm:h-6 w-px bg-gray-200 hidden sm:block' />
              <Link href='/admin' className='text-gray-600 hover:text-gray-900 text-sm font-medium'>
                Admin
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className='hidden md:flex items-center gap-4 lg:gap-6'>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-black'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <item.icon className='h-4 w-4' />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
