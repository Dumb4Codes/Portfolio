#!/bin/sh
# CMS_SPEC check: adding a project in the admin needs no code change.
# Adds a dummy project file (exactly what the admin would write), builds, verifies, then removes it.
cd "$(dirname "$0")/.."
F=content/projects/zz-dummy-check.yaml
cat > $F <<'EOF'
title: ZZ Dummy Check
kind: personal
featured: false
order: 90
year: 2026
role: Test
tagline: A throwaway entry used to prove the admin flow.
summary: Not a real project.
stack:
  - React 19
  - Playwright
  - Brand New Tech
liveUrl: https://example.com
repoUrl: https://github.com/example/zz
metrics:
  - value: "42"
    label: answers
EOF
sh scripts/rebuild.sh
echo "case study page : $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3100/work/zz-dummy-check)"
echo "sitemap has it  : $(curl -s http://localhost:3100/sitemap.xml | grep -c 'zz-dummy-check')"
echo "archive row     : $(curl -s http://localhost:3100/ | grep -c 'data-preview=\"zz-dummy-check\"')"
echo "work index      : $(curl -s http://localhost:3100/work | grep -c 'ZZ Dummy Check')"
echo "palette payload : $(curl -s http://localhost:3100/ | grep -c 'ZZ Dummy Check')"
echo "stack count (React 19 should now include it): $(curl -s http://localhost:3100/ | grep -o 'zz-dummy-check' | wc -l) mentions on home"
rm -f $F
echo "removed $F; rebuilding clean"
sh scripts/rebuild.sh
echo "after removal, case page: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3100/work/zz-dummy-check)"
