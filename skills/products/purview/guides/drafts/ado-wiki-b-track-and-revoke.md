---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AIP Service/How To: AipService/How To: Track and Revoke"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FHow%20To%3A%20AipService%2FHow%20To%3A%20Track%20and%20Revoke"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Introduction
The AipService PowerShell (PS) module may be used to track and revoke protected content. 

## Public Documentation
 - Admin: [Track and revoke document access](https://learn.microsoft.com/en-us/purview/track-and-revoke-admin)
 - User: [Track and revoke access to your files](https://support.microsoft.com/en-us/office/track-and-revoke-access-to-your-files-1de9a543-c2df-44b6-9464-396b23018f96)

## Cmdlets Used
 - [Get-AipServiceDocumentLog](https://learn.microsoft.com/en-us/powershell/module/aipservice/get-aipservicedocumentlog?view=azureipps)
 - [Get-AipServiceTrackingLog](https://learn.microsoft.com/en-us/powershell/module/aipservice/get-aipservicetrackinglog?view=azureipps)
 - [Set-AipServiceDocumentRevoked](https://learn.microsoft.com/en-us/powershell/module/aipservice/set-aipservicedocumentrevoked?view=azureipps)

## Prerequisites 
To track and revoke we need: 
 1. the file to be registered for tracking, and 
 2. someone other than the file owner to access the file.

# Walkthrough

## Setup
 - User2 created 2 documents.
   - Each document had text added.
   - Each document had protection label applied. (Each file received a different label).
   - Documents were saved, and closed. 
 - User 2 opened each document a second time. 

## Action
 - The Word documents were given to User1. 
 - User1 opened each file.

## PowerShell
The administrator did `Connect-AipService`. 

Once connected, the administrator used `Get-AipServiceDocumentLog` and `Get-AipServiceTrackingLog` to gather information on the two files User2 created and tracked.

### Display Document Log
`Get-AipServiceDocumentLog -UserEmail user2@cloud1.com -FromTime 04/23/2025`


```
ContentId             : d6090047-22cc-4c5b-8b46-92d52e21a056
Issuer                : user2@cloud1.com
Owner                 : user2@cloud1.com
ContentName           : Dynamic test - by User2.docx
CreatedTime           : 4/24/2025 13:05:00
Recipients            : {PrimaryEmail: allstaff-7184ab3f-ccd1-46f3-8233-3e09e9cf0e66@Cloud1.onmicrosoft.com
                        DisplayName: AllStaff
                        UserType: Group
                        , PrimaryEmail: allstaff-7184ab3f-ccd1-46f3-8233-3e09e9cf0e66@Cloud2.com
                        DisplayName: AllStaff
                        UserType: Group
                        }
TemplateId            : 642a66be-2079-425e-921a-228ac8c3c9fc
PolicyExpires         :
EULDuration           :
SendRegistrationEmail : True
NotificationInfo      : Enabled: False
                        DeniedOnly: False
                        Culture:
                        TimeZoneId:
                        TimeZoneOffset: 0
                        TimeZoneDaylightName:
                        TimeZoneStandardName:

RevocationInfo        : Revoked: False
                        RevokedTime:
                        RevokedBy:
                        UnRevokedBy:
                        UnrevokedTime:
```


```
ContentId             : 4676f1a4-4062-49c0-bc29-fc8a5d05b5f6
Issuer                : Cloud1
Owner                 : user2@cloud1.com
ContentName           : Word3.docx
CreatedTime           : 4/23/2025 19:16:00
Recipients            : {PrimaryEmail: allstaff-7184ab3f-ccd1-46f3-8233-3e09e9cf0e66@Cloud1.onmicrosoft.com
                        DisplayName: AllStaff
                        UserType: Group
                        , PrimaryEmail: allstaff-7184ab3f-ccd1-46f3-8233-3e09e9cf0e66@Cloud2.com
                        DisplayName: AllStaff
                        UserType: Group
                        }
TemplateId            : 46dcecd5-3853-46c4-ad8f-17f316d41e3c
PolicyExpires         :
EULDuration           :
SendRegistrationEmail : True
NotificationInfo      : Enabled: False
                        DeniedOnly: False
                        Culture:
                        TimeZoneId:
                        TimeZoneOffset: 0
                        TimeZoneDaylightName:
                        TimeZoneStandardName:

RevocationInfo        : Revoked: False
                        RevokedTime:
                        RevokedBy:
                        UnRevokedBy:
                        UnrevokedTime:
```


### Display Tracking Information 
`Get-AipServiceTrackingLog -UserEmail user2@cloud1.com -FromTime 04/23/2025`


```
ContentId            : d6090047-22cc-4c5b-8b46-92d52e21a056
Issuer               : user2@cloud1.com
RequestTime          : 4/24/2025 13:05:56
RequesterType        : User
RequesterEmail       : user1@cloud1.com
RequesterDisplayName : User 1
RequesterLocation    : IP: 72.152.179.15
                       Country:
                       City:
                       Position:

Rights               : {VIEW,VIEWRIGHTSDATA,DOCEDIT,EDIT,PRINT,EXTRACT,REPLY,REPLYALL,FORWARD,OBJMODEL}
Successful           : True
IsHiddenInfo         : False
```
```
ContentId            : d5cd6202-4c05-4b80-9d37-3d862bf6cc60
Issuer               : user2@cloud1.com
RequestTime          : 4/24/2025 13:03:46
RequesterType        : User
RequesterEmail       : user1@cloud1.com
RequesterDisplayName : User 1
RequesterLocation    : IP: 72.152.179.15
                       Country:
                       City:
                       Position:

Rights               : {VIEW,VIEWRIGHTSDATA,DOCEDIT,EDIT,REPLY,REPLYALL,FORWARD,OBJMODEL}
Successful           : True
IsHiddenInfo         : False
```


### Revoke Content
`Set-AipServiceDocumentRevoked -ContentId d6090047-22cc-4c5b-8b46-92d52e21a056 -IssuerName user2@cloud1.com`
```
This document is now revoked. All recipients will lose access to this document. If the label allows offline access, recipients will have access till the offline access expires.
```
### Verify Revocation
`Get-AipServiceDocumentLog -UserEmail user2@cloud1.com -FromTime 04/24/2025`

```
ContentId             : d6090047-22cc-4c5b-8b46-92d52e21a056
Issuer                : user2@cloud1.com
Owner                 : user2@cloud1.com
ContentName           : Dynamic test - by User2.docx
CreatedTime           : 4/24/2025 13:05:00
Recipients            : {PrimaryEmail: allstaff-7184ab3f-ccd1-46f3-8233-3e09e9cf0e66@slightcloud.onmicrosoft.com
                        DisplayName: AllStaff
                        UserType: Group
                        , PrimaryEmail: allstaff-7184ab3f-ccd1-46f3-8233-3e09e9cf0e66@microsoft.com
                        DisplayName: AllStaff
                        UserType: Group
                        }
TemplateId            : 642a66be-2079-425e-921a-228ac8c3c9fc
PolicyExpires         :
EULDuration           :
SendRegistrationEmail : True
NotificationInfo      : Enabled: False
                        DeniedOnly: False
                        Culture:
                        TimeZoneId:
                        TimeZoneOffset: 0
                        TimeZoneDaylightName:
                        TimeZoneStandardName:

RevocationInfo        : Revoked: True
                        RevokedTime: 4/24/2025 13:21:30
                        RevokedBy: admin@cloud1.com
                        UnRevokedBy:
                        UnrevokedTime:
```


