---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Activity Explorer/How to: Activity Explorer/How to: Search the audit log for a missing activity explorer event"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FActivity%20Explorer%2FHow%20to%3A%20Activity%20Explorer%2FHow%20to%3A%20Search%20the%20audit%20log%20for%20a%20missing%20activity%20explorer%20event"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to: Search the Audit Log for a Missing Activity Explorer Event

## Introduction

When an event is missing from Activity Explorer, search the Audit log to verify whether the underlying audit event exists. Activity Explorer events are based on audit log data.

## Prerequisites

- Access to the Audit log in the Purview portal, or
- Access to Exchange Online PowerShell

## Step by Step Instructions

### Step 1: Connect to Exchange Online PowerShell or open Audit log in Purview portal

Use the correct Activity and Workload filters to search for the relevant audit log entry:

- For missing events, use `Search-UnifiedAuditLog` with appropriate `-Operations` and `-RecordType` parameters
- Match the date range, user, and operation type to what should have triggered the Activity Explorer event
- If the audit log entry exists but Activity Explorer does not show it, there may be a sync delay or filtering issue
- If the audit log entry does not exist, the source activity was not audited
