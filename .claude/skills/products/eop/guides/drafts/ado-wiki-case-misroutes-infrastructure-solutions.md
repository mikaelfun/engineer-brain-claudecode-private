---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Case Misroutes/Infrastructure Solutions"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Troubleshooting%20Guides/Case%20Misroutes/Infrastructure%20Solutions"
importDate: "2026-04-05"
type: routing-guide
---

# Case Misroutes: Infrastructure Solutions

SAPs:
- Azure/Microsoft Defender for Cloud (MDC)
- Azure/Microsoft Sentinel
- Azure/Microsoft Defender for IoT
- Azure/App Compliance Automation Tool for Microsoft 365
- Azure/Microsoft Azure Attestation
- Security/Microsoft Security Exposure Management
- Security/Microsoft Defender External Attack Surface Management

## Microsoft Defender for Cloud (MDC)
Handles cloud security posture and workload protection; transfer cases about securing Azure resources, multi-cloud compliance, or cloud vulnerability alerts.

## Microsoft Sentinel
A SIEM/SOAR platform; send cases about log ingestion, analytics rules, hunting queries, or incident correlation across multiple data sources.
- If your team owns the table AND in Sentinel running the query and have questions → collab
- Something never seen before → send directly to Sentinel

## Microsoft Defender for IoT
Focuses on IoT/OT device security; route issues about unmanaged devices, industrial networks, or IoT threat detection.

## App Compliance Automation Tool for Microsoft 365
Automates compliance checks for apps; transfer cases about app certification, compliance reports, or regulatory readiness.

## Microsoft Azure Attestation
Provides trusted attestation for VMs and confidential workloads; send cases about verifying platform integrity or attestation failures.

## Microsoft Security Exposure Management
Identifies attack paths and exposure risks; route cases about exposure scoring, attack surface analysis, or proactive risk reduction.
Note: Most SecureScore cases are to be brought here soon.

## Microsoft Defender External Attack Surface Management (EASM)
Monitors external-facing assets for vulnerabilities; transfer cases about internet-exposed assets, shadow IT discovery, or external risk alerts.
