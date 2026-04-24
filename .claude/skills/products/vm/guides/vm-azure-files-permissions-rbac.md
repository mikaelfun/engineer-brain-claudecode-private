# VM Azure Files 权限与 RBAC — 排查速查

**来源数**: 1 (AW) | **条目**: 12 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Files AD DS authentication or NTFS authorization fails for synced user or group despite correc | OnPremisesSecurityIdentifier attribute not correctly synchronized between on-pre | 1) Get on-prem SID: whoami /user or Get-ADUser -Identity <user>. 2) Get Azure AD | 🔵 7.5 | AW |
| 2 | User with file share level RBAC permissions navigates to Azure portal file share browse but gets acc | User lacks reader-level RBAC permissions at the storage account scope or higher. | Assign at least Reader role at storage account level or higher scope (e.g. subsc | 🔵 7.5 | AW |
| 3 | AuthorizationPermissionMismatch error when accessing Azure File Share over REST using OAuth: This re | User/group/service principal lacks required RBAC permissions/role assignments fo | 1) Query DGrep FileFrontEndSummaryPerfLogs for HTTP 403 + AuthorizationPermissio | 🔵 7.5 | AW |
| 4 | Net use error code 1326 'The username or password is incorrect' when accessing Azure File Share with | Applications running as SYSTEM/Network Service use computer account SID which ha | Computer accounts require default share level permissions for AD Auth. Configure | 🔵 7.5 | AW |
| 5 | System error 5 'Access is denied' when accessing Azure File Share with identity-based auth due to mi | User missing either share-level RBAC permissions (SMB Reader/Contributor/Elevate | 1) Verify RBAC via ASC Resource Explorer at storage account/file share level. 2) | 🔵 7.5 | AW |
| 6 | Get-AzStorageFileHandle returns 403 AuthorizationFailure when running from Azure Serial Console or C | MSI-based authentication from Serial Console/Cloud Shell uses managed identity t | Run handle commands from a local machine or Azure VM with proper interactive Con | 🔵 6.5 | AW |
| 7 | Restoring files from Azure File Share backup does not restore manually assigned NTFS ACLs; only inhe | Storage Account Firewall is set to Disabled with Private Endpoints configured. B | Set Storage Account Firewall to "Enabled from all networks" or "Enabled from sel | 🔵 6.5 | AW |
| 8 | Cannot take ownership of Azure File Share or set NTFS ACLs via domain identity; Robocopy with securi | Platform limitation: AD-authenticated domain identity lacks TakeOwnership/WRITE_ | Mount file share using storage account name and key (super-user access) for lift | 🔵 6.5 | AW |
| 9 | On-premises domain not visible in "From this location" when setting NTFS permissions on Azure File S | Known transient issue after initial domain join of storage account to AD DS | Wait a few hours and retry. If persists beyond a few hours, create ICM to Azure  | 🔵 6.5 | AW |
| 10 | Access Denied for root or specific folders in Azure File Share while child folders are accessible wi | Default NTFS ACLs are missing on the file share or folder | Mount file share using storage key and verify default ACLs exist: BUILTIN\Admini | 🔵 6.5 | AW |
| 11 | Cannot use cloud-only Entra groups for file-level permissions on Azure Files SMB share | Application Tag for cloud-only SIDs preview not enabled in Entra app manifest | Enable the cloud-only SIDs preview tag in the Entra application manifest file. R | 🔵 6.5 | AW |
| 12 | Azure Files SMB: Security recommended action about potentially unintended elevation of privileges fo | Custom RBAC role definitions using wildcard (*) for Actions or DataActions on Az | Update RBAC role assignments to replace wildcard (*) with explicit Storage Files | 🔵 5.0 | AW |

## 快速排查路径

1. **Azure Files AD DS authentication or NTFS authorization fails for synced user or **
   - 根因: OnPremisesSecurityIdentifier attribute not correctly synchronized between on-premises Active Directory and Azure AD via 
   - 方案: 1) Get on-prem SID: whoami /user or Get-ADUser -Identity <user>. 2) Get Azure AD SID: Connect-AzureAD, then Get-AzureADUser -objectid <oid> | fl to ch
   - `[🔵 7.5 | AW]`

2. **User with file share level RBAC permissions navigates to Azure portal file share**
   - 根因: User lacks reader-level RBAC permissions at the storage account scope or higher. Share-level permissions alone are insuf
   - 方案: Assign at least Reader role at storage account level or higher scope (e.g. subscription level). Verify permissions via portal IAM blade.
   - `[🔵 7.5 | AW]`

3. **AuthorizationPermissionMismatch error when accessing Azure File Share over REST **
   - 根因: User/group/service principal lacks required RBAC permissions/role assignments for the requested data action. Failures lo
   - 方案: 1) Query DGrep FileFrontEndSummaryPerfLogs for HTTP 403 + AuthorizationPermissionMismatch. 2) Get UserObjectId from logs. 3) Check verbose logs (Nepho
   - `[🔵 7.5 | AW]`

4. **Net use error code 1326 'The username or password is incorrect' when accessing A**
   - 根因: Applications running as SYSTEM/Network Service use computer account SID which has no corresponding Azure RBAC identity, 
   - 方案: Computer accounts require default share level permissions for AD Auth. Configure via Share-level permissions for all authenticated identities. To dete
   - `[🔵 7.5 | AW]`

5. **System error 5 'Access is denied' when accessing Azure File Share with identity-**
   - 根因: User missing either share-level RBAC permissions (SMB Reader/Contributor/Elevated) or file/directory-level NTFS permissi
   - 方案: 1) Verify RBAC via ASC Resource Explorer at storage account/file share level. 2) For NTFS: mount share with account key first, assign permissions: ica
   - `[🔵 7.5 | AW]`

