#!/usr/bin/env node
// generator.js — Synthetic case data generator
// Usage: node generator.js <profile-name> [seed]
// Output: tests/fixtures/synthetic/generated/syn-{profile}-{hash}/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SCRIPT_DIR = __dirname;
const PROFILES_FILE = path.join(SCRIPT_DIR, 'profiles.yaml');
const TEMPLATES_DIR = path.join(SCRIPT_DIR, 'templates');
const GENERATED_DIR = path.join(SCRIPT_DIR, 'generated');

// ─── Arguments ───────────────────────────────────────────
const PROFILE = process.argv[2] || '';
const SEED = process.argv[3] || String(Math.floor(Math.random() * 100000));

// ─── Minimal YAML parser (no dependencies) ───────────────
function parseYaml(text) {
  // Simple YAML parser for our profiles.yaml structure
  const lines = text.split('\n');
  const result = { defaults: {}, profiles: {} };
  let section = null; // 'defaults' | 'profiles'
  let profileName = null;
  let inOverrides = false;
  let stack = []; // track nesting by indent level

  for (const line of lines) {
    const stripped = line.replace(/\s+$/, '');
    if (!stripped || stripped.startsWith('#')) continue;

    const indent = stripped.search(/\S/);
    const content = stripped.trim();

    if (content === 'defaults:') { section = 'defaults'; stack = [result.defaults]; continue; }
    if (content === 'profiles:') { section = 'profiles'; stack = [result.profiles]; continue; }

    if (section === 'defaults') {
      parseYamlLine(result.defaults, indent, content, 2);
    } else if (section === 'profiles') {
      // Profile name at indent 2
      if (indent === 2 && content.endsWith(':') && !content.includes(' ')) {
        profileName = content.slice(0, -1);
        result.profiles[profileName] = {};
        inOverrides = false;
        continue;
      }
      if (profileName) {
        if (content === 'overrides:') {
          result.profiles[profileName].overrides = {};
          inOverrides = true;
          continue;
        }
        if (content.startsWith('description:')) {
          result.profiles[profileName].description = extractValue(content);
          continue;
        }
        if (inOverrides) {
          parseYamlLine(result.profiles[profileName].overrides, indent, content, 6);
        }
      }
    }
  }
  return result;
}

function parseYamlLine(target, indent, content, baseIndent) {
  // Parse a YAML key: value line into the target object
  if (!content.includes(':')) return;

  const colonIdx = content.indexOf(':');
  const key = content.slice(0, colonIdx).trim();
  const rawVal = content.slice(colonIdx + 1).trim();

  if (!rawVal || rawVal === '') {
    // Object start — we handle this by re-parsing nested lines
    return;
  }

  // Handle inline object: { key: val, key: val }
  if (rawVal.startsWith('{') && rawVal.endsWith('}')) {
    target[key] = parseInlineObj(rawVal);
    return;
  }

  // Handle array items
  if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
    const inner = rawVal.slice(1, -1).trim();
    target[key] = inner ? inner.split(',').map(s => extractValue(s.trim())) : [];
    return;
  }

  target[key] = extractValue(rawVal);
}

