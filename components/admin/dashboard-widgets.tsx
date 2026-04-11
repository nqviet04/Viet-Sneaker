'use client'

import { useState } from 'react'
import { LowStockAlerts } from './low-stock-alerts'
import { TopProducts } from './top-products'
import { CustomerInsights } from './customer-insights'
import { TimeRangeSelector } from './time-range-selector'
import { Card } from '@/components/ui/card'

type TimeRange = '7d' | '30d' | '90d' | 'all'

interface DashboardWidgetsProps {
  lowStock: any[]
  outOfStock: any[]
  topProductsData: any[]
  topProductsTimeRange: TimeRange
  insights: any
  acquisitionData: any[]
  topCustomers: any[]
}

export function DashboardWidgets({
  lowStock,
  outOfStock,
  topProductsData,
  topProductsTimeRange: initialTimeRange,
  insights,
  acquisitionData,
  topCustomers,
}: DashboardWidgetsProps) {
  const [topProductsTimeRange, setTopProductsTimeRange] = useState<TimeRange>(initialTimeRange)

  return (
    <div className='space-y-6'>
      {/* Top Products - Full Width */}
      <div className='flex items-center justify-between'>
        <TimeRangeSelector
          value={topProductsTimeRange}
          onChange={setTopProductsTimeRange}
        />
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        {/* Left Column: Top Products */}
        <div className='lg:col-span-2'>
          <TopProducts
            products={topProductsData}
            timeRange={topProductsTimeRange}
          />
        </div>

        {/* Right Column: Customer Insights */}
        <div className='lg:col-span-1'>
          <Card className='h-full'>
            <div className='p-4'>
              <CustomerInsights
                insights={insights}
                acquisitionData={acquisitionData}
                topCustomers={topCustomers}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Low Stock Alerts - Full Width */}
      <LowStockAlerts lowStock={lowStock} outOfStock={outOfStock} />
    </div>
  )
}
