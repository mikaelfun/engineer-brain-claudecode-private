---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Delegate Approvals in My Access"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FDelegate%20Approvals%20in%20My%20Access"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Delegate Approvals in My Access

Approval delegation allows approvers to assign another individual to respond to access package approval requests on their behalf.

## Licensing

Requires Microsoft Entra ID Governance.

## Key Limitations

- Delegation limited to **one level** (A→B→C: C won't receive A's approvals)
- Any user object (Guest/Member) can be delegate; **groups not supported**
- Admins **cannot restrict** who can be set as delegate
- Admins **cannot see** who is set as delegate for a user
- Audit logs do **not** indicate the approval was performed by a delegate
- Access Reviews delegation coming November 2025

## Enabling

1. Identity Governance > Preview Features > "Allow users to delegate approvals and access reviews in My Access"
2. Check enable option, click Save
3. **Important**: Click Save on the Preview Features page to actually enable

## Setting a Delegate

1. User goes to https://aka.ms/myaccess
2. Under Access Reviews/Approvals > Delegate Approvals button
3. Set delegate user, start/end dates
4. Only one delegate at a time

## Removing a Delegate

1. My Access > Approvals/Access Reviews
2. Delegate Approvals button > Remove Delegate > Confirm

## ICM Path

**Owning Service**: AAD Access Reviews
**Owning Team**: Access Reviews
