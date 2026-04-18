'use client'

import * as React from 'react'
import Image from 'next/image'
import { Search, Upload, X, Loader2, Camera, Palette, Tag, Sparkles } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ProductCard } from '@/components/ui/product-card'
import { useToast } from '@/hooks/use-toast'


// ============================================================
// TYPES
// ============================================================

interface MLAnalysis {
  predictedBrand: string
  brandScores: Array<{ brand: string; score: number }>
  dominantColors: Array<{ name: string; hex: string; rgb: number[]; percentage: number }>
  productColors: string[]
  processingTimeMs: number
}

interface SearchResult {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  brand: string
  gender: string
  shoeType: string
  colors: string[]
  stock: number
  similarityScore: number
  finalScore: number
}

type SearchState = 'idle' | 'analyzing' | 'results' | 'error'


// ============================================================
// CONSTANTS
// ============================================================

const BRAND_LABELS: Record<string, { label: string; color: string }> = {
  NIKE: { label: 'Nike', color: 'bg-black' },
  ADIDAS: { label: 'Adidas', color: 'bg-blue-600' },
  PUMA: { label: 'Puma', color: 'bg-red-600' },
  NEW_BALANCE: { label: 'New Balance', color: 'bg-blue-400' },
  CONVERSE: { label: 'Converse', color: 'bg-red-500' },
  VANS: { label: 'Vans', color: 'bg-black' },
}

const COLOR_SWATCH_SIZE = 20


// ============================================================
// COMPONENTS
// ============================================================

function ColorSwatch({ hex, name, percentage }: { hex: string; name: string; percentage: number }) {
  return (
    <div className="flex items-center gap-2 group/swatch">
      <div
        className="rounded-md border border-gray-200 shrink-0"
        style={{
          width: COLOR_SWATCH_SIZE,
          height: COLOR_SWATCH_SIZE,
          backgroundColor: hex,
        }}
      />
      <div className="min-w-0">
        <p className="text-xs font-medium capitalize truncate">{name}</p>
        <p className="text-[10px] text-muted-foreground">{Math.round(percentage * 100)}%</p>
      </div>
    </div>
  )
}

function BrandPrediction({ ml }: { ml: MLAnalysis }) {
  const topBrand = ml.predictedBrand
  const brandInfo = BRAND_LABELS[topBrand]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Thương hiệu dự đoán</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge className={cn('text-white text-sm px-3 py-1', brandInfo?.color || 'bg-gray-600')}>
          {brandInfo?.label || topBrand}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {Math.round((ml.brandScores[0]?.score || 0) * 100)}% confident
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {ml.brandScores.slice(0, 3).map((b) => (
          <Badge key={b.brand} variant="outline" className="text-[10px]">
            {BRAND_LABELS[b.brand]?.label || b.brand}: {Math.round(b.score * 100)}%
          </Badge>
        ))}
      </div>
    </div>
  )
}

function ColorPalette({ colors }: { colors: MLAnalysis['dominantColors'] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Màu chủ đạo</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <ColorSwatch key={color.hex} {...color} />
        ))}
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {colors.map((c) => (
          <Badge key={c.name} variant="secondary" className="text-[10px] capitalize">
            {c.name}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function SearchInsight({ ml, resultCount }: { ml: MLAnalysis; resultCount: number }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Sparkles className="w-4 h-4" />
      <span>
        Tìm thấy <strong>{resultCount}</strong> sản phẩm tương tự trong{' '}
        <strong>{ml.processingTimeMs}ms</strong>
      </span>
    </div>
  )
}

function UploadZone({
  onFileSelect,
  preview,
  onClear,
  disabled,
}: {
  onFileSelect: (file: File) => void
  preview: string | null
  onClear: () => void
  disabled: boolean
}) {
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return

      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        onFileSelect(file)
      }
    },
    [disabled, onFileSelect]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 bg-muted/30">
        <div className="aspect-square relative max-h-[320px] mx-auto">
          <Image src={preview} alt="Preview" fill className="object-contain" />
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md"
          onClick={onClear}
          disabled={disabled}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-xl transition-all cursor-pointer',
        isDragging
          ? 'border-primary bg-primary/5 scale-[1.02]'
          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Camera className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Tải lên hình giày</p>
          <p className="text-xs text-muted-foreground">
            Kéo thả ảnh hoặc click để chọn
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            JPG, PNG, WEBP — tối đa 10MB
          </p>
        </div>
      </div>
    </div>
  )
}

function SimilarityBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  let color = 'bg-green-100 text-green-800'
  if (pct < 60) color = 'bg-yellow-100 text-yellow-800'
  if (pct < 40) color = 'bg-gray-100 text-gray-600'

  return (
    <Badge className={cn('text-[10px] font-mono', color)}>
      {pct}% match
    </Badge>
  )
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export function VisualSearch() {
  const [searchState, setSearchState] = React.useState<SearchState>('idle')
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [mlAnalysis, setMlAnalysis] = React.useState<MLAnalysis | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [retryCount, setRetryCount] = React.useState(0)

  const { toast } = useToast()

  const handleFileSelect = React.useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File quá lớn', description: 'Vui lòng chọn ảnh dưới 10MB', variant: 'destructive' })
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    setResults([])
    setMlAnalysis(null)
    setErrorMessage(null)
    setSearchState('idle')
  }, [toast])

  const handleClear = React.useCallback(() => {
    setSelectedFile(null)
    setPreview(null)
    setResults([])
    setMlAnalysis(null)
    setErrorMessage(null)
    setSearchState('idle')
    setRetryCount(0)
  }, [])

  const handleSearch = React.useCallback(async () => {
    if (!preview || !selectedFile) return

    setSearchState('analyzing')
    setErrorMessage(null)

    try {
      // Convert file to base64
      const base64 = preview

      const response = await fetch('/api/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, topK: 12 }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      if (data.results && data.results.length > 0) {
        setResults(data.results)
        setMlAnalysis(data.mlInfo || null)
        setSearchState('results')
      } else {
        setResults([])
        setSearchState('results')
        toast({
          title: 'Không tìm thấy sản phẩm',
          description: 'Không có sản phẩm nào phù hợp với hình ảnh này. Thử hình ảnh khác.',
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đã xảy ra lỗi'
      setErrorMessage(msg)
      setSearchState('error')

      if (retryCount < 2) {
        toast({
          title: 'Lỗi, đang thử lại...',
          description: msg,
          variant: 'destructive',
        })
        setRetryCount((c) => c + 1)
        setTimeout(() => handleSearch(), 2000)
      } else {
        toast({
          title: 'Không thể tìm kiếm',
          description: msg,
          variant: 'destructive',
        })
      }
    }
  }, [preview, selectedFile, retryCount, toast])

  // Auto-search when file is selected
  React.useEffect(() => {
    if (selectedFile && preview && searchState === 'idle') {
      const timer = setTimeout(() => handleSearch(), 500)
      return () => clearTimeout(timer)
    }
  }, [selectedFile, preview, searchState, handleSearch])

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Search className="w-6 h-6" />
          Tìm giày bằng hình ảnh
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Tải lên hình giày bạn thích — AI sẽ tìm những sản phẩm tương tự trong cửa hàng
        </p>
      </div>

      {/* Upload Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Upload */}
        <div className="space-y-4">
          <UploadZone
            onFileSelect={handleFileSelect}
            preview={preview}
            onClear={handleClear}
            disabled={searchState === 'analyzing'}
          />

          {preview && searchState !== 'analyzing' && (
            <Button
              className="w-full gap-2"
              onClick={handleSearch}
              disabled={!selectedFile}
            >
              <Search className="w-4 h-4" />
              Tìm kiếm
            </Button>
          )}

          {searchState === 'analyzing' && (
            <div className="flex items-center justify-center gap-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>AI đang phân tích hình ảnh...</span>
            </div>
          )}
        </div>

        {/* Right: ML Analysis Results */}
        <div className="space-y-4">
          {searchState === 'error' && errorMessage && (
            <Card className="p-4 border-red-200 bg-red-50">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </Card>
          )}

          {mlAnalysis && (
            <Card className="p-4 space-y-4">
              <BrandPrediction ml={mlAnalysis} />
              <div className="border-t pt-4">
                <ColorPalette colors={mlAnalysis.dominantColors} />
              </div>
            </Card>
          )}

          {searchState === 'results' && !mlAnalysis && !errorMessage && (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">
                Không tìm thấy sản phẩm phù hợp. Thử hình ảnh giày rõ ràng hơn.
              </p>
            </Card>
          )}

          {searchState === 'idle' && (
            <div className="h-full flex items-center justify-center min-h-[200px]">
              <div className="text-center space-y-2 text-muted-foreground">
                <Upload className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm">Kết quả phân tích sẽ hiển thị ở đây</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {searchState === 'results' && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Kết quả tìm kiếm ({results.length})
            </h3>
            {mlAnalysis && <SearchInsight ml={mlAnalysis} resultCount={results.length} />}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard
                  product={{
                    id: product.id,
                    name: product.name,
                    description: '',
                    price: product.price,
                    images: product.images,
                    brand: product.brand,
                    gender: product.gender,
                    shoeType: product.shoeType,
                    stock: product.stock,
                    originalPrice: product.originalPrice,
                    colors: product.colors,
                  }}
                  showBadges
                />
                <div className="absolute top-3 right-3 z-10">
                  <SimilarityBadge score={product.similarityScore} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