function parseInlineObj(str) {
  // Parse { key: val, key: val }
  const inner = str.slice(1, -1).trim();
  const obj = {};
  // Simple split by comma, handling quoted values
  const parts = [];
  let current = '';
  let inQuote = false;
  for (const ch of inner) {
    if (ch === '"') { inQuote = !inQuote; current += ch; }
    else if (ch === ',' && !inQuote) { parts.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  if (current.trim()) parts.push(current.trim());

  for (const part of parts) {
    const ci = part.indexOf(':');
    if (ci === -1) continue;
    const k = part.slice(0, ci).trim();
    const v = extractValue(part.slice(ci + 1).trim());
    obj[k] = v;
  }
  return obj;
}

function extractValue(raw) {
  if (!raw) return '';
  // Strip quotes
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw === 'null') return null;
  if (/^-?\d+$/.test(raw)) return parseInt(raw, 10);
  if (/^-?\d+\.\d+$/.test(raw)) return parseFloat(raw);
  return raw;
}

// ─── Better YAML parser using line-by-line nesting ───────
function parseFullYaml(text) {
  const lines = text.split('\n');
  const result = { defaults: {}, profiles: {} };
  let section = null;
  let profileName = null;
  let inOverrides = false;

  // Collect line blocks for each section
  let defaultsLines = [];
  let overridesLines = {};

  let collectingFor = null; // 'defaults' | profileName

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const stripped = line.replace(/\s+$/, '');
    if (!stripped || stripped.trim().startsWith('#')) continue;

    const indent = stripped.search(/\S/);
    const content = stripped.trim();

    if (content === 'defaults:') { section = 'defaults'; continue; }
    if (content === 'profiles:') { section = 'profiles'; continue; }

    if (section === 'defaults' && indent >= 2) {
      defaultsLines.push(stripped);
    }

    if (section === 'profiles') {
      if (indent === 2 && content.endsWith(':') && !content.includes(' ')) {
        profileName = content.slice(0, -1);
        result.profiles[profileName] = { overrides: {} };
        inOverrides = false;
        continue;
      }
      if (profileName && indent === 4 && content.startsWith('description:')) {
        result.profiles[profileName].description = extractValue(content.slice('description:'.length).trim());
        continue;
      }
      if (profileName && indent === 4 && content === 'overrides:') {
        inOverrides = true;
        overridesLines[profileName] = [];
        continue;
      }
      if (profileName && inOverrides && indent >= 6) {
        if (!overridesLines[profileName]) overridesLines[profileName] = [];
        overridesLines[profileName].push(stripped);
      }
      // Reset if we hit a new profile-level key
      if (indent <= 4 && content !== 'overrides:' && !content.startsWith('description:')) {
        if (indent === 2) inOverrides = false;
      }
    }
  }

  // Parse defaults block
  result.defaults = parseNestedBlock(defaultsLines, 2);

  // Parse each profile's overrides
  for (const [pName, pLines] of Object.entries(overridesLines)) {
    result.profiles[pName].overrides = parseNestedBlock(pLines, 6);
  }

  return result;
}

function parseNestedBlock(lines, baseIndent) {
  const obj = {};
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const indent = line.search(/\S/);
    const content = line.trim();

    if (indent !== baseIndent) { i++; continue; }

    const colonIdx = content.indexOf(':');
    if (colonIdx === -1) { i++; continue; }

    const key = content.slice(0, colonIdx).trim();
    const rawVal = content.slice(colonIdx + 1).trim();

    if (rawVal.startsWith('{') && rawVal.endsWith('}')) {
      obj[key] = parseInlineObj(rawVal);
      i++;
    } else if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
      const inner = rawVal.slice(1, -1).trim();
      obj[key] = inner ? inner.split(',').map(s => extractValue(s.trim())) : [];
      i++;
    } else if (!rawVal) {
      // Nested object — collect child lines
      const childLines = [];
      i++;
      while (i < lines.length) {
        const childIndent = lines[i].search(/\S/);
        if (childIndent <= baseIndent) break;
        childLines.push(lines[i]);
        i++;
      }
      obj[key] = parseNestedBlock(childLines, baseIndent + 2);
    } else {
      obj[key] = extractValue(rawVal);
      i++;
    }
  }
  return obj;
}

// Also parse array items within YAML (lines starting with "- ")
function parseYamlArray(lines, baseIndent) {
  const arr = [];
  for (const line of lines) {
    const content = line.trim();
    if (content.startsWith('- ')) {
      arr.push(extractValue(content.slice(2).trim()));
    }
  }
  return arr;
}

// ─── Load profiles ───────────────────────────────────────

const yamlText = fs.readFileSync(PROFILES_FILE, 'utf8');
const config = parseFullYaml(yamlText);

