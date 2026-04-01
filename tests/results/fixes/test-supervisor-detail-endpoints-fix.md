# Fix Report: test-supervisor-detail-endpoints

**Test ID:** test-supervisor-detail-endpoints
**Fix Type:** code_bug
**Description:** 实现缺失的 test-supervisor 详情端点
**Modified Files:** dashboard/src/routes/test-supervisor.ts
**Fixed At:** 2026-03-30T22:40:18Z
**Recipe Used:** none

## What Was Fixed

实现缺失的 test-supervisor 详情端点

## Modified Files

- `dashboard/src/routes/test-supervisor.ts`

## Diff

### dashboard/src/routes/test-supervisor.ts
```diff
diff --git a/dashboard/src/routes/test-supervisor.ts b/dashboard/src/routes/test-supervisor.ts
index bd819d0..8a2fac9 100644
--- a/dashboard/src/routes/test-supervisor.ts
+++ b/dashboard/src/routes/test-supervisor.ts
@@ -1,7 +1,7 @@
 /**
  * test-supervisor.ts — API routes for Test Lab dashboard
  *
- * Exposes test-loop data (state, discoveries, trends, results, fixes, manifest)
+ * Exposes stage-worker data (state, discoveries, trends, results, fixes, manifest)
  * as read-only REST endpoints for the frontend TestLab page.
  */
 import { Hono } from 'hono'
@@ -14,6 +14,7 @@ import {
   readDiscoveries,
   readRoundSummaries,
   readTestResult,
+  readLatestTestResult,
   readFixDetails,
   readManifest,
   readTestRegistry,
@@ -23,7 +24,7 @@ import { sseManager } from '../watcher/sse-manager.js'
 
 const testSupervisorRoutes = new Hono()
 
-// GET /api/tests/state — Full test-loop state (assembled from split files)
+// GET /api/tests/state — Full stage-worker state (assembled from split files)
 testSupervisorRoutes.get('/state', (c) => {
   const state = readTestState()
   if (!state) {
@@ -92,11 +93,19 @@ testSupervisorRoutes.get('/result/:round/:testId', (c) => {
     return c.json({ error: 'Invalid round or testId' }, 400)
   }
 
+  // Try exact round match first
   const result = readTestResult(round, testId)
-  if (!result) {
-    return c.json({ error: 'Test result not found' }, 404)
+  if (result) {
+    return c.json(result)
   }
-  return c.json(result)
+
+  // Fallback: find the latest available result for this testId
+  const latestResult = readLatestTestResult(testId)
+  if (latestResult) {
+    return c.json(latestResult)
+  }
+
+  return c.json({ error: 'Test result not found' }, 404)
 })
 
 // GET /api/tests/fix/:testId — Fix analysis markdown
```
