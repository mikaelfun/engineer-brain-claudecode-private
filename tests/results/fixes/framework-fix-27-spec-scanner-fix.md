# Fix Report: framework-fix-27-spec-scanner

**Test ID:** framework-fix-27-spec-scanner
**Fix Type:** framework_fix
**Description:** Replace grep -qiF loop with Node.js batch matcher in spec-scanner.js to fix SIGABRT on Git Bash (MSYS2)
**Modified Files:** tests/executors/spec-scanner.sh tests/executors/spec-scanner.js
**Fixed At:** 2026-03-29T22:23:15Z
**Recipe Used:** none

## What Was Fixed

Replace grep -qiF loop with Node.js batch matcher in spec-scanner.js to fix SIGABRT on Git Bash (MSYS2)

## Modified Files

- `tests/executors/spec-scanner.shtests/executors/spec-scanner.js`

## Diff

No git diff captured (files may not be tracked or no changes)
