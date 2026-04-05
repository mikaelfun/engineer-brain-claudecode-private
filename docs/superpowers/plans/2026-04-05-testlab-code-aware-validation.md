# TestLab Code-Aware Validation + Feature Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让 TestLab 感知代码演进，通过鲜活度检查过滤过时测试，通过 VALIDATE 阶段防止错误修复，通过 Feature Map 关联 Issue×Test×Result。

**Architecture:** 在现有 SCAN→GENERATE→TEST→FIX→VERIFY 流水线中：(1) SCAN 加鲜活度检查过滤 stale Issue；(2) TEST 和 FIX 之间插入 VALIDATE 阶段做三层过滤；(3) FIX 加分级门禁 L1/L2/L3；(4) Feature Map 作为关联层贯穿所有阶段。

**Tech Stack:** Node.js (executors), Bash (shell wrappers), TypeScript (dashboard API + UI), React (frontend)

---

### Task 1: 存量清零与初始化

**Files:**
- Archive: `tests/registry/` → `tests/registry-archive-20260405/`
- Create: `tests/registry/{arch,backend-api,observability,ui-interaction,ui-visual,unit-test,workflow-e2e,_stale}/`
- Create: `tests/feature-map.json`

- [ ] **Step 1: 归档现有 registry**

```bash
mv tests/registry tests/registry-archive-20260405
```

- [ ] **Step 2: 重建空目录结构**

```bash
mkdir -p tests/registry/{arch,backend-api,observability,ui-interaction,ui-visual,unit-test,workflow-e2e,_stale}
```

- [ ] **Step 3: 重置 state 文件**

```bash
echo '{}' | bash tests/executors/state-writer.sh --target pipeline --overwrite
echo '{}' | bash tests/executors/state-writer.sh --target queues --overwrite
echo '{}' | bash tests/executors/state-writer.sh --target stats --overwrite
```

- [ ] **Step 4: 初始化空 feature-map**

```bash
cat > tests/feature-map.json << 'EOF'
{
  "version": 1,
  "lastUpdated": null,
  "features": {},
  "summary": {
    "totalFeatures": 0,
    "fresh": 0,
    "stale": 0,
    "unknown": 0,
    "overallCoverage": "0%"
  }
}
EOF
```

- [ ] **Step 5: 验证**

```bash
ls tests/registry/
# Expected: arch backend-api _stale observability ui-interaction ui-visual unit-test workflow-e2e
ls tests/registry-archive-20260405/ | head -5
# Expected: 原有目录（arch, backend-api, ...）
cat tests/feature-map.json | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).version))"
# Expected: 1
```

- [ ] **Step 6: Commit**

```bash
git add tests/registry tests/feature-map.json
git commit -m "feat(testlab): archive old registry, init clean state + feature-map"
```

---

### Task 2: Freshness Checker 模块

**Files:**
- Create: `tests/executors/freshness-checker.js`

- [ ] **Step 1: 创建 freshness-checker.js**

