---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Dependencies/Windows OS/Windows Secure Boot certificates expiring in 2026 - Cloud PC"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FDependencies%2FWindows%20OS%2FWindows%20Secure%20Boot%20certificates%20expiring%20in%202026%20-%20Cloud%20PC"
importDate: "2026-04-06"
type: troubleshooting-guide
---

|Contributors|
|--|
| [Kimia Mosaed](mailto:kimiamosaed@microsoft.com) |
| [Pedro Matos](mailto:pedromatos@microsoft.com) |

#Troubleshooting Guide
 [[_TOC_]]

# Support Boundaries 
Support for Secure Boot certificate expiration should begin with the Windows Performance team:
Windows/Windows 11/Windows 11 Enterprise and Education, version 25H2/System Performance/Startup configuration (general, secure boot, UEFI)

#Introduction
      
This article explains what **Secure Boot** is, how to check whether it is enabled, how to verify the expiration **date of the Secure Boot certificates**, and how to confirm that the **Secure Boot configuration** is up to date. It also outlines the methods available to **push Secure Boot settings to client machines**. We cover three approaches: 
- Using the Registry 
- Using Group Policy (GPO) 
- using Microsoft Intune.

##What is Secure Boot?

Secure Boot is a UEFI (Unified Extensible Firmware Interface) firmware feature that helps protect your device when it starts up. It only allows trusted, digitallysigned software to run during boot, so malware or unauthorized bootloaders cant load.
It works by checking the softwares signature against trusted certificates stored in the system firmware. If the signature isnt trusted, the system wont load it.

##Windows Secure Boot certificates expiring in 2026

Since Windows first introduced Secure Boot, all Windows devices (including Cloud PCs) have used the same Microsoft certificates in the KEK (Key Enrollment Key) and DB (Secure Boot Signature Database). These certificates are now approaching expiration, and the device is affected if it uses any of the listed versions. To keep Windows running properly and continue receiving updates, the Secure Boot certificates need to be updated. The expire dates are mentioned in Figure 1.



![Picture1.png](/.attachments/Picture1-76e48aa3-8da1-480d-856d-378b27b7ac4f.png)
_**Figure 1** -Certificates expire dates._

      
##Steps to validate the secure boot setting , status and how to push updates:

<table style="margin-left:.10in">
<tr style="background:#ffcc;color:black">
<td>
<p>&#128373; <b>Note</b></p>
<p style="margin-left:.10in">

In the below steps, always use **PowerShell** as administrator.. </a></p>
</tr>
</table> 

###1. Check if secure boot is enabled or disabled:
  ```    
# Initialize result object in preparation for checking Secure Boot state
$result = [PSCustomObject]@{
 SecureBootEnabled = $null
}
try {
 $result.SecureBootEnabled = Confirm-SecureBootUEFI -ErrorAction Stop
 Write-Verbose "Secure Boot enabled: $($result.SecureBootEnabled)"
} catch {
 $result.SecureBootEnabled = $null
 Write-Warning "Unable to determine Secure Boot status: $_"
}
  ```    
###2. Check if secure boot on a Cloud PC is updated or not?
  ``` 
#If Secure Boot is enabled, it is suggested to pull event 1801 from the device using existing log aggregation tools (such as Splunk), or directly via commands such as the following:
# 1. First, run commands to get pertinent events for use
$allEventIds = @(1801,1808)
$events = @(Get-WinEvent -FilterHashtable @{LogName='System'; ID=$allEventIds} -MaxEvents 20 -ErrorAction SilentlyContinue)
# 2. Get the most recent 1801 event
$latest_1801_Event = $events | Where-Object {$_.Id -eq 1801} | Sort-Object TimeCreated -Descending | Select-Object -First 1
# 3. Get the most recent 1808 event
$latest_1808_Event = $events | Where-Object {$_.Id -eq 1808} | Sort-Object TimeCreated -Descending | Select-Object -First 1
# 4. Extract confidence from the 1801 event message text
if ($latest_1801_Event) {
 if ($latest_1801_Event.Message -match '(High Confidence|Needs More Data|Unknown|Paused)') {
 $confidence = $matches[1]
 Write-Host "Confidence: $confidence"
 } else {
 Write-Host "Event 1801 found but confidence value not in expected format"
 }
} else {
 Write-Host "No 1801 event found"
}
#If the value is "High Confidence", it is suggested that registry keys can be modified to start the updates, with success being similarly determined by the existence of event 1808 on the device. If 1808 event(s) are already present on the device, then CA's have already been updated. Capture and check the value of "$latest_1808_Event" after certificates are updated to confirm.
# 5. Check for event 1808 (indicates successful Secure Boot CA update)
if ($latest_1808_Event) {
 Write-Host "Event 1808 found - Secure Boot CA certificates have been updated"
 Write-Host "Event Time: $($latest_1808_Event.TimeCreated)"
 # Event 1808 is logged when the Secure Boot Certificate Authority (CA) update completes successfully
} else {
 Write-Host "No 1808 event found - Secure Boot CA certificates have not been updated yet"
}
  ``` 
