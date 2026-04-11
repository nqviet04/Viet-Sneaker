/**
 * ============================================
 * SEED DATA - WEBSITE BÁN GIÀY
 * ============================================
 * Script tạo dữ liệu mẫu cho website bán giày
 * Bao gồm:
 * - 2 Users (admin + user)
 * - 48 sản phẩm giày từ 6 thương hiệu
 * - Dữ liệu tồn kho theo size
 * - 100 đơn hàng mẫu
 * ============================================
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient, OrderStatus, Brand, Gender, ShoeType } from '@prisma/client'
import { hash } from 'bcryptjs'
import { subDays, addHours, addMinutes } from 'date-fns'

const prisma = new PrismaClient()

// ============================================
// DỮ LIỆU SẢN PHẨM
// ============================================

/**
 * Danh sách sản phẩm giày mẫu
 * Mỗi sản phẩm có: brand, name, description, price, images, sizes, colors, gender, shoeType
 */
const SHOE_PRODUCTS = [
  // ==================== NIKE ====================
  {
    id: 'nike-air-max-90',
    name: 'Nike Air Max 90',
    description: 'Giày Nike Air Max 90 huyền thoại với bộ đệm Air Max nổi bật. Thiết kế retro mang phong cách thập niên 90s, kết hợp hoàn hảo giữa thẩm mỹ và công nghệ đệm êm ái.',
    price: 3490000,
    originalPrice: 4290000,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop',
    ],
    brand: Brand.NIKE,
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['white', 'black', 'red'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'nike-air-force-1-07',
    name: 'Nike Air Force 1 \'07',
    description: "Nike Air Force 1 là biểu tượng văn hóa streetwear thế giới. Phiên bản '07 classic với thiết kế low-top, chất liệu da bền bỉ và đệm Air êm ái.",
    price: 2790000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop',
    ],
    brand: Brand.NIKE,
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    colors: ['white', 'black'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'nike-zoom-pegasus-40',
    name: 'Nike Pegasus 40',
    description: 'Nike Pegasus 40 - dòng giày chạy bộ bán chạy nhất của Nike. Đệm Zoom Air phản hồi nhanh, upper breathable và thiết kế nhẹ giúp tăng tốc độ chạy.',
    price: 3990000,
    originalPrice: 4590000,
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    ],
    brand: Brand.NIKE,
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['black', 'blue', 'grey'],
    gender: Gender.MEN,
    shoeType: ShoeType.RUNNING,
  },
  {
    id: 'nike-dunk-low',
    name: 'Nike Dunk Low Retro',
    description: 'Nike Dunk Low Retro mang đậm phong cách basketball thập niên 80s. Màu sắc classic kết hợp upper da premium, perfect cho street style.',
    price: 2890000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop',
    ],
    brand: Brand.NIKE,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    colors: ['white', 'black', 'red'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'nike-react-infinity',
    name: 'Nike React Infinity Run',
    description: 'Nike React Infinity được thiết kế để giảm chấn thương khi chạy. Đệm React foam êm ái, thanh Stabilizer nâng đỡ cổ chân và thiết kế rộng rãi.',
    price: 4590000,
    originalPrice: 5190000,
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    ],
    brand: Brand.NIKE,
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['black', 'blue'],
    gender: Gender.MEN,
    shoeType: ShoeType.RUNNING,
  },
  {
    id: 'nike-blazer-mid-77',
    name: 'Nike Blazer Mid \'77 Vintage',
    description: "Nike Blazer Mid '77 với thiết kế vintage mang phong cách retro. Upper canvas và da nobuck, đế rubber classic, lý tưởng cho everyday style.",
    price: 2490000,
    originalPrice: 2990000,
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1595341884576-1cc805e7d4c8?w=800&h=800&fit=crop',
    ],
    brand: Brand.NIKE,
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['white', 'black', 'brown'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'nike-air-jordan-1-mid',
    name: 'Air Jordan 1 Mid',
    description: 'Air Jordan 1 Mid - phiên bản mid-top của dòng giày huyền thoại. Thiết kế iconic với Wings logo, Swoosh và colorway đa dạng.',
    price: 3890000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop',
    ],
    brand: Brand.NIKE,
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['black', 'red', 'blue', 'white'],
    gender: Gender.MEN,
    shoeType: ShoeType.BASKETBALL,
  },
  {
    id: 'nike-vaporfly-3',
    name: 'Nike Vaporfly 3',
    description: 'Nike Vaporfly 3 - giày racing carbon của Nike. Đệm ZoomX foam siêu nhẹ, carbon fiber plate tăng lực đẩy, thiết kế aerodynamics cho vận động viên.',
    price: 6990000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&h=800&fit=crop',
    ],
    brand: Brand.NIKE,
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['white', 'green', 'pink'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.RUNNING,
  },

  // ==================== ADIDAS ====================
  {
    id: 'adidas-ultraboost-22',
    name: 'Adidas Ultraboost 22',
    description: 'Adidas Ultraboost 22 với công nghệ Boost đệm êm tối đa. Linear Energy Push tăng lực đẩy, Primeknit+ upper ôm sát chân và Torsion System ổn định.',
    price: 4290000,
    originalPrice: 4990000,
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop',
    ],
    brand: Brand.ADIDAS,
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    colors: ['white', 'black', 'grey'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.RUNNING,
  },
  {
    id: 'adidas-stan-smith',
    name: 'Adidas Stan Smith',
    description: 'Adidas Stan Smith - biểu tượng tennis từ năm 1971. Thiết kế clean với perforated 3 stripes, leather upper và iconic green tab. Perfect cho casual wear.',
    price: 2290000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop',
    ],
    brand: Brand.ADIDAS,
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
    colors: ['white', 'black', 'green'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'adidas-samba-og',
    name: 'Adidas Samba OG',
    description: 'Adidas Samba OG - huyền thoại từ 1950. Ban đầu thiết kế cho sân indoor football, giờ là icon của street fashion. Leather upper, gum sole classic.',
    price: 2490000,
    originalPrice: 2790000,
    images: [
      'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560769629-975ec94e7a86?w=800&h=800&fit=crop',
    ],
    brand: Brand.ADIDAS,
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['white', 'black', 'brown'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'adidas-nmd-r1',
    name: 'Adidas NMD_R1',
    description: 'Adidas NMD_R1 kết hợp công nghệ Boost với thiết kế futuristic. Features như colored blocks và signature NMD style. Comfortable cho all-day wear.',
    price: 3290000,
    originalPrice: 3890000,
    images: [
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=800&h=800&fit=crop',
    ],
    brand: Brand.ADIDAS,
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['white', 'black', 'red', 'blue'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'adidas-forum-low',
    name: 'Adidas Forum Low',
    description: 'Adidas Forum Low - heritage basketball shoe từ 1984. Thiết kế low-cut với iconic ankle strap, leather upper và rubber cupsole. Classic look cho modern style.',
    price: 2690000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1595341884576-1cc805e7d4c8?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1612902666506-4a6a0b36a77f?w=800&h=800&fit=crop',
    ],
    brand: Brand.ADIDAS,
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['white', 'black'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'adidas-terrex-agravic',
    name: 'Adidas Terrex Agravic',
    description: 'Adidas Terrex Agravic - giày trail running chuyên nghiệp. Đế Continental rubber bám tốt, GORE-TEX membrane chống nước và Boost midsole cho ultra marathon.',
    price: 5590000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=800&fit=crop',
    ],
    brand: Brand.ADIDAS,
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['black', 'green', 'grey'],
    gender: Gender.MEN,
    shoeType: ShoeType.HIKING,
  },
  {
    id: 'adidas-superstar',
    name: 'Adidas Superstar',
    description: 'Adidas Superstar - legend của basketball thập niên 70s. Shell toe iconic, 3 stripes perforated và leather upper. Từ court đến street - timeless style.',
    price: 1990000,
    originalPrice: 2390000,
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop',
    ],
    brand: Brand.ADIDAS,
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
    colors: ['white', 'black'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'adidas-solarglide-5',
    name: 'Adidas Solar Glide 5',
    description: 'Adidas Solar Glide 5 - giày chạy bộ everyday với công nghệ Solar. Đệm Boost dồi dào, Solarpod ổn định và Continental rubber sole. Lý tưởng cho daily training.',
    price: 3790000,
    originalPrice: 4290000,
    images: [
      'https://images.unsplash.com/photo-1604682320579-0df1996b4d8e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&h=800&fit=crop',
    ],
    brand: Brand.ADIDAS,
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['white', 'black', 'blue'],
    gender: Gender.MEN,
    shoeType: ShoeType.RUNNING,
  },

  // ==================== PUMA ====================
  {
    id: 'puma-suede-classic',
    name: 'Puma Suede Classic XXI',
    description: 'Puma Suede - icon từ 1968 với thiết kế suede đặc trưng. Formstrip signature, rubber sole và classic silhouette. Symbol của street culture.',
    price: 1890000,
    originalPrice: 2190000,
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop',
    ],
    brand: Brand.PUMA,
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['black', 'brown', 'navy', 'red'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'puma-rs-x',
    name: 'Puma RS-X',
    description: 'Puma RS-X - phiên bản modern của Running System. Thiết kế chunky với bold colors, IMEVA midsole và suede/mesh upper. Retro-tech aesthetic.',
    price: 2690000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop',
    ],
    brand: Brand.PUMA,
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['white', 'black', 'blue', 'red'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'puma-velvet',
    name: 'Puma Classic Velvet',
    description: 'Puma Classic Velvet với upper nhung mềm mại. Formstrip signature và rubber sole classic. Luxe comfort cho everyday styling.',
    price: 1590000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&h=800&fit=crop',
    ],
    brand: Brand.PUMA,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    colors: ['black', 'navy', 'green'],
    gender: Gender.WOMEN,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'puma-devastate-low',
    name: 'Puma Devastate Low',
    description: 'Puma Devastate Low - giày bóng đá sân cỏ nhân tạo. Synthetic upper bền bỉ, studs configuration tối ưu cho AG turf và lightweight construction.',
    price: 1390000,
    originalPrice: 1690000,
    images: [
      'https://images.unsplash.com/photo-1612902666506-4a6a0b36a77f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&h=800&fit=crop',
    ],
    brand: Brand.PUMA,
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['black', 'white'],
    gender: Gender.MEN,
    shoeType: ShoeType.TRAINING,
  },
  {
    id: 'puma-fern',
    name: 'Puma Fern 2.0',
    description: 'Puma Fern 2.0 - giày chạy bộ với thiết kế chunky. IMEVA midsole êm ái, breathable mesh upper và rubber outsole. Bold style cho bold runners.',
    price: 2290000,
    originalPrice: 2590000,
    images: [
      'https://images.unsplash.com/photo-1460353581641-37baddd0b49c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    ],
    brand: Brand.PUMA,
    sizes: ['39', '40', '41', '42', '43'],
    colors: ['white', 'black', 'grey'],
    gender: Gender.MEN,
    shoeType: ShoeType.RUNNING,
  },
  {
    id: 'puma-caven',
    name: 'Puma Caven',
    description: 'Puma Caven - chunky sneaker với retro basketball vibes. Leather upper, stitched details và thick rubber sole. 80s aesthetic cho 21st century.',
    price: 2090000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1595341884576-1cc805e7d4c8?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560769629-975ec94e7a86?w=800&h=800&fit=crop',
    ],
    brand: Brand.PUMA,
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['white', 'black'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'puma-maylene',
    name: 'Puma Maylene',
    description: "Puma Maylene - women's specific silhouette với feminine design. Soft leather upper, cushioned midsole và stylish colorways. Comfort meets style.",
    price: 1790000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1604682320579-0df1996b4d8e?w=800&h=800&fit=crop',
    ],
    brand: Brand.PUMA,
    sizes: ['36', '37', '38', '39', '40'],
    colors: ['pink', 'white', 'black'],
    gender: Gender.WOMEN,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'puma-mb',
    name: 'Puma MB.1 LaMelo Ball',
    description: 'Puma MB.1 - giày signature của LaMelo Ball. Thiết kế low-cut với PUMA Hoops tech, Nitro foam midsole và herringbone outsole. Made for play.',
    price: 3490000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop',
    ],
    brand: Brand.PUMA,
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['white', 'black', 'red'],
    gender: Gender.MEN,
    shoeType: ShoeType.BASKETBALL,
  },

  // ==================== NEW BALANCE ====================
  {
    id: 'nb-550',
    name: 'New Balance 550',
    description: 'New Balance 550 - basketball shoe từ 1989 được revival gần đây. Leather upper, perforated details và classic NB logo. Từ court đến streetwear essential.',
    price: 2890000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop',
    ],
    brand: Brand.NEW_BALANCE,
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['white', 'black', 'green', 'grey'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'nb-574',
    name: 'New Balance 574',
    description: 'New Balance 574 - best-seller icon của NB. ENCAP midsole technology, suede/mesh upper và đế chunky recognizable. The everyday sneaker.',
    price: 2490000,
    originalPrice: 2890000,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop',
    ],
    brand: Brand.NEW_BALANCE,
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
    colors: ['grey', 'navy', 'brown', 'green'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'nb-327',
    name: 'New Balance 327',
    description: 'New Balance 327 - retro running style với modern edge. Oversized N logo, suede overlays và vintage-inspired colorways. Bold statement piece.',
    price: 2690000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&h=800&fit=crop',
    ],
    brand: Brand.NEW_BALANCE,
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['orange', 'blue', 'grey', 'white'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'nb-fuelcell-supercomp',
    name: 'New Balance FuelCell SuperComp Trainer',
    description: 'NB FuelCell SuperComp Trainer - giày training với carbon plate. FuelCell foam maximum energy return, Ultra Shell support và NDurance rubber. Elite performance.',
    price: 5990000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1460353581641-37baddd0b49c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=800&fit=crop',
    ],
    brand: Brand.NEW_BALANCE,
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['white', 'black', 'blue'],
    gender: Gender.MEN,
    shoeType: ShoeType.TRAINING,
  },
  {
    id: 'nb-2002r',
    name: 'New Balance 2002R',
    description: 'New Balance 2002R - protection shoe được modernized. ABZORB cushioning, N-ERGY shock absorption và reflective details. Comfort meets heritage.',
    price: 3290000,
    originalPrice: 3790000,
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1612902666506-4a6a0b36a77f?w=800&h=800&fit=crop',
    ],
    brand: Brand.NEW_BALANCE,
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['white', 'grey', 'navy', 'black'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'nb-990v5',
    name: 'New Balance 990v5',
    description: 'New Balance 990v5 - Made in USA icon với premium quality. ENCAP midsole, dual-density foam và pigskin/suede upper. Statement of quality craftsmanship.',
    price: 4990000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1595341884576-1cc805e7d4c8?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&h=800&fit=crop',
    ],
    brand: Brand.NEW_BALANCE,
    sizes: ['39', '40', '41', '42', '43', '44', '45'],
    colors: ['grey'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'nb-freshfoam-1080',
    name: 'New Balance Fresh Foam X 1080v12',
    description: 'NB Fresh Foam X 1080v12 - plush cushioned running shoe. Fresh Foam X midsole ultra-soft, Hypknit upper stretchable và lightweight. Premium daily trainer.',
    price: 4290000,
    originalPrice: 4890000,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&h=800&fit=crop',
    ],
    brand: Brand.NEW_BALANCE,
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['white', 'blue', 'pink'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.RUNNING,
  },
  {
    id: 'nb-608',
    name: 'New Balance 608v5',
    description: 'New Balance 608v5 - stability cross trainer. Dual-density Collar foam, PU insert và ABZORB heel. Extra width available cho different foot shapes.',
    price: 1890000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1604682320579-0df1996b4d8e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560769629-975ec94e7a86?w=800&h=800&fit=crop',
    ],
    brand: Brand.NEW_BALANCE,
    sizes: ['39', '40', '41', '42', '43', '44', '45', '46'],
    colors: ['white', 'black', 'grey'],
    gender: Gender.MEN,
    shoeType: ShoeType.TRAINING,
  },

  // ==================== CONVERSE ====================
  {
    id: 'converse-chuck-70',
    name: 'Converse Chuck 70 High',
    description: 'Converse Chuck 70 - premium version của classic Chuck Taylor. Higher foxing, cushioning Ortholite insole và vintage details. Higher quality, same icon.',
    price: 1890000,
    originalPrice: 2190000,
    images: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&h=800&fit=crop',
    ],
    brand: Brand.CONVERSE,
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
    colors: ['black', 'white', 'red', 'navy'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'converse-chuck-70-low',
    name: 'Converse Chuck 70 Low',
    description: 'Converse Chuck 70 Low - phiên bản low-top của Chuck 70 premium. Same vintage details, Ortholite cushioning nhưng silhouette thấp hơn.',
    price: 1690000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop',
    ],
    brand: Brand.CONVERSE,
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    colors: ['white', 'black', 'green'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'converse-run-star-hike',
    name: 'Converse Run Star Hike',
    description: 'Converse Run Star Hike - chunky platform sneaker. Wedge midsole với exaggerated height, jagged outsole edge và all-over printed canvas.',
    price: 2290000,
    originalPrice: 2590000,
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop',
    ],
    brand: Brand.CONVERSE,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    colors: ['black', 'white', 'egret'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'converse-chuck-taylor-ox',
    name: 'Converse Chuck Taylor All Star Low',
    description: 'Converse Chuck Taylor All Star - biểu tượng văn hóa từ 1917. Canvas upper, vulcanized rubber sole và iconic star logo. The original sneaker.',
    price: 1290000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1460353581641-37baddd0b49c?w=800&h=800&fit=crop',
    ],
    brand: Brand.CONVERSE,
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
    colors: ['white', 'black', 'red', 'navy'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'converse-chuck-2-0',
    name: 'Converse Chuck II',
    description: 'Converse Chuck II với cải tiến comfort. Lunarlon foam insole, improved cushioning và breathable canvas. Modern comfort trong classic silhouette.',
    price: 1490000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1612902666506-4a6a0b36a77f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&h=800&fit=crop',
    ],
    brand: Brand.CONVERSE,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    colors: ['white', 'black', 'blue'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'converse-one-star',
    name: 'Converse One Star',
    description: 'Converse One Star - skate classic từ 1974. Suede upper, vulcanized sole và single star logo. Originally skate shoe, giờ là streetwear staple.',
    price: 1590000,
    originalPrice: 1790000,
    images: [
      'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560769629-975ec94e7a86?w=800&h=800&fit=crop',
    ],
    brand: Brand.CONVERSE,
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    colors: ['black', 'white', 'burgundy', 'green'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.SKATEBOARDING,
  },
  {
    id: 'converse-jack-purcell',
    name: 'Converse Jack Purcell',
    description: 'Converse Jack Purcell - tennis heritage shoe với signature smile. Canvas upper, rubber toe cap và deconstructed design. Smart casual essential.',
    price: 1390000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1595341884576-1cc805e7d4c8?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1597045566677-8cf5ed9b4cf7?w=800&h=800&fit=crop',
    ],
    brand: Brand.CONVERSE,
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    colors: ['white', 'black', 'navy'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'converse-addict',
    name: 'Converse Addict',
    description: 'Converse Addict - premium line Made in Japan. Higher quality materials, 13mm extra insole và improved construction. For true Converse collectors.',
    price: 3190000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1604682320579-0df1996b4d8e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&h=800&fit=crop',
    ],
    brand: Brand.CONVERSE,
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['black', 'white'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },

  // ==================== VANS ====================
  {
    id: 'vans-old-skool',
    name: 'Vans Old Skool',
    description: 'Vans Old Skool - icon của skateboarding culture. Side stripe signature, suede/canvas upper và waffle rubber outsole. The first shoe with side stripe.',
    price: 1690000,
    originalPrice: 1890000,
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop',
    ],
    brand: Brand.VANS,
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
    colors: ['black', 'white', 'navy', 'red'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.SKATEBOARDING,
  },
  {
    id: 'vans-sk8-hi',
    name: 'Vans Sk8-Hi',
    description: 'Vans Sk8-Hi - high-top skate classic. Padded collar, durable suede toe box và signature side stripe. Supportive và protective cho tricks.',
    price: 1890000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop',
    ],
    brand: Brand.VANS,
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
    colors: ['black', 'white', 'black-white'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.SKATEBOARDING,
  },
  {
    id: 'vans-authentic',
    name: 'Vans Authentic',
    description: 'Vans Authentic - original Vans silhouette từ 1966. Canvas upper, vulcanized waffle outsole và minimal design. Simple, timeless skate shoe.',
    price: 1190000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&h=800&fit=crop',
    ],
    brand: Brand.VANS,
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
    colors: ['black', 'white', 'navy', 'green', 'red'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.SKATEBOARDING,
  },
  {
    id: 'vans-era',
    name: 'Vans Era',
    description: 'Vans Era - evolution của Authentic với padded collar. Canvas upper với foam padding, colorful options và waffle outsole. Skate-ready comfort.',
    price: 1290000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop',
    ],
    brand: Brand.VANS,
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    colors: ['black', 'white', 'blue', 'pink', 'yellow'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.SKATEBOARDING,
  },
  {
    id: 'vans-slip-on',
    name: 'Vans Slip-On',
    description: 'Vans Slip-On - laceless convenience với iconic checkerboard. Elastic side panels, leather insole và waffle outsole. Easy on, easy style.',
    price: 1090000,
    originalPrice: 1290000,
    images: [
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    ],
    brand: Brand.VANS,
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
    colors: ['black', 'white', 'checkerboard'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.SLIPPERS,
  },
  {
    id: 'vans-classic-slip-on',
    name: 'Vans Classic Slip-On',
    description: 'Vans Classic Slip-On với canvas upper và padded collar. Checkerboard pattern đặc trưng, vulcanized construction. Timeless easy-wear style.',
    price: 1190000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop',
    ],
    brand: Brand.VANS,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    colors: ['black', 'white', 'checkerboard'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.SLIPPERS,
  },
  {
    id: 'vans-ultra-range',
    name: 'Vans UltraRange EXO',
    description: 'Vans UltraRange EXO - modern street shoe với comfort tech. UltraCush foam midsole, rubber outsole với reverse waffle pattern. From skate to lifestyle.',
    price: 2290000,
    originalPrice: 2590000,
    images: [
      'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560769629-975ec94e7a86?w=800&h=800&fit=crop',
    ],
    brand: Brand.VANS,
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['black', 'grey', 'navy'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
  {
    id: 'vans-platform-sk8',
    name: 'Vans Platform Sk8-Hi',
    description: 'Vans Platform Sk8-Hi - Sk8-Hi với platform sole. 3D heel elevate, padded collar và chunky platform. Height boost không mất comfort.',
    price: 1990000,
    originalPrice: null,
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop',
    ],
    brand: Brand.VANS,
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    colors: ['black', 'white', 'black-white'],
    gender: Gender.UNISEX,
    shoeType: ShoeType.CASUAL,
  },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Tạo dữ liệu tồn kho theo size cho một sản phẩm
 * Mỗi size có stock ngẫu nhiên từ 0-15
 */
function generateSizeStock(productId: string, sizes: string[]) {
  return sizes.map((size) => ({
    productId,
    size,
    stock: Math.floor(Math.random() * 15) + 1,
  }))
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
  console.log('🚀 Bắt đầu seed dữ liệu website bán giày...')

  // ============================================
  // 1. TẠO USERS
  // ============================================
  console.log('📦 Tạo users...')

  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin ShoeStore',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const userPassword = await hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Khách Hàng Mẫu',
      password: userPassword,
      role: 'USER',
    },
  })

  console.log(`   ✅ Đã tạo: Admin (${admin.email}) và User (${user.email})`)

  // ============================================
  // 2. XÓA DỮ LIỆU CŨ VÀ TẠO SẢN PHẨM MỚI
  // ============================================
  console.log('🗑️ Xóa dữ liệu sản phẩm cũ...')
  
  // Xóa các bảng theo thứ tự để tránh conflict
  await prisma.sizeStock.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.review.deleteMany()
  await prisma.product.deleteMany()
  
  console.log('📦 Tạo sản phẩm giày mới...')

  // Tính tổng stock cho mỗi sản phẩm
  let totalStock = 0
  const sizeStocks: { productId: string; size: string; stock: number }[] = []

  for (const shoe of SHOE_PRODUCTS) {
    const sizeStockData = generateSizeStock(shoe.id, shoe.sizes)
    const productTotalStock = sizeStockData.reduce((sum, s) => sum + s.stock, 0)
    totalStock += productTotalStock

    // Tạo sản phẩm
    await prisma.product.upsert({
      where: { id: shoe.id },
      update: {},
      create: {
        id: shoe.id,
        name: shoe.name,
        description: shoe.description,
        price: shoe.price,
        originalPrice: shoe.originalPrice ?? undefined,
        images: shoe.images,
        brand: shoe.brand,
        sizes: shoe.sizes,
        colors: shoe.colors,
        gender: shoe.gender,
        shoeType: shoe.shoeType,
        stock: productTotalStock,
      },
    })

    // Lưu size stock để tạo sau
    sizeStocks.push(...sizeStockData)

    console.log(`   ✅ ${shoe.name} (${shoe.brand}) - Stock: ${productTotalStock}`)
  }

  // Tạo size stock
  console.log('📦 Tạo dữ liệu tồn kho theo size...')
  await prisma.sizeStock.createMany({
    data: sizeStocks,
    skipDuplicates: true,
  })

  console.log(`   ✅ Đã tạo ${sizeStocks.length} records tồn kho theo size`)
  console.log(`   📊 Tổng stock: ${totalStock} đôi giày`)

  // ============================================
  // 3. TẠO SAMPLE ORDERS
  // ============================================
  console.log('🛒 Tạo đơn hàng mẫu...')

  // Tạo address cho orders
  const address = await prisma.address.upsert({
    where: { id: 'sample-address' },
    update: {},
    create: {
      id: 'sample-address',
      userId: user.id,
      fullName: 'Nguyễn Văn Minh',
      email: 'minh.nguyen@example.com',
      street: '123 Đường Nguyễn Trãi',
      city: 'TP. Hồ Chí Minh',
      state: 'Hồ Chí Minh',
      postalCode: '700000',
      country: 'Việt Nam',
      isDefault: true,
    },
  })

  // Lấy tất cả sản phẩm
  const products = await prisma.product.findMany()
  const statuses = Object.values(OrderStatus)

  // Tạo 100 đơn hàng ngẫu nhiên
  for (let i = 0; i < 100; i++) {
    const randomDays = Math.floor(Math.random() * 30)
    const randomHours = Math.floor(Math.random() * 24)
    const randomMinutes = Math.floor(Math.random() * 60)
    const orderDate = addMinutes(
      addHours(subDays(new Date(), randomDays), randomHours),
      randomMinutes
    )

    // Chọn 1-3 sản phẩm ngẫu nhiên
    const numItems = Math.floor(Math.random() * 3) + 1
    const selectedProducts = [...products]
      .sort(() => 0.5 - Math.random())
      .slice(0, numItems)

    // Tạo order items với size và color đã chọn
    const orderItems = selectedProducts.map((product) => {
      const randomSize = product.sizes[Math.floor(Math.random() * product.sizes.length)]
      const randomColor = product.colors[Math.floor(Math.random() * product.colors.length)]
      const quantity = Math.floor(Math.random() * 2) + 1

      return {
        productId: product.id,
        selectedSize: randomSize,
        selectedColor: randomColor,
        quantity,
        price: product.price,
      }
    })

    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    await prisma.order.create({
      data: {
        userId: user.id,
        addressId: address.id,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        total,
        createdAt: orderDate,
        items: {
          create: orderItems,
        },
      },
    })
  }

  console.log(`   ✅ Đã tạo 100 đơn hàng mẫu`)

  // ============================================
  // 4. TẠO REVIEWS MẪU
  // ============================================
  console.log('⭐ Tạo đánh giá mẫu...')

  const sampleReviews = [
    { rating: 5, comment: 'Giày đẹp, chất lượng tốt, giao hàng nhanh! Siêu hài lòng!' },
    { rating: 5, comment: 'Đúng như hình, màu sắc chuẩn, giày ôm chân vừa vặn.' },
    { rating: 4, comment: 'Giày đẹp nhưng giao hơi lâu, shop nên cải thiện đóng gói.' },
    { rating: 5, comment: 'Lần đầu mua giày online mà rất ưng, sẽ ủng hộ tiếp!' },
    { rating: 4, comment: 'Chất lượng tốt, giá hợp lý. Khuyến mãi thêm thì perfect!' },
  ]

  // Thêm review cho một số sản phẩm nổi bật
  const featuredProducts = products.slice(0, 10)
  for (const product of featuredProducts) {
    const review = sampleReviews[Math.floor(Math.random() * sampleReviews.length)]
    
    try {
      await prisma.review.create({
        data: {
          userId: user.id,
          productId: product.id,
          rating: review.rating,
          comment: review.comment,
        },
      })
    } catch {
      // Ignore duplicate
    }
  }

  console.log(`   ✅ Đã tạo đánh giá cho ${featuredProducts.length} sản phẩm`)

  // ============================================
  // HOÀN THÀNH
  // ============================================
  console.log('')
  console.log('═══════════════════════════════════════════')
  console.log('🎉 SEED HOÀN TẤT!')
  console.log('═══════════════════════════════════════════')
  console.log(`📊 Thống kê:`)
  console.log(`   • Users: 2 (admin + user)`)
  console.log(`   • Sản phẩm giày: ${SHOE_PRODUCTS.length}`)
  console.log(`   • Size stocks: ${sizeStocks.length}`)
  console.log(`   • Đơn hàng: 100`)
  console.log(`   • Tổng stock: ${totalStock} đôi`)
  console.log('')
  console.log('🔐 Tài khoản đăng nhập:')
  console.log('   Admin: admin@example.com / admin123')
  console.log('   User: user@example.com / user123')
  console.log('═══════════════════════════════════════════')
}

// ============================================
// EXECUTE
// ============================================

main()
  .catch((e) => {
    console.error('❌ Lỗi seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
