'use client'

import { useState, useEffect } from 'react'
import { getDashboardSummary } from './lib/api'
import { DashboardSummary } from './types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts'

const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1']

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getDate()}/${date.getMonth() + 1}`
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 }).format(amount)

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const data = await getDashboardSummary({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      setSummary({
        ...data,
        top_categories: data.top_categories ?? [],
        expenses_by_category: data.expenses_by_category ?? [],
        timeline_data: data.timeline_data ?? [],
      })
    } catch (err) {
      console.error(err)
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">ภาพรวมค่าใช้จ่ายของคุณ</p>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">ตั้งแต่วันที่</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">ถึงวันที่</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <button
          onClick={fetchSummary}
          
          className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          ค้นหา
        </button>
        <button
          onClick={() => { setStartDate(''); setEndDate(''); setTimeout(fetchSummary, 0) }}
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          รีเซ็ต
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-20 text-slate-400">กำลังโหลด...</div>
      ) : summary ? (
        <>
          {/* Total Card */}
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-6 text-white">
            <p className="text-sky-100 text-sm font-medium">รายจ่ายทั้งหมด</p>
            <p className="text-4xl font-bold mt-1">฿{formatMoney(summary.total_expenses)}</p>
          </div>

          {/* Top 3 Categories */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-3">Top 3 หมวดหมู่</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {summary.top_categories.map((cat, i) => (
                <div key={cat.category_id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
                  <div className="text-3xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                  <div>
                    <p className="font-semibold text-slate-700">{cat.category_icon} {cat.category_name}</p>
                    <p className="text-sky-600 font-bold">฿{formatMoney(cat.total_amount)}</p>
                    <p className="text-xs text-slate-400">{cat.count} รายการ</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">รายจ่ายตามหมวดหมู่</h2>
              {summary.expenses_by_category.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={summary.expenses_by_category}
                      dataKey="total_amount"
                      nameKey="category_name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ category_icon, category_name, percent }) =>
                        `${category_icon} ${category_name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {summary.expenses_by_category.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => `฿${formatMoney(val)}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">ไม่มีข้อมูล</div>
              )}
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">เปรียบเทียบหมวดหมู่</h2>
              {summary.expenses_by_category.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={summary.expenses_by_category}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="category_name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val: number) => `฿${formatMoney(val)}`} />
                    <Bar dataKey="total_amount" name="ยอดรวม" radius={[6, 6, 0, 0]}>
                      {summary.expenses_by_category.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">ไม่มีข้อมูล</div>
              )}
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">แนวโน้มรายจ่ายตามเวลา</h2>
            {summary.timeline_data.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={summary.timeline_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(label) => `วันที่: ${label}`}
                    formatter={(val: number) => [`฿${formatMoney(val)}`, 'ยอดรวม']}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#0ea5e9' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-slate-400">ไม่มีข้อมูล</div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}