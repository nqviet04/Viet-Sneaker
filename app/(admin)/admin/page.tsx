import { MetricsCards } from '@/components/admin/metrics-cards'
import { RevenueChart } from '@/components/admin/revenue-chart'
import { OrderStats } from '@/components/admin/order-stats'
import { RecentOrders } from '@/components/admin/recent-orders'
import { DashboardWidgets } from '@/components/admin/dashboard-widgets'
import {
  getRevenueData,
  getOrderStats,
  getRecentOrders,
  getLowStockProducts,
  getOutOfStockProducts,
  getTopProducts,
  getCustomerInsights,
  getCustomerAcquisitionData,
  getTopCustomers,
} from '@/lib/analytics'

export default async function AdminDashboardPage() {
  const [
    revenueData,
    orderStats,
    recentOrders,
    lowStock,
    outOfStock,
    topProductsData,
    insights,
    acquisitionData,
    topCustomers,
  ] = await Promise.all([
    getRevenueData(),
    getOrderStats(),
    getRecentOrders(5),
    getLowStockProducts(10),
    getOutOfStockProducts(),
    getTopProducts(10, '30d'),
    getCustomerInsights(),
    getCustomerAcquisitionData(30),
    getTopCustomers(5),
  ])

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Bảng Điều Khiển</h2>
        <p className='text-muted-foreground'>Chào mừng đến với trang quản trị</p>
      </div>

      {/* Key Metrics */}
      <MetricsCards />

      {/* Charts Grid */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <RevenueChart data={revenueData} />
        <OrderStats data={orderStats} />
      </div>

      {/* New Widgets: Top Products, Customer Insights, Low Stock */}
      <DashboardWidgets
        lowStock={lowStock}
        outOfStock={outOfStock}
        topProductsData={topProductsData}
        topProductsTimeRange='30d'
        insights={insights}
        acquisitionData={acquisitionData}
        topCustomers={topCustomers}
      />

      {/* Recent Orders */}
      <RecentOrders orders={recentOrders} />
    </div>
  )
}
