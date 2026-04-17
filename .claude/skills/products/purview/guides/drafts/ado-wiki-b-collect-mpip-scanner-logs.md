---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MPIP Scanner/How to: MPIP Scanner/How to: Collect MPIP Scanner logs"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Scanner%2FHow%20to%3A%20MPIP%20Scanner%2FHow%20to%3A%20Collect%20MPIP%20Scanner%20logs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to: Collect MPIP Scanner Logs

## Introduction

This is the way to collect MPIP Scanner logs.

## Prerequisites

- Access to the Scanner server (logged in as the Scanner service account)

## Steps

Provide the following link to the customer to collect logs using the `Export-DebugLogs` PowerShell cmdlet:

```
https://learn.microsoft.com/en-us/powershell/module/purviewinformationprotection/export-debuglogs
```

The `Export-DebugLogs` cmdlet bundles all MPIP Scanner diagnostic logs into a ZIP archive for analysis.
