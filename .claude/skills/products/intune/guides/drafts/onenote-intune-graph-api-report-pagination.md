# Intune Graph API Report Pagination (21v / Mooncake)

> Source: Case 2501020040001988 — Intune BridgeWater PowerShell script

## Overview

在 Mooncake (21v) 环境中使用 PowerShell / Graph API 查询 Intune Device Configuration 策略和报告时的注意事项。

## Key Findings

### 1. 单个命令无法获取 Device | Configuration 页面的所有策略

Device Configuration 页面调用多个 API，需要分别查询：

| API | PowerShell Cmdlet | 备注 |
|-----|-------------------|------|
| `/deviceManagement/groupPolicyConfigurations` | `Get-MgBetaDeviceManagementGroupPolicyConfiguration` | — |
| `/deviceManagement/configurationPolicies` | `Get-MgBetaDeviceManagementConfigurationPolicy` | PS 结果包含 Device preparation policies |
| `/deviceManagement/deviceConfigurations` | `Get-MgBetaDeviceManagementDeviceConfiguration` | UI 不包含 Windows & Apple update policy |
| `/deviceManagement/resourceAccessProfiles` | `Get-MgBetaDeviceManagementResourceAccessProfile` | Co-management 相关，已 Deprecated |
| `/deviceAppManagement/mobileAppConfigurations` | `Get-MgBetaDeviceAppMgtMobileAppConfiguration` | PS 包含 Managed device app config |

### 2. REST API Top > 50 只返回 50 条

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

### 3. Get API Top > 20 只返回 20 条

不同 API 默认返回数量不一致。数据大于默认数量时通过 `$odata.nextLink` 返回下一页。

参考: [Paging Microsoft Graph data](https://learn.microsoft.com/en-us/graph/paging?tabs=http)

### 4. PS Cmdlet 需要额外参数

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
