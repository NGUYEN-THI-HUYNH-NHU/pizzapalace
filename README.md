# PizzaPalace 🍕

Ứng dụng web đặt pizza/đồ ăn nhanh (frontend + logic ứng dụng) xây dựng với **Next.js App Router**, **TypeScript**, **Tailwind CSS** và bộ UI **shadcn/ui**. Repo này tập trung vào trải nghiệm đặt món: duyệt sản phẩm theo danh mục, tùy chọn biến thể (size/đế), giỏ hàng, thanh toán và theo dõi trạng thái đơn hàng.

> Tech stack chính: Next.js (App Router) • React • TypeScript • TailwindCSS • shadcn/ui • Prisma (client)

## Mục lục

- [Demo](#demo)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt & chạy dự án](#cài-đặt--chạy-dự-án)
- [Biến môi trường](#biến-môi-trường)
- [Lệnh scripts](#lệnh-scripts)
- [Quy ước code](#quy-ước-code)
- [Một số kiểu dữ liệu chính](#một-số-kiểu-dữ-liệu-chính)
- [Triển khai](#triển-khai)
- [Đóng góp](#đóng-góp)
- [License](#license)

## Demo

- Local: http://localhost:3000
- Production: (chưa cấu hình / chưa cung cấp link)

## Tính năng

- Duyệt sản phẩm theo danh mục: `PIZZA`, `COMBO`, `CHICKEN`, `APPETIZER`, `DRINK`
- Sản phẩm có tag (ví dụ: best-seller / new / highlight)
- Biến thể Pizza:
  - Nhiều size, nhiều loại đế
  - Quản lý theo danh sách `variants` (SKU/giá/tình trạng)
- Đơn hàng:
  - Trạng thái: `PENDING` → `PREPARING` → `DELIVERING` → `COMPLETED` (hoặc `CANCELLED`)
  - Thanh toán: `CASH` hoặc `ONLINE`
- Kiến trúc theo component + hooks + context (dễ mở rộng)

> Ghi chú: README này mô tả theo cấu trúc và type hiện có trong repo. Một số tính năng phụ thuộc vào phần implementation bên trong `app/`, `lib/`, `contexts/`.

## Công nghệ sử dụng

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** + PostCSS
- **shadcn/ui** (Radix-based components)
- **Prisma** (`@prisma/client`, `prisma`) — dùng để làm việc với database (nếu dự án có backend/API route)
- Form & validation: `react-hook-form`, `zod`, `@hookform/resolvers`
- HTTP client: `axios`
- Map: `leaflet`, `react-leaflet`
- Auth/JWT utilities: `jose`
- Realtime (client): `socket.io-client`

## Cấu trúc thư mục

Cấu trúc ở root (theo repo hiện tại):

- `app/` — Next.js App Router: pages/layouts/routes
- `components/` — các UI component (bao gồm `components/ui` theo shadcn)
- `contexts/` — React context (ví dụ: auth/cart/theme...)
- `hooks/` — custom hooks
- `lib/` — tiện ích dùng chung (helpers, constants, api client, utils...)
- `providers/` — các provider bọc app (theme, query client... nếu có)
- `public/` — static assets
- `actions/` — server actions hoặc action handlers (tùy cách tổ chức)

Các file cấu hình đáng chú ý:

- `next.config.ts` — cấu hình Next.js
- `tsconfig.json` — cấu hình TypeScript (đã bật strict)
- `eslint.config.mjs` — ESLint
- `postcss.config.mjs` — PostCSS/Tailwind
- `components.json` — cấu hình shadcn/ui

## Yêu cầu hệ thống

- Node.js (khuyến nghị bản LTS mới, ví dụ >= 18; tốt nhất theo môi trường bạn dùng)
- npm (repo có `package-lock.json`)

## Cài đặt & chạy dự án

1) Clone repo

```bash
git clone https://github.com/NGUYEN-THI-HUYNH-NHU/pizzapalace.git
cd pizzapalace
```

2) Cài dependencies

```bash
npm install
```

3) Chạy môi trường dev

```bash
npm run dev
```

Mở http://localhost:3000

4) Build & chạy production

```bash
npm run build
npm run start
```

## Biến môi trường

Repo chưa cung cấp `.env.example` ở root (tại thời điểm viết README). Nếu bạn có dùng Prisma/API/Auth/Socket… thường sẽ cần các biến như:

- `DATABASE_URL` (Prisma)
- `JWT_SECRET` hoặc tương đương (nếu có auth)
- `NEXT_PUBLIC_*` cho các biến cần dùng phía client

Khuyến nghị:

- Tạo file `.env.local`
- Nếu bạn muốn chuẩn hóa onboarding, hãy thêm `.env.example`

## Lệnh scripts

Các lệnh trong `package.json`:

- `npm run dev` — chạy dev server
- `npm run build` — build
- `npm run start` — chạy bản build
- `npm run lint` — chạy ESLint

## Quy ước code

- TypeScript `strict: true`
- Alias import: `@/*` trỏ về root (`tsconfig.json`)
- UI components theo shadcn/ui (xem `components.json`), alias:
  - `@/components`
  - `@/components/ui`
  - `@/lib/utils`
  - `@/hooks`

## Một số kiểu dữ liệu chính

Các type/domain model nằm tại `type.ts`:

- `Role`: `CUSTOMER | ADMIN | STAFF`
- `Category`: `PIZZA | COMBO | CHICKEN | APPETIZER | DRINK`
- `OrderStatus`: `PENDING | PREPARING | DELIVERING | COMPLETED | CANCELLED`
- `PaymentMethod`: `CASH | ONLINE`

Các interface chính:

- `User`
- `Product` (có thể có `pizzaDetails`, `drinkDetails`, `comboDetails`)
- `Order`, `OrderItem`

## Triển khai

Gợi ý triển khai nhanh với Vercel:

- Import repo vào Vercel
- Build command: `npm run build`
- Output: theo mặc định của Next.js
- Thêm biến môi trường nếu có (Database/Auth…)

## Đóng góp

1. Fork repo
2. Tạo nhánh mới: `git checkout -b feature/ten-tinh-nang`
3. Commit: `git commit -m "Add: ..."`
4. Push: `git push origin feature/ten-tinh-nang`
5. Mở Pull Request

## License

Repo chưa khai báo license. Nếu bạn muốn open-source rõ ràng, hãy thêm file `LICENSE` (MIT/Apache-2.0...).