// Parse warnings arrays from raw YAML (special handling)
function parseWarningsFromYaml(profileName) {
  const lines = yamlText.split('\n');
  let inProfile = false;
  let inOverrides = false;
  let inWarnings = false;
  const warnings = [];

  for (const line of lines) {
    const stripped = line.trimEnd();
    const indent = stripped.search(/\S/);
    const content = stripped.trim();

    if (indent === 2 && content === `${profileName}:`) { inProfile = true; inOverrides = false; continue; }
    if (inProfile && indent === 2 && content.endsWith(':')) { inProfile = false; continue; }
    if (inProfile && content === 'overrides:') { inOverrides = true; continue; }
    if (inProfile && inOverrides && content === 'warnings:') { inWarnings = true; continue; }
    if (inWarnings && indent >= 12 && content.startsWith('- ')) {
      warnings.push(extractValue(content.slice(2).trim()));
    } else if (inWarnings && indent < 12) {
      inWarnings = false;
    }
  }
  return warnings;
}

// ─── Validate ────────────────────────────────────────────

if (!PROFILE) {
  console.log('Usage: generator.sh <profile-name> [seed]');
  console.log('');
  console.log('Available profiles:');
  Object.keys(config.profiles).forEach(p => console.log(`  - ${p}`));
  process.exit(1);
}

if (!config.profiles[PROFILE]) {
  console.error(`ERROR: Profile '${PROFILE}' not found in profiles.yaml`);
  console.log('Available profiles:');
  Object.keys(config.profiles).forEach(p => console.log(`  - ${p}`));
  process.exit(1);
}

// ─── Merge defaults + overrides ──────────────────────────

