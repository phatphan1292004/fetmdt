---
title: MongoDB Integration Guide
author: bqtankiet
date: 2026-04-19
---

# MongoDB Integration Guide

## 1. Environment Variables

File `.env` (root project):

```env
MONGODB_URI="mongodb+srv://<username>:<password>@tmdt.t9xu0gy.mongodb.net/phongtot?appName=tmdt&retryWrites=true&w=majority"
```
> Thay đổi \<username> và \<password> bằng thông tin chính xác
---

## 2. MongoDB Config

File: [src/lib/mongoose.ts](/src/lib/mongoose.ts)

Chứa function `connectDB()` để kết nối MongoDB và cache connection

Cách dùng:
```ts
import { connectDB } from "@/src/lib/mongoose";

await connectDB();
```

---

## 3. Test MongoDB Connection

File: [test/mongodb.test.ts](/test/mongodb.test.ts)

Chạy test:

```bash
npx jest test/mongodb.test.ts
````

Để kiểm tra kết nối MongoDB.