'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ImageIcon,
  RefreshCw,
  Download,
  Upload,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { UploadDropzone } from '@/lib/uploadthing'

// ============================================
// TYPES
// ============================================

type Brand = 'NIKE' | 'ADIDAS' | 'PUMA' | 'NEW_BALANCE' | 'CONVERSE' | 'VANS'
type Gender = 'MEN' | 'WOMEN' | 'UNISEX'
type ShoeType = 'RUNNING' | 'CASUAL' | 'BOOTS' | 'FORMAL' | 'SLIPPERS' | 'BASKETBALL' | 'SKATEBOARDING' | 'TRAINING' | 'HIKING'

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  brand: Brand
  sizes: string[]
  colors: string[]
  gender: Gender
  shoeType: ShoeType
  stock: number
  originalPrice: number | null
  createdAt: string
  _count?: { reviews: number }
  sizeStock?: { size: string; stock: number }[]
}

interface ProductFormData {
  name: string
  description: string
  price: string
  images: string[]
  brand: Brand | ''
  sizes: string
  colors: string
  gender: Gender | ''
  shoeType: ShoeType | ''
  stock: string
  originalPrice: string
}

// ============================================
// CONSTANTS
// ============================================

const BRANDS: Brand[] = ['NIKE', 'ADIDAS', 'PUMA', 'NEW_BALANCE', 'CONVERSE', 'VANS']
const GENDERS: Gender[] = ['MEN', 'WOMEN', 'UNISEX']
const SHOE_TYPES: ShoeType[] = ['RUNNING', 'CASUAL', 'BOOTS', 'FORMAL', 'SLIPPERS', 'BASKETBALL', 'SKATEBOARDING', 'TRAINING', 'HIKING']
const COMMON_SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
const COMMON_COLORS = ['black', 'white', 'red', 'blue', 'green', 'gray', 'brown', 'pink', 'yellow', 'orange', 'purple', 'navy']

const brandColors: Record<Brand, string> = {
  NIKE: 'bg-black text-white',
  ADIDAS: 'bg-blue-600 text-white',
  PUMA: 'bg-red-500 text-white',
  NEW_BALANCE: 'bg-orange-500 text-white',
  CONVERSE: 'bg-red-600 text-white',
  VANS: 'bg-black text-white',
}

// ============================================
// PRODUCT FORM DIALOG
// ============================================

