---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MPIP Scanner/How to: MPIP Scanner/How to: Enable trace level logging"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Scanner%2FHow%20to%3A%20MPIP%20Scanner%2FHow%20to%3A%20Enable%20trace%20level%20logging"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to: Enable Trace Level Logging for MPIP Scanner

## Introduction

How to enable Trace level logging for MPIP Scanner. Trace-level logs write significantly more detail to the `msipscanner.iplog` file and are useful for diagnosing complex Scanner issues.

## Prerequisites

- Access to Registry on the Scanner server
- Log in as the Scanner service account (or as admin with access to the service account's registry hive)

## Step-by-Step Instructions

1. Log into the Scanner server with the **Scanner service account**
2. Open **Registry Editor** (`regedit`)
3. Navigate to:
   ```
   HKEY_CURRENT_USER\Software\Microsoft\MSIP
   ```
4. Add the following registry value:

   | Field | Value |
   |-------|-------|
   | Name  | `LogLevel` |
   | Type  | `REG_SZ` |
   | Value | `Trace` |

5. Restart the **Microsoft Purview Information Protection Scanner** service

## Result

Once this key is inserted, subsequent scanner runs will write more verbose data into `msipscanner.iplog`. Remember to remove or reset the `LogLevel` value after capturing diagnostic logs to avoid excessive log file growth.
