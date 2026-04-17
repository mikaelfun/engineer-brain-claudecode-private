---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Get User Mode Dump Hanging Process_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/Get%20User%20Mode%20Dump%20Hanging%20Process_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
- cw.Reviewed-02-2025
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


## Summary

This article describes how to collect a user-mode dump of a hanging process without terminating it. Use this approach when a service or process is hanging or behaving unexpectedly without crashing.

- On Windows services, you might find events like the following in the System log:

  <span class="small"></span>

  ```
      Log Name:      System
      Source:        Service Control Manager
      Date:          12/16/2015 11:19:36 AM
      Event ID:      7022
      Task Category: None
      Level:         Error
      Keywords:      Classic
      User:          N/A
      Computer:      RcnSharePoint.rcnradio.net
      Description:
      The Base Filtering Engine service hung on starting.
  ```

## Instructions

1. Verify that the binary responsible for the process/service is current, then capture one or a set of user-mode dumps and engage the application team for analysis.
   - For Windows services, you may also need to engage GES for further analysis.
2. Download the [Procdump tool](http://download.sysinternals.com/files/Procdump.zip).
3. Open an elevated Command Prompt and capture a sample dump using the following command:
   ```
   procdump.exe -s <seconds between dumps> -n <number of dumps> -ma <process name>
   ```
   - For example, to take 3 dumps 5 seconds apart from the Base Filtering Engine service:
     ```
     procdump.exe -s 5 -n 3 -ma bfe
     ```

**Process Dumps When Stuck:**

1. **Procdump of the Application When Unresponsive:**
   - Use the following command to create a dump when the application is unresponsive:
     ```
     procdump.exe -ma -s 60 -n 3 <executable name or PID>
     ```
   - This command writes 3 dumps 60 seconds apart to determine if the process is making progress.
   - Adjust the time between dumps based on the severity of the hang.

2. **Task Manager Dumps:**
   - If other methods are not feasible, use Task Manager to create dumps.
   - Ensure you capture 3 dumps several seconds apart to verify process progression.

3. **Dumpchk Verification:**
   - Run `dumpchk` to verify that the dump files are not corrupted using below steps.
   
      Use Dumpchk.exe (Dump Verifier Tool)
      
         Dumpchk is a lightweight command-line utility included in the Debugging Tools for Windows (part of the Windows 10 SDK) that checks the dump file without loading symbols.
        This tool provides a quick validation to check if the dump file is structurally intact.
 
**Next Steps:**
 
 If the File is Truncated
       If either tool reports the file as truncated, it means that the dump creation process couldn’t complete due to size or configuration constraints. In such cases:
- Review and adjust the system's dump configuration settings.
- Ensure sufficient pagefile space and select the appropriate dump type (e.g., Kernel or Complete Memory Dump).
- This will help capture a usable dump file the next time the issue occurs.
 
 If the File is Valid
       If the file loads without truncation or corruption errors, you can proceed with analysis or engage WOA Ava channel for dump analysis for further investigation

**Once you have installed the tool, open cmd as admin, navigate to "C:\Program Files (x86)\Windows Kits\10\Debuggers\x64" ensure the .dmp file location is correct is and run the following command:**
 
- dumpchk.exe c:\mydir\dumpfile2.dmp

- In the example above the .dmp file is located under C:\mydir, please use the correct path based on your scenario.
 
If you get something like the following output, the dump is corrupted and needs to be collected again, if not you can continue with next step of engaging WOA SME for dump analysis
---

::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md :::
