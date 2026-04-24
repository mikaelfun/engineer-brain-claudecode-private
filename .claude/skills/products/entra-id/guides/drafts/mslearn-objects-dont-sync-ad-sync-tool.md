---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/user-prov-sync/objects-dont-sync-ad-sync-tool
importDate: "2026-04-24"
type: guide-draft
---

# Objects Don't Sync When Using Azure AD Sync Tool

Multi-scenario troubleshooting guide for AD DS objects/attributes failing to sync to Microsoft Entra ID.

## Common Causes

- Domain value used by AD DS attributes not verified
- Duplicate attribute values (proxyAddresses, UPN) in existing accounts
- Attribute formatting violations (character set, length)
- Attributes matching exclusion rules for directory sync

## Default Sync Scoping Rules

Key exclusion conditions:
- Contact: DisplayName contains "MSOL" or msExchHideFromAddressLists=True
- Security group: isCriticalSystemObject=True
- Mail-enabled groups: No SMTP proxy address and no mail attribute
- User: mailNickName starts with "SystemMailbox" or "CAS_"; sAMAccountName equals "SUPPORT_388945a0" or "MSOL_AD_Sync"

## Resolution Approaches

### IdFix Tool
- Run IdFix DirSync Error Remediation Tool to find duplicates, blanks, and rule violations
- "Blank" in ERROR column: Set displayName attribute
- "Duplicate" in ERROR column: Assign unique email address

### Manual Attribute Conflict Resolution
1. Use LDP.exe to examine on-premises object attributes (UPN, proxyAddresses)
2. Connect to Entra ID via PowerShell
3. Check for duplicate UPN: Get-MSOLUser -UserPrincipalName
4. Check for duplicate proxyAddresses via Get-EXOMailbox
5. Resolve conflicts by updating duplicate values
