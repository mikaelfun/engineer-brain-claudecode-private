---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Sensitivity Labels/Learn: Sensitivity Labels/When to reproduce Sensitivity Label issues"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Sensitivity%20Labels/Learn:%20Sensitivity%20Labels/When%20to%20reproduce%20Sensitivity%20Label%20issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# When to Reproduce Sensitivity Label Issues

Reproduce issues only if the process can be completed within three days:

- **Day 1:** Collect logs
- **Day 2:** Wait for distribution
- **Day 3:** Test
- **Exception:** For SPO scenarios, repro may take up to seven days

## Scenario Guidelines

| Scenario | Reproduce? | Notes |
|----------|-----------|-------|
| Label missing in a specific client | Skip | Normally needs client-side assistance or transfer. Check support boundaries. |
| Label missing everywhere | Skip | Start by checking distribution and overall configuration. |
| Issues with label watermark | Yes | Fairly easy and fast repro, provides insights on client behaviors. |
| Label encryption (assign permissions now) | Yes | Repro recommended. |
| Label encryption (assign permissions later) | Yes | Try to repro. |
| Label encryption (OME) | Yes | Repro recommended. |
| Label encryption (DKE) | Skip | Too complex. |
| Label inheritance | Yes | Strongly suggest trying to reproduce. |
| Different label behavior between clients | Yes | Quick repro before involving client teams to check if reproducible. |
| PDFs | Judgement | Depends on PDF client vs configs. Troubleshooting is limited. |
| S/MIME & labels | Skip | Not worth the effort. |
| Co-authoring | Judgement | Some scenarios worth repro, others too complicated. |
| Auto-labelling (simple) | Yes | Easy scenarios (1-2 policies, few locations). |
| Auto-labelling (complex) | Skip | Complex scenarios/difficult workloads may not be worth it. |
