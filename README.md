# Dự án: NOVAWAVE

> Phiên bản: 1.0 — Ngôn ngữ: Tiếng Việt

---

# 📋Tổng quan ngắn

NovaWave là backend service xây bằng NestJS (TypeScript), dùng MongoDB (Mongoose) và Redis/BullMQ cho queue. Tài liệu này hướng dẫn cách chạy, cấu hình môi trường, các nguyên tắc kiến trúc, test, logging, bảo mật và best practice cho dự án.

---

# Các lệnh thực thi (Quick start)

- Cài dependencies

```bash
# cài node modules
npm install
# hoặc nếu dùng yarn
# yarn install
```

- Biến môi trường (ví dụ `.env` tối thiểu)

```text
NODE_ENV=dev
PORT=3000
MONGO_URI=mongodb://localhost:27017/novawave
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
LOGTAIL_TOKEN=your_logtail_token # chỉ set trong production
LOG_FILE_PATH=logs/app.log
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
PAYOS_API_KEY=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
JWT_ACCESS_TOKEN_SECRET=xxx
```

- Chạy ứng dụng (dev / prod)

```bash
# dev (hot reload)
npm run start:dev

# build + run (production)
npm run build
npm run start:prod
```

- Chạy test

```bash
npm run test       # unit tests
npm run test:e2e   # e2e tests
```

- Lint & Format

```bash
npm run lint
npm run format
```

---

# Ví dụ mã nguồn kèm giải thích

Ví dụ: gom notifications theo `receiverId` rồi gửi bulk cho mỗi user (giảm spam socket)

```typescript
// modules/worker/notification.consumer.ts (snippet)
const grouped = notifications.reduce(
  (map, n) => {
    const id = String(n.receiverId ?? n.receiver?.id ?? n.userId ?? '');
    if (!id) return map;
    if (!map[id]) map[id] = [];
    map[id].push(n);
    return map;
  },
  {} as Record<string, Notification[]>
);

for (const [receiverId, notifs] of Object.entries(grouped)) {
  // dùng gateway.bulkEmit nếu có, fallback gửi từng noti
  await gateway.sendNotificationsToUser(receiverId, notifs);
}
```

Giải thích ngắn:

- Gom theo `receiverId` để chỉ emit 1 lần cho mỗi user, giảm số lần tương tác với socket server.
- Nếu user có nhiều socket, gateway sẽ emit tới tất cả socket của user.
- Giúp giảm overhead và giảm nguy cơ spam.

Ví dụ: xử lý race condition với Redis + Lua

```typescript
// reserveStock: LUA trên Redis để đảm bảo atomic check + DECRBY + set PEXPIRE
const ok = await redisService.reserveStock(
  [
    { productId: 'p1', quantity: 2 },
    { productId: 'p2', quantity: 1 }
  ],
  15 * 60 * 1000
);
if (!ok) {
  // không đủ stock -> xử lý rollback/notify
}
```

---

# Ngăn xếp công nghệ (Stack)

- Backend: NestJS (TypeScript)
- Database: MongoDB (Mongoose)
- Queue: BullMQ + Redis
- File/Media: Cloudinary
- Emails: Nodemailer (SMTP provider)
- Payment: PayOS
- Logging/Monitoring: BetterStack (Logtail) — chỉ gửi khi `NODE_ENV=production`; local file logs cho info
- Auth: Google OAuth2 + JWT (RBAC)
- CI: GitHub Actions (tùy repo)

---

# 🔎Sáu lĩnh vực cốt lõi (Principles)

- Lệnh thực thi liên quan (install, start, worker, test, lint) phải có ở phần đầu tài liệu (rule.md nếu cần).
- Unit test: Jest, coverage >= 80% cho core modules (auth, payments, queue handlers).
- E2E: dùng mongodb-memory-server cho CI, kiểm thử flows chính (đăng ký, mua hàng, webhook).
- Test queue handler: mock redis/bull, hoặc dùng docker-compose test instance.
- Code style: TypeScript strict, ESLint + Prettier, pre-commit hook (husky + lint-staged).
- Git workflow: main (production-ready), develop (staging), feature branches `feature/<ticket>-short-desc`.
- Commit message: Conventional Commits.
- Merge: squash and merge, ít nhất 1 reviewer.

