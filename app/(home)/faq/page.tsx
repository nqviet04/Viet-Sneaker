import Link from 'next/link'
import { Home, ChevronRight, HelpCircle, Search, Package, CreditCard, Truck, RotateCcw, Shield, Ruler, Lock } from 'lucide-react'

const faqData = {
  ordering: {
    title: 'Đặt hàng & Thanh toán',
    icon: Package,
    questions: [
      {
        q: 'Làm sao để đặt hàng trên website?',
        a: 'Chọn sản phẩm bạn muốn mua > Chọn size và số lượng > Nhấn "Thêm vào giỏ hàng" > Truy cập giỏ hàng > Nhấn "Thanh toán" > Điền thông tin giao hàng > Chọn phương thức thanh toán > Xác nhận đặt hàng. Bạn sẽ nhận email xác nhận ngay sau khi đặt thành công.',
      },
      {
        q: 'Tôi có thể đặt hàng qua những kênh nào?',
        a: 'Hiện tại bạn có thể đặt hàng qua website, hotline 033 999 5273, hoặc nhắn tin qua Zalo/Messenger. Đặt qua website là cách nhanh nhất và được hưởng đầy đủ chương trình khuyến mãi.',
      },
      {
        q: 'Làm sao để biết size giày phù hợp với chân tôi?',
        a: 'Mỗi sản phẩm có bảng size riêng ở tab "Hướng dẫn chọn size" trên trang chi tiết sản phẩm. Bạn nên đo chiều dài bàn chân (từ gót đến ngón dài nhất) so với bảng size trước khi đặt. Nếu chân bạn nằm giữa hai size, chúng tôi khuyên chọn size lớn hơn.',
      },
      {
        q: 'Tôi đặt nhầm size, có thể thay đổi không?',
        a: 'Nếu đơn hàng chưa được giao, bạn có thể yêu cầu đổi size qua hotline hoặc Zalo. Đổi size phụ thuộc vào tình trạng tồn kho. Nếu đơn đã giao, vui lòng thực hiện yêu cầu đổi trả theo chính sách đổi trả.',
      },
      {
        q: 'Các phương thức thanh toán được chấp nhận?',
        a: 'Chúng tôi chấp nhận thanh toán qua: Thẻ ATM / Internet Banking, Thẻ Visa / Mastercard, Ví điện tử (ZaloPay, Momo, VNPay), Chuyển khoản ngân hàng, Thanh toán khi nhận hàng (COD).',
      },
      {
        q: 'Thanh toán khi nhận hàng (COD) có mất phí không?',
        a: 'Phí COD là 20.000đ cho mỗi đơn hàng. Phí này sẽ được cộng vào tổng giá trị đơn hàng tại bước thanh toán.',
      },
    ],
  },
  shipping: {
    title: 'Vận chuyển & Giao hàng',
    icon: Truck,
    questions: [
      {
        q: 'Thời gian giao hàng bao lâu?',
        a: 'Khu vực nội thành TP.HCM: 1-2 ngày. Khu vực miền Nam (ngoài TP.HCM): 2-3 ngày. Miền Trung: 3-5 ngày. Miền Bắc: 5-7 ngày. Thời gian giao hàng có thể thay đổi vào các dịp lễ, Tết hoặc điều kiện thời tiết bất lợi.',
      },
      {
        q: 'Phí vận chuyển được tính như thế nào?',
        a: 'Miễn phí vận chuyển cho đơn hàng từ 1.000.000đ trở lên. Với đơn dưới 1.000.000đ: phí ship 30.000đ khu vực nội thành TP.HCM, 40.000đ các tỉnh thành khác.',
      },
      {
        q: 'Làm sao theo dõi đơn hàng?',
        a: 'Sau khi đơn được bàn giao cho đơn vị vận chuyển, bạn sẽ nhận mã vận đơn qua email và SMS. Truy cập trang Tài khoản > Đơn hàng để xem trạng thái chi tiết và theo dõi. Bạn cũng có thể tra mã vận đơn trên website của đơn vị vận chuyển.',
      },
      {
        q: 'Tôi có thể yêu cầu giao vào giờ cụ thể không?',
        a: 'Hiện tại chúng tôi chưa hỗ trợ giao hàng theo giờ cụ thể. Tuy nhiên, bạn có thể ghi chú trong đơn hàng (ví dụ: giao vào buổi sáng, tránh giờ nghỉ trưa). Đơn vị vận chuyển sẽ cố gắng sắp xếp theo yêu cầu nhưng không đảm bảo 100%.',
      },
      {
        q: 'Đơn hàng chưa giao, tôi muốn thay đổi địa chỉ.',
        a: 'Liên hệ hỗ trợ ngay trong vòng 2 giờ sau khi đặt hàng qua hotline 033 999 5273. Nếu đơn hàng chưa được đóng gói và bàn giao cho đơn vị vận chuyển, chúng tôi sẽ cập nhật địa chỉ mới cho bạn.',
      },
    ],
  },
  returns: {
    title: 'Đổi trả & Hoàn tiền',
    icon: RotateCcw,
    questions: [
      {
        q: 'Chính sách đổi trả như thế nào?',
        a: 'Sản phẩm được đổi trả trong vòng 30 ngày kể từ ngày nhận hàng nếu còn nguyên tem mác, chưa qua sử dụng và đầy đủ phụ kiện. Đổi trả miễn phí vận chuyển khi lỗi từ nhà sản xuất. Khách chịu phí vận chuyển hai chiều nếu đổi vì lý do cá nhân.',
      },
      {
        q: 'Làm sao để yêu cầu đổi trả?',
        a: 'Truy cập Tài khoản > Đơn hàng > Chi tiết đơn hàng > Nhấn "Yêu cầu đổi trả". Điền lý do đổi trả và gửi ảnh sản phẩm. Đội ngũ hỗ trợ sẽ phản hồi trong vòng 24 giờ làm việc và gửi hướng dẫn gửi hàng.',
      },
      {
        q: 'Hoàn tiền mất bao lâu?',
        a: 'Thanh toán qua thẻ/tài khoản: hoàn tiền trong 7-14 ngày làm việc. Thanh toán qua ví điện tử: hoàn tiền trong 3-5 ngày làm việc. Thời gian có thể kéo dài thêm 5-10 ngày tùy ngân hàng hoặc đơn vị thanh toán.',
      },
      {
        q: 'Sản phẩm giảm giá có được đổi trả không?',
        a: 'Sản phẩm trong chương trình khuyến mãi có thể được đổi trả tùy từng chương trình. Nếu sản phẩm có ghi chú "Không hỗ trợ đổi trả", chúng tôi không thể tiếp nhận yêu cầu đổi trả cho sản phẩm đó.',
      },
      {
        q: 'Tôi nhận được sản phẩm bị lỗi, phải làm sao?',
        a: 'Liên hệ hỗ trợ ngay trong vòng 24 giờ kèm ảnh chụp sản phẩm bị lỗi. Chúng tôi sẽ kiểm tra và xử lý đổi trả miễn phí (bao gồm cả chi phí vận chuyển hai chiều) nếu xác nhận lỗi từ nhà sản xuất.',
      },
    ],
  },
  authentication: {
    title: 'Hàng chính hãng & Bảo hành',
    icon: Shield,
    questions: [
      {
        q: 'Làm sao để xác thực giày chính hãng?',
        a: 'Mỗi đôi giày chính hãng đều có tag xác thực với mã QR hoặc mã số trên hệ thống của thương hiệu. Bạn có thể quét mã QR hoặc truy cập website chính thức của thương hiệu để nhập mã xác thực. Nếu mã không hợp lệ, vui lòng liên hệ hỗ trợ ngay.',
      },
      {
        q: 'Chế độ bảo hành như thế nào?',
        a: 'Tất cả sản phẩm được bảo hành 30 ngày cho lỗi từ nhà sản xuất (keo dính, đứt chỉ, bong tróc da trong điều kiện sử dụng bình thường). Bảo hành không áp dụng cho lỗi do va đập, cắt, xé, sử dụng sai cách hoặc hao mòn tự nhiên.',
      },
      {
        q: 'Hàng order có được bảo hành không?',
        a: 'Hàng order vẫn được bảo hành theo chính sách chung nếu có lỗi từ nhà sản xuất. Tuy nhiên, thời gian bảo hành có thể lâu hơn do hàng order nhập từ nhà cung cấp nước ngoài.',
      },
      {
        q: 'Sản phẩm có đi kèm hóa đơn không?',
        a: 'Mỗi đơn hàng đều đi kèm hóa đơn mua hàng (VAT nếu yêu cầu). Hóa đơn sẽ được gửi kèm trong kiện hàng và/hoặc qua email. Bạn cũng có thể tải hóa đơn điện tử tại trang Tài khoản > Đơn hàng > Chi tiết.',
      },
    ],
  },
  account: {
    title: 'Tài khoản & Ưu đãi',
    icon: Lock,
    questions: [
      {
        q: 'Làm sao để tạo tài khoản?',
        a: 'Nhấn "Đăng ký" ở góc trên bên phải website > Nhập email và mật khẩu > Xác nhận đăng ký qua email. Sau khi đăng ký, bạn có thể theo dõi đơn hàng, lưu sản phẩm yêu thích và nhận ưu đãi riêng.',
      },
      {
        q: 'Quên mật khẩu thì làm sao?',
        a: 'Nhấn "Đăng nhập" > "Quên mật khẩu" > Nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu qua email. Link có hiệu lực trong 24 giờ.',
      },
      {
        q: 'Tôi có thể hủy đơn hàng không?',
        a: 'Đơn hàng có thể hủy trong vòng 2 giờ sau khi đặt, trước khi chuyển sang trạng thái đóng gói. Truy cập Tài khoản > Đơn hàng > Chi tiết > Nhấn "Hủy đơn". Nếu đơn đã thanh toán, tiền sẽ được hoàn trong 7-14 ngày làm việc.',
      },
      {
        q: 'Làm sao để nhận mã giảm giá?',
        a: 'Theo dõi trang Facebook/Zalo chính thức của Viet Sneaker để cập nhật chương trình khuyến mãi. Đăng ký nhận email để nhận mã ưu đãi dành riêng cho thành viên. Mã giảm giá cũng được gửi kèm trong đơn hàng của bạn.',
      },
      {
        q: 'Điểm tích lũy dùng được không?',
        a: 'Chương trình tích điểm hiện đang được phát triển và sẽ sớm ra mắt. Khi có thông báo chính thức, chúng tôi sẽ gửi email đến các thành viên đã đăng ký.',
      },
    ],
  },
}

