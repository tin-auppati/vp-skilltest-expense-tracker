'use client'

import { useState, useEffect } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../lib/api'
import { Category } from '../types'

const EMOJI_OPTIONS = ['🍜','☕','🚗','🛍️','🎬','💊','📚','📌','🏠','✈️','🎮','💡','🐾','👕','🍕','🎁']

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', icon: '📌' })

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await getCategories()
      setCategories(data ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openCreate = () => {
    setEditTarget(null)
    setForm({ name: '', icon: '📌' })
    setShowForm(true)
  }

  const openEdit = (cat: Category) => {
    setEditTarget(cat)
    setForm({ name: cat.name, icon: cat.icon })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return alert('กรุณากรอกชื่อหมวดหมู่')
    try {
      if (editTarget) {
        await updateCategory(editTarget.id, form)
      } else {
        await createCategory(form)
      }
      setShowForm(false)
      fetchCategories()
    } catch (err) {
      console.error(err)
      alert('เกิดข้อผิดพลาด')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('ต้องการลบหมวดหมู่นี้?')) return
    try {
      await deleteCategory(id)
      fetchCategories()
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message)
      } else {
        alert('ไม่สามารถลบได้ อาจมีรายจ่ายในหมวดหมู่นี้อยู่')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">หมวดหมู่</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">จัดการหมวดหมู่รายจ่ายของคุณ</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-lg font-medium transition-colors"
        >
          + เพิ่มหมวดหมู่
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">กำลังโหลด...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
            >
              <span className="text-4xl">{cat.icon}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 text-center">{cat.name}</span>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => openEdit(cat)}
                  className="text-xs text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-medium"
                >
                  แก้ไข
                </button>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-xs text-rose-400 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-medium"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
              {editTarget ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">ชื่อหมวดหมู่</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="เช่น อาหาร, เดินทาง"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">ไอคอน</label>
                <div className="grid grid-cols-8 gap-2">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setForm(prev => ({ ...prev, icon: emoji }))}
                      className={`text-2xl p-1 rounded-lg transition-all ${
                        form.icon === emoji
                          ? 'bg-sky-100 dark:bg-sky-900/50 ring-2 ring-sky-400 scale-110'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">เลือกแล้ว: {form.icon}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-lg font-medium transition-colors"
              >
                {editTarget ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
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