---

# 🏗️Cấu trúc dự án (chi tiết)

```
.
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ tsconfig.build.json
├─ nest-cli.json
├─ .env
├─ .husky/
├─ .prettierrc
├─ .prettierignore
├─ src/
│  ├─ main.ts
│  ├─ app.module.ts
│  ├─ app.controller.ts
│  ├─ app.service.ts
│  ├─ common/        # filters, pipes, interceptors, guards
│  ├─ configs/       # configuration modules and env schemas
│  ├─ cores/         # core helpers, base classes
│  ├─ loggers/       # winston/logtail setup
│  ├─ modules/       # feature modules
│  │  ├─ advertisement/
│  │  ├─ album/
│  │  ├─ artist/
│  │  ├─ artist-verification/
│  │  ├─ auth/
│  │  ├─ cart/
│  │  ├─ cloudinary/
│  │  ├─ comment/
│  │  ├─ dashboard/
│  │  ├─ email/
│  │  ├─ follow/
│  │  ├─ genres/
│  │  ├─ like/
│  │  ├─ media/
│  │  ├─ notification/
│  │  ├─ payments/
│  │  ├─ permission/
│  │  ├─ plan/
│  │  ├─ player/
│  │  ├─ playlist/
│  │  ├─ product/
│  │  ├─ purchase-history/
│  │  ├─ queue/
│  │  ├─ redis/
│  │  ├─ reply-comment/
│  │  ├─ report/
│  │  ├─ revenue/
│  │  ├─ role/
│  │  ├─ search/
│  │  ├─ songs/
│  │  ├─ subscription/
│  │  ├─ task/
│  │  ├─ user/
│  │  └─ worker/
│  ├─ shared/        # shared services/utilities used across modules
│  └─ types/         # common TS types/interfaces
├─ test/             # unit & e2e tests
└─ logs/             # local log files

Notes:
- Mỗi module trong `src/modules/*` thường chứa: controllers, services, dtos, schemas, repositories.
```

---

# 📌Quy tắc viết mã (Code style & Best practices)

- TypeScript strict mode: noImplicitAny, strictNullChecks bật.
- Tránh `any`; nếu dùng phải giải thích lý do.
- Các handler/job phải idempotent và có retry/backoff hợp lý.
- Kiểm tra input bằng `class-validator` + `ValidationPipe` toàn cục.
- Không lộ thông tin nhạy cảm hoặc stack traces ở production.
- Viết unit tests cho logic phức tạp (payments, queue handling, locking).

---

# Global Exception Handling (mẫu & hành vi)

Dự án dùng `GlobalExceptionFilter` (`src/common/exceptions/global-exception.filter.ts`) để chuẩn hoá response lỗi.

Hành vi chính:

- Nếu lỗi là `HttpException`: lấy status và message/response từ exception; trích `details` nếu có.
- Nếu lỗi là `Error` hoặc unknown: trả `500 Internal server error`. Trong `dev` có thể trả thêm `details` để debug.
- Luôn log lỗi qua Logger theo format: `${method} ${url} - ${status} - ${messageKey}` và kèm stack trace nếu có.
- Trả về payload chuẩn theo `ApiResponse<T>`:

```json
{
  "success": false,
  "message": "<messageKey>",
  "data": null
}
```

Một số messageKey mapping gợi ý:

- 400 -> "Bad request"
- 401 -> "Unauthorized"
- 403 -> "Forbidden"
- 404 -> "Resource not found"
- 409 -> "Conflict occurred"
- 422 -> "Validation error"
- 429 -> "Too many requests"
- 503 -> "Service unavailable"
- 500 -> "Internal server error"

Khuyến nghị:

- Wrap lỗi từ bên thứ ba (ví dụ payment/webhook) thành `HttpException` có status/chi tiết rõ ràng để filter map chính xác.
- Không hiển thị stack trace ở production.
- Log đầy đủ method + url + status + correlation id nếu có.

---

# Các chức năng chính

## 1. Auth & RBAC

- Google OAuth2 để login + local JWT để cấp access token.
- JWT ký bằng secret từ env; refresh token có thể lưu hashed để hỗ trợ revoke.
- Roles, Permissions lưu trong DB; middleware/guard kiểm tra quyền trước khi thực hiện action.

## 2. Payments (PayOS)

- Webhook handling phải verify checksum/signature.
- Transaction phải idempotent (sử dụng unique reference id và kiểm tra trạng thái trước khi apply).
- Luồng cơ bản:
  1. Client tạo order -> server tạo order, trả payment_url.
  2. Client hoàn tất thanh toán tại PayOS.
  3. PayOS gọi webhook -> server verify -> mark order paid -> push job queue xử lý fulfillment -> trả kết quả.

## 3. Dashboard

- Thống kê danh sách nghệ sĩ
- Thống kê danh sách user
- Thống kê doanh thu
- Top 10 bài hát nhiều like
  
🚀Chiến lược lấy ra top 10 bài hát nhiều like:
  1. Đặt vấn đề (The Problem)
    - Thách thức: Khi tập dữ liệu bản ghi Songs lên đến hàng triệu, việc thực hiện truy vấn SELECT ... ORDER BY likes DESC LIMIT 10 sẽ gây ra các vấn đề:
      - Full Table Scan/Sort: Gây tốn CPU và I/O của Database.
      - Index Overhead: Mặc dù có thể đánh index trường likes, nhưng do lượt like thay đổi với tần suất cực cao (high-frequency writes), việc cập nhật Index liên tục sẽ làm giảm hiệu năng ghi (Write performance) của DB.
      - Latency: Thời gian phản hồi sẽ tăng dần theo quy mô dữ liệu.

  2. Giải pháp: Hybrid Cache với Redis Sorted Set (ZSET)
    - Thay vì truy vấn trực tiếp DB, hệ thống sử dụng Redis Sorted Set (ZSET) làm cấu trúc dữ liệu chính để quản lý bảng xếp hạng.
    2.1. Tại sao dùng ZSET?
      - Tự động sắp xếp: Redis lưu trữ các phần tử kèm theo score (số lượt like) và tự động sắp xếp chúng theo cấu trúc Skip List.
      - Hiệu suất cực cao: Lấy Top 10 với độ phức tạp chỉ $O(\log N + M)$, phản hồi trong mili giây ngay cả với hàng triệu phần tử.
      - Tiết kiệm tài nguyên: Chỉ lưu trữ songId và score trên RAM, không làm nặng DB chính.
    2.2. Luồng thực thi (Execution Flow)
      - Phục vụ yêu cầu (Query): * Khi User xem bảng xếp hạng, hệ thống ưu tiên lấy dữ liệu từ Redis ZSET.
        - Nếu Redis trống (ví dụ: sau khi khởi động lại), hệ thống sẽ truy vấn từ DB, trả kết quả và kích hoạt cache lại.
      - Cơ chế đồng bộ (Synchronization): * Thay vì cập nhật ngay khi có Like/Unlike, hệ thống thực hiện đồng bộ định kỳ (Cron job) vào lúc 3:00 AM (thời điểm traffic thấp nhất).
        - Hành động: Worker sẽ quét DB -> Lấy Top 10 bài hát -> Sử dụng multi() để DEL key cũ và ZADD toàn bộ dữ liệu mới vào Redis một cách nguyên tử (Atomic).

  3. Đánh giá & Đánh đổi (Trade-offs)
  Hệ thống chấp nhận nguyên tắc Eventual Consistency (Đồng nhất sau cùng) dựa trên các lý do:
    - Ưu điểm: * Giảm tải tuyệt đối cho DB: DB không phải xử lý bất kỳ tác vụ sắp xếp phức tạp nào trong giờ cao điểm.
      - Phản hồi tức thì: User nhận được kết quả bảng xếp hạng trong mili giây từ RAM.
      - Ổn định: Tránh lỗi Race Condition khi có hàng triệu lượt Like/Unlike diễn ra cùng lúc.
    - Nhược điểm:
      - Dữ liệu trễ (Stale Data): Bảng xếp hạng sẽ không phản ánh ngay lập tức các lượt Like trong ngày (độ trễ tối đa 24h).
    - Kết luận: Với tính năng Bảng xếp hạng, sự chênh lệch nhỏ về thời gian cập nhật không gây ảnh hưởng lớn đến trải nghiệm người dùng. Đây là sự đánh đổi xứng đáng để đảm bảo hệ thống luôn mượt mà và tiết kiệm tài nguyên server.
  4. Gợi ý mở rộng
    - Real-time Leaderboard (ZINCRBY): Khi hệ thống cần tính thời gian thực cao hơn, chuyển sang cơ chế Write-through. Mỗi hành động Like/Unlike sẽ gọi ZINCRBY vào Redis thông qua BullMQ. Điều này giúp bảng xếp hạng cập nhật ngay lập tức mà vẫn không gây tải cho DB chính
    - Khi hạ tầng của bạn đã ổn định và đủ tài nguyên (CPU, RAM cho Redis và I/O cho Database) tăng tần suất chạy cron job đồng bộ dữ liệu

## 4. Queue (BullMQ + Redis)

- Job handlers cần idempotent.
- Đặt retry/backoff phù hợp, và limiter nếu cần.
- Dùng Redis locks khi cần tránh race giữa nhiều worker.

## 5. Logging & Monitoring

- Ở production: gửi `warn`/`error` lên Logtail (BetterStack) — token cấu hình từ env; ghi `info` ra file local (logs/app.log).
- Ở dev: log đầy đủ để debug, nhưng không dùng token production.
- Tùy chọn tích hợp Sentry cho stack traces.

## 6. Uploads & Emails

- Uploads (Cloudinary): validate file type/size trước khi upload; lưu `public_id` và `url` trong DB.
- Emails (Nodemailer): dùng template HTML + text fallback; gửi email số lượng lớn qua queue và throttle để tránh bị block.

---

# CI / CD & Deploy

- CI: chạy `npm run lint && npm run test -- --coverage` trên PR.
- Deploy: chỉ từ `main` hoặc release tags.
- Secrets: lưu trong GitHub Actions secrets / vault (không commit secrets vào repo).

---

# 🔐Chính sách dữ liệu & bảo mật

- Không chia sẻ API keys, private keys, client secrets trong PR.
- Thông tin người dùng: hash password, mask payment info.
- Input validation & headers: class-validator + ValidationPipe (đã có) và helmet, CORS policy chặt.
- Tokens: Access token ngắn hạn; Refresh token có rotation và revocation; lưu an toàn.
- Webhook & third-party: verify signatures (đã có), log và retry idempotently.
- Hardening: Rate limit, Helmet, CORS, brute-force protection, file upload validation.
- Logging & retention: redact dữ liệu nhạy cảm; retention 30 ngày mặc định; logs archived/encrypted.

---

# Gợi ý mở rộng (Roadmap ideas)

- Event-driven: bổ sung RabbitMQ/Kafka nếu cần event streaming.
- Thêm ticketing/chat với socket server + persistent storage.
- AI: moderation / recommendation (offline models + online features).
- Email: Tích hợp email service
- CQRS/ES nếu hệ thống cần scale read/write phân tách.

---

# Ví dụ git commands

```bash
# tạo feature branch
git checkout -b feature/123-add-payment-webhook

# lint + test trước commit
npm run lint && npm run test

git add .
git commit -m "feat(payment): add webhook verification"
git push origin feature/123-add-payment-webhook
```

---

# 📝Checklist trước merge

- [ ] Có unit tests cho logic mới
- [ ] Lint pass
- [ ] Không đưa secrets
- [ ] Đã review security implications (payment/webhook)
- [ ] DB changes có migration plan (nếu cần)

_Hết_