function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onRefresh,
  onCancel,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onRefresh: () => void
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    images: [],
    brand: '',
    sizes: '',
    colors: '',
    gender: '',
    shoeType: '',
    stock: '0',
    originalPrice: '',
  })

  // Size stock per size
  const [sizeStockData, setSizeStockData] = useState<Record<string, string>>({})

  const initSizeStock = (productSizes: string[], existingSizeStock: { size: string; stock: number }[]) => {
    const stockMap: Record<string, string> = {}
    productSizes.forEach((size) => {
      const found = existingSizeStock.find((ss) => ss.size === size)
      stockMap[size] = found ? found.stock.toString() : '0'
    })
    return stockMap
  }

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        images: product.images,
        brand: product.brand,
        sizes: product.sizes.join(', '),
        colors: product.colors.join(', '),
        gender: product.gender,
        shoeType: product.shoeType,
        stock: product.stock.toString(),
        originalPrice: product.originalPrice?.toString() || '',
      })
      setSizeStockData(initSizeStock(product.sizes, product.sizeStock || []))
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        images: [],
        brand: '',
        sizes: '',
        colors: '',
        gender: '',
        shoeType: '',
        stock: '0',
        originalPrice: '',
      })
      setSizeStockData({})
    }
  }, [product, open])

  // Update sizeStock when sizes change
  useEffect(() => {
    const sizes = formData.sizes.split(',').map((s) => s.trim()).filter(Boolean)
    setSizeStockData((prev) => {
      const newData: Record<string, string> = {}
      sizes.forEach((size) => {
        newData[size] = prev[size] || '0'
      })
      return newData
    })
  }, [formData.sizes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const parsedSizes = formData.sizes.split(',').map((s) => s.trim()).filter(Boolean)
      const parsedColors = formData.colors.split(',').map((s) => s.trim()).filter(Boolean)

      // Build sizeStock array
      const sizeStock = parsedSizes.map((size) => ({
        size,
        stock: parseInt(sizeStockData[size] || '0') || 0,
      }))

      // Calculate total stock
      const totalStock = sizeStock.reduce((sum, s) => sum + s.stock, 0)

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        images: formData.images,
        brand: formData.brand,
        sizes: parsedSizes,
        colors: parsedColors,
        gender: formData.gender,
        shoeType: formData.shoeType,
        stock: totalStock,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        sizeStock,
      }

      const res = await fetch(
        product ? `/api/admin/products/${product.id}` : '/api/admin/products',
        {
          method: product ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save product')
      }

      toast({
        title: 'Thành công',
        description: `Sản phẩm đã được ${product ? 'cập nhật' : 'tạo'} thành công.`,
      })
      onOpenChange(false)
      setTimeout(() => onRefresh(), 2000)
    } catch (error: any) {
      setLoading(false)
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  // Helper variable for template
  const parsedSizes = formData.sizes.split(',').map((s) => s.trim()).filter(Boolean)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {product
              ? 'Update the product information below.'
              : 'Fill in the details to create a new product.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Images */}
          <div className='space-y-2'>
            <Label>Product Images</Label>
            {formData.images.length > 0 && (
              <div className='flex flex-wrap gap-2 mb-2'>
                {formData.images.map((url, i) => (
                  <div key={i} className='relative group'>
                    <Image
                      src={url}
                      alt='Product'
                      width={64}
                      height={64}
                      className='rounded-md object-cover border'
                    />
                    <button
                      type='button'
                      onClick={() =>
                        setFormData((f) => ({
                          ...f,
                          images: f.images.filter((_, idx) => idx !== i),
                        }))
                      }
                      className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <UploadDropzone
              endpoint='productImages'
              onClientUploadComplete={(res) => {
                const urls = res.map((r) => r.url)
                setFormData((f) => ({ ...f, images: [...f.images, ...urls] }))
                toast({ title: 'Images uploaded', description: `${urls.length} image(s) added.` })
              }}
              onUploadError={(error: Error) => {
                toast({
                  title: 'Upload failed',
                  description: error.message,
                  variant: 'destructive',
                })
              }}
              config={{ mode: 'auto' }}
            />
          </div>

          {/* Basic Info */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2 col-span-2'>
              <Label htmlFor='name'>Product Name *</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                placeholder='Nike Air Force 1'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='price'>Price *</Label>
              <Input
                id='price'
                type='number'
                step='0.01'
                min='0'
                value={formData.price}
                onChange={(e) => setFormData((f) => ({ ...f, price: e.target.value }))}
                placeholder='99.99'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='originalPrice'>Original Price</Label>
              <Input
                id='originalPrice'
                type='number'
                step='0.01'
                min='0'
                value={formData.originalPrice}
                onChange={(e) => setFormData((f) => ({ ...f, originalPrice: e.target.value }))}
                placeholder='129.99'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='stock'>Stock Quantity *</Label>
              <Input
                id='stock'
                type='number'
                min='0'
                value={formData.stock}
                onChange={(e) => setFormData((f) => ({ ...f, stock: e.target.value }))}
                placeholder='100'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='brand'>Brand *</Label>
              <Select
                value={formData.brand}
                onValueChange={(v) => setFormData((f) => ({ ...f, brand: v as Brand }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select brand' />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='gender'>Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(v) => setFormData((f) => ({ ...f, gender: v as Gender }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select gender' />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='shoeType'>Shoe Type *</Label>
              <Select
                value={formData.shoeType}
                onValueChange={(v) => setFormData((f) => ({ ...f, shoeType: v as ShoeType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  {SHOE_TYPES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2 col-span-2'>
              <Label htmlFor='sizes'>Available Sizes (comma separated)</Label>
              <Input
                id='sizes'
                value={formData.sizes}
                onChange={(e) => setFormData((f) => ({ ...f, sizes: e.target.value }))}
                placeholder='35, 36, 37, 38, 39, 40, 41, 42, 43, 44'
              />
            </div>

            {/* Size Stock Inputs */}
            {parsedSizes.length > 0 && (
              <div className='space-y-2 col-span-2'>
                <Label>Stock per Size</Label>
                <div className='grid grid-cols-4 sm:grid-cols-6 gap-2 p-3 border rounded-lg bg-gray-50'>
                  {parsedSizes.map((size) => (
                    <div key={size} className='space-y-1'>
                      <Label className='text-xs font-medium'>Size {size}</Label>
                      <Input
                        type='number'
                        min='0'
                        value={sizeStockData[size] || '0'}
                        onChange={(e) =>
                          setSizeStockData((prev) => ({
                            ...prev,
                            [size]: e.target.value,
                          }))
                        }
                        className='h-8 text-sm'
                      />
                    </div>
                  ))}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Tổng stock: {parsedSizes.reduce((sum, size) => sum + (parseInt(sizeStockData[size] || '0') || 0), 0)} đôi
                </p>
              </div>
            )}

            <div className='space-y-2 col-span-2'>
              <Label htmlFor='colors'>Available Colors (comma separated)</Label>
              <Input
                id='colors'
                value={formData.colors}
                onChange={(e) => setFormData((f) => ({ ...f, colors: e.target.value }))}
                placeholder='black, white, red'
              />
            </div>

            <div className='space-y-2 col-span-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                placeholder='Product description...'
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                onOpenChange(false)
                onCancel()
              }}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// BULK ACTION DIALOG
// ============================================

function BulkActionDialog({
  open,
  onOpenChange,
  action,
  productCount,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: string
  productCount: number
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          productIds: selectedIds,
          data: action === 'update-stock' || action === 'restock'
            ? { stock: parseInt(value) || 0, amount: parseInt(value) || 0 }
            : action === 'update-brand'
            ? { brand: value }
            : {},
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Action failed')
      }

      toast({ title: 'Success', description: 'Bulk action completed.' })
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
          <AlertDialogDescription>
            {action === 'delete'
              ? `Are you sure you want to delete ${productCount} product(s)? Products with orders will be soft-deleted.`
              : `Apply "${action}" to ${productCount} product(s)?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={loading}>
            {loading ? 'Processing...' : 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function AdminProductsClient({
  initialProducts,
  availableBrands,
  availableGenders,
  availableShoeTypes,
}: {
  initialProducts: Product[]
  availableBrands: Brand[]
  availableGenders: Gender[]
  availableShoeTypes: ShoeType[]
}) {
  const router = useRouter()
  
  // Debug initial products
  console.log('[AdminProducts] Initial products from server:', initialProducts?.length)
  
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('created_desc')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(initialProducts.length)
  const perPage = 12

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  // Dialogs
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [bulkAction, setBulkAction] = useState<string | null>(null)

  // Fetch products with filters
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        sort: sortBy,
      })
      if (search) params.set('search', search)
      if (brandFilter !== 'all') params.set('brand', brandFilter)
      if (stockFilter !== 'all') params.set('stockFilter', stockFilter)

      console.log('[AdminProducts] Fetching with params:', params.toString())
      const res = await fetch(`/api/admin/products?${params}`)
      console.log('[AdminProducts] Response status:', res.status)
      
      if (res.ok) {
        const data = await res.json()
        console.log('[AdminProducts] Received products:', data.products?.length, 'total:', data.total)
        setProducts(data.products)
        setTotal(data.total)
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('[AdminProducts] API error:', res.status, errorData)
      }
    } catch (error) {
      console.error('[AdminProducts] Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [page, sortBy, search, brandFilter, stockFilter])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)))
    }
    setSelectAll(!selectAll)
  }

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
    setSelectAll(newSet.size === products.length)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed')
      }
      toast({ title: 'Success', description: 'Product deleted.' })
      fetchProducts()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
    setDeleteProductId(null)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', productIds: Array.from(selectedIds) }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed')
      }
      toast({ title: 'Success', description: `${selectedIds.size} product(s) deleted.` })
      setSelectedIds(new Set())
      setSelectAll(false)
      fetchProducts()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
    setBulkAction(null)
  }

  const handleBulkAction = (action: string) => {
    if (selectedIds.size === 0) {
      toast({ title: 'No products selected', description: 'Please select products first.' })
      return
    }
    setBulkAction(action)
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <>
      {/* Product Form Dialog */}
      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        onRefresh={() => window.location.reload()}
        onCancel={() => window.location.reload()}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && handleDelete(deleteProductId)}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Action Confirmation */}
      {bulkAction && (
        <BulkActionDialog
          open={true}
          onOpenChange={() => setBulkAction(null)}
          action={bulkAction}
          productCount={selectedIds.size}
          onSuccess={() => {
            setSelectedIds(new Set())
            setSelectAll(false)
            fetchProducts()
          }}
        />
      )}

      <div className='space-y-4'>
        {/* Header with Stats */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Package className='h-5 w-5 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>
                {total} product{total !== 1 ? 's' : ''} total
              </span>
            </div>
            {selectedIds.size > 0 && (
              <div className='flex items-center gap-2'>
                <Badge variant='secondary'>{selectedIds.size} selected</Badge>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleBulkAction('delete')}
                  className='text-red-600 border-red-200 hover:bg-red-50'
                >
                  <Trash2 className='h-3 w-3 mr-1' />
                  Delete
                </Button>
              </div>
            )}
          </div>
          <Button onClick={() => { setEditingProduct(null); setFormOpen(true) }}>
            <Plus className='h-4 w-4 mr-2' />
            Add Product
          </Button>
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
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className='pl-9'
                />
              </div>
              <Select value={brandFilter} onValueChange={(v) => { setBrandFilter(v); setPage(1) }}>
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
              <Select value={stockFilter} onValueChange={(v) => { setStockFilter(v); setPage(1) }}>
                <SelectTrigger className='w-[160px]'>
                  <SelectValue placeholder='Stock' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Stock</SelectItem>
                  <SelectItem value='low-stock'>Low Stock</SelectItem>
                  <SelectItem value='out-of-stock'>Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1) }}>
                <SelectTrigger className='w-[160px]'>
                  <ArrowUpDown className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='created_desc'>Newest First</SelectItem>
                  <SelectItem value='created_asc'>Oldest First</SelectItem>
                  <SelectItem value='price_asc'>Price: Low to High</SelectItem>
                  <SelectItem value='price_desc'>Price: High to Low</SelectItem>
                  <SelectItem value='name_asc'>Name: A to Z</SelectItem>
                  <SelectItem value='name_desc'>Name: Z to A</SelectItem>
                  <SelectItem value='stock_asc'>Stock: Low to High</SelectItem>
                  <SelectItem value='stock_desc'>Stock: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-10'>
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Reviews</TableHead>
                    <TableHead className='w-10'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className='h-4 w-4 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-12 w-48 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-4 w-16 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-4 w-20 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-4 w-16 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-4 w-8 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-8 w-8 bg-gray-100 rounded animate-pulse' /></TableCell>
                      </TableRow>
                    ))
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center py-12'>
                        <Package className='h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50' />
                        <p className='text-muted-foreground'>No products found</p>
                        <Button
                          variant='outline'
                          size='sm'
                          className='mt-3'
                          onClick={() => { setSearch(''); setBrandFilter('all'); setStockFilter('all'); setPage(1) }}
                        >
                          Clear filters
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow
                        key={product.id}
                        className={selectedIds.has(product.id) ? 'bg-blue-50' : ''}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(product.id)}
                            onCheckedChange={() => handleSelectOne(product.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            {product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={48}
                                height={48}
                                className='rounded-md object-cover border'
                              />
                            ) : (
                              <div className='h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center'>
                                <ImageIcon className='h-5 w-5 text-gray-400' />
                              </div>
                            )}
                            <div className='min-w-0'>
                              <p className='font-medium truncate max-w-[200px]'>{product.name}</p>
                              <p className='text-xs text-muted-foreground truncate max-w-[200px]'>
                                {product.gender} | {product.shoeType}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={brandColors[product.brand]}>
                            {product.brand}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            {product.originalPrice && (
                              <span className='text-xs text-muted-foreground line-through mr-1'>
                                {formatCurrency(product.originalPrice)}
                              </span>
                            )}
                            <span className={product.originalPrice ? 'text-green-600 font-medium' : ''}>
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {product.stock === 0 ? (
                              <span className='flex items-center gap-1 text-red-500 text-sm'>
                                <XCircle className='h-3 w-3' />
                                Out
                              </span>
                            ) : product.stock <= 10 ? (
                              <span className='flex items-center gap-1 text-orange-500 text-sm'>
                                <AlertTriangle className='h-3 w-3' />
                                {product.stock}
                              </span>
                            ) : (
                              <span className='flex items-center gap-1 text-green-600 text-sm'>
                                <CheckCircle2 className='h-3 w-3' />
                                {product.stock}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className='text-sm'>{product._count?.reviews || 0}</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingProduct(product)
                                  setFormOpen(true)
                                }}
                              >
                                <Edit className='h-4 w-4 mr-2' />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteProductId(product.id)}
                                className='text-red-600'
                              >
                                <Trash2 className='h-4 w-4 mr-2' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex items-center justify-between px-4 py-3 border-t'>
                <p className='text-sm text-muted-foreground'>
                  Page {page} of {totalPages} ({total} products)
                </p>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
