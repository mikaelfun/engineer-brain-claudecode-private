---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application Proxy - Troubleshooting Helper Scripts"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20Proxy%20-%20Troubleshooting%20Helper%20Scripts"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Overview

Sample scripts that can help in course of Entra ID Application Proxy troubleshooting. These scripts can be shared with customers or used directly. These are sample scripts and are not supported.

## Script I: Monitor Passthrough Published Web Application

Fires a GET request every 5 seconds. Stops when `$StatusCode` is 502 (BadGateway). Modify `$StatusCondition` to monitor other errors like 504 GatewayTimeout.

```powershell
Cls

$url = "REPLACE_WITH_THE_URL"

$StatusCode = 200
$StatusCondition = 502

while($StatusCode -ne $StatusCondition)
{
    Start-Sleep -s 5
    $WebCallResult = Invoke-WebRequest -Uri $url
    Write-Host($WebCallResult.StatusCode)
    $StatusCode = $WebCallResult.StatusCode
}

Write-Host("Please stop the tracing the issue happened!")
```

## Script II: Performance Testing Passthrough Published Web Application

Fires 100 simultaneous GET requests using runspace pool for concurrent execution.

```powershell
$maxConcurrentJobs = 100
$url = "REPLACE_WITH_THE_URL"

$Runspace = [runspacefactory]::CreateRunspacePool(1,$maxConcurrentJobs)
$Runspace.Open()

$i=1
for(;$i -le $maxConcurrentJobs;$i++) {
    $ps = [powershell]::Create()
    $ps.RunspacePool = $Runspace
    [void]$ps.AddCommand("Invoke-WebRequest").AddParameter("Uri",$url)
    [void]$ps.BeginInvoke()
    Write-Host ("Initiated request for {0}" -f $url)
}
```
