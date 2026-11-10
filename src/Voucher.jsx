import React from 'react'

const fmt = (n) =>
  n === '' || n == null || isNaN(Number(n))
    ? ''
    : Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Amount input: shows 1,234.00 when not focused, raw number while typing.
function Money({ value, onChange, className = '' }) {
  const [focus, setFocus] = React.useState(false)
  return (
    <input
      className={`fld money ${className}`}
      inputMode="decimal"
      value={focus ? value : fmt(value)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
    />
  )
}

export const blankVoucher = () => ({
  runDate: '',
  payee: '',
  tin: '',
  address: '',
  dueDate: '',
  paymentFor: '',
  lines: [{ desc: '', amount: '' }],
  checkNo: '',
  checkDate: '',
})

export const totalOf = (v) => v.lines.reduce((t, l) => t + (parseFloat(l.amount) || 0), 0)

function Voucher({ no, data, set, cfg, branch }) {
  if (no == null) return <div className="voucher empty" />
  const v = data || blankVoucher()
  const up = (k) => (e) => set(no, { ...v, [k]: e.target.value })
  const setLine = (i, patch) =>
    set(no, { ...v, lines: v.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) })
  const total = totalOf(v)

  return (
    <div className="voucher">
      <div className={`v-head${branch.logoPos === 'left' ? ' has-left' : ''}`}>
        {branch.logo && (
          <img src={`logos/${branch.logo}`} className={`logo${branch.logoPos === 'left' ? ' left' : ''}`} alt="" decoding="async" />
        )}
        {branch.title && (
          <div className="brand" style={{ fontFamily: branch.titleFont, fontSize: branch.titleSize, color: branch.titleTextColor }}>{branch.title}</div>
        )}
        <div className="addr">{cfg.address}</div>
        <div className="addr2">{cfg.phone}</div>
        {branch.showTin && <div className="tinline">TIN: {cfg.tin}</div>}
        <div className="title" style={{ color: cfg.titleColor }}>CHECK VOUCHER</div>
        <div className="numblock">
          <div className="row"><span className="lbl">No.</span><b className="vno">{no}</b></div>
          <div className="row"><span className="lbl">Run Date:</span><input className="fld ul" value={v.runDate} onChange={up('runDate')} /></div>
        </div>
      </div>

      <div className="v-form">
        <span className="lbl">Name of Payee:</span>
        <input className="fld ul span2" value={v.payee} onChange={up('payee')} />
        <span className="lbl right">TIN:</span>
        <input className="fld ul" value={v.tin} onChange={up('tin')} />
        <span className="lbl">Address:</span>
        <input className="fld ul span2" value={v.address} onChange={up('address')} />
        <span /><span />
        <span className="lbl">Due Date:</span>
        <input className="fld ul span2" value={v.dueDate} onChange={up('dueDate')} />
      </div>

      <div className="v-table">
        <div className="th"><span>PARTICULAR</span><span>AMOUNT</span></div>
        <div className="tb">
          <div className="tb-left">
            <div className={`payfor${branch.payLine ? ' payline' : ''}`}>
              <span className="lbl">Payment for:</span>
              <input className="fld" value={v.paymentFor} onChange={up('paymentFor')} />
            </div>
            <div className="lines">
              {v.lines.map((l, i) => (
                <div className="line" key={i}>
                  <input className="fld" placeholder="description" value={l.desc} onChange={(e) => setLine(i, { desc: e.target.value })} />
                  <Money value={l.amount} onChange={(a) => setLine(i, { amount: a })} />
                  <button
                    className="rm noprint"
                    title="remove line"
                    onClick={() => set(no, { ...v, lines: v.lines.length > 1 ? v.lines.filter((_, j) => j !== i) : v.lines })}
                  >×</button>
                </div>
              ))}
              <button className="add noprint" onClick={() => set(no, { ...v, lines: [...v.lines, { desc: '', amount: '' }] })}>+ line</button>
            </div>
            <div className="cash">CASH</div>
          </div>
          <div className="tb-right">{total ? fmt(total) : ''}</div>
        </div>
        <div className="credit">
          <span>Cash in Bank (Credit)</span>
          <span className="credit-amt">{total ? fmt(total) : ''}</span>
        </div>
      </div>

      <div className="v-foot">
        <div className="foot-left">
          <div className="sig">
            <div>
              <div className="lbl">Prepared by:</div>
              <div className="name ul">{cfg.preparedBy}</div>
              <div className="role">{cfg.preparedRole}</div>
            </div>
            <div className="mid">
              <div className="lbl">Checked by:</div>
              <div className="name">{cfg.checkedBy}</div>
              <div className="role">{cfg.checkedRole}</div>
            </div>
          </div>
          <div className="lbl">Approved by:</div>
          <div className="approve">
            <div className="name">{cfg.approvedBy}</div>
            <div className="role center">{cfg.approvedRole}</div>
          </div>
        </div>
        <div className="foot-right">
          <div className="frow"><span className="lbl">Check Number:</span><input className="fld" value={v.checkNo} onChange={up('checkNo')} /></div>
          <div className="frow ul"><span className="lbl">Bank:</span><input className="fld" value={v.bank ?? cfg.bank} onChange={up('bank')} /></div>
          <div className="frow ul"><span className="lbl">Date:</span><input className="fld" value={v.checkDate} onChange={up('checkDate')} /></div>
          <div className="lbl recv">Received by:</div>
          <div className="sigline">______________________________________</div>
          <div className="sigcap">Signature over Printed Name &amp; Date</div>
        </div>
      </div>
    </div>
  )
}

// memo: typing in one voucher no longer re-renders the other vouchers
export default React.memo(Voucher)