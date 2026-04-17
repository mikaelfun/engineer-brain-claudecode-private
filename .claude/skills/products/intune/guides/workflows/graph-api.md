# Intune Graph API 与 PowerShell 自动化 — 排查工作流

**来源草稿**: ado-wiki-Graph-API.md, onenote-intune-graph-api-report-pagination.md, onenote-powershell-graph-api-intune-policy-query.md
**Kusto 引用**: (无)
**场景数**: 9
**生成日期**: 2026-04-07

---

## Portal 路径

- `Intune > How To > PowerShell/Graph API to Intune`

## Scenario 1: Common Endpoints
> 来源: ado-wiki-Graph-API.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Resource | Endpoint |
|----------|----------|
| Managed Devices | `GET /deviceManagement/managedDevices` |
| Compliance Policies | `GET /deviceManagement/deviceCompliancePolicies` |
| Config Profiles | `GET /deviceManagement/deviceConfigurations` |
| Mobile Apps | `GET /deviceAppManagement/mobileApps` |
| App Protection | `GET /deviceAppManagement/managedAppPolicies` |
| Detected Apps | `GET /deviceManagement/detectedApps` |
| Autopilot Devices | `GET /deviceManagement/windowsAutopilotDeviceIdentities` |
| Scripts | `GET /deviceManagement/deviceManagementScripts` |

## Permission Change (Sep 2025)
New permissions required:
- `DeviceManagementScripts.Read.All` replaces `DeviceManagementConfiguration.Read.All`
- `DeviceManagementScripts.ReadWrite.All` replaces `DeviceManagementConfiguration.ReadWrite.All`
- Affects: deviceShellScripts, deviceHealthScripts, deviceComplianceScripts, deviceCustomAttributeShellScripts, deviceManagementScripts

## Support Boundaries
- Only publicly documented endpoints (v1.0/beta) are supported for manual use
- Portal-only endpoints are restricted and unsupported for external use
- Intune will NOT write scripts for customers (MIT-licensed samples available at microsoft.github.io/webportal-intune-samples)
- Always prefer v1.0 over beta for production

## Scenario 2: Troubleshooting Steps
> 来源: ado-wiki-Graph-API.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Gather: endpoint URL, error code, auth method, permissions
2. Test in Graph Explorer (aka.ms/ge) to isolate issue
3. Use F12 network trace on Intune portal to find actual API calls used
4. Check 400 errors: see Resolve Authorization Errors doc
5. Check 500 errors: may need PG escalation, confirm with SMEs first

## Scenario 3: Known Issues
> 来源: ado-wiki-Graph-API.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `$expand=detectedApps` returns null Publisher — use separate detectedApps endpoints instead
- Some properties (e.g., physicalMemoryInBytes) not returned without `$select`

## App Registration for Application Permissions (PowerShell)
1. Create App Registration in Entra ID
2. Create Client Secret (copy immediately, shown only once)
3. Add API Permissions > Microsoft Graph > Application > needed permissions
4. Grant admin consent
5. Connect: `Connect-MgGraph -TenantId $tid -ClientSecretCredential $cred`
6. Call: `Invoke-MgGraphRequest -Method GET <url>`

## Scoping Questions
1. Target endpoint/URL? (v1.0/beta/undocumented?)
2. Error message/code?
3. How making call? (PowerShell/Graph Explorer/custom app)
4. Permissions granted?
5. Previously worked?
6. Expected vs actual response?

## Scenario 4: Error Codes Reference
> 来源: ado-wiki-Graph-API.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- https://learn.microsoft.com/en-us/graph/errors
- https://learn.microsoft.com/en-us/graph/resolve-auth-errors

## SME Contact
Apps-Development Teams Channel

## Scenario 5: 1. 单个命令无法获取 Device | Configuration 页面的所有策略
> 来源: onenote-intune-graph-api-report-pagination.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Device Configuration 页面调用多个 API，需要分别查询：

| API | PowerShell Cmdlet | 备注 |
|-----|-------------------|------|
| `/deviceManagement/groupPolicyConfigurations` | `Get-MgBetaDeviceManagementGroupPolicyConfiguration` | — |
| `/deviceManagement/configurationPolicies` | `Get-MgBetaDeviceManagementConfigurationPolicy` | PS 结果包含 Device preparation policies |
| `/deviceManagement/deviceConfigurations` | `Get-MgBetaDeviceManagementDeviceConfiguration` | UI 不包含 Windows & Apple update policy |
| `/deviceManagement/resourceAccessProfiles` | `Get-MgBetaDeviceManagementResourceAccessProfile` | Co-management 相关，已 Deprecated |
| `/deviceAppManagement/mobileAppConfigurations` | `Get-MgBetaDeviceAppMgtMobileAppConfiguration` | PS 包含 Managed device app config |

## Scenario 6: 2. REST API Top > 50 只返回 50 条
> 来源: onenote-intune-graph-api-report-pagination.md | 适用: Mooncake ✅

### 排查步骤

Report API 默认单次最多返回 50 条，需要使用 `top` + `skip` 循环分页。

**示例代码（Policy Report）：**

