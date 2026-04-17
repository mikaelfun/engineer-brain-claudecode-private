---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/File Integrity Monitoring (FIM)/[deprecated] - FIM AMA/[TSG] - FIM over MMA"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud"
importDate: "2026-04-07"
type: troubleshooting-guide
---

> **DEPRECATED**: This feature (FIM over MMA/Log Analytics Agent) is deprecated.
> Please advise customers to migrate to [FIM over MDE](https://learn.microsoft.com/en-us/azure/defender-for-cloud/file-integrity-monitoring-overview).

# [TSG] - FIM (File Integrity Monitoring) over MMA (Log Analytics Agent)

## 1. Check if healthservice is running on the machine
- Run services.msc
- Go to "Microsoft Monitoring Agent" (Name of the service: HealthService.exe)
- Check to make sure it is running

## 2. Check if there are any errors in the event viewer
- Run EventVwr
- Navigate to OperationsManager log and filter to errors/warnings
- Find if there is any string match for "ChangeTracking" to see if there are errors specific to ChangeTracking

## 3. Verify that the Management Packs are downloaded
- Navigate to `C:\Program Files\Microsoft Monitoring Agent\Agent\Health Service State\Management Packs`
- Ensure that the MPs are downloaded including ChangeTracking ones

## 4. Collect the diagnostic tracing on agent
- On Agent machine, navigate to: `C:\Program Files\Microsoft Monitoring Agent\Agent\Tools`
  - By default error tracing is enabled. Use VER parameter for verbose, "INF" for informational traces
  - Net stop healthservice
  - StopTracing.cmd
  - StartTracing.cmd VER
  - net start healthservice
- To format traces: copy the TMF and cab files from the build used to deploy your MPs
  - `Binaries\AdvisorKnowledge\bin\AnyCPU\Debug\BuildDrop\DeploymentBits\Symbol\AdvisorKnowledge_1.2.1248.0_Debug.cab`
  - `Binaries\AdvisorKnowledge\bin\AnyCPU\Debug\BuildDrop\DeploymentBits\Symbol\AdvisorKnowledge_1.2.1248.0_Debug.TMF`
  - Copy to: `C:\Program Files\Microsoft Monitoring Agent\Agent\Tools\TMF` on the agent box
- Run FormatTracing.cmd. Traces are located at `c:\Windows\Logs\OpsMgrTrace`
  - NOTE: formatting steps can only be done by PG, not customer
- More information: https://support.microsoft.com/en-us/help/942864/how-to-use-diagnostic-tracing-in-system-center-operations-manager-2007

## Additional Information - Supported Regions
ChangeTracking solution is supported on 11 regions only (South Central US is supported though not in documentation).

Reference: [Supported regions for linked Log Analytics workspace](https://docs.microsoft.com/en-us/azure/automation/how-to/region-mappings)
