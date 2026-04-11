'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, ArrowUpRight, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'

interface TopProduct {
  id: string
  name: string
  price: number
  images: string[]
  brand: string
  stock: number
  totalSold: number
  orderCount: number
}

interface TopProductsProps {
  products: TopProduct[]
  timeRange: '7d' | '30d' | '90d' | 'all'
}

const timeRangeLabels = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  'all': 'All time',
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

export function TopProducts({ products, timeRange }: TopProductsProps) {
  const totalSold = products.reduce((sum, p) => sum + p.totalSold, 0)
  const maxSold = Math.max(...products.map((p) => p.totalSold), 1)

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center gap-2'>
          <TrendingUp className='h-4 w-4 text-green-500' />
          <CardTitle className='text-base'>Top Products</CardTitle>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='secondary' className='text-xs'>
            {timeRangeLabels[timeRange]}
          </Badge>
          <Button variant='ghost' size='sm' asChild className='h-8 text-xs'>
            <Link href='/admin/products?sort=best-selling'>
              View all <ArrowUpRight className='ml-1 h-3 w-3' />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <div className='space-y-3'>
            {products.slice(0, 5).map((product, index) => (
              <div key={product.id} className='flex items-center gap-3'>
                {/* Rank */}
                <div
                  className={`
                    flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${index === 1 ? 'bg-gray-100 text-gray-600' : ''}
                    ${index === 2 ? 'bg-orange-100 text-orange-700' : ''}
                    ${index > 2 ? 'bg-gray-50 text-gray-400' : ''}
                  `}
                >
                  {index + 1}
                </div>

                {/* Product Image */}
                <div className='relative flex-shrink-0'>
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={40}
                      height={40}
                      className='rounded-md object-cover'
                    />
                  ) : (
                    <div className='h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center'>
                      <Package className='h-5 w-5 text-gray-400' />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>{product.name}</p>
                  <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <span>{product.brand}</span>
                    <span className='text-gray-300'>|</span>
                    <span>{formatCurrency(product.price)}</span>
                    <span className='text-gray-300'>|</span>
                    <span className={product.stock < 5 ? 'text-orange-500 font-medium' : ''}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>

                {/* Sales Stats */}
                <div className='flex-shrink-0 text-right'>
                  <p className='text-sm font-bold text-green-600'>
                    {formatNumber(product.totalSold)} sold
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {product.orderCount} orders
                  </p>
                </div>
              </div>
            ))}

            {/* Summary Bar */}
            <div className='pt-2 mt-2 border-t'>
              <div className='flex items-center justify-between text-xs text-muted-foreground mb-1'>
                <span>Total units sold</span>
                <span className='font-semibold text-foreground'>
                  {formatNumber(totalSold)}
                </span>
              </div>
              <div className='w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex'>
                {products.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className='bg-gradient-to-r from-green-400 to-green-500 transition-all'
                    style={{ width: `${(product.totalSold / maxSold) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <div className='rounded-full bg-gray-100 p-3 mb-2'>
              <Package className='h-5 w-5 text-gray-400' />
            </div>
            <p className='text-sm font-medium text-gray-500'>No sales data yet</p>
            <p className='text-xs text-muted-foreground mt-1'>
              Top selling products will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
