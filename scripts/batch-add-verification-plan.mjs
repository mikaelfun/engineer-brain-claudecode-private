#!/usr/bin/env node
/**
 * Batch-add "## Verification Plan" section to all track plan.md files
 * that are missing it. Reads spec.md acceptance criteria and generates
 * a classification table.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

const projectRoot = process.cwd()
const tracksDir = join(projectRoot, 'conductor', 'tracks')
const issuesDir = join(projectRoot, 'issues')

// Scan ALL track directories (not just issue-linked ones)
const trackDirs = readdirSync(tracksDir).filter(d => {
  const planPath = join(tracksDir, d, 'plan.md')
  return existsSync(planPath) && d !== '_archive'
})

const targets = []

for (const trackId of trackDirs) {
  const planPath = join(tracksDir, trackId, 'plan.md')
  const planContent = readFileSync(planPath, 'utf-8')
  if (planContent.includes('## Verification Plan')) {
    console.log(`SKIP (already has VP): ${trackId}`)
    continue
  }
  targets.push({ trackId, planPath })
}

console.log(`\nFound ${targets.length} tracks needing Verification Plan\n`)

// Heuristic test-type classifier
function classifyTestType(criterion) {
  const lower = criterion.toLowerCase()

  // Skip patterns: backend-only, type system, internal logic, unit test coverage
  const skipPatterns = [
    /\btype\b.*\badded\b/, /\btype\b.*\bdefinition/, /\bmetadata\.json\b/, /\btracks\.md\b/,
    /\bunit test/, /\bjson.*status/, /\bjson.*updated/, /\binternal\b/, /\bbackend.*only\b/,
    /\bno.*regression/, /\bexisting.*test/, /\btype.*system\b/, /\bcompile/
  ]
  if (skipPatterns.some(p => p.test(lower))) return 'Skip'

  // API patterns: endpoint, POST, GET, response, API
  const apiPatterns = [
    /\bendpoint\b/, /\bpost\s+\//, /\bget\s+\//, /\bput\s+\//, /\bdelete\s+\//,
    /\bapi\b.*\b(call|response|return)/, /\broute\b.*\b(return|respond)/
  ]
  if (apiPatterns.some(p => p.test(lower))) return 'API'

  // Interaction patterns: click, button, input, toggle, expand, collapse, dialog, form, send, drag, select, navigate
  const interactionPatterns = [
    /\bclick/, /\bbutton\b/, /\binput\b.*\b(box|field|send)/, /\btoggle/, /\bexpand/,
    /\bcollapse/, /\bdialog/, /\bform\b/, /\bsend\b/, /\bdrag/, /\bselect/,
    /\bmark\s+done/, /\breopen/, /\bcancel/, /\bstop\b/, /\bterminate/,
    /\bchat\b/, /\bsubmit/, /\bpress/, /\binteract/, /\bcopy\b.*\b(button|click)/
  ]
  if (interactionPatterns.some(p => p.test(lower))) return 'Interaction'

  // Visual patterns: display, show, badge, color, style, icon, visible, appear, group, layout, theme
  const visualPatterns = [
    /\bdisplay/, /\bshow/, /\bbadge/, /\bcolor/, /\bstyl/, /\bicon/, /\bvisible/,
    /\bappear/, /\bgroup/, /\blayout/, /\btheme/, /\bformat/, /\brender/,
    /\bcollapsed?\s+by\s+default/, /\bsection\b/, /\bpanel\b/, /\bsorted/,
    /\bhidden/, /\bhighlight/, /\btruncate/, /\bwrap/
  ]
  if (visualPatterns.some(p => p.test(lower))) return 'Visual'

  // Default to Visual for UI features
  return 'Visual'
}

// Generate high-level test steps based on criterion text and test type
function generateTestSteps(criterion, testType) {
  if (testType === 'Skip') return 'Covered by unit tests'
  if (testType === 'API') return `Call the relevant endpoint → verify response shape and status code`

  // Extract key action/subject from criterion
  const lower = criterion.toLowerCase()

  if (testType === 'Interaction') {
    if (/click|button/.test(lower)) {
      return `Navigate to relevant page → locate element → click → verify state change`
    }
    if (/expand|collapse|toggle/.test(lower)) {
      return `Navigate to page → find collapsible element → click to toggle → verify expanded/collapsed state`
    }
    if (/input|chat|send/.test(lower)) {
      return `Navigate to page → type in input → submit → verify response appears`
    }
    if (/cancel|stop|terminate/.test(lower)) {
      return `Start operation → click cancel/stop → verify operation ends and state reverts`
    }
    return `Navigate to page → perform interaction → verify expected outcome`
  }

  // Visual
  if (/badge|color|styl/.test(lower)) {
    return `Navigate to page → screenshot → verify visual appearance`
  }
  if (/group|section|sorted/.test(lower)) {
    return `Navigate to page → verify items are correctly grouped/sorted`
  }
  if (/display|show|appear|visible/.test(lower)) {
    return `Navigate to page → verify element is visible with correct content`
  }
  return `Navigate to page → screenshot → verify visual matches spec`
}

// Process each target
let updated = 0
for (const { trackId, planPath } of targets) {
  // Read spec.md for acceptance criteria
  const specPath = join(tracksDir, trackId, 'spec.md')
  let criteria = []

  if (existsSync(specPath)) {
    const specContent = readFileSync(specPath, 'utf-8')
    // Extract acceptance criteria lines
    const acMatch = specContent.match(/## Acceptance Criteria\s*\n([\s\S]*?)(?=\n## |\n---\n|$)/)
    if (acMatch) {
      criteria = acMatch[1]
        .split('\n')
        .map(line => line.replace(/^[-*]\s*\[[ x]\]\s*/, '').trim())
        .filter(line => line.length > 5)
    }
  }

  // Fallback: extract from plan.md task descriptions if no criteria found
  if (criteria.length === 0) {
    const planContent = readFileSync(planPath, 'utf-8')
    const taskLines = planContent.match(/- \[[ x~]\] Task \d+\.\d+: (.+)/g)
    if (taskLines) {
      // Use unique task descriptions as criteria
      criteria = taskLines
        .map(line => line.replace(/- \[[ x~]\] Task \d+\.\d+: /, '').trim())
        .slice(0, 8) // Cap at 8 for readability
    }
  }

  if (criteria.length === 0) {
    console.log(`WARN: No criteria found for ${trackId}, using generic plan`)
    criteria = ['Feature implemented as specified']
  }

  // Build Verification Plan table
  const rows = criteria.map((c, i) => {
    const testType = classifyTestType(c)
    const steps = generateTestSteps(c, testType)
    // Truncate long criterion text for table readability
    const shortCriterion = c.length > 80 ? c.slice(0, 77) + '...' : c
    return `| ${i + 1} | ${shortCriterion} | ${testType} | ${steps} |`
  })

  const vpSection = `## Verification Plan

| # | Acceptance Criterion | Test Type | Test Steps |
|---|---------------------|-----------|------------|
${rows.join('\n')}

**Test Type Legend:**
- **Interaction** — Playwright clicks, form fills, state assertions
- **Visual** — Navigate + screenshot + visual inspection
- **API** — curl/fetch endpoint + assert response
- **Skip** — Backend-only or covered by unit tests`

  // Insert into plan.md — before "## Post-Implementation Checklist" or before final "---"
  let planContent = readFileSync(planPath, 'utf-8')

  // Try insertion points in order of preference
  const insertionPatterns = [
    /(\n## Post-Implementation Checklist)/,
    /(\n## Phase \d+: Post-Implementation)/,
    /(\n---\s*\n_Generated by Conductor)/,
    /(\n---\s*$)/,
  ]

  let inserted = false
  for (const pattern of insertionPatterns) {
    if (pattern.test(planContent)) {
      planContent = planContent.replace(pattern, `\n${vpSection}\n$1`)
      inserted = true
      break
    }
  }

  if (!inserted) {
    // Append before the last line
    planContent = planContent.trimEnd() + `\n\n${vpSection}\n`
  }

  writeFileSync(planPath, planContent, 'utf-8')
  console.log(`✅ ${trackId} (${criteria.length} criteria)`)
  updated++
}

console.log(`\nDone! Updated ${updated} plan.md files.`)
