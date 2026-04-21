import Link from 'next/link'
import prisma from '@/lib/prisma'
import { FeaturedBrands } from '@/components/home/featured-brands'
import { ProductSection } from '@/components/home/product-section'
import { Button } from '@/components/ui/button'
import { Shield, Truck, RotateCcw, CreditCard } from 'lucide-react'
import { HeroCarousel } from '@/components/home/hero-carousel'

async function getHomeData() {
  const [newArrivals, bestSellers, discountedProducts] = await Promise.all([
    prisma.product.findMany({
      where: { stock: { gt: 0 } },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { reviews: true } } },
    }),
    prisma.product.findMany({
      where: { stock: { gt: 0 } },
      take: 8,
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { reviews: true } } },
    }),
    prisma.product.findMany({
      where: { stock: { gt: 0 }, originalPrice: { not: null } },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { reviews: true } } },
    }),
  ])

  return { newArrivals, bestSellers, discountedProducts }
}


export default async function HomePage() {
  const { newArrivals, bestSellers, discountedProducts } = await getHomeData()

  return (
    <div className='min-h-screen'>
      {/* Hero Banner Carousel */}
      <section className='relative'>
        <HeroCarousel />
      </section>

      {/* Featured Brands */}
      <FeaturedBrands />

      {/* New Arrivals */}
      <ProductSection
        title='Hàng Mới Về'
        subtitle='Những mẫu giày mới nhất vừa cập bến'
        products={newArrivals}
        viewAllHref='/products?sort=created_desc'
      />

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <ProductSection
          title='Bán Chạy Nhất'
          subtitle='Những lựa chọn phổ biến nhất của khách hàng'
          products={bestSellers}
          viewAllHref='/products'
        />
      )}

      {/* Discounted Products */}
      {discountedProducts.length > 0 && (
        <ProductSection
          title='Khuyến Mãi Nổi Bật'
          subtitle='Những lựa chọn ưu đãi hấp dẫn nhất dành cho bạn'
          products={discountedProducts}
          viewAllHref='/products?hasDiscount=true'
        />
      )}

      {/* Features / Trust Badges */}
      <section className='bg-gray-50 py-12 mt-8'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8'>
            {[
              { icon: Truck, label: 'Miễn Phí Vận Chuyển', desc: 'Cho đơn hàng từ ₫2.500.000' },
              { icon: Shield, label: 'Thanh Toán An Toàn', desc: '100% bảo mật thanh toán' },
              { icon: RotateCcw, label: 'Đổi Trả Dễ Dàng', desc: 'Chính sách đổi trả 30 ngày' },
              { icon: CreditCard, label: 'Thanh Toán Linh Hoạt', desc: 'Nhiều hình thức thanh toán' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className='flex flex-col items-center text-center gap-2'>
                <div className='w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center'>
                  <Icon className='h-6 w-6 text-black' />
                </div>
                <div>
                  <p className='font-semibold text-sm'>{label}</p>
                  <p className='text-xs text-muted-foreground'>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
