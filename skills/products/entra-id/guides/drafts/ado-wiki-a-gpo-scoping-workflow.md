---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Group Policy/Workflow: GPO: Scoping"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FGroup%20Policy%2FWorkflow%3A%20GPO%3A%20Scoping"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/418760&Instance=418760&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/418760&Instance=418760&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This document outlines the key questions and considerations for troubleshooting issues related to Group Policy application in various environments.

[[_TOC_]]

# Scoping

## What

- What OS version(s) is impacted? 
- What type of environment are the impacted clients a part of? 
  - Virtual Desktop Infrastructure (VDI), Remote Desktop Services (RDS), End user environment (laptop/desktop)
- What users/computers are impacted? 
  - Cross Domain/Forest users?  
  - All Users, admins, non-admins, local account vs domain account, etc 
- What is the problem with Group Policy Application? A Group Policy Object (GPO) or specific settings failing to apply or being slow? Which ones?
  - What is the error received, if any? 
  - In which way is it failing? 
  - What is the delay? 
  - Group Policy Preferences (GPP) related settings? If so, which GPP setting?
  - Where they ever applied? 
- What is the GPO configuration? 
  - Which group policies are not applying?  
  - What is the group policy name and Unique ID? 
  - Are settings machine or user specific? 
  - What is the configuration of the link? (linked to Organizational Unit (OU), domain, site)
  - Do users/computers pertain to that OU, domain, site? 
  - Has any Security Filtering been applied to the GPO?  
    - If so, are affected users/computers members of the required groups? 
  - Has any Windows Management Instrumentation (WMI) filter been configured on the GPO?
    - What is the design/expectations? 
    - Does the WMI filter apply to any other GPO and does it work there? 
  - Is loopback processing being used? (If yes: merge or replace mode? What is the design/expectations?)
  - Is the GPO enforced or blocked? 
  - If it is GPP, does it use item level-targeting? Any other common config applied? 
  - Are settings processed synchronously or asynchronously?  



### If **network** issues suspected: 
  - Can the client machine reach the domain controller? 
  - Is DNS working as expected? 
  - Are protocols and ports open? (TCP/UDP - LDAP 389, TCP - LDAPS 636, TCP - GC 3268, TCP - GC secure 3269, TCP/UDP - SMB 445, TCP Dynamic ports, UDP Dynamic ports, UDP 138)  

### If **Group Policy replication** issues suspected:
  - Is the problem intra-site or inter-site specific?
  - Is the GPO not replicating at Active Directory (AD) or Sysvol level?

**\*NOTE:** See [AD Replication](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/420688) or [DFSR](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/400682) workflows for more information on troubleshooting. 

 

### Issues related to **Startup/logon, logoff/shutdown scripts**:
  - Understand which type of script is being run (startup/logon/shutdown/logoff) 
  - What is the script name? 
  - What parameters have there been used? 

## Where

- Where are the impacted clients located? 
  - AD Client Site 
    - Is there a local Domain Controller (DC)? How many?
  - Geographical Location 
  - All over the organization? 
  - Where is the affected machine located? Which site and subnet?  
  - Do we have any firewall between the affected machine and the DCs?

## When

- Does this occur on every logon or just the first time logins?
- Does the issue occur only on the first logon after boot?
- When was the issue first noticed? 
  - Today, last week, etc.
  - Any other changes happen around this time frame? (network changes, new applications, upgrades, etc.) 
  - Has the GPO ever been successfully processed/applied? 

## Extent

- How many machines/users are impacted? 
- How often does this happen? 
  - Is this issue intermittent, random or after every reboot / on every logon, etc. 
  - Is it reproducible? How? 
- How are the group policies managed, through GPMC, AGPM or some 3rd party tool?