```javascript
#!/usr/bin/env node
// tests/executors/freshness-checker.js — Code Anchor Freshness Checker
//
// Extracts code anchors from Issue JSON and verifies they still exist.
// Usage: node freshness-checker.js --issue ISS-192
//        or require('./freshness-checker.js').checkFreshness(issueJson, projectRoot)
//
// Output: { freshness: 'fresh'|'stale'|'unknown', anchors: [...], reason: string }

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function extractAnchors(issueJson, projectRoot) {
  const anchors = [];
  const desc = (issueJson.description || '') + ' ' + (issueJson.title || '');

  // 1. File paths from "涉及文件" section
  const fileSection = desc.match(/涉及文件[\s\S]*?(?=\n##|\n\n\n|$)/i);
  if (fileSection) {
    const filePaths = fileSection[0].match(/[\w\-./]+\.\w{1,4}/g) || [];
    for (const fp of filePaths) {
      if (fp.includes('/') || fp.endsWith('.ts') || fp.endsWith('.tsx') || fp.endsWith('.sh') || fp.endsWith('.js')) {
        anchors.push({ type: 'file', path: fp, exists: fs.existsSync(path.join(projectRoot, fp)) });
      }
    }
  }

  // 2. API endpoints: /api/xxx
  const apiMatches = desc.match(/\/api\/[\w/:.-]+/g) || [];
  for (const api of apiMatches) {
    const routesDir = path.join(projectRoot, 'dashboard', 'src', 'routes');
    let exists = false;
    try {
      const routePattern = api.replace(/:\w+/g, ':[^/]+').replace(/\//g, '\\/');
      const output = execSync(
        `grep -rl "${api.replace(/:\w+/g, ':')}" "${routesDir}" 2>/dev/null || true`,
        { encoding: 'utf8', timeout: 5000 }
      ).trim();
      exists = output.length > 0;
    } catch { exists = false; }
    anchors.push({ type: 'route', path: api, exists });
  }

  // 3. Component files: *.tsx references
  const tsxMatches = desc.match(/[\w-]+\.tsx/g) || [];
  for (const tsx of tsxMatches) {
    const searchDirs = ['dashboard/web/src', 'dashboard/src'];
    let found = false;
    for (const dir of searchDirs) {
      try {
        const output = execSync(
          `find "${path.join(projectRoot, dir)}" -name "${tsx}" 2>/dev/null || true`,
          { encoding: 'utf8', timeout: 5000 }
        ).trim();
        if (output) { found = true; break; }
      } catch {}
    }
    anchors.push({ type: 'file', path: tsx, exists: found });
  }

  // 4. Shell scripts: *.sh references
  const shMatches = desc.match(/[\w-]+\.sh/g) || [];
  for (const sh of shMatches) {
    const searchPaths = [
      path.join(projectRoot, 'tests', 'executors', sh),
      path.join(projectRoot, 'skills', sh),
    ];
    const found = searchPaths.some(p => fs.existsSync(p));
    anchors.push({ type: 'file', path: sh, exists: found });
  }

  // Deduplicate by path
  const seen = new Set();
  return anchors.filter(a => {
    if (seen.has(a.path)) return false;
    seen.add(a.path);
    return true;
  });
}

function checkFreshness(issueJson, projectRoot) {
  const anchors = extractAnchors(issueJson, projectRoot);

  if (anchors.length === 0) {
    return { freshness: 'unknown', anchors, reason: 'no code anchors found in issue' };
  }

  const total = anchors.length;
  const missing = anchors.filter(a => !a.exists);
  const missingRatio = missing.length / total;

  // Check updatedAt age
  const updatedAt = issueJson.updatedAt ? new Date(issueJson.updatedAt) : null;
  const ageMs = updatedAt ? Date.now() - updatedAt.getTime() : Infinity;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (missingRatio >= 0.5) {
    const missingPaths = missing.map(a => a.path).join(', ');
    return { freshness: 'stale', anchors, reason: `${missing.length}/${total} anchors missing: ${missingPaths}` };
  }

  if (missing.length > 0 && ageDays > 30) {
    const missingPaths = missing.map(a => a.path).join(', ');
    return { freshness: 'stale', anchors, reason: `${missing.length}/${total} anchors missing + issue >30d old: ${missingPaths}` };
  }

  if (missing.length === 0) {
    return { freshness: 'fresh', anchors, reason: `${total}/${total} anchors verified` };
  }

  return { freshness: 'unknown', anchors, reason: `${missing.length}/${total} anchors missing but <50%` };
}

// CLI mode
if (require.main === module) {
  const args = process.argv.slice(2);
  const issueFlag = args.indexOf('--issue');
  if (issueFlag === -1 || !args[issueFlag + 1]) {
    console.error('Usage: node freshness-checker.js --issue ISS-192');
    process.exit(1);
  }
  const issueId = args[issueFlag + 1];
  const projectRoot = path.resolve(__dirname, '../..');
  const issuePath = path.join(projectRoot, 'issues', `${issueId}.json`);

  if (!fs.existsSync(issuePath)) {
    console.error(`Issue not found: ${issuePath}`);
    process.exit(1);
  }

  const issueJson = JSON.parse(fs.readFileSync(issuePath, 'utf8'));
  const result = checkFreshness(issueJson, projectRoot);
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { checkFreshness, extractAnchors };
```

- [ ] **Step 2: 验证 CLI**

```bash
node tests/executors/freshness-checker.js --issue ISS-192
# Expected: { "freshness": "fresh"|"stale"|"unknown", "anchors": [...], "reason": "..." }
```

- [ ] **Step 3: Commit**

```bash
git add tests/executors/freshness-checker.js
git commit -m "feat(testlab): add freshness-checker module for code anchor validation"
```

---

### Task 3: issue-scanner.sh 集成鲜活度检查

