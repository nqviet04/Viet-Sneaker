import { notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { ProductDetail } from '@/components/products/product-detail'
import { ProductReviews } from '@/components/products/product-reviews'
import { ProductRelated } from '@/components/products/product-related'
import { ChevronRight, Home } from 'lucide-react'

type tParams = Promise<{ id: string }>

interface ProductPageProps {
  params: tParams
}

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: {
        include: {
          user: true,
        },
      },
      sizeStock: true,
    },
  })

  if (!product) {
    notFound()
  }

  // Calculate real stock from sizeStock
  const realStock = product.sizeStock.reduce((sum, ss) => sum + ss.stock, 0)

  return {
    ...product,
    stock: realStock,
  }
}

export default async function ProductPage(props: ProductPageProps) {
  const { id } = await props.params
  const product = await getProduct(id)

  const brandLabel = product.brand?.replace(/_/g, ' ') || ''

  return (
    <div className='container mx-auto px-4 py-6'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-1 text-sm text-muted-foreground mb-6'>
        <Link href='/' className='hover:text-foreground transition-colors'>
          <Home className='h-4 w-4' />
        </Link>
        <ChevronRight className='h-4 w-4' />
        <Link
          href={`/products?brands=${product.brand || ''}`}
          className='hover:text-foreground transition-colors'
        >
          {brandLabel}
        </Link>
        <ChevronRight className='h-4 w-4' />
        <span className='text-foreground font-medium truncate max-w-[200px]'>
          {product.name}
        </span>
      </nav>

      {/* Product Grid */}
      <ProductDetail product={product} />

      {/* Size Guide Link */}
      <div className='mb-8'>
        <Link
          href='/size-guide'
          className='text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors'
        >
          Size Guide
        </Link>
      </div>

      {/* Reviews Section */}
      <div className='mb-16'>
        <ProductReviews productId={product.id} reviews={product.reviews} />
      </div>

      {/* Related Products */}
      <div>
        <ProductRelated
          currentProductId={product.id}
          brand={product.brand}
          shoeType={product.shoeType}
        />
      </div>
    </div>
  )
}
