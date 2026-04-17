---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Logs and Reporting/Azure AD Workbooks"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20Logs%20and%20Reporting/Azure%20AD%20Workbooks"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD Workbooks

## Overview

Workbooks provide a flexible canvas for data analysis and rich visual reports within Azure portal. They tap into multiple data sources from across Azure and combine them into unified interactive experiences.

## Key Workbooks

### Conditional Access gap analyzer workbook
- Highlights user sign-ins with no conditional access policies applied
- Helps verify no users, applications, or locations unintentionally excluded from CA policies

### Sensitive operations report workbook
- Identifies recent sensitive operations in tenant
- Flags potential service principal compromise

## Escalation Path

All ICMs should be first reviewed by TAs or PTAs.

**Initial triage**: SCIM LOB - Identity and Access / CRI Escalation Triage

### Workbook Owners

| Workbook Name | Owning Team / IcM Path |
|---|---|
| Authentication prompts analysis | MFA Team (PM: Julia Pettere) |
| Windows Update for Business Reports | Windows Autopatch Service / DevOps-DataPlatform |
