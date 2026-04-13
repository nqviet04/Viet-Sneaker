'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, AlertTriangle, ArrowUpRight, XCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface SizeStock {
  size: string
  stock: number
  isLow: boolean
  isOut: boolean
}

interface LowStockProduct {
  id: string
  name: string
  brand: string
  image?: string
  images?: string[]
  stock: number
  sizes?: SizeStock[]
}

interface OutOfStockProduct {
  id: string
  name: string
  brand: string
  images?: string[]
  image?: string
  outSizes?: string[]
  lowSizes?: { size: string; stock: number }[]
}

interface LowStockAlertsProps {
  lowStock: LowStockProduct[]
  outOfStock: OutOfStockProduct[]
}

function SizePills({ sizes }: { sizes: SizeStock[] }) {
  return (
    <div className='flex flex-wrap gap-1 mt-1'>
      {sizes.map((s) => (
        <span
          key={s.size}
          className={`
            text-[10px] px-1.5 py-0.5 rounded border font-mono font-medium
            ${s.isOut
              ? 'bg-red-50 text-red-600 border-red-200'
              : s.isLow
              ? 'bg-orange-50 text-orange-600 border-orange-200'
              : 'bg-gray-50 text-gray-600 border-gray-200'
            }
          `}
          title={`Size ${s.size}: ${s.stock} in stock`}
        >
          {s.size}:{s.stock}
        </span>
      ))}
    </div>
  )
}

function OutSizePills({ sizes }: { sizes: string[] }) {
  return (
    <div className='flex flex-wrap gap-1 mt-1'>
      {sizes.map((size) => (
        <span
          key={size}
          className='text-[10px] px-1.5 py-0.5 rounded border bg-red-50 text-red-600 border-red-200 font-mono font-medium'
          title={`Size ${size} is out of stock`}
        >
          {size}
        </span>
      ))}
    </div>
  )
}

export function LowStockAlerts({ lowStock, outOfStock }: LowStockAlertsProps) {
  const totalAlerts = lowStock.length + outOfStock.length

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center gap-2'>
          <AlertTriangle className='h-4 w-4 text-orange-500' />
          <CardTitle className='text-base'>Stock Alerts</CardTitle>
        </div>
        <div className='flex items-center gap-2'>
          {totalAlerts > 0 && (
            <Badge variant='destructive' className='text-xs'>
              {totalAlerts} items
            </Badge>
          )}
          <Button variant='ghost' size='sm' asChild className='h-8 text-xs'>
            <Link href='/admin/inventory'>
              Manage <ArrowUpRight className='ml-1 h-3 w-3' />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Out of Stock Section - sizes with zero inventory */}
        {outOfStock.length > 0 && (
          <div className='space-y-2'>
            <div className='flex items-center gap-1 text-xs font-semibold text-red-600 uppercase tracking-wide'>
              <XCircle className='h-3 w-3' />
              Out of Stock ({outOfStock.length})
            </div>
            <div className='space-y-2 max-h-40 overflow-y-auto'>
              {outOfStock.slice(0, 5).map((product) => {
                const img = product.images?.[0] || product.image || ''
                return (
                  <div
                    key={product.id}
                    className='flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-3 py-2'
                  >
                    <div className='flex items-center gap-2 min-w-0'>
                      {img ? (
                        <Image
                          src={img}
                          alt={product.name}
                          width={28}
                          height={28}
                          className='rounded object-cover flex-shrink-0'
                        />
                      ) : (
                        <div className='h-7 w-7 rounded bg-gray-200 flex-shrink-0' />
                      )}
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-medium'>{product.name}</p>
                        <p className='text-xs text-muted-foreground'>{product.brand}</p>
                        {product.outSizes && product.outSizes.length > 0 && (
                          <OutSizePills sizes={product.outSizes} />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Low Stock Section - sizes with < 5 pairs */}
        {lowStock.length > 0 && (
          <div className='space-y-2'>
            <div className='flex items-center gap-1 text-xs font-semibold text-orange-600 uppercase tracking-wide'>
              <Package className='h-3 w-3' />
              Low Stock ({lowStock.length})
            </div>
            <div className='space-y-2 max-h-48 overflow-y-auto'>
              {lowStock.slice(0, 8).map((product) => {
                const img = product.images?.[0] || product.image || ''
                return (
                  <div
                    key={product.id}
                    className='flex items-center justify-between rounded-md border px-3 py-2 hover:bg-gray-50 transition-colors'
                  >
                    <div className='flex items-center gap-2 min-w-0'>
                      {img ? (
                        <Image
                          src={img}
                          alt={product.name}
                          width={28}
                          height={28}
                          className='rounded object-cover flex-shrink-0'
                        />
                      ) : (
                        <div className='h-7 w-7 rounded bg-gray-200 flex-shrink-0' />
                      )}
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-medium'>{product.name}</p>
                        <p className='text-xs text-muted-foreground'>{product.brand}</p>
                        {product.sizes && product.sizes.length > 0 ? (
                          <SizePills sizes={product.sizes} />
                        ) : (
                          <p className='text-xs text-orange-500 mt-0.5'>
                            Stock: {product.stock}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalAlerts === 0 && (
          <div className='flex flex-col items-center justify-center py-6 text-center'>
            <div className='rounded-full bg-green-100 p-3 mb-2'>
              <Package className='h-5 w-5 text-green-600' />
            </div>
            <p className='text-sm font-medium text-green-700'>All stocked up!</p>
            <p className='text-xs text-muted-foreground mt-1'>
              No products are running low on inventory.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
