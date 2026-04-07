---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Parse JSON results from ICM on Global Endpoint usage"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FParse%20JSON%20results%20from%20ICM%20on%20Global%20Endpoint%20usage"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Parse JSON Results from ICM on Global Endpoint Usage

## Overview

This guide provides a PowerShell script to produce consumable, readable output from the JSON file returned by an ICM after a subscription-level analysis of Application Insights components using the global ingestion endpoint.

## Considerations

This is **not a TSG**. It is a utility script referenced by TSGs when a subscription contains many Application Insights resources and the ICM JSON output is too lengthy to parse manually.

## Input Format

After an ICM is resolved, you receive a JSON file in this format:

```json
[
  {
    "arguments": ["sub1guid"],
    "resultMessage": "[{\"ResourceId\":\"value1\",\"UseGlobal\":\"True\"},{\"ResourceId\":\"value2\",\"UseGlobal\":\"False\"}]",
    "hasError": false
  },
  {
    "arguments": ["sub2guid"],
    "resultMessage": "[{\"ResourceId\":\"value5\",\"UseGlobal\":\"True\"},{\"ResourceId\":\"value6\",\"UseGlobal\":\"False\"}]",
    "hasError": false
  }
]
```

## PowerShell Script

Replace the sample JSON with the actual JSON downloaded from ICM. A CSV file is generated at `C:/GlobalIngestionCheck/`.

```powershell
# This script outputs all resources still receiving data through the Global Ingestion Service
# and exports results to a CSV file in C:/GlobalIngestionCheck

# Ensure the output path exists
$path = "C:/GlobalIngestionCheck"
if (!(Test-Path -Path $path)) {
    New-Item -Path $path -ItemType Directory
}

# Replace with JSON downloaded from ICM
$jsonData = @'
[
    {
        "arguments": ["sub1guid"],
        "resultMessage": "[{\"ResourceId\":\"value1\",\"UseGlobal\":\"True\"},{\"ResourceId\":\"value2\",\"UseGlobal\":\"False\"},{\"ResourceId\":\"value3\",\"UseGlobal\":\"True\"}]",
        "hasError": false
    },
    {
        "arguments": ["sub2guid"],
        "resultMessage": "[{\"ResourceId\":\"value5\",\"UseGlobal\":\"True\"},{\"ResourceId\":\"value6\",\"UseGlobal\":\"False\"},{\"ResourceId\":\"value7\",\"UseGlobal\":\"True\"}]",
        "hasError": false
    }
]
'@

try {
    $data = $jsonData | ConvertFrom-Json
    $allResults = @()

    foreach ($item in $data) {
        $resultMessage = $item.resultMessage | ConvertFrom-Json
        $allResults += $resultMessage
    }

    # Filter only resources using Global ingestion
    $filteredResults = $allResults | Where-Object { $_.UseGlobal -eq "True" } | Select-Object ResourceId

    $currentDateTime = Get-Date -Format "yyyy-MM-dd-HH-mm-ss"
    $csvFileName = "GlobalIngestionCheck_$currentDateTime.csv"
    $csvFilePath = Join-Path -Path $path -ChildPath $csvFileName
    $filteredResults | Export-Csv -Path $csvFilePath -NoTypeInformation

    Write-Output "CSV file created at: $csvFilePath"
}
catch {
    Write-Error "An error occurred: $_"
}
finally {
    Write-Output "Script execution completed."
}
```

## Output

The script generates a CSV file listing all `ResourceId` values where `UseGlobal = True`, indicating those Application Insights components still routing telemetry through the legacy global ingestion endpoint and requiring migration.

*Created by: didiergbenou | Last Modified: 2025-04-xx*
