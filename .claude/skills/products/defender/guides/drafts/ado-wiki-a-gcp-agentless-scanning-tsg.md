---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/Vulnerability Assessment/Agentless scanning VM VA/GCP Agentless scanning/[TSG] GCP Agentless scanning"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Servers%2FVulnerability%20Assessment%2FAgentless%20scanning%20VM%20VA%2FGCP%20Agentless%20scanning%2F%5BTSG%5D%20GCP%20Agentless%20scanning"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [TSG] GCP Agentless Scanning

## Overview

There is no health page for Agentless scanning in GCP. A scanned instance should show VA and Secrets Scanning recommendations (healthy or not) as indicators.

If a customer suspects an instance was not scanned, determine whether the issue is in the **GCP Agentless Scanning platform** or in the **scanners** (VA, Secrets Scanning) processing.

## Pre-Escalation Checklist

Before reaching out to CESEC/MDC engineering team:

1. **Run diagnostic queries** from:
   - [TSG: GCP Agentless scanning platform issues](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/5794/-TSG-GCP-Agentless-scanning-platform-issues)
   - [TSG: GCP Agentless scanning VA issues](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/5795/-TSG-GCP-Agentless-scanning-VA-issues)

2. **Verify not a known limitation**: [GCP Agentless scanning: Limitations](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/10958/Google-Cloud-Platform-(GCP)-Agentless-scanning?anchor=limitations)

3. **Verify permissions**: [GCP Agentless scanning: Permissions](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/10958/Google-Cloud-Platform-(GCP)-Agentless-scanning?anchor=permissions)

4. **Check exclusion labels**: Verify instance is not excluded from scanning

## ICM Escalation Requirements

Include the following details:
1. Tenant and Subscription in Azure
2. Organization and Project in GCP
3. Relevant instances by their SelfLink
