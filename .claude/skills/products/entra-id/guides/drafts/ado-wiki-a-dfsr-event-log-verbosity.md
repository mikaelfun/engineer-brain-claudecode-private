---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/DFSR/Workflow: DFSR: Useful Tools and Commands/DFSR Event Log Verbosity"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDFSR%2FWorkflow%3A%20DFSR%3A%20Useful%20Tools%20and%20Commands%2FDFSR%20Event%20Log%20Verbosity"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# DFSR Event Log Verbosity

## Registry Setting

- **Path:** `HKLM\SYSTEM\CurrentControlSet\Services\Dfsr\Parameters`
- **Value Name:** `Enable Verbose Event Logging`
- **Value Type:** `REG_DWORD`
- **Value Data:** `1`

## Output

DFS Replication event log

## Suppressed Events (Enabled by Verbose Logging)

The following events are suppressed by default and only appear when verbose event logging is enabled:

- **2002** — EVENT_DFSR_VOLUME_INITIALIZED
- **3002** — EVENT_DFSR_RG_INITIALIZED
- **3004** — EVENT_DFSR_RG_STOPPED
- **4002** — EVENT_DFSR_CS_INITIALIZED
- **5004** — EVENT_DFSR_CONNECTION_INCONNECTION_ESTABLISHED
- **5006** — EVENT_DFSR_CONNECTION_OUTCONNECTION_ESTABLISHED
