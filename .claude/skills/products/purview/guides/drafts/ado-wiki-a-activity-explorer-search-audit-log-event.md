---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Activity Explorer/How to: Activity Explorer/How to: Search the audit log for an Activity Explorer event"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FActivity%20Explorer%2FHow%20to%3A%20Activity%20Explorer%2FHow%20to%3A%20Search%20the%20audit%20log%20for%20an%20Activity%20Explorer%20event"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to: Search the Audit Log for an Activity Explorer Event

## Introduction

This guide shows how to find the audit log event for any event that is **already showing** in Activity Explorer.

## Prerequisites

- Access to the Audit log in the Purview portal, or
- Access to Audit Log through PowerShell

## Background

**Activity Explorer events are based off the audit log.** To find the audit data the Activity Explorer event is based on, you can use the [Purview Portal](https://purview.microsoft.com/audit/auditsearch) or the [Search-UnifiedAuditLog](https://learn.microsoft.com/en-us/powershell/module/exchange/search-unifiedauditlog?view=exchange-ps) cmdlet.

## Step-by-Step Instructions

### Searching for a Specific Event

- Refer to [Audit Log Activities | Microsoft Learn](https://learn.microsoft.com/en-us/purview/audit-log-activities#sensitivity-label-activities) for different values available for **Operations**.
- Refer to [Audit Log RecordType | Microsoft Learn](https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-activity-api-schema#auditlogrecordtype) for different values available for **Record Types**.
- Use the relevant conditions while searching for a specific event.

```powershell
# Example: DLP rule match operation by specific user
Search-UnifiedAuditLog -StartDate "06/04/2024" -EndDate "06/05/2024" -UserIds Jack@contoso.com -Operations DlpRuleMatch -ResultSize 500

# Example: Label file actions, label detection in Transport and Auto Labeling events in Exchange using RecordType
Search-UnifiedAuditLog -StartDate ((Get-Date).addDays(-2)) -EndDate (Get-Date) -RecordType SensitivityLabelAction, MIPLabel, MipAutoLabelExchangeItem -ResultSize 5000
```

- Replace the values for **StartDate**, **EndDate**, **UserID** and **Operations** (or any other filter) with the values you see in Activity Explorer.
- For more details, refer to [How to: Search the audit log](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9080/How-to-Search-the-audit-log-for-an-event).
