---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Next-Gen - Defender for Cloud/Investigation & Response/Hunting/Advanced Hunting/[Support Boundaries] - Advanced Hunting"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FNext-Gen%20-%20Defender%20for%20Cloud%2FInvestigation%20%26%20Response%2FHunting%2FAdvanced%20Hunting%2F%5BSupport%20Boundaries%5D%20-%20Advanced%20Hunting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Advanced Hunting - Support Boundaries & Table Ownership Reference

> Note: This wiki is subject to changes

## Goal

This guide maps each Advanced Hunting table to its owning team (SAP). In Advanced Hunting, data is ingested directly into a specific table from its source. Therefore, the source team must own the case and drive it forward if there is any missing or incorrect data in the table. If there are questions around Advanced Hunting specifically, Defender for Endpoint drives the case. Questions around writing queries need to be handled by a CSA (Cloud Solution Architect).

_Management may direct you to work or collab on a case. Please follow their guidance over this wiki._

## Public Documentation
[Advanced Hunting Schema Tables](https://learn.microsoft.com/defender-xdr/advanced-hunting-schema-tables#learn-the-schema-tables)

## Table Reference

| Table Name | Description | Team Ownership |
|----------|----------|----------|
| AADSignInEventsBeta | Microsoft Entra interactive and non-interactive sign-ins | Microsoft Defender for Identity SAP: Azure\Microsoft Defender for Identity |
| AADSpnSignInEventsBeta | Microsoft Entra service principal and managed identity sign-ins | Microsoft Defender for Identity SAP: Azure\Microsoft Defender for Identity |
| AlertEvidence | Files, IP addresses, URLs, users, or devices associated with alerts | Various, depends on the "Alert Source" of the alert |
| AlertInfo | Alerts from MDE, MDO, MDCA, MDI, including severity and threat categorization | Various, depends on the "Alert Source" of the alert |
| BehaviorEntities | Behavior data types in MDCA | Defender for Cloud Apps: Azure\Microsoft Defender for Cloud Apps |
| BehaviorInfo | Alerts from MDCA | Defender for Cloud Apps: Azure\Microsoft Defender for Cloud Apps |
| CloudAppEvents | Events involving accounts and objects in Office 365 and other cloud apps | Defender for Cloud Apps: Azure\Microsoft Defender for Cloud Apps |
| DeviceEvents | Multiple event types including security controls | Microsoft Defender for Endpoint SAP: Security/Microsoft Defender/Microsoft Defender for Endpoint |
| DeviceFileCertificateInfo | Certificate info of signed files | Microsoft Defender for Endpoint SAP |
| DeviceFileEvents | File creation, modification, and other file system events | Microsoft Defender for Endpoint SAP |
| DeviceImageLoadEvents | DLL loading events | Microsoft Defender for Endpoint SAP |
| DeviceInfo | Machine information including OS | Microsoft Defender for Endpoint SAP |
| DeviceLogonEvents | Sign-ins and other authentication events on devices | Microsoft Defender for Endpoint SAP |
| DeviceNetworkEvents | Network connection and related events | Microsoft Defender for Endpoint SAP |
| DeviceNetworkInfo | Network properties of machines | Microsoft Defender for Endpoint SAP |
| DeviceProcessEvents | Process creation and related events | Microsoft Defender for Endpoint SAP |
| DeviceRegistryEvents | Creation and modification of registry entries | Microsoft Defender for Endpoint SAP |
| DeviceTvmHardwareFirmware | Hardware and firmware info | Microsoft Defender Vulnerability Management |
| DeviceTvmInfoGathering | TVM assessment events including config and attack surface states | Microsoft Defender Vulnerability Management |
| DeviceTvmSecureConfigurationAssessment | MDVM security configuration assessments | Microsoft Defender Vulnerability Management |
| DeviceTvmSecureConfigurationAssessmentKB | KB of security configurations | Microsoft Defender Vulnerability Management |
| DeviceTvmSoftwareEvidenceBeta | Evidence data for software detected on devices | Microsoft Defender Vulnerability Management |
| DeviceTvmSoftwareInventory | Software inventory including vulnerability info | Microsoft Defender Vulnerability Management |
| DeviceTvmSoftwareVulnerabilities | Software vulnerabilities on devices | Microsoft Defender Vulnerability Management |
| DeviceTvmSoftwareVulnerabilitiesKB | KB of publicly disclosed vulnerabilities | Microsoft Defender Vulnerability Management |
| EmailAttachmentInfo | Info about attachments in emails | Microsoft Defender for Office 365: Security/Microsoft Defender/Office 365 Defender |
| EmailEvents | Microsoft 365 email events | Microsoft Defender for Office 365 |
| EmailPostDeliveryEvents | Post-delivery security events | Microsoft Defender for Office 365 |
| EmailUrlInfo | Info about URLs on emails | Microsoft Defender for Office 365 |
| ExposureGraphEdges | Exposure Management graph edge info | Microsoft Security Exposure Management |
| ExposureGraphNodes | Exposure Management graph node info | Microsoft Security Exposure Management |
| IdentityDirectoryEvents | Events involving on-premises AD domain controller | Microsoft Defender for Identity |
| IdentityLogonEvents | Authentication events on AD and Microsoft online services | Microsoft Defender for Identity |
| IdentityQueryEvents | Queries for AD objects (LDAP, DNS, etc.) | Microsoft Defender for Identity |
| UrlClickEvents | Safe Links clicks from email, Teams, and Office 365 apps | Microsoft Defender for Office 365 |
| CloudAuditEvents | Control plane events from cloud resources | Microsoft Defender for Cloud |
| CloudProcessEvents | Process events from cloud workloads | Microsoft Defender for Cloud |

## Key Routing Rules

1. **Data missing/incorrect in a table** -> Route to the table's owning team (SAP)
2. **Advanced Hunting feature questions** -> Defender for Endpoint drives
3. **Query writing assistance** -> CSA (Cloud Solution Architect)
4. **MDC tables (CloudAuditEvents, CloudProcessEvents)** -> Microsoft Defender for Cloud team
