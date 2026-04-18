import { VisualSearch } from '@/components/visual-search'

export const metadata = {
  title: 'Tìm giày bằng hình ảnh | VietSneaker',
  description: 'Tìm kiếm sản phẩm giày bằng hình ảnh với AI. Upload ảnh giày bạn thích và VietSneaker sẽ tìm những sản phẩm tương tự.',
}

export default function VisualSearchPage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <VisualSearch />
    </main>
  )
}
