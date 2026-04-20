---
title: Intune Synced Attributes from AD DS
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/general/intune-synced-attributes-list
product: intune
dateCreated: 2026-04-18
---

# Intune Synced Attributes from AD DS

Reference table of attributes synced from on-premises Active Directory Domain Services (AD DS) to Microsoft Intune.

## Key Attributes

| Attribute | User | Contact | Group | Intune Required | Description |
|-----------|------|---------|-------|-----------------|-------------|
| AccountEnabled | X | | | X | Whether account is active |
| c | X | X | | X | Country/Region code |
| cn | X | | X | | Common name |
| description | X | X | X | X | Descriptive phrases |
| displayName | X | X | X | X | Display name |
| mail | X | X | X | X | Email addresses |
| mailnickname | X | X | X | X | Friendly mail name |
| member | | | X | X | Object, not attribute |
| objectSID | X | | | | Unique object ID |
| proxyAddresses | X | X | X | X | Foreign mail system address |
| pwdLastSet | X | | | | Time of last password change |
| securityEnabled | | | X | X | Whether group is security group |
| sourceAnchor | X | X | | | Links on-prem to Entra account |
| usageLocation | X | | | | Usage location |
| userPrincipalName | X | | X | X | UPN |

## Notes
- Objects must contain values in these attributes to be considered for sync
- sourceAnchor links each on-prem account to the corresponding Microsoft Entra account
