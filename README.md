# Expense Tracker

โปรแกรมบันทึกและแสดงผลค่าใช้จ่าย พร้อม Dashboard สรุปรายจ่ายตามหมวดหมู่

## Tech Stack

- **Backend:** Go + Gin + GORM
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS + Recharts
- **Database:** PostgreSQL
- **Infrastructure:** Docker + Docker Compose

## Features

- บันทึก/แก้ไข/ลบรายจ่าย
- จัดหมวดหมู่รายจ่าย
- Filter ตามช่วงวันที่และหมวดหมู่
- Sort ตามวันที่และจำนวนเงิน
- Dashboard แสดง Pie Chart, Bar Chart, Line Chart
- สรุป Top 3 หมวดหมู่ที่ใช้จ่ายมากที่สุด

## การรันด้วย Docker (แนะนำ)

```bash
# Clone repository
git clone <repo-url>
cd expense-tracker

# รันทั้ง stack
./run_docker-compose.sh

# เข้าใช้งาน
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
```

## การรันแบบ Development

### Backend (Go)

```bash
cd backend

# ตั้งค่า environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=expenseuser
export DB_PASSWORD=expensepass
export DB_NAME=expensedb
export PORT=8080

# รัน
go mod tidy
go run .
```

### Frontend (Next.js)

```bash
cd frontend

# ติดตั้ง dependencies
npm install

# รัน development server
npm run dev

# เข้าใช้งานที่ http://localhost:3000
```

### Database (PostgreSQL)

```bash
# รันแค่ database ด้วย Docker
docker compose up postgres -d
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | ดึงหมวดหมู่ทั้งหมด |
| POST | `/api/categories` | สร้างหมวดหมู่ใหม่ |
| PUT | `/api/categories/:id` | แก้ไขหมวดหมู่ |
| DELETE | `/api/categories/:id` | ลบหมวดหมู่ |
| GET | `/api/expenses` | ดึงรายจ่าย (รองรับ filter/sort) |
| POST | `/api/expenses` | สร้างรายจ่ายใหม่ |
| PUT | `/api/expenses/:id` | แก้ไขรายจ่าย |
| DELETE | `/api/expenses/:id` | ลบรายจ่าย |
| GET | `/api/dashboard/summary` | ดึงข้อมูล Dashboard |

### Query Parameters สำหรับ GET /api/expenses

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | string (YYYY-MM-DD) | กรองตั้งแต่วันที่ |
| `end_date` | string (YYYY-MM-DD) | กรองถึงวันที่ |
| `category_id` | number | กรองตามหมวดหมู่ |
| `sort` | string (date, amount) | เรียงลำดับตาม field |
| `order` | string (asc, desc) | ทิศทางการเรียง |

## Database Schema

```sql
categories
- id          SERIAL PRIMARY KEY
- name        VARCHAR NOT NULL
- icon        VARCHAR
- created_at  TIMESTAMP

expenses
- id          SERIAL PRIMARY KEY
- amount      DECIMAL(10,2) NOT NULL
- category_id INTEGER REFERENCES categories(id)
- description VARCHAR
- date        TIMESTAMP NOT NULL
- created_at  TIMESTAMP
```