#!/usr/bin/env bash
# tests/executors/dashboard-renderer.sh — Deterministic CLI Dashboard
#
# Reads split state files (pipeline.json, queues.json, stats.json, supervisor.json)
# + cycle summaries + discoveries + evolution + directives
# and outputs a formatted one-screen dashboard to stdout.
#
# Usage: bash tests/executors/dashboard-renderer.sh
# Output: Plain text, deterministic (no LLM variance)

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Graceful fallback if pipeline.json doesn't exist
# ============================================================
if [ ! -f "$PIPELINE_FILE" ]; then
  cat << 'EOF'
┌───────────────────────────────────────────────────────────┐
│  🧪 Test Supervisor   C0/0 │ UNKNOWN │ ⚠️ WARNING        │
├───────────────────────────────────────────────────────────┤
│  ⚠️ Attention ────────────────────────────────────────── │
│  🔴 pipeline.json not found — test framework not init    │
│                                                           │
│  📊 0✅ 0❌ 0🔧 0⏭️  │ 0% cov                          │
│  📋 Queues  T:0  F:0  V:0  R:0                           │
└───────────────────────────────────────────────────────────┘
EOF
  exit 0
fi

# ============================================================
# Single Node.js invocation — pass all paths as env vars
# ============================================================
DASHBOARD_OUTPUT=$(
  DB_PIPELINE="$PIPELINE_FILE" \
  DB_QUEUES="$QUEUES_FILE" \
  DB_STATS="$STATS_FILE" \
  DB_SUPERVISOR="$SUPERVISOR_FILE" \
  DB_DIRECTIVES="$TESTS_ROOT/directives.json" \
  DB_DISCOVERIES="$TESTS_ROOT/discoveries.json" \
  DB_EVOLUTION="$TESTS_ROOT/evolution.json" \
  DB_RESULTS="$RESULTS_DIR" \
  DB_TESTS_ROOT="$TESTS_ROOT" \
  NODE_PATH="$DASHBOARD_DIR/node_modules" \
  node -e "
const fs = require('fs');
const path = require('path');

const PIPELINE = process.env.DB_PIPELINE;
const QUEUES = process.env.DB_QUEUES;
const STATS = process.env.DB_STATS;
const SUPERVISOR = process.env.DB_SUPERVISOR;
const DIRECTIVES = process.env.DB_DIRECTIVES;
const DISCOVERIES = process.env.DB_DISCOVERIES;
const EVOLUTION = process.env.DB_EVOLUTION;
const RESULTS = process.env.DB_RESULTS;
const TESTS_ROOT = process.env.DB_TESTS_ROOT;

// ---- Read split state files ----
const pl = JSON.parse(fs.readFileSync(PIPELINE, 'utf8'));
let q = {}; try { q = JSON.parse(fs.readFileSync(QUEUES, 'utf8')); } catch(e) {}
let st = {}; try { st = JSON.parse(fs.readFileSync(STATS, 'utf8')); } catch(e) {}
let sup = {}; try { sup = JSON.parse(fs.readFileSync(SUPERVISOR, 'utf8')); } catch(e) {}

// ---- Core fields (new terminology) ----
const cycle = pl.cycle || 0;
const maxCycles = pl.maxCycles || 80;
const currentStage = pl.currentStage || 'UNKNOWN';
const stages = pl.stages || {};
const currentTest = pl.currentTest || '';
const stageProgress = pl.stageProgress || null;

const cum = st.cumulative || {};
const passed = cum.passed || 0;
const failed = cum.failed || 0;
const fixed = cum.fixed || 0;
const skipped = cum.skipped || 0;

// ---- Queues ----
const testQ = q.testQueue || [];
const fixQ = q.fixQueue || [];
const verifyQ = q.verifyQueue || [];
const regrQ = q.regressionQueue || [];
const skipReg = q.skipRegistry || [];
const getId = x => typeof x === 'string' ? x : (x.testId || '?');
const tqH = testQ.map(getId);
const fqH = fixQ.map(getId);
const vqH = verifyQ.map(getId);
const rqH = regrQ.map(getId);

// ---- Health ----
const now = Date.now();
// Use the most recent stage completedAt as last activity
let lastAct = null;
const STAGE_ORDER = ['SCAN','GENERATE','TEST','FIX','VERIFY'];
for (const sn of STAGE_ORDER) {
  const sg = stages[sn];
  if (sg && sg.completedAt) {
    if (!lastAct || new Date(sg.completedAt) > new Date(lastAct)) lastAct = sg.completedAt;
  }
}
// Fallback: check pipeline.json mtime
try {
  const mt = fs.statSync(PIPELINE).mtime;
  if (!lastAct || mt > new Date(lastAct)) lastAct = mt.toISOString();
} catch(e) {}

const stuckTests = fixQ.filter(t => (t.retryCount || 0) >= 3);
let hasIP = false;
try {
  hasIP = fs.readdirSync(RESULTS).filter(f => f.startsWith('.progress-') && f.endsWith('.json')).length > 0;
} catch(e) {}
if (!hasIP && currentTest) hasIP = true;

// Supervisor-level activity: read authoritative status fields
// Bug fix: don't blindly trust sup.status — check active timestamp for staleness
let runnerActive = false;
const supStep = sup.step || null;
const supStatus = sup.status || 'idle';
const plStatus = pl.pipelineStatus || 'idle';
const supActive = sup.active ? new Date(sup.active).getTime() : 0;
const supStaleMins = supActive > 0 ? Math.round((now - supActive) / 60000) : 999;
// Supervisor claiming "running" but no heartbeat for 30+ min = crashed runner
const supTrulyRunning = supStatus === 'running' && supStaleMins < 30;
if (supTrulyRunning || plStatus === 'running') { runnerActive = true; hasIP = true; }

let staleSince = null;
if (lastAct) {
  const el = now - new Date(lastAct).getTime();
  if (el > 30*60*1000 && !hasIP) staleSince = lastAct;
}

let health = 'HEALTHY';
if (supStatus === 'idle' && plStatus === 'idle' && !hasIP) health = fixQ.length > 0 ? 'PENDING' : 'IDLE';
else if (currentStage === 'IDLE' && !hasIP) health = fixQ.length > 0 ? 'PENDING' : 'IDLE';
else if (staleSince) health = 'STALE';
else if (stuckTests.length > 0) health = 'STUCK';
else if (hasIP) health = 'RUNNING';
else if (fixQ.length > 0) health = 'WARNING';
const hE = {IDLE:'\u2705',HEALTHY:'\u2705',RUNNING:'\ud83c\udfc3',WARNING:'\u26a0\ufe0f',PENDING:'\u26a0\ufe0f',STUCK:'\ud83d\udd12',STALE:'\ud83d\udca4'}[health]||'?';

// ---- Coverage ----
const regDir = path.join(TESTS_ROOT, 'registry');
let regCnt = 0;
try {
  for (const sub of fs.readdirSync(regDir,{withFileTypes:true}).filter(d=>d.isDirectory()))
    regCnt += fs.readdirSync(path.join(regDir,sub.name)).filter(f=>f.endsWith('.yaml')||f.endsWith('.yml')).length;
} catch(e) {}
const total = regCnt || 0;
const passIds = new Set();
try {
  for (const rf of fs.readdirSync(RESULTS).filter(f=>f.endsWith('.json')&&!f.includes('summary')&&!f.startsWith('.'))) {
    try { const r=JSON.parse(fs.readFileSync(path.join(RESULTS,rf),'utf8')); if(r.status==='pass'&&r.testId) passIds.add(r.testId); } catch(e) {}
  }
} catch(e) {}
const covPct = total > 0 ? (passIds.size/total*100).toFixed(1) : '0.0';

// ---- Per-cycle metrics from latest cycle summary ----
// Support both naming: cycle-N-summary.json (new) and round-N-summary.json (legacy)
let greenRate = null, regrRate = null, fixThru = null;
try {
  let sf = path.join(RESULTS, 'cycle-'+cycle+'-summary.json');
  if (!fs.existsSync(sf)) sf = path.join(RESULTS, 'round-'+cycle+'-summary.json');
  if (fs.existsSync(sf)) {
    const summary = JSON.parse(fs.readFileSync(sf, 'utf8'));
    const ss = summary.stats || {};
    greenRate = ss.greenRate !== undefined ? ss.greenRate : null;
    regrRate = ss.regressionRate !== undefined ? ss.regressionRate : null;
    fixThru = ss.fixThroughput !== undefined ? ss.fixThroughput : null;
  }
} catch(e) {}

// ---- Stage pipeline progress ----
const PHASES = ['SCAN','GENERATE','TEST','FIX','VERIFY'];
const pSym = (p,i) => {
  const s = stages[p] ? stages[p].status : 'pending';
  if (p === currentStage && s !== 'done') return '\ud83d\udd36';
  const ci = PHASES.indexOf(currentStage);
  if (ci >= 0 && i > ci) return '\u2b1c';
  if (s === 'done') return '\u2705';
  return '\u2b1c';
};
const fDur = ms => { if(!ms||ms<=0) return '\u2014'; const s=Math.round(ms/1000); if(s<60) return s+'s'; const m=Math.floor(s/60),r=s%60; return r>0?m+'m'+r+'s':m+'m'; };
const pLine = PHASES.map((p,i)=>pSym(p,i)+p).join('\u2501\u2501\u25b6');
const curIdx = PHASES.indexOf(currentStage);
const dLine = PHASES.map((p,i) => {
  const sg = stages[p];
  // Currently running stage: show elapsed time with ~ prefix + progress
  if (p === currentStage && sg && sg.status === 'running' && sg.startedAt) {
    const elapsed = now - new Date(sg.startedAt).getTime();
    let label = '~'+fDur(elapsed);
    if (stageProgress && stageProgress.current && stageProgress.total) label += ' '+stageProgress.current+'/'+stageProgress.total;
    return label.padEnd(10);
  }
  if (!sg || sg.status !== 'done') return '\u2014'.padEnd(5);
  if (i > curIdx && curIdx >= 0) return '\u2014'.padEnd(5);
  return fDur(sg.duration_ms || 0).padEnd(5);
}).join('      ');

// ---- Trend (last 3 cycles) ----
const trend = [];
for (let r=cycle-2; r<=cycle; r++) {
  if (r<1) { trend.push(null); continue; }
  // Try cycle-N first, then round-N (backward compat)
  let sf = path.join(RESULTS, 'cycle-'+r+'-summary.json');
  if (!fs.existsSync(sf)) sf = path.join(RESULTS, 'round-'+r+'-summary.json');
  try { trend.push(JSON.parse(fs.readFileSync(sf,'utf8')).stats||{}); }
  catch(e) {
    if (r===cycle) {
      trend.push({passed:passed,failed:failed,fixed:fixed});
    } else trend.push(null);
  }
}
const arrow = vals => { const v=vals.filter(x=>x!==null); if(v.length<2) return '\u2501'; return v[v.length-1]>v[v.length-2]?'\u25b2':v[v.length-1]<v[v.length-2]?'\u25bc':'\u2501'; };
const pVals = trend.map(t=>t?(t.passed||0):null);
const fVals = trend.map(t=>t?(t.fixed||0):null);
const tStr = (l,v) => l+': '+v.map(x=>x!==null?String(x):'\u2014').join('\u2192')+' '+arrow(v);

// ---- Attention ----
const att = [];
for (const fq of fixQ) { if (fq.category==='framework'&&(fq.priority===1||fq.priority==='1')) att.push('\ud83d\udd34 Framework fix: '+fq.testId); }
if (health==='STUCK') att.push('\ud83d\udd34 Health: stuck ('+stuckTests.length+' test(s) retried 3+ times)');
if (health==='STALE') { const sm=Math.round((now-new Date(staleSince).getTime())/60000); att.push('\ud83d\udfe1 Stale: no activity for '+sm+' min'); }
if (skipReg.length > 0) { att.push('\ud83d\udfe1 '+skipReg.length+' tests in skipRegistry'); }
try {
  const disc=JSON.parse(fs.readFileSync(DISCOVERIES,'utf8'));
  const ds=disc.summary||{};
  const dt=(ds.totalDiscoveries||0), dr=(ds.regressions||0);
  if (dt>0&&dr/dt>0.5) att.push('\ud83d\udfe1 Regressions: '+dr+'/'+dt+' ('+Math.round(dr/dt*100)+'%)');
} catch(e) {}
if (trend.every(t=>t!==null)&&pVals[0]===pVals[1]&&pVals[1]===pVals[2]&&pVals[0]!==null) att.push('\ud83d\udfe1 Coverage flat for 3 cycles');
// Self-heal event
const she = sup.selfHealEvent;
if (she) att.push('\ud83d\udfe0 Self-heal: '+(she.description||she.type||'active'));

// ---- Probes ----
let obs = {total:0,pass:0,fail:0,stale:0};
try {
  const oDir = path.join(TESTS_ROOT,'registry','observability');
  const pIds = [];
  try { for (const of2 of fs.readdirSync(oDir).filter(f=>f.endsWith('.yaml')||f.endsWith('.yml'))) {
    const c=fs.readFileSync(path.join(oDir,of2),'utf8'); const m=c.match(/^id:\\s*(.+)/m);
    pIds.push(m?m[1].trim().replace(/[\"']/g,''):of2.replace(/\\.ya?ml$/,''));
  }} catch(e) {}
  obs.total=pIds.length; let pp=0,pf=0,ps=0;
  for (const pid of pIds) {
    try { const pFiles=fs.readdirSync(RESULTS).filter(f=>f.endsWith('-'+pid+'.json')).sort().reverse();
      if(pFiles.length>0) { const pr=JSON.parse(fs.readFileSync(path.join(RESULTS,pFiles[0]),'utf8')); if(pr.status==='pass') pp++; else pf++; if((cycle-(pr.round||pr.cycle||0))>5) ps++; }
    } catch(e) {}
  }
  obs={total:pIds.length,pass:pp,fail:pf,stale:ps};
  if (ps>0) att.push('\ud83d\udfe1 '+ps+' stale probe(s)');
} catch(e) {}
const attItems = att;

// ---- Directives ----
let pendDir=0, paused=false;
try { const d=JSON.parse(fs.readFileSync(DIRECTIVES,'utf8')); pendDir=(d.directives||[]).filter(x=>x.status==='pending').length; paused=!!d.paused; } catch(e) {}

// ---- Scan Strategy ----
const scanStrat = st.scanStrategy || {};
const recipesUsed = (scanStrat.recipesUsed || []).join(', ') || 'frequency-only';

// ---- Evolution ----
let evoCnt=0, evoLast='\u2014';
try { const e=JSON.parse(fs.readFileSync(EVOLUTION,'utf8')); const ent=e.entries||[]; evoCnt=ent.length; if(ent.length>0) evoLast=ent[ent.length-1].id||'\u2014'; } catch(e) {}

// ---- Render ----
let W=61;

const qS = (l,a,h) => l+':'+a.length+(a.length>0&&h.length?' '+h.join(', '):'');
const qItems = [qS('T',testQ,tqH),qS('F',fixQ,fqH),qS('V',verifyQ,vqH),qS('R',regrQ,rqH)];
for (const ai of attItems) W = Math.max(W, ai.length + 6);
W = Math.min(W, 100);
const ln = s => '\u2502  '+s.padEnd(W-4)+'\u2502';
const O = [];
O.push('\u250c'+'\u2500'.repeat(W-2)+'\u2510');
const hdr = '  \ud83e\uddea Test Supervisor   C'+cycle+'/'+maxCycles+' \u2502 '+currentStage+' \u2502 '+hE+' '+health;
O.push('\u2502'+hdr.padEnd(W-2)+'\u2502');
O.push('\u251c'+'\u2500'.repeat(W-2)+'\u2524');
O.push(ln(''));
// ---- Supervisor reasoning progress ----
if (runnerActive && supStep) {
  const RS = ['observe','diagnose','decide','act','reflect'];
  const RSL = {observe:'Observe',diagnose:'Diagnose',decide:'Decide',act:'Act',reflect:'Reflect'};
  const rsi = RS.indexOf(supStep);
  const rpLine = RS.map((s,i) => {
    const label = RSL[s]||s;
    if (rsi >= 0 && i < rsi) return '\u2705'+label;
    if (i === rsi) return '\ud83d\udd36'+label;
    return '\u2b1c'+label;
  }).join(' \u2192 ');
  const elapsed = Math.round((now - new Date(sup.active).getTime())/1000);
  const eStr = elapsed < 60 ? elapsed+'s' : Math.floor(elapsed/60)+'m'+elapsed%60+'s';
  O.push(ln('\ud83e\udd16 Supervisor  '+eStr));
  O.push(ln(rpLine));
  O.push(ln(''));
} else if (supStatus === 'idle' && sup.reasoning && Object.keys(sup.reasoning).length > 0) {
  // Supervisor completed all steps and is idle — show last reasoning summary
  const lastKey = Object.keys(sup.reasoning).pop();
  const lastVal = sup.reasoning[lastKey] || '';
  const summary = lastVal.length > 60 ? lastVal.substring(0, 57) + '...' : lastVal;
  O.push(ln('\ud83e\udd16 Supervisor  idle \u2502 last: ' + summary));
  O.push(ln(''));
}
O.push(ln(pLine));
O.push(ln(dLine));
if (currentTest) {
  const ctShort = currentTest.length > 45 ? currentTest.slice(0,43)+'..' : currentTest;
  O.push(ln('  \u25b6 '+ctShort));
}
O.push(ln(''));
O.push(ln('\u26a0\ufe0f Attention '+'\u2500'.repeat(Math.max(0,W-18))));
if (attItems.length===0) O.push(ln('\u2705 No issues requiring attention'));
else for (const a of attItems) O.push(ln(a));
O.push(ln(''));
O.push(ln('\ud83d\udcca '+passed+'\u2705 '+failed+'\u274c '+fixed+'\ud83d\udd27 '+skipped+'\u23ed\ufe0f  \u2502 '+covPct+'% cov'));
const grS = greenRate!==null?greenRate+'%':'\u2014';
const rrS = regrRate!==null?regrRate+'%':'\u2014';
const ftS = fixThru!==null?fixThru+'%':'\u2014';
O.push(ln('   GR:'+grS+' Regr:'+rrS+' FixThru:'+ftS));
O.push(ln(''));
const tR=[cycle-2,cycle-1,cycle].map(r=>r<1?'\u2014':'C'+r).join('\u2192');
O.push(ln('\ud83d\udcc8 Trend ('+tR+')'));
O.push(ln(tStr('passed',pVals)+'  '+tStr('fixed',fVals)));
O.push(ln(''));
O.push(ln('\ud83d\udccb Queues'));
const maxQLen = W - 8;
for (const qi of qItems) {
  if (qi.length <= maxQLen) { O.push(ln('  '+qi)); }
  else {
    const prefix = qi.match(/^[TFVR]:\\d+ /);
    const pfx = prefix ? prefix[0] : '';
    const rest = qi.slice(pfx.length);
    const ids = rest.split(', ');
    let line = pfx;
    for (let k = 0; k < ids.length; k++) {
      const add = (line === pfx ? '' : ', ') + ids[k];
      if ((line + add).length > maxQLen && line !== pfx) {
        O.push(ln('  '+line));
        line = '  ' + ids[k];
      } else {
        line += add;
      }
    }
    if (line) O.push(ln('  '+line));
  }
}
O.push(ln(''));
O.push(ln('\ud83d\udd2d Probes: '+obs.pass+'\u2705 '+obs.fail+'\u274c ('+obs.stale+' stale)'));
O.push(ln('\ud83d\udcdd Directives: '+pendDir+' pending'+(paused?' \u2502 \u23f8\ufe0f PAUSED':'')));
O.push(ln('\ud83d\udd0d Recipes: '+recipesUsed));
O.push(ln('\ud83e\uddec Evolution: '+evoCnt+' iterations \u2502 last: '+evoLast));
// ---- Last Reasoning ----
const reas = sup.reasoning || {};
const lastReas = reas.reflect || reas.act || reas.decide || reas.diagnose || reas.observe || null;
if (lastReas) {
  O.push(ln(''));
  O.push(ln('\ud83e\udde0 Last Reasoning'));
  const maxLen = W - 8;
  let remaining = lastReas;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) { O.push(ln('  '+remaining)); break; }
    let cut = remaining.lastIndexOf(' ', maxLen);
    if (cut <= 0) cut = maxLen;
    O.push(ln('  '+remaining.slice(0, cut)));
    remaining = remaining.slice(cut).trimStart();
  }
}
O.push('\u2514'+'\u2500'.repeat(W-2)+'\u2518');
console.log(O.join(String.fromCharCode(10)));
" 2>&1)

if [ $? -ne 0 ] || [ -z "$DASHBOARD_OUTPUT" ]; then
  echo "ERROR: Dashboard renderer failed"
  echo "$DASHBOARD_OUTPUT" | head -5
  exit 0  # Never fail — dashboard should always produce output
fi

echo "$DASHBOARD_OUTPUT"