**Files:**
- Modify: `tests/executors/issue-scanner.sh`

- [ ] **Step 1: 在 Node.js 内联代码顶部 require freshness-checker**

在 `node -e '...'` 内联脚本的顶部（`const fs = require` 之后），插入：

```javascript
// --- Freshness Checker Integration ---
const { checkFreshness } = require(
  require('path').resolve(__dirname || '.', 'tests/executors/freshness-checker.js')
);
let staleCount = 0;
```

> 注意：issue-scanner.sh 用 `node -e` 执行内联 JS，`__dirname` 不可用，需用 `process.cwd()` 或通过 shell 变量传入项目根路径。实际插入代码应为：

```javascript
const projectRoot = process.cwd();
const { checkFreshness } = require(
  require('path').join(projectRoot, 'tests', 'executors', 'freshness-checker.js')
);
let staleCount = 0;
```

- [ ] **Step 2: 在 case 'done' 和 case 'tracked' 分支中，extractACs 之前调用 checkFreshness**

在每个分支中，读取 issue JSON 后、调用 `extractACs` 之前，插入：

```javascript
// Freshness gate
const freshnessResult = checkFreshness(issueJson, projectRoot);
if (freshnessResult.freshness === 'stale') {
  console.log(`ISSUE_STALE|${id}|${freshnessResult.reason}`);
  staleCount++;
  break;
}
if (freshnessResult.freshness === 'fresh') {
  console.log(`ISSUE_FRESH|${id}|${freshnessResult.anchors.length} anchors verified`);
}
// freshness === 'unknown' → 正常继续（向下兼容）
```

- [ ] **Step 3: 修改最终 summary 行，增加 stale 计数**

找到输出 summary 的 `console.log` 行（通常类似 `SCAN_SUMMARY|...`），修改为：

```javascript
console.log(`SCAN_SUMMARY|total=${issues.length}|scanned=${scannedCount}|skipped=${skipCount}|stale=${staleCount}|acs=${totalACs}`);
```

- [ ] **Step 4: 验证**

```bash
bash tests/executors/issue-scanner.sh
# Expected output 应包含:
#   ISSUE_STALE|ISS-xxx|reason...    （如果有 stale issue）
#   ISSUE_FRESH|ISS-xxx|N anchors verified   （如果有 fresh issue）
#   SCAN_SUMMARY|...|stale=N|...
```

- [ ] **Step 5: Commit**

```bash
git add tests/executors/issue-scanner.sh
git commit -m "feat(testlab): integrate freshness check into issue-scanner"
```

---

### Task 4: spec-scanner.js 集成鲜活度检查

**Files:**
- Modify: `tests/executors/spec-scanner.js`

- [ ] **Step 1: 在 spec-scanner.js 顶部引入 fs 和 path（如尚未引入）**

```javascript
const fs = require('fs');
const path = require('path');
```

- [ ] **Step 2: 在 track 循环中，读取 spec.md 后提取引用文件路径并检查存在性**

在遍历 tracks 的循环内，读取 `spec.md` 内容后，插入以下代码：

```javascript
// --- Spec Freshness Check ---
function extractSpecFileRefs(specContent) {
  const refs = [];
  // Match file paths like `src/xxx.ts`, `dashboard/web/src/xxx.tsx`, `tests/executors/xxx.sh`
  const patterns = [
    /[`"]([a-zA-Z][\w\-./]*\.\w{1,4})[`"]/g,           // quoted/backtick paths
    /(?:^|\s)((?:src|dashboard|tests|skills)\/[\w\-./]+\.\w{1,4})/gm,  // bare paths starting with known dirs
  ];
  for (const pat of patterns) {
    let m;
    while ((m = pat.exec(specContent)) !== null) {
      const fp = m[1];
      if (fp.includes('/') && !fp.startsWith('http')) {
        refs.push(fp);
      }
    }
  }
  return [...new Set(refs)];
}

const specContent = fs.readFileSync(specPath, 'utf8');
const fileRefs = extractSpecFileRefs(specContent);

