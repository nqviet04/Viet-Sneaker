import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Brand, Gender, ShoeType } from '@prisma/client'
import { AdminProductsClient } from '@/components/admin/admin-products-client'

export default async function AdminProductsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const [products, brands, genders, shoeTypes] = await Promise.all([
    prisma.product.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { reviews: true } },
      },
    }),
    prisma.product.findMany({
      select: { brand: true },
      distinct: ['brand'],
    }),
    Promise.resolve(Object.values(Gender)),
    Promise.resolve(Object.values(ShoeType)),
  ])

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Sản Phẩm</h2>
        <p className='text-muted-foreground'>
          Quản lý kho sản phẩm, thêm sản phẩm mới và cập nhật sản phẩm hiện có.
        </p>
      </div>

      {/* Client component will handle all interactions */}
      <AdminProductsClient
        initialProducts={products}
        availableBrands={brands.map((b) => b.brand)}
        availableGenders={genders}
        availableShoeTypes={shoeTypes}
      />
    </div>
  )
}
