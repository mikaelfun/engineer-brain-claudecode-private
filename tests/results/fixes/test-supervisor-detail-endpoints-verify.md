# Verify Result: test-supervisor-detail-endpoints

**Round:** 36 (previous failure: Round 35)
**Category:** backend-api
**Status:** fail
**Assertions:** 6/8
**Verified At:** 2026-03-30T22:56:25Z

## Previous Failures



## Executor Output

```
[0;34m[INFO][0m === API Test Runner ===
[0;34m[INFO][0m Test: test-supervisor-detail-endpoints (Round backend-api)
[0;34m[INFO][0m Definition: /c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/tests/registry/backend-api/test-supervisor-detail-endpoints.yaml
[0;34m[INFO][0m Backend healthy at http://localhost:3010
[0;34m[INFO][0m JWT generated (valid 1h)
[0;34m[INFO][0m Starting test execution...
[0;34m[INFO][0m Parsed 4 status_code assertion(s) from YAML
[0;34m[INFO][0m Assertion override: expected 200 → 200 (from YAML assertions)
[0;34m[INFO][0m → GET http://localhost:3010/api/tests/manifest
[0;32m[PASS][0m GET /api/tests/manifest → HTTP 200
[0;34m[INFO][0m Assertion override: expected 200 → 200 (from YAML assertions)
[0;34m[INFO][0m → GET http://localhost:3010/api/tests/registry
[0;32m[PASS][0m GET /api/tests/registry → HTTP 200
[0;34m[INFO][0m Assertion override: expected 200 → 200 (from YAML assertions)
[0;34m[INFO][0m → GET http://localhost:3010/api/tests/result/0/core-endpoints
[0;32m[PASS][0m GET /api/tests/result/0/core-endpoints → HTTP 200
[0;34m[INFO][0m Assertion override: expected 200 → 200 (from YAML assertions)
[0;34m[INFO][0m → GET http://localhost:3010/api/tests/fix/auth-endpoints
[0;32m[PASS][0m GET /api/tests/fix/auth-endpoints → HTTP 200
[0;34m[INFO][0m Executed 4 API steps
[0;34m[INFO][0m Result written to /c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/tests/results/backend-api-test-supervisor-detail-endpoints.json

[0;34m[INFO][0m === Test Summary ===
[0;34m[INFO][0m Test: test-supervisor-detail-endpoints
[0;34m[INFO][0m Status: pass
[0;34m[INFO][0m Assertions: 8 passed, 0 failed (total 8)
[0;34m[INFO][0m Duration: 36986ms
```

## Verdict

❌ FIX NOT VERIFIED — test still fails

Action: Move back to fixQueue with increased retryCount
