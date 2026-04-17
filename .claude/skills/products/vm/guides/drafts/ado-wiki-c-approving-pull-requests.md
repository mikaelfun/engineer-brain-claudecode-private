---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Knowledge Management (KM)/Approving Pull Requests_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FKnowledge%20Management%20%28KM%29%2FApproving%20Pull%20Requests_Process"
importDate: "2026-04-06"
type: process-guide
---

# Approving Pull Requests — AzureIaaSVM Wiki

## Summary

The OneVM (AzureIaaSVM) wiki is the main knowledge base for the Azure IaaS VM team. All content updates must be reviewed and approved by appropriate teams to ensure wiki integrity.

## Required Approvers

Each PR requires a **minimum of two approvers** before it can be merged:

1. **A Subject Matter Expert (SME)** from the topic, or a **Technical Advisor (TA)** from the topic's vertical, for **each** topic the PR modifies.
   - If editing content outside a SME folder (e.g., Tools or Process page), any TA can approve.
   
2. **A Knowledge Management (KM) member** who will review for grammar, PII, wiki standards, etc. KM also completes (merges) the PR once all approvals are received.

> A single PR editing multiple topics may require more than two approvals.

To be added to a SME/TA group or join KM: see [FAQ on Wiki Permissions](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/506083?anchor=frequently-asked-questions-(faq)).

## Microsoft Writing Style Guide

- [Welcome - Microsoft Style Guide](https://docs.microsoft.com/en-us/style-guide/welcome/)

## Approver Checklists

### TA/SME Review Checklist

| Item | Description |
|------|-------------|
| Still Relevant | Is the issue still relevant? Has it been mitigated by PG? |
| Technical Accuracy | Error messages up to date? Images current? |
| Troubleshooting Instructions | Are instructions up to date? Test if possible. |
| Bash/PowerShell/CLI/Kusto commands | Are commands up to date and correct? Test if possible. |
| New Engineer Ready | Are steps easy for a new engineer to follow? |
| Flow | Proper flow, "Microsoft voice", etc. |
| Future Planning | Forethought for upcoming releases/announcements. |

**Full Review**: new page → review entire page.  
**Partial Review**: only updating existing page → review added/changed items only.

### KM Review Checklist

| Item | Description |
|------|-------------|
| **PII** | Verify NO PII in content AND images every time. |
| File Extension | File name ends in `.md`? |
| File Name | Named properly? No spaces (use `-` instead). Example: `Approving-Pull-Requests_Process.md` |
| File Location | Correct folder per SME area/page type? |
| Folder Structure | No files/folders added outside assigned folder? No folders renamed (breaks PR policies)? |
| Tags | Required tags at top of page? New/full review page has `Reviewed-MM-YYYY` tag? |
| Table of Contents | `[[_TOC_]]` under Tags? |
| Correct Feedback Template | Valid Feedback Template at bottom of page? |
| Link Formatting | All links use Markdown PageID format. No HTML links. No relative paths. |
| Images | All images load? Use markdown syntax? No spaces in filename (use `-`). |
| Reading comprehension | Content is comprehensible. |
| Process Docs | Renamed processes? New processes need an "owner"? PR policy needed? |
| Deletions | **DO NOT merge a PR with deletions!** We archive (rename with `.archive` extension). |

## Adding Comments During Review

1. From the PR → navigate to **Files** tab.
2. Hover over a line → comment box appears → click to leave a comment.
3. **Note**: View must be **Inline**, **Raw content**, or **Side-by-Side** (not Preview) for commenting.
4. Use "Insert a suggestion" button to auto-generate a codeblock with the exact replacement text.
5. Continue adding comments until all revisions are addressed.

## Approving Pull Requests

- If no revisions required, or after all revisions are complete → click **Approve** button.
- If revisions were necessary → wait for author to edit and **Resolve** all comments → second review.
- **Recommended**: Do NOT approve until revisions are complete.
- KM member is responsible for "completing" (merging) the PR once all approvals received.

## Special Circumstances

If someone votes to 'Reject' or 'Waiting for author', their vote overrides other approvals.

- Review their comments → address them → ask them to reconsider their vote.
- If that person is unavailable (left company or on extended vacation) → email KM team: [azvmkm@microsoft.com](mailto:azvmkm@microsoft.com)
