---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ESR/Workflow: ESR: Troubleshooting/Workflow: ESR: Data Collection Script"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FESR%2FWorkflow%3A%20ESR%3A%20Troubleshooting%2FWorkflow%3A%20ESR%3A%20Data%20Collection%20Script"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## ESR: Data collection guide for ESR

This guide provides instructions for data collection using TSSv2, the preferred method for Windows 11 and the latest Windows 10 versions.

### Data collection with TSS

Please access the **latest version** of the **TSS scripts** from **[https://aka.ms/getTSS](https://aka.ms/getTSS)**.

You can download the script directly on the customer's machine because the download link location is public.

### Preparation

1. Download the data collection PowerShell scripts from [https://aka.ms/getTSS](https://aka.ms/getTSS).

2. Create a directory on the client machine (both source and destination) where the tracing is going to run, for example, `c:\ms`.

3. Extract and copy the TSS PowerShell scripts into the `c:\ms` folder.

**Side Note:**

- If the sync is working in one direction (from device1 to device2, but not from device2 to device1), then run the script on both client machines.
- If the sync is not working in any direction, you may choose to collect the data only from one device.

### Execution

1. From an elevated admin PowerShell, navigate to the `c:\ms` directory and run:
    ```powershell
    .\TSS.ps1 -start -ads_esr -netsh -procmon -etloptions circular:4096 -novideo -nopoolmon -noxray -noupdate -nosdp -accepteula -customparams contosoUser
    ```
    to start the tracing.

2. Follow the on-screen instructions until data collection is active.

3. Create the issue that you are investigating by doing the following steps:

    **Note down the current time HH:MM:SS**

4. Modify one of the settings below:

    - Credentials: Credential Locker (web credentials only)
    - Language: Date, Time, and Region: country/region
    - Language: Date, Time, and Region: region format (locale)
    - Language: Preferred languages

    Please let us know which setting was modified, what the original setting was, and what the current setting is.

    **Important: Wait for ~10 minutes**

5. Follow the on-screen instructions to stop the PowerShell data collection script.

6. Wait for the script to stop completely and compress the output into a .zip file in the folder `c:\MS_DATA`. Please collect the .zip file and upload it.

7. Please collect `dsregcmd /status > c:\dsregcmd_%computername%.txt` under **user context** (non-elevated cmd) if the user is not a local administrator on that device and upload the .txt output.
