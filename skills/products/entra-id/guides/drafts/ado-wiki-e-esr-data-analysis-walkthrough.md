---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ESR/Workflow: ESR: Troubleshooting/Workflow: ESR : Data Analysis"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FESR%2FWorkflow%3A%20ESR%3A%20Troubleshooting%2FWorkflow%3A%20ESR%20%3A%20Data%20Analysis"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## ESR: ESR data analysis walkthrough

This guide provides a step-by-step walkthrough for analyzing Enterprise State Roaming (ESR) data while troubleshooting the roaming of Windows settings.

### Pre-requisite

- Understand the CDS (Cloud Data Storage) workflow from [here](https://internal.evergreen.microsoft.com/en-us/topic/adds-cds-analyzing-the-esr-data-while-troubleshooting-roaming-of-windows-settings-c6227bb2-7de7-0f57-36c6-05923aca5684). We will then relate and make sense of it in the CDS logs.
- TSSv2 will be your tool for data collection in ESR scenarios.

### Environment

- Two Azure Active Directory Joined (AADJ) Windows 11 client machines, MachineA and MachineB
- MachineA is the source
- MachineB is the destination
- ESR is enabled on the tenant for a group which the user is a member of
- Using an example, the "Region" setting is being changed to "India"
- Before making the change, TSSv2 ESR scenario was run

### A. Log analysis on MachineA when the Region setting was changed to "India"

- Start with Procmon present inside the MSDATA\TSS<xx> folder. It captures the process and the registry value that was changed when a supported setting was configured. Scope the Procmon with filters such as:

  1. Process name = SystemSettings.exe (change was initiated from Settings UI)
  2. Operation = RegSetValue

- Example when the Region setting was changed to India:

  ```plaintext
  SystemSettings.exe 5876 RegSetValue HKCU\Control Panel\International\Geo\Name SUCCESS Type: REG_SZ, Length: 6, Data: IN
  SystemSettings.exe 5876 RegSetValue HKCU\Control Panel\International\Geo\Nation SUCCESS Type: REG_SZ, Length: 8, Data: 113
  ```

- At this point, the Settings UI has committed the change and CDS needs to get a notification about these changes. To identify if this happened, convert the CDS.etl inside the MSDATA folder.

- It initializes and loads the CDS, then CDS detects the change is in the windows.data.globalization.culture.culturesettings schema type.

- This will also undergo a conflict resolution algorithm for a winner of the last change that needs to be synced.

- This data needs to sync to the Azure File Sync (AFS) cloud but first, this data will be transformed and encrypted locally on the source.

- The local version of the CloudStore metadata gets an update:

  ```plaintext
  SystemSettings.exe 5876 RegSetValue HKCU\Software\Microsoft\Windows\CurrentVersion\CloudStore\Store\DefaultAccount\Current\default$windows.data.globalization.culture.culturesettings\windows.data.globalization.culture.culturesettings\Data SUCCESS Type: REG_BINARY, Length: 57, Data: 43 42 01 00 0A 02 01 00 2A 06 B4 EE 97 98 06 2A
  ```

- The final sync begins from Azure File Connector (AFC) to the AFS.

- Network traces capture data synced to AFS via secure TLS.

- At this stage, the source has successfully updated the new change to the AFS cloud.

### B. Log analysis on MachineB which is going to receive those changes from AFS

- Network trace will capture Windows Notification Service (WNS) cloud sending a push notification to MachineB.

- AFC detects that this is actually an AFS cloud notification and needs to schedule a delta sync operation with AFS (the URL will be *.activity.windows.com where the wildcard can be region-specific).

- Network trace captures this via TLS where data is downloaded from AFS.

- There will be a clear marker event when the sync has been completed.

### More information

Schema type for supported settings (useful to correlate especially when you see schemas and want to determine which setting is being processed) - refer to the schema type table in the original wiki page.
