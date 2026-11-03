// Run Playwright and print one compact line per failure: node scripts/pw-summary.mjs [playwright args]
import { spawnSync } from 'node:child_process'
const cli = new URL('../node_modules/@playwright/test/cli.js', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const r = spawnSync(process.execPath, [cli, 'test', '--reporter=json', ...process.argv.slice(2)], { encoding: 'utf8', maxBuffer: 1 << 28 })
let json
try {
  json = JSON.parse(r.stdout)
} catch {
  console.log(r.stdout.slice(0, 3000), r.stderr.slice(0, 2000))
  process.exit(1)
}
let pass = 0
let fail = 0
const walk = (suite, trail = []) => {
  for (const s of suite.suites ?? []) walk(s, [...trail, s.title])
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests) {
      const res = t.results.at(-1)
      if (t.status === 'expected' || t.status === 'skipped') {
        pass++
        if (t.status === 'skipped') console.log(`SKIP ${trail.slice(1).join(' > ')} > ${spec.title}`)
        continue
      }
      fail++
      const msg = (res?.error?.message ?? 'unknown').replace(/\u001b\[[0-9;]*m/g, '').split('\n').slice(0, 14).join('\n    ')
      console.log(`FAIL [${t.projectName}] ${trail.slice(1).join(' > ')} > ${spec.title}\n    ${msg}\n`)
    }
  }
}
for (const s of json.suites) walk(s, [s.title])
console.log(`passed ${pass}, failed ${fail}`)
