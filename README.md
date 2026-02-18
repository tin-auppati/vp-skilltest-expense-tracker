# Expense Tracker (Go + Next.js)

ระบบ Expense Tracker นี้เป็นแอปพลิเคชันสำหรับบันทึกและวิเคราะห์ค่าใช้จ่ายส่วนบุคคล ประกอบด้วย Backend (Go, Gin, GORM, PostgreSQL) และ Frontend (Next.js, React, TypeScript, TailwindCSS, Recharts)

## Features
- จัดการหมวดหมู่ค่าใช้จ่าย (เพิ่ม/แก้ไข/ลบ)
- บันทึกค่าใช้จ่าย (เพิ่ม/แก้ไข/ลบ)
- กรองข้อมูลตามช่วงวันที่และหมวดหมู่
- Dashboard สรุปยอดรวม, Top 3 หมวดหมู่, Timeline รายวัน
- แสดงผลกราฟด้วย Recharts

## Tech Stack
- **Backend:** Go, Gin, GORM, PostgreSQL
- **Frontend:** Next.js, React, TypeScript, TailwindCSS, Recharts
- **Docker:** รองรับการรันทั้งระบบด้วย Docker Compose

## โครงสร้างโปรเจกต์
```
├── backend/         # Go API Server
│   ├── handlers.go
│   ├── main.go
│   ├── models.go
│   └── go.mod
├── frontend/        # Next.js Frontend
│   ├── app/
│   ├── lib/api.ts
│   ├── types/index.ts
│   └── ...
├── docker-compose.yml
└── README.md
```

## การติดตั้งและรันระบบ
### 1. Clone Repo
```bash
git clone <repo-url>
cd vp-skilltest-expense-tracker
```

### 2. รันด้วย Docker Compose
```bash
./run_docker-compose.sh
# หรือ
# docker-compose up --build
```

- Backend จะรันที่ http://localhost:8080
- Frontend จะรันที่ http://localhost:3000

### 4. เข้าถึงระบบ
เปิดเบราว์เซอร์ที่ http://localhost:3000

## API Endpoints (Backend)
- `GET    /api/categories`         : ดึงหมวดหมู่
- `POST   /api/categories`         : เพิ่มหมวดหมู่
- `PUT    /api/categories/:id`     : แก้ไขหมวดหมู่
- `DELETE /api/categories/:id`     : ลบหมวดหมู่
- `GET    /api/expenses`           : ดึงรายการค่าใช้จ่าย (รองรับ filter)
- `POST   /api/expenses`           : เพิ่มค่าใช้จ่าย
- `PUT    /api/expenses/:id`       : แก้ไขค่าใช้จ่าย
- `DELETE /api/expenses/:id`       : ลบค่าใช้จ่าย
- `GET    /api/dashboard/summary`  : Dashboard summary (รองรับ filter)

## โครงสร้างข้อมูลหลัก
### Expense
- id: number
- amount: number
- date: string (YYYY-MM-DD)
- category: Category
- description: string

### Category
- id: number
- name: string
- icon: string

## หมายเหตุ
- ระบบรองรับ Timezone Asia/Bangkok ทั้งฝั่ง backend และ dashboard
- สามารถปรับแต่งหมวดหมู่และช่วงวันที่ได้
- มีตัวอย่าง seed ข้อมูลหมวดหมู่เริ่มต้น

---

**ผู้พัฒนา:**
- Tin Auppati
# Expense Tracker