if (fileRefs.length > 0) {
  const missing = fileRefs.filter(fp => !fs.existsSync(path.join(projectRoot, fp)));
  const missingRatio = missing.length / fileRefs.length;

  if (missingRatio >= 0.5) {
    const reason = `${missing.length}/${fileRefs.length} referenced files missing: ${missing.slice(0, 5).join(', ')}`;
    console.log(`SPEC_STALE|${trackId}|${reason}`);
    staleSpecs++;
    continue; // skip this track
  }
}
```

- [ ] **Step 3: 在循环外初始化计数器并输出 summary**

循环前添加：

```javascript
let staleSpecs = 0;
```

在最终 summary 输出中增加 `stale=${staleSpecs}`。

- [ ] **Step 4: 验证**

```bash
node tests/executors/spec-scanner.js
# Expected output 应包含:
#   SPEC_STALE|{trackId}|reason...     （如果有 stale spec）
#   正常 track 仍然继续 gap 检查
#   最终 summary 包含 stale 计数
```

- [ ] **Step 5: Commit**

```bash
git add tests/executors/spec-scanner.js
git commit -m "feat(testlab): integrate spec freshness check into spec-scanner"
```

---

### Task 5: Feature Map Writer

**Files:**
- Create: `tests/executors/feature-map-writer.js`
- Create: `tests/executors/feature-map-writer.sh`（shell wrapper）

- [ ] **Step 1: 创建 feature-map-writer.js**

```javascript
#!/usr/bin/env node
// tests/executors/feature-map-writer.js — Feature Map atomic writer
//
// Actions:
//   update-freshness --issue ISS-192 --freshness fresh --anchors '[...]'
//   update-test --issue ISS-192 --ac "Copy button..." --test-id iss-192-copy --fix-level L2
//   update-result --test-id iss-192-copy --result pass
//   mark-stale --test-id iss-192-copy
//   recalc-coverage
//
// Atomic write: writes .tmp then renames to feature-map.json

const fs = require('fs');
const path = require('path');

const MAP_PATH = path.resolve(__dirname, '..', 'feature-map.json');
const TMP_PATH = MAP_PATH + '.tmp';

function loadMap() {
  if (!fs.existsSync(MAP_PATH)) {
    return {
      version: 1,
      lastUpdated: null,
      features: {},
      summary: { totalFeatures: 0, fresh: 0, stale: 0, unknown: 0, overallCoverage: '0%' }
    };
  }
  return JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
}

function saveMap(map) {
  map.lastUpdated = new Date().toISOString();
  const json = JSON.stringify(map, null, 2) + '\n';
  fs.writeFileSync(TMP_PATH, json, 'utf8');
  fs.renameSync(TMP_PATH, MAP_PATH);
}

function ensureFeature(map, issueId) {
  if (!map.features[issueId]) {
    map.features[issueId] = {
      issueId,
      freshness: 'unknown',
      anchors: [],
      tests: {},
      updatedAt: new Date().toISOString()
    };
  }
  return map.features[issueId];
}

// --- Actions ---

function updateFreshness(map, { issue, freshness, anchors }) {
  const feat = ensureFeature(map, issue);
  feat.freshness = freshness;
  feat.anchors = anchors ? JSON.parse(anchors) : feat.anchors;
  feat.updatedAt = new Date().toISOString();
  console.log(`FRESHNESS_UPDATED|${issue}|${freshness}`);
}

function updateTest(map, { issue, ac, testId, fixLevel }) {
  const feat = ensureFeature(map, issue);
  feat.tests[testId] = {
    ac,
    testId,
    fixLevel: fixLevel || 'L1',
    result: null,
    stale: false,
    lastRun: null,
    createdAt: new Date().toISOString()
  };
  console.log(`TEST_REGISTERED|${testId}|${issue}|${fixLevel || 'L1'}`);
}

function updateResult(map, { testId, result }) {
  for (const feat of Object.values(map.features)) {
    if (feat.tests[testId]) {
      feat.tests[testId].result = result;
      feat.tests[testId].lastRun = new Date().toISOString();
      feat.tests[testId].stale = false;
      console.log(`RESULT_UPDATED|${testId}|${result}`);
      return;
    }
  }
  console.error(`TEST_NOT_FOUND|${testId}`);
  process.exit(1);
}

function markStale(map, { testId }) {
  for (const feat of Object.values(map.features)) {
    if (feat.tests[testId]) {
      feat.tests[testId].stale = true;
      console.log(`TEST_MARKED_STALE|${testId}`);
      return;
    }
  }
  console.error(`TEST_NOT_FOUND|${testId}`);
  process.exit(1);
}

