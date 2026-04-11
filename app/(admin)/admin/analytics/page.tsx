'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Download, FileText, ShoppingCart, Users, Package } from 'lucide-react'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

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
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-export.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({ title: 'Export Complete', description: `${title} exported successfully.` })
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Could not export data. Please try again.',
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
            <Label className='text-xs'>Start Date</Label>
            <Input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='h-8 text-xs'
            />
          </div>
          <div className='space-y-1'>
            <Label className='text-xs'>End Date</Label>
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
          {loading ? 'Exporting...' : 'Export CSV'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function AdminAnalyticsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Analytics & Reports</h2>
        <p className='text-muted-foreground'>
          View sales data and export reports in CSV format.
        </p>
      </div>

      {/* Export Section */}
      <div>
        <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
          <FileText className='h-5 w-5' />
          Export Reports
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <ExportCard
            type='orders'
            icon={ShoppingCart}
            title='Orders Export'
            description='Export all orders with customer and product details'
          />
          <ExportCard
            type='products'
            icon={Package}
            title='Products Export'
            description='Export product catalog with pricing and stock info'
          />
          <ExportCard
            type='customers'
            icon={Users}
            title='Customers Export'
            description='Export customer list with order history'
          />
        </div>
      </div>

      {/* Placeholder for additional analytics charts */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Quick Stats</CardTitle>
          <CardDescription>Overview of your store performance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground text-center py-8'>
            Detailed analytics and charts are available on the main Dashboard page.
            Use the export tools above to download data for external analysis.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
