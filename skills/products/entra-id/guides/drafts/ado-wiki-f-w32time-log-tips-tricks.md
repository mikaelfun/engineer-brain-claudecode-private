---
source: ado-wiki
sourceRef: "Supportability\WindowsDirectoryServices\WindowsDirectoryServices;C:\Program Files\Git\Windows Time\Workflow; Windows Time; W32time log tips and tricks"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Time%2FWorkflow%3A%20Windows%20Time%3A%20W32time%20log%20tips%20and%20tricks"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423325&Instance=423325&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423325&Instance=423325&Feedback=2)

___
<div id='cssfeedback-end'></div>

This guide provides instructions on how to enable and disable the Windows Time (w32time) log on various versions of Windows, including alternative methods using registry keys. It also includes important information about the log's time format and provides a PowerShell script for converting timestamps.

# How to enable and disable Windows Time log

## Command to enable w32time log

|  |  |
|--|--|
| **For Windows 2000 to 2012 R2/8.1** | `w32tm /debug /enable /file:%SystemRoot%\temp\W32Time.log /size:10485760 /entries:0-300` |
| **For Windows 2016/10 and later** | `w32tm /debug /enable /file:%SystemRoot%\temp\W32Time.log /size:10485760 /entries:0-1003` |

## Command to disable w32time log

|  |  |
|--|--|
| **Cross-platform** | `w32tm /debug /disable` |

:warning: **REMEMBER:** Changes are applied only after restarting the w32time service.

### Alternative method using registry keys

- `REG ADD HKLM\SYSTEM\CurrentControlSet\Services\W32Time\Config /v FileLogEntries /d "0-1003" /t REG_SZ /Y`
- `REG ADD HKLM\SYSTEM\CurrentControlSet\Services\W32Time\Config /v FileLogName /d "%SystemRoot%\temp\W32Time.log" /t REG_SZ /Y`
- `REG ADD HKLM\SYSTEM\CurrentControlSet\Services\W32Time\Config /v FileLogSize /d 10485760 /t REG_DWORD /Y`

### Important information related to the w32time log

- Time in the log is always in Coordinated Universal Time (UTC), regardless of the server's timezone.
- The day is displayed using the Julian calendar. You can convert it to a modern date using this PowerShell script:

```powershell
# Script to convert timestamp entry in w32time log into a readable date 

param([STRING]timelog) 
if(!timelog -or (timelog -eq Null)){timelog = Read-Host "Enter timestamp to convert in date"} 
# Function to convert 
function ConvertDate () 
    { 
    DateEnd = timelog  
    DateStart = [datetime]"01/01/1601 00:00" 
    TargetDate = DateStart.AddDays(DateEnd) 
    global:outTimestamp = Get-Date TargetDate -format "yyyy/MM/dd" 
    write-host -ForegroundColor Green "`tTimestamp timelog correspond to (yyyy/MM/dd): $outTimestamp" 
    } 
# Main 
ConvertDate
```

### When w32time log is verbose, you can retrieve the service configuration: all lines containing ReadConfig

 ![Workflow_Windows_Time_W32time_log_tips_and_tricks_1.png](/.attachments/WindowsTime/Workflow_Windows_Time_W32time_log_tips_and_tricks_1.png)

- In **blue**, settings are retrieved from `HKLM\SYSTEM\CurrentControlSet\Service\W32Time`
- In **yellow**, settings have been applied by policy and stored in `HKLM\Software\Policies\Microsoft\W32Time`

### Scenarios

- **Scenario where the machine does NOT receive NTP (Network Time Protocol) query answers (non-working scenario):**

![Workflow_Windows_Time_W32time_log_tips_and_tricks_1.png](/.attachments/WindowsTime/Workflow_Windows_Time_W32time_log_tips_and_tricks_2.png)

- **Scenario where the time synchronization correctly receives NTP answers from the time source (working scenario):**

![Workflow_Windows_Time_W32time_log_tips_and_tricks_1.png](/.attachments/WindowsTime/Workflow_Windows_Time_W32time_log_tips_and_tricks_3.png)

- **Sample of an issue using Secure Time Seeding on a VDI (Virtual Desktop Infrastructure) machine (2016):**

![Workflow_Windows_Time_W32time_log_tips_and_tricks_1.png](/.attachments/WindowsTime/Workflow_Windows_Time_W32time_log_tips_and_tricks_4.png)

-> Solution is to disable **Secure Time Seeding** on this machine:
`reg add HKEY_L`

[[TOSP_]]

-> Solution is to disable **Secure Time Seeding** on this machine:  
**_reg add  HKEY_LOCAL_MACHINE\System\CurrentControlSet\Services\W32Time\Config /v UtilizeSslTimeData /t REG_DWORD /d 0 /f_**
