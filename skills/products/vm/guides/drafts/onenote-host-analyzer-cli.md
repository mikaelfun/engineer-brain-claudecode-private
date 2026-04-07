# Host Analyzer (HA) Command Line Guide

## Overview
How to run Host Analyzer report through PowerShell/Fcshell command line when ASC is unavailable.

## Command
```powershell
\\fsu\shares\WATS\scripts\Get-Sub\HostAnalyzer\hostanalyzer.ps1 `
  -cluster 'sha2xxx' `
  -nodeId '5ffd6exxx' `
  -containerId '173xxxxx' `
  -resourceId '/subscriptions/{sub-id}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/{vm}' `
  -startTime '2019-09-10 00:30:00' `
  -endTime '2019-09-10 02:30:00' `
  -cloudName 'Mooncake'
```

## Notes
- Parameters (cluster, nodeId, containerId, resourceId) can be gathered from ASC
- Use `-cloudName 'Mooncake'` for 21Vianet environment to pull relevant Kusto tables
- **Limitation**: HA report from command line lacks a part of host metrics compared to ASC report
- Recommended to use ASC for daily work; command line is a temporary workaround

## Source
- OneNote: MCVKB/VM+SCIM/7.4
