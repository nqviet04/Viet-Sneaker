import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ProductCard } from '@/components/ui/product-card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Home, ChevronRight } from 'lucide-react'

type tParams = Promise<{ brand: string }>

interface BrandPageProps {
  params: tParams
}

// Map brand enum values to display labels
const BRAND_LABELS: Record<string, string> = {
  NIKE: 'Nike',
  ADIDAS: 'Adidas',
  PUMA: 'Puma',
  NEW_BALANCE: 'New Balance',
  CONVERSE: 'Converse',
  VANS: 'Vans',
}

const BRAND_COLORS: Record<string, string> = {
  NIKE: 'bg-black',
  ADIDAS: 'bg-blue-600',
  PUMA: 'bg-red-500',
  NEW_BALANCE: 'bg-orange-500',
  CONVERSE: 'bg-red-600',
  VANS: 'bg-neutral-800',
}

export default async function BrandPage(props: BrandPageProps) {
  const { brand } = await props.params

  // Validate brand
  if (!BRAND_LABELS[brand]) {
    notFound()
  }

  const products = await prisma.product.findMany({
    where: {
      brand: brand as any,
      stock: { gt: 0 },
    },
    include: {
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const label = BRAND_LABELS[brand]
  const bgColor = BRAND_COLORS[brand] || 'bg-gray-500'

  // Get counts by gender
  const genderCounts = products.reduce(
    (acc, p) => {
      const g = p.gender || 'UNISEX'
      acc[g] = (acc[g] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-1 text-sm text-muted-foreground mb-6'>
        <Link href='/' className='hover:text-foreground transition-colors'>
          <Home className='h-4 w-4' />
        </Link>
        <ChevronRight className='h-4 w-4' />
        <span className='text-foreground font-medium'>Brands</span>
        <ChevronRight className='h-4 w-4' />
        <span className='text-foreground font-medium'>{label}</span>
      </nav>

      {/* Brand Hero */}
      <div className={`rounded-2xl ${bgColor} text-white p-8 mb-8`}>
        <div className='max-w-2xl'>
          <h1 className='text-4xl font-black tracking-widest uppercase mb-2'>
            {label}
          </h1>
          <p className='text-white/80 text-lg'>
            Explore our curated collection of {label} shoes. {products.length}{' '}
            products available.
          </p>
          <div className='flex flex-wrap gap-2 mt-4'>
            {Object.entries(genderCounts).map(([gender, count]) => (
              <Badge
                key={gender}
                variant='secondary'
                className='bg-white/20 text-white border-0'
              >
                {gender.replace('_', ' ')} ({count})
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Filter by Gender */}
      <div className='flex items-center gap-3 mb-6'>
        <span className='text-sm font-medium'>Filter by:</span>
        <div className='flex flex-wrap gap-2'>
          <Link
            href={`/brands/${brand}`}
            className='px-3 py-1 text-sm rounded-full border hover:bg-gray-100 transition-colors'
          >
            All
          </Link>
          {Object.keys(genderCounts).map((gender) => (
            <Link
              key={gender}
              href={`/products?brands=${brand}&gender=${gender}`}
              className='px-3 py-1 text-sm rounded-full border hover:bg-gray-100 transition-colors'
            >
              {gender.replace('_', ' ')}
            </Link>
          ))}
        </div>
      </div>

      {/* Products */}
      {products.length === 0 ? (
        <div className='text-center py-16'>
          <p className='text-muted-foreground text-lg'>
            No products available for this brand.
          </p>
          <Link
            href='/products'
            className='text-sm text-foreground underline mt-2 inline-block'
          >
            Browse all products
          </Link>
        </div>
      ) : (
        <>
          <p className='text-sm text-muted-foreground mb-4'>
            {products.length} products
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} showBadges />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
