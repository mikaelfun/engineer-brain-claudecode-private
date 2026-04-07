---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Security Cases Guidance/Defender Endpoint Exclussions_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FSecurity%20Cases%20Guidance%2FDefender%20Endpoint%20Exclussions_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Summary

This guide explains how to handle support cases where customers need to add, remove, or update antivirus exclusions for:

- Microsoft Defender Antivirus (Msmpeng.exe)
- Microsoft Defender for Endpoint (MsSense.exe)

Each case may require different steps, so when in doubt, follow the Contact & Feedback guidance.

The goal is to help Support Engineers (SE) and Support Escalation Engineers (SEE) collect the right information so the Endpoint Protection (EP) team can investigate and assist effectively.

Microsoft Defender for Endpoint / Endpoint Protection (EP) covers security-focused topics for Azure and on-premises.

# Setting Expectations with the Customer

Let customers know that:

- We need to collect required logs and details for the EP team.
- The EP team will perform the in-depth analysis once all data is ready.
- Collecting basic information early speeds up the resolution.

While waiting for EP involvement, you may continue running additional diagnostics.

# Key Questions to Ask the Customer

1. When did the issue start, and did it work previously?
2. How did you discover that the exclusions are not working as expected? (if applicable)
3. Which specific paths and applications need to be excluded from Defender (Msmpeng.exe) or Defender for Endpoint (MsSense.exe)?
4. How many machines are affected, and what are their names?
5. Do you have other machines with the same OS that are working correctly?
6. Please provide any screenshots, alert IDs, machine IDs, workspace IDs (MDE portal), or other information that could help define the path for this case.

## Part A — Log Collection by OS

### Windows Defender Client (Windows 8/10, Server 2016/2019/2022)

1. Open an elevated Command Prompt.
2. Change to the "C:\Program Files\Windows Defender" folder.
3. Type `MpCmdRun.exe -getfiles` and press Enter.
4. Wait about one minute until you see "Files successfully created".
5. Type `Msinfo32 /NFO %temp%\%computername%_MSINFO.NFO` and press Enter.
6. Send the "MpSupportFiles.cab" file from "C:\ProgramData\Microsoft\Windows Defender\Support".
7. Send the "COMPUTERNAME_MSINFO.NFO" file from the %temp% folder.

### SCEP Client (Windows 7, Server 2008 R2, Server 2012 R2)

1. Open an elevated Command Prompt.
2. Change to the "C:\Program Files\Microsoft Security Client" folder.
3. Type `MpCmdRun.exe -getfiles` and press Enter.
4. Wait about one minute until you see "Files successfully created".
5. Type `Msinfo32 /NFO %temp%\%computername%_MSINFO.NFO` and press Enter.
6. Send the "MpSupportFiles.cab" file from "C:\ProgramData\Microsoft\Microsoft Antimalware\Support".
7. Send the "COMPUTERNAME_MSINFO.NFO" file from the %temp% folder.

## Part B — MDEClientAnalyzer

1. Download the MDEClientAnalyzer Preview from https://aka.ms/betamdeanalyzer to one affected machine.
2. Extract the tool to C:\temp.
3. Open an elevated Command Prompt and run `MDEClientAnalyzer.cmd -c` (enter 15 minutes when asked for data collection).
4. Reproduce the relevant symptoms.
5. Press 'q' in the CMD window to stop the traces.
6. Wait while the system generates the data collection and report.
7. Upload the resulting logs to the secure DTM workspace associated with this support case.

## Part C — Procmon Capture

1. Download the latest Procmon from https://download.sysinternals.com/files/ProcessMonitor.zip
2. Extract and copy it to the problem machine.
3. Right-click Procmon, choose "Run as administrator," and reproduce the issue.
4. Accept the EULA.
5. Let Procmon run for 3-4 minutes.
6. Stop capturing by clicking the blue magnifying glass or pressing Ctrl+E.
7. Go to File > Save.
8. Select "All events" and "Native Process Monitor Format (PML)."
9. Click OK.
10. Zip the .pml file and upload it via the link from Part A.

# Next Steps

After requesting the information, add the details in the case notes. Then transfer the ticket or open a collaboration with the EP team as needed. Edit the SAP of the ticket to match the Endpoint team.

The EP team is in the Security category under the Product Name "Microsoft Defender":
- Antivirus (Defender, SCEP) issues → "Microsoft Defender Antivirus"
- MDE (MsSense.exe) issues → "Microsoft Defender for Endpoint"

# Reference Links

- [Internal EP Queue Information](https://msaas.support.microsoft.com/queue/9b0ab8dc-96e7-436f-a59a-4a9fe2cdb39c)
