'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  ArrowUpDown,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Plus,
} from 'lucide-react'

type Brand = 'NIKE' | 'ADIDAS' | 'PUMA' | 'NEW_BALANCE' | 'CONVERSE' | 'VANS'

interface InventoryProduct {
  id: string
  name: string
  brand: Brand
  images: string[]
  totalStock: number
  sizes: SizeStock[]
  productSizes?: string[]
}

interface SizeStock {
  size: string
  stock: number
  isLow: boolean
  isOut: boolean
}

const BRANDS: Brand[] = ['NIKE', 'ADIDAS', 'PUMA', 'NEW_BALANCE', 'CONVERSE', 'VANS']
const ALL_SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']

const brandColors: Record<Brand, string> = {
  NIKE: 'bg-black text-white',
  ADIDAS: 'bg-blue-600 text-white',
  PUMA: 'bg-red-500 text-white',
  NEW_BALANCE: 'bg-orange-500 text-white',
  CONVERSE: 'bg-red-600 text-white',
  VANS: 'bg-neutral-800 text-white',
}

function StockCell({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className='inline-flex items-center gap-1 text-red-500 text-xs font-medium'>
        <XCircle className='h-3 w-3' /> Out
      </span>
    )
  if (stock <= 5)
    return (
      <span className='inline-flex items-center gap-1 text-orange-500 text-xs font-medium'>
        <AlertTriangle className='h-3 w-3' /> {stock}
      </span>
    )
  return (
    <span className='inline-flex items-center gap-1 text-green-600 text-xs font-medium'>
      <CheckCircle2 className='h-3 w-3' /> {stock}
    </span>
  )
}

