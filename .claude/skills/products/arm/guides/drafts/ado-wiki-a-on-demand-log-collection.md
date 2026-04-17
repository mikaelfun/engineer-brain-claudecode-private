---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Customer Scenarios/Diagnostics and Monitoring/On-Demand Log Collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FCustomer%20Scenarios%2FDiagnostics%20and%20Monitoring%2FOn-Demand%20Log%20Collection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> Applies to: Azure Local 2411.1 and later

This document helps you connect with support and provide logs for troubleshooting issues when Azure Local is operating in a disconnected mode.

## Overview

On-demand log collection lets you collect logs from Azure Local disconnected operations for troubleshooting purposes. This feature is useful when you need to provide logs to Microsoft support for troubleshooting issues.

## Supported scenarios

| Scenarios for log collection | How to collect logs |
| --- | --- |
| **Direct log collection** — device connected to Azure and management endpoint accessible | Trigger log collection with cmdlet `Invoke-ApplianceLogCollection`. Prerequisite: Setup observability config using `Set-ApplianceObservabilityConfiguration`. |
| **Indirect log collection** — device disconnected from Azure, management endpoint accessible | Trigger with `Invoke-ApplianceLogCollectionAndSaveToShareFolder`. Then use `Send-DiagnosticData` to upload from file share. |
| **Fallback log collection** — management endpoint inaccessible or IR VM is down | Shut down disconnected ops VM, mount and unlock VHDs, copy logs with `Copy-DiagnosticData`. Then `Send-DiagnosticData` to send manually. |

## Key cmdlets

- `Invoke-ApplianceLogCollection` — direct log collection (connected + endpoint accessible)
- `Invoke-ApplianceLogCollectionAndSaveToShareFolder` — indirect log collection (disconnected)
- `Get-ApplianceLogCollectionHistory` — view log collection history
- `Get-ApplianceLogCollectionJobStatus` — check running job status
- `Copy-DiagnosticData` — fallback: copy from mounted VHDs
- `Send-DiagnosticData` — upload logs to Microsoft

> Run these commands on the host that can access the management endpoint.

## Triage Azure Local issues

- `AzsSupportDataBundle` — Azure Local Support Diagnostic Tool
- `Send-AzStackHciDiagnosticData` — Get support for deployment issues
- `Get-SDDCDiagnosticInfo` — Collect diagnostic data for clusters, upload to CSS DTM share

## Prerequisites

1. Set up Azure resources via Deploy disconnected operations:
   - Resource group in Azure for the appliance
   - Service Principal (SPN) with contributor rights on the resource group
   - Copy `AppId` and `Password` for observability setup

2. Install the operations module:
   ```powershell
   Import-Module "<disconnected operations module folder path>\Azure.Local.DisconnectedOperations.psd1" -Force
   ```

3. Set up management endpoint client context:
   ```powershell
   $certPasswordPlainText = "***"
   $certPassword = ConvertTo-SecureString $certPasswordPlainText -AsPlainText -Force
   $context = Set-DisconnectedOperationsClientContext `
     -ManagementEndpointClientCertificatePath "<cert path>" `
     -ManagementEndpointClientCertificatePassword $certPassword `
     -ManagementEndpointIpAddress "<IP address>"
   ```

4. Retrieve BitLocker keys (for fallback VHD mounting)
