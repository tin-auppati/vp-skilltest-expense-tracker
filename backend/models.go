package main

import (
	"time"
)

type Category struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	Icon      string    `json:"icon"`
	CreatedAt time.Time `json:"created_at"`
}

type Expense struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Amount      float64   `json:"amount" gorm:"type:decimal(10,2);not null"`
	CategoryID  uint      `json:"category_id" gorm:"not null"`
	Category    Category  `json:"category" gorm:"foreignKey:CategoryID"`
	Description string    `json:"description"`
	Date        time.Time `json:"date" gorm:"type:date;not null"`
	CreatedAt   time.Time `json:"created_at"`
}

type ExpenseRequest struct {
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	CategoryID  uint    `json:"category_id" binding:"required"`
	Description string  `json:"description"`
	Date        string  `json:"date" binding:"required"` // Format: YYYY-MM-DD
}

type CategoryRequest struct {
	Name string `json:"name" binding:"required"`
	Icon string `json:"icon"`
}

type DashboardSummary struct {
	TotalExpenses      float64           `json:"total_expenses"`
	ExpensesByCategory []CategorySummary `json:"expenses_by_category"`
	TimelineData       []TimelineData    `json:"timeline_data"`
	TopCategories      []CategorySummary `json:"top_categories"`
}

type CategorySummary struct {
	CategoryID   uint    `json:"category_id"`
	CategoryName string  `json:"category_name"`
	CategoryIcon string  `json:"category_icon"`
	TotalAmount  float64 `json:"total_amount"`
	Count        int64   `json:"count"`
}

type TimelineData struct {
	Date   string  `json:"date"`
	Amount float64 `json:"amount"`
}
