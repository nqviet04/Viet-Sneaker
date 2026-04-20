import Link from 'next/link'
import { Home, ChevronRight, FileText, Scale, AlertTriangle, CheckCircle } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-1 text-sm text-muted-foreground mb-6'>
        <Link href='/' className='hover:text-foreground transition-colors'>
          <Home className='h-4 w-4' />
        </Link>
        <ChevronRight className='h-4 w-4' />
        <span className='text-foreground font-medium'>Điều khoản sử dụng</span>
      </nav>

      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-3'>
            <Scale className='w-6 h-6' />
          </div>
          <h1 className='text-3xl font-bold mb-2'>Điều khoản sử dụng</h1>
          <p className='text-muted-foreground text-sm'>
            Cập nhật lần cuối: 20 tháng 4 năm 2026
          </p>
        </div>

        <div className='prose prose-sm max-w-none'>
          <div className='border rounded-xl p-6 space-y-8'>
            {/* Intro */}
            <section>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                Chào mừng bạn đến với Viet Sneaker. Khi truy cập và sử dụng website <strong>vietsneaker.vn</strong> (sau đây gọi là &quot;Website&quot;), bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây. Vui lòng đọc kỹ trước khi sử dụng. Nếu bạn không đồng ý với bất kỳ điều khoản nào, xin vui lòng ngừng sử dụng Website.
              </p>
            </section>

            {/* Section 1 */}
            <section>
              <h2 className='text-lg font-bold mb-3 flex items-center gap-2'>
                <CheckCircle className='w-5 h-5' />
                1. Chấp nhận điều khoản
              </h2>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                Bằng việc truy cập, duyệt hoặc sử dụng bất kỳ phần nào của Website, bạn xác nhận rằng đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản sử dụng này và <Link href='/privacy' className='underline hover:text-foreground'>Chính sách bảo mật</Link> của Viet Sneaker. Nếu bạn đặt hàng với tư cách đại diện của một tổ chức, bạn cam kết rằng bạn có thẩm quyền ràng buộc tổ chức đó.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>2. Tài khoản người dùng</h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
                Khi đăng ký tài khoản trên Website, bạn cam kết:
              </p>
              <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2'>
                <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật.</li>
                <li>Bảo mật thông tin đăng nhập (email và mật khẩu).</li>
                <li>Chịu trách nhiệm hoàn toàn với mọi hoạt động dưới tài khoản của bạn.</li>
                <li>Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép.</li>
                <li>Không sử dụng tài khoản của người khác mà không có sự cho phép.</li>
              </ul>
              <p className='text-sm text-muted-foreground leading-relaxed mt-3'>
                Viet Sneaker có quyền đình chỉ hoặc xóa tài khoản vi phạm điều khoản mà không cần thông báo trước.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>3. Đặt hàng và thanh toán</h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
                Khi đặt hàng trên Website, bạn đồng ý:
              </p>
              <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2'>
                <li>Cung cấp thông tin giao hàng chính xác và đầy đủ.</li>
                <li>Thanh toán đầy đủ giá trị đơn hàng bao gồm phí vận chuyển và phí COD (nếu có).</li>
                <li>Xác nhận đơn hàng qua email hoặc SMS sau khi đặt.</li>
                <li>Đơn hàng chỉ được xử lý khi thanh toán thành công (trừ thanh toán COD).</li>
                <li>Viet Sneaker có quyền từ chối hoặc hủy đơn hàng nếu nghi ngờ gian lận hoặc thông tin không hợp lệ.</li>
              </ul>
              <p className='text-sm text-muted-foreground leading-relaxed mt-3'>
                Giá sản phẩm hiển thị trên Website đã bao gồm VAT (nếu có). Giá có thể thay đổi mà không cần thông báo trước.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>4. Chính sách giao hàng</h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
                Chi tiết về giao hàng được quy định tại <Link href='/shipping' className='underline hover:text-foreground'>Trang vận chuyển</Link>. Tóm tắt:
              </p>
              <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2'>
                <li>Miễn phí vận chuyển cho đơn từ 1.000.000đ trở lên.</li>
                <li>Phí ship 30.000đ (TP.HCM nội thành) và 40.000đ (các tỉnh khác) cho đơn dưới 1.000.000đ.</li>
                <li>Thời gian giao: 1-7 ngày tùy khu vực.</li>
                <li>Phí COD là 20.000đ/đơn hàng.</li>
              </ul>
              <p className='text-sm text-muted-foreground leading-relaxed mt-3'>
                Viet Sneaker không chịu trách nhiệm về chậm trễ do đơn vị vận chuyển hoặc điều kiện bất khả kháng.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>5. Chính sách đổi trả</h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
                Chi tiết về đổi trả được quy định tại <Link href='/returns' className='underline hover:text-foreground'>Trang đổi trả</Link>. Tóm tắt:
              </p>
              <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2'>
                <li>Đổi trả trong 30 ngày kể từ ngày nhận hàng.</li>
                <li>Sản phẩm phải còn nguyên tem mác, chưa qua sử dụng.</li>
                <li>Đổi trả miễn phí nếu lỗi từ nhà sản xuất.</li>
                <li>Khách chịu phí vận chuyển hai chiều nếu đổi vì lý do cá nhân.</li>
                <li>Hoàn tiền trong 7-14 ngày làm việc (thẻ/tài khoản) hoặc 3-5 ngày (ví điện tử).</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>6. Sở hữu trí tuệ</h2>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                Tất cả nội dung trên Website bao gồm văn bản, hình ảnh, logo, thiết kế, mã nguồn và thương hiệu đều thuộc quyền sở hữu của Viet Sneaker hoặc được cấp phép hợp lệ. Bạn không được phép sao chép, phân phối, tái tạo hoặc sử dụng bất kỳ nội dung nào cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản của Viet Sneaker.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>7. Sản phẩm và giá cả</h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
                Chúng tôi nỗ lực hiển thị thông tin sản phẩm chính xác nhất:
              </p>
              <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2'>
                <li>Hình ảnh sản phẩm mang tính chất minh họa, màu sắc thực tế có thể khác.</li>
                <li>Giá được niêm yết bằng VND và đã bao gồm VAT.</li>
                <li>Các chương trình khuyến mãi có hiệu lực trong thời gian quy định hoặc đến khi hết hàng.</li>
                <li>Tồn kho sản phẩm được cập nhật tự động nhưng có thể có sai lệch nhỏ.</li>
                <li>Tất cả sản phẩm được cam kết chính hãng với tag xác thực.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>8. Giới hạn trách nhiệm</h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
                Viet Sneaker cố gắng đảm bảo thông tin trên Website chính xác. Tuy nhiên, chúng tôi không đảm bảo tuyệt đối và không chịu trách nhiệm về:
              </p>
              <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2'>
                <li>Lỗi hoặc thiếu sót trong mô tả sản phẩm.</li>
                <li>Gián đoạn kỹ thuật hoặc không khả dụng của Website.</li>
                <li>Thiệt hại gián tiếp, đặc biệt hoặc do hậu quả phát sinh.</li>
                <li>Chậm trễ giao hàng do đơn vị vận chuyển hoặc bất khả kháng.</li>
                <li>Hành vi của bên thứ ba hoặc người dùng khác.</li>
              </ul>
              <p className='text-sm text-muted-foreground leading-relaxed mt-3'>
                Tổng trách nhiệm của Viet Sneaker (nếu có) không vượt quá giá trị đơn hàng liên quan.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>9. Hành vi bị cấm</h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
                Bạn đồng ý không thực hiện các hành vi sau:
              </p>
              <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2'>
                <li>Sử dụng Website cho mục đích bất hợp pháp hoặc vi phạm pháp luật.</li>
                <li>Cố gắng truy cập trái phép vào hệ thống hoặc đánh cắp dữ liệu.</li>
                <li>Đặt hàng giả, thông tin sai sự thật hoặc sử dụng phương thức thanh toán gian lận.</li>
                <li>Can thiệp, phá hoại hoặc sử dụng automated tools (bot) trên Website.</li>
                <li>Sao chép hoặc thu thập dữ liệu Website cho mục đích thương mại.</li>
                <li>Xúc phạm, quấy rối hoặc gây hại cho người khác.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>10. Thay đổi điều khoản</h2>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                Viet Sneaker có quyền thay đổi, cập nhật hoặc bổ sung các Điều khoản sử dụng này bất kỳ lúc nào. Thay đổi sẽ có hiệu lực ngay khi được đăng tải trên Website. Bạn nên kiểm tra trang này định kỳ để cập nhật các thay đổi. Việc tiếp tục sử dụng Website sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>11. Luật áp dụng và giải quyết tranh chấp</h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
                Các Điều khoản sử dụng này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp phát sinh từ việc sử dụng Website sẽ được giải quyết theo thứ tự:
              </p>
              <ul className='list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2'>
                <li>Thương lượng, hòa giải trên tinh thần thiện chí.</li>
                <li>Khiếu nại qua hotline 033 999 5273 hoặc email cskh@vietsneaker.vn.</li>
                <li>Nếu không giải quyết được, tranh chấp sẽ được đưa ra Tòa án có thẩm quyền tại TP.HCM.</li>
              </ul>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className='text-lg font-bold mb-3'>12. Thông tin liên hệ</h2>
              <p className='text-sm text-muted-foreground leading-relaxed mb-3'>
                Nếu có câu hỏi về Điều khoản sử dụng, vui lòng liên hệ:
              </p>
              <div className='space-y-1.5 text-sm text-muted-foreground'>
                <p><strong>Viet Sneaker</strong></p>
                <p><strong>Hotline:</strong> 033 999 5273 (Thứ 2 - Thứ 6, 8:00 - 17:00)</p>
                <p><strong>Email:</strong> cskh@vietsneaker.vn</p>
                <p><strong>Zalo:</strong> 033 999 5273</p>
                <p><strong>Địa chỉ:</strong> TP. Hồ Chí Minh, Việt Nam</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
