import assert from 'node:assert/strict'
import { impose } from './imposition.js'

const a = impose(401, 420)
assert.equal(a.length, 10)
assert.deepEqual(a[0], { top: 401, bottom: 411 })
assert.deepEqual(a[9], { top: 410, bottom: 420 })
// after cutting: top pile then bottom pile must be 401..420 in order
const flat = [...a.map((s) => s.top), ...a.map((s) => s.bottom)]
assert.deepEqual(flat, Array.from({ length: 20 }, (_, i) => 401 + i))

const b = impose(401, 419) // odd
assert.equal(b.length, 10)
assert.deepEqual(b[9], { top: 410, bottom: null })
assert.deepEqual(impose(5, 5), [{ top: 5, bottom: null }])
assert.deepEqual(impose(10, 5), [])
console.log('imposition tests passed')
