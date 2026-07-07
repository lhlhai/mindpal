# MindPal - Deployment Guide (Vercel + Supabase)

Hướng dẫn chi tiết để deploy MindPal lên Vercel (frontend + backend) và Supabase (database).

## Phần 1: Chuẩn Bị Supabase

### 1.1 Tạo Supabase Project

1. Truy cập [supabase.com](https://supabase.com)
2. Đăng nhập hoặc tạo tài khoản
3. Nhấn **"New Project"**
4. Điền thông tin:
   - **Project Name**: `mindpal`
   - **Database Password**: Tạo mật khẩu mạnh (lưu lại)
   - **Region**: Chọn gần nhất (ví dụ: Singapore)
5. Nhấn **"Create new project"** và chờ ~2 phút

### 1.2 Lấy Database Connection String

1. Vào **Project Settings** → **Database**
2. Tìm **Connection string** section
3. Chọn **URI** tab
4. Copy connection string (dạng: `postgresql://user:password@host/dbname`)
5. **Lưu lại** - sẽ dùng cho Vercel

### 1.3 Tạo Database Tables

MindPal sử dụng MySQL, nhưng Supabase cung cấp PostgreSQL. Bạn có 2 lựa chọn:

**Option A: Dùng Supabase PostgreSQL (Khuyến nghị)**
- Cập nhật `drizzle.config.ts` để sử dụng PostgreSQL
- Chạy migrations trên Supabase

**Option B: Dùng MySQL riêng (ví dụ: PlanetScale, AWS RDS)**
- Giữ nguyên MySQL
- Cấu hình DATABASE_URL trỏ tới MySQL server

**Hướng dẫn Option A (Supabase PostgreSQL):**

```bash
# 1. Cập nhật drizzle.config.ts
# Thay đổi từ mysql2 sang postgres

# 2. Chạy migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# 3. Xác nhận tables được tạo trong Supabase
```

### 1.4 Bật Row Level Security (RLS)

Trong Supabase SQL Editor, chạy:

```sql
-- Enable RLS trên tất cả tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Tạo policies cho users
CREATE POLICY "Users can view own data"
ON entries FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own entries"
ON entries FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own entries"
ON entries FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own entries"
ON entries FOR DELETE
USING (user_id = auth.uid());
```

## Phần 2: Chuẩn Bị Vercel

### 2.1 Chuẩn Bị Repository

1. Đảm bảo code đã push lên GitHub: `lhlhai/mindpal`
2. Xác nhận tất cả files đã được commit

### 2.2 Tạo Vercel Project

1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập hoặc tạo tài khoản
3. Nhấn **"Add New..."** → **"Project"**
4. Chọn **"Import Git Repository"**
5. Tìm và chọn `lhlhai/mindpal`
6. Nhấn **"Import"**

### 2.3 Cấu Hình Environment Variables

Trong Vercel Project Settings → **Environment Variables**, thêm:

```
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# JWT & Auth
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
VITE_APP_ID=your-manus-oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your-manus-open-id
OWNER_NAME=Your Name

# AI Integration
MINIMAX_API_KEY=your-minimax-api-key

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# App Info
VITE_APP_TITLE=MindPal
VITE_APP_LOGO=https://your-logo-url.png
```

**Lấy các giá trị:**

- **DATABASE_URL**: Từ Supabase (Phần 1.2)
- **JWT_SECRET**: Tạo random string 32+ ký tự
  ```bash
  openssl rand -base64 32
  ```
- **MINIMAX_API_KEY**: Từ MiniMax dashboard
- **Manus OAuth**: Từ Manus developer portal
- **OWNER_OPEN_ID**: Manus user ID của bạn

### 2.4 Cấu Hình Build Settings

1. **Framework Preset**: Chọn **"Other"**
2. **Build Command**: 
   ```
   pnpm build
   ```
3. **Output Directory**: 
   ```
   dist
   ```
4. **Install Command**: 
   ```
   pnpm install
   ```

### 2.5 Deploy

1. Nhấn **"Deploy"**
2. Chờ build hoàn thành (~3-5 phút)
3. Vercel sẽ cấp cho bạn URL (ví dụ: `mindpal-123.vercel.app`)

## Phần 3: Cấu Hình Manus OAuth

### 3.1 Thêm Redirect URI

1. Vào Manus Developer Portal
2. Tìm OAuth Application settings
3. Thêm **Redirect URI**:
   ```
   https://mindpal-123.vercel.app/api/oauth/callback
   ```
   (Thay `mindpal-123` bằng domain thực của bạn)

### 3.2 Cập nhật Environment Variables

Cập nhật `VITE_OAUTH_PORTAL_URL` nếu cần:
```
VITE_OAUTH_PORTAL_URL=https://your-manus-portal.com
```

## Phần 4: Cấu Hình Database Migrations

### 4.1 Chạy Migrations trên Production

Có 2 cách:

**Option A: Chạy local rồi push**
```bash
# Local
DATABASE_URL=postgresql://... pnpm drizzle-kit migrate

# Commit và push
git add .
git commit -m "Database migrations"
git push github main
```

**Option B: Chạy trên Vercel Deployment**

Thêm script vào `package.json`:
```json
{
  "scripts": {
    "db:migrate": "drizzle-kit migrate",
    "build": "pnpm db:migrate && vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
  }
}
```

## Phần 5: Kiểm Tra Deployment

### 5.1 Test Frontend

1. Truy cập `https://mindpal-123.vercel.app`
2. Kiểm tra:
   - [ ] Trang Dashboard hiển thị
   - [ ] Nút "Quick Add" hoạt động
   - [ ] Navigation menu hoạt động

### 5.2 Test Backend API

```bash
# Test health check
curl https://mindpal-123.vercel.app/api/trpc/system.health

# Test auth
curl https://mindpal-123.vercel.app/api/trpc/auth.me
```

### 5.3 Test Database Connection

1. Vào Supabase Dashboard
2. Kiểm tra **Database** → **Tables**
3. Xác nhận tất cả tables được tạo

### 5.4 Test OAuth Login

1. Nhấn "Login" trên trang
2. Đăng nhập bằng Manus account
3. Kiểm tra redirect về dashboard

## Phần 6: Cấu Hình Cron Jobs (Optional)

Nếu muốn tự động gửi reminders:

### 6.1 Tạo Vercel Cron Job

Tạo file `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/reminders/send",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 6.2 Tạo API Endpoint

Tạo file `server/_core/cron-reminders.ts`:

```typescript
import { Request, Response } from "express";
import { getDb } from "../db";
import { reminders, entries } from "../../drizzle/schema";
import { eq, and, lte } from "drizzle-orm";

export async function sendReminders(req: Request, res: Response) {
  // Verify Vercel cron secret
  if (req.headers["authorization"] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const db = await getDb();
  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    const now = new Date();
    
    // Lấy reminders chưa gửi và đã tới giờ
    const pendingReminders = await db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.sent, false),
          lte(reminders.remindAt, now)
        )
      );

    // Gửi notifications và update status
    for (const reminder of pendingReminders) {
      // TODO: Gửi notification (email, push, in-app)
      
      // Mark as sent
      await db
        .update(reminders)
        .set({ sent: true })
        .where(eq(reminders.id, reminder.id));
    }

    res.json({ 
      success: true, 
      sent: pendingReminders.length 
    });
  } catch (error) {
    console.error("Cron job error:", error);
    res.status(500).json({ error: "Failed to send reminders" });
  }
}
```

## Phần 7: Troubleshooting

### Build Error: "Cannot find module"

```bash
# Solution: Clear cache và rebuild
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Database Connection Error