export default function FAQPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-1 text-sm text-muted-foreground mb-6'>
        <Link href='/' className='hover:text-foreground transition-colors'>
          <Home className='h-4 w-4' />
        </Link>
        <ChevronRight className='h-4 w-4' />
        <span className='text-foreground font-medium'>Câu hỏi thường gặp</span>
      </nav>

      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Câu hỏi thường gặp</h1>
          <p className='text-muted-foreground'>
            Tìm nhanh câu trả lời cho các câu hỏi phổ biến về đặt hàng, vận chuyển, đổi trả và hơn thế nữa.
          </p>
        </div>

        {/* Search */}
        <div className='relative mb-8'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
          <input
            type='text'
            placeholder='Tìm kiếm câu hỏi...'
            className='w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors'
          />
        </div>

        {/* FAQ Categories */}
        <div className='space-y-8'>
          {Object.values(faqData).map((category) => (
            <div key={category.title}>
              <div className='flex items-center gap-2 mb-4'>
                <category.icon className='w-5 h-5' />
                <h2 className='text-lg font-semibold'>{category.title}</h2>
              </div>
              <div className='space-y-2'>
                {category.questions.map((item, index) => (
                  <details key={index} className='group border rounded-xl'>
                    <summary className='flex items-center justify-between gap-4 p-4 cursor-pointer select-none list-none'>
                      <span className='font-medium text-sm pr-4'>{item.q}</span>
                      <span className='text-muted-foreground group-open:rotate-180 transition-transform flex-shrink-0'>
                        <svg width='16' height='16' fill='none' viewBox='0 0 16 16'>
                          <path d='M4 6l4 4 4-4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                        </svg>
                      </span>
                    </summary>
                    <div className='px-4 pb-4 text-sm text-muted-foreground leading-relaxed'>
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className='mt-12 border rounded-xl p-6 text-center'>
          <HelpCircle className='w-10 h-10 mx-auto mb-3 text-muted-foreground' />
          <h3 className='font-semibold mb-2'>Vẫn còn thắc mắc?</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Đội ngũ hỗ trợ của chúng tôi sẵn sàng giải đáp mọi câu hỏi của bạn.
          </p>
          <div className='flex flex-wrap justify-center gap-3 text-sm'>
            <Link
              href='tel:0339995273'
              className='inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 transition-colors'
            >
              <Package className='w-4 h-4' />
              033 999 5273
            </Link>
            <Link
              href='/contact'
              className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
            >
              Gửi tin nhắn
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
