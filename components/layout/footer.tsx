'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Facebook, Instagram, MapPin, Phone, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const BRANDS = [
  { value: 'NIKE', label: 'Nike' },
  { value: 'ADIDAS', label: 'Adidas' },
  { value: 'PUMA', label: 'Puma' },
  { value: 'NEW_BALANCE', label: 'New Balance' },
  { value: 'CONVERSE', label: 'Converse' },
  { value: 'VANS', label: 'Vans' },
]

export function Footer() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setTimeout(() => {
      toast({
        title: 'Cảm ơn bạn đã đăng ký!',
        description: 'Chúng tôi sẽ sớm gửi những ưu đãi độc quyền dành riêng cho bạn.',
      })
      setEmail('')
      setIsLoading(false)
    }, 500)
  }
  return (
    <footer className='bg-gray-900 text-gray-300'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-6 lg:gap-10'>
          {/* Brands */}
          <div>
            <h3 className='font-semibold text-white mb-4'>Thương hiệu</h3>
            <ul className='space-y-2'>
              {BRANDS.map((brand) => (
                <li key={brand.value}>
                  <Link
                    href={`/brands/${brand.value}`}
                    className='text-sm hover:text-white transition-colors'
                  >
                    {brand.label}
                  </Link>
                </li>
              ))}
              <li className='pt-2 border-t border-gray-700'>
                <Link
                  href='/brands'
                  className='text-sm text-white hover:text-gray-300 transition-colors'
                >
                  Xem tất cả →
                </Link>
              </li>
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h3 className='font-semibold text-white mb-4'>Mua sắm</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/products'
                  className='text-sm hover:text-white transition-colors'
                >
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  href='/products?sort=created_desc'
                  className='text-sm hover:text-white transition-colors'
                >
                  Hàng mới về
                </Link>
              </li>
              <li>
                <Link
                  href='/products?hasDiscount=true'
                  className='text-sm text-red-400 hover:text-red-300 transition-colors'
                >
                  Khuyến mãi
                </Link>
              </li>
              <li>
                <Link
                  href='/products?gender=MEN'
                  className='text-sm hover:text-white transition-colors'
                >
                  Nam
                </Link>
              </li>
              <li>
                <Link
                  href='/products?gender=WOMEN'
                  className='text-sm hover:text-white transition-colors'
                >
                  Nữ
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className='font-semibold text-white mb-4'>Hỗ trợ</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/size-guide'
                  className='text-sm hover:text-white transition-colors'
                >
                  Hướng dẫn chọn size
                </Link>
              </li>
              <li>
                <Link
                  href='/shipping'
                  className='text-sm hover:text-white transition-colors'
                >
                  Thông tin vận chuyển
                </Link>
              </li>
              <li>
                <Link
                  href='/returns'
                  className='text-sm hover:text-white transition-colors'
                >
                  Đổi trả
                </Link>
              </li>
              <li>
                <Link
                  href='/contact'
                  className='text-sm hover:text-white transition-colors'
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  href='/faq'
                  className='text-sm hover:text-white transition-colors'
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className='font-semibold text-white mb-4'>Công ty</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/about'
                  className='text-sm hover:text-white transition-colors'
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  href='/privacy'
                  className='text-sm hover:text-white transition-colors'
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href='/terms'
                  className='text-sm hover:text-white transition-colors'
                >
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>

            {/* Social */}
            <div className='mt-6'>
              <h3 className='font-semibold text-white mb-3'>Theo dõi</h3>
              <div className='flex gap-3'>
                <a
                  href='https://facebook.com/nqviet.04'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center'
                  aria-label='Facebook'
                >
                  <Facebook className='h-4 w-4' />
                </a>
                <a
                  href='https://instagram.com/nqviet.04'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center'
                  aria-label='Instagram'
                >
                  <Instagram className='h-4 w-4' />
                </a>
                <a
                  href='https://www.tiktok.com/@qouc_dzviet'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center'
                  aria-label='TikTok'
                >
                  <svg className='h-4 w-4' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.69a8.27 8.27 0 004.76 1.52V6.79a4.85 4.85 0 01-1-.1z' />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Store */}
          <div>
            <h3 className='font-semibold text-white mb-4'>Cửa hàng</h3>
            <div className='space-y-3'>
              <div className='flex gap-2.5 text-sm'>
                <MapPin className='h-4 w-4 flex-shrink-0 mt-0.5 text-gray-500' />
                <span className='text-gray-400 leading-relaxed'>
                  Tòa S3.03, Vinhome Grand Park, Nguyễn Xiển, Long Bình, TP. Hồ Chí Minh
                </span>
              </div>
              <div className='flex gap-2.5 text-sm'>
                <Phone className='h-4 w-4 flex-shrink-0 mt-0.5 text-gray-500' />
                <a
                  href='tel:0339995273'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  033 999 5273
                </a>
              </div>
              <div className='flex gap-2.5 text-sm'>
                <Clock className='h-4 w-4 flex-shrink-0 mt-0.5 text-gray-500' />
                <span className='text-gray-400 leading-relaxed'>
                  Thứ 2 - Thứ 6: 8:00 - 20:00
                  <br className='hidden sm:inline' />
                  <span className='sm:hidden'> | </span>
                  Thứ 7 - CN: 9:00 - 19:00
                </span>
              </div>
            </div>
            <a
              href='https://maps.app.goo.gl/4CSnjLbMMv7tVeau9'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1.5 mt-3 text-sm text-white hover:text-gray-300 transition-colors'
            >
              <MapPin className='h-3.5 w-3.5' />
              Xem trên bản đồ →
            </a>
          </div>
        </div>

        {/* Newsletter */}
        <div className='mt-10 pt-8 border-t border-gray-800'>
          <div className='max-w-md'>
            <h3 className='font-semibold text-white mb-2'>Đăng ký nhận tin</h3>
            <p className='text-sm mb-3'>
              Nhận ưu đãi độc quyền, sản phẩm mới và tips thời trang.
            </p>
            <form className='flex flex-col sm:flex-row gap-2' onSubmit={handleSubscribe} suppressHydrationWarning>
              <input
                type='email'
                placeholder='Email của bạn'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='flex-1 px-3 py-2 sm:py-2 min-h-[42px] rounded-md text-sm bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-500'
                suppressHydrationWarning
              />
              <button
                type='submit'
                disabled={isLoading || !mounted ? false : !email}
                className='px-4 py-2 min-h-[42px] sm:min-h-[auto] rounded-md text-sm bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'
                suppressHydrationWarning
              >
                {isLoading ? '...' : 'Đăng ký'}
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className='mt-10 pt-6 border-t border-gray-800'>
          <p className='text-center text-sm text-gray-500'>
            © {new Date().getFullYear()} Viet Sneaker. Mọi quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  )
}
