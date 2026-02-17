import axios from 'axios'
import { Category, Expense, DashboardSummary, ExpenseFilters } from '../types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
})

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get('/api/categories')
  return data
}

export const createCategory = async (payload: { name: string; icon: string }): Promise<Category> => {
  const { data } = await api.post('/api/categories', payload)
  return data
}

export const updateCategory = async (id: number, payload: { name: string; icon: string }): Promise<Category> => {
  const { data } = await api.put(`/api/categories/${id}`, payload)
  return data
}

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/api/categories/${id}`)
}

// Expenses
export const getExpenses = async (filters?: ExpenseFilters): Promise<Expense[]> => {
  const { data } = await api.get('/api/expenses', { params: filters })
  return data
}

export const createExpense = async (payload: {
  amount: number
  category_id: number
  description: string
  date: string
}): Promise<Expense> => {
  const { data } = await api.post('/api/expenses', payload)
  return data
}

export const updateExpense = async (id: number, payload: {
  amount: number
  category_id: number
  description: string
  date: string
}): Promise<Expense> => {
  const { data } = await api.put(`/api/expenses/${id}`, payload)
  return data
}

export const deleteExpense = async (id: number): Promise<void> => {
  await api.delete(`/api/expenses/${id}`)
}

// Dashboard
export const getDashboardSummary = async (filters?: { start_date?: string; end_date?: string }): Promise<DashboardSummary> => {
  const { data } = await api.get('/api/dashboard/summary', { params: filters })
  return data
}
