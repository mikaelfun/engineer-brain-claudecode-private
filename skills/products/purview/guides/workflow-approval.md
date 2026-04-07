# Purview 工作流审批 -- Quick Reference

**Entries**: 2 | **21V**: all-applicable | **Confidence**: low
**Last updated**: 2026-04-07

## Symptom Lookup
| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Workflow approval via actionable email in Outlook shows 403 error. | By-design: Approval via actionable emails in Outlook only supported for Purview ... | Click View item detail in the email and approve from the Purview portal. Ensure Purview account has ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FWorkflow%2FWorkflow%20-%20Known%20issues%20and%20solutions) |
| 2 📋 | Workflow approval from Outlook returns HTTP 404 error. Same request works from Purview portal. | Tenant mismatch between Purview account tenant and the Outlook login tenant. App... | 1) Approve from Purview Portal (Workflows > Requests and approvals). 2) Ensure approver is logged in... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FWorkflow%2FWorkflow%20Approval%20from%20Outlook%20returns%20HTTP%20404%20Error) |

## Quick Troubleshooting Path

1. Click View item detail in the email and approve from the Purview portal. Ensure Purview account has public access if email approval is required. `[source: ado-wiki]`
2. 1) Approve from Purview Portal (Workflows > Requests and approvals). 2) Ensure approver is logged into Outlook in the same tenant as the Purview accou... `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Full troubleshooting workflow](details/workflow-approval.md#troubleshooting-workflow)