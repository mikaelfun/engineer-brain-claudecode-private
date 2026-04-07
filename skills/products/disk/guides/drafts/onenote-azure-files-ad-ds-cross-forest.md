# Azure Files AD DS Authentication (Cross-Forest)

> Source: OneNote — [File] with AD DS Auth (cross-forest)
> Status: draft

## Overview
Azure Files supports AD DS authentication for SMB access. Cross-forest scenarios require additional trust and SPN configuration.

## Single Domain Setup
1. Enable AD DS via script (creates computer/service account in AD representing the storage account)
2. Assign share-level permission via Azure RBAC
3. Assign directory/file level permissions via NTFS: mount share then use `icacls`

## Cross-Forest Setup

### Prerequisites
- Sufficient permissions in both forests
- Trust relationship between forests
- If using Azure RBAC: both forests must be reachable by a single Microsoft Entra Connect Sync server

### Steps
1. **Create trust** between forests
2. **Configure domain suffixes** — critical step due to storage account SPN ending with `file.core.chinacloudapi.cn`

#### Option A: CNAME + SPN (recommended, works with 2+ forests)
```
# In resource domain DNS, add CNAME:
onprem1sa.onpremad1.com -> onprem1sa.file.core.chinacloudapi.cn

# Register SPN:
setspn -s cifs/<storage-account-name>.<DomainDnsRoot> <storage-account-name>
```
CNAME record and cifs SPN must be added in the **resource domain**.

#### Option B: Custom Name Suffix + Routing Rule (only works with 2 forests)
- Add UPN suffix in **resource domain**
- Enable name suffix routing in **user domain**

## Key Notes
- **Identity sync required**: Identities must be synced to Microsoft Entra ID for share-level RBAC enforcement
- **Password management**: Computer accounts driven by netlgon (no expiry in AD); Service accounts can expire (use separated OU with GPO inheritance disabled)
- **Kerberos fallback**: Kerberos failure does NOT fall back to NTLM — NTLM is not supported
- **Group membership**: Check user group membership when troubleshooting permission issues

## General Troubleshooting
1. Confirm Kerberos authentication works — test with normal SMB share first
2. Check network trace (netmon) or auth logs for Kerberos ticket exchange
3. Verify Share permission and NTFS permission are assigned
4. Check user Group Membership carefully