```powershell
function Get-policyReport() {
    param(
        [Parameter(Mandatory=$true)]$policyId,
        [Parameter(Mandatory=$true)]$headers
    )
    $top = 50; $skip = 0; $count = 0; $result = $null
    $uri = "https://microsoftgraph.chinacloudapi.cn/beta/deviceManagement/reports/getConfigurationPolicyDevicesReport"
    while ($true) {
        $body = @{
            select = @("DeviceName","UPN","ReportStatus","AssignmentFilterIds",
                       "PspdpuLastModifiedTimeUtc","IntuneDeviceId",
                       "UnifiedPolicyPlatformType","UserId","PolicyStatus","PolicyBaseTypeName")
            filter = "((PolicyBaseTypeName eq 'Microsoft.Management.Services.Api.DeviceConfiguration') or (PolicyBaseTypeName eq 'DeviceManagementConfigurationPolicy') or (PolicyBaseTypeName eq 'DeviceConfigurationAdmxPolicy')) and (PolicyId eq '$policyID')"
            skip = $skip
            top = $top
        } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "application/json" -Headers $headers
        foreach($r in $response.Values) {
            $result += @([PSCustomObject]@{
                DeviceName = $r[1]; IntuneDeviceId = $r[2]; PolicyBaseTypeName = $r[3]
                PolicyStatus = $r[4]; PspdpuLastModifiedTimeUtc = $r[5]
                ReportStatus = $r[6]; UnifiedPolicyPlatformType = $r[8]
                UserId = $r[10]; AssignmentFilterIds = $r[11]
            })
        }
        $count += $response.Values.Count
        if ($count -ge $response.TotalRowCount) { break }
        else { $skip = $count }
    }
    return $result
}
```

## Scenario 7: 3. Get API Top > 20 只返回 20 条
> 来源: onenote-intune-graph-api-report-pagination.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

不同 API 默认返回数量不一致。数据大于默认数量时通过 `$odata.nextLink` 返回下一页。

参考: [Paging Microsoft Graph data](https://learn.microsoft.com/en-us/graph/paging?tabs=http)

## Scenario 8: 4. PS Cmdlet 需要额外参数
> 来源: onenote-intune-graph-api-report-pagination.md | 适用: Mooncake ✅

### 排查步骤

`Get-MgBetaDeviceManagementReportConfigurationPolicyDeviceReport` 需要加上 `-Filter` 和 `-GroupBy` 参数：

```powershell
$filter = "((PolicyBaseTypeName eq 'Microsoft.Management.Services.Api.DeviceConfiguration') or ...)"
Get-MgBetaDeviceManagementReportConfigurationPolicyDeviceReport -OutFile C:\Temp\test.txt -Filter $filter -GroupBy "PolicyName" -Skip 0 -Top 500
```

## Mooncake Endpoint

```
https://microsoftgraph.chinacloudapi.cn/beta/...
```

认证：

```powershell
Connect-AzAccount -Environment AzureChinaCloud
$graphToken = Get-AzAccessToken -ResourceUrl 'https://microsoftgraph.chinacloudapi.cn/'
$headers = @{ Authorization = "Bearer $($graphToken.Token)" }
```

## Scenario 9: Prerequisites
> 来源: onenote-powershell-graph-api-intune-policy-query.md | 适用: Mooncake ✅

### 排查步骤

- Microsoft.Graph PowerShell module (recommended over legacy MSGraph module)
- App registration with appropriate permissions

## Sample Code

```powershell
# Install modules
Install-Module Microsoft.Graph -AllowClobber
Update-Module Microsoft.Graph
Install-Module Microsoft.Graph.Beta -AllowClobber

# Connect to Mooncake (21Vianet) environment
Connect-MgGraph -Scopes "DeviceManagementManagedDevices.Read.All", "DeviceManagementManagedDevices.ReadWrite.All" `
  -Environment China `
  -ClientId <Your application Client ID> `
  -TenantId <Your Tenant ID>

# Query compliance policy assignments
Get-MgDeviceManagementDeviceCompliancePolicyAssignment -DeviceCompliancePolicyId '<Policy ID>'

# Query configuration policy assignments
Get-MgDeviceManagementDeviceConfigurationAssignment -DeviceConfigurationId '<Policy ID>'
```

## Key Points
- Use `-Environment China` for Mooncake/21Vianet tenants
- Use `Microsoft.Graph` module (NOT legacy `MSGraph`)
- There is no single command to find all policies assigned to a given group; iterate over policies and check assignments

## References
- [Microsoft Graph PowerShell authentication](https://learn.microsoft.com/en-us/powershell/microsoftgraph/authentication-commands)
- [Get-MgDeviceManagementDeviceCompliancePolicyAssignment](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.devicemanagement/get-mgdevicemanagementdevicecompliancepolicyassignment)
- [Get-MgDeviceManagementDeviceConfigurationAssignment](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.devicemanagement/get-mgdevicemanagementdeviceconfigurationassignment)

## Source
- OneNote: Mooncake POD Support Notebook > Intune > How To > PowerShell/Graph API to Intune
- Related case: 2409180030007869

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
