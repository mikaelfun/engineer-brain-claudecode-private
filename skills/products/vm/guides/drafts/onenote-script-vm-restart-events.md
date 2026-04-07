# Script: Batch Query VM Restart Events via Resource Health API

## 用途
批量查询订阅下所有 VM 的重启/可用性事件，导出为 CSV 供分析。适用于 Mooncake 环境。

## PowerShell Script

```powershell
$subscriptionId = "<your subscription id>"
$apiVersion1 = "2020-06-01"
$apiVersion2 = "2024-02-01"
$csvFilePath = "output.csv"
$token = "<your token>"

$authHeader = @{
    'Authorization' = "Bearer $token"
}

$results = @()

# Get all VMs in the subscription
$vmListUrl = "https://management.chinacloudapi.cn/subscriptions/$subscriptionId/providers/Microsoft.Compute/virtualMachines?api-version=$apiVersion1"
$vmListResponse = Invoke-RestMethod -Uri $vmListUrl -Headers $authHeader -Method Get

foreach ($vm in $vmListResponse.value) {
    $resourceGroup = $vm.id.Split('/')[4]
    $vmName = $vm.name

    # Get the resource health events for each VM
    $url = "https://management.chinacloudapi.cn/subscriptions/$subscriptionId/resourceGroups/$resourceGroup/providers/Microsoft.Compute/virtualMachines/$vmName/providers/Microsoft.ResourceHealth/events?api-version=$apiVersion2"
    $response = Invoke-RestMethod -Uri $url -Headers $authHeader -Method Get

    foreach ($event in $response.value) {
        $results += New-Object PSObject -Property @{
            VMName              = $vmName
            EventTitle          = $event.properties.title
            EventSummary        = $event.properties.summary
            EventReason         = $event.properties.reason
            PlatformInitiated   = $event.properties.platformInitiated
            Header              = $event.properties.header
            Level               = $event.properties.level
            ImpactStartTime     = $event.properties.impactStartTime
        }
    }
}

$results | Export-Csv -Path $csvFilePath -NoTypeInformation
```

## 注意事项
- Mooncake 端点: `management.chinacloudapi.cn`
- 需要有效的 Bearer Token（可通过 `az account get-access-token` 获取）
- Resource Health Events API version: `2024-02-01`
- 输出字段: VMName, EventTitle, EventSummary, EventReason, PlatformInitiated, Header, Level, ImpactStartTime

## 来源
- Case: 2404100030001320
- OneNote: SME Topics / 2. Azure VM
