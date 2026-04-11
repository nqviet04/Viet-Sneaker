/**
 * ============================================
 * HẰNG SỐ CHO WEBSITE BÁN GIÀY
 * ============================================
 * File này chứa tất cả các hằng số cố định cho:
 * - Thương hiệu (Brands)
 * - Size giày (Sizes)
 * - Màu sắc (Colors)
 * - Giới tính (Genders)
 * - Loại giày (Shoe Types)
 * ============================================
 */

// ============================================
// ENUMS - Tương ứng với PostgreSQL enums
// ============================================

/**
 * Các thương hiệu giày được hỗ trợ
 */
export enum Brand {
  NIKE = 'NIKE',
  ADIDAS = 'ADIDAS',
  PUMA = 'PUMA',
  NEW_BALANCE = 'NEW_BALANCE',
  CONVERSE = 'CONVERSE',
  VANS = 'VANS',
}

/**
 * Giới tính mục tiêu của sản phẩm
 */
export enum Gender {
  MEN = 'MEN',
  WOMEN = 'WOMEN',
  UNISEX = 'UNISEX',
}

/**
 * Loại giày theo mục đích sử dụng
 */
export enum ShoeType {
  RUNNING = 'RUNNING',
  CASUAL = 'CASUAL',
  BOOTS = 'BOOTS',
  FORMAL = 'FORMAL',
  SLIPPERS = 'SLIPPERS',
  BASKETBALL = 'BASKETBALL',
  SKATEBOARDING = 'SKATEBOARDING',
  TRAINING = 'TRAINING',
  HIKING = 'HIKING',
}

// ============================================
// CONSTANTS ARRAYS - Dữ liệu hiển thị
// ============================================

/**
 * Thông tin chi tiết của các thương hiệu
 * - id: Giá trị enum
 * - name: Tên hiển thị
 * - slug: URL-friendly identifier
 * - logo: Đường dẫn logo
 * - description: Mô tả ngắn
 * - origin: Quốc gia xuất xứ
 */
export const BRANDS = [
  {
    id: Brand.NIKE,
    name: 'Nike',
    slug: 'nike',
    logo: '/images/brands/nike.png',
    description: 'Just Do It - Thương hiệu giày thể thao hàng đầu thế giới',
    origin: 'Hoa Kỳ',
    founded: 1964,
    popularTypes: [ShoeType.RUNNING, ShoeType.BASKETBALL, ShoeType.CASUAL],
  },
  {
    id: Brand.ADIDAS,
    name: 'Adidas',
    slug: 'adidas',
    logo: '/images/brands/adidas.png',
    description: 'Impossible is Nothing - Thương hiệu giày thể thao Đức',
    origin: 'Đức',
    founded: 1949,
    popularTypes: [ShoeType.RUNNING, ShoeType.CASUAL, ShoeType.FORMAL],
  },
  {
    id: Brand.PUMA,
    name: 'Puma',
    slug: 'puma',
    logo: '/images/brands/puma.png',
    description: 'Forever Faster - Thương hiệu giày thể thao nhanh nhất',
    origin: 'Đức',
    founded: 1948,
    popularTypes: [ShoeType.RUNNING, ShoeType.CASUAL, ShoeType.FOOTBALL],
  },
  {
    id: Brand.NEW_BALANCE,
    name: 'New Balance',
    slug: 'new-balance',
    logo: '/images/brands/new-balance.png',
    description: 'Fearlessly Independent Since 1906 - Thương hiệu giày Mỹ',
    origin: 'Hoa Kỳ',
    founded: 1906,
    popularTypes: [ShoeType.RUNNING, ShoeType.CASUAL, ShoeType.BOOTS],
  },
  {
    id: Brand.CONVERSE,
    name: 'Converse',
    slug: 'converse',
    logo: '/images/brands/converse.png',
    description: "You're The Boss - Biểu tượng văn hóa streetwear",
    origin: 'Hoa Kỳ',
    founded: 1908,
    popularTypes: [ShoeType.CASUAL, ShoeType.SKATEBOARDING],
  },
  {
    id: Brand.VANS,
    name: 'Vans',
    slug: 'vans',
    logo: '/images/brands/vans.png',
    description: 'Off The Wall - Thương hiệu giày skateboarding huyền thoại',
    origin: 'Hoa Kỳ',
    founded: 1966,
    popularTypes: [ShoeType.SKATEBOARDING, ShoeType.CASUAL],
  },
] as const

/**
 * Bảng size giày theo hệ US (Việt Nam thường dùng)
 * Mỗi size gồm: US, EU (Châu Âu), CM (Centimet)
 */
export const SHOE_SIZES = [
  { us: '36', eu: '36', cm: '23' },
  { us: '37', eu: '37', cm: '23.5' },
  { us: '38', eu: '38', cm: '24' },
  { us: '39', eu: '39', cm: '24.5' },
  { us: '40', eu: '40', cm: '25' },
  { us: '41', eu: '41', cm: '25.5' },
  { us: '42', eu: '42', cm: '26' },
  { us: '43', eu: '43', cm: '26.5' },
  { us: '44', eu: '44', cm: '27' },
  { us: '45', eu: '45', cm: '27.5' },
  { us: '46', eu: '46', cm: '28' },
] as const

