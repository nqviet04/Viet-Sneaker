'use client'

import { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const PROMO_BANNERS = [
  {
    image: '/images/slide-1.jpg',
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

function HeroSlide({ banner, index }: { banner: (typeof PROMO_BANNERS)[0]; index: number }) {
  return (
    <div className='relative aspect-[4/3] sm:aspect-video md:aspect-[21/9] w-full overflow-hidden'>
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
      <div className='absolute inset-0 flex flex-col items-center justify-end text-center text-white px-4 pb-12 sm:pb-16 md:pb-20'>
        <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 drop-shadow-lg'>
          {banner.title}
        </h1>
        <p className='text-base sm:text-lg md:text-xl mb-4 sm:mb-6 opacity-90 drop-shadow'>
          {banner.subtitle}
        </p>
        <Button
          asChild
          size='lg'
          className='bg-white text-black hover:bg-gray-100 font-semibold px-6 sm:px-8'
        >
          <Link href={banner.cta.href}>{banner.cta.label}</Link>
        </Button>
      </div>
    </div>
  )
}

export function HeroCarousel() {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }) as any,
  ])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  return (
    <section
      className='relative'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={emblaRef} className='overflow-hidden'>
        <div className='flex'>
          {PROMO_BANNERS.map((banner, index) => (
            <div key={index} className='flex-[0_0_100%] min-w-0'>
              <HeroSlide banner={banner} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant='ghost'
        size='icon'
        className={cn(
          'absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all duration-300',
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
        )}
        onClick={scrollPrev}
      >
        <ChevronLeft className='h-5 w-5 sm:h-6 sm:w-6' />
        <span className='sr-only'>Slide trước</span>
      </Button>

      <Button
        variant='ghost'
        size='icon'
        className={cn(
          'absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all duration-300',
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        )}
        onClick={scrollNext}
      >
        <ChevronRight className='h-5 w-5 sm:h-6 sm:w-6' />
        <span className='sr-only'>Slide tiếp</span>
      </Button>

      {/* Dots */}
      <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2'>
        {PROMO_BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              'rounded-full transition-all duration-300',
              index === selectedIndex
                ? 'w-6 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/75'
            )}
            aria-label={`Chuyển đến slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
