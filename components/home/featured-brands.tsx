'use client'

import Link from 'next/link'
import { Brand } from '@prisma/client'

const BRANDS: { brand: Brand; label: string; tagline: string; bg: string; text: string }[] = [
  { brand: 'NIKE', label: 'Nike', tagline: 'Just Do It', bg: 'bg-black', text: 'text-white' },
  { brand: 'ADIDAS', label: 'Adidas', tagline: 'Impossible Is Nothing', bg: 'bg-blue-600', text: 'text-white' },
  { brand: 'PUMA', label: 'Puma', tagline: 'Forever Faster', bg: 'bg-red-500', text: 'text-white' },
  { brand: 'NEW_BALANCE', label: 'New Balance', tagline: 'Run Your Way', bg: 'bg-orange-500', text: 'text-white' },
  { brand: 'CONVERSE', label: 'Converse', tagline: 'Shoes Are Boring', bg: 'bg-red-600', text: 'text-white' },
  { brand: 'VANS', label: 'Vans', tagline: 'Off The Wall', bg: 'bg-neutral-800', text: 'text-white' },
]

export function FeaturedBrands() {
  return (
    <section className='py-12'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-8'>
          <h2 className='text-2xl font-bold'>Thương Hiệu Nổi Bật</h2>
          <p className='text-muted-foreground text-sm mt-1'>
            Mua sắm từ các thương hiệu thể thao hàng đầu thế giới
          </p>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'>
          {BRANDS.map(({ brand, label, tagline, bg, text }) => (
            <Link
              key={brand}
              href={`/products?brands=${brand}`}
              className={`
                group relative flex flex-col items-center justify-center
                rounded-xl aspect-square ${bg} ${text}
                overflow-hidden transition-all duration-300
                hover:scale-105 hover:shadow-lg
              `}
            >
              {/* Logo Text */}
              <span className='text-xl font-black tracking-widest uppercase'>
                {label}
              </span>

              {/* Tagline */}
              <span className='text-[10px] font-medium opacity-70 mt-1'>
                {tagline}
              </span>

              {/* Hover overlay */}
              <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors' />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
