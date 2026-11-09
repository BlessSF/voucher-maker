import React, { useEffect, useMemo, useState } from 'react'
import Voucher, { blankVoucher } from './Voucher.jsx'
import { impose } from './imposition.js'

const PAPERS = {
  'Long bond (8.5 x 13 in)': { w: 8.5, h: 13 },
  'Letter (8.5 x 11 in)': { w: 8.5, h: 11 },
  'A4 (8.27 x 11.69 in)': { w: 8.27, h: 11.69 },
}

const DEFAULTS = {
  start: 401,
  end: 420,
  paper: 'Long bond (8.5 x 13 in)',
  address: 'DONATO PISON AVE., SAN RAFAEL , MANDURRIAO ILOILO CITY',
  phone: '(003)5035367/09053455422',
  tin: '',
  bank: 'SECURITY BANK',
  preparedBy: 'MARY JOY R. TESING',
  preparedRole: 'ACCOUNTING STAFF',
  checkedBy: 'CLARIBEL MOQUETE',
  checkedRole: 'FINANCE',
  approvedBy: 'MARIE DOMINIQUE G. PERFECTO',
  approvedRole: 'GENERAL MANAGER',
}

const load = (k, d) => {
  try { return { ...d, ...JSON.parse(localStorage.getItem(k)) } } catch { return d }
}

export default function App() {
  const [cfg, setCfg] = useState(() => load('vm.cfg', DEFAULTS))
  const [data, setData] = useState(() => load('vm.data', {}))
  const [bulk, setBulk] = useState({ payee: '', paymentFor: '', amount: '' })

  useEffect(() => localStorage.setItem('vm.cfg', JSON.stringify(cfg)), [cfg])
  useEffect(() => localStorage.setItem('vm.data', JSON.stringify(data)), [data])

  const sheets = useMemo(() => impose(cfg.start, cfg.end), [cfg.start, cfg.end])
  const paper = PAPERS[cfg.paper] || PAPERS['Long bond (8.5 x 13 in)']
  const setV = (no, v) => setData((d) => ({ ...d, [no]: v }))
  const field = (k, props = {}) => (
    <input value={cfg[k]} onChange={(e) => setCfg({ ...cfg, [k]: e.target.value })} {...props} />
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
    setData(next)
  }

  const count = cfg.end >= cfg.start ? cfg.end - cfg.start + 1 : 0

  return (
    <>
      <style>{`@page { size: ${paper.w}in ${paper.h}in; margin: 0 }
        .page { width: ${paper.w}in; height: ${paper.h}in }`}</style>

      <aside className="panel noprint">
        <h1>Check Voucher Maker</h1>
        <p className="sub">Demic Atria · 2 per sheet · cut-and-stack order</p>

        <div className="grid2">
          <label>From No.{field('start', { type: 'number' })}</label>
          <label>To No.{field('end', { type: 'number' })}</label>
        </div>
        <p className="hint">
          {count} vouchers → {sheets.length} sheets. Cut the stack in half: top pile {cfg.start}–{cfg.start + sheets.length - 1}, bottom pile {cfg.start + sheets.length}–{cfg.end}.
        </p>

        <label>Paper
          <select value={cfg.paper} onChange={(e) => setCfg({ ...cfg, paper: e.target.value })}>
            {Object.keys(PAPERS).map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>

        <h2>Fill all vouchers</h2>
        <label>Payee<input value={bulk.payee} onChange={(e) => setBulk({ ...bulk, payee: e.target.value })} /></label>
        <label>Payment for<input value={bulk.paymentFor} onChange={(e) => setBulk({ ...bulk, paymentFor: e.target.value })} /></label>
        <label>Amount<input value={bulk.amount} inputMode="decimal" onChange={(e) => setBulk({ ...bulk, amount: e.target.value.replace(/[^0-9.]/g, '') })} /></label>
        <button onClick={fillAll}>Apply to all</button>
        <p className="hint">You can still edit any single voucher directly on the page.</p>

        <h2>Header &amp; signatories</h2>
        <label>Address{field('address')}</label>
        <label>Phone{field('phone')}</label>
        <label>TIN{field('tin')}</label>
        <label>Bank (default){field('bank')}</label>
        <label>Prepared by{field('preparedBy')}</label>
        <label>Checked by{field('checkedBy')}</label>
        <label>Approved by{field('approvedBy')}</label>

        <div className="btns">
          <button className="primary" onClick={() => window.print()}>Print</button>
          <button onClick={() => { if (confirm('Clear all typed voucher data?')) setData({}) }}>Clear data</button>
        </div>
      </aside>

      <main className="sheets">
        {sheets.map((s, i) => (
          <section className="page" key={s.top}>
            <div className="sheet-label noprint">Sheet {i + 1} of {sheets.length}</div>
            <Voucher no={s.top} data={data[s.top]} set={setV} cfg={cfg} />
            <div className="cutline"><span>✂ cut here</span></div>
            <Voucher no={s.bottom} data={data[s.bottom]} set={setV} cfg={cfg} />
          </section>
        ))}
      </main>
    </>
  )
}