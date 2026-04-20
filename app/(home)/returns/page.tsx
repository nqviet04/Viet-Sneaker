import Link from 'next/link'
import { Home, ChevronRight, RotateCcw, AlertTriangle, CheckCircle, Clock, Package, Phone, Mail, Shield, ArrowRight } from 'lucide-react'

export default function ReturnsPage() {
  const returnConditions = [
    {
      icon: RotateCcw,
      title: '30 ngày đổi trả',
      desc: 'Yêu cầu đổi trả được chấp nhận trong vòng 30 ngày kể từ ngày nhận hàng thành công.',
    },
    {
      icon: Package,
      title: 'Sản phẩm nguyên vẹn',
      desc: 'Sản phẩm phải còn nguyên tem mác, chưa qua sử dụng, không rách hộp và không có dấu hiệu đã mang thử.',
    },
    {
      icon: CheckCircle,
      title: 'Đầy đủ phụ kiện',
      desc: 'Tất cả phụ kiện đi kèm (hộp, dây buộc, túi dust bag, phiếu bảo hành...) phải còn đầy đủ.',
    },
    {
      icon: AlertTriangle,
      title: 'Lỗi từ nhà sản xuất',
      desc: 'Đổi trả miễn phí vận chuyển nếu sản phẩm có lỗi từ nhà sản xuất (giao sai sản phẩm, lỗi màu/size, sản phẩm bị hỏng).',
    },
  ]

  const nonReturnable = [
    'Sản phẩm đã qua sử dụng, có dấu hiệu đã mang thử ngoài trời hoặc mang đi chơi.',
    'Sản phẩm không còn nguyên tem mác, đã cắt tag hoặc đã giặt.',
    'Hộp giày bị rách, móp méo, dính nhãn bên ngoài hoặc mất phụ kiện đi kèm.',
    'Sản phẩm được mua trong chương trình khuyến mãi với ghi chú "Không hỗ trợ đổi trả".',
    'Sản phẩm custom, giày được cá nhân hóa theo yêu cầu riêng.',
  ]

  const returnSteps = [
    {
      step: 1,
      title: 'Gửi yêu cầu',
      desc: 'Điền form yêu cầu đổi trả tại trang Tài khoản > Đơn hàng > Chi tiết đơn hàng. Mô tả lý do đổi trả rõ ràng và gửi ảnh chụp sản phẩm nếu có.',
    },
    {
      step: 2,
      title: 'Chờ xác nhận',
      desc: 'Đội ngũ hỗ trợ sẽ xác nhận yêu cầu trong vòng 24 giờ làm việc. Bạn sẽ nhận email hướng dẫn gửi hàng.',
    },
    {
      step: 3,
      title: 'Gửi sản phẩm',
      desc: 'Đóng gói sản phẩm cẩn thận và gửi qua đơn vị vận chuyển được hướng dẫn. Lưu giữ biên nhận gửi hàng.',
    },
    {
      step: 4,
      title: 'Nhận hoàn tiền',
      desc: 'Sau khi xác nhận sản phẩm đạt yêu cầu, hoàn tiền sẽ được xử lý trong 7 - 14 ngày làm việc qua phương thức thanh toán ban đầu.',
    },
  ]

  const refundOptions = [
    {
      title: 'Hoàn tiền gốc',
      desc: 'Thanh toán qua thẻ/tài khoản: hoàn tiền về thẻ/tài khoản trong 7 - 14 ngày làm việc.',
    },
    {
      title: 'Hoàn tiền qua ví điện tử',
      desc: 'Nếu thanh toán bằng ví điện tử, hoàn tiền sẽ được chuyển về ví trong 3 - 5 ngày làm việc.',
    },
    {
      title: 'Đổi sản phẩm',
      desc: 'Bạn có thể chọn đổi sang sản phẩm khác cùng loại (khác size/màu) hoặc sản phẩm có giá trị tương đương.',
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
        <span className='text-foreground font-medium'>Chính sách đổi trả</span>
      </nav>

      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Chính sách đổi trả</h1>
          <p className='text-muted-foreground'>
            Quy định về điều kiện, quy trình và cách thức hoàn tiền khi bạn muốn đổi hoặc trả sản phẩm đã mua.
          </p>
        </div>

        {/* Return Conditions */}
        <div className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>Điều kiện đổi trả</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {returnConditions.map((item, index) => (
              <div key={index} className='flex gap-4 p-4 bg-gray-50 rounded-xl'>
                <div className='flex-shrink-0'>
                  <div className='w-10 h-10 rounded-full bg-black/10 flex items-center justify-center'>
                    <item.icon className='w-5 h-5' />
                  </div>
                </div>
                <div>
                  <h3 className='font-semibold text-sm mb-1'>{item.title}</h3>
                  <p className='text-xs text-muted-foreground'>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Non-returnable */}
        <div className='bg-red-50 border border-red-100 rounded-xl p-6 mb-8'>
          <div className='flex items-center gap-2 mb-4'>
            <AlertTriangle className='w-5 h-5 text-red-600' />
            <h2 className='text-lg font-semibold text-red-900'>Sản phẩm không được đổi trả</h2>
          </div>
          <ul className='space-y-2 text-sm text-red-800'>
            {nonReturnable.map((item, index) => (
              <li key={index} className='flex gap-2'>
                <span className='flex-shrink-0 text-red-400'>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Return Steps */}
        <div className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>Quy trình đổi trả</h2>
          <div className='space-y-4'>
            {returnSteps.map((item, index) => (
              <div key={index} className='flex gap-4'>
                <div className='flex flex-col items-center'>
                  <div className='w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm flex-shrink-0'>
                    {item.step}
                  </div>
                  {index < returnSteps.length - 1 && (
                    <div className='w-px flex-1 bg-gray-200 my-2' />
                  )}
                </div>
                <div className='pb-6'>
                  <h3 className='font-semibold text-sm mb-1'>{item.title}</h3>
                  <p className='text-xs text-muted-foreground'>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refund Options */}
        <div className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>Hình thức hoàn tiền</h2>
          <div className='space-y-3'>
            {refundOptions.map((item, index) => (
              <div key={index} className='flex gap-3 p-4 bg-gray-50 rounded-xl'>
                <CheckCircle className='w-5 h-5 text-green-600 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='font-semibold text-sm'>{item.title}</p>
                  <p className='text-xs text-muted-foreground mt-0.5'>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Cost Note */}
        <div className='bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8'>
          <h2 className='text-lg font-semibold mb-3 text-amber-800'>Lưu ý về phí vận chuyển</h2>
          <ul className='space-y-2 text-sm text-amber-700'>
            <li className='flex gap-2'>
              <ArrowRight className='w-4 h-4 flex-shrink-0 mt-0.5' />
              <span><strong>Đổi trả miễn phí:</strong> Áp dụng khi sản phẩm bị lỗi từ nhà sản xuất, giao sai hàng, hoặc sai thông tin đơn hàng.</span>
            </li>
            <li className='flex gap-2'>
              <ArrowRight className='w-4 h-4 flex-shrink-0 mt-0.5' />
              <span><strong>Khách chịu phí:</strong> Nếu đổi trả vì lý do không liên quan đến lỗi sản phẩm (sai size, đổi ý, màu không vừa...), phí vận chuyển hai chiều do khách hàng thanh toán.</span>
            </li>
            <li className='flex gap-2'>
              <ArrowRight className='w-4 h-4 flex-shrink-0 mt-0.5' />
              <span>Thời gian hoàn tiền có thể kéo dài thêm 5 - 10 ngày tùy ngân hàng hoặc đơn vị thanh toán.</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className='border rounded-xl p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Shield className='w-5 h-5' />
            <h2 className='text-lg font-semibold'>Cần hỗ trợ đổi trả?</h2>
          </div>
          <p className='text-sm text-muted-foreground mb-4'>
            Đội ngũ chăm sóc khách hàng của chúng tôi sẵn sàng hỗ trợ bạn mọi lúc.
          </p>
          <div className='flex flex-wrap gap-3 text-sm'>
            <Link
              href='tel:0339995273'
              className='flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              <Phone className='w-4 h-4' />
              <span>033 999 5273</span>
            </Link>
            <Link
              href='mailto:returns@vietsneaker.com'
              className='flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              <Mail className='w-4 h-4' />
              <span>returns@vietsneaker.com</span>
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
