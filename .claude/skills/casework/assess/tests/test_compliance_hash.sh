#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../scripts/compliance-hash.sh"

# Test 1: same content → same hash
h1=$(bash "$SCRIPT" "$HERE/fixtures/case-info-with-premier.md")
h2=$(bash "$SCRIPT" "$HERE/fixtures/case-info-with-premier.md")
[ "$h1" = "$h2" ] || { echo "FAIL: determinism"; exit 1; }

# Test 2: different Entitlement/SAP → different hash
h3=$(bash "$SCRIPT" "$HERE/fixtures/case-info-with-ltsc.md")
[ "$h1" != "$h3" ] || { echo "FAIL: collision on different fields"; exit 1; }

# Test 3: 8-char hex output
[[ "$h1" =~ ^[0-9a-f]{8}$ ]] || { echo "FAIL: format got '$h1'"; exit 1; }

echo "OK: all 3 compliance-hash tests pass"
