#!/bin/sh
# QA helper: stop the server on :3100, rebuild, restart (local admin storage), wait until it answers.
cd "$(dirname "$0")/.."
powershell.exe -NoProfile -Command "Get-NetTCPConnection -LocalPort 3100 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1
rm -rf .next tsconfig.tsbuildinfo
npx next build 2>&1 | grep -E "rror|Compiled|Failed" | head -20
(KEYSTATIC_STORAGE=local npx next start -p 3100 > /tmp/next-start.log 2>&1 &)
for i in 1 2 3 4 5 6 7 8 9 10; do sleep 2; curl -s -o /dev/null http://localhost:3100/ && break; done
echo server up
