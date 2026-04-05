#!/usr/bin/env node
// tests/executors/validate-runner.js — Three-Layer Validation Filter
//
// Determines whether a failed test is worth fixing, stale, or an env issue.
// Inserted between TEST and FIX phases.
//
// CLI: node validate-runner.js --test-id xxx --category yyy --fail-reason "zzz"
//      [--project-root /path]  (defaults to ../../)
//
// Output JSON: { verdict, layer, reason, llmPrompt? }
//
// Verdicts:
//   fix          — real failure, keep in fixQueue
//   stale        — test references dead code/endpoints, archive it
//   env_issue    — environment problem, retry later
//   framework    — test itself has a bug (syntax, structure)
//   needs_review — LLM review required (outputs llmPrompt)

const fs = require('fs');
const path = require('path');

// --- Arg Parsing ---

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (key.startsWith('--')) {
      const name = key.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[name] = next;
        i++;
      } else {
        args[name] = true;
      }
    }
  }
  return args;
}

// --- Helpers (Windows-safe, no shell commands) ---

function findFiles(dir, fileName) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
        results.push(...findFiles(fullPath, fileName));
      } else if (entry.isFile() && entry.name === fileName) {
        results.push(fullPath);
      }
    }
  } catch { /* permission errors */ }
  return results;
}

function grepDir(dir, pattern) {
  if (!fs.existsSync(dir)) return false;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
        if (grepDir(fullPath, pattern)) return true;
      } else if (entry.isFile() && /\.(ts|js|tsx|jsx|sh|yaml|yml)$/.test(entry.name)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes(pattern)) return true;
        } catch { /* skip unreadable files */ }
      }
    }
  } catch { /* permission errors */ }
  return false;
}

// --- Layer 1: Static Anchor Check ---

