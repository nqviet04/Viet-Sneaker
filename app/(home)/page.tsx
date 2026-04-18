import Image from 'next/image'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { FeaturedBrands } from '@/components/home/featured-brands'
import { ProductSection } from '@/components/home/product-section'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Shield, Truck, RotateCcw, CreditCard } from 'lucide-react'

async function getHomeData() {
  const [newArrivals, bestSellers] = await Promise.all([
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
  ])

  return { newArrivals, bestSellers }
}

const PROMO_BANNERS = [
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    title: 'Bứt Phá Phong Cách Cùng Mẫu Giày Mới',
    subtitle: 'Khám phá những thiết kế mới nhất dành cho bạn',
    cta: { label: 'Khám Phá Ngay', href: '/products?sort=created_desc' },
  },
  {
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
    title: 'Giảm Giá Đến 50%',
    subtitle: 'Ưu đãi có hạn, mua ngay hôm nay',
    cta: { label: 'Mua Ngay', href: '/products' },
  },
  {
    image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28',
    title: 'Miễn Phí Vận Chuyển',
    subtitle: 'Cho đơn hàng từ ₫2.500.000',
    cta: { label: 'Mua Ngay', href: '/products' },
  },
]

export default async function HomePage() {
  const { newArrivals, bestSellers } = await getHomeData()

  return (
    <div className='min-h-screen'>
      {/* Hero Banner Carousel */}
      <section className='relative'>
        <Carousel opts={{ loop: true }} className='w-full'>
          <CarouselContent>
            {PROMO_BANNERS.map((banner, index) => (
              <CarouselItem key={index}>
                <div className='relative aspect-[21/9] w-full overflow-hidden'>
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className='object-cover'
                    priority={index === 0}
                    sizes='100vw'
                    quality={90}
                  />
                  <div className='absolute inset-0 bg-black/30' />
                  <div className='absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4'>
                    <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg'>
                      {banner.title}
                    </h1>
                    <p className='text-lg sm:text-xl mb-6 opacity-90 drop-shadow'>
                      {banner.subtitle}
                    </p>
                    <Button
                      asChild
                      size='lg'
                      className='bg-white text-black hover:bg-gray-100 font-semibold px-8'
                    >
                      <Link href={banner.cta.href}>{banner.cta.label}</Link>
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className='left-4 hidden md:flex bg-white/80 hover:bg-white' />
          <CarouselNext className='right-4 hidden md:flex bg-white/80 hover:bg-white' />
        </Carousel>
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

      {/* Features / Trust Badges */}
      <section className='bg-gray-50 py-12 mt-8'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
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
