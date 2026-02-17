package main

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Category handlers
func getCategories(c *gin.Context) {
	var categories []Category
	db.Find(&categories)
	c.JSON(http.StatusOK, categories)
}

func createCategory(c *gin.Context) {
	var req CategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category := Category{
		Name: req.Name,
		Icon: req.Icon,
	}

	if err := db.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	c.JSON(http.StatusCreated, category)
}

func updateCategory(c *gin.Context) {
	id := c.Param("id")
	var category Category

	if err := db.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	var req CategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category.Name = req.Name
	category.Icon = req.Icon

	db.Save(&category)
	c.JSON(http.StatusOK, category)
}

func deleteCategory(c *gin.Context) {
	id := c.Param("id")

	// Check if category has expenses
	var count int64
	db.Model(&Expense{}).Where("category_id = ?", id).Count(&count)

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete category with existing expenses"})
		return
	}

	if err := db.Delete(&Category{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
}

// Expense handlers
func getExpenses(c *gin.Context) {
	var expenses []Expense

	query := db.Preload("Category")

	// Filter by date range
	if startDate := c.Query("start_date"); startDate != "" {
		query = query.Where("date >= ?", startDate)
	}
	if endDate := c.Query("end_date"); endDate != "" {
		query = query.Where("date <= ?", endDate)
	}

	// Filter by category
	if categoryID := c.Query("category_id"); categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	// Sort
	sortBy := c.DefaultQuery("sort", "date")
	sortOrder := c.DefaultQuery("order", "desc")
	query = query.Order(sortBy + " " + sortOrder)

	query.Find(&expenses)
	c.JSON(http.StatusOK, expenses)
}

func createExpense(c *gin.Context) {
	var req ExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse date
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	expense := Expense{
		Amount:      req.Amount,
		CategoryID:  req.CategoryID,
		Description: req.Description,
		Date:        date,
	}

	if err := db.Create(&expense).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create expense"})
		return
	}

	// Load category
	db.Preload("Category").First(&expense, expense.ID)

	c.JSON(http.StatusCreated, expense)
}

func updateExpense(c *gin.Context) {
	id := c.Param("id")
	var expense Expense

	if err := db.First(&expense, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Expense not found"})
		return
	}

	var req ExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	expense.Amount = req.Amount
	expense.CategoryID = req.CategoryID
	expense.Description = req.Description
	expense.Date = date

	db.Save(&expense)
	db.Preload("Category").First(&expense, expense.ID)

	c.JSON(http.StatusOK, expense)
}

func deleteExpense(c *gin.Context) {
	id := c.Param("id")

	if err := db.Delete(&Expense{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete expense"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Expense deleted successfully"})
}

// Dashboard handler
func getDashboardSummary(c *gin.Context) {
	var summary DashboardSummary

	query := db.Model(&Expense{})

	// Filter by date range
	if startDate := c.Query("start_date"); startDate != "" {
		query = query.Where("date >= ?", startDate)
	}
	if endDate := c.Query("end_date"); endDate != "" {
		query = query.Where("date <= ?", endDate)
	}

	// Total expenses
	var total float64
	query.Select("COALESCE(SUM(amount), 0)").Scan(&total)
	summary.TotalExpenses = total

	// Expenses by category
	var categorySummaries []CategorySummary
	db.Table("expenses").
		Select("categories.id as category_id, categories.name as category_name, categories.icon as category_icon, COALESCE(SUM(expenses.amount), 0) as total_amount, COUNT(expenses.id) as count").
		Joins("JOIN categories ON expenses.category_id = categories.id").
		Group("categories.id, categories.name, categories.icon").
		Scan(&categorySummaries)

	summary.ExpensesByCategory = categorySummaries

	// Top 3 categories
	var topCategories []CategorySummary
	db.Table("expenses").
		Select("categories.id as category_id, categories.name as category_name, categories.icon as category_icon, COALESCE(SUM(expenses.amount), 0) as total_amount, COUNT(expenses.id) as count").
		Joins("JOIN categories ON expenses.category_id = categories.id").
		Group("categories.id, categories.name, categories.icon").
		Order("total_amount DESC").
		Limit(3).
		Scan(&topCategories)

	summary.TopCategories = topCategories

	// Timeline data (daily totals)
	var timelineData []TimelineData
	db.Table("expenses").
		Select("DATE(date) as date, COALESCE(SUM(amount), 0) as amount").
		Group("DATE(date)").
		Order("date ASC").
		Scan(&timelineData)

	summary.TimelineData = timelineData

	c.JSON(http.StatusOK, summary)
}
