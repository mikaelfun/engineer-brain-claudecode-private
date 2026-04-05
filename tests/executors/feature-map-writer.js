#!/usr/bin/env node
// tests/executors/feature-map-writer.js — Feature Map Writer
//
// Maintains tests/feature-map.json — the Issue x Test x Result association layer.
// Atomic writes: write to .tmp then rename.
//
// Actions:
//   update-freshness  --issue ISS-192 --freshness fresh --title "..." --issue-status done --anchors '[...]'
//   update-test        --issue ISS-192 --ac "Copy button copies HTML" --test-id iss-192-copy --fix-level L2
//   update-result      --test-id iss-192-copy --result pass
//   mark-stale         --test-id iss-192-copy
//   recalc-coverage    (recalculate coverage for all features)

const fs = require('fs');
const path = require('path');

// --- Paths ---
const FEATURE_MAP_PATH = path.resolve(__dirname, '..', 'feature-map.json');

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

// --- Feature Map I/O ---
function readMap() {
  if (!fs.existsSync(FEATURE_MAP_PATH)) {
    return { version: 1, lastUpdated: null, features: {}, summary: { totalFeatures: 0, fresh: 0, stale: 0, unknown: 0, overallCoverage: '0%' } };
  }
  return JSON.parse(fs.readFileSync(FEATURE_MAP_PATH, 'utf8'));
}

function writeMap(map) {
  map.lastUpdated = new Date().toISOString();
  const tmpPath = FEATURE_MAP_PATH + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(map, null, 2) + '\n', 'utf8');
  fs.renameSync(tmpPath, FEATURE_MAP_PATH);
}

// --- Recalc helpers ---
function calcFeatureCoverage(feature) {
  const criteria = feature.criteria || [];
  if (criteria.length === 0) return '0%';
  const passed = criteria.filter(c => c.lastResult === 'pass' && c.testStatus === 'active').length;
  return Math.round((passed / criteria.length) * 100) + '%';
}

function recalcSummary(map) {
  const features = Object.values(map.features);
  const summary = {
    totalFeatures: features.length,
    fresh: features.filter(f => f.freshness === 'fresh').length,
    stale: features.filter(f => f.freshness === 'stale').length,
    unknown: features.filter(f => f.freshness !== 'fresh' && f.freshness !== 'stale').length,
    overallCoverage: '0%',
  };

  if (features.length > 0) {
    let totalCriteria = 0;
    let totalPassed = 0;
    for (const f of features) {
      const criteria = f.criteria || [];
      totalCriteria += criteria.length;
      totalPassed += criteria.filter(c => c.lastResult === 'pass' && c.testStatus === 'active').length;
    }
    summary.overallCoverage = totalCriteria === 0 ? '0%' : Math.round((totalPassed / totalCriteria) * 100) + '%';
  }

  map.summary = summary;
}

// --- Actions ---

function updateFreshness(args, map) {
  const issue = args.issue;
  if (!issue) { console.error('ERROR: --issue required'); process.exit(1); }
  if (!args.freshness) { console.error('ERROR: --freshness required'); process.exit(1); }

  if (!map.features[issue]) {
    map.features[issue] = {
      title: args.title || issue,
      issueStatus: args['issue-status'] || 'unknown',
      freshness: args.freshness,
      codeAnchors: [],
      criteria: [],
      coverage: '0%',
    };
  }

  const feat = map.features[issue];
  feat.freshness = args.freshness;
  if (args.title) feat.title = args.title;
  if (args['issue-status']) feat.issueStatus = args['issue-status'];

  if (args.anchors) {
    try {
      feat.codeAnchors = JSON.parse(args.anchors);
    } catch (e) {
      console.error('ERROR: --anchors must be valid JSON array:', e.message);
      process.exit(1);
    }
  }

  feat.coverage = calcFeatureCoverage(feat);
  recalcSummary(map);
  writeMap(map);
  console.log(`OK: ${issue} freshness=${args.freshness}, anchors=${(feat.codeAnchors || []).length}`);
}

