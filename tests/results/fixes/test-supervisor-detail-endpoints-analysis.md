# Fix Analysis: test-supervisor-detail-endpoints

**Round:** 36
**Category:** backend-api
**Source:** dashboard/src/routes/test-supervisor.ts
**Failure Type:** endpoint_missing
**Is Env Issue:** false
**Analyzed At:** 2026-03-30T22:33:06Z

## Failed Assertions

- GET /api/tests/result/1/core-endpoints → HTTP 404: expected=200, actual=404 ({'error':'Test result not found'} )
- GET /api/tests/fix/core-endpoints → HTTP 404: expected=200, actual=404 ({'error':'Fix details not found'} )

## Full Result

```json
{
  "testId": "test-supervisor-detail-endpoints",
  "round": 36,
  "timestamp": "2026-03-30T22:20:57.000Z",
  "status": "fail",
  "assertions": [{"name":"GET /api/tests/manifest → HTTP 200","pass":true,"expected":"200","actual":"200","note":"{'version':'1.0.0','lastScan':'2026-03-30T20:59:54.372Z','scanSources':['dashboard/src/routes/*.ts','dashboard/web/src/components/**/*.tsx','.claude/s"},{"name":"GET /api/tests/manifest → JSON response","pass":true,"expected":"JSON","actual":"JSON"},{"name":"GET /api/tests/registry → HTTP 200","pass":true,"expected":"200","actual":"200","note":"{'agents-routes':{'id':'agents-routes','name':'Agents API Routes — List + Cron Jobs + Patrol State','description':'验证 agents 相关 GET 端点�"},{"name":"GET /api/tests/registry → JSON response","pass":true,"expected":"JSON","actual":"JSON"},{"name":"GET /api/tests/result/1/core-endpoints → HTTP 404","pass":false,"expected":"200","actual":"404","note":"{'error':'Test result not found'} "},{"name":"GET /api/tests/result/1/core-endpoints → JSON response","pass":true,"expected":"JSON","actual":"JSON"},{"name":"GET /api/tests/fix/core-endpoints → HTTP 404","pass":false,"expected":"200","actual":"404","note":"{'error':'Fix details not found'} "},{"name":"GET /api/tests/fix/core-endpoints → JSON response","pass":true,"expected":"JSON","actual":"JSON"}],
  "error": "2 of 8 assertions failed",
  "duration_ms": 25742
}
```

## Suggested Fix Approach

1. Check if the endpoint exists in dashboard/src/routes/
2. Verify route registration in server.ts
3. If endpoint was removed, update test definition

## Root Cause Trace

_Not applicable — failure type (endpoint_missing) did not trigger root cause trace._

## Files to Examine

- Test definition: `tests/registry/backend-api/test-supervisor-detail-endpoints.yaml`
- Source: `dashboard/src/routes/test-supervisor.ts`
- Result: `tests/results/36-test-supervisor-detail-endpoints.json`

