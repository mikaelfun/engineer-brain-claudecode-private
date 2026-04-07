# Intune Graph API 与 PowerShell 自动化 — 综合排查指南

**条目数**: 19 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-Graph-API.md, onenote-intune-graph-api-report-pagination.md, onenote-powershell-graph-api-intune-policy-query.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (4 条)

- **solution_conflict** (high): intune-ado-wiki-152 vs intune-contentidea-kb-199 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-190 vs intune-contentidea-kb-199 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-191 vs intune-contentidea-kb-199 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-contentidea-kb-106 vs intune-mslearn-144 — context_dependent: 不同来源给出不同方案，可能适用不同场景

## 排查流程

### Phase 1: Graph Api
> 来源: ADO Wiki — [ado-wiki-Graph-API.md](../drafts/ado-wiki-Graph-API.md)

**Intune Graph API Troubleshooting Guide**
**Common Endpoints**
**Permission Change (Sep 2025)**
- `DeviceManagementScripts.Read.All` replaces `DeviceManagementConfiguration.Read.All`
- `DeviceManagementScripts.ReadWrite.All` replaces `DeviceManagementConfiguration.ReadWrite.All`
- Affects: deviceShellScripts, deviceHealthScripts, deviceComplianceScripts, deviceCustomAttributeShellScripts, deviceManagementScripts

**Support Boundaries**
- Only publicly documented endpoints (v1.0/beta) are supported for manual use
- Portal-only endpoints are restricted and unsupported for external use
- Intune will NOT write scripts for customers (MIT-licensed samples available at microsoft.github.io/webportal-intune-samples)
- Always prefer v1.0 over beta for production

**Troubleshooting Steps**
1. Gather: endpoint URL, error code, auth method, permissions
2. Test in Graph Explorer (aka.ms/ge) to isolate issue
3. Use F12 network trace on Intune portal to find actual API calls used
4. Check 400 errors: see Resolve Authorization Errors doc
5. Check 500 errors: may need PG escalation, confirm with SMEs first

**Known Issues**
- `$expand=detectedApps` returns null Publisher — use separate detectedApps endpoints instead
- Some properties (e.g., physicalMemoryInBytes) not returned without `$select`

**App Registration for Application Permissions (PowerShell)**
1. Create App Registration in Entra ID
2. Create Client Secret (copy immediately, shown only once)
3. Add API Permissions > Microsoft Graph > Application > needed permissions
4. Grant admin consent
5. Connect: `Connect-MgGraph -TenantId $tid -ClientSecretCredential $cred`

**Scoping Questions**
1. Target endpoint/URL? (v1.0/beta/undocumented?)
... (详见原始草稿)

### Phase 2: Intune Graph Api Report Pagination
> 来源: OneNote — [onenote-intune-graph-api-report-pagination.md](../drafts/onenote-intune-graph-api-report-pagination.md)

**Intune Graph API Report Pagination (21v / Mooncake)**
**Overview**
**Key Findings**
**1. 单个命令无法获取 Device | Configuration 页面的所有策略**
**2. REST API Top > 50 只返回 50 条**
```powershell
```
**3. Get API Top > 20 只返回 20 条**
**4. PS Cmdlet 需要额外参数**
```powershell
```
**Mooncake Endpoint**
```
```
```powershell
```

### Phase 3: Powershell Graph Api Intune Policy Query
> 来源: OneNote — [onenote-powershell-graph-api-intune-policy-query.md](../drafts/onenote-powershell-graph-api-intune-policy-query.md)

**PowerShell / Graph API to Query Intune Policy Assignments**
**Overview**
**Prerequisites**
- Microsoft.Graph PowerShell module (recommended over legacy MSGraph module)
- App registration with appropriate permissions

**Sample Code**
```powershell

**Install modules**

**Connect to Mooncake (21Vianet) environment**

**Query compliance policy assignments**

**Query configuration policy assignments**
```

