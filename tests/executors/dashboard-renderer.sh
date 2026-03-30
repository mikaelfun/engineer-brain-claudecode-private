#!/usr/bin/env bash
# tests/executors/dashboard-renderer.sh — Deterministic CLI Dashboard
#
# Reads state.json + round summaries + discoveries + evolution + directives
# and outputs a formatted one-screen dashboard to stdout.
#
# Usage: bash tests/executors/dashboard-renderer.sh
# Output: Plain text, ≤25 lines, deterministic (no LLM variance)

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

STATE_FILE="$TESTS_ROOT/state.json"
DIRECTIVES_FILE="$TESTS_ROOT/directives.json"
DISCOVERIES_FILE="$TESTS_ROOT/discoveries.json"
EVOLUTION_FILE="$TESTS_ROOT/evolution.json"

# ============================================================
# Graceful fallback if state.json doesn't exist
# ============================================================
if [ ! -f "$STATE_FILE" ]; then
  cat << 'EOF'
┌───────────────────────────────────────────────────────────┐
│  🧪 Test Supervisor   R0/0 │ UNKNOWN │ ⚠️ warning        │
├───────────────────────────────────────────────────────────┤
│  ⚠️ Attention ────────────────────────────────────────── │
│  🔴 state.json not found — test loop not initialized     │
│                                                           │
│  📊 0✅ 0❌ 0🔧 0⏭️  │ 0% cov                          │
│  📋 Queues  T:0  F:0  V:0  R:0                           │
└───────────────────────────────────────────────────────────┘
EOF
  exit 0
fi

