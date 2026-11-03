// Compact ESLint summary: node scripts/lint-summary.mjs
import { execSync } from 'node:child_process'
let out = ''
try {
  out = execSync('npx eslint . -f json', { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] })
} catch (e) {
  out = e.stdout
}
const data = JSON.parse(out)
let n = 0
for (const f of data) {
  for (const m of f.messages) {
    n++
    console.log(`${f.filePath.split('portfolio')[1].replace(/\\/g, '/')}:${m.line} [${m.severity === 2 ? 'E' : 'W'}] ${m.ruleId} | ${m.message.split('\n')[0].slice(0, 100)}`)
  }
}
console.log(n ? `${n} problems` : 'clean')
