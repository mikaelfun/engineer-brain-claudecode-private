---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Group Policy/Workflow: GPO: Useful tools | resources/Local Group Policy Corruption Auditing and Detection via EXAMPLE Script"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FGroup%20Policy%2FWorkflow%3A%20GPO%3A%20Useful%20tools%20%7C%20resources%2FLocal%20Group%20Policy%20Corruption%20Auditing%20and%20Detection%20via%20EXAMPLE%20Script"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1635441&Instance=1635441&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1635441&Instance=1635441&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This guide helps you set up security auditing and scheduled tasks to identify and troubleshoot corruption in local group policy files.

[[_TOC_]]

# Troubleshooting local group policy corruption

This page is to help cover scenarios where local group policy experiences either a corrupt `gpt.ini` or `reg.pol`.

Notable KBs covering this subject:
- https://internal.evergreen.microsoft.com/en-us/topic/local-registry-pol-corrupted-blank-allegedly-due-to-sccm-c8677118-7824-db51-9100-5114d05b01f2

- https://internal.evergreen.microsoft.com/en-us/topic/adds-gphelp-group-policy-application-fails-with-event-id-7016-and-error-code-0x80004005-2147500037-a6a0bdc3-415c-e976-f3f7-c95d3f6ccaf2



##Step 1 : Enable security auditing

Configure File System security auditing

 
 ![A picture showing how to configure File System security auditing.](/.attachments/image-2596850b-88cb-48f3-82ec-529e2fd4ea68.png)
 
 
You then need to configure auditing on the file itself 

![A picture showing the specific item settings for auditing.](/.attachments/image-7c941a87-8b22-4993-b416-ab9b3b6d5629.png)
 
 
 

 
That will cause event ID 4663 to be generated in the security event log :
```
Log Name:      Security
Source:        Microsoft-Windows-Security-Auditing
Date:          9/11/2018 2:21:20 PM
Event ID:      4663
Task Category: File System
Level:         Information
Keywords:      Audit Success
User:          N/A
Computer:      machine.contoso.com
Description: An attempt was made to access an object.
 
Subject:
Security ID:  CONTOSO\Administrator
Account Name:  Administrator
Account Domain:  CONTOSO
Logon ID:  0x44BF9
 
Object:
Object Server:  Security
Object Type:  File
Object Name:  C:\Windows\System32\GroupPolicy\Machine\Registry.pol
Handle ID:  0xf58
Resource Attributes: 
 
Process Information:
Process ID:  0xda8
Process Name:  C:\Windows\explorer.exe
 
Access Request Information:
Accesses:  READ_CONTROL
    
Access Mask:  0x20000
```
	The event will show the process that modified the file
 
##Step 2: Create a scheduled task to confirm if `registry.pol` is valid

The scheduled task should execute the script `registry-pol-Checker.ps1` shown below.  

**This is an example script only**.  
Send the script contents to the customer in the body of an email. Do not send the customer the script in a PS1 file. The customer will then need to review the script and save it as a PS1 file in their environment, for example, named `registry-pol-Checker.ps1`.


 
````
 
#--------------Global variables----------------
$VerbosePreference = "Continue"
$path = "C:\Windows\System32\GroupPolicy"
$pathLocal = "C:\Windows\System32\GroupPolicy\Machine\registry.pol"
$ProcessLog = "C:\temp\processes.log"
 
#--------------Create event logs source----------------
 
if([System.Diagnostics.Eventlog]::SourceExists("CONTOSO troubleshooting")){write-verbose "CONTOSO troubleshooting source exist"}
else{New-EventLog -LogName Application -Source "CONTOSO troubleshooting"}
 
#--------------Check if registry.pol are valid----------------
 
if(test-path $pathLocal)
{
 
    $(get-childitem -path $path -Recurse -Filter "registry.pol").FullName | % {
        $lastWrite = $(Get-Item -Path $_).LastWriteTime
        if($(Get-Content -Path $_) -match "PReg"){write-verbose "$_ is Valid.`nLast Write time: $lastWrite"}
        else{
            write-verbose "$_ is invalid.`nLast Write time: $lastWrite"
            write-eventlog -logname Application -source "CONTOSO troubleshooting" -entrytype Information -eventid 911 -message "$_ is invalid.`nLast Write time: $lastWrite.`nSee $ProcessLog for process list"
            $now = Get-Date ; Write-Output "=================== `n$now `n--------------------" | out-file $ProcessLog -Append
            Get-Process | out-file $ProcessLog -Append
            }
        }
}
else 
{write-host "$pathLocal does not exist on this machine"} 
````

 
- Change the name and the path of the `processes.log` file as required.
- The aim is, if the script is run regularly via the scheduled task, to retrieve a PID (Process ID) from the file `C:\temp\processes.log` which we can then cross-match to the event 4663 and identify the process that last wrote to the `registry.pol` file. Ideally, the task would run at least once per hour.
 
 
When it detects a corruption in `C:\Windows\System32\GroupPolicy\Machine\registry.pol`, event ID 911 is written in the Application event log. You will see an entry such as:
````
Log Name:      Application
Source:        CONTOSO troubleshooting
Date:          10/19/2019 1:23:08 PM
Event ID:      911
Task Category: (1)
Level:         Information
Keywords:      Classic
User:          N/A
Computer:      mamachine.contoso.com
 
Description:
C:\Windows\System32\GroupPolicy\Machine\registry.pol is invalid.
Last Write time: 10/19/2019 13:21:08.
See C:\temp\processes.logfor process list
 ````
The advantage of the 911 event, is that you can collate data on the frequency and number of affected machines, and potentially raise an alert based on this.
