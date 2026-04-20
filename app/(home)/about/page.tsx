import Link from 'next/link'
import { Home, ChevronRight, Star, Award, Truck, Shield, Users, Heart, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { value: '5+', label: 'Năm kinh nghiệm' },
    { value: '50,000+', label: 'Khách hàng tin tưởng' },
    { value: '500+', label: 'Sản phẩm chính hãng' },
    { value: '4.9/5', label: 'Đánh giá trung bình' },
  ]

  const values = [
    {
      icon: Shield,
      title: 'Chính hãng 100%',
      desc: 'Mọi sản phẩm đều có tag xác thực và được cam kết chính hãng từ nhà phân phối ủy quyền.',
    },
    {
      icon: Truck,
      title: 'Giao hàng nhanh chóng',
      desc: 'Giao hàng trong 1-2 ngày nội thành TP.HCM, 3-5 ngày các tỉnh thành khác.',
    },
    {
      icon: Star,
      title: 'Chất lượng phục vụ',
      desc: 'Đội ngũ tư vấn chuyên nghiệp, hỗ trợ 24/7 qua hotline, Zalo và Messenger.',
    },
    {
      icon: Heart,
      title: 'Chính sách đổi trả',
      desc: 'Đổi trả miễn phí trong 30 ngày với bất kỳ lý do gì. Khách hàng luôn là ưu tiên hàng đầu.',
    },
  ]

  const team = [
    {
      name: 'Nguyễn Quốc Việt',
      role: 'Founder & CEO',
      desc: 'Hơn 10 năm kinh nghiệm trong ngành giày thể thao chính hãng tại Việt Nam.',
    },
    {
      name: 'Kiều Anh Quân',
      role: 'Head of Operations',
      desc: 'Quản lý chuỗi cung ứng và vận hành kho hàng để đảm bảo giao hàng nhanh nhất.',
    },
    {
      name: 'Lê Hoàng Nam',
      role: 'Head of Customer Care',
      desc: 'Xây dựng đội ngũ chăm sóc khách hàng tận tâm, giải quyết mọi vấn đề trong 24h.',
    },
  ]

  const timeline = [
    {
      year: '2019',
      event: 'Khởi đầu',
      desc: 'Bắt đầu từ một cửa hàng nhỏ tại Quận 1, TP.HCM với mong muốn mang đến giày chính hãng với giá hợp lý.',
    },
    {
      year: '2020',
      event: 'Mở rộng online',
      desc: 'Ra mắt website bán hàng trực tuyến, phục vụ khách hàng toàn quốc trong giai đoạn giãn cách.',
    },
    {
      year: '2021',
      event: 'Hợp tác chiến lược',
      desc: 'Trở thành đại lý ủy quyền của nhiều thương hiệu lớn: Nike, Adidas, Puma, Converse, Vans.',
    },
    {
      year: '2022',
      event: 'Cộng đồng 20.000+',
      desc: 'Đạt mốc 20.000 khách hàng và ra mắt chương trình khách hàng thân thiết đầu tiên.',
    },
    {
      year: '2023',
      event: 'Mở rộng kho hàng',
      desc: 'Nâng cấp kho hàng 500m², hệ thống quản lý tồn kho tự động, giao hàng nhanh hơn 30%.',
    },
    {
      year: '2024',
      event: 'Phát triển bền vững',
      desc: 'Ra mắt chương trình tái chế giày cũ và cam kết phát triển thương hiệu bền vững.',
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
        <span className='text-foreground font-medium'>Về chúng tôi</span>
      </nav>

      <div className='max-w-4xl mx-auto'>
        {/* Hero */}
        <div className='text-center mb-12'>
          <h1 className='text-3xl font-bold mb-4'>Về Viet Sneaker</h1>
          <p className='text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto'>
            Khởi nguồn từ niềm đam mê với những đôi giày thể thao chính hãng, Viet Sneaker ra đời với sứ mệnh mang đến cho giới trẻ Việt Nam những sản phẩm authentic với mức giá hợp lý nhất.
          </p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-12'>
          {stats.map((stat) => (
            <div key={stat.label} className='text-center p-4 border rounded-xl'>
              <div className='text-2xl font-bold mb-1'>{stat.value}</div>
              <div className='text-sm text-muted-foreground'>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className='mb-12'>
          <h2 className='text-xl font-bold mb-4'>Câu chuyện của Viet Sneaker</h2>
          <div className='space-y-4 text-sm text-muted-foreground leading-relaxed'>
            <p>
              Năm 2019, từ một cửa hàng nhỏ tại Quận 1, TP.HCM, chúng tôi bắt đầu hành trình mang đến những đôi giày thể thao chính hãng cho giới trẻ Việt Nam. Nhận thấy thị trường giày chính hãng tại Việt Nam còn nhiều khó khăn — hàng giả tràn lan, giá cao, nguồn gốc không rõ ràng — chúng tôi quyết tâm tạo ra một địa chỉ đáng tin cậy.
            </p>
            <p>
              Đến nay, Viet Sneaker đã phục vụ hơn 50.000 khách hàng trên toàn quốc, trở thành đại lý ủy quyền của Nike, Adidas, Puma, Converse, Vans và nhiều thương hiệu nổi tiếng khác. Mỗi sản phẩm đều có tag xác thực chính hãng và chế độ bảo hành rõ ràng.
            </p>
            <p>
              Chúng tôi không chỉ bán giày — chúng tôi xây dựng một cộng đồng yêu thời trang thể thao, nơi mà mỗi khách hàng đều cảm thấy được tôn trọng và quan tâm. Đó là lý do chúng tôi luôn đặt chất lượng sản phẩm và dịch vụ lên hàng đầu.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className='mb-12'>
          <h2 className='text-xl font-bold mb-4'>Giá trị cốt lõi</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {values.map((value) => (
              <div key={value.title} className='flex gap-4 p-4 border rounded-xl'>
                <div className='w-10 h-10 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0'>
                  <value.icon className='w-5 h-5' />
                </div>
                <div>
                  <h3 className='font-semibold mb-1'>{value.title}</h3>
                  <p className='text-sm text-muted-foreground'>{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className='mb-12'>
          <h2 className='text-xl font-bold mb-6'>Hành trình phát triển</h2>
          <div className='relative'>
            <div className='absolute left-4 top-0 bottom-0 w-px bg-gray-200' />
            <div className='space-y-6'>
              {timeline.map((item) => (
                <div key={item.year} className='relative pl-10'>
                  <div className='absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-black' />
                  <div>
                    <div className='flex items-baseline gap-2'>
                      <span className='text-sm font-bold'>{item.year}</span>
                      <span className='text-sm font-semibold'>{item.event}</span>
                    </div>
                    <p className='text-sm text-muted-foreground mt-1'>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className='mb-12'>
          <h2 className='text-xl font-bold mb-4'>Đội ngũ</h2>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {team.map((member) => (
              <div key={member.name} className='text-center p-4 border rounded-xl'>
                <div className='w-16 h-16 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center'>
                  <Users className='w-8 h-8 text-gray-400' />
                </div>
                <h3 className='font-semibold'>{member.name}</h3>
                <p className='text-sm text-muted-foreground mb-2'>{member.role}</p>
                <p className='text-xs text-muted-foreground'>{member.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className='border rounded-xl p-6 text-center'>
          <Award className='w-10 h-10 mx-auto mb-3 text-muted-foreground' />
          <h3 className='font-semibold mb-2'>Sẵn sàng khám phá?</h3>
          <p className='text-sm text-muted-foreground mb-4'>
            Cùng Viet Sneaker tìm cho mình đôi giày ưng ý nhất.
          </p>
          <Link
            href='/products'
            className='inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-black/80 transition-colors'
          >
            Xem sản phẩm
            <ArrowRight className='w-4 h-4' />
          </Link>
        </div>
      </div>
    </div>
  )
}
