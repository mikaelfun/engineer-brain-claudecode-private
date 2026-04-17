---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/LDAP/LDAP Client/LDAP Client: More Information"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/LDAP/LDAP%20Client/LDAP%20Client%3A%20More%20Information"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/890464&Instance=890464&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/890464&Instance=890464&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides an overview of LDAP referrals, client considerations, common client LDAP controls, and compares various client APIs. Additionally, it includes links to training videos and further materials for a deeper understanding of LDAP.

[[_TOC_]]
<BR>



# More Information


## LDAP Referrals
LDAP (Lightweight Directory Access Protocol) referrals are a mechanism that allows one LDAP server to refer a client to another server. This is used to spread the workload across multiple servers or to allow clients to access information that is not located on the current server.

## Client considerations

- A client must handle any LDAP Referral.
- It may ignore the referral
- It may go and redirect its query to the location provided


## Common client LDAP control

A client can send a control to indicate a desired page size.  
If more results are available, the client will need to send the same query again including the cookie it received in the previous response.
- If a paged control is not used, the server will return the value of MaxPageSize as defined in the server's policy.

## Comparing Client APIs

- [LDAP API](https://docs.microsoft.com/en-us/windows/win32/api/winldap/)(implemented in the Windows DLL wldap32.dll)
  - Fast due to minimal overhead.
  - Difficult to program. Must use a language such as C++.
  - Does not directly support native Windows functionality like setting passwords or enabling/disabling users.
  - Supports long-running queries for change notification, that is, you can be notified when an object changes in the DS.
- [ADSI](https://docs.microsoft.com/en-us/windows/win32/adsi/adsi-ldap-provider)(Set of COM DLLs that abstract and call the - 
  - functions in wldap32.dll)
  - Easy to program abstracted API model.
  - Can program from any COM capable language (VB, VBScript, Perl, etc).
  - Makes difficult tasks easier (Setting passwords, moving objects, etc).
  - Can be used as a directory management API against NT 4 SAM.
  - A bit slower than straight LDAP due to the property cache and COM overhead.
- [System.DirectoryServices](https://docs.microsoft.com/en-us/dotnet/api/system.directoryservices?view=net-5.0)(.Net framework class on top of ADSI)
  - Newly designed abstracted API. Drops some of the archaic ADSI interfaces.
  - Can be used from any .Net language.
- [System.DirectoryServices.Protocols](https://docs.microsoft.com/en-us/previous-versions/dotnet/articles/bb332056(v=msdn.10))
  - New in .NET 2.0
  - Does not build on ADSI
  - Offers granularity of LDAP API to the managed world
- [Powershell Commandlets  AD Web Service](https://docs.microsoft.com/en-us/powershell/module/activedirectory/?view=windowsserver2019-ps)
  - Covers AD object level work, but also high abstraction of AD tasks.


# Trainings

Videos:

[LDAP Deep Dive Sessions by Aman - LDAP Client](https://msit.microsoftstream.com/video/17e70840-98dc-a7ab-453d-f1ebb88a9927?list=user&amp;userId=e08964ad-125f-44cb-9a35-c9c11743bac1)

[LDAP Deep Dive sessions with Herbert Mauerer - Part 1](https://msit.microsoftstream.com/video/df7f0840-98dc-a7ab-58e8-f1ebb7e4f39e?list=user&amp;userId=e08964ad-125f-44cb-9a35-c9c11743bac1)

[LDAP Deep Dive sessions with Herbert Mauerer - Part 2](https://msit.microsoftstream.com/video/6bcf0840-98dc-a7ab-f2fd-f1ebb8746d23?list=user&amp;userId=e08964ad-125f-44cb-9a35-c9c11743bac1)

[LDAP Deep Dive sessions with Herbert Mauerer - Part 3](https://msit.microsoftstream.com/video/df7f0840-98dc-a7ab-58e6-f1ebb7e4f39e?list=user&amp;userId=e08964ad-125f-44cb-9a35-c9c11743bac1)

Further training materials by @<DE77CC54-04ED-6604-A054-B4D3593ABDE4> can be found [here](https://microsofteur-my.sharepoint.com/personal/herbertm_microsoft_com/_layouts/15/onedrive.aspx?ga=1&id=%2Fpersonal%2Fherbertm%5Fmicrosoft%5Fcom%2FDocuments%2Ftraining%2FLDAP%2DProtocol%2D210519&view=0)