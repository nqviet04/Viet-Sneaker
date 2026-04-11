'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, UserPlus, Repeat, TrendingUp, ArrowUpRight, User } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

interface CustomerInsight {
  totalCustomers: number
  newCustomersThisMonth: number
  returningCustomers: number
  newVsReturningRate: number
  customerGrowth: number
}

interface AcquisitionData {
  date: string
  customers: number
}

interface TopCustomer {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: Date
  totalSpent: number
  orderCount: number
}

interface CustomerInsightsProps {
  insights: CustomerInsight
  acquisitionData: AcquisitionData[]
  topCustomers: TopCustomer[]
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  change?: number
  changeLabel?: string
}) {
  return (
    <div className='flex items-center gap-3 rounded-lg border p-3'>
      <div className='rounded-lg bg-blue-50 p-2'>
        <Icon className='h-4 w-4 text-blue-600' />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-xs text-muted-foreground truncate'>{label}</p>
        <p className='text-lg font-bold truncate'>{value}</p>
        {change !== undefined && (
          <div className='flex items-center gap-1'>
            {change >= 0 ? (
              <TrendingUp className='h-3 w-3 text-green-500' />
            ) : (
              <TrendingUp className='h-3 w-3 text-red-500 rotate-180' />
            )}
            <span
              className={`text-xs font-medium ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change >= 0 ? '+' : ''}
              {change.toFixed(1)}%
            </span>
            {changeLabel && (
              <span className='text-xs text-muted-foreground'>{changeLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className='rounded-lg border bg-background p-2 shadow-sm'>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <p className='text-sm font-bold'>{payload[0].value} new customers</p>
      </div>
    )
  }
  return null
}

export function CustomerInsights({
  insights,
  acquisitionData,
  topCustomers,
}: CustomerInsightsProps) {
  const {
    totalCustomers,
    newCustomersThisMonth,
    returningCustomers,
    customerGrowth,
  } = insights

  return (
    <div className='space-y-4'>
      {/* Overview Stats */}
      <div className='grid grid-cols-2 gap-3'>
        <StatCard
          icon={Users}
          label='Total Customers'
          value={totalCustomers.toLocaleString()}
          change={customerGrowth}
          changeLabel='this month'
        />
        <StatCard
          icon={UserPlus}
          label='New Customers'
          value={newCustomersThisMonth}
        />
      </div>

      {/* Acquisition Chart */}
      {acquisitionData.length > 0 && (
        <div className='rounded-lg border p-3'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-xs font-medium text-muted-foreground'>Customer Acquisition</p>
            <Badge variant='secondary' className='text-xs'>
              30 days
            </Badge>
          </div>
          <div className='h-32'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={acquisitionData}>
                <defs>
                  <linearGradient id='colorCustomers' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey='date'
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval='preserveStartEnd'
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={24}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type='monotone'
                  dataKey='customers'
                  stroke='#3b82f6'
                  strokeWidth={2}
                  fill='url(#colorCustomers)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Customer Split */}
      <div className='rounded-lg border p-3'>
        <div className='flex items-center justify-between mb-2'>
          <p className='text-xs font-medium text-muted-foreground'>
            New vs Returning
          </p>
          <Link
            href='/admin/customers'
            className='text-xs text-blue-600 hover:underline flex items-center gap-1'
          >
            View all <ArrowUpRight className='h-3 w-3' />
          </Link>
        </div>
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-muted-foreground'>New</span>
            <span className='font-medium'>{newCustomersThisMonth}</span>
          </div>
          <div className='w-full h-2 bg-blue-100 rounded-full overflow-hidden'>
            <div
              className='h-full bg-blue-500 transition-all'
              style={{
                width: `${totalCustomers > 0 ? (newCustomersThisMonth / totalCustomers) * 100 : 0}%`,
              }}
            />
          </div>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-muted-foreground'>Returning</span>
            <span className='font-medium'>{returningCustomers}</span>
          </div>
        </div>
      </div>

      {/* Top Customers */}
      {topCustomers.length > 0 && (
        <div className='rounded-lg border p-3'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-xs font-medium text-muted-foreground'>Top Customers</p>
            <span className='text-xs text-muted-foreground'>by revenue</span>
          </div>
          <div className='space-y-2'>
            {topCustomers.slice(0, 3).map((customer, index) => (
              <div
                key={customer.id}
                className='flex items-center gap-2 rounded-md p-1.5 hover:bg-gray-50 transition-colors'
              >
                <div
                  className={`
                    flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${index === 1 ? 'bg-gray-100 text-gray-600' : ''}
                    ${index === 2 ? 'bg-orange-100 text-orange-700' : ''}
                  `}
                >
                  {index + 1}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>
                    {customer.name || 'Guest User'}
                  </p>
                  <p className='text-xs text-muted-foreground truncate'>
                    {customer.email}
                  </p>
                </div>
                <div className='flex-shrink-0 text-right'>
                  <p className='text-sm font-bold'>
                    {formatPrice(customer.totalSpent)}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {customer.orderCount} orders
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
