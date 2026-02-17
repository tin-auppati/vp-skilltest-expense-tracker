export interface Category {
  id: number
  name: string
  icon: string
  created_at: string
}

export interface Expense {
  id: number
  amount: number
  category_id: number
  category: Category
  description: string
  date: string
  created_at: string
}

export interface CategorySummary {
  category_id: number
  category_name: string
  category_icon: string
  total_amount: number
  count: number
}

export interface TimelineData {
  date: string
  amount: number
}

export interface DashboardSummary {
  total_expenses: number
  expenses_by_category: CategorySummary[]
  timeline_data: TimelineData[]
  top_categories: CategorySummary[]
}

export interface ExpenseFilters {
  start_date?: string
  end_date?: string
  category_id?: string
  sort?: string
  order?: string
}
