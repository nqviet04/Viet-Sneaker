import Link from 'next/link'
import { Home, ChevronRight, Shield, Lock, Eye, FileText } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-1 text-sm text-muted-foreground mb-6'>
        <Link href='/' className='hover:text-foreground transition-colors'>
          <Home className='h-4 w-4' />
        </Link>
        <ChevronRight className='h-4 w-4' />
        <span className='text-foreground font-medium'>Chính sách bảo mật</span>
      </nav>

      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-3'>
            <Shield className='w-6 h-6' />
          </div>
          <h1 className='text-3xl font-bold mb-2'>Chính sách bảo mật</h1>
          <p className='text-muted-foreground text-sm'>
            Cập nhật lần cuối: 20 tháng 4 năm 2026
          </p>
        </div>

        <div className='prose prose-sm max-w-none'>
          <div className='border rounded-xl p-6 space-y-8'>
            {/* Section 1 */}
            <section>
              <h2 className='text-lg font-bold mb-3 flex items-center gap-2'>
                <Lock className='w-5 h-5' />
                1. Mục đích thu thập thông tin
              </h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
                Viet Sneaker cam kết bảo vệ quyền riêng tư của khách hàng. Chúng tôi thu thập thông tin cá nhân với các mục đích sau:
              </p>
              <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2'>
                <li>Xử lý đơn hàng, giao hàng và dịch vụ hậu mãi.</li>
                <li>Xác minh tài khoản và hỗ trợ khách hàng.</li>
                <li>Gửi thông báo về đơn hàng, khuyến mãi và cập nhật tài khoản.</li>
                <li>Cải thiện sản phẩm, dịch vụ và trải nghiệm người dùng.</li>
                <li>Tuân thủ yêu cầu pháp lý và ngăn chặn gian lận.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className='text-lg font-bold mb-3 flex items-center gap-2'>
                <FileText className='w-5 h-5' />
                2. Thông tin chúng tôi thu thập
              </h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
                Chúng tôi thu thập các thông tin cần thiết để phục vụ quý khách:
              </p>
              <div className='space-y-3'>
                <div className='border rounded-lg p-4'>
                  <h3 className='font-semibold text-sm mb-2'>Thông tin cá nhân</h3>
                  <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1'>
                    <li>Họ và tên</li>
                    <li>Số điện thoại</li>
                    <li>Địa chỉ email</li>
                    <li>Địa chỉ giao hàng</li>
                    <li>Ngày sinh (nếu cung cấp)</li>
                  </ul>
                </div>
                <div className='border rounded-lg p-4'>
                  <h3 className='font-semibold text-sm mb-2'>Thông tin giao dịch</h3>
                  <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1'>
                    <li>Lịch sử đơn hàng</li>
                    <li>Phương thức thanh toán (không lưu số thẻ đầy đủ)</li>
                    <li>Thông tin hoàn tiền</li>
                  </ul>
                </div>
                <div className='border rounded-lg p-4'>
                  <h3 className='font-semibold text-sm mb-2'>Dữ liệu kỹ thuật</h3>
                  <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1'>
                    <li>Địa chỉ IP</li>
                    <li>Loại trình duyệt và thiết bị</li>
                    <li>Cookie và dữ liệu phiên</li>
                    <li>Trang truy cập và thời gian hoạt động</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className='text-lg font-bold mb-3 flex items-center gap-2'>
                <Eye className='w-5 h-5' />
                3. Quyền của khách hàng
              </h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
                Quý khách có các quyền sau đối với dữ liệu cá nhân của mình:
              </p>
              <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2'>
                <li><strong>Truy cập:</strong> Yêu cầu xem dữ liệu cá nhân đang được lưu trữ.</li>
                <li><strong>Chỉnh sửa:</strong> Cập nhật hoặc sửa thông tin không chính xác.</li>
                <li><strong>Xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu cá nhân.</li>
                <li><strong>Hạn chế xử lý:</strong> Yêu cầu tạm ngừng xử lý dữ liệu.</li>
                <li><strong>Phản đối:</strong> Từ chối việc sử dụng dữ liệu cho mục đích marketing.</li>
                <li><strong>Di chuyển dữ liệu:</strong> Yêu cầu xuất dữ liệu ở định dạng phổ biến.</li>
              </ul>
              <p className='text-sm text-muted-foreground leading-relaxed mt-3'>
                Để thực hiện các quyền trên, vui lòng liên hệ qua email hoặc hotline 033 999 5273. Chúng tôi sẽ phản hồi trong vòng 72 giờ.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>4. Bảo mật dữ liệu</h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
                Chúng tôi áp dụng các biện pháp bảo mật sau để bảo vệ dữ liệu khách hàng:
              </p>
              <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2'>
                <li>Mã hóa dữ liệu nhạy cảm bằng giao thức SSL/TLS khi truyền tải.</li>
                <li>Lưu trữ dữ liệu trên máy chủ bảo mật với tường lửa và giám sát 24/7.</li>
                <li>Giới hạn quyền truy cập dữ liệu chỉ cho nhân viên được ủy quyền.</li>
                <li>Không lưu trữ số thẻ tín dụng đầy đủ — xử lý qua cổng thanh toán bảo mật.</li>
                <li>Thực hiện sao lưu dữ liệu định kỳ để phòng trường hợp mất dữ liệu.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>5. Cookies</h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
                Website sử dụng cookies để nâng cao trải nghiệm người dùng:
              </p>
              <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2'>
                <li><strong>Cookies cần thiết:</strong> Đảm bảo hoạt động cơ bản của website (giỏ hàng, đăng nhập).</li>
                <li><strong>Cookies phân tích:</strong> Thu thập dữ liệu ẩn danh để cải thiện website.</li>
                <li><strong>Cookies marketing:</strong> Hiển thị quảng cáo phù hợp với sở thích (nếu có).</li>
              </ul>
              <p className='text-sm text-muted-foreground leading-relaxed mt-3'>
                Quý khách có thể tắt cookies trong cài đặt trình duyệt. Tuy nhiên, một số chức năng của website có thể bị hạn chế.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>6. Chia sẻ thông tin với bên thứ ba</h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
                Chúng tôi không bán thông tin cá nhân. Dữ liệu chỉ được chia sẻ trong các trường hợp:
              </p>
              <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2'>
                <li><strong>Đối tác vận chuyển:</strong> Giao hàng qua GHTK, GHN, J&T (tên, địa chỉ, số điện thoại).</li>
                <li><strong>Cổng thanh toán:</strong> Xử lý thanh toán qua ZaloPay, Momo, VNPay, Ngân hàng.</li>
                <li><strong>Cơ quan pháp luật:</strong> Khi được yêu cầu theo quy định pháp luật.</li>
                <li><strong>Dịch vụ hỗ trợ:</strong> Email marketing qua đối tác được ủy quyền.</li>
              </ul>
              <p className='text-sm text-muted-foreground leading-relaxed mt-3'>
                Tất cả đối tác bên thứ ba đều bị ràng buộc bởi thỏa thuận bảo mật và chỉ được sử dụng dữ liệu cho mục đích cung cấp dịch vụ cho Viet Sneaker.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>7. Lưu trữ dữ liệu</h2>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                Thông tin cá nhân được lưu trữ trong thời gian cần thiết để thực hiện các mục đích thu thập. Dữ liệu tài khoản được lưu cho đến khi khách hàng yêu cầu xóa. Dữ liệu đơn hàng được lưu tối thiểu 5 năm theo quy định kế toán thuế. Sau khi hết thời gian lưu trữ, dữ liệu sẽ được xóa hoặc ẩn danh hóa an toàn.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>8. Liên hệ</h2>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                Nếu có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ:
              </p>
              <div className='mt-3 space-y-1.5 text-sm text-muted-foreground'>
                <p><strong>Hotline:</strong> 033 999 5273 (Thứ 2 - Thứ 6, 8:00 - 17:00)</p>
                <p><strong>Email:</strong> cskh@vietsneaker.vn</p>
                <p><strong>Zalo:</strong> 033 999 5273</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
