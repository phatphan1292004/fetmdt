---
title: Swagger API Documentation Guide
author: bqtankiet
date: 2026-04-19
---

# Swagger API Documentation Guide

## 1. Tổng quan

Dự án đang dùng:

- `next-swagger-doc` để sinh OpenAPI spec từ comment trong route.
- `swagger-ui-react` để hiển thị giao diện tài liệu API.

Luồng hoạt động:

1. Các route đặt comment `@openapi` hoặc `@swagger`.
2. Endpoint [GET /api/v1/docs](http://localhost:3000/api/v1/docs) trả về JSON OpenAPI.
3. Trang [/api-docs/v1](http://localhost:3000/api-docs/v1) render Swagger UI từ endpoint trên.

---

## 2. Vị trí file quan trọng

- [src/lib/swagger.ts](/src/lib/swagger.ts): cấu hình OpenAPI gốc (info, servers, schemas, security).
- [src/app/api/v1/docs/route.ts](/src/app/api/v1/docs/route.ts): endpoint xuất OpenAPI JSON.
- [src/app/api-docs/v1/page.tsx](/src/app/api-docs/v1/page.tsx): Swagger UI page.
- [src/app/api/v1/**/route.ts](/src/app/api/v1/): nơi khai báo API và viết annotation.

---

## 3. Cách mở Swagger UI

Chạy server local:

```bash
npm run dev
```

Mở tài liệu:

- UI: `http://localhost:3000/api-docs/v1`
- JSON: `http://localhost:3000/api/v1/docs`

---