**Key Points**
- Use `-Environment China` for Mooncake/21Vianet tenants
- Use `Microsoft.Graph` module (NOT legacy `MSGraph`)
- There is no single command to find all policies assigned to a given group; iterate over policies and check assignments

**References**
- [Microsoft Graph PowerShell authentication](https://learn.microsoft.com/en-us/powershell/microsoftgraph/authentication-commands)
- [Get-MgDeviceManagementDeviceCompliancePolicyAssignment](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.devicemanagement/get-mgdevicemanagementdevicecompliancepolicyassignment)
- [Get-MgDeviceManagementDeviceConfigurationAssignment](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.devicemanagement/get-mgdevicemanagementdeviceconfigurationassignment)

**Source**
- OneNote: Mooncake POD Support Notebook > Intune > How To > PowerShell/Graph API to Intune
- Related case: 2409180030007869

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Intune Admin Center 操作时 Graph API 返回 HTTP 403 Forbidden，页面加载失败或操作被拒绝 | 登录的管理员账号缺少该操作所需的 Graph 权限或 Intune RBAC 角色（如 deviceManagement/managedDevices R... | 1. 从 HAR 文件中找到失败的 Graph API URL；2. 查看 response body 中的 error.code（如 Authorization_RequestDenied）；... | 🟢 8.5 | ADO Wiki |
| 2 | Intune Admin Center 操作响应缓慢或间歇性失败，Graph API 返回 HTTP 429 Too Many Requests | 租户或用户超过 Graph API 限速阈值（throttling），常见于大型租户或存在并行自动化工具时 | 1. 检查响应头中的 Retry-After 值，等待指定时间后重试；2. 建议客户降低并发 API 请求频率或减少自动化轮询；3. 参考 Microsoft Graph throttling ... | 🟢 8.5 | ADO Wiki |
| 3 | Intune Admin Center 中 Graph API 调用返回 HTTP 500 或 503，操作无法完成 | Intune 后端服务瞬时错误，可能关联活跃服务事件 | 1. 从 HAR 文件提取 client-request-id；2. 检查 Microsoft 365 Service Health Dashboard 是否有活跃事件；3. 若无事件，使用 c... | 🟢 8.5 | ADO Wiki |
| 4 | Intune 管理员在门户上传 PowerShell 脚本后，无法查看脚本文件内容（portal 不显示脚本正文） | Intune 门户当前不支持在 UI 中查看已上传的 PowerShell 脚本内容；脚本以 Base64 编码存储，仅可通过 Graph API 获取 | 方法1: Graph Explorer 登录后执行 GET https://graph.microsoft.com/beta/deviceManagement/deviceManagementS... | 🟢 8.5 | ADO Wiki |
| 5 | CritSit: 客户意外从 Intune 控制台或通过 Graph API 批量删除了设备，需要恢复 | IT 管理员误操作在 Intune 门户手动删除设备，或自动化脚本通过 Graph API 触发了批量删除 | 1. 确认 Entra ID 设备记录是否仍存在（不存在则无法恢复，需重新注册）；2. 立即关闭所有受影响设备防止重新 check-in；3. 收集已删除设备的 Intune Device ID... | 🟢 8.5 | ADO Wiki |
| 6 | Graph API 调用 managedDevices/$expand=detectedApps 时 Publisher 等字段返回 null 或 not found | 使用 $expand=detectedApps 的 API 端点返回数据不完整，是已知 API 限制 | 改用推荐的独立端点：1. GET /deviceManagement/detectedApps（列出所有检测到的应用）；2. GET /deviceManagement/manageddevic... | 🟢 8.5 | ADO Wiki |
| 7 | 客户调用的 Graph API 端点在 Intune 门户中可以工作但手动调用返回 403/401，端点在公开文档中找不到 | 该端点属于 Intune 门户内部使用的受限端点，不在公开文档（v1.0 或 beta）中，不支持手动调用 | 1. 确认端点是否在 learn.microsoft.com/graph/api/resources/intune-graph-overview 中有文档；2. 如未公开则不支持手动使用；3. ... | 🟢 8.5 | ADO Wiki |
| 8 | Graph API managedDevices 返回的硬件信息（如 physicalMemoryInBytes）为 0 或缺失 | 默认 GET managedDevices 不返回所有属性，需使用 $select 参数明确指定需要的字段 | 在 API 调用中添加 $select=physicalMemoryInBytes 等需要的字段；可通过 F12 网络跟踪查看 Intune 门户实际使用的 API 调用（含 $select 参... | 🟢 8.5 | ADO Wiki |
| 9 | HTTP 403 Forbidden / Access denied error in Intune portal or Graph API — admin cannot perform spe... | Missing RBAC permission in admin's assigned role. May need multiple permissio... | 1) Collect F12 HAR trace from browser 2) Find first 403 response to graph.microsoft.com 3) Extrac... | 🟢 8.5 | ADO Wiki |
| 10 | Unlicensed admin gets access denied when using Graph API, PowerShell cmdlets, or Intune SDK apps ... | Unlicensed Admins feature only applies to Intune portal (MEM). Graph API, Pow... | 1) Verify user has Intune license assigned (check in Rave user details) 2) Verify user has RBAC r... | 🟢 8.5 | ADO Wiki |
| 11 | Exclude groups option missing for PowerShell scripts assignments in Intune UI — cannot exclude gr... | Older tenant was built without exclude groups functionality for PowerShell sc... | 1) Submit SAW request to add flighting tag 'EnableGAndTForPowershell' via ICM/IET 2) WARNING: pro... | 🟢 8.5 | ADO Wiki |
| 12 | Intune Endpoint Security App Control for Business policy returns error 65000 when deploying a tem... | WDAC Wizard-generated XML template contains <PolicyTypeID> but lacks <PolicyI... | Edit the WDAC XML template: (1) Remove <PolicyTypeID> element, (2) Add <PolicyID> with a unique G... | 🟢 8.5 | OneNote |
| 13 | When creating a dynamic group in the Intune on Azure portal using the dynamic membership rule bel... | The correct value for deviceOwership in Azure is &quot;company&quot; not &quo... | In order to resolve the issue, follow the steps below:1) Ensure that the device is indeed properl... | 🔵 7.0 | ContentIdea KB |
| 14 | When using the Intune Preview Graph API to update �emailAddress� and/or �managementAgent�, using ... | The /PATCH method only supports changing two attributes.The only attributes o... | https://icm.ad.msft.net/imp/v3/incidents/details/46138189/home | 🔵 7.0 | ContentIdea KB |
| 15 | You are unable to query the Microsoft Graph API within https://graph.microsoft.com/v1.0/deviceMan... | To access the Intune graph api from a non GA account requires the account to ... | a. Create the custom Intune roll Create a user group and add the service account you would like t... | 🔵 7.0 | ContentIdea KB |
| 16 | Could not retrieve the access token for Microsoft Graph API. Check the configuration for Microsof... | Customer is using a proxy and had required ports blocked | The following ports need to be accessible for Jamf and Intune to work properly: Intune - Port 443... | 🔵 7.0 | ContentIdea KB |
| 17 | Could not retrieve the access token for Microsoft Graph API. Check the configuration for Microsof... | Customer is using a proxy and had required ports blocked | The following ports need to be accessible for Jamf and Intune to work properly: Intune - Port 443... | 🔵 7.0 | ContentIdea KB |
| 18 | Device UPN shows as None in Intune admin center under All Devices | User deleted from Entra ID before enrolled device was deleted from Intune cre... | Run RemoveIntuneDevice.ps1 script. Prerequisites: Entra ID recycle bin enabled, Graph permissions... | 🔵 6.5 | MS Learn |
| 19 | Jamf Pro shows Could not retrieve the access token for Microsoft Graph API when configuring Intun... | Required TCP ports for Jamf-Intune communication are blocked by firewall or p... | Unblock TCP ports: 443 (Intune), 2195/2196/5223 (macOS devices), 80/5223 (Jamf Pro) | 🔵 6.5 | MS Learn |
