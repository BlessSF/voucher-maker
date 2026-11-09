import React, { useEffect, useMemo, useState } from 'react'
import Voucher, { blankVoucher } from './Voucher.jsx'
import { impose } from './imposition.js'
import { BRANCHES } from './branches.js'

const PAPERS = {
  'Long bond (8.5 x 13 in)': { w: 8.5, h: 13 },
  'Letter (8.5 x 11 in)': { w: 8.5, h: 11 },
  'A4 (8.27 x 11.69 in)': { w: 8.27, h: 11.69 },
}

const load = (k, d) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d }
}

export default function App() {
  const [branchId, setBranchId] = useState(() => load('vm2.branch', BRANCHES[0].id))
  const [paper, setPaper] = useState(() => load('vm2.paper', Object.keys(PAPERS)[0]))
  // per-branch saved stuff: { [id]: { cfg: {...edited header fields}, range: {start,end}, data: {no: voucher} } }
  const [store, setStore] = useState(() => load('vm2.store', {}))
  const [bulk, setBulk] = useState({ payee: '', paymentFor: '', amount: '' })

  useEffect(() => localStorage.setItem('vm2.branch', JSON.stringify(branchId)), [branchId])
  useEffect(() => localStorage.setItem('vm2.paper', JSON.stringify(paper)), [paper])
  useEffect(() => localStorage.setItem('vm2.store', JSON.stringify(store)), [store])

  const branch = BRANCHES.find((b) => b.id === branchId) || BRANCHES[0]
  const saved = store[branch.id] || {}
  const cfg = { ...branch.defaults, ...saved.cfg }
  const range = saved.range || { start: branch.start, end: branch.start + 19 }
  const data = saved.data || {}

  const patch = (p) => setStore((s) => ({ ...s, [branch.id]: { ...s[branch.id], ...p } }))
  const setCfg = (k, v) => patch({ cfg: { ...cfg, [k]: v } })
  const setRange = (k, v) => patch({ range: { ...range, [k]: v === '' ? '' : Number(v) } })
  const setV = (no, v) => patch({ data: { ...data, [no]: v } })

  const sheets = useMemo(() => impose(range.start, range.end), [range.start, range.end])
  const pp = PAPERS[paper] || PAPERS[Object.keys(PAPERS)[0]]
  const text = (k) => (
    <input value={cfg[k] ?? ''} onChange={(e) => setCfg(k, e.target.value)} />
  )

  const fillAll = () => {
    const next = { ...data }
    for (const s of sheets) for (const no of [s.top, s.bottom]) {
      if (no == null) continue
      const cur = next[no] || blankVoucher()
      next[no] = {
        ...cur,
        payee: bulk.payee || cur.payee,
        paymentFor: bulk.paymentFor || cur.paymentFor,
        lines: bulk.amount ? [{ desc: cur.lines[0]?.desc || '', amount: bulk.amount }] : cur.lines,
      }
    }
    patch({ data: next })
  }

  const count = range.end >= range.start ? range.end - range.start + 1 : 0

  return (
    <>
      <style>{`@page { size: ${pp.w}in ${pp.h}in; margin: 0 }
        .page { width: ${pp.w}in; height: ${pp.h}in }`}</style>

      <aside className="panel noprint">
        <h1>Check Voucher Maker</h1>
        <label>Branch
          <select value={branch.id} onChange={(e) => setBranchId(e.target.value)}>
            {BRANCHES.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </label>

        <div className="grid2">
          <label>From No.<input type="number" value={range.start} onChange={(e) => setRange('start', e.target.value)} /></label>
          <label>To No.<input type="number" value={range.end} onChange={(e) => setRange('end', e.target.value)} /></label>
        </div>
        <p className="hint">
          {count} vouchers → {sheets.length} sheets, 2 per sheet. Cut the stack in half: top pile {range.start}–{range.start + sheets.length - 1}, bottom pile {range.start + sheets.length}–{range.end}.
        </p>

        <label>Paper
          <select value={paper} onChange={(e) => setPaper(e.target.value)}>
            {Object.keys(PAPERS).map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>

        <h2>Fill all vouchers</h2>
        <label>Payee<input value={bulk.payee} onChange={(e) => setBulk({ ...bulk, payee: e.target.value })} /></label>
        <label>Payment for<input value={bulk.paymentFor} onChange={(e) => setBulk({ ...bulk, paymentFor: e.target.value })} /></label>
        <label>Amount<input value={bulk.amount} inputMode="decimal" onChange={(e) => setBulk({ ...bulk, amount: e.target.value.replace(/[^0-9.]/g, '') })} /></label>
        <button onClick={fillAll}>Apply to all</button>
        <p className="hint">You can still edit any single voucher directly on the page.</p>

        <h2>Header &amp; signatories ({branch.label})</h2>
        <label>Address{text('address')}</label>
        <label>Phone{text('phone')}</label>
        {branch.showTin && <label>TIN{text('tin')}</label>}
        <label>Bank (default){text('bank')}</label>
        <label>Prepared by{text('preparedBy')}</label>
        <label>Checked by{text('checkedBy')}</label>
        <label>Approved by{text('approvedBy')}</label>

        <div className="btns">
          <button className="primary" onClick={() => window.print()}>Print</button>
          <button onClick={() => { if (confirm(`Clear all typed voucher data for ${branch.label}?`)) patch({ data: {} }) }}>Clear data</button>
        </div>
      </aside>

      <main className="sheets">
        {sheets.map((s, i) => (
          <section className="page" key={`${branch.id}-${s.top}`}>
            <div className="sheet-label noprint">Sheet {i + 1} of {sheets.length}</div>
            <Voucher no={s.top} data={data[s.top]} set={setV} cfg={cfg} branch={branch} />
            <div className="cutline"><span>✂ cut here</span></div>
            <Voucher no={s.bottom} data={data[s.bottom]} set={setV} cfg={cfg} branch={branch} />
          </section>
        ))}
      </main>
    </>
  )
}