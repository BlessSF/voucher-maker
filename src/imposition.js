// "Cut-and-stack" imposition: 2 vouchers per sheet (top / bottom).
// Cut the printed stack in half and the TOP pile reads start..start+half-1
// and the BOTTOM pile reads start+half..end, both already in order.
//
// 401-420  ->  sheet 1: 401 / 411, sheet 2: 402 / 412 ... sheet 10: 410 / 420
// Odd counts leave the last bottom slot blank (null).
export function impose(start, end) {
  const s = Math.floor(Number(start))
  const e = Math.floor(Number(end))
  if (!Number.isFinite(s) || !Number.isFinite(e) || e < s) return []
  const total = e - s + 1
  const half = Math.ceil(total / 2)
  const sheets = []
  for (let k = 0; k < half; k++) {
    const top = s + k
    const bottomNo = s + half + k
    sheets.push({ top, bottom: bottomNo <= e ? bottomNo : null })
  }
  return sheets
}
