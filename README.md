# Viet Sneaker - Website Bán Giày Thông Minh

Một ứng dụng thương mại điện tử hiện đại để bán giày, được xây dựng với Next.js 15, Prisma, và PostgreSQL.

## Tính năng chính

### Khách hàng (Customer)
- Trang chủ với:
  - Banner carousel với promo banners (Unsplash images)
  - Featured Brands grid (6 thương hiệu với hover effects)
  - New Arrivals section
  - Best Sellers section
  - Trust badges (Free shipping, Secure payment, Easy returns)
- Danh mục sản phẩm với bộ lọc nâng cao (thương hiệu, giới tính, loại giày, size, màu sắc)
  - Brand checkboxes (multi-select)
  - Size filter button grid (multi-select)
  - Color swatches (multi-select)
  - Gender radio buttons
  - Shoe Type radio buttons
  - In Stock toggle
  - Price range slider
  - Active filters display với remove per filter
- Trang chi tiết sản phẩm với:
  - Breadcrumb navigation (Home > Brand > Product)
  - Image gallery với thumbnails
  - Size selector grid với stock check và tooltips
  - Color selector swatches với 30+ colors
  - Brand/Gender/ShoeType badges
  - Size guide link
  - Validation bắt buộc chọn size trước khi add to cart
  - Reviews và related products carousel
- Giỏ hàng với quản lý số lượng theo size/color
- Thanh toán với tích hợp Stripe
- Trang xác nhận đơn hàng
- Tài khoản người dùng: lịch sử đơn hàng, quản lý địa chỉ, hồ sơ
- Trang Brands listing (/brands): Grid cards cho 6 thương hiệu
- Trang Brand landing (/brands/[brand]): Hero banner + product grid
- Trang Size Guide (/size-guide): Charts cho Women, Men, Kids

### Quản trị (Admin Dashboard)
- **Dashboard tổng quan**: Metrics cards, biểu đồ doanh thu, thống kê đơn hàng
- **Low Stock Alerts**: Cảnh báo sản phẩm sắp hết hàng
- **Top Products**: Sản phẩm bán chạy nhất theo thời gian
- **Customer Insights**: Phân tích khách hàng, biểu đồ acquisition
- **Quản lý sản phẩm**: CRUD đầy đủ, upload ảnh (UploadThing), bulk actions
- **Quản lý đơn hàng**: Xem chi tiết, cập nhật trạng thái, xử lý refund
- **Quản lý người dùng**: Danh sách khách hàng, phân quyền admin
- **Export Reports**: Xuất CSV cho orders, products, customers

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: Zustand
- **Validation**: Zod, React Hook Form
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v5 (JWT)
- **Payments**: Stripe
- **Email**: Resend
- **File Upload**: UploadThing

## Cấu trúc dự án

```
app/
├── (admin)/              # Admin dashboard routes
│   ├── admin/
│   │   ├── page.tsx           # Dashboard overview
│   │   ├── products/          # Product management
│   │   ├── orders/            # Order management
│   │   ├── customers/         # User management
│   │   └── analytics/         # Reports & export
│   └── layout.tsx            # Admin layout with auth
├── (home)/                # Customer-facing routes
│   ├── page.tsx             # Homepage (Banner, Brands, New Arrivals, Best Sellers)
│   ├── products/            # Product listing & detail
│   ├── brands/              # Brands listing & brand landing pages
│   ├── size-guide/          # Size guide page
│   ├── cart/                # Shopping cart
│   ├── checkout/             # Checkout flow
│   └── dashboard/            # User account
├── api/
│   ├── admin/                # Admin API routes
│   ├── auth/                 # NextAuth routes
│   └── products/             # Product API routes
components/
├── admin/                    # Admin-specific components
├── dashboard/                # User dashboard components
├── home/                     # Homepage components (FeaturedBrands, ProductSection)
├── products/                 # Product display components (SizeSelector, ColorSelector, BrandBadge, etc.)
└── ui/                       # shadcn/ui components
lib/
├── analytics.ts              # Analytics data functions
├── prisma.ts                 # Prisma client
└── utils.ts                  # Utility functions
```

## API Routes

### Customer APIs
- `GET /api/products` - List products with filters (brand, gender, shoeType, size, inStock, price, sort, search)
- `GET /api/products/related` - Related products by brand + shoeType
- `GET/POST /api/reviews` - Product reviews
- `GET /api/filters` - Available filter options (brands, genders, shoeTypes, sizes, colors)

### Admin APIs
- `GET/POST /api/admin/products` - List/create products
- `GET/PUT/DELETE /api/admin/products/[id]` - Product CRUD
- `POST /api/admin/products/bulk` - Bulk actions
- `GET /api/admin/orders` - List orders
- `GET/PATCH /api/admin/orders/[id]` - Order detail/status
- `GET /api/admin/users` - List users
- `PATCH/DELETE /api/admin/users/[id]` - User role/delete
- `GET /api/admin/export` - CSV export

### Legacy (Backward Compatible)
- `GET /api/categories` - Returns combined brand/gender/shoeType as categories

## Product Filtering

Products can be filtered using query parameters (multi-select params are comma-separated):
- `?brands=NIKE,ADIDAS` - Filter by brand (multi-select, OR)
- `?gender=MEN` - Filter by gender (MEN, WOMEN, UNISEX)
- `?shoeType=RUNNING` - Filter by shoe type
- `?sizes=40,42` - Filter by size (multi-select, OR)
- `?colors=black,white` - Filter by color (multi-select, OR)
- `?inStock=true` - Show only in-stock products
- `?minPrice=50&maxPrice=200` - Price range
- `?sort=price_asc` - Sort order (price_asc, price_desc, name_asc, name_desc, stock_desc, created_desc)

## Môi trường phát triển

```bash
# Cài đặt dependencies
npm install

# Cấu hình database (PostgreSQL)
# Cập nhật DATABASE_URL trong .env

# Chạy migrations
npx prisma migrate dev

# Seed database (tùy chọn)
npx prisma db seed

# Chạy dev server
npm run dev
```

## Phase tiếp theo

- [ ] Real-time notifications (WebSocket)
- [ ] Email system (Resend): order confirmations, shipping updates
- [ ] Search optimization (Elasticsearch/Algolia)
- [ ] Performance optimization (image optimization, caching)
- [ ] Testing (unit, integration, E2E)
- [ ] Production deployment (CI/CD, monitoring)
