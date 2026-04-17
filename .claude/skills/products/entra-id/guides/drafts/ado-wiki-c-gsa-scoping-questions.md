---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/GSA Scoping questions"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGSA%20Scoping%20questions"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GSA Scoping Questions

## Summary

High-level guidance on narrowing down GSA issues and collecting information for faster resolution.

## Initial Scoping

1. Tenant ID where GSA is configured
2. Does customer have M365 linked to same tenant?
3. Evaluating or production deployment?
4. Existing web-proxy/VPN/SSE solution?
5. Which GSA scenario deployed? (See matrix below)
6. Client type: Windows, Android, iOS? Latest version?
7. Agent or branch setup?
8. Run Client Checker or Connection Diagnostics tool
9. Internet Access or Private Access issue?
10. CA policy deployed to GSA traffic profile?

## Scenario Matrix

| Scenario | Description | Components |
|----------|-------------|------------|
| A | Secure M365 from managed DEVICES | GSA M365 profile, GSA client, CA, Adaptive access, TRv2 |
| B | Secure M365 from managed NETWORK | GSA M365 profile, branch setup, CA, TRv2 |
| C | Prevent external Entra resource access (TRv2) | TRv2 policies, GPO/Intune or NAAS |
| D | Secure intranet apps (any port/protocol) | App connectors, GSA client, CA, Quick Access/Enterprise App |
| E | Enterprise Apps from GSA compliant network only | CA policy, GSA client/branch, Adaptive Access |
| F | M365/PA traffic based on conditions (MFA, device) | CA policy, GSA client/branch, traffic profile |

## Internet Access Scoping

1. M365 profile or Internet Access issue?
2. Traffic profile configured?
3. Connection diagnostic showing channels green?
4. Symptoms and errors?
5. Tenant restriction enabled?

## Private Access Scoping

1. PA traffic profile configured?
2. GSA app or Quick Access configured?
3. App proxy group active connectors updated?
4. Latest private connector? (OS: Windows Server 2016+)
5. User assigned to PA app?
6. Connection diagnostic showing PA channel green?
7. Symptoms and errors?
8. Can access on-prem resource from connector server?

## Team Engagement

| Team | When to Engage |
|------|---------------|
| Auth (AAD) | PA app config, App proxy, Auth/AuthZ, CA config |
| Entra Network | Client-to-Edge connectivity, Branch config, Performance |
