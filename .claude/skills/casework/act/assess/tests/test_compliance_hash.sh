#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../scripts/compliance-hash.sh"

# Test 1: determinism — same content → same hash (real-case format).
h1=$(bash "$SCRIPT" "$HERE/fixtures/case-info-real-premier.md")
h2=$(bash "$SCRIPT" "$HERE/fixtures/case-info-real-premier.md")
[ "$h1" = "$h2" ] || { echo "FAIL: determinism"; exit 1; }

# Test 2: different Service Level (Premier vs ProDirect) → different hash.
h3=$(bash "$SCRIPT" "$HERE/fixtures/case-info-real-prodirect.md")
[ "$h1" != "$h3" ] || { echo "FAIL: collision on different Service Level"; exit 1; }

# Test 3: 8-char hex format.
[[ "$h1" =~ ^[0-9a-f]{8}$ ]] || { echo "FAIL: format got '$h1'"; exit 1; }

# Test 4 (T2.9.1 regression): real case-info.md from production must produce non-empty hex.
# Previously grep for '| Entitlement |' row returned nothing because prod uses
# '## Entitlement' heading with '| Service Level |' subfield.
REAL="../../../../../data/cases/active/2604140040001804/case-info.md"
if [ -f "$HERE/$REAL" ]; then
  h_real=$(bash "$SCRIPT" "$HERE/$REAL")
  [[ "$h_real" =~ ^[0-9a-f]{8}$ ]] || { echo "FAIL: prod case-info hash invalid got '$h_real'"; exit 1; }
  # Additionally: must differ from empty-string hash (prod case actually has fields).
  EMPTY_HASH=$(printf '%s|%s' '' '' | sha256sum | cut -c1-8)
  [ "$h_real" != "$EMPTY_HASH" ] || { echo "FAIL: prod case-info yielded empty-string hash (field extraction broken)"; exit 1; }
fi

echo "OK: all compliance-hash tests pass"
