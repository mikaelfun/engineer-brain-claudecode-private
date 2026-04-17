---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Account Lockouts/Workflow: Account Lockout: Data Collection - Preparation"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAccount%20Lockouts%2FWorkflow%3A%20Account%20Lockout%3A%20Data%20Collection%20-%20Preparation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414174&Instance=414174&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414174&Instance=414174&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**  
 This article provides a detailed workflow for troubleshooting account lockout issues by identifying the source of bad password attempts. It includes steps for enabling Netlogon debug logging and auditing on Domain Controllers (DCs) and workstations, as well as analyzing security events to pinpoint the issue.

[[_TOC_]]

# Data collection description

For all account lockout problems, the aim is to find the source sending the bad password that causes the user account to get locked. You may already have event logs collected before the service incident was created. If these events reveal the source workstation sending the bad password, the next step would be to check that source workstation to find the concerning application sending the bad password.

Otherwise, if we are starting troubleshooting from scratch, the high-level action plan will be like this:
1. Find on which Domain Controller (DC) the account is locked.
2. Analyze security events and/or Netlogon logs to find the source workstation sending bad passwords.
3. Analyze security events on the workstations to find the concerning application/source.

---

# Prepare for data collection before the account is locked

1. Make sure that Netlogon debug logging is enabled on all DCs at least with the DBFlag 0x2080ffff.
   - `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Netlogon\Parameters\DBFlag` shows the debug level.
   - You can enable logging on a single DC by running the command elevated on CMD:
     ```
     Nltest /dbflag:0x2080ffff
     ```
     or
     ```
     Nltest /server:<dcname> /dbflag:0x2080ffff
     ```

   - You can enable logging on all DCs with the FOR command on CMD:
     ```
     For /f %i in ('dsquery server -o rdn') do nltest /server:%i /dbflag:0x2080ffff
     ```
      ![image.png](/.attachments/image-f65f965c-d201-4cd4-acf4-5b6ea285a174.png)  
   
      Netlogon.log is located under the Windows\Debug folder.
   More information about the logging can be found in this [article](https://support.microsoft.com/en-ca/help/109626/enabling-debug-logging-for-the-netlogon-service).

2. Make sure that auditing is configured on DCs to be able to analyze the security events.
   - The following Auditpol.exe command will provide you with audit settings on that server:
     ```
     Auditpol /get /category:*
     ```
   - You can enable auditing via **Auditpol** for a category or subcategories.
     Here are the list of sample commands for category and subcategories. The need for enabling subcategories depends on the server role and this is explained in the corresponding section - [Workflow: Account Lockout: Data Analysis](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414172/Workflow-Account-Lockout-Data-Analysis-Security-Events). Enabling a category will enable all subcategories under it. You can set granular auditing level or simply enable the main category.
   
   - All in a batch for copy/paste purpose:
     ```
     auditpol /set /subcategory:"Logon" /success:enable /failure:enable
     auditpol /set /subcategory:"Logoff" /success:enable /failure:enable
     auditpol /set /subcategory:"Account Lockout" /success:enable /failure:enable
     auditpol /set /subcategory:"Special Logon" /success:enable /failure:enable
     auditpol /set /subcategory:"Other Logon/Logoff Events" /success:enable /failure:enable
     auditpol /set /subcategory:"User Account Management" /success:enable /failure:enable
     auditpol /set /subcategory:"Kerberos Service Ticket Operations" /success:enable /failure:enable
     auditpol /set /subcategory:"Other Account Logon events" /success:enable /failure:enable
     auditpol /set /subcategory:"Kerberos Authentication Service" /success:enable /failure:enable
     auditpol /set /subcategory:"Credential Validation" /success:enable /failure:enable
     ```

     | Category | Subcategory | Command |
     |:--:|:--:|:--|
     | Logon/Logoff | **Enable all subcategories in one command**<br/>_No need to run subcategory command below_ | `Auditpol /set /category:"Logon/Logoff" /success:enable /failure:enable` |
     || Logon | `Auditpol /set /subcategory:"Logon" /success:enable /failure:enable` |
     || Logoff | `Auditpol /set /subcategory:"Logoff" /success:enable /failure:enable` |
     || Account Lockout | `Auditpol /set /subcategory:"Account Lockout" /success:enable /failure:enable` |
     || Special Logon | `Auditpol /set /subcategory:"Special Logon" /success:enable /failure:enable` |
     || Other Logon/Logoff Events | `Auditpol /set /subcategory:"Other Logon/Logoff Events" /success:enable /failure:enable` |
     | Account Management || `Auditpol /set /subcategory:"User Account Management" /success:enable /failure:enable` |
     | Account Logon | **Enable all subcategories in one command**<br/>_No need to run subcategory command below_ | `Auditpol /set /category:"Account Logon" /success:enable /failure:enable` |
     || Kerberos Service Ticket Operations | `Auditpol /set /subcategory:"Kerberos Service Ticket Operations" /success:enable /failure:enable` |
     || Other Account Logon events | `Auditpol /set /subcategory:"Other Account Logon events" /success:enable /failure:enable` |
     || Kerberos Authentication Service | `Auditpol /set /subcategory:"Kerberos Authentication Service" /success:enable /failure:enable` |
     || Credential Validation | `Auditpol /set /subcategory:"Credential Validation" /success:enable /failure:enable` |

3. Enabling Netlogon debug logging or auditing is mostly the same for DCs, servers, or workstations.
4. It's **IMPORTANT** to ensure the size of the security events is sufficient to capture the events timely before they get overwritten. For example:
   ```
   wevtutil sl Security /ms:524288000
   ```
5. If the server has Group Policy Object (GPO) settings to control the audit level, a group policy refresh may overwrite the settings you configured via Auditpol.
You may want to set the Audit settings via corresponding policy that provides the settings to the server.