```bash
# Kiểm tra DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### OAuth Redirect Error

1. Kiểm tra Redirect URI trong Manus settings
2. Xác nhận domain Vercel khớp
3. Xóa cookies và thử lại

### Reminders không gửi

1. Kiểm tra CRON_SECRET environment variable
2. Xem Vercel logs: **Deployments** → **Logs**
3. Xác nhận database connection hoạt động

## Phần 8: Monitoring & Maintenance

### 8.1 Vercel Monitoring

- **Deployments**: Xem lịch deploy
- **Logs**: Xem real-time logs
- **Analytics**: Xem traffic và performance

### 8.2 Supabase Monitoring

- **Database**: Xem storage usage
- **Auth**: Xem user activity
- **Logs**: Xem query logs

### 8.3 Backup Database

Supabase tự động backup hàng ngày. Để backup manual:

```bash
# Dump database
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## Phần 9: Custom Domain (Optional)

### 9.1 Thêm Custom Domain

1. Vercel Project Settings → **Domains**
2. Nhập domain (ví dụ: `mindpal.yoursite.com`)
3. Thêm DNS records theo hướng dẫn
4. Chờ DNS propagate (~24h)

### 9.2 SSL Certificate

Vercel tự động cấp SSL certificate miễn phí

## Hoàn Tất!

Bây giờ MindPal đã được deploy lên production. Bạn có thể:

- ✅ Truy cập ứng dụng qua Vercel URL
- ✅ Đăng nhập bằng Manus OAuth
- ✅ Tạo entries và sử dụng AI processing
- ✅ Xem dữ liệu trong Supabase dashboard
- ✅ Monitor logs và performance

Nếu có vấn đề, kiểm tra:
1. Vercel Logs
2. Supabase Logs
3. Browser Console (F12)
4. Environment Variables

Chúc bạn sử dụng MindPal vui vẻ! 🚀
