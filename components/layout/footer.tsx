'use client'

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react'

const BRANDS = [
  { value: 'NIKE', label: 'Nike' },
  { value: 'ADIDAS', label: 'Adidas' },
  { value: 'PUMA', label: 'Puma' },
  { value: 'NEW_BALANCE', label: 'New Balance' },
  { value: 'CONVERSE', label: 'Converse' },
  { value: 'VANS', label: 'Vans' },
]

export function Footer() {
  return (
    <footer className='bg-gray-900 text-gray-300'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12'>
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
                  href='/products?sort=price_asc&maxPrice=50'
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
                  href='https://facebook.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors'
                  aria-label='Facebook'
                >
                  <Facebook className='h-4 w-4' />
                </a>
                <a
                  href='https://instagram.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors'
                  aria-label='Instagram'
                >
                  <Instagram className='h-4 w-4' />
                </a>
                <a
                  href='https://twitter.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors'
                  aria-label='Twitter'
                >
                  <Twitter className='h-4 w-4' />
                </a>
                <a
                  href='https://youtube.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors'
                  aria-label='YouTube'
                >
                  <Youtube className='h-4 w-4' />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className='mt-10 pt-8 border-t border-gray-800'>
          <div className='max-w-md'>
            <h3 className='font-semibold text-white mb-2'>Đăng ký nhận tin</h3>
            <p className='text-sm mb-3'>
              Nhận ưu đãi độc quyền, sản phẩm mới và tips thời trang.
            </p>
            <form className='flex gap-2' onSubmit={(e) => e.preventDefault()}>
              <input
                type='email'
                placeholder='Email của bạn'
                className='flex-1 px-3 py-2 rounded-md text-sm bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-500'
              />
              <button
                type='submit'
                className='px-4 py-2 rounded-md text-sm bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors'
              >
                Đăng ký
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
