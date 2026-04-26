# 🍕 PizzaPalace

Ứng dụng web đặt pizza/đồ ăn nhanh (frontend + logic ứng dụng) xây dựng với **Next.js App Router**, **TypeScript**, **Tailwind CSS** và bộ UI **shadcn/ui**. Repo này tập trung vào trải nghiệm đặt món: duyệt sản phẩm theo danh mục, tùy chọn biến thể (cỡ/đế), giỏ hàng, thanh toán và theo dõi trạng thái đơn hàng.

> Tech stack chính: Next.js (App Router) • React • TypeScript • TailwindCSS • shadcn/ui • Prisma (client)

## Mục lục

- [Demo](#demo)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt & chạy dự án](#cài-đặt--chạy-dự-án)
- [Biến môi trường](#biến-môi-trường)
- [Lệnh scripts](#lệnh-scripts)
- [Quy ước code](#quy-ước-code)
- [License](#license)

## Demo

- Local: http://localhost:3000
- Production: (chưa cấu hình / chưa cung cấp link)

## Tính năng

- Duyệt sản phẩm theo danh mục: `PIZZA`, `COMBO`, `CHICKEN`, `APPETIZER`, `DRINK`
- Sản phẩm có tag (ví dụ: best-seller / new / ...)
- Biến thể Pizza:
  - Nhiều size, nhiều loại đế
  - Quản lý theo danh sách `variants` (cỡ/đế)
- Đơn hàng:
  - Trạng thái: `PENDING` → `PREPARING` → `DELIVERING` → `COMPLETED` (hoặc `CANCELLED`)
  - Thanh toán: `CASH` hoặc `ONLINE`
- Kiến trúc theo component + hooks + context (dễ mở rộng)

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


## License

Mọi quyền thuộc về tác giả gốc.
