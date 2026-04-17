---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/SBSL - Slow Logon/Workflow: SBSL: Data collection/Data Collection: Slow Logon - TSS"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/SBSL%20-%20Slow%20Logon/Workflow:%20SBSL:%20Data%20collection/Data%20Collection:%20Slow%20Logon%20-%20TSS"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1507119&Instance=1507119&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1507119&Instance=1507119&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**
This document outlines the steps to collect logs for slow logon incidents using the TSS script when AuthScripts cannot be used.

### Action Plan

Using a local administrator or domain administrator:

1. **Preparation prior to log collection on the affected machine:**

    a. Download the TSS script from [https://aka.ms/getTSS](https://aka.ms/getTSS).
    
    b. Extract the script to `C:\MS\`.

2. **Open PowerShell as Administrator:**

    a. Navigate to the folder where you saved the TSS on the affected machine:
    ```powershell
    cd C:\MS\
    ```
    b. Start data collection by running:
    ```powershell
    .\TSS.ps1 -Start -Scenario ADS_SBSL
    ```

3. **Reproduce the issue on the impacted machine:**
    
   Log in with the affected user and note the timestamps and username:
    ```plaintext
    - User clicked Ctrl+ Alt + Del at xx:xx:xx AM/PM
    - Entered name and password at xx:xx:xx AM/PM
    - Welcome Screen until xx:xx:xx AM/PM
    - Loading User Profile until xx:xx:xx AM/PM
    - Applying Group Policy until xx:xx:xx AM/PM
    - Got the Desktop at xx:xx:xx AM/PM
    ```

4. **Stop data collection:**
    
   After the user login, switch back to the administrator account where you started the data collection and stop it by clicking on `Y`.

5. **Generate Group Policy results:**
   
   Log in with the problematic user, open Command Prompt, and run the following command:
    ```plaintext
    gpresult /H C:\Gpresults-User.html
    ```

6. **Upload the collected logs to the workspace**

<br>

:memo: **Note:**
If you encounter a scenario where the client is having cached credentials issues and you need to purge tickets, you can run the following commands to purge them:

```plaintext
ipconfig /flushdns
klist purge
klist -li 0x3e7 purge
```
