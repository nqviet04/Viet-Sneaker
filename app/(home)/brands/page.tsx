import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Brand } from '@prisma/client'
import { Home, ChevronRight } from 'lucide-react'

const BRAND_META: Record<
  Brand,
  { label: string; tagline: string; bg: string; textColor: string; description: string }
> = {
  NIKE: {
    label: 'Nike',
    tagline: 'Just Do It',
    bg: 'bg-black',
    textColor: 'text-white',
    description:
      'Nike is the world\'s leading sportswear brand, known for innovative designs and cutting-edge technology.',
  },
  ADIDAS: {
    label: 'Adidas',
    tagline: 'Impossible Is Nothing',
    bg: 'bg-blue-600',
    textColor: 'text-white',
    description:
      'Adidas creates sports footwear, apparel, and accessories with a focus on style and performance.',
  },
  PUMA: {
    label: 'Puma',
    tagline: 'Forever Faster',
    bg: 'bg-red-500',
    textColor: 'text-white',
    description:
      'Puma is a German multinational corporation that designs and manufactures athletic and casual footwear.',
  },
  NEW_BALANCE: {
    label: 'New Balance',
    tagline: 'Run Your Way',
    bg: 'bg-orange-500',
    textColor: 'text-white',
    description:
      'New Balance is an American sports footwear and apparel manufacturer known for comfort and quality.',
  },
  CONVERSE: {
    label: 'Converse',
    tagline: 'Shoes Are Boring',
    bg: 'bg-red-600',
    textColor: 'text-white',
    description:
      'Converse is known for its iconic Chuck Taylor All Star sneakers, a symbol of youth culture since 1917.',
  },
  VANS: {
    label: 'Vans',
    tagline: 'Off The Wall',
    bg: 'bg-neutral-800',
    textColor: 'text-white',
    description:
      'Vans is a manufacturer of skate shoes, known for its classic canvas slip-on and skateboard shoes.',
  },
}

export default async function BrandsPage() {
  // Count products per brand
  const counts = await prisma.product.groupBy({
    by: ['brand'],
    _count: true,
    where: { stock: { gt: 0 } },
  })

  const countMap = Object.fromEntries(
    counts.map((c) => [c.brand, c._count])
  ) as Record<Brand, number>

  const brands = Object.entries(BRAND_META) as [Brand, (typeof BRAND_META)[Brand]][]

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-1 text-sm text-muted-foreground mb-6'>
        <Link href='/' className='hover:text-foreground transition-colors'>
          <Home className='h-4 w-4' />
        </Link>
        <ChevronRight className='h-4 w-4' />
        <span className='text-foreground font-medium'>Brands</span>
      </nav>

      {/* Page Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Shop by Brand</h1>
        <p className='text-muted-foreground'>
          Explore our collection of premium footwear brands
        </p>
      </div>

      {/* Brand Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {brands.map(([brand, meta]) => {
          const productCount = countMap[brand] || 0

          return (
            <Link
              key={brand}
              href={`/brands/${brand}`}
              className={`
                group relative rounded-2xl ${meta.bg} ${meta.textColor}
                overflow-hidden transition-all duration-300
                hover:scale-[1.02] hover:shadow-xl
              `}
            >
              {/* Background pattern */}
              <div className='absolute inset-0 opacity-10'>
                <div
                  className='absolute inset-0'
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                  }}
                />
              </div>

              <div className='relative p-8 min-h-[200px] flex flex-col justify-between'>
                {/* Top: Brand name and tagline */}
                <div>
                  <p className='text-xs font-medium opacity-70 uppercase tracking-widest mb-1'>
                    {meta.tagline}
                  </p>
                  <h2 className='text-4xl font-black tracking-widest uppercase'>
                    {meta.label}
                  </h2>
                </div>

                {/* Bottom: Description and count */}
                <div className='mt-4'>
                  <p className='text-sm opacity-80 line-clamp-2 mb-3'>
                    {meta.description}
                  </p>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-medium opacity-70'>
                      {productCount} {productCount === 1 ? 'product' : 'products'}
                    </span>
                    <span className='text-sm font-semibold group-hover:underline'>
                      Shop now →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