function updateTest(args, map) {
  const issue = args.issue;
  const testId = args['test-id'];
  const ac = args.ac;
  if (!issue) { console.error('ERROR: --issue required'); process.exit(1); }
  if (!testId) { console.error('ERROR: --test-id required'); process.exit(1); }
  if (!ac) { console.error('ERROR: --ac required'); process.exit(1); }

  if (!map.features[issue]) {
    console.error(`ERROR: Feature ${issue} not found. Run update-freshness first.`);
    process.exit(1);
  }

  const feat = map.features[issue];
  const existing = feat.criteria.find(c => c.testId === testId);

  if (existing) {
    existing.ac = ac;
    existing.fixLevel = args['fix-level'] || existing.fixLevel || 'L2';
    existing.testStatus = 'active';
    console.log(`OK: Updated existing criterion testId=${testId} in ${issue}`);
  } else {
    feat.criteria.push({
      ac,
      testId,
      testStatus: 'active',
      lastResult: 'untested',
      lastRun: null,
      fixLevel: args['fix-level'] || 'L2',
    });
    console.log(`OK: Added criterion testId=${testId} to ${issue}`);
  }

  feat.coverage = calcFeatureCoverage(feat);
  recalcSummary(map);
  writeMap(map);
}

function updateResult(args, map) {
  const testId = args['test-id'];
  const result = args.result;
  if (!testId) { console.error('ERROR: --test-id required'); process.exit(1); }
  if (!result) { console.error('ERROR: --result required (pass|fail|error|skip)'); process.exit(1); }

  let found = false;
  for (const [issueId, feat] of Object.entries(map.features)) {
    const criterion = (feat.criteria || []).find(c => c.testId === testId);
    if (criterion) {
      criterion.lastResult = result;
      criterion.lastRun = new Date().toISOString();
      feat.coverage = calcFeatureCoverage(feat);
      found = true;
      console.log(`OK: ${issueId}/${testId} result=${result}`);
      break;
    }
  }

  if (!found) {
    console.error(`ERROR: testId=${testId} not found in any feature`);
    process.exit(1);
  }

  recalcSummary(map);
  writeMap(map);
}

function markStale(args, map) {
  const testId = args['test-id'];
  if (!testId) { console.error('ERROR: --test-id required'); process.exit(1); }

  let found = false;
  for (const [issueId, feat] of Object.entries(map.features)) {
    const criterion = (feat.criteria || []).find(c => c.testId === testId);
    if (criterion) {
      criterion.testStatus = 'stale';
      feat.coverage = calcFeatureCoverage(feat);
      found = true;
      console.log(`OK: ${issueId}/${testId} marked stale`);
      break;
    }
  }

  if (!found) {
    console.error(`ERROR: testId=${testId} not found in any feature`);
    process.exit(1);
  }

  recalcSummary(map);
  writeMap(map);
}

function recalcCoverage(args, map) {
  for (const feat of Object.values(map.features)) {
    feat.coverage = calcFeatureCoverage(feat);
  }
  recalcSummary(map);
  writeMap(map);
  console.log(`OK: Recalculated coverage for ${Object.keys(map.features).length} features. Overall: ${map.summary.overallCoverage}`);
}

// --- Main ---
function main() {
  const args = parseArgs(process.argv);
  const action = args.action;

  if (!action) {
    console.error('Usage: node feature-map-writer.js --action <action> [options]');
    console.error('Actions: update-freshness, update-test, update-result, mark-stale, recalc-coverage');
    process.exit(1);
  }

  const map = readMap();

  switch (action) {
    case 'update-freshness': updateFreshness(args, map); break;
    case 'update-test':      updateTest(args, map); break;
    case 'update-result':    updateResult(args, map); break;
    case 'mark-stale':       markStale(args, map); break;
    case 'recalc-coverage':  recalcCoverage(args, map); break;
    default:
      console.error(`ERROR: Unknown action "${action}"`);
      process.exit(1);
  }
}

main();