![Picture2.png](/.attachments/Picture2-01584463-4b91-4cae-afa0-651421cfca09.png)
_**Figure 2** -"No 1808 event found - Secure Boot CA certificates have not been updated yet"._

    
###3.Registry key updates for Secure Boot:
 
This step explains how to deploy, manage, and monitor Secure Boot certificate updates through Windows registry keys:

 ```  
**Open PowerShell as admin and run the following command.**
reg add HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Secureboot /v AvailableUpdates /t REG_DWORD /d 0x5944 /f

Start-ScheduledTask -TaskName "\Microsoft\Windows\PI\Secure-Boot-Update"

Manually reboot the system when the AvailableUpdates becomes 0x4100
Start-ScheduledTask -TaskName "\Microsoft\Windows\PI\Secure-Boot-Update"

 ``` 
      
After running this step if you check the version -step 2- again you should see:
![Picture3.png](/.attachments/Picture3-18310c52-c393-4112-8b68-ab43ce80c275.png)
_**Figure 3** -Event 1808 found - Secure Boot CA certificates have been updated Event Time:._

###4.Group Policy Objects (GPO) method for Secure Boot
      
This document explains how to deploy, manage, and monitor Secure Boot certificate updates using the Secure Boot Group Policy
      
- [Group Policy Objects (GPO) method of Secure Boot for Windows devices with IT-managed updates - Microsoft Support](https://support.microsoft.com/en-us/topic/group-policy-objects-gpo-method-of-secure-boot-for-windows-devices-with-it-managed-updates-65f716aa-2109-4c78-8b1f-036198dd5ce7)

      
###5.Microsoft Intune method of Secure Boot

      
This document explains how to deploy, manage, and monitor Secure Boot certificate updates using Microsoft Intune.
      
- [Microsoft Intune method of Secure Boot for Windows devices with IT-managed updates - Microsoft Support](https://support.microsoft.com/en-us/topic/microsoft-intune-method-of-secure-boot-for-windows-devices-with-it-managed-updates-1c4cf9a3-8983-40c8-924f-44d9c959889d)

---
        
**Public references:**
      
- [Secure Boot Certificate updates: Guidance for IT professionals and organizations - Microsoft Support](https://support.microsoft.com/en-us/topic/secure-boot-certificate-updates-guidance-for-it-professionals-and-organizations-e2b43f9f-b424-42df-bc6a-8476db65ab2f#:~:text=Example%C2%A0Powershell%20script%20to%20check%20if%20Secure%20Boot%20is%20enabled:%C2%A0)

- [Windows Secure Boot certificate expiration and CA updates - Microsoft Support](https://support.microsoft.com/en-us/topic/windows-secure-boot-certificate-expiration-and-ca-updates-7ff40d33-95dc-4c3c-8725-a9b95457578e)

- [Secure Boot Certificate updates: Guidance for IT professionals and organizations - Microsoft Support](https://support.microsoft.com/en-us/topic/secure-boot-certificate-updates-guidance-for-it-professionals-and-organizations-e2b43f9f-b424-42df-bc6a-8476db65ab2f)

- [Registry key updates for Secure Boot: Windows devices with IT-managed updates - Microsoft Support](https://support.microsoft.com/en-us/topic/registry-key-updates-for-secure-boot-windows-devices-with-it-managed-updates-a7be69c9-4634-42e1-9ca1-df06f43f360d)

- [Group Policy Objects (GPO) method of Secure Boot for Windows devices with IT-managed updates - Microsoft Support](https://support.microsoft.com/en-us/topic/group-policy-objects-gpo-method-of-secure-boot-for-windows-devices-with-it-managed-updates-65f716aa-2109-4c78-8b1f-036198dd5ce7)

- [Microsoft Intune method of Secure Boot for Windows devices with IT-managed updates - Microsoft Support](https://support.microsoft.com/en-us/topic/microsoft-intune-method-of-secure-boot-for-windows-devices-with-it-managed-updates-1c4cf9a3-8983-40c8-924f-44d9c959889d)