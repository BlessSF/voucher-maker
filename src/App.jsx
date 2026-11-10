import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
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

// One printed sheet (2 vouchers). Only mounts its contents once it is near the
// screen, so a long range (e.g. 500 vouchers) does not freeze the page.
// Memoised: only the sheet whose voucher changed re-renders while typing.
const Sheet = memo(function Sheet({ index, total, top, bottom, topData, bottomData, set, cfg, branch, forceShow }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(index < 3)
  useEffect(() => {
    const el = ref.current
    if (!el || seen || typeof IntersectionObserver === 'undefined') { if (!seen) setSeen(true); return }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } },
      { rootMargin: '1500px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen])
  return (
    <section className="page" ref={ref}>
      {(seen || forceShow) && (
        <>
          <div className="sheet-label noprint">Sheet {index + 1} of {total}</div>
          <Voucher no={top} data={topData} set={set} cfg={cfg} branch={branch} />
          <div className="cutline"><span>✂ cut here</span></div>
          <Voucher no={bottom} data={bottomData} set={set} cfg={cfg} branch={branch} />
        </>
      )}
    </section>
  )
})

export default function App() {
  const [branchId, setBranchId] = useState(() => load('vm2.branch', BRANCHES[0].id))
  const [paper, setPaper] = useState(() => load('vm2.paper', Object.keys(PAPERS)[0]))
  // per-branch saved stuff: { [id]: { cfg, range: {start,end}, data: {no: voucher} } }
  const [store, setStore] = useState(() => load('vm2.store', {}))
  const [bulk, setBulk] = useState({ payee: '', paymentFor: '', amount: '' })
  const [menu, setMenu] = useState(false)      // settings drawer (small screens)
  const [printAll, setPrintAll] = useState(false)
  const [scale, setScale] = useState(1)
  const mainRef = useRef(null)

  // --- save to the browser (debounced, so typing stays smooth) ---
  const latest = useRef({})
  latest.current = { branchId, paper, store }
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem('vm2.branch', JSON.stringify(branchId))
      localStorage.setItem('vm2.paper', JSON.stringify(paper))
      localStorage.setItem('vm2.store', JSON.stringify(store))
    }, 400)
    return () => clearTimeout(t)
  }, [branchId, paper, store])
  useEffect(() => {
    const flush = () => {
      const { branchId, paper, store } = latest.current
      localStorage.setItem('vm2.branch', JSON.stringify(branchId))
      localStorage.setItem('vm2.paper', JSON.stringify(paper))
      localStorage.setItem('vm2.store', JSON.stringify(store))
    }
    window.addEventListener('pagehide', flush)
    return () => window.removeEventListener('pagehide', flush)
  }, [])

  // --- make sure every sheet is rendered when printing ---
  useEffect(() => {
    const before = () => flushSync(() => setPrintAll(true))
    const after = () => setPrintAll(false)
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => { window.removeEventListener('beforeprint', before); window.removeEventListener('afterprint', after) }
  }, [])

  const branch = BRANCHES.find((b) => b.id === branchId) || BRANCHES[0]
  const saved = store[branch.id] || {}
  const cfg = useMemo(() => ({ ...branch.defaults, ...saved.cfg }), [branch, saved.cfg])
  const range = saved.range || { start: branch.start, end: branch.start + 19 }
  const data = saved.data || {}
  const pp = PAPERS[paper] || PAPERS[Object.keys(PAPERS)[0]]

  // stable updaters (so memoised sheets/vouchers are not re-rendered needlessly)
  const update = useCallback((fn) => setStore((s) => ({ ...s, [branchId]: fn(s[branchId] || {}) })), [branchId])
  const setV = useCallback((no, v) => update((cur) => ({ ...cur, data: { ...(cur.data || {}), [no]: v } })), [update])
  const setCfg = (k, v) => update((cur) => ({ ...cur, cfg: { ...branch.defaults, ...cur.cfg, [k]: v } }))
  const setRange = (k, v) => update((cur) => ({ ...cur, range: { ...range, [k]: v === '' ? '' : Number(v) } }))

  const sheets = useMemo(() => impose(range.start, range.end), [range.start, range.end])

  // --- fit the sheet to the screen width (phones / tablets) ---
  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    const calc = () => setScale(Math.min(1, Math.max(0.3, (el.clientWidth - 24) / (pp.w * 96))))
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pp.w])

  const text = (k) => <input value={cfg[k] ?? ''} onChange={(e) => setCfg(k, e.target.value)} />

  const fillAll = () => update((cur) => {
    const next = { ...(cur.data || {}) }
    for (const s of sheets) for (const no of [s.top, s.bottom]) {
      if (no == null) continue
      const c = next[no] || blankVoucher()
      next[no] = {
        ...c,
        payee: bulk.payee || c.payee,
        paymentFor: bulk.paymentFor || c.paymentFor,
        lines: bulk.amount ? [{ desc: c.lines[0]?.desc || '', amount: bulk.amount }] : c.lines,
      }
    }
    return { ...cur, data: next }
  })

  const doPrint = () => { flushSync(() => setPrintAll(true)); window.print() }
  const count = range.end >= range.start ? range.end - range.start + 1 : 0

  return (
    <>
      <style>{`@page { size: ${pp.w}in ${pp.h}in; margin: 0 }
        .page { width: ${pp.w}in; height: ${pp.h}in }
        @media screen { .page { zoom: ${scale} } }`}</style>

      <header className="topbar noprint">
        <button onClick={() => setMenu(true)} aria-label="Open settings">☰ Settings</button>
        <b>{branch.label}</b>
        <button className="primary" onClick={doPrint}>Print</button>
      </header>
      {menu && <div className="backdrop noprint" onClick={() => setMenu(false)} />}

      <aside className={`panel noprint${menu ? ' open' : ''}`}>
        <div className="panel-head">
          <h1>Check Voucher Maker</h1>
          <button className="close" onClick={() => setMenu(false)} aria-label="Close settings">×</button>
        </div>
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
        <label>CHECK VOUCHER color
          <span className="colorrow">
            <input type="color" value={cfg.titleColor || '#1155cc'} onChange={(e) => setCfg('titleColor', e.target.value)} />
            <button onClick={() => setCfg('titleColor', branch.defaults.titleColor)}>Reset</button>
          </span>
        </label>
        <label>Address{text('address')}</label>
        <label>Phone{text('phone')}</label>
        {branch.showTin && <label>TIN{text('tin')}</label>}
        <label>Bank (default){text('bank')}</label>
        <label>Prepared by{text('preparedBy')}</label>
        <label>Checked by{text('checkedBy')}</label>
        <label>Approved by{text('approvedBy')}</label>

        <div className="btns">
          <button className="primary" onClick={doPrint}>Print</button>
          <button onClick={() => { if (confirm(`Clear all typed voucher data for ${branch.label}?`)) update((cur) => ({ ...cur, data: {} })) }}>Clear data</button>
        </div>
      </aside>

      <main className="sheets" ref={mainRef}>
        {sheets.map((s, i) => (
          <Sheet
            key={`${branch.id}-${s.top}`}
            index={i}
            total={sheets.length}
            top={s.top}
            bottom={s.bottom}
            topData={data[s.top]}
            bottomData={s.bottom == null ? undefined : data[s.bottom]}
            set={setV}
            cfg={cfg}
            branch={branch}
            forceShow={printAll}
          />
        ))}
      </main>
    </>
  )
}