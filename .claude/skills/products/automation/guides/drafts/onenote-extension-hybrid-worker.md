# Extension-based Hybrid Runbook Worker Configuration

## Source
- OneNote: Mooncake POD Support Notebook > AUTOMATION > Troubleshooting > Hybrid worker > Extension-based hybrid worker configuration

## PowerShell Script

```powershell
# Parameters - customize these
$accountRG = "<AutomationAccountRG>"
$accountName = "<AutomationAccountName>"
$vmRG = "<VMRG>"
$vmName = "<VMName>"
$workerGroupName = "<WorkerGroupName>"

# Detect OS type
$vm = Get-AzVM -ResourceGroupName $vmRG -Name $vmName
if ($vm.OSProfile.WindowsConfiguration -ne $null) {
    $extensionType = "HybridWorkerForWindows"
} elseif ($vm.OSProfile.LinuxConfiguration -ne $null) {
    $extensionType = "HybridWorkerForLinux"
}

# Get Automation Account hybrid service URL
$getParams = @{
    ResourceGroupName = $accountRG
    ResourceProviderName = 'Microsoft.Automation'
    ResourceType = 'automationAccounts'
    Name = $accountName
    ApiVersion = '2021-06-22'
    Method = 'GET'
}
$accountDetails = Invoke-AzRestMethod @getParams
$accountURL = ($accountDetails.Content | ConvertFrom-Json).properties.automationHybridServiceUrl

# Create worker group
New-AzAutomationHybridRunbookWorkerGroup -Name $workerGroupName `
    -ResourceGroupName $accountRG -AutomationAccountName $accountName

# Register worker
$workerGuid = (New-Guid).Guid
$vmId = $vm.Id
$putPath = "/subscriptions/$($account.SubscriptionId)/resourceGroups/$accountRG/providers/Microsoft.Automation/automationAccounts/$accountName/hybridRunbookWorkerGroups/$workerGroupName/hybridRunbookWorkers/$workerGuid?api-version=2021-06-22"
$putParams = @{
    Path = $putPath
    Payload = "{'properties': {'vmResourceId': '$vmId'}}"
    Method = 'PUT'
}
Invoke-AzRestMethod @putParams

# Install VM extension
$settings = @{ "AutomationAccountURL" = $accountURL }
Set-AzVMExtension -ResourceGroupName $vmRG `
    -Location $vm.Location `
    -VMName $vmName `
    -Name "HybridWorkerExtension" `
    -Publisher "Microsoft.Azure.Automation.HybridWorker" `
    -ExtensionType $extensionType `
    -TypeHandlerVersion 1.1 `
    -Settings $settings `
    -EnableAutomaticUpgrade $true
```

## Key Points
- Uses API version `2021-06-22`
- Auto-detects Windows vs Linux for extension type
- Enables automatic upgrade for the extension
- Requires `Get-AzVM`, `Invoke-AzRestMethod`, `Set-AzVMExtension` permissions

## Applicability
- 21v (Mooncake): Yes (use correct AzureEnvironment)
