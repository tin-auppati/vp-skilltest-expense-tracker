package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func main() {
	// Initialize database
	initDB()

	// Run migrations
	migrate()

	// Seed default categories
	seedCategories()

	// Setup router
	r := gin.Default()

	// CORS
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	// Routes
	api := r.Group("/api")
	{
		// Categories
		api.GET("/categories", getCategories)
		api.POST("/categories", createCategory)
		api.PUT("/categories/:id", updateCategory)
		api.DELETE("/categories/:id", deleteCategory)

		// Expenses
		api.GET("/expenses", getExpenses)
		api.POST("/expenses", createExpense)
		api.PUT("/expenses/:id", updateExpense)
		api.DELETE("/expenses/:id", deleteExpense)

		// Dashboard
		api.GET("/dashboard/summary", getDashboardSummary)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}

func initDB() {
	var err error

	// Try to use Neon DATABASE_URL first, fallback to individual environment variables
	dsn := os.Getenv("DATABASE_URL")

	if dsn == "" {
		// Fallback to individual environment variables
		dsn = fmt.Sprintf(
			"host=%s user=%s password=%s dbname=%s port=%s sslmode=require TimeZone=Asia/Bangkok",
			os.Getenv("DB_HOST"),
			os.Getenv("DB_USER"),
			os.Getenv("DB_PASSWORD"),
			os.Getenv("DB_NAME"),
			os.Getenv("DB_PORT"),
		)
	}

	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully")
}

func migrate() {
	err := db.AutoMigrate(&Category{}, &Expense{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	log.Println("Database migrated successfully")
}

func seedCategories() {
	var count int64
	db.Model(&Category{}).Count(&count)

	if count == 0 {
		defaultCategories := []Category{
			{Name: "อาหาร", Icon: "🍜"},
			{Name: "เครื่องดื่ม", Icon: "☕"},
			{Name: "ค่าเดินทาง", Icon: "🚗"},
			{Name: "ช้อปปิ้ง", Icon: "🛍️"},
			{Name: "บันเทิง", Icon: "🎬"},
			{Name: "สุขภาพ", Icon: "💊"},
			{Name: "การศึกษา", Icon: "📚"},
			{Name: "อื่นๆ", Icon: "📌"},
		}

		result := db.Create(&defaultCategories)
		if result.Error != nil {
			log.Fatal("Failed to seed categories:", result.Error)
		}
		log.Println("Default categories seeded")
	}
}