# ============================================================
# Single Node.js invocation — pass all paths as env vars
# (Git Bash translates POSIX→Windows in env vars, not in strings)
# ============================================================
DASHBOARD_OUTPUT=$(
  DB_STATE="$STATE_FILE" \
  DB_DIRECTIVES="$DIRECTIVES_FILE" \
  DB_DISCOVERIES="$DISCOVERIES_FILE" \
  DB_EVOLUTION="$EVOLUTION_FILE" \
  DB_RESULTS="$RESULTS_DIR" \
  DB_TESTS_ROOT="$TESTS_ROOT" \
  NODE_PATH="$DASHBOARD_DIR/node_modules" \
  node -e "
const fs = require('fs');
const path = require('path');

const STATE = process.env.DB_STATE;
const DIRECTIVES = process.env.DB_DIRECTIVES;
const DISCOVERIES = process.env.DB_DISCOVERIES;
const EVOLUTION = process.env.DB_EVOLUTION;
const RESULTS = process.env.DB_RESULTS;
const TESTS_ROOT = process.env.DB_TESTS_ROOT;

const state = JSON.parse(fs.readFileSync(STATE, 'utf8'));
const round = state.round || 0;
const maxRounds = state.maxRounds || 50;
const phase = state.phase || 'UNKNOWN';
const st = state.stats || {};
const passed = st.passed || 0;
const failed = st.failed || 0;
const fixed = st.fixed || 0;
const skipped = st.skipped || 0;

// ---- Queues ----
const testQ = state.testQueue || [];
const fixQ = state.fixQueue || [];
const verifyQ = state.verifyQueue || [];
const regrQ = state.regressionQueue || [];
const getId = x => { const id = typeof x === 'string' ? x : (x.testId || '?'); return id.length > 15 ? id.slice(0,13)+'..' : id; };
const tqH = testQ.slice(0,2).map(getId);
const fqH = fixQ.slice(0,2).map(getId);
const vqH = verifyQ.slice(0,2).map(getId);
const rqH = regrQ.slice(0,2).map(getId);

// ---- Health ----
const now = Date.now();
const ph = state.phaseHistory || [];
let lastAct = null;
for (let i = ph.length - 1; i >= 0; i--) {
  const ts = ph[i].timestamp || ph[i].completedAt;
  if (ts) { lastAct = ts; break; }
}
if (!lastAct) lastAct = state.lastRoundAt || state.startedAt || null;
try {
  const mt = fs.statSync(STATE).mtime;
  if (!lastAct || mt > new Date(lastAct)) lastAct = mt.toISOString();
} catch(e) {}
const stuckTests = fixQ.filter(t => (t.retryCount || 0) >= 3);
let hasIP = false;
try {
  hasIP = fs.readdirSync(RESULTS).filter(f => f.startsWith('.progress-') && f.endsWith('.json')).length > 0;
} catch(e) {}
if (!hasIP && state.currentTest) hasIP = true;
// Runner-level activity: runner writes runnerActive timestamp on start, clears on end
let runnerActive = false;
if (state.runnerActive) {
  const ra = new Date(state.runnerActive).getTime();
  // Consider runner active if timestamp is within last 30 minutes
  if (now - ra < 30*60*1000) { runnerActive = true; hasIP = true; }
}
let staleSince = null;
if (lastAct) {
  const el = now - new Date(lastAct).getTime();
  if (el > 30*60*1000 && !hasIP) staleSince = lastAct;
}
let health = 'healthy';
if (staleSince) health = 'stale';
else if (stuckTests.length > 0) health = 'stuck';
else if (hasIP) health = 'running';
else if (fixQ.length > 0) health = 'warning';
const hE = {healthy:'\u2705',running:'\ud83c\udfc3',warning:'\u26a0\ufe0f',stuck:'\ud83d\udd12',stale:'\ud83d\udca4'}[health]||'?';

// ---- Coverage ----
const regDir = path.join(TESTS_ROOT, 'registry');
let regCnt = 0;
try {
  for (const sub of fs.readdirSync(regDir,{withFileTypes:true}).filter(d=>d.isDirectory()))
    regCnt += fs.readdirSync(path.join(regDir,sub.name)).filter(f=>f.endsWith('.yaml')||f.endsWith('.yml')).length;
} catch(e) {}
const total = regCnt || st.totalTests || 0;
const passIds = new Set();
try {
  for (const rf of fs.readdirSync(RESULTS).filter(f=>f.endsWith('.json')&&!f.includes('summary')&&!f.startsWith('.'))) {
    try { const r=JSON.parse(fs.readFileSync(path.join(RESULTS,rf),'utf8')); if(r.status==='pass'&&r.testId) passIds.add(r.testId); } catch(e) {}
  }
} catch(e) {}
const covPct = total > 0 ? (passIds.size/total*100).toFixed(1) : '0.0';

// ---- Per-round metrics from latest round summary ----
let greenRate = null, regrRate = null, fixThru = null;
try {
  const sf = path.join(RESULTS, 'round-'+round+'-summary.json');
  if (fs.existsSync(sf)) {
    const summary = JSON.parse(fs.readFileSync(sf, 'utf8'));
    const ss = summary.stats || {};
    greenRate = ss.greenRate !== undefined ? ss.greenRate : null;
    regrRate = ss.regressionRate !== undefined ? ss.regressionRate : null;
    fixThru = ss.fixThroughput !== undefined ? ss.fixThroughput : null;
  }
} catch(e) {}

// ---- Phase progress ----
const PHASES = ['SCAN','GENERATE','TEST','FIX','VERIFY'];
const rj = state.roundJourney || {};
const pSym = (p,i) => {
  const s = rj[p] ? rj[p].status : 'pending';
  if (p === phase && s !== 'done') return '\ud83d\udd36';
  // If phase is after current phase, treat as pending regardless of stale data
  const ci = PHASES.indexOf(phase);
  if (ci >= 0 && i > ci) return '\u2b1c';
  if (s === 'done') return '\u2705';
  return '\u2b1c';
};
const fDur = ms => { if(!ms||ms<=0) return '\u2014'; const s=Math.round(ms/1000); if(s<60) return s+'s'; const m=Math.floor(s/60),r=s%60; return r>0?m+'m'+r+'s':m+'m'; };
const pLine = PHASES.map((p,i)=>pSym(p,i)+p).join('\u2501\u2501\u25b6');
// Only show duration for phases that are done AND come before/at current phase
const curIdx = PHASES.indexOf(phase);
const dLine = PHASES.map((p,i) => {
  const pj = rj[p];
  // Currently running phase: show elapsed time with ~ prefix + progress
  if (p === phase && pj && pj.status === 'running' && pj.startedAt) {
    const elapsed = now - new Date(pj.startedAt).getTime();
    let label = '~'+fDur(elapsed);
    const pp = state.phaseProgress;
    if (pp && pp.current && pp.total) label += ' '+pp.current+'/'+pp.total;
    return label.padEnd(10);
  }
  if (!pj || pj.status !== 'done') return '\u2014'.padEnd(5);
  // If phase is after current running phase, it's stale data from previous round — hide it
  if (i > curIdx && curIdx >= 0) return '\u2014'.padEnd(5);
  return fDur(pj.duration_ms || 0).padEnd(5);
}).join('      ');

// ---- Trend (last 3 rounds) ----
const trend = [];
for (let r=round-2; r<=round; r++) {
  if (r<1) { trend.push(null); continue; }
  const sf = path.join(RESULTS, 'round-'+r+'-summary.json');
  try { trend.push(JSON.parse(fs.readFileSync(sf,'utf8')).stats||{}); }
  catch(e) {
    if (r===round) {
      // Use cumulative state.stats for current round (most accurate)
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
if (health==='stuck') att.push('\ud83d\udd34 Health: stuck ('+stuckTests.length+' test(s) retried 3+ times)');
if (health==='stale') { const sm=Math.round((now-new Date(staleSince).getTime())/60000); att.push('\ud83d\udfe1 Stale: no activity for '+sm+' min'); }
try {
  const disc=JSON.parse(fs.readFileSync(DISCOVERIES,'utf8'));
  const ds=disc.summary||{};
  const dt=(ds.totalDiscoveries||0), dr=(ds.regressions||0);
  if (dt>0&&dr/dt>0.5) att.push('\ud83d\udfe1 Regressions: '+dr+'/'+dt+' ('+Math.round(dr/dt*100)+'%)');
} catch(e) {}
if (trend.every(t=>t!==null)&&pVals[0]===pVals[1]&&pVals[1]===pVals[2]&&pVals[0]!==null) att.push('\ud83d\udfe1 Coverage flat for 3 rounds');

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
      if(pFiles.length>0) { const pr=JSON.parse(fs.readFileSync(path.join(RESULTS,pFiles[0]),'utf8')); if(pr.status==='pass') pp++; else pf++; if((round-(pr.round||0))>5) ps++; }
    } catch(e) {}
  }
  obs={total:pIds.length,pass:pp,fail:pf,stale:ps};
  if (ps>0) att.push('\ud83d\udfe1 '+ps+' stale probe(s)');
} catch(e) {}
const attItems = att.slice(0,3);

// ---- Directives ----
let pendDir=0, paused=false;
try { const d=JSON.parse(fs.readFileSync(DIRECTIVES,'utf8')); pendDir=(d.directives||[]).filter(x=>x.status==='pending').length; paused=!!d.paused; } catch(e) {}

// ---- Evolution ----
let evoCnt=0, evoLast='\u2014';
try { const e=JSON.parse(fs.readFileSync(EVOLUTION,'utf8')); const ent=e.entries||[]; evoCnt=ent.length; if(ent.length>0) evoLast=ent[ent.length-1].id||'\u2014'; } catch(e) {}

// ---- Render ----
const W=61;
const ln = s => '\u2502  '+s.padEnd(W-4)+'\u2502';
const O = [];
O.push('\u250c'+'\u2500'.repeat(W-2)+'\u2510');
const hdr = '  \ud83e\uddea Test Supervisor   R'+round+'/'+maxRounds+' \u2502 '+phase+' \u2502 '+hE+' '+health;
O.push('\u2502'+hdr.padEnd(W-2)+'\u2502');
O.push('\u251c'+'\u2500'.repeat(W-2)+'\u2524');
O.push(ln(''));
// ---- Runner progress (only shown when runner is active) ----
if (runnerActive && state.runnerStep) {
  const RS = ['preflight','strategic','test-loop','meta','summary'];
  const RSL = {preflight:'Pre-flight',strategic:'Strategy',['test-loop']:'Test-Loop',meta:'Meta',summary:'Done'};
  const rsi = RS.indexOf(state.runnerStep);
  const rpLine = RS.map((s,i) => {
    const label = RSL[s]||s;
    if (i < rsi) return '\u2705'+label;
    if (i === rsi) return '\ud83d\udd36'+label;
    return '\u2b1c'+label;
  }).join('\u2501');
  const elapsed = Math.round((now - new Date(state.runnerActive).getTime())/1000);
  const eStr = elapsed < 60 ? elapsed+'s' : Math.floor(elapsed/60)+'m'+elapsed%60+'s';
  O.push(ln('\ud83e\udd16 Runner  '+eStr));
  O.push(ln(rpLine));
  O.push(ln(''));
}
O.push(ln(pLine));
O.push(ln(dLine));
// Show current test being processed (if any)
const ct = state.currentTest || '';
if (ct) {
  const ctShort = ct.length > 45 ? ct.slice(0,43)+'..' : ct;
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
const tR=[round-2,round-1,round].map(r=>r<1?'\u2014':'R'+r).join('\u2192');
O.push(ln('\ud83d\udcc8 Trend ('+tR+')'));
O.push(ln(tStr('passed',pVals)+'  '+tStr('fixed',fVals)));
O.push(ln(''));
const qS = (l,a,h) => l+':'+a.length+(a.length>0&&h.length?' '+h.join(','):'');
O.push(ln('\ud83d\udccb Queues'));
// Compact: show counts + heads, truncate if too long
let qLine = [qS('T',testQ,tqH),qS('F',fixQ,fqH),qS('V',verifyQ,vqH),qS('R',regrQ,rqH)].join('  ');
if (qLine.length > W-6) qLine = qLine.slice(0, W-9) + '...';
O.push(ln(qLine));
O.push(ln(''));
O.push(ln('\ud83d\udd2d Probes: '+obs.pass+'\u2705 '+obs.fail+'\u274c ('+obs.stale+' stale)'));
O.push(ln('\ud83d\udcdd Directives: '+pendDir+' pending'+(paused?' \u2502 \u23f8\ufe0f PAUSED':'')));
O.push(ln('\ud83e\uddec Evolution: '+evoCnt+' iterations \u2502 last: '+evoLast));
O.push('\u2514'+'\u2500'.repeat(W-2)+'\u2518');
console.log(O.join(String.fromCharCode(10)));
" 2>&1)

if [ $? -ne 0 ] || [ -z "$DASHBOARD_OUTPUT" ]; then
  echo "ERROR: Dashboard renderer failed"
  echo "$DASHBOARD_OUTPUT" | head -5
  exit 0  # Never fail — dashboard should always produce output
fi

echo "$DASHBOARD_OUTPUT"
