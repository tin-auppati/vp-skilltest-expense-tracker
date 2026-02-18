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

// Custom hook to detect dark mode
function useDarkMode() {
  const [isDark, setIsDark] = useState(false)
  
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])
  
  return isDark
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<{
    start_date?: string
    end_date?: string
  }>({})
  const [filterInput, setFilterInput] = useState({ start_date: '', end_date: '' })
  const [error, setError] = useState<string | null>(null)
  const isDark = useDarkMode()
  
  const textColor = isDark ? '#e2e8f0' : '#475569'
  const gridColor = isDark ? '#334155' : '#f1f5f9'
  
  // สร้าง Key สำหรับ Force Re-render กราฟเมื่อวันที่เปลี่ยน
  const chartKey = `${dateFilter.start_date || 'all'}-${dateFilter.end_date || 'all'}`

  const fetchSummary = async (filter = dateFilter) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDashboardSummary(filter)
      setSummary(data)
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
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">ภาพรวมค่าใช้จ่ายของคุณ</p>
      </div>

      {/* Date Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">ตั้งแต่วันที่</label>
          <input
            type="date"
            value={filterInput.start_date}
            onChange={(e) => setFilterInput(prev => ({ ...prev, start_date: e.target.value }))}
            className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">ถึงวันที่</label>
          <input
            type="date"
            value={filterInput.end_date}
            onChange={(e) => setFilterInput(prev => ({ ...prev, end_date: e.target.value }))}
            className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <button
          onClick={() => { 
            const newFilter = {
              start_date: filterInput.start_date || undefined,
              end_date: filterInput.end_date || undefined,
            }
            setDateFilter(newFilter)
            fetchSummary(newFilter)
          }}
          className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          ค้นหา
        </button>
        <button
          onClick={() => { 
            setFilterInput({ start_date: '', end_date: '' })
            setDateFilter({})
            fetchSummary({})
          }}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          รีเซ็ต
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">กำลังโหลด...</div>
      ) : summary ? (
        <>
          {/* Total Card */}
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-6 text-white">
            <p className="text-sky-100 text-sm font-medium">รายจ่ายทั้งหมด</p>
            <p className="text-4xl font-bold mt-1">฿{formatMoney(summary.total_expenses)}</p>
          </div>

          {/* Top 3 Categories */}
          {/* เพิ่ม key เพื่อบังคับ Render ใหม่เมื่อ Filter เปลี่ยน */}
          <div key={`top3-${chartKey}`}>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">Top 3 หมวดหมู่</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(summary.top_categories || []).map((cat, i) => (
                <div key={cat.category_id || i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
                  <div className="text-3xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{cat.category_icon} {cat.category_name}</p>
                    <p className="text-sky-600 dark:text-sky-400 font-bold">฿{formatMoney(cat.total_amount)}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{cat.count} รายการ</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">รายจ่ายตามหมวดหมู่</h2>
              {(summary.expenses_by_category || []).length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  {/* เพิ่ม key ที่ PieChart เพื่อแก้ปัญหากราฟค้าง */}
                  <PieChart key={`pie-${chartKey}`}>
                    <Pie
                      data={summary.expenses_by_category || []}
                      dataKey="total_amount"
                      nameKey="category_name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ category_icon, category_name, percent }) =>
                        `${category_icon} ${category_name} ${(percent * 100).toFixed( 2)}%`
                      }
                      labelLine={false}
                    >
                      {summary.expenses_by_category.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: number) => `฿${formatMoney(val)}`}
                      contentStyle={{ 
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        border: `2px solid ${isDark ? '#64748b' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        color: isDark ? '#ffffff' : '#1e293b',
                        padding: '8px 12px'
                      }}
                      itemStyle={{ color: isDark ? '#ffffff' : '#1e293b', fontWeight: '500' }}
                      labelStyle={{ color: isDark ? '#ffffff' : '#1e293b', fontWeight: '600' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500">ไม่มีข้อมูล</div>
              )}
            </div>

            {/* Bar Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">เปรียบเทียบหมวดหมู่</h2>
              {(summary.expenses_by_category || []).length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                   {/* เพิ่ม key ที่ BarChart */}
                  <BarChart key={`bar-${chartKey}`} data={summary.expenses_by_category || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="category_name" tick={{ fontSize: 11, fill: textColor }} />
                    <YAxis tick={{ fontSize: 11, fill: textColor }} />
                    <Tooltip 
                      formatter={(val: number) => `฿${formatMoney(val)}`}
                      contentStyle={{ 
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        border: `2px solid ${isDark ? '#64748b' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        color: isDark ? '#ffffff' : '#1e293b',
                        padding: '8px 12px'
                      }}
                      itemStyle={{ color: isDark ? '#ffffff' : '#1e293b', fontWeight: '500' }}
                      labelStyle={{ color: isDark ? '#ffffff' : '#1e293b', fontWeight: '600' }}
                    />
                    <Bar dataKey="total_amount" name="ยอดรวม" radius={[6, 6, 0, 0]}>
                      {summary.expenses_by_category.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500">ไม่มีข้อมูล</div>
              )}
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">แนวโน้มรายจ่ายตามเวลา</h2>
            {(summary.timeline_data || []).length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                 {/* เพิ่ม key ที่ LineChart */}
                <LineChart key={`line-${chartKey}`} data={summary.timeline_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: textColor }} />
                  <YAxis tick={{ fontSize: 11, fill: textColor }} />
                  <Tooltip
                    labelFormatter={(label) => {
                      const date = new Date(label)
                      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                    }}
                    formatter={(val: number) => [`฿${formatMoney(val)}`, 'ยอดรวม']}
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      border: `2px solid ${isDark ? '#64748b' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      color: isDark ? '#ffffff' : '#1e293b',
                      padding: '8px 12px'
                    }}
                    itemStyle={{ color: isDark ? '#ffffff' : '#1e293b', fontWeight: '500' }}
                    labelStyle={{ color: isDark ? '#ffffff' : '#1e293b', fontWeight: '600' }}
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
              <div className="h-52 flex items-center justify-center text-slate-400 dark:text-slate-500">ไม่มีข้อมูล</div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}