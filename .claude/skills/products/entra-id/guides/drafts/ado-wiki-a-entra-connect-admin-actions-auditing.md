---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/General/Entra Connect Admin Actions Auditing"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FGeneral%2FEntra%20Connect%20Admin%20Actions%20Auditing"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Entra Connect Admin Actions Auditing

## Overview

Entra Connect Sync now supports audit logging for Admin Actions in the Windows Event Viewer / Application logs (introduced Mid-January 2025). This addresses the limitation that previously there was no record of when or who performed admin actions in the Entra Connect client.

**Note:** This auditing applies only to Entra Connect Sync, NOT Entra Cloud Sync.

## Auditable Admin Actions

| Event ID | Action |
|----------|--------|
| 2503 | Add / Update / Delete Directories |
| 2504 | Enable Express Settings Mode |
| 2505 | Enable / Disable all Domains and OUs for Sync |
| 2506 | Enable / Disable PHS Sync |
| 2507 | Enable / Disable Sync Start After Install |
| 2508 | Create ADDS Account |
| 2509 | Use Existing ADDS Account |
| 2510 | Create / Update / Delete custom inbound sync rule |
| 2511 | Enable / Disable Domain based filtering |
| 2512 | Enable / Disable OU based filtering |
| 2513 | User Sign-In method changed |
| 2514 | Configure new ADFS farm |
| 2515 | Enable / Disable Single sign-on |
| 2516 | Install web application proxy server |
| 2517 | Set Permissions |
| 2518 | Change AD DS Connector Password credential |
| 2519 | Reinitialize Entra ID Connector account password |
| 2520 | Install ADFS Server |
| 2521 | Set ADFS Service Account |

## Covered Admin Operations

- Synchronize User Objects from On-Premises AD to Entra
- Define attribute mappings
- Enable or Disable Synchronization
- Configure Password Hash Sync
- Configure ADFS and PingFederate Federation
- Configure Passthrough Authentication
- Enable/Disable Single Sign-On (SSO)

## Escalation

Service Name: Azure Active Directory Connect
Team: Customer Escalations - AADConnect
