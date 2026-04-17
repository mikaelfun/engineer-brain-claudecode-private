---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Contextual Cloud Security (aka Cloud Map)/[Product Knowledge] - Internet Exposure Analysis with Trusted IPs"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Contextual%20Cloud%20Security%20(aka%20Cloud%20Map)/%5BProduct%20Knowledge%5D%20-%20Internet%20Exposure%20Analysis%20with%20Trusted%20IPs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Internet Exposure Analysis with Trusted IPs — Deployment Guide

> **PREVIEW feature** as of import date.

[[_TOC_]]

## Feature Description

The Trusted IP Addresses feature in Microsoft Defender for Cloud allows customers to define specific IP address ranges considered **trusted**. Traffic from these trusted IP addresses will **not** trigger attack paths in Defender for Cloud, reducing noise and enhancing recommendation prioritization accuracy.

## Prerequisites

| Aspect | Details |
| --- | --- |
| **Required Plans** | Defender for CSPM plan **must** be enabled |
| **Required Roles & Permissions** | Resource Policy Contributor / Contributor / Owner |
| **Clouds** | Available in Commercial Clouds (Azure, AWS, GCP)<br>**Not available** in Nation/Sovereign (US Gov, China Gov, Other Gov) |

## Known Limitations

1. **Current release only supports Azure VM/VMSS** (AWS and GCP support planned)
2. **Cleanup/offboarding**: Removing the policy does **NOT** remove already-defined IP groups — must use the provided script for full cleanup

## Deployment Steps

### Section 1: Policy Definition

1. Go to [MDC GitHub - Define Trusted IPs Policy](https://github.com/Azure/Microsoft-Defender-for-Cloud/tree/main/Policy/Define%20MDC%20Trusted%20IPs)
2. Click "Deploy to Azure" button
3. Log in to Azure Portal
4. Select management group and region
5. Review and create

### Section 2: Policy Assignment

1. Go to Policy → Assignments → "Assign policy"
2. Select **"Deploy Microsoft Defender for Cloud Trusted IPs"**
3. Choose the scope for Trusted IPs
4. Under **Parameters**: specify IP ranges in CIDR notation or single IPs
5. Specify the location for IP group deployment

### Section 3: Policy Remediation

1. Go to Remediation tab
2. Assign system-assigned or user-assigned managed identity with **Contributor** permission
3. Go to Review + create → Create
4. Navigate to **Create remediation task** → Initiate deployment of IP groups per subscription → Remediate

**Note:** 
- New subscriptions under the managed group automatically inherit Trusted IPs (~15 min propagation)
- If Remediated Resources shows 0 out of 0 → wait a few minutes and retry

## Use Cases

- **Reduce noise**: Suppress attack paths involving known-safe IPs (e.g., approved admin access)
- **Cloud Security Explorer integration**: View trusted IP-related resources via graph queries

## Additional Information

- [Feature Flag (Preview)](https://portal.azure.com/?feature.ecs.EnableTrustedExposure=true#view/Microsoft_Azure_Security/SecurityMenuBlade/~/SecurityGraph)
- Public documentation: TBD at time of import
