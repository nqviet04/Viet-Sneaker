import Link from 'next/link'
import { Home, ChevronRight, Truck, Package, Clock, MapPin, Phone, Mail, RotateCcw, Shield } from 'lucide-react'

export default function ShippingPage() {
  const shippingRates = [
    {
      region: 'Nội thành TP.HCM & Hà Nội',
      time: '1 - 2 ngày làm việc',
      fee: '₫30.000',
      note: 'Giao hàng trong giờ hành chính',
    },
    {
      region: 'Các tỉnh thành khác',
      time: '3 - 5 ngày làm việc',
      fee: '₫50.000',
      note: 'Không giao vào ngày lễ, Tết',
    },
    {
      region: 'Khu vực hẻo lánh / remote',
      time: '5 - 7 ngày làm việc',
      fee: '₫70.000',
      note: 'Có thể mất thêm thời gian tùy điều kiện thực tế',
    },
  ]

  const freeShippingThreshold = 2500000

  const steps = [
    {
      icon: Package,
      title: 'Xác nhận đơn hàng',
      desc: 'Sau khi đặt hàng thành công, bạn sẽ nhận email xác nhận trong vài phút.',
    },
    {
      icon: Truck,
      title: 'Đóng gói & bàn giao',
      desc: 'Đơn hàng được đóng gói cẩn thận và bàn giao cho đơn vị vận chuyển trong 24h.',
    },
    {
      icon: MapPin,
      title: 'Vận chuyển',
      desc: 'Theo dõi lộ trình giao hàng qua mã vận đơn được gửi qua email/SMS.',
    },
    {
      icon: Package,
      title: 'Nhận hàng',
      desc: 'Kiểm tra sản phẩm trước khi thanh toán. Ký xác nhận khi đã hài lòng.',
    },
  ]

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-1 text-sm text-muted-foreground mb-6'>
        <Link href='/' className='hover:text-foreground transition-colors'>
          <Home className='h-4 w-4' />
        </Link>
        <ChevronRight className='h-4 w-4' />
        <span className='text-foreground font-medium'>Thông tin vận chuyển</span>
      </nav>

      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Thông tin vận chuyển</h1>
          <p className='text-muted-foreground'>
            Cập nhật chính sách vận chuyển, thời gian giao hàng và cách theo dõi đơn hàng của bạn.
          </p>
        </div>

        {/* Free Shipping Banner */}
        <div className='bg-black text-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 flex items-center gap-4'>
          <div className='w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0'>
            <Truck className='w-6 h-6' />
          </div>
          <div>
            <p className='font-semibold text-lg'>Miễn phí vận chuyển toàn quốc</p>
            <p className='text-white/70 text-sm'>
              Đơn hàng từ {freeShippingThreshold.toLocaleString('vi-VN')}₫ được miễn phí giao hàng
            </p>
          </div>
        </div>

        {/* Shipping Rates */}
        <div className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>Bảng giá vận chuyển</h2>
          <div className='space-y-4'>
            {shippingRates.map((rate, index) => (
              <div key={index} className='bg-gray-50 rounded-xl p-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-10 h-10 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0'>
                    <Truck className='w-5 h-5' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2'>
                      <h3 className='font-semibold text-sm sm:text-base'>{rate.region}</h3>
                      <span className='font-bold text-base sm:text-lg'>{rate.fee}</span>
                    </div>
                    <div className='flex items-center gap-1.5 text-sm text-muted-foreground mb-1'>
                      <Clock className='w-3.5 h-3.5 flex-shrink-0' />
                      <span>{rate.time}</span>
                    </div>
                    {rate.note && (
                      <p className='text-xs text-muted-foreground'>{rate.note}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Steps */}
        <div className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>Quy trình giao hàng</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {steps.map((step, index) => (
              <div key={index} className='flex gap-4 p-4 bg-gray-50 rounded-xl'>
                <div className='flex-shrink-0'>
                  <div className='w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold'>
                    {index + 1}
                  </div>
                </div>
                <div>
                  <div className='flex items-center gap-2 mb-1'>
                    <step.icon className='w-4 h-4' />
                    <h3 className='font-semibold text-sm'>{step.title}</h3>
                  </div>
                  <p className='text-xs text-muted-foreground'>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tracking */}
        <div className='bg-gray-50 rounded-xl p-6 mb-8'>
          <h2 className='text-lg font-semibold mb-3'>Theo dõi đơn hàng</h2>
          <p className='text-sm text-muted-foreground mb-4'>
            Sau khi đơn hàng được bàn giao cho đơn vị vận chuyển, bạn sẽ nhận được mã vận đơn qua email và SMS. Sử dụng mã này để theo dõi trạng thái giao hàng trên website của đơn vị vận chuyển.
          </p>
          <div className='flex flex-wrap gap-4 text-sm'>
            <div className='flex items-center gap-2'>
              <Mail className='w-4 h-4 text-muted-foreground' />
              <span>Email xác nhận kèm mã vận đơn</span>
            </div>
            <div className='flex items-center gap-2'>
              <Phone className='w-4 h-4 text-muted-foreground' />
              <span>Thông báo SMS khi giao hàng thành công</span>
            </div>
          </div>
        </div>

        {/* Return Policy */}
        <div className='bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8'>
          <div className='flex items-center gap-2 mb-3'>
            <RotateCcw className='w-5 h-5 text-blue-600' />
            <h2 className='text-lg font-semibold text-blue-900'>Chính sách đổi trả</h2>
          </div>
          <ul className='space-y-2 text-sm text-blue-800'>
            <li>• Đổi trả trong <strong>30 ngày</strong> kể từ ngày nhận hàng.</li>
            <li>• Sản phẩm đổi trả phải còn nguyên tem mác, chưa qua sử dụng.</li>
            <li>• Chi phí vận chuyển đổi trả do khách hàng chi trả (trừ trường hợp lỗi từ nhà bán).</li>
            <li>• Hoàn tiền trong vòng 7 - 14 ngày làm việc sau khi nhận được sản phẩm.</li>
          </ul>
        </div>

        {/* Contact */}
        <div className='border rounded-xl p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Shield className='w-5 h-5' />
            <h2 className='text-lg font-semibold'>Hỗ trợ vận chuyển</h2>
          </div>
          <p className='text-sm text-muted-foreground mb-4'>
            Nếu bạn có câu hỏi về đơn hàng hoặc cần hỗ trợ vận chuyển, hãy liên hệ với chúng tôi:
          </p>
          <div className='flex flex-wrap gap-4 text-sm'>
            <Link
              href='tel:0339995273'
              className='flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              <Phone className='w-4 h-4' />
              <span>0339 995 273</span>
            </Link>
            <Link
              href='mailto:support@vietsneaker.com'
              className='flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              <Mail className='w-4 h-4' />
              <span>support@vietsneaker.com</span>
            </Link>
          </div>
          <p className='text-xs text-muted-foreground mt-3'>
            Thời gian hỗ trợ: Thứ 2 - Thứ 6, 8:00 - 17:00
          </p>
        </div>
      </div>
    </div>
  )
}
