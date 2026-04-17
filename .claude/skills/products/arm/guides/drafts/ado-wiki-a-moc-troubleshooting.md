---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/Azure Local MocARB/MOC (Microsoft On-premise Cloud)/MOC Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FInfrastructure%2FAzure%20Local%20MocARB%2FMOC%20(Microsoft%20On-premise%20Cloud)%2FMOC%20Troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MOC Troubleshooting

Comprehensive guide for troubleshooting MOC (Microsoft On-Premises Cloud) in Azure Local environments.

## Prerequisites

```powershell
$cred = Get-Credential
$nodes = Get-ClusterNode
```

## 1. Cloud Agent Health Check

```powershell
Invoke-Command -ComputerName $nodes.Name -Credential $cred -ScriptBlock {
    Get-Service wssdcloudagent
}
```

wssdcloudagent runs only on **one node** (clustered service). Stopped on other nodes is expected.

## 2. Cluster Resource Ownership

```powershell
Get-ClusterResource | ? {$_.Name -like "*moc*"} | Format-Table Name, State, OwnerGroup, OwnerNode
```

Identifies which node owns the MOC Cloud Agent Service and its current state.

## 3. Node Agent Health Check

```powershell
Invoke-Command -ComputerName $nodes.Name -Credential $cred -ScriptBlock {
    Get-Service wssdagent
}
```

wssdagent should be **running on ALL nodes** (not clustered).

## 4. ARB VM Discovery

```powershell
$ARBVM = Invoke-Command -ComputerName $nodes.Name -Credential $cred -ScriptBlock {
    $cp_IPv4Addresses = @{N='IPv4Addresses';E={$_.NetworkAdapters.IPAddresses.Where({$_ -match '^\d{1,3}(\.\d{1,3}){3}$'})}}
    Get-VM | ? {$_.Name -like "*control-plane-0*"} |
    Select-Object Name, VMId, Uptime, State, Status, $cp_IPv4Addresses
}
$ARBVM | Format-Table -AutoSize
```

## 5. MOC Node Registration

```powershell
$nodes = Get-MocNode -Location MocLocation
$formattedNodes = @()
for ($i = 0; $i -lt $nodes.Name.Count; $i++) {
    $formattedNodes += [PSCustomObject]@{
        Name           = $nodes.Name[$i]
        FQDN           = $nodes.Properties.fqdn[$i]
        Port           = $nodes.Properties.port[$i]
        AuthorizerPort = $nodes.Properties.authorizerPort[$i]
        OSVersion      = $nodes.Tags.osVersion[$i]
        Version        = $nodes.Version[$i]
    }
}
$formattedNodes | Format-Table -AutoSize
```

## 6. Log Locations

### Cloud Agent Logs
```powershell
$CloudAgentLogsPath = (Get-MocConfig).cloudconfiglocation
cat "$CloudAgentLogsPath\log\wssdcloudagent.log"
```

### Node Agent Logs
```powershell
Invoke-Command -ComputerName $nodes.Name -Credential $cred -ScriptBlock {
    dir C:\ProgramData\wssdagent\log\wssdagent.log
}
```

> Look for `panic:` traces in logs to identify crash points

## 7. Event Log Filtering

```powershell
$startDate = Get-Date "2025-06-20"
$endDate = Get-Date "2025-06-29"
$mocEvents = Get-MocEventLog
$filteredEvents = $mocEvents | Where-Object {
    $_.TimeCreated -ge $startDate -and $_.TimeCreated -le $endDate -and
    $_.Message -like "*aksarc01*"
}
$filteredEvents | Select-Object TimeCreated, Id, Message, MachineName
```

## 8. Log Collection

```powershell
md C:\moclogs
Get-MocLogs -Path C:\moclogs -Verbose
```

## Key Diagnostics Checklist
- [ ] Config file not reset (check via diagnostic snippet)
- [ ] Binary versions match expected
- [ ] No panic traces in logs
- [ ] Install state valid
- [ ] Service registration correct
