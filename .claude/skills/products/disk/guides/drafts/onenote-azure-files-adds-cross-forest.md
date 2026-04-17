# Azure Files with AD DS Authentication (Cross-Forest)

## Architecture Overview
Azure Files AD DS auth creates an identity (computer account or service logon account) in AD DS representing the storage account for Kerberos authentication.

## Single Domain Steps
1. Enable AD DS authentication (via script)
2. Assign share-level permissions (Azure RBAC)
3. Assign directory/file level permissions (NTFS): mount share + icacls

## Cross-Forest Prerequisites
- Sufficient permissions in both forests
- Trust relationship between forests
- If using Azure RBAC: both forests reachable by single Microsoft Entra Connect Sync server

## Cross-Forest Setup Steps

### Option A: Modify Storage Account Suffix + CNAME (Recommended, works with 2+ forests)
1. Create forest trust
2. In **resource domain** DNS, add CNAME record:
   `<storage-account-name>.<DomainDnsRoot>` → `<storage-account-name>.file.core.chinacloudapi.cn`
3. Register cifs SPN in resource domain:
   ```
   setspn -s cifs/<storage-account-name>.<DomainDnsRoot> <storage-account-name>
   ```

### Option B: Custom Name Suffix + Routing Rule (Only works with exactly 2 forests)
1. Add UPN suffix in resource domain
2. Enable name suffix routing in user domain

## Password Management
- **Computer account**: password changes driven by client (netlogon service), does not expire in AD
- **Service account**: passwords can expire; use separated OU with GPO inheritance disabled

## Troubleshooting
1. **Verify Kerberos works**: test by creating/accessing normal SMB share; check netmon or auth logs
2. **IMPORTANT**: Kerberos failure with fallback to NTLM is NOT supported
3. **Check permissions**: verify both share-level (RBAC) and directory/file-level (NTFS)
4. **Group membership**: verify user group membership for proper access