function extractTestAnchors(testYaml, projectRoot) {
  const anchors = [];
  const content = typeof testYaml === 'string' ? testYaml : JSON.stringify(testYaml);

  // 1. File paths referenced in test YAML
  const filePatterns = content.match(/(?:dashboard|skills|tests|\.claude)\/[\w\-./]+\.\w{1,4}/g) || [];
  for (const fp of filePatterns) {
    anchors.push({ type: 'file', path: fp, exists: fs.existsSync(path.join(projectRoot, fp)) });
  }

  // 2. API endpoints: /api/xxx
  const apiMatches = content.match(/\/api\/[\w/:.\-]+/g) || [];
  for (const api of apiMatches) {
    const routesDir = path.join(projectRoot, 'dashboard', 'src', 'routes');
    const searchTerm = api.replace(/:\w+/g, '').replace(/\/\//g, '/');
    const exists = grepDir(routesDir, searchTerm);
    anchors.push({ type: 'route', path: api, exists });
  }

  // 3. data-testid selectors
  const testIdMatches = content.match(/data-testid[=:]["']?([\w-]+)/g) || [];
  for (const match of testIdMatches) {
    const testId = match.replace(/data-testid[=:]["']?/, '');
    const webSrcDir = path.join(projectRoot, 'dashboard', 'web', 'src');
    const exists = grepDir(webSrcDir, testId);
    anchors.push({ type: 'selector', path: `data-testid="${testId}"`, exists });
  }

  // 4. CSS selectors (class/id based): .class-name, #id-name
  const cssSelectorMatches = content.match(/selector:\s*["']([.#][\w-]+)["']/g) || [];
  for (const match of cssSelectorMatches) {
    const sel = match.replace(/selector:\s*["']/, '').replace(/["']$/, '');
    const searchVal = sel.startsWith('.') ? sel.slice(1) : sel.slice(1); // remove . or #
    const webSrcDir = path.join(projectRoot, 'dashboard', 'web', 'src');
    const exists = grepDir(webSrcDir, searchVal);
    anchors.push({ type: 'selector', path: sel, exists });
  }

  // Deduplicate
  const seen = new Set();
  return anchors.filter(a => {
    const key = `${a.type}:${a.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function runLayer1(testYaml, projectRoot) {
  const anchors = extractTestAnchors(testYaml, projectRoot);

  if (anchors.length === 0) {
    return { pass: true, anchors, detail: 'no anchors to check' };
  }

  const missing = anchors.filter(a => !a.exists);
  const total = anchors.length;

  // Critical anchors missing → stale
  if (missing.length > 0 && missing.length / total >= 0.5) {
    const missingPaths = missing.map(a => a.path).join(', ');
    return {
      pass: false,
      verdict: 'stale',
      anchors,
      detail: `${missing.length}/${total} anchors missing: ${missingPaths}`
    };
  }

  // Any file-type anchor missing → stale (files are critical)
  const missingFiles = missing.filter(a => a.type === 'file');
  if (missingFiles.length > 0) {
    const missingPaths = missingFiles.map(a => a.path).join(', ');
    return {
      pass: false,
      verdict: 'stale',
      anchors,
      detail: `critical file anchors missing: ${missingPaths}`
    };
  }

  return { pass: true, anchors, detail: `${total}/${total} anchors verified` };
}

// --- Layer 2: Failure Mode Classification ---

const FAILURE_PATTERNS = [
  // stale patterns
  { pattern: /404|not found|route not found|cannot find module/i, verdict: 'stale', label: '404/not-found' },
  { pattern: /element not found|no element|selector.*timeout|waiting for selector|locator.*not found/i, verdict: 'stale', label: 'element-not-found' },
  { pattern: /no such file|ENOENT|file not found/i, verdict: 'stale', label: 'file-not-found' },

  // env_issue patterns
  { pattern: /ECONNREFUSED|connection refused/i, verdict: 'env_issue', label: 'connection-refused' },
  { pattern: /ETIMEDOUT|ESOCKETTIMEDOUT|request timeout|net::ERR_CONNECTION/i, verdict: 'env_issue', label: 'timeout' },
  { pattern: /ECONNRESET|socket hang up/i, verdict: 'env_issue', label: 'connection-reset' },
  { pattern: /EADDRINUSE|port.*already in use/i, verdict: 'env_issue', label: 'port-in-use' },

  // framework patterns
  { pattern: /SyntaxError|Unexpected token|Parse error/i, verdict: 'framework', label: 'syntax-error' },
  { pattern: /TypeError.*is not a function|TypeError.*undefined/i, verdict: 'framework', label: 'type-error' },
  { pattern: /ReferenceError|is not defined/i, verdict: 'framework', label: 'reference-error' },
  { pattern: /YAMLException|yaml.*error/i, verdict: 'framework', label: 'yaml-error' },

  // needs_review patterns (assertion mismatches — need LLM to judge)
  { pattern: /assert|expect|toBe|toEqual|toMatch|AssertionError|assertion.*fail/i, verdict: 'needs_review', label: 'assertion-mismatch' },
  { pattern: /expected.*but.*received|expected.*to/i, verdict: 'needs_review', label: 'value-mismatch' },
];

function runLayer2(failReason) {
  if (!failReason || failReason.trim() === '') {
    return { verdict: 'needs_review', label: 'empty-fail-reason', detail: 'no fail reason provided' };
  }

  for (const { pattern, verdict, label } of FAILURE_PATTERNS) {
    if (pattern.test(failReason)) {
      return { verdict, label, detail: `matched pattern: ${label}` };
    }
  }

  // No pattern matched → needs review
  return { verdict: 'needs_review', label: 'unclassified', detail: 'no known failure pattern matched' };
}

// --- Layer 3: Generate LLM Prompt (for needs_review items only) ---

function buildLlmPrompt(testId, category, failReason, testYamlContent) {
  return [
    '你是一个测试审查专家。以下测试失败了，请判断这是代码 bug 还是设计变更导致的过时测试。',
    '',
    `## 测试 ID: ${testId}`,
    `## 类别: ${category}`,
    '',
    '## 测试定义:',
    '```yaml',
    testYamlContent || '(not available)',
    '```',
    '',
    '## 失败原因:',
    '```',
    failReason,
    '```',
    '',
    '## 请回答:',
    '1. 测试期望的行为是什么？',
    '2. 实际的错误是什么？',
    '3. 这是代码 bug（verdict: fix）、设计变更导致的过时测试（verdict: stale）、还是需要重新设计测试（verdict: redesign）？',
    '',
    '## 输出格式:',
    'JSON: { "verdict": "fix|stale|redesign", "reason": "一句话解释" }',
  ].join('\n');
}

// --- Main Validation Pipeline ---

function validate({ testId, category, failReason, projectRoot }) {
  projectRoot = projectRoot || path.resolve(__dirname, '../..');

  // Try to read test YAML
  let testYamlContent = null;
  if (testId && category) {
    const yamlPath = path.join(projectRoot, 'tests', 'registry', category, `${testId}.yaml`);
    if (fs.existsSync(yamlPath)) {
      testYamlContent = fs.readFileSync(yamlPath, 'utf8');
    }
  }

  // Layer 1: Static anchor check (only if we have test YAML)
  if (testYamlContent) {
    const l1 = runLayer1(testYamlContent, projectRoot);
    if (!l1.pass) {
      return {
        verdict: l1.verdict,
        layer: 1,
        reason: l1.detail,
        anchors: l1.anchors
      };
    }
  }

  // Layer 2: Failure mode classification
  const l2 = runLayer2(failReason);

  if (l2.verdict !== 'needs_review') {
    return {
      verdict: l2.verdict,
      layer: 2,
      reason: `${l2.label}: ${l2.detail}`
    };
  }

  // Layer 3: Output LLM prompt for needs_review items
  const llmPrompt = buildLlmPrompt(testId, category, failReason, testYamlContent);

  return {
    verdict: 'needs_review',
    layer: 3,
    reason: l2.detail,
    llmPrompt
  };
}

// --- CLI ---

if (require.main === module) {
  const args = parseArgs(process.argv);

  if (!args['test-id']) {
    console.error('Usage: node validate-runner.js --test-id xxx --category yyy --fail-reason "zzz"');
    console.error('       [--project-root /path]');
    process.exit(1);
  }

  const result = validate({
    testId: args['test-id'],
    category: args['category'] || 'unknown',
    failReason: args['fail-reason'] || '',
    projectRoot: args['project-root'] || undefined,
  });

  console.log(JSON.stringify(result, null, 2));
}

module.exports = { validate, runLayer1, runLayer2, buildLlmPrompt, extractTestAnchors };
