---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Group Policy/Workflow: GPO: Scoping Aids"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FGroup%20Policy%2FWorkflow%3A%20GPO%3A%20Scoping%20Aids"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/418758&Instance=418758&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/418758&Instance=418758&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document is a guide for scoping Group Policy cases by providing ways to obtain basic configuration information. It includes instructions for using the Group Policy Management Console (GPMC) and PowerShell commands.

[[_TOC_]]

#Scoping Aids Description
This section covers different ways of obtaining basic configuration information while scoping a Group Policy case.  
It is intended to help understand where configuration information can be found and guide you if needed. This is not a data collection plan.

## Group Policy Management Console (GPMC)

###How to view GPO name / ID / modify date / status / version:
![A picture depicting the details tab of a group policy, showing the name, id, modify date, status and version.](/.attachments/GroupPolicy/Workflow_GPO_Scoping_Aids.png) 

###How to view Security / WMI Filtering:  
![A picture depicting the scope tab of a GPO, highlighting the WMI filtering and security section.](/.attachments/GroupPolicy/Workflow_GPO_Scoping_Aids_1.png) 

###How to identify if a GPO is enforced:  
![a picture highlighting where to look for an icon indicating a GPO is enforced.](/.attachments/GroupPolicy/Workflow_GPO_Scoping_Aids_2.png) 
![a picture highlighting where to look for an icon indicating a GPO is enforced as well.](/.attachments/GroupPolicy/Workflow_GPO_Scoping_Aids_3.png) 

##PowerShell

###How to get the GPO Unique ID: 
``` powershell
Get-GPO -name GPO_NAME # Replace GPO_NAME with the GPO Name in question
```

###How to determine the GPO's links:
```powershell
$GPOName = 'GPO_NAME' # Replace GPO_NAME with the GPO Name in question 

Function GPLinks_Result {  

    [xml]$r = Get-GPOreport -Name $GPOName -ReportType Xml -ErrorAction Stop 

    [PSCustomObject]@{ 
        'GPO Name'           = $r.GPO.Name 
        'Links To OUs'       = $r.GPO.LinksTo.SOMName 
        'Link Enabled'       = $r.GPO.LinksTo.Enabled 
        'GPO Enforced'       = $r.GPO.LinksTo.NoOverride 
        'Date Created'       = ([datetime]$r.GPO.CreatedTime).ToShortDateString() 
        'Last Date Modified' = ([datetime]$r.GPO.ModifiedTime).ToShortDateString() 
    } 
}  
GPLinks_Result  | ft -AutoSize
```

###How to get the user/computer OU:
``` powershell
Get-ADUser user_name | fl DistinguishedName 
Get-ADComputer computer_name | fl DistinguishedName 
```

###How to get the user/computer group membership: 
``` powershell
(Get-ADUser user_name Properties MemberOf | Select-Object MemberOf).MemberOf 
(Get-ADObject -filter { objectclass -eq 'computer' -and name -eq 'computer_name' } Properties MemberOf | Select-Object MemberOf).MemberOf  
```

###How to get the GPO's security filtering:
``` powershell
$GPOName = 'GPO_NAME' # Replace GPO_NAME with the GPO Name in question 
$GPPermissions = Get-GPPermissions -Name $GPOName -All 

foreach ($p in $GPPermissions) {             
    $obj = New-Object -TypeName PSObject -Property @{ 
        GPOName     = $GPOName 
        AccountName = $($p.trustee.name) 
        AccountType = $($p.trustee.sidtype.tostring()) 
        Permissions = $($p.permission) 
    } 
    $obj | Select GPOName, AccountName, AccountType, Permissions    
}  
```

###How to check if the GPO linked to WMI Filter: 
``` powershell
$GPOName = 'GPO_NAME' # Replace GPO_NAME with the GPO Name in question  

Function GPOsWMIFilter {  
    [xml]$r = Get-GPOreport -Name $GPOName -reportType Xml -ErrorAction Stop 

    [PSCustomObject]@{ 
        'GPO Name'        = $r.GPO.Name 
        'Wmi Filter Name' = $r.GPO.FilterName 
    } 
}  
GPOsWMIFilter  | ft -AutoSize 
```