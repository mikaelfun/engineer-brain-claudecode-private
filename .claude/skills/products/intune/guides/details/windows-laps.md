# Intune Windows LAPS — 综合排查指南

**条目数**: 5 | **草稿融合数**: 8 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-Windows-LAPS-Cloud-LAPS.md, onenote-laps-automatic-account-management.md, onenote-laps-azure-ad-support-guide.md, onenote-laps-event-log-troubleshooting.md, onenote-windows-laps-azure-ad-configuration.md, onenote-windows-laps-azure-ad.md, onenote-windows-laps-kusto-queries.md, onenote-windows-laps-support-boundaries.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: A Windows Laps Cloud Laps
> 来源: ADO Wiki — [ado-wiki-a-Windows-LAPS-Cloud-LAPS.md](../drafts/ado-wiki-a-Windows-LAPS-Cloud-LAPS.md)

**Compliance note**
**Summary**
**Public Documents**
- [What is Windows LAPS?](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview)
- [LAPS CSP](https://learn.microsoft.com/en-us/windows/client-management/mdm/laps-csp)
- [Windows LAPS Group Policy](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-management-policy-settings#windows-laps-group-policy)
- [Legacy Microsoft LAPS](https://www.microsoft.com/en-us/download/details.aspx?id=46899)

**Requirements**

**Operating Systems**
- Windows LAPS currently supported on Windows 11 Insider Preview Build 25145+ and Windows Server and Windows Server Core Insider builds.
- Windows 10 20H2 and later (3rd Tuesday in March - Optional)
- Windows 11 21H2 and later (last Tuesday in March - Optional)
- Windows Server 2019 and later (2nd Tuesday in April)

**Roles**

**Read LAPS metadata stored in Azure AD**

**Recover LAPS passwords stored in Azure AD**

**Custom Azure AD RBAC roles**

**Licensing**
- Windows license (Pro, OEM, etc - Enterprise or E3 not required)
- Microsoft Intune license (if managing device using Intune)
- Azure AD license 
    - Free for baseline features (enabling LAPS, storing encrypted password, password retrieval, audit logs)
    - Premium when using capabilities like Conditional Access (require MFA when accessing password), Administrative Units (who can retrieve password on which set of devices)

**Limitations**
- Windows LAPS does not support Azure Active Directory workplace-joined clients.
- Hybrid-joined devices (joined to both Azure Active Directory and Windows Server Active Directory) can't back up passwords to both Azure Active Directory and Windows Server Active Directory at the same time.
- By default, LAPS only manages the password of the local built-in administrator account which ends with a Relative Identifier (RID) of -500. However, this can target a different local administrator account using MDM, Domain or Local policy. 

**Support Boundaries**

**FAQ**

**Is Windows LAPS supported on non Windows platforms?**

**Is Windows LAPS backup to Azure AD supported for Azure AD registered (aka Workplace Join) devices?**

**Which Windows OS platforms is Windows LAPS supported on?**
- Windows 10 20H2 and later with 2303C patch.
- Windows 11 21H2 and later with 2303D patch.
- Windows Server 2019 and later with 2304B patch.

**Is Windows LAPS management configuration supported using GPO?**

**Is Windows LAPS management configuration supported using MDM?**

**Is there a tenant wide setting for LAPS?**

**Does Windows LAPS create local admin account (when not present) based on the administrator account name configured using LAPS policy?**

**Does Windows LAPS rotate and backup password for a device that is disabled in Azure AD?**

**What happens when a device is deleted in Azure AD?**

**What roles are needed to recover LAPS password?**

**What roles are needed to read LAPS metadata?**

**Are Custom Roles supported?**
- `microsoft.directory/deviceLocalCredentials/standard/read` for reading LAPS metadata
... (详见原始草稿)

### Phase 2: Laps Automatic Account Management
> 来源: OneNote — [onenote-laps-automatic-account-management.md](../drafts/onenote-laps-automatic-account-management.md)

**Windows LAPS Automatic Account Management via Intune**
**Overview**
**Windows 11 24H2+ 方案：Automatic Account Management Mode**
**配置项**
- 是否使用内置 Administrator 账户或自定义新账户
- 账户名称
- 是否启用/禁用账户
- 是否随机化账户名称

**参考文档**
- [Manage Windows LAPS with Microsoft Intune](https://learn.microsoft.com/en-us/intune/intune-service/protect/windows-laps-overview)
- [Windows LAPS account management modes](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-concepts-account-management-modes#automatic-account-management-mode)

**旧版 OS 替代方案**
1. **Accounts CSP** — 通过 Intune 配置策略部署
2. **Custom Policy-driven Management Scripts** — 通过 Intune 脚本部署
3. **Base OS Image** — 在系统镜像中预置账户

**Hybrid (GPO) 场景**

### Phase 3: Laps Azure Ad Support Guide
> 来源: OneNote — [onenote-laps-azure-ad-support-guide.md](../drafts/onenote-laps-azure-ad-support-guide.md)

**Windows LAPS with Azure AD - Support Boundaries & Troubleshooting**
**Support Boundaries**
**Intune Team Owns**
- Configuring and assigning LAPS MDM policies from Management Portal
- Ensuring correct MDM policy is delivered and applied to AADJ/HAADJ devices
- LAPS password management interface in Intune Portal

**Windows Directory Services Team Owns**
- All Win LAPS functionality (password creation, updating, login actions, invalid passwords)
- LAPS performance issues (crashes, memory leaks, slowness, LAPS-specific errors)

**Azure Identity Team Owns**
- Tenant Discovery problems
- Azure AD registration issues
- Password retrieval from Device Settings, Graph API or PowerShell
- Managing Azure AD LAPS via Device Settings (Portal/Graph API/PowerShell)
- Auditing and Azure AD Audit logs
- Microsoft Graph beta/deviceLocalCredentials API
- Microsoft.Graph and AzureAD PowerShell module cmdlets

**SAP Routing**

**Kusto Troubleshooting Queries**

**Query 1: Trace LAPS password update from Event Log**
```kql
```

**Query 2: Service-side trace via FindTraceLogs**
- Cluster: `idsharedwus`
- Database: `ADRS`
```kql
```

**Source**
- OneNote: Mooncake POD Support Notebook > Intune > Windows TSG > Windows LAPS with Azure AD

### Phase 4: Laps Event Log Troubleshooting
> 来源: OneNote — [onenote-laps-event-log-troubleshooting.md](../drafts/onenote-laps-event-log-troubleshooting.md)

**Windows LAPS with Azure AD - Event Log Troubleshooting Guide**
**Support Boundaries**
- LAPS configured via GPO to backup to Windows AD or Azure AD: Windows DS team
- LAPS configured via Intune to backup to Azure AD: Intune team (partial)
- Reference: Intune Workflow: Support Boundaries for Windows LAPS with Azure AD

**Key Event IDs (Event Viewer > Applications and Services > Microsoft > Windows > LAPS > Operational)**

**Quick Connectivity Check**
```cmd
```

**ASC Troubleshooting**
- **Audit Logs**: Filter Service=Device Registration Service, Category=Device
- **Activities**: Reveal local administrator password, Update local administrator password
- **Device Policy**: Settings blade > Devices > LAPS policy setting
- **Local Administrator Password tab**: Lists all LAPS-backed-up devices with backup dates

**Common Error Codes**
- **0x80072EE7**: DNS resolution failure for enterpriseregistration.windows.net
- **HTTP 403**: authorization_error - tenant policy not enabled
- **HTTP 400**: error_missing_device - device object not in Azure AD
- **0x80070190**: Thread background processing mode error

### Phase 5: Windows Laps Azure Ad Configuration
> 来源: OneNote — [onenote-windows-laps-azure-ad-configuration.md](../drafts/onenote-windows-laps-azure-ad-configuration.md)

**Windows LAPS with Azure AD — Configuration Guide**
**Overview**
**Step 1: Enable LAPS in Azure AD**
1. Azure AD → **Devices** → **Device settings**
2. Set LAPS to **Yes**, click **Save**

**Step 2: Create Intune Account Protection Policy**
1. Microsoft Intune → **Endpoint security** → **Account protection**
2. **Create Policy** → Platform: Windows 10 and later → Profile: Windows LAPS
3. Configure:
   - **Backup Directory**: Azure AD
   - Other settings as needed (see Policy Settings below)
4. Set **Assignments** to target Azure AD groups
5. **Review + Create**

**Step 3: Recover Local Admin Password**
1. Azure AD → **Devices | Overview** → **Local admin password recovery**
2. All LAPS-enabled devices are listed
3. Click **Show local administrator password** next to target device
4. Custom RBAC roles and Administrative Units can scope password recovery permissions

**Step 4: Manual Password Rotation**
1. Intune → **Devices | All devices** → Search for device
2. Device action: **Rotate local admin password**

**Step 5: Audit**
1. Azure AD → **Devices | Overview** → **Audit logs**
2. Activity filter:
   - `Update device local administrator password`
   - `Recover device local administrator password`

**Policy Settings (Azure AD Mode)**

**Related Entries**
- intune-onenote-194: LAPS Kusto troubleshooting queries
... (详见原始草稿)

### Phase 6: Windows Laps Azure Ad
> 来源: OneNote — [onenote-windows-laps-azure-ad.md](../drafts/onenote-windows-laps-azure-ad.md)

**Windows LAPS with Azure AD - Configuration Guide**
**Overview**
**Prerequisites**
- Windows 11 Insider Preview Build 25145+ (or later GA builds with LAPS support)
- Azure AD Premium license
- Microsoft Intune

**Configuration Steps**

**1. Enable LAPS in Azure AD**
1. In **Azure AD** > **Devices** > **Device settings**, set LAPS to **Yes** and click **Save**

**2. Create Intune LAPS Policy**
1. Go to **Microsoft Intune** > **Endpoint security** > **Account protection**
2. Click **Create Policy** > Windows 10 and later > LAPS profile
3. Configure **Backup Directory** = **Azure AD**
4. Set desired password policy settings (see below)
5. Assign to target Azure AD device groups

**Password Recovery**
- **Azure AD Portal**: Devices > All devices > **Local admin password recovery** > **Show local administrator password**
- Supports custom roles and administrative units for granular RBAC

**Password Rotation**
- **Intune Portal**: Devices > All devices > Select device > **Rotate local admin password** (device action)

**Auditing**
- **Azure AD Portal**: Devices > Audit logs
  - Filter by Activity: "Update device local administrator password" or "Recover device local administrator password"

**Policy Settings (Azure AD Mode)**

**Notes**
- Only the settings listed above apply to Azure AD LAPS mode (AD-specific settings do not apply)
- Ensure devices are Azure AD joined or Hybrid Azure AD joined

### Phase 7: Windows Laps Kusto Queries
> 来源: OneNote — [onenote-windows-laps-kusto-queries.md](../drafts/onenote-windows-laps-kusto-queries.md)

**Windows LAPS with Azure AD — Kusto Diagnostic Queries**
**Prerequisites**
- `<timestamp>` — event time
- `<correlationId>` — captured as `client-request-id` in the URL

**Query 1: ADRS Trace Events**
```kql
```

**Query 2: FindTraceLogs (Password Update Issues)**
```kql
```

**When to Use**
- Troubleshoot LAPS password update failures from service-side
- Investigate tenant discovery problems during LAPS operations
- Debug Azure AD Device Registration Service errors during LAPS password rotation

**21v (Mooncake) Note**

### Phase 8: Windows Laps Support Boundaries
> 来源: OneNote — [onenote-windows-laps-support-boundaries.md](../drafts/onenote-windows-laps-support-boundaries.md)

**Windows LAPS with Azure AD — Support Boundaries & SAP Routing**
**Team Ownership**
**Intune Support Team**
- Configuring and assigning LAPS MDM policies from the Management Portal
- Ensuring correct MDM policy is delivered and applied to targeted AADJ/HAADJ devices
- Proper usage of LAPS password management interface in Intune Portal

**Windows Directory Services Team**
- All Win LAPS client functionality: password creation/update, login actions, invalid passwords
- Performance issues: crashes, memory leaks, slowness, LAPS-specific errors

**Azure Identity Team**
- Tenant Discovery problems
- Azure AD registration issues
- Password retrieval from Device Settings, Graph API, or PowerShell
- Managing Azure AD LAPS via Device Settings (Portal, Graph API, PowerShell)
- Auditing and Azure AD Audit logs
- Microsoft Graph beta/deviceLocalCredentials API issues
- Microsoft.Graph and AzureAD PowerShell module cmdlets

**SAP Routing Quick Reference**

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Windows LAPS Event 10059: 'Local admin password solution is not enabled for this tenant' — passwo... | The 'Enable Azure AD Local Administrator Password Solution (LAPS)' toggle in ... | Navigate to Azure AD > Devices > Device settings, toggle 'Enable Azure AD Local Administrator Pas... | 🟢 8.5 | ADO Wiki |
| 2 | Windows LAPS Reset-LapsPassword fails with hr:0x80070190 (ERROR_THREAD_MODE_ALREADY_BACKGROUND) a... | LAPS is not enabled at the tenant level in Azure AD Device Settings | Enable LAPS in Azure AD Device Settings (toggle to Yes). The 0x80070190 error and Event 10028 are... | 🟢 8.5 | ADO Wiki |
| 3 | Windows LAPS Event 10059 HTTP 400: 'The device {deviceId} in {tenantId} could not be found' — pas... | The device object has been removed from the Azure AD tenant | Verify device registration status with 'dsregcmd /status' on the client. If device was deleted, r... | 🟢 8.5 | ADO Wiki |
| 4 | Windows LAPS Event 10059 HTTP 403: 'The specified request is not allowed for tenant' — authorizat... | The device has been disabled in Azure AD | Check device status in Azure AD portal — re-enable the device if it was disabled. LAPS requires t... | 🟢 8.5 | ADO Wiki |
| 5 | Windows LAPS Event 10025: 'Azure discovery failed' with error 0x80072EE7 (ERROR_ADAL_INTERNET_NAM... | Network connectivity issue — the client cannot resolve enterpriseregistration... | Verify network connectivity from the client by running 'curl https://enterpriseregistration.windo... | 🟢 8.5 | ADO Wiki |
