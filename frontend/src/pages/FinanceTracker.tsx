import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Plus, Trash2, Wallet, CreditCard, ShoppingBag, Smartphone, Coffee, FileText, LayoutList, MessageSquareText, Sparkles, Zap } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  FOOD: <Coffee size={16} />,
  CLOTHES: <ShoppingBag size={16} />,
  RECHARGE: <Smartphone size={16} />,
  BILLS: <FileText size={16} />,
  ENTERTAINMENT: <CreditCard size={16} />,
  TRANSPORT: <Wallet size={16} />,
  OTHER: <LayoutList size={16} />
}

export default function FinanceTracker() {
  const qc = useQueryClient()
  const [currentMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSmsModal, setShowSmsModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', currentMonth],
    queryFn: () => api.get(`/expenses?month=${currentMonth}`).then(r => r.data.data),
  })

  const deleteExpense = useMutation({
    mutationFn: (id: string) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      toast.success('Expense deleted')
      qc.invalidateQueries({ queryKey: ['expenses'] })
    }
  })

  const { expenses = [], summary = { totalAmount: 0, byCategory: {} } } = data || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-base)]">Finances</h1>
          <p className="text-[var(--color-text-muted)] text-sm">{format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSmsModal(true)} className="btn btn-secondary btn-sm">
            <MessageSquareText size={15} /> Auto-import
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
            <Plus size={15} /> Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Spent Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <Wallet size={32} className="text-[var(--color-text-muted)] mb-4" />
          <p className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Total Spent</p>
          <p className="text-5xl font-black text-[var(--color-text-base)]">${summary.totalAmount.toFixed(2)}</p>
        </motion.div>

        {/* Categories Breakdown */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="font-semibold text-[var(--color-text-base)] mb-4">By Category</h3>
          <div className="space-y-4">
            {Object.entries(summary.byCategory).sort(([, a], [, b]) => (b as number) - (a as number)).map(([cat, amount]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--color-text-muted)] font-medium capitalize flex items-center gap-2">
                    {CATEGORY_ICONS[cat]} {cat.toLowerCase()}
                  </span>
                  <span className="text-[var(--color-text-base)] font-bold">${(amount as number).toFixed(2)}</span>
                </div>
                <div className="progress-bar h-1.5">
                  <motion.div
                    className="progress-bar-fill bg-[var(--color-text-muted)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((amount as number) / summary.totalAmount) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(summary.byCategory).length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No expenses yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="font-bold text-[var(--color-text-base)] mb-4">Recent Transactions</h2>
        {isLoading ? (
          <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : expenses.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Wallet size={32} className="mx-auto mb-3 text-slate-600" />
            <p className="text-[var(--color-text-muted)]">No transactions this month</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense: any) => (
              <div key={expense.id} className="glass-card p-4 glass-card-hover flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-muted)]">
                    {CATEGORY_ICONS[expense.category]}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-text-base)] flex items-center gap-2">
                      {expense.description}
                      {expense.source === 'SMS' && (
                        <span className="badge badge-violet text-[10px] inline-flex items-center gap-1">
                          <Zap size={10} /> Auto
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
                      <span className="capitalize">{expense.category.toLowerCase()}</span>
                      <span>·</span>
                      <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-[var(--color-text-base)]">${expense.amount.toFixed(2)}</p>
                  <button onClick={() => deleteExpense.mutate(expense.id)} className="btn btn-ghost btn-icon hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && <AddExpenseModal onClose={() => setShowAddModal(false)} onSave={() => qc.invalidateQueries({ queryKey: ['expenses'] })} />}
        {showSmsModal && <SmsImportModal onClose={() => setShowSmsModal(false)} onSave={() => qc.invalidateQueries({ queryKey: ['expenses'] })} />}
      </AnimatePresence>
    </div>
  )
}

function SmsImportModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [text, setText] = useState('')
  const [preview, setPreview] = useState<any | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ imported: number; duplicates: number; skipped: number } | null>(null)

  // Split pasted text into individual SMS (blank line OR newline separated).
  const messages = text.split(/\n\s*\n|\n/).map((s) => s.trim()).filter(Boolean)

  const runPreview = async () => {
    if (!messages[0]) return
    setBusy(true)
    try {
      const r = await api.post('/expenses/sms/preview', { message: messages[0] })
      setPreview(r.data.data)
    } catch {
      toast.error('Could not parse SMS')
    } finally {
      setBusy(false)
    }
  }

  const runImport = async () => {
    if (messages.length === 0) return
    setBusy(true)
    try {
      const r = await api.post('/expenses/sms/batch', { messages })
      const summary = r.data.data.summary
      setResult(summary)
      if (summary.imported > 0) {
        toast.success(`Imported ${summary.imported} expense${summary.imported > 1 ? 's' : ''}`)
        onSave()
      } else {
        toast('No new expenses found', { icon: 'ℹ️' })
      }
    } catch {
      toast.error('Import failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquareText size={18} className="text-[var(--color-text-base)]" />
          <h3 className="text-lg font-bold text-[var(--color-text-base)]">Auto-import from SMS</h3>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mb-4">
          Paste your bank / UPI payment messages. We detect the amount, merchant, and category automatically.
          Credits, OTPs, and duplicates are ignored.
        </p>

        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setPreview(null); setResult(null) }}
          rows={5}
          placeholder={'Rs.499 debited from a/c XX3421 to SWIGGY via UPI ref 452310098765\nINR 1,250.50 spent on ICICI Card at MYNTRA ...'}
          className="input-field font-mono text-xs"
        />

        {messages.length > 0 && (
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">{messages.length} message{messages.length > 1 ? 's' : ''} detected</p>
        )}

        {preview && (
          <div className="glass-card p-3 mt-3 text-sm">
            {preview.isTransaction ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[var(--color-text-base)] flex items-center gap-1">
                    <Sparkles size={13} /> {preview.merchant || 'Payment'}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] capitalize">
                    {preview.direction.toLowerCase()} · {String(preview.category || '').toLowerCase()}
                  </p>
                </div>
                <p className="font-bold text-[var(--color-text-base)]">${Number(preview.amount).toFixed(2)}</p>
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)]">Not a transaction message — this one will be skipped.</p>
            )}
          </div>
        )}

        {result && (
          <div className="glass-card p-3 mt-3 text-xs text-[var(--color-text-muted)] flex gap-4">
            <span className="text-[var(--color-text-base)] font-semibold">{result.imported} imported</span>
            <span>{result.duplicates} duplicate</span>
            <span>{result.skipped} skipped</span>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={runPreview} disabled={busy || messages.length === 0} className="btn btn-secondary flex-1 disabled:opacity-40">
            Preview
          </button>
          <button type="button" onClick={runImport} disabled={busy || messages.length === 0} className="btn btn-primary flex-1 disabled:opacity-40">
            {busy ? 'Working…' : `Import ${messages.length || ''}`.trim()}
          </button>
        </div>

        <details className="mt-4">
          <summary className="text-xs text-[var(--color-text-muted)] cursor-pointer">Set up fully-automatic capture (Android)</summary>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-2 leading-relaxed">
            Use a free SMS-forwarder app (MacroDroid / Tasker / “SMS to URL”) to POST each new bank
            SMS to <code className="bg-[var(--color-surface)] px-1 rounded">/api/expenses/sms/ingest</code> as
            <code className="bg-[var(--color-surface)] px-1 rounded"> {'{ "message": "%sms_body%" }'}</code>.
            Every payment then lands here on its own — no pasting.
          </p>
        </details>
      </motion.div>
    </div>
  )
}

function AddExpenseModal({ onClose, onSave }: { onClose: () => void, onSave: () => void }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('FOOD')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/expenses', { amount, category, description, date })
      toast.success('Expense saved')
      onSave()
      onClose()
    } catch {
      toast.error('Failed to save expense')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content">
        <h3 className="text-lg font-bold text-[var(--color-text-base)] mb-4">Add Expense</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Amount ($)</label>
            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="input-field" required autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="What did you buy?" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['FOOD', 'CLOTHES', 'RECHARGE', 'BILLS', 'ENTERTAINMENT', 'TRANSPORT', 'OTHER'].map(c => (
                <button
                  key={c} type="button" onClick={() => setCategory(c)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all capitalize ${category === c ? 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-base)]' : 'border-transparent text-[var(--color-text-muted)] bg-[var(--color-surface)] opacity-60'}`}
                >
                  <div className="flex items-center gap-2 justify-center">
                    {CATEGORY_ICONS[c]} {c.toLowerCase()}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1">
              {saving ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
