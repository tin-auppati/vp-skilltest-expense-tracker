'use client'

import { useState, useEffect } from 'react'
import { getExpenses, getCategories, createExpense, updateExpense, deleteExpense } from '../lib/api'
import { Expense, Category, ExpenseFilters } from '../types'

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(amount)

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

const emptyForm = { amount: '', category_id: '', description: '', date: '' }

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Expense | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filters, setFilters] = useState<ExpenseFilters>({ sort: 'date', order: 'desc' })
  const [filterInput, setFilterInput] = useState({ start_date: '', end_date: '', category_id: '' })

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const data = await getExpenses(filters)
      setExpenses(data ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    const data = await getCategories()
    setCategories(data ?? [])
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [filters])

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, ...filterInput }))
  }

  const handleReset = () => {
    setFilterInput({ start_date: '', end_date: '', category_id: '' })
    setFilters({ sort: 'date', order: 'desc' })
  }

  const handleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sort: field,
      order: prev.sort === field && prev.order === 'asc' ? 'desc' : 'asc',
    }))
  }

  const openCreate = () => {
    setEditTarget(null)
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    setForm({ ...emptyForm, date: today })
    setShowForm(true)
  }

  const openEdit = (expense: Expense) => {
    setEditTarget(expense)
    setForm({
      amount: String(expense.amount),
      category_id: String(expense.category_id),
      description: expense.description,
      date: expense.date.slice(0, 10),
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.amount || !form.category_id || !form.date) return alert('กรุณากรอกข้อมูลให้ครบ')
    const payload = {
      amount: parseFloat(form.amount),
      category_id: parseInt(form.category_id),
      description: form.description,
      date: form.date,
    }
    try {
      if (editTarget) {
        await updateExpense(editTarget.id, payload)
      } else {
        await createExpense(payload)
      }
      setShowForm(false)
      fetchExpenses()
    } catch (err) {
      console.error(err)
      alert('เกิดข้อผิดพลาด')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('ต้องการลบรายการนี้?')) return
    try {
      await deleteExpense(id)
      fetchExpenses()
    } catch (err) {
      console.error(err)
    }
  }

  const sortIcon = (field: string) => {
    if (filters.sort !== field) return '↕'
    return filters.order === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">รายจ่าย</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">จัดการรายจ่ายทั้งหมดของคุณ</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openCreate}
            className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-lg font-medium transition-colors"
          >
            + เพิ่มรายจ่าย
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">ตั้งแต่วันที่</label>
          <input
            type="date"
            value={filterInput.start_date}
            onChange={e => setFilterInput(prev => ({ ...prev, start_date: e.target.value }))}
            className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">ถึงวันที่</label>
          <input
            type="date"
            value={filterInput.end_date}
            onChange={e => setFilterInput(prev => ({ ...prev, end_date: e.target.value }))}
            className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">หมวดหมู่</label>
          <select
            value={filterInput.category_id}
            onChange={e => setFilterInput(prev => ({ ...prev, category_id: e.target.value }))}
            className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="">ทั้งหมด</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>
        <button onClick={handleSearch} className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
          ค้นหา
        </button>
        <button onClick={handleReset} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
          รีเซ็ต
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th
                className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 select-none"
                onClick={() => handleSort('date')}
              >
                วันที่ {sortIcon('date')}
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">หมวดหมู่</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">รายละเอียด</th>
              <th
                className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-300 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 select-none"
                onClick={() => handleSort('amount')}
              >
                จำนวนเงิน {sortIcon('amount')}
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400 dark:text-slate-500">กำลังโหลด...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400 dark:text-slate-500">ไม่มีรายการ</td></tr>
            ) : (
              expenses.map(expense => (
                <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(expense.date)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 px-2 py-1 rounded-full text-xs font-medium">
                      {expense.category?.icon} {expense.category?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{expense.description || '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                    ฿{formatMoney(expense.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(expense)} className="text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 mr-3 font-medium">แก้ไข</button>
                    <button onClick={() => handleDelete(expense.id)} className="text-rose-400 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-medium">ลบ</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
              {editTarget ? 'แก้ไขรายจ่าย' : 'เพิ่มรายจ่าย'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">จำนวนเงิน (฿)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">หมวดหมู่</label>
                <select
                  value={form.category_id}
                  onChange={e => setForm(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">วันที่</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">รายละเอียด (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="เช่น ข้าวเที่ยง, BTS"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-lg font-medium transition-colors"
              >
                {editTarget ? 'บันทึกการแก้ไข' : 'เพิ่มรายจ่าย'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 py-2 rounded-lg font-medium transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}