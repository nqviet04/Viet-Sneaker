# Viet Sneaker - Website Bán Giày Thương Mại Điện Tử

Một ứng dụng thương mại điện tử hiện đại để bán giày, được xây dựng với Next.js 15, Prisma, và PostgreSQL.

## Tính năng chính

### Khách hàng (Customer)
- **Trang chủ** với:
  - Banner carousel với promo banners
  - Featured Brands grid (6 thương hiệu với hover effects)
  - New Arrivals section
  - Best Sellers section
  - Trust badges (Free shipping, Secure payment, Easy returns)
- **Danh mục sản phẩm** với bộ lọc nâng cao (thương hiệu, giới tính, loại giày, size, màu sắc)
  - Brand checkboxes (multi-select)
  - Size filter button grid (multi-select)
  - Color swatches (multi-select)
  - Gender radio buttons
  - Shoe Type radio buttons
  - In Stock toggle
  - Price range slider
  - Active filters display với remove per filter
- **Trang chi tiết sản phẩm** với:
  - Breadcrumb navigation (Home > Brand > Product)
  - Image gallery với thumbnails
  - Size selector grid với stock check và tooltips
  - Color selector swatches
  - Brand/Gender/ShoeType badges
  - Validation bắt buộc chọn size trước khi add to cart
  - Reviews và related products carousel
- **Giỏ hàng** với quản lý số lượng theo size/color
- **Thanh toán** với tích hợp Stripe
- **Trang xác nhận đơn hàng**
- **Tài khoản người dùng**: lịch sử đơn hàng, quản lý địa chỉ, hồ sơ
- **Trang Brands** (/brands): Grid cards cho 6 thương hiệu
- **Trang Brand landing** (/brands/[brand]): Hero banner + product grid
- **Trang Size Guide** (/size-guide): Charts cho Women, Men, Kids

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

| Loại | Công cụ |
|------|---------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui (Radix UI primitives) |
| Charts | Recharts |
| Icons | Lucide React |
| State Management | Zustand |
| Validation | Zod, React Hook Form |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Authentication | NextAuth.js v5 (JWT) |
| Payments | Stripe |
| Email | Resend |
| File Upload | UploadThing |

## Cấu trúc dự án

```
viet-sneaker/
├── app/
│   ├── (admin)/              # Admin dashboard routes
│   │   ├── admin/
│   │   │   ├── page.tsx           # Dashboard overview
│   │   │   ├── products/          # Product management (CRUD)
│   │   │   ├── orders/            # Order management
│   │   │   ├── customers/         # User management
│   │   │   └── analytics/         # Reports & export
│   │   └── layout.tsx            # Admin layout with auth guard
│   ├── (home)/                # Customer-facing routes
│   │   ├── page.tsx             # Homepage
│   │   ├── products/            # Product listing & detail pages
│   │   ├── brands/              # Brands listing & brand landing pages
│   │   ├── size-guide/          # Size guide page
│   │   ├── cart/                # Shopping cart
│   │   ├── checkout/            # Checkout flow
│   │   └── dashboard/           # User account
│   └── api/                    # API routes
│       ├── admin/              # Admin API routes
│       ├── auth/               # NextAuth routes
│       └── products/           # Product API routes
├── components/
│   ├── admin/                  # Admin-specific components
│   ├── dashboard/              # User dashboard components
│   ├── home/                   # Homepage components
│   ├── products/                # Product display components
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── analytics.ts            # Analytics data functions
│   ├── prisma.ts               # Prisma client singleton
│   └── utils.ts                # Utility functions (cn, formatCurrency, etc.)
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                 # Seed data script
├── public/images/products/      # Product images (local)
└── .env                        # Environment variables
```

## Hướng dẫn cài đặt

### Yêu cầu hệ thống

- **Node.js** 18.17 hoặc cao hơn (khuyến nghị: Node.js 20 LTS)
- **PostgreSQL** 14 hoặc cao hơn (hoặc sử dụng Neon - PostgreSQL cloud)
- **npm** hoặc **yarn** hoặc **pnpm**

### Bước 1: Sao chép dự án và cài đặt dependencies

```bash
# Sao chép repository
git clone <repository-url>
cd viet-sneaker

# Cài đặt dependencies
npm install
```

### Bước 2: Cấu hình biến môi trường

Tạo file `.env` từ nội dung bên dưới. Các biến bắt buộc:

```env
# DATABASE - Bắt buộc
# Sử dụng Neon (cloud) hoặc PostgreSQL local
DATABASE_URL="postgresql://user:password@localhost:5432/viet_sneaker"

# NEXTAUTH - Bắt buộc
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-at-least-32-characters"

# Tạo NEXTAUTH_SECRET mới:
# openssl rand -base64 32
```

**Các biến tùy chọn** (có thể bỏ trống nếu chỉ dùng local):

```env
# STRIPE - Cho thanh toán
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# UPLOADTHING - Cho upload ảnh sản phẩm
UPLOADTHING_SECRET="sk_..."
UPLOADTHING_APP_ID="..."
UPLOADTHING_TOKEN='...'

# OAUTH - Cho đăng nhập Google/GitHub
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# RESEND - Cho gửi email
RESEND_API_KEY="re_..."

# OPENAI - Cho tìm kiếm sản phẩm bằng hình ảnh
OPENAI_API_KEY="sk-proj-..."

# CLIP API - Cho ML visual search service
CLIP_API_URL="http://localhost:8080"
```

