---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Security Copilot Embedded in Entra/Supported Scenarios for Security Copilot in Entra"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FSecurity%20Copilot%20Embedded%20in%20Entra%2FSupported%20Scenarios%20for%20Security%20Copilot%20in%20Entra"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Supported Scenarios for Security Copilot in Entra - Reference

## Overview

Security Copilot Embedded in Entra does not exceed the signed-in user's access level. Each plugin has its own role requirements.

## Scenario Reference Table

| Scenario | Support Topic | Team | Required Roles | Licensing | Example Prompts |
|----------|--------------|------|---------------|-----------|-----------------|
| **Access Reviews** | Governance/Access reviews/Copilot | Security and Access Mgmt | Identity Governance Admin | Entra ID Governance/Suite/P2 | "Show me top 10 access reviews", "Who approved access in Q2 finance review?" |
| **Application Risk** | Workload ID/Identity Protection/Copilot | Identity Security & Protection | Global Admin, App Admin, Cloud App Admin | Workload Identities Premium (risky SP), P2 (app recommendations) | "Show me risky apps", "List unused apps" |
| **Audit Logs** | Governance/Audit Logs/Copilot | Organization Management | Reports Reader, Security Reader/Admin, Global Admin | Free | "Show me recently deleted groups", "Who created this group?" |
| **Conditional Access** | (see wiki) | (see wiki) | Security Reader+ | P1/P2 | "What CA policies apply to user X?" |
| **Device Management** | (see wiki) | (see wiki) | Various | Intune license | "Show me compliant devices" |
| **Group Details** | (see wiki) | (see wiki) | Various | Free | "Show me members of group X" |
| **Lifecycle Workflows** | (see wiki) | (see wiki) | Lifecycle Workflows Admin | Entra ID Governance | "Show me active workflows" |
| **Sign-in Logs** | (see wiki) | (see wiki) | Reports Reader+ | Free | "Show recent sign-ins for user X" |
| **User Details** | (see wiki) | (see wiki) | User Admin+ | Free | "Get details for user X" |
| **User Risk** | (see wiki) | (see wiki) | Security Reader+ | P2 | "Show risky users" |

## Access Reviews - Detailed Prompts
- Explore all configured access reviews in the tenant
- Get detailed info on a specific access review
- View access review decisions for a specific instance
- Track reviews assigned to a specific reviewer
- Identify decisions that went against AI recommendations
- View assigned reviewers for a specific access review

## Application Risk - Detailed Prompts
### Applications/Service Principals
- Which users are the owners for application {app_id}?
- Find the application ID for our HR Onboarding Portal
- Show me all apps that have 'Box' in the name

### Risky Service Principal
- Show me risky apps / What are the highest risk apps?
- What are the risk detections for the service principal with {app_id}?

### Entra App Recommendations
- List recommendations to improve app portfolio health
- Which enterprise applications have credentials about to expire?
- Which of our apps are stale or unused?

## Audit Logs - Detailed Prompts
- Show me recently deleted groups
- Who created this group?
- What groups were created by these users?
- Show me risky sign-ins