/**
 * Danh sách các màu sắc phổ biến cho giày
 * - id: Giá trị lưu trữ
 * - name: Tên tiếng Việt
 * - hex: Mã màu hex cho UI
 */
export const COLORS = [
  { id: 'black', name: 'Đen', hex: '#000000' },
  { id: 'white', name: 'Trắng', hex: '#FFFFFF' },
  { id: 'grey', name: 'Xám', hex: '#808080' },
  { id: 'red', name: 'Đỏ', hex: '#DC2626' },
  { id: 'blue', name: 'Xanh Dương', hex: '#2563EB' },
  { id: 'green', name: 'Xanh Lá', hex: '#16A34A' },
  { id: 'yellow', name: 'Vàng', hex: '#EAB308' },
  { id: 'orange', name: 'Cam', hex: '#EA580C' },
  { id: 'pink', name: 'Hồng', hex: '#EC4899' },
  { id: 'purple', name: 'Tím', hex: '#9333EA' },
  { id: 'brown', name: 'Nâu', hex: '#92400E' },
  { id: 'navy', name: 'Navy', hex: '#1E3A5F' },
  { id: 'beige', name: 'Beige', hex: '#F5F5DC' },
  { id: 'multicolor', name: 'Nhiều Màu', hex: 'linear-gradient(135deg, #f56565, #48bb78, #4299e1)' },
] as const

/**
 * Thông tin giới tính
 */
export const GENDERS = [
  {
    id: Gender.MEN,
    name: 'Nam',
    slug: 'nam',
    description: 'Giày thiết kế cho nam giới',
    icon: '👞',
    recommendedSizes: ['39', '40', '41', '42', '43', '44', '45'],
  },
  {
    id: Gender.WOMEN,
    name: 'Nữ',
    slug: 'nu',
    description: 'Giày thiết kế cho nữ giới',
    icon: '👠',
    recommendedSizes: ['36', '37', '38', '39', '40'],
  },
  {
    id: Gender.UNISEX,
    name: 'Unisex',
    slug: 'unisex',
    description: 'Giày phù hợp cho cả nam và nữ',
    icon: '👟',
    recommendedSizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
  },
] as const

/**
 * Thông tin chi tiết các loại giày
 */
export const SHOE_TYPES = [
  {
    id: ShoeType.RUNNING,
    name: 'Running',
    nameVi: 'Chạy Bộ',
    slug: 'chay-bo',
    description: 'Giày chuyên dụng cho chạy bộ và jogging',
    features: ['Đệm êm', 'Nhẹ', 'Thoáng khí'],
    suitableFor: ['Tập gym', 'Chạy bộ', 'Cardio'],
  },
  {
    id: ShoeType.CASUAL,
    name: 'Casual',
    nameVi: 'Thường Ngày',
    slug: 'thuong-ngay',
    description: 'Giày phong cách cho mặc hàng ngày',
    features: ['Thoải mái', 'Dễ phối đồ', 'Đa dụng'],
    suitableFor: ['Đi chơi', 'Đi làm', 'Đi học'],
  },
  {
    id: ShoeType.BOOTS,
    name: 'Boots',
    nameVi: 'Boots',
    slug: 'boots',
    description: 'Giày boots cao cổ cho phong cách mạnh mẽ',
    features: ['Che mắt cá', 'Bảo vệ', 'Chắc chắn'],
    suitableFor: ['Mùa đông', 'Phong cách', 'Lao động'],
  },
  {
    id: ShoeType.FORMAL,
    name: 'Formal',
    nameVi: 'Công Sở',
    slug: 'cong-so',
    description: 'Giày lịch sự cho dịp trang trọng',
    features: ['Lịch lãm', 'Sang trọng', 'Chuyên nghiệp'],
    suitableFor: ['Công sở', 'Sự kiện', 'Tiệc'],
  },
  {
    id: ShoeType.SLIPPERS,
    name: 'Slippers',
    nameVi: 'Giày Lười',
    slug: 'giay-luoi',
    description: 'Giày dễ mang, thoải mái nhà',
    features: ['Dễ mang', 'Nhẹ', 'Thoáng'],
    suitableFor: ['Ở nhà', 'Nghỉ ngơi', 'Đi bộ ngắn'],
  },
  {
    id: ShoeType.BASKETBALL,
    name: 'Basketball',
    nameVi: 'Bóng Rổ',
    slug: 'bong-ro',
    description: 'Giày chuyên cho bóng rổ với độ bám tốt',
    features: ['Hỗ trợ mắt cá', 'Đế cao su bám', 'Nhảy cao'],
    suitableFor: ['Chơi bóng rổ', 'Thể thao', 'Tập gym'],
  },
  {
    id: ShoeType.SKATEBOARDING,
    name: 'Skateboarding',
    nameVi: 'Trượt Ván',
    slug: 'truot-van',
    description: 'Giày chuyên cho skateboarding',
    features: ['Đế phẳng', 'Bền bỉ', 'Vulcanized'],
    suitableFor: ['Skateboard', 'Bi-a', 'LeParkour'],
  },
  {
    id: ShoeType.TRAINING,
    name: 'Training',
    nameVi: 'Tập Luyện',
    slug: 'tap-luyen',
    description: 'Giày đa năng cho tập gym và fitness',
    features: ['Linh hoạt', 'Hỗ trợ đa hướng', 'Ổn định'],
    suitableFor: ['Gym', 'Fitness', 'Yoga'],
  },
  {
    id: ShoeType.HIKING,
    name: 'Hiking',
    nameVi: 'Leo Núi',
    slug: 'leo-nui',
    description: 'Giày chuyên cho đi bộ đường dài và leo núi',
    features: ['Chống nước', 'Đế bám tốt', 'Bảo vệ mắt cá'],
    suitableFor: ['Du lịch', 'Leo núi', 'Đi rừng'],
  },
] as const

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Lấy thông tin brand từ id
 */
