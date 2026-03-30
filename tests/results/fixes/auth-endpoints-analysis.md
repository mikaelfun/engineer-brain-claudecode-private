# Fix Analysis: auth-endpoints

**Round:** 0
**Category:** backend-api
**Source:** dashboard/src/routes/auth.ts — SCAN gap
**Failure Type:** schema_mismatch
**Is Env Issue:** false
**Analyzed At:** 2026-03-28T08:09:54Z

## Failed Assertions

- GET /api/auth/status → body has needSetup field: expected=needSetup, actual=isSetup (field name mismatch; body: {"isSetup":true}) (API 返回 isSetup 而非 needSetup，可能是 schema 变更)

## Full Result

```json
{
  "testId": "auth-endpoints",
  "round": 0,
  "timestamp": "2026-03-28T03:59:56.467Z",
  "status": "fail",
  "assertions": [
    {
      "name": "GET /api/auth/status → HTTP 200",
      "pass": true,
      "expected": 200,
      "actual": 200
    },
    {
      "name": "GET /api/auth/status → body has needSetup field",
      "pass": false,
      "expected": "needSetup",
      "actual": "isSetup (field name mismatch; body: {\"isSetup\":true})",
      "note": "API 返回 isSetup 而非 needSetup，可能是 schema 变更"
    },
    {
      "name": "POST /api/auth/login → HTTP 200 or 401",
      "pass": true,
      "expected": "200 or 401",
      "actual": 401,
      "detail": "{\"error\":\"Invalid password\"} — password admin123 不正确"
    },
    {
      "name": "GET /api/auth/me → HTTP 200 (conditional on login success)",
      "pass": null,
      "expected": 200,
      "actual": "SKIPPED",
      "note": "login 返回 401，跳过 /me 测试"
    }
  ],
  "error": null,
  "duration_ms": 1240
}
```

## Suggested Fix Approach

1. Read the source file (dashboard/src/routes/auth.ts — SCAN gap) and check the API response shape
2. Update the test definition OR fix the API response to match expected schema
3. If API changed intentionally, update the test assertion

## Files to Examine

- Test definition: `tests/registry/backend-api/auth-endpoints.yaml`
- Source: `dashboard/src/routes/auth.ts — SCAN gap`
- Result: `tests/results/0-auth-endpoints.json`