export function InventoryClient() {
  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('name_asc')

  // Edit dialog
  const [editProduct, setEditProduct] = useState<InventoryProduct | null>(null)
  const [editStock, setEditStock] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Bulk restock dialog
  const [bulkProductIds, setBulkProductIds] = useState<string[]>([])
  const [bulkAmount, setBulkAmount] = useState('10')
  const [showBulkDialog, setShowBulkDialog] = useState(false)

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (brandFilter !== 'all') params.set('brand', brandFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/inventory?${params}`)
      if (res.ok) {
        const data = await res.json()

        // Transform API response to match InventoryProduct interface
        // API returns: { stock, sizeStock } -> Transform to: { totalStock, sizes, productSizes }
        let items = data.products.map((p: any): InventoryProduct => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          images: p.images || [],
          totalStock: p.stock ?? 0,
          sizes: (p.sizeStock || []).map((ss: any) => ({
            size: ss.size,
            stock: ss.stock,
            isLow: ss.stock > 0 && ss.stock <= 5,
            isOut: ss.stock === 0,
          })),
          productSizes: p.sizes || [],
        }))

        // Client-side search
        if (search) {
          const q = search.toLowerCase()
          items = items.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q)
          )
        }

        // Client-side sort
        items.sort((a, b) => {
          switch (sortBy) {
            case 'name_asc': return a.name.localeCompare(b.name)
            case 'name_desc': return b.name.localeCompare(a.name)
            case 'stock_asc': return a.totalStock - b.totalStock
            case 'stock_desc': return b.totalStock - a.totalStock
            default: return 0
          }
        })

        setProducts(items)
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err)
    } finally {
      setLoading(false)
    }
  }, [brandFilter, statusFilter, search, sortBy])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const handleEditOpen = (product: InventoryProduct) => {
    setEditProduct(product)
    const initial: Record<string, string> = {}

    // Get all sizes that should be editable for this product
    const availableSizes = product.productSizes || product.sizes.map((s) => s.size)

    // Initialize stock values for available sizes
    availableSizes.forEach((size) => {
      const found = product.sizes.find((s) => s.size === size)
      initial[size] = (found?.stock ?? 0).toString()
    })

    // Fill all sizes with 0 as default
    ALL_SIZES.forEach((size) => {
      if (initial[size] === undefined) initial[size] = '0'
    })
    setEditStock(initial)
  }

  const handleSaveStock = async () => {
    if (!editProduct) return
    setSaving(true)
    try {
      // Get valid sizes for this product from products page
      const validSizes = editProduct.productSizes || editProduct.sizes.map((s) => s.size)

      // Collect and update stock only for valid sizes
      for (const size of validSizes) {
        const stock = editStock[size] ?? '0'
        const num = parseInt(stock) || 0

        await fetch('/api/admin/inventory', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: editProduct.id,
            size,
            stock: num,
          }),
        })
      }

      setEditProduct(null)
      fetchInventory()
    } catch (err) {
      console.error('Failed to save stock:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleBulkRestock = async () => {
    if (bulkProductIds.length === 0) return
    try {
      await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: bulkProductIds,
          amount: parseInt(bulkAmount) || 0,
        }),
      })
      setShowBulkDialog(false)
      setBulkProductIds([])
      fetchInventory()
    } catch (err) {
      console.error('Failed to restock:', err)
    }
  }

  const toggleSelect = (id: string) => {
    setBulkProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const selectAll = products.length === bulkProductIds.length && products.length > 0

  const stats = {
    total: products.length,
    outOfStock: products.filter((p) => p.sizes.some((s) => s.isOut) || p.totalStock === 0).length,
    lowStock: products.filter((p) => p.sizes.some((s) => s.isLow) && !p.sizes.some((s) => s.isOut)).length,
    healthy: products.filter((p) => p.sizes.every((s) => s.stock > 5)).length,
  }

  return (
    <div className='space-y-6'>
      {/* Edit Stock Dialog */}
      <Dialog open={!!editProduct} onOpenChange={(o) => !o && setEditProduct(null)}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              Update Stock — {editProduct?.name}
            </DialogTitle>
          </DialogHeader>

          {editProduct && (
            <div className='space-y-3 py-2'>
              <p className='text-sm text-muted-foreground'>
                Sizes: {editProduct.productSizes?.join(', ') || editProduct.sizes.map((s) => s.size).join(', ')}
              </p>
              <div className='flex flex-wrap gap-2'>
                {(editProduct.productSizes || editProduct.sizes.map((s) => s.size)).map((size) => (
                  <div key={size} className='flex flex-col items-center gap-1'>
                    <span className='text-xs font-medium text-muted-foreground'>{size}</span>
                    <Input
                      type='number'
                      min='0'
                      value={editStock[size] ?? '0'}
                      onChange={(e) =>
                        setEditStock((prev) => ({ ...prev, [size]: e.target.value }))
                      }
                      className='w-16 text-center h-8'
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setEditProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStock} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Restock Dialog */}
      <AlertDialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Restock</AlertDialogTitle>
            <AlertDialogDescription>
              Add stock to {bulkProductIds.length} selected product(s). Enter the amount to add to all sizes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='py-2'>
            <Input
              type='number'
              min='1'
              value={bulkAmount}
              onChange={(e) => setBulkAmount(e.target.value)}
              placeholder='Amount to add'
              className='w-40'
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkRestock}>
              Add Stock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Inventory</h2>
          <p className='text-muted-foreground text-sm'>
            Manage stock levels for each product and size
          </p>
        </div>
        {bulkProductIds.length > 0 && (
          <Button
            size='sm'
            onClick={() => setShowBulkDialog(true)}
            className='shrink-0'
          >
            <Plus className='h-4 w-4 mr-1' />
            Bulk Restock ({bulkProductIds.length})
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        {[
          { label: 'Total Products', value: stats.total, color: 'text-foreground' },
          { label: 'Out of Stock', value: stats.outOfStock, color: 'text-red-600' },
          { label: 'Low Stock', value: stats.lowStock, color: 'text-orange-500' },
          { label: 'Healthy', value: stats.healthy, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className='pt-4'>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <p className='text-xs text-muted-foreground'>{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='pt-4'>
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search products...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-9'
              />
            </div>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className='w-[160px]'>
                <Filter className='h-4 w-4 mr-2' />
                <SelectValue placeholder='Brand' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Brands</SelectItem>
                {BRANDS.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[160px]'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='out'>Out of Stock</SelectItem>
                <SelectItem value='low'>Low Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className='w-[160px]'>
                <ArrowUpDown className='h-4 w-4 mr-2' />
                <SelectValue placeholder='Sort' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='name_asc'>Name: A → Z</SelectItem>
                <SelectItem value='name_desc'>Name: Z → A</SelectItem>
                <SelectItem value='stock_asc'>Stock: Low → High</SelectItem>
                <SelectItem value='stock_desc'>Stock: High → Low</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant='outline'
              size='icon'
              onClick={fetchInventory}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b bg-gray-50'>
                  <th className='text-left p-3 w-10'>
                    <input
                      type='checkbox'
                      checked={selectAll}
                      onChange={() =>
                        setBulkProductIds(selectAll ? [] : products.map((p) => p.id))
                      }
                      className='rounded'
                    />
                  </th>
                  <th className='text-left p-3'>Product</th>
                  <th className='text-left p-3'>Brand</th>
                  <th className='text-left p-3'>Total</th>
                  {ALL_SIZES.map((size) => (
                    <th key={size} className='text-center p-2 text-xs font-medium w-14'>
                      {size}
                    </th>
                  ))}
                  <th className='text-center p-3 w-20'>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className='border-b'>
                      <td className='p-3'><div className='h-4 w-4 bg-gray-100 rounded animate-pulse' /></td>
                      <td className='p-3'><div className='h-8 w-64 bg-gray-100 rounded animate-pulse' /></td>
                      <td className='p-3'><div className='h-6 w-16 bg-gray-100 rounded animate-pulse' /></td>
                      <td className='p-3'><div className='h-6 w-12 bg-gray-100 rounded animate-pulse' /></td>
                      {ALL_SIZES.map((s) => (
                        <td key={s} className='p-1'><div className='h-6 w-10 bg-gray-100 rounded animate-pulse mx-auto' /></td>
                      ))}
                      <td className='p-3'><div className='h-8 w-16 bg-gray-100 rounded animate-pulse mx-auto' /></td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={ALL_SIZES.length + 5} className='text-center py-12'>
                      <Package className='h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50' />
                      <p className='text-muted-foreground'>No products found</p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className='border-b hover:bg-gray-50'>
                      <td className='p-3'>
                        <input
                          type='checkbox'
                          checked={bulkProductIds.includes(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className='rounded'
                        />
                      </td>
                      <td className='p-3'>
                        <div className='flex items-center gap-2'>
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={36}
                              height={36}
                              className='rounded object-cover border'
                            />
                          ) : (
                            <div className='h-9 w-9 rounded bg-gray-100 flex items-center justify-center'>
                              <Package className='h-4 w-4 text-gray-400' />
                            </div>
                          )}
                          <span className='font-medium line-clamp-1 max-w-[200px]'>
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className='p-3'>
                        <Badge className={brandColors[product.brand]}>
                          {product.brand}
                        </Badge>
                      </td>
                      <td className='p-3'>
                        <StockCell stock={product.totalStock} />
                      </td>
                      {ALL_SIZES.map((size) => {
                        const sizeData = product.sizes.find((s) => s.size === size)
                        const isProductSize = product.productSizes?.includes(size) || sizeData !== undefined
                        return (
                          <td key={size} className='p-1 text-center'>
                            {isProductSize ? (
                              <StockCell stock={sizeData?.stock ?? 0} />
                            ) : (
                              <span className='text-gray-300 text-xs'>—</span>
                            )}
                          </td>
                        )
                      })}
                      <td className='p-3 text-center'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleEditOpen(product)}
                          className='h-8 w-8'
                        >
                          <Edit2 className='h-4 w-4' />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