function recalcCoverage(map) {
  let totalFeatures = 0, fresh = 0, stale = 0, unknown = 0;
  let totalTests = 0, passingTests = 0;

  for (const feat of Object.values(map.features)) {
    totalFeatures++;
    if (feat.freshness === 'fresh') fresh++;
    else if (feat.freshness === 'stale') stale++;
    else unknown++;

    for (const t of Object.values(feat.tests)) {
      if (!t.stale) {
        totalTests++;
        if (t.result === 'pass') passingTests++;
      }
    }
  }

  const coverage = totalTests > 0 ? Math.round((passingTests / totalTests) * 100) + '%' : '0%';
  map.summary = { totalFeatures, fresh, stale, unknown, overallCoverage: coverage };
  console.log(`COVERAGE_RECALCULATED|features=${totalFeatures}|fresh=${fresh}|stale=${stale}|unknown=${unknown}|coverage=${coverage}`);
}

// --- CLI ---

const args = process.argv.slice(2);
const action = args[0];

function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

if (!action) {
  console.error('Usage: node feature-map-writer.js <action> [--options]');
  console.error('Actions: update-freshness, update-test, update-result, mark-stale, recalc-coverage');
  process.exit(1);
}

const map = loadMap();

switch (action) {
  case 'update-freshness':
    updateFreshness(map, { issue: getArg('issue'), freshness: getArg('freshness'), anchors: getArg('anchors') });
    break;
  case 'update-test':
    updateTest(map, { issue: getArg('issue'), ac: getArg('ac'), testId: getArg('test-id'), fixLevel: getArg('fix-level') });
    break;
  case 'update-result':
    updateResult(map, { testId: getArg('test-id'), result: getArg('result') });
    break;
  case 'mark-stale':
    markStale(map, { testId: getArg('test-id') });
    break;
  case 'recalc-coverage':
    recalcCoverage(map);
    break;
  default:
    console.error(`Unknown action: ${action}`);
    process.exit(1);
}

saveMap(map);
```

- [ ] **Step 2: 创建 shell wrapper**

```bash
#!/usr/bin/env bash
# tests/executors/feature-map-writer.sh — Shell wrapper for feature-map-writer.js
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/feature-map-writer.js" "$@"
```

- [ ] **Step 3: 验证 update-freshness**

```bash
node tests/executors/feature-map-writer.js update-freshness \
  --issue ISS-192 --freshness fresh \
  --anchors '[{"type":"file","path":"dashboard/web/src/App.tsx","exists":true}]'
# Expected: FRESHNESS_UPDATED|ISS-192|fresh
cat tests/feature-map.json | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).features['ISS-192'].freshness))"
# Expected: fresh
```

- [ ] **Step 4: 验证 update-test**

```bash
node tests/executors/feature-map-writer.js update-test \
  --issue ISS-192 --ac "Copy button copies to clipboard" \
  --test-id iss-192-copy --fix-level L2
# Expected: TEST_REGISTERED|iss-192-copy|ISS-192|L2
```

- [ ] **Step 5: 验证 update-result**

```bash
node tests/executors/feature-map-writer.js update-result \
  --test-id iss-192-copy --result pass
