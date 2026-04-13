'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Download, FileText, ShoppingCart, TrendingUp, Users, Package, Star, Trophy, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'

type ExportType = 'orders' | 'products' | 'customers'

function ExportCard({
  type,
  icon: Icon,
  title,
  description,
}: {
  type: ExportType
  icon: React.ElementType
  title: string
  description: string
}) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type })
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const res = await fetch(`/api/admin/export?${params}`)
      const contentType = res.headers.get('Content-Type')

      if (contentType?.includes('application/json')) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Xuất thất bại')
      }

      if (!res.ok) throw new Error('Xuất thất bại')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-export.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({ title: 'Xuất thành công', description: `${title} đã được xuất thành công.` })
    } catch (error: any) {
      toast({
        title: 'Xuất thất bại',
        description: error.message || 'Không thể xuất dữ liệu. Vui lòng thử lại.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-blue-50 p-2'>
            <Icon className='h-5 w-5 text-blue-600' />
          </div>
          <div>
            <CardTitle className='text-base'>{title}</CardTitle>
            <CardDescription className='text-xs'>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='grid grid-cols-2 gap-2'>
          <div className='space-y-1'>
            <Label className='text-xs'>Ngày bắt đầu</Label>
            <Input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='h-8 text-xs'
            />
          </div>
          <div className='space-y-1'>
            <Label className='text-xs'>Ngày kết thúc</Label>
            <Input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='h-8 text-xs'
            />
          </div>
        </div>
        <Button
          onClick={handleExport}
          disabled={loading}
          size='sm'
          className='w-full'
        >
          <Download className='h-4 w-4 mr-2' />
          {loading ? 'Đang xuất...' : 'Xuất CSV'}
        </Button>
      </CardContent>
    </Card>
  )
}

interface RevenueData {
  date: string
  revenue: number
}

interface QuickStatsProps {
  revenueData: RevenueData[]
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
}

function QuickStats({ revenueData, totalRevenue, totalOrders, totalCustomers }: QuickStatsProps) {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Doanh thu 30 ngày
          </CardTitle>
          <CardDescription>Tổng quan doanh thu theo ngày</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#2563eb' stopOpacity={0.2} />
                    <stop offset='95%' stopColor='#2563eb' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                <XAxis
                  dataKey='date'
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#888888', fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) => formatCurrency(value)}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#888888', fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className='rounded-lg border bg-background p-3 shadow-sm'>
                          <div className='grid grid-cols-2 gap-4'>
                            <div className='flex flex-col'>
                              <span className='text-[0.70rem] uppercase text-muted-foreground'>
                                Ngày
                              </span>
                              <span className='font-bold text-muted-foreground'>
                                {payload[0].payload.date}
                              </span>
                            </div>
                            <div className='flex flex-col'>
                              <span className='text-[0.70rem] uppercase text-muted-foreground'>
                                Doanh thu
                              </span>
                              <span className='font-bold'>
                                {formatCurrency(payload[0].value as number)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='revenue'
                  stroke='#2563eb'
                  fill='url(#colorRevenue)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng quan</CardTitle>
          <CardDescription>Thống kê tổng quát</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex justify-between items-center p-3 bg-muted/50 rounded-lg'>
              <div className='flex items-center gap-3'>
                <TrendingUp className='h-5 w-5 text-blue-600' />
                <span className='text-sm font-medium'>Tổng doanh thu</span>
              </div>
              <span className='text-lg font-bold text-blue-600'>
                {formatCurrency(totalRevenue)}
              </span>
            </div>
            <div className='flex justify-between items-center p-3 bg-muted/50 rounded-lg'>
              <div className='flex items-center gap-3'>
                <ShoppingCart className='h-5 w-5 text-green-600' />
                <span className='text-sm font-medium'>Tổng đơn hàng</span>
              </div>
              <span className='text-lg font-bold text-green-600'>
                {totalOrders}
              </span>
            </div>
            <div className='flex justify-between items-center p-3 bg-muted/50 rounded-lg'>
              <div className='flex items-center gap-3'>
                <Users className='h-5 w-5 text-purple-600' />
                <span className='text-sm font-medium'>Tổng khách hàng</span>
              </div>
              <span className='text-lg font-bold text-purple-600'>
                {totalCustomers}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface AnalyticsData {
  revenueData: RevenueData[]
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  topProducts: TopProduct[]
  topCustomers: TopCustomer[]
  revenueComparison: RevenueComparison
}

interface TopProduct {
  productId: string
  productName: string
  productImage: string | null
  brand: string | null
  totalQuantity: number
  totalRevenue: number
}

interface TopCustomer {
  userId: string
  userName: string
  userEmail: string
  userImage: string | null
  totalSpent: number
  orderCount: number
}

interface RevenueComparison {
  thisMonth: number
  lastMonth: number
  percentageChange: number
  thisMonthOrders: number
  lastMonthOrders: number
}

function TopProductsCard({ products }: { products: TopProduct[] }) {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Star className='h-5 w-5 text-amber-500' />
            Top sản phẩm bán chạy
          </CardTitle>
          <CardDescription>Theo số lượng bán ra tháng này</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground text-center py-8'>
            Chưa có dữ liệu
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Star className='h-5 w-5 text-amber-500' />
          Top sản phẩm bán chạy
        </CardTitle>
        <CardDescription>Theo số lượng bán ra tháng này</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {products.map((product, index) => (
            <div key={product.productId} className='flex items-center gap-3'>
              <span className='flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center'>
                {index + 1}
              </span>
              {product.productImage ? (
                <div className='w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-muted'>
                  <Image
                    src={product.productImage}
                    alt={product.productName}
                    width={40}
                    height={40}
                    className='object-cover w-full h-full'
                  />
                </div>
              ) : (
                <div className='w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0'>
                  <Package className='h-5 w-5 text-muted-foreground' />
                </div>
              )}
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{product.productName}</p>
                {product.brand && (
                  <p className='text-xs text-muted-foreground'>{product.brand}</p>
                )}
              </div>
              <div className='text-right flex-shrink-0'>
                <p className='text-sm font-bold text-green-600'>{product.totalQuantity}</p>
                <p className='text-xs text-muted-foreground'>đã bán</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TopCustomersCard({ customers }: { customers: TopCustomer[] }) {
  if (customers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5 text-purple-500' />
            Top khách hàng VIP
          </CardTitle>
          <CardDescription>Theo tổng chi tiêu tháng này</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground text-center py-8'>
            Chưa có dữ liệu
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Trophy className='h-5 w-5 text-purple-500' />
          Top khách hàng VIP
        </CardTitle>
        <CardDescription>Theo tổng chi tiêu tháng này</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {customers.map((customer, index) => (
            <div key={customer.userId} className='flex items-center gap-3'>
              <span className='flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center'>
                {index + 1}
              </span>
              <div className='w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center'>
                {customer.userImage ? (
                  <Image
                    src={customer.userImage}
                    alt={customer.userName}
                    width={40}
                    height={40}
                    className='object-cover w-full h-full'
                  />
                ) : (
                  <Users className='h-5 w-5 text-muted-foreground' />
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{customer.userName}</p>
                <p className='text-xs text-muted-foreground truncate'>
                  {customer.orderCount} đơn hàng
                </p>
              </div>
              <div className='text-right flex-shrink-0'>
                <p className='text-sm font-bold text-purple-600'>
                  {formatCurrency(customer.totalSpent)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RevenueComparisonCard({ comparison }: { comparison: RevenueComparison }) {
  const isPositive = comparison.percentageChange >= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          {isPositive ? (
            <TrendingUp className='h-5 w-5 text-green-600' />
          ) : (
            <TrendingDown className='h-5 w-5 text-red-500' />
          )}
          So sánh doanh thu
        </CardTitle>
        <CardDescription>Tháng này so với tháng trước</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {/* Percentage change */}
          <div className='text-center py-4'>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold ${
                isPositive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {isPositive ? (
                <TrendingUp className='h-5 w-5' />
              ) : (
                <TrendingDown className='h-5 w-5' />
              )}
              {isPositive ? '+' : ''}
              {comparison.percentageChange.toFixed(1)}%
            </div>
            <p className='text-sm text-muted-foreground mt-2'>
              {isPositive ? 'tăng' : 'giảm'} so với tháng trước
            </p>
          </div>

          {/* Monthly comparison */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-muted/50 p-3 rounded-lg'>
              <p className='text-xs text-muted-foreground mb-1'>Tháng này</p>
              <p className='text-lg font-bold text-green-600'>
                {formatCurrency(comparison.thisMonth)}
              </p>
              <p className='text-xs text-muted-foreground'>
                {comparison.thisMonthOrders} đơn hàng
              </p>
            </div>
            <div className='bg-muted/50 p-3 rounded-lg'>
              <p className='text-xs text-muted-foreground mb-1'>Tháng trước</p>
              <p className='text-lg font-bold text-muted-foreground'>
                {formatCurrency(comparison.lastMonth)}
              </p>
              <p className='text-xs text-muted-foreground'>
                {comparison.lastMonthOrders} đơn hàng
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AdvancedStats({
  topProducts,
  topCustomers,
  revenueComparison,
}: {
  topProducts: TopProduct[]
  topCustomers: TopCustomer[]
  revenueComparison: RevenueComparison
}) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
      <TopProductsCard products={topProducts} />
      <TopCustomersCard customers={topCustomers} />
      <RevenueComparisonCard comparison={revenueComparison} />
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useState(() => {
    async function fetchData() {
      try {
        const [ordersRes, usersRes, analyticsRes] = await Promise.all([
          fetch('/api/admin/orders'),
          fetch('/api/admin/users'),
          fetch('/api/admin/analytics'),
        ])

        const [ordersData, usersData, analyticsResult] = await Promise.all([
          ordersRes.json(),
          usersRes.json(),
          analyticsRes.json(),
        ])

        // Calculate total revenue from orders
        const totalRevenue = ordersData.orders
          ? ordersData.orders
              .filter((o: any) => o.status === 'DELIVERED')
              .reduce((sum: number, o: any) => sum + o.total, 0)
          : 0

        // Generate revenue data from orders
        const revenueByDate: Record<string, number> = {}
        if (ordersData.orders) {
          ordersData.orders
            .filter((o: any) => o.status === 'DELIVERED')
            .forEach((o: any) => {
              const date = new Date(o.createdAt).toLocaleDateString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                month: 'short',
                day: 'numeric',
              })
              revenueByDate[date] = (revenueByDate[date] || 0) + o.total
            })
        }
        const revenueData = Object.entries(revenueByDate).map(([date, revenue]) => ({
          date,
          revenue,
        }))

        setAnalyticsData({
          revenueData,
          totalRevenue,
          totalOrders: ordersData.total || 0,
          totalCustomers: usersData.total || 0,
          topProducts: analyticsResult.topProducts || [],
          topCustomers: analyticsResult.topCustomers || [],
          revenueComparison: analyticsResult.revenueComparison || {
            thisMonth: 0,
            lastMonth: 0,
            percentageChange: 0,
            thisMonthOrders: 0,
            lastMonthOrders: 0,
          },
        })
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  })

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Phân tích & Báo cáo</h2>
        <p className='text-muted-foreground'>
          Xem dữ liệu bán hàng và xuất báo cáo định dạng CSV.
        </p>
      </div>

      {/* Export Section */}
      <div>
        <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
          <FileText className='h-5 w-5' />
          Xuất báo cáo
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <ExportCard
            type='orders'
            icon={ShoppingCart}
            title='Xuất đơn hàng'
            description='Xuất tất cả đơn hàng với thông tin khách hàng và sản phẩm'
          />
          <ExportCard
            type='products'
            icon={Package}
            title='Xuất sản phẩm'
            description='Xuất danh mục sản phẩm với thông tin giá và tồn kho'
          />
          <ExportCard
            type='customers'
            icon={Users}
            title='Xuất khách hàng'
            description='Xuất danh sách khách hàng với lịch sử đặt hàng'
          />
        </div>
      </div>

      {/* Quick Stats with Real Data */}
      <div>
        <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
          <TrendingUp className='h-5 w-5' />
          Thống kê nhanh
        </h3>
        {loading ? (
          <Card>
            <CardContent className='py-8'>
              <p className='text-sm text-muted-foreground text-center'>
                Đang tải dữ liệu...
              </p>
            </CardContent>
          </Card>
        ) : analyticsData ? (
          <QuickStats {...analyticsData} />
        ) : (
          <Card>
            <CardContent className='py-8'>
              <p className='text-sm text-muted-foreground text-center'>
                Không có dữ liệu để hiển thị
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Advanced Analytics */}
      {!loading && analyticsData && (
        <div>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <Star className='h-5 w-5' />
            Thống kê nâng cao
          </h3>
          <AdvancedStats
            topProducts={analyticsData.topProducts}
            topCustomers={analyticsData.topCustomers}
            revenueComparison={analyticsData.revenueComparison}
          />
        </div>
      )}
    </div>
  )
}
