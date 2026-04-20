'use client'

import Link from 'next/link'
import { Home, ChevronRight, Phone, Mail, MapPin, Clock, MessageCircle, Send, MessageSquare, HelpCircle } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const contactMethods = [
    {
      icon: Phone,
      title: 'Gọi điện trực tiếp',
      value: '033 999 5273',
      href: 'tel:0339995273',
      available: 'Thứ 2 - Thứ 6, 8:00 - 17:00',
      color: 'bg-black text-white',
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'support@vietsneaker.com',
      href: 'mailto:support@vietsneaker.com',
      available: 'Phản hồi trong 24h làm việc',
      color: 'bg-black text-white',
    },
    {
      icon: MessageCircle,
      title: 'Chat trực tuyến',
      value: 'Zalo / Messenger',
      href: 'https://zalo.me/0339995273',
      available: 'Thứ 2 - Thứ 6, 8:00 - 17:00',
      color: 'bg-black text-white',
    },
  ]

  const faqs = [
    {
      q: 'Làm sao để theo dõi đơn hàng?',
      a: 'Sau khi đơn hàng được bàn giao cho đơn vị vận chuyển, bạn sẽ nhận mã vận đơn qua email. Truy cập trang Tài khoản > Đơn hàng để xem trạng thái chi tiết.',
    },
    {
      q: 'Tôi muốn thay đổi địa chỉ giao hàng sau khi đã đặt.',
      a: 'Vui lòng liên hệ hỗ trợ ngay trong vòng 2 giờ sau khi đặt hàng. Nếu đơn hàng chưa được đóng gói, chúng tôi sẽ cập nhật địa chỉ mới cho bạn.',
    },
    {
      q: 'Sản phẩm giao không đúng như hình ảnh trên web.',
      a: 'Liên hệ hỗ trợ trong vòng 24 giờ kèm ảnh chụp sản phẩm thực tế. Chúng tôi sẽ kiểm tra và xử lý đổi trả miễn phí nếu sản phẩm không đúng với mô tả.',
    },
    {
      q: 'Tôi chưa nhận được mã vận đơn.',
      a: 'Kiểm tra hộp thư spam / email quảng cáo. Nếu vẫn không thấy, liên hệ hỗ trợ qua điện thoại hoặc email để được cung cấp lại mã vận đơn.',
    },
    {
      q: 'Làm sao để hủy đơn hàng?',
      a: 'Đơn hàng có thể hủy trong vòng 2 giờ sau khi đặt, trước khi được chuyển sang trạng thái đóng gói. Truy cập Tài khoản > Đơn hàng để thực hiện hoặc gọi điện trực tiếp.',
    },
    {
      q: 'Tôi có thể đổi size sau khi đã đặt hàng không?',
      a: 'Nếu đơn hàng chưa được giao, bạn có thể yêu cầu đổi size qua hỗ trợ. Đổi size sẽ tùy thuộc vào tình trạng tồn kho của size bạn muốn đổi sang.',
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
        <span className='text-foreground font-medium'>Liên hệ</span>
      </nav>

      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Liên hệ</h1>
          <p className='text-muted-foreground'>
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Liên hệ qua các kênh dưới đây hoặc để lại tin nhắn.
          </p>
        </div>

        {/* Contact Methods */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
          {contactMethods.map((method, index) => (
            <Link
              key={index}
              href={method.href}
              target={method.href.startsWith('http') ? '_blank' : undefined}
              rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className='group block p-6 border rounded-xl hover:border-black transition-all duration-200'
            >
              <div className='w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
                <method.icon className='w-5 h-5' />
              </div>
              <h3 className='font-semibold mb-1'>{method.title}</h3>
              <p className='text-sm text-muted-foreground mb-2'>{method.value}</p>
              <p className='text-xs text-muted-foreground flex items-center gap-1'>
                <Clock className='w-3 h-3' />
                {method.available}
              </p>
            </Link>
          ))}
        </div>

        {/* Contact Form */}
        <div className='border rounded-xl p-6 mb-8'>
          <div className='flex items-center gap-2 mb-6'>
            <Send className='w-5 h-5' />
            <h2 className='text-lg font-semibold'>Gửi tin nhắn</h2>
          </div>
          <form className='space-y-4' onSubmit={handleSubmit}>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1.5'>Họ và tên</label>
                <input
                  type='text'
                  placeholder='Nguyễn Văn A'
                  className='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1.5'>Email</label>
                <input
                  type='email'
                  placeholder='email@example.com'
                  className='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1.5'>Số điện thoại (không bắt buộc)</label>
              <input
                type='tel'
                placeholder='033 999 5273'
                className='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1.5'>Chủ đề</label>
              <select className='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors bg-white'>
                <option>Chọn chủ đề</option>
                <option>Tư vấn sản phẩm</option>
                <option>Theo dõi đơn hàng</option>
                <option>Yêu cầu đổi / trả</option>
                <option>Khiếu nại / Phản hồi</option>
                <option>Hợp tác / Đại lý</option>
                <option>Khác</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1.5'>Nội dung</label>
              <textarea
                rows={5}
                placeholder='Mô tả chi tiết vấn đề hoặc câu hỏi của bạn...'
                className='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors resize-none'
              />
            </div>
            <button
              type='submit'
              className='inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-black/80 transition-colors'
            >
              <Send className='w-4 h-4' />
              Gửi tin nhắn
            </button>
          </form>

          {submitted && (
            <div className='mt-4 p-4 bg-green-50 border border-green-200 rounded-lg'>
              <p className='text-sm text-green-800 font-medium'>Cảm ơn bạn đã liên hệ!</p>
              <p className='text-xs text-green-600 mt-1'>Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.</p>
            </div>
          )}
        </div>

        {/* Store Info */}
        <div className='bg-gray-50 rounded-xl p-6 mb-8'>
          <div className='flex items-center gap-2 mb-4'>
            <MapPin className='w-5 h-5' />
            <h2 className='text-lg font-semibold'>Địa chỉ cửa hàng</h2>
          </div>
          <div className='space-y-3 text-sm'>
            <div className='flex gap-3'>
              <MapPin className='w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5' />
              <div>
                <p className='font-medium'>Viet Sneaker Store</p>
                <p className='text-muted-foreground'>Tòa S3.03, Vinhome Grand Pard, Nguyễn Xiển, Long Bình, TP. Hồ Chí Minh</p>
              </div>
            </div>
            <div className='flex gap-3'>
              <Clock className='w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5' />
              <div>
                <p className='font-medium'>Giờ mở cửa</p>
                <p className='text-muted-foreground'>Thứ 2 - Thứ 6: 8:00 - 20:00</p>
                <p className='text-muted-foreground'>Thứ 7 - Chủ nhật: 9:00 - 18:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <HelpCircle className='w-5 h-5' />
            <h2 className='text-lg font-semibold'>Câu hỏi thường gặp</h2>
          </div>
          <div className='space-y-3'>
            {faqs.map((item, index) => (
              <details key={index} className='group border rounded-lg'>
                <summary className='flex items-center justify-between gap-4 p-4 cursor-pointer select-none list-none'>
                  <span className='font-medium text-sm'>{item.q}</span>
                  <span className='text-muted-foreground group-open:rotate-180 transition-transform'>
                    <svg width='16' height='16' fill='none' viewBox='0 0 16 16'>
                      <path d='M4 6l4 4 4-4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                  </span>
                </summary>
                <div className='px-4 pb-4 text-sm text-muted-foreground'>
                  {item.a}
                </div>
              </details>
            ))}
          </div>
          <p className='text-xs text-muted-foreground mt-4 text-center'>
            Không tìm thấy câu trả lời? Liên hệ trực tiếp qua hotline <Link href='tel:0339995273' className='underline hover:text-foreground'>033 999 5273</Link> để được hỗ trợ ngay.
          </p>
        </div>
      </div>
    </div>
  )
}