# Expected: RESULT_UPDATED|iss-192-copy|pass
```

- [ ] **Step 6: 验证 mark-stale**

```bash
node tests/executors/feature-map-writer.js mark-stale --test-id iss-192-copy
# Expected: TEST_MARKED_STALE|iss-192-copy
```

- [ ] **Step 7: 验证 recalc-coverage**

```bash
node tests/executors/feature-map-writer.js recalc-coverage
# Expected: COVERAGE_RECALCULATED|features=1|fresh=1|stale=0|unknown=0|coverage=0%
#   （因为 iss-192-copy 已被 mark-stale，不计入 coverage）
```

- [ ] **Step 8: 重置 feature-map 为初始状态（清理验证数据）**

```json
{
  "version": 1,
  "lastUpdated": null,
  "features": {},
  "summary": {
    "totalFeatures": 0,
    "fresh": 0,
    "stale": 0,
    "unknown": 0,
    "overallCoverage": "0%"
  }
}
```

- [ ] **Step 9: Commit**

```bash
git add tests/executors/feature-map-writer.js tests/executors/feature-map-writer.sh
git commit -m "feat(testlab): add feature-map-writer with atomic write + shell wrapper"
```


---

### Task 6: VALIDATE Phase (New)

**Files:**
- Create: `tests/executors/validate-runner.js`
- Create: `.claude/skills/stage-worker/phases/VALIDATE.md`
- Modify: `.claude/skills/stage-worker/phases/state-update.md`

- [ ] **Step 1: Create validate-runner.js** -- Three-layer filter: Layer 1 static anchor check (fs.existsSync on file/endpoint/selector refs in test YAML), Layer 2 failure-mode classification (404->stale, element not found->stale, assertion mismatch->needs_review, ECONNREFUSED->env_issue, SyntaxError->framework), Layer 3 output LLM prompt for needs_review items. CLI: node validate-runner.js --test-id xxx --category yyy --fail-reason zzz. Output JSON: {verdict, layer, reason}.

- [ ] **Step 2: Create VALIDATE.md** -- Stage file between TEST and FIX. Start timer, snapshot fixQueue, loop each item: run validate-runner.js, process verdict (stale->mv to _stale/ + feature-map mark-stale, env_issue->retryQueue, framework->fixQueue L1, needs_review->LLM review, redesign->issue-creator.sh, fix->keep in fixQueue). After loop: fixQueue non-empty->FIX, empty->cycle++ SCAN.

- [ ] **Step 3: Modify state-update.md** -- Add VALIDATE to stages reset: {SCAN,GENERATE,TEST,VALIDATE,FIX,VERIFY} all pending.

- [ ] **Step 4: Modify SKILL.md** -- Add VALIDATE to state machine diagram and Stage File Index table.

- [ ] **Step 5: Verify**
Run: node tests/executors/validate-runner.js --test-id test-123 --category backend-api --fail-reason "404 Not Found"
Expected: {"verdict":"stale","layer":2}

- [ ] **Step 6: Commit**
git add tests/executors/validate-runner.js .claude/skills/stage-worker/phases/VALIDATE.md
git commit -m "feat(testlab): add VALIDATE phase with 3-layer freshness filter"

---

### Task 7: FIX Level Gating

**Files:**
- Modify: `.claude/skills/stage-worker/phases/FIX.md`

- [ ] **Step 1: Add fix level determination** -- After fix-analyzer returns, before agent spawn, classify by involved file paths: ALL under tests/ -> L1 (auto-fix), ANY under dashboard/web/src/ and NONE under backend/skills/.claude -> L2 (fix <=30 lines/file), ANY under dashboard/src/routes/ or skills/ or .claude/ -> L3 (report only). Default: L2.

- [ ] **Step 2: Inject permission constraints into agent prompt** -- L1: free to modify tests/. L2: tests/ free, dashboard/web/src/ <=30 lines, backend/skills/.claude forbidden (if bug there, write report + create Issue, return fixType=report_only). L3: no code modification allowed, only write report + create Issue.

- [ ] **Step 3: Add report_only fixType handling** -- report_only does NOT enter verifyQueue. Record stageHistory {action:report_only, issueCreated:ISS-XXX}. Update feature-map. Remove from fixQueue.

- [ ] **Step 4: Commit**
git add .claude/skills/stage-worker/phases/FIX.md
git commit -m "feat(testlab): add L1/L2/L3 fix level gating to FIX phase"

---

### Task 8: Dashboard Feature Map Panel

**Files:**
- Modify: `dashboard/src/services/test-reader.ts`
- Modify: `dashboard/src/routes/test-supervisor.ts`
- Modify: `dashboard/web/src/pages/TestLab.tsx`

- [ ] **Step 1: Add readFeatureMap() to test-reader.ts** -- FeatureMap and FeatureMapEntry interfaces. Read tests/feature-map.json, parse JSON, return typed object.

- [ ] **Step 2: Add GET /api/tests/feature-map route** -- In test-supervisor.ts, import readFeatureMap, add route returning feature map JSON or 404.

- [ ] **Step 3: Add FeatureMapPanel component to TestLab.tsx** -- Table: Feature | Freshness | Tests | Coverage. Freshness color coding: fresh=green, stale=red, unknown=yellow. Click to expand AC details per feature. Fetch from /api/tests/feature-map.

- [ ] **Step 4: Verify API**
Run: curl http://localhost:3010/api/tests/feature-map
Expected: {"version":1,"features":{},"summary":{...}}

- [ ] **Step 5: Commit**
git add dashboard/src/services/test-reader.ts dashboard/src/routes/test-supervisor.ts dashboard/web/src/pages/TestLab.tsx
git commit -m "feat(testlab): add Feature Map API endpoint and dashboard panel"
