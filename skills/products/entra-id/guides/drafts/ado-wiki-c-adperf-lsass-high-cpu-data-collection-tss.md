---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Lsass High CPU/Data Collection/Data collection for Lsass High CPU (TSS)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A+ADPERF%3A+Lsass+High+CPU%2FData+Collection%2FData+collection+for+Lsass+High+CPU+(TSS)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# ADPERF: LSASS High CPU Data Collection Guide using TSS

## How to Get TSS

- **Public download**: https://aka.ms/getTSS
- **Internal**: `\\EmeaCssDfs.europe.corp.microsoft.com\NetPod\WindowsDiag\ALL\TSS\TSS_TTD.zip`
- **Lite version** (if customer blocks exe downloads): https://aka.ms/getTSSLite

## Prerequisites

- Run with administrator privileges
- EULA must be accepted
- Set execution policy: `Set-ExecutionPolicy -scope Process -ExecutionPolicy RemoteSigned -Force`

## Machine Preparation (Internet Access)

```powershell
md C:\TSS
Set-ExecutionPolicy -scope Process -ExecutionPolicy RemoteSigned -Force
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Start-BitsTransfer https://aka.ms/getTSS -Destination C:\TSS\TSS.zip
Expand-Archive -LiteralPath C:\TSS\TSS.zip -DestinationPath C:\TSS -force
cd C:\TSS
```

## Machine Preparation (No Internet)

Download TSS.zip from another machine, copy to affected machine, extract to C:\TSS.

## Scenario 1: Constant LSASS High CPU

Customer has constant high CPU or can reproduce:

```powershell
.\TSS.ps1 -Collectlog ADS_Perf -noBasiclog
```

Select option 1 to start immediately. Wait 3-5 minutes while CPU is high, then press Enter to stop.

## Scenario 2: Intermittent LSASS CPU Spikes

Customer has intermittent spikes, no pattern:

```powershell
.\TSS.ps1 -Collectlog ADS_Perf -noBasiclog
```

Select option 2, set CPU threshold percentage. Logs run 3-5 minutes when threshold triggered.

## Scenario 3: TTD Trace (Escalation)

For cases where regular logging is insufficient (per TA recommendation):

1. Download internal TTD version of TSS
2. Identify target process PID: `tasklist /svc >tasklist.txt`
3. Capture:
```powershell
.\TSS.ps1 -TTD <PID> -TTDMaxFile <Max size in MB>
```
4. Reproduce issue, press Y to finish

### TTD Switches

| Switch | Purpose |
|--------|---------|
| -TTDPath | Specify path to tttracer.exe |
| -TTDMode | Full (dump full), Ring (ring buffer), OnLaunch |
| -TTDOptions | Additional TTD options |
| -TTDMaxFile | Max MB to capture |

Example: `.\TSS.ps1 -TTD 1000 -TTDMaxFile 2048`

## Guidelines

- Get detailed problem description and scoping questions first
- Always use latest TSS version
- Collect traces on all devices simultaneously while reproducing
- Get exact timestamps (including seconds)
- Verify data collected properly before upload
- Collecting from working + non-working system can be helpful

## Command Builder

Customize commands at: https://tss-front.azurewebsites.net/default/ADS