function deepMerge(base, override) {
  const result = JSON.parse(JSON.stringify(base));
  for (const [key, val] of Object.entries(override)) {
    if (val && typeof val === 'object' && !Array.isArray(val) && result[key] && typeof result[key] === 'object') {
      result[key] = deepMerge(result[key], val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

const profile = config.profiles[PROFILE];
const data = deepMerge(config.defaults, profile.overrides || {});

// ─── Helpers ─────────────────────────────────────────────

function genHash() {
  return crypto.createHash('md5').update(`${PROFILE}-${SEED}`).digest('hex').slice(0, 8);
}

function genCaseNumber() {
  return `SYN${String(parseInt(SEED) % 10000000000).padStart(10, '0')}`;
}

function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - (days || 0));
  return d.toISOString().replace(/\.\d+Z$/, 'Z');
}

function nowISO() {
  return new Date().toISOString().replace(/\.\d+Z$/, 'Z');
}

// ─── Generate ────────────────────────────────────────────

const CASE_HASH = genHash();
const CASE_NUMBER = genCaseNumber();
const OUT_DIR = path.join(GENERATED_DIR, `syn-${PROFILE}-${CASE_HASH}`);
const NOW = nowISO();
const CREATED_ON = daysAgoISO(data.caseAge || 14);

fs.mkdirSync(OUT_DIR, { recursive: true });

// ── case-info.md ──
const tpl = fs.readFileSync(path.join(TEMPLATES_DIR, 'case-info.tpl.md'), 'utf8');

let laborSection = '';
if ((data.emails?.count || 0) > 0) {
  laborSection = `## Labor\n\n⏱️ ${daysAgoISO(7)} | 60min | Research | Initial investigation\n⏱️ ${daysAgoISO(3)} | 60min | Communication | Follow-up with customer`;
}

let icmSection = '';
if (data.icm?.linked) {
  icmSection = `## ICM\n\n🔥 Linked Incident: [${data.icm.incidentId}](https://portal.microsofticm.com/imp/v3/incidents/details/${data.icm.incidentId}/home) | Sev ${data.icm.severity}`;
}

const replacements = {
  '{{CASE_NUMBER}}': CASE_NUMBER,
  '{{GENERATED_AT}}': NOW,
  '{{TITLE}}': `Synthetic Test Case - ${PROFILE}`,
  '{{SEVERITY}}': data.severity || 'B',
  '{{STATUS}}': data.status || 'Active',
  '{{SAP}}': data.sap || 'Azure / Identity / MFA',
  '{{ASSIGNED_TO}}': data.assignedTo || 'fangkun@microsoft.com',
  '{{CREATED_ON}}': CREATED_ON,
  '{{CASE_AGE}}': String(data.caseAge || 14),
  '{{ACTIVE_HOURS}}': String(data.activeHours || 8),
  '{{ORIGIN}}': data.origin || 'Web',
  '{{TIMEZONE}}': data.timezone || 'China Standard Time',
  '{{COUNTRY}}': data.country || 'China',
  '{{CONTACT_NAME}}': data.primaryContact?.name || 'Zhang Wei',
  '{{CONTACT_EMAIL}}': data.primaryContact?.email || 'zhangwei@contoso.com',
  '{{CONTACT_PHONE}}': data.primaryContact?.phone || '+86-10-12345678',
  '{{CONTACT_METHOD}}': data.primaryContact?.preferredMethod || 'Email',
  '{{CUSTOMER}}': data.customer || 'Contoso Ltd.',
  '{{CUSTOMER_STATEMENT}}': data.customerStatement || '',
  '{{SERVICE_LEVEL}}': data.entitlement?.serviceLevel || '',
  '{{SERVICE_NAME}}': data.entitlement?.serviceName || '',
  '{{SCHEDULE}}': data.entitlement?.schedule || '',
  '{{CONTRACT_COUNTRY}}': data.entitlement?.contractCountry || '',
  '{{EMAIL_COUNT}}': String(data.emails?.count || 0),
  '{{NOTE_COUNT}}': String(data.notes?.count || 0),
  '{{LABOR_SECTION}}': laborSection,
  '{{ICM_SECTION}}': icmSection,
};

let caseInfo = tpl;
for (const [k, v] of Object.entries(replacements)) {
  caseInfo = caseInfo.split(k).join(v);
}
fs.writeFileSync(path.join(OUT_DIR, 'case-info.md'), caseInfo);

// ── emails.md ──
const emailCount = data.emails?.count || 0;
let emailEntries = '';
if (emailCount > 0) {
  for (let i = 1; i <= emailCount && i <= 20; i++) {
    const daysOffset = i * 2;
    const emailDate = daysAgoISO(daysOffset);
    const isSent = i % 2 === 1;
    const direction = isSent ? '📤 Sent' : '📥 Received';
    const from = isSent ? (data.assignedTo || 'fangkun@microsoft.com') : (data.primaryContact?.email || 'zhangwei@contoso.com');
    const to = isSent ? (data.primaryContact?.email || 'zhangwei@contoso.com') : (data.assignedTo || 'fangkun@microsoft.com');
    const body = isSent
      ? `Hi ${data.primaryContact?.name || 'Customer'},\n\nThis is a follow-up regarding your case. Please provide the requested logs.\n\nBest regards,\nAzure Support`
      : `Hi,\n\nThank you for looking into this. Here is the information you requested.\n\nRegards,\n${data.primaryContact?.name || 'Customer'}`;

    emailEntries += `<!-- id: syn-email-${String(i).padStart(4, '0')} -->\n`;
    emailEntries += `### ${direction} | ${emailDate}\n`;
    emailEntries += `**Subject:** RE: [${CASE_NUMBER}] Synthetic Test Case - ${PROFILE}\n`;
    emailEntries += `**From:** ${from}\n`;
    emailEntries += `**To:** ${to}\n\n`;
    emailEntries += `${body}\n\n---\n\n`;
  }
} else {
  emailEntries = '_No emails yet._';
}

const emailsMd = `# Emails — Case ${CASE_NUMBER}\n\n> Generated: ${NOW} (UTC) | Total: ${emailCount} emails\n\n${emailEntries}`;
fs.writeFileSync(path.join(OUT_DIR, 'emails.md'), emailsMd);

// ── notes.md ──
const noteCount = data.notes?.count || 0;
let noteEntries = '';
if (noteCount > 0) {
  noteEntries += `<!-- id: syn-note-0001 -->\n### 📝 ${CREATED_ON} | System\n**(auto-assigned)**\n\n`;
  noteEntries += `*(系统自动分配 → ${data.assignedTo || 'fangkun@microsoft.com'}. | SLA剩余: 240 min)*\n\n---\n\n`;

  for (let i = 2; i <= noteCount && i <= 15; i++) {
    const daysOffset = (noteCount - i) * 3 + 1;
    const noteDate = daysAgoISO(daysOffset);
    noteEntries += `<!-- id: syn-note-${String(i).padStart(4, '0')} -->\n`;
    noteEntries += `### 📝 ${noteDate} | Azure Support\n**Investigation Notes**\n\n`;
    noteEntries += `- Checked service health dashboard — no ongoing incidents\n`;
    noteEntries += `- Reviewed customer subscription configuration\n`;
    noteEntries += `- Identified potential root cause in authentication flow\n\n---\n\n`;
  }
} else {
  noteEntries = '_No notes yet._';
}

const notesMd = `# Notes — Case ${CASE_NUMBER}\n\n> Generated: ${NOW} (UTC) | Total: ${noteCount} notes\n\n${noteEntries}`;
fs.writeFileSync(path.join(OUT_DIR, 'notes.md'), notesMd);

// ── casehealth-meta.json ──
const isCorrupt = data._corruptMeta === true;

if (isCorrupt) {
  fs.writeFileSync(path.join(OUT_DIR, 'casehealth-meta.json'),
    '{\n  "caseNumber": "CORRUPTED",\n  "fwr": { "status": "In Progress", "remaining\n  INVALID JSON\n  "compliance": { entitlementOk: MISSING_QUOTES }\n}');
} else {
  const cm = data.casehealthMeta || {};
  const compliance = cm.compliance || {};
  const entOk = compliance.entitlementOk !== undefined ? compliance.entitlementOk : true;
  const is21v = compliance.is21vConvert !== undefined ? compliance.is21vConvert : false;

  // Build warnings
  let warnings = parseWarningsFromYaml(PROFILE);
  if (warnings.length === 0 && compliance.warnings && Array.isArray(compliance.warnings)) {
    warnings = compliance.warnings;
  }
  // Auto-generate warnings if entitlementOk is false and no explicit warnings
  if (warnings.length === 0 && entOk === false) {
    const sn = data.entitlement?.serviceName || '';
    if (sn.toLowerCase().includes('china')) {
      warnings = ['Service Name 不含 China Cld/China Cloud，合约为 APAC 区域'];
    } else {
      warnings = ['Service Name 不含 China Cld/China Cloud', 'Contract Country 非 China'];
    }
  }

  const fwr = cm.fwr || {};
  const fdr = cm.fdr || {};
  const ir = cm.irSla || {};

  const meta = {
    caseNumber: CASE_NUMBER,
    fwr: {
      status: fwr.status || 'In Progress',
      remaining: fwr.remaining || null,
      checkedAt: NOW,
      source: 'synthetic',
    },
    fdr: {
      status: fdr.status || 'In Progress',
      remaining: fdr.remaining || null,
      checkedAt: NOW,
      source: 'synthetic',
    },
    irSla: {
      status: ir.status || 'Succeeded',
      remaining: ir.remaining || null,
      completedOn: ir.completedOn || null,
      checkedAt: NOW,
      source: 'synthetic',
    },
    compliance: {
      entitlementOk: entOk,
      serviceLevel: data.entitlement?.serviceLevel || '',
      serviceName: data.entitlement?.serviceName || '',
      contractCountry: data.entitlement?.contractCountry || '',
      is21vConvert: is21v,
      warnings: warnings,
    },
    actualStatus: cm.actualStatus || 'pending-customer',
    daysSinceLastContact: cm.daysSinceLastContact || 2,
    statusJudgedAt: NOW,
    statusReasoning: cm.statusReasoning || `Synthetic case → ${cm.actualStatus || 'pending-customer'}`,
    emailCountAtJudge: data.emails?.count || 0,
    noteCountAtJudge: data.notes?.count || 0,
    icmIdAtJudge: data.icm?.linked ? data.icm.incidentId : null,
  };

  fs.writeFileSync(path.join(OUT_DIR, 'casehealth-meta.json'), JSON.stringify(meta, null, 2));
}

// ─── Output ──────────────────────────────────────────────
const files = fs.readdirSync(OUT_DIR);
console.log(`✅ Generated synthetic case: ${OUT_DIR}`);
console.log(`   Profile: ${PROFILE}`);
console.log(`   Seed: ${SEED}`);
console.log(`   Case Number: ${CASE_NUMBER}`);
console.log(`   Files:`);
files.forEach(f => console.log(`     - ${f}`));
