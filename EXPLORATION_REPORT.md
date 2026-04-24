# EngineerBrain Complete Exploration Report

## Executive Summary
**EngineerBrain** is a sophisticated Azure support case automation system for Kun Fang.
- Main Agent + 13 Sub-agents + 27 top-level skills
- 3-step pipeline: data-refresh → act → summarize
- React dashboard (Hono backend, SSE-driven)
- Migrated from OpenClaw on 2026-03-16

## 1. CASE DATA STRUCTURE
- Path: config.json → casesRoot (default: ../data-dev/cases)
- Layout: cases/active/{case-id}/, archived/, transfer/, archive-log.jsonl
- Per-case files: case-info.md, casework-meta.json, case-summary.md, emails.md, notes.md, timing.json, claims.json, etc.
- Subdirectories: attachments/, analysis/, drafts/, research/, kusto/, teams/, icm/, logs/, context/, kb/, todo/
- AR Cases: Identified by 19+ digit case number, separate communication channel (notes-ar.md)

## 2. DATA SOURCES & CONFIG
- D365 CRM (Playwright + MCP): Case metadata, emails, notes, labor, SLA timers
- Teams (MCP): Chat history (multi-strategy search: caseNumber → customer name → conversationId)
- ICM (MCP): Summary, discussions, status (fingerprint-based caching, 4h TTL for ACTIVE)
- Kusto (MCP): Product-specific diagnostics (8 products: VM, AKS, ACR, AVD, Disk, EOP, Entra-ID, Monitor)
- M365 Copilot (WorkIQ skill): Workplace intelligence
- OneNote (MCP): Personal + team notebooks with auto-RAG sync
- External: mooncake-cc.json (customer ↔ CC mapping), KB articles, ADO Wiki

## 3. MEMORY SYSTEM
- Long-term: memory/MEMORY.md (111 lines, core knowledge base)
- Daily logs: memory/daily/YYYY-MM-DD.md (14 files, session observations)
- Per-agent specs: .claude/agents/ (12 lightweight definitions)
- Key learnings: Main Agent never bypasses subagents, Teams multi-strategy search, IR/FDR/FWR dual selectors, 33% speedup from caching

## 4. CASEWORK SKILL HIERARCHY
- L1: casework/SKILL.md (Full Mode: data-refresh → act → summarize; Patrol Mode: bulk scanning)
- L2: data-refresh/, act/, summarize/, labor-estimate/, note-gap/ substeps
- L3: assess/, troubleshoot/, reassess/, draft-email/, challenge/ action components
- State mgmt: L1 writes step-level, L2(act) writes action-level, L3 no state writing

## 5. WORKIQ SKILL
Purpose: Query M365 Copilot for workplace intelligence (emails, meetings, calendar, documents, people expertise)
Critical Rule: USE WorkIQ for ANY workplace-related question
MCP Tool: ask_work_iq(question: string)

## 6. CONNECT / REVIEW FEATURES
Current Status: No formal connect/review features exist
Available mechanisms: Challenge Gate, Case Summary Review, Execution Plan Review
Recommended workflows: Half-yearly 1-on-1, weekly digest, inline case review

## 7. SKILL STRUCTURE
27 top-level skills: Casework(4) + Case Data(8) + Diagnostics(8) + Utilities(7)

## 8. WORK PATTERNS
- Daily: Patrol → Case session → Follow-ups → Closure
- SLA: IR/FDR/FWR tracking, status: Succeeded/In Progress/Nearing/Expired
- Performance: 362s → 242s (33% improvement from -Force removal + 10-min caching)

## 9. EXECUTION LOG ARCHITECTURE
Per-run isolation: .casework/runs/{YYMMDD-HHmm}_{type}/
SSE triple write: Real-time broadcast + Memory store + Disk archive

## 10. CASE LIFECYCLE STATE MACHINE
Statuses: new, pending-engineer, pending-customer, pending-pg, researching, ready-to-close, resolved, closed
Ready-to-close gate: Sends closure-confirm before final closure

## 11. KNOWN ISSUES
- PS1 ↔ MCP gap (scripts can't call MCP)
- D365 tab state fragility
- Write Tool cache issues
- Project root calculation errors
- Teams selector instability (dual patterns needed)

## 12. DEVELOPER WORKFLOW
- Coding principles: Think → Simplicity → Surgical changes → Goal-driven
- Safety redlines: No email sends, no MCP mail writing, no rm -rf without confirm
- Preference: superpowers for new features, conductor for tracks, direct for ops

## 13. DASHBOARD ARCHITECTURE
Tech: React + TypeScript + Vite + Tailwind + Zustand + Hono + SSE
Constraint: Prohibit --watch mode (breaks SSE + zombie processes)

## RECOMMENDATION FOR CONNECT/REVIEW
Half-yearly 1-on-1 framework covering:
1. Workload & Impact (case counts, SLA metrics, closure rate)
2. Skill & Growth (new domains, patterns, playbooks)
3. Process Improvements (bottlenecks, automation, tool feedback)
4. Knowledge Base (KB articles, guides, documentation)

Data sources: archive-log.jsonl, timing.json, casework-meta.json, todo/, memory logs