export function getBrandById(id: Brand) {
  return BRANDS.find((b) => b.id === id)
}

/**
 * Lấy thông tin brand từ slug
 */
export function getBrandBySlug(slug: string) {
  return BRANDS.find((b) => b.slug === slug)
}

/**
 * Lấy thông tin shoe type từ id
 */
export function getShoeTypeById(id: ShoeType) {
  return SHOE_TYPES.find((s) => s.id === id)
}

/**
 * Lấy thông tin color từ id
 */
export function getColorById(id: string) {
  return COLORS.find((c) => c.id === id)
}

/**
 * Lấy thông tin gender từ id
 */
export function getGenderById(id: Gender) {
  return GENDERS.find((g) => g.id === id)
}

/**
 * Lấy danh sách size theo giới tính
 */
export function getSizesByGender(gender: Gender): typeof SHOE_SIZES {
  const genderInfo = getGenderById(gender)
  if (!genderInfo) return SHOE_SIZES

  return SHOE_SIZES.filter((size) =>
    genderInfo.recommendedSizes.includes(size.us)
  )
}

/**
 * Chuyển đổi US size sang format hiển thị
 */
export function formatSize(size: string): string {
  const found = SHOE_SIZES.find((s) => s.us === size)
  if (found) {
    return `US ${found.us} / EU ${found.eu} / ${found.cm}cm`
  }
  return `US ${size}`
}

/**
 * Lấy danh sách tất cả brands dưới dạng options cho UI
 */
export function getBrandOptions() {
  return BRANDS.map((b) => ({
    value: b.id,
    label: b.name,
    slug: b.slug,
  }))
}

/**
 * Lấy danh sách tất cả colors dưới dạng options cho UI
 */
export function getColorOptions() {
  return COLORS.map((c) => ({
    value: c.id,
    label: c.name,
    hex: c.hex,
  }))
}

/**
 * Lấy danh sách tất cả genders dưới dạng options cho UI
 */
export function getGenderOptions() {
  return GENDERS.map((g) => ({
    value: g.id,
    label: g.name,
    icon: g.icon,
  }))
}

/**
 * Lấy danh sách tất cả shoe types dưới dạng options cho UI
 */
export function getShoeTypeOptions() {
  return SHOE_TYPES.map((s) => ({
    value: s.id,
    label: s.nameVi,
    name: s.name,
  }))
}

// ============================================
// FILTER OPTIONS
// ============================================

/**
 * Các tùy chọn sắp xếp sản phẩm
 */
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới Nhất', sort: { createdAt: 'desc' } },
  { value: 'price_asc', label: 'Giá: Thấp đến Cao', sort: { price: 'asc' } },
  { value: 'price_desc', label: 'Giá: Cao đến Thấp', sort: { price: 'desc' } },
  { value: 'name_asc', label: 'Tên: A-Z', sort: { name: 'asc' } },
  { value: 'name_desc', label: 'Tên: Z-A', sort: { name: 'desc' } },
  { value: 'popular', label: 'Phổ Biến Nhất', sort: { createdAt: 'desc' } },
] as const

/**
 * Các khoảng giá phổ biến
 */
export const PRICE_RANGES = [
  { value: 'all', label: 'Tất cả giá', min: 0, max: 999999 },
  { value: 'under500', label: 'Dưới 500K', min: 0, max: 500000 },
  { value: '500to1m', label: '500K - 1 Triệu', min: 500000, max: 1000000 },
  { value: '1mto2m', label: '1 - 2 Triệu', min: 1000000, max: 2000000 },
  { value: '2mto5m', label: '2 - 5 Triệu', min: 2000000, max: 5000000 },
  { value: 'over5m', label: 'Trên 5 Triệu', min: 5000000, max: 999999 },
] as const

/**
 * Ngưỡng cảnh báo stock thấp
 */
export const LOW_STOCK_THRESHOLD = 5

/**
 * Số sản phẩm mỗi trang
 */
export const ITEMS_PER_PAGE = 12