### Bước 3: Thiết lập database

```bash
# Tạo database mới trên PostgreSQL (nếu dùng local)
# createdb viet_sneaker

# Chạy migrations để tạo các bảng
npx prisma migrate dev --name init

# Hoặc nếu chỉ muốn sync schema mà không tạo migration:
npx prisma db push
```

### Bước 4: Seed dữ liệu mẫu

```bash
npx prisma db seed
```

Lệnh này sẽ tạo:
- 2 tài khoản người dùng (admin + user mẫu)
- 48 sản phẩm giày từ 6 thương hiệu (Nike, Adidas, Puma, New Balance, Converse, Vans)
- Dữ liệu tồn kho theo size
- 100 đơn hàng mẫu
- Đánh giá mẫu

**Tài khoản mặc định:**

| Role | Email | Mật khẩu |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| User | user@example.com | user123 |

### Bước 5: Chạy dev server

```bash
npm run dev
```

Mở trình duyệt truy cập: **http://localhost:3000**

## Cấu trúc API

### Customer APIs
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Danh sách sản phẩm (bộ lọc: brand, gender, shoeType, size, inStock, price, sort, search) |
| GET | `/api/products/related` | Sản phẩm liên quan theo brand + shoeType |
| GET/POST | `/api/reviews` | Đánh giá sản phẩm |
| GET | `/api/filters` | Các tùy chọn lọc sản phẩm |

### Admin APIs
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET/POST | `/api/admin/products` | Danh sách / Tạo sản phẩm |
| GET/PUT/DELETE | `/api/admin/products/[id]` | Chi tiết / Cập nhật / Xóa sản phẩm |
| POST | `/api/admin/products/bulk` | Bulk actions |
| GET | `/api/admin/orders` | Danh sách đơn hàng |
| GET/PATCH | `/api/admin/orders/[id]` | Chi tiết / Cập nhật trạng thái đơn hàng |
| GET | `/api/admin/users` | Danh sách người dùng |
| PATCH/DELETE | `/api/admin/users/[id]` | Cập nhật quyền / Xóa người dùng |
| GET | `/api/admin/export` | Xuất báo cáo CSV |

### Product Filtering
```
GET /api/products?brands=NIKE,ADIDAS&gender=MEN&shoeType=RUNNING&sizes=40,42&colors=black,white&inStock=true&minPrice=1000000&maxPrice=5000000&sort=price_asc&search=air+max
```

| Tham số | Mô tả |
|---------|-------|
| `brands` | Lọc theo thương hiệu (multi-select, OR logic) |
| `gender` | Giới tính: MEN, WOMEN, UNISEX |
| `shoeType` | Loại giày: CASUAL, RUNNING, BASKETBALL, TRAINING, HIKING, SKATEBOARDING, SLIPPERS |
| `sizes` | Lọc theo size (multi-select, OR logic) |
| `colors` | Lọc theo màu sắc (multi-select, OR logic) |
| `inStock` | Chỉ hiển thị sản phẩm còn hàng |
| `minPrice` / `maxPrice` | Lọc theo khoảng giá |
| `sort` | Sắp xếp: price_asc, price_desc, name_asc, name_desc, stock_desc, created_desc |
| `search` | Tìm kiếm theo tên sản phẩm |

## Phát triển thêm

### Tải lên ảnh sản phẩm

Ảnh sản phẩm được lưu trong thư mục `public/images/products/`. Đặt tên theo định dạng:

```
{product-id}-{color}.{extension}
```

Ví dụ: `nike-air-max-90-white.png`, `vans-old-skool-black.png`

Sau đó cập nhật mảng `images` trong `prisma/seed.ts` và chạy lại seed.

### Tạo migration mới sau khi thay đổi schema

```bash
npx prisma migrate dev --name describe_your_change
```

### Reset database

```bash
# Xóa tất cả dữ liệu và chạy lại migrations
npx prisma migrate reset
```

### Build cho production

```bash
npm run build
npm run start
```

## Giải quyết vấn đề thường gặp

### Lỗi "Cannot find module" khi chạy seed

Đảm bảo đã cài đặt ts-node:

```bash
npm install -D ts-node
```

### Lỗi "relation does not exist" sau khi reset

Chạy lại migrations:

```bash
npx prisma migrate dev
npx prisma db seed
```

### Lỗi CORS khi sử dụng OAuth

Đảm bảo `NEXTAUTH_URL` trong `.env` chính xác với URL đang sử dụng.

### Không thể đăng nhập sau khi thay đổi NEXTAUTH_SECRET

Xóa các session hiện tại hoặc thay đổi SECRET sẽ yêu cầu đăng nhập lại.

## Phase tiếp theo

- [ ] Real-time notifications (WebSocket)
- [ ] Email system (Resend): xác nhận đơn hàng, cập nhật vận chuyển
- [ ] Tìm kiếm nâng cao (Elasticsearch/Algolia)
- [ ] Tối ưu hiệu năng (image optimization, caching)
- [ ] Testing (unit, integration, E2E)
- [ ] Production deployment (CI/CD, monitoring)
