import { useState, useEffect } from 'react'
import { Scale, Plus, Trash2, TrendingDown, TrendingUp, Target } from 'lucide-react'

const ACCENT = '#06b6d4'

interface Entry { id: string; date: string; weight: number; notes: string }

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg')
  const [height, setHeight] = useState('')
  const [goal, setGoal] = useState('')
  const [adding, setAdding] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const e = localStorage.getItem('bw_entries')
    const s = localStorage.getItem('bw_settings')
    if (e) setEntries(JSON.parse(e))
    if (s) { const st = JSON.parse(s); setUnit(st.unit || 'kg'); setHeight(st.height || ''); setGoal(st.goal || '') }
  }, [])

  function saveSettings() { localStorage.setItem('bw_settings', JSON.stringify({ unit, height, goal })) }
  function saveEntries(list: Entry[]) { setEntries(list); localStorage.setItem('bw_entries', JSON.stringify(list)) }

  function addEntry() {
    if (!weight) return
    const e: Entry = { id: Date.now().toString(), date: new Date().toISOString(), weight: parseFloat(weight), notes: notes.trim() }
    saveEntries([e, ...entries])
    setWeight(''); setNotes(''); setAdding(false)
  }

  const latest = entries[0]
  const prev = entries[1]
  const diff = latest && prev ? latest.weight - prev.weight : null
  const goalNum = parseFloat(goal)
  const toGoal = latest && goalNum ? latest.weight - goalNum : null
  const heightM = parseFloat(height) / (unit === 'kg' ? 100 : 39.37)
  const bmi = latest && heightM > 0 ? (unit === 'kg' ? latest.weight / (heightM * heightM) : latest.weight * 0.453592 / (heightM * heightM)) : null

  function bmiLabel(b: number) {
    if (b < 18.5) return { label: 'Underweight', color: '#f59e0b' }
    if (b < 25) return { label: 'Normal', color: '#22c55e' }
    if (b < 30) return { label: 'Overweight', color: '#f97316' }
    return { label: 'Obese', color: '#ef4444' }
  }

  const chartEntries = entries.slice(0, 20).reverse()
  const minW = chartEntries.length ? Math.min(...chartEntries.map(e => e.weight)) - 2 : 0
  const maxW = chartEntries.length ? Math.max(...chartEntries.map(e => e.weight)) + 2 : 100

  return (
    <div style={{ background: '#030711', minHeight: '100vh', fontFamily: 'Inter,sans-serif', color: '#fff', padding: '1.5rem' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Scale size={26} style={{ color: ACCENT }} />
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>Weight Tracker</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowSettings(!showSettings)} style={{ background: '#0f1c3a', border: 'none', borderRadius: 10, padding: '0.5rem 0.8rem', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>⚙</button>
            <button onClick={() => setAdding(true)} style={{ background: ACCENT, border: 'none', borderRadius: 12, padding: '0.6rem 1.2rem', color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={16} /> Log</button>
          </div>
        </div>

        {showSettings && (
          <div style={{ background: '#0f1c3a', borderRadius: 14, padding: '1.2rem', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 4 }}>Unit</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['kg', 'lbs'] as const).map(u => <button key={u} onClick={() => setUnit(u)} style={{ flex: 1, background: unit === u ? ACCENT : '#1e3a6e', border: 'none', borderRadius: 8, padding: '0.5rem', color: unit === u ? '#000' : '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>{u}</button>)}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 4 }}>Height ({unit === 'kg' ? 'cm' : 'in'})</label>
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder={unit === 'kg' ? '175' : '69'} style={{ width: '100%', background: '#1e3a6e', border: 'none', borderRadius: 8, padding: '0.5rem', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 4 }}>Goal ({unit})</label>
                <input type="number" value={goal} onChange={e => setGoal(e.target.value)} placeholder={unit === 'kg' ? '70' : '154'} style={{ width: '100%', background: '#1e3a6e', border: 'none', borderRadius: 8, padding: '0.5rem', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            </div>
            <button onClick={() => { saveSettings(); setShowSettings(false) }} style={{ background: ACCENT, border: 'none', borderRadius: 8, padding: '0.5rem 1rem', color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Save Settings</button>
          </div>
        )}

        {latest && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            <div style={{ background: '#0f1c3a', borderRadius: 16, padding: '1.2rem', textAlign: 'center' }}>
              <p style={{ color: ACCENT, fontSize: 28, fontWeight: 900 }}>{latest.weight}</p>
              <p style={{ color: '#64748b', fontSize: 12 }}>{unit}</p>
            </div>
            <div style={{ background: '#0f1c3a', borderRadius: 16, padding: '1.2rem', textAlign: 'center' }}>
              {diff !== null ? (
                <>
                  <p style={{ color: diff < 0 ? '#22c55e' : diff > 0 ? '#ef4444' : '#64748b', fontSize: 22, fontWeight: 800 }}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}</p>
                  <p style={{ color: '#64748b', fontSize: 12 }}>vs last</p>
                </>
              ) : <p style={{ color: '#475569', fontSize: 14 }}>—</p>}
            </div>
            <div style={{ background: '#0f1c3a', borderRadius: 16, padding: '1.2rem', textAlign: 'center' }}>
              {bmi ? (() => { const b = bmiLabel(bmi); return (<><p style={{ color: b.color, fontSize: 22, fontWeight: 800 }}>{bmi.toFixed(1)}</p><p style={{ color: '#64748b', fontSize: 11 }}>BMI · {b.label}</p></>) })() : goalNum && toGoal !== null ? (<><p style={{ color: toGoal < 0 ? '#22c55e' : '#f59e0b', fontSize: 22, fontWeight: 800 }}>{toGoal > 0 ? '-' : '+'}{Math.abs(toGoal).toFixed(1)}</p><p style={{ color: '#64748b', fontSize: 12 }}>to goal</p></>) : <p style={{ color: '#475569', fontSize: 13 }}>—</p>}
            </div>
          </div>
        )}

        {chartEntries.length > 1 && (
          <div style={{ background: '#0f1c3a', borderRadius: 16, padding: '1.2rem', marginBottom: 16 }}>
            <h3 style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>Progress (last {chartEntries.length} entries)</h3>
            <svg width="100%" height="80" viewBox={'0 0 ' + chartEntries.length * 30 + ' 80'}>
              <polyline fill="none" stroke={ACCENT} strokeWidth="2"
                points={chartEntries.map((e, i) => `${i * 30 + 15},${80 - ((e.weight - minW) / (maxW - minW)) * 70}`).join(' ')} />
              {chartEntries.map((e, i) => (
                <circle key={i} cx={i * 30 + 15} cy={80 - ((e.weight - minW) / (maxW - minW)) * 70} r="3" fill={ACCENT} />
              ))}
            </svg>
          </div>
        )}

        {adding && (
          <div style={{ background: '#0f1c3a', borderRadius: 14, padding: '1.2rem', marginBottom: 16, border: '1px solid #1e3a6e' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 4 }}>Weight ({unit})</label>
                <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder={unit === 'kg' ? '70.5' : '155'} style={{ width: '100%', background: '#030711', border: '1px solid #1e3a6e', borderRadius: 8, padding: '0.7rem', color: '#fff', fontSize: 20, fontWeight: 700, textAlign: 'center', boxSizing: 'border-box' }} />
              </div>
            </div>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes..." style={{ width: '100%', background: '#030711', border: '1px solid #1e3a6e', borderRadius: 8, padding: '0.6rem', color: '#fff', fontSize: 13, marginBottom: 10, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={addEntry} style={{ background: ACCENT, border: 'none', borderRadius: 10, padding: '0.6rem 1.2rem', color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Save</button>
              <button onClick={() => setAdding(false)} style={{ background: '#1e3a6e', border: 'none', borderRadius: 10, padding: '0.6rem 1.2rem', color: '#888', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#1e3a6e' }}>
            <Scale size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ color: '#334155' }}>No entries yet. Start tracking!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {entries.slice(0, 30).map(e => (
              <div key={e.id} style={{ background: '#0f1c3a', borderRadius: 10, padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1e3a6e' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 16, color: ACCENT }}>{e.weight} {unit}</span>
                  {e.notes && <span style={{ color: '#64748b', fontSize: 13, marginLeft: 8 }}>{e.notes}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#475569', fontSize: 12 }}>{new Date(e.date).toLocaleDateString()}</span>
                  <button onClick={() => saveEntries(entries.filter(x => x.id !== e.id))} style={{ background: 'transparent', border: 'none', color: '#1e3a6e', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
