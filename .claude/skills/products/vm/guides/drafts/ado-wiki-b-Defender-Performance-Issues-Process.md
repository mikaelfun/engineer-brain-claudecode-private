---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Security Cases Guidance/Defender Performance Issues_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FSecurity%20Cases%20Guidance%2FDefender%20Performance%20Issues_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Summary

This article provides instructions on handling tickets where a VM experiences performance issues related to Defender (Msmpeng.exe) or Defender for Endpoint (MsSense.exe).

The goal is to ensure that Support Engineers (SE) and Support Escalation Engineers (SEE) gather vital information to support the Endpoint Protection (EP) team in assisting the customer.

Microsoft Defender for Endpoint / Endpoint Protection (EP) focuses on security for Azure and on-prem environments.

# Expectations

Help the customer understand that we need to collect information required by the EP team for a timely resolution. While waiting for the EP team to be engaged, continue collecting additional diagnostics as needed.

**Questions to share with customers:**

1. When did the issue start, and did it work previously?
2. How did you discover that the issue was caused by Defender or MDE? (If applicable)
3. What are the affected OS versions?
4. Is there any alert displayed?
5. Include any screenshots, alert IDs, machine IDs, workspace IDs, or other details that could help define the path forward.

## Part A — Log Collection by OS

**Windows Defender Client (Windows 8/10, Server 2016/2019/2022)**

1. Open an elevated Command Prompt.
2. Navigate to the "C:\Program Files\Windows Defender" folder.
3. Run: `MpCmdRun.exe -getfiles`
4. Wait ~1 minute until it finishes with "Files successfully created".
5. Run: `Msinfo32 /NFO %temp%\%computername%_MSINFO.NFO`
6. Send the MpSupportFiles.cab file from "C:\ProgramData\Microsoft\Windows Defender\Support".
7. Send the COMPUTERNAME_MSINFO.NFO file from %temp%.

> Note: To create an .NFO in C:\Temp named MSINFO.NFO, run: `Msinfo32 /NFO C:\TEMP\MSINFO.NFO`

**SCEP Client (Windows 7, Server 2008 R2, Server 2012 R2)**

1. Open an elevated Command Prompt.
2. Navigate to the "C:\Program Files\Microsoft Security Client" folder.
3. Run: `MpCmdRun.exe -getfiles`
4. Wait ~1 minute until it finishes with "Files successfully created".
5. Run: `Msinfo32 /NFO %temp%\%computername%_MSINFO.NFO`
6. Send the MpSupportFiles.cab file from "C:\ProgramData\Microsoft\Microsoft Antimalware\Support".
7. Send the COMPUTERNAME_MSINFO.NFO file from %temp%.

## Part B — MDEClientAnalyzer (Performance Mode)

1. Download the [preview client analyzer tool](https://aka.ms/Betamdeanalyzer) to the affected machine.
2. Extract MDEClientAnalyzer on the machine.
3. Open an elevated command prompt.
4. Run: `HardDrivePath\MDEClientAnalyzer.cmd -i` (replace HardDrivePath with the actual location).
5. Specify the maximum number of minutes to collect traces if prompted.
6. Reproduce the issue.
7. Stop the data collection by pressing "q". Wait while data is collected and a report is generated.
8. Upload the logs to the link from Part A.

## Part C — Procmon Capture

1. Download the latest Procmon from https://download.sysinternals.com/files/ProcessMonitor.zip.
2. Extract and copy it to the problem machine.
3. While the issue is active (high CPU usage), run Procmon as administrator.
4. Agree to the EULA.
5. Let the capture run for 3-4 minutes.
6. Stop the capture by clicking the magnifying glass icon or pressing Ctrl+E.
7. Click File > Save.
8. Make sure "All events" and "Native Process Monitor Format (PML)" are selected.
9. Click OK.
10. Zip the saved .pml file and upload it via the link from Part A.

# Next Steps

Once you collect this information, add the details to the case notes. Transfer the ticket or open a collaboration with the EP team, depending on the circumstance. Update the SAP of the ticket to match the Endpoint teams category.

The EP team is under the Security category with the Product Name "Microsoft Defender":
- Antivirus performance (Defender, SCEP), exclusions → **"Microsoft Defender Antivirus"**
- MDE client (MsSense.exe) performance, false positives, latency, memory usage → **"Microsoft Defender for Endpoint"**

# Reference Links

- [Internal EP Queue Information](https://msaas.support.microsoft.com/queue/9b0ab8dc-96e7-436f-a59a-4a9fe2cdb39c)
