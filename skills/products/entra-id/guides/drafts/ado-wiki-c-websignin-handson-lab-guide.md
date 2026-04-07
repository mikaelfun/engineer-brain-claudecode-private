---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WebSign-in Support for LogonUI/Hands-On lab/Hands-On lab guide"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWebSign-in%20Support%20for%20LogonUI%2FHands-On%20lab%2FHands-On%20lab%20guide"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1861016&Instance=1861016&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1861016&Instance=1861016&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This document provides a guide about hands-On lab to test the WebSign-in feature. It outlines all steps to configure and use a lab.

[[_TOC_]]

# Log-Analysis of a Successful Sign-In
You can then use the following help to review where the blocker is in case on any problem:
[Log-Analysis of a Successful Sign-In](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1151403/Log-Analysis-of-a-Successful-Sign-In)

---

# Troubleshooting logs

##Authentication-key.txt:

You can find the credential provider:


```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Authentication\Credential Providers\{C5D7540A-CD51-453B-B22B-05305BA03F07}  
(Default)    REG_SZ    Cloud Experience Credential Provider
```

You can confirm if that credential provider has been previously used by looking at:
  

```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Authentication\LogonUI  
    ShowTabletKeyboard    REG_DWORD    0x0  
    IdleTime    REG_DWORD    0x35778  
    LastLoggedOnUser    REG_SZ    AzureAD\WinDSCloud1  
    SelectedUserSID    REG_SZ    S-1-5-21-x-x-x-1001  
    LastLoggedOnSAMUser    REG_SZ    AzureAD\WinDSCloud1  
    LastLoggedOnDisplayName    REG_SZ    WinDSCloud1  
    LastLoggedOnUserSID    REG_SZ    S-1-5-21-x-x-x-1001  
    **LastLoggedOnProvider    REG_SZ    {C5D7540A-CD51-453B-B22B-05305BA03F07}**  
    IsFirstLogonAfterSignOut    REG_DWORD    0x1
```
  
---
## Procmon capture
add  this filter : `path contains C5D7540A-CD51-453B-B22B-05305BA03F07`

![screenshot of filter in procmon](/.attachments/image-27e138d2-a468-4b66-86c6-66b1e4b3f6ab.png =700x)

=> logonui.exe is during the logon screen scenario.  
=> CredentialBrokerUi is when a process needs credentials and is prompting the user.

You should see that openKey with success:  
![screenshot of procmon](/.attachments/image-4d7d0667-5fed-4f5b-9217-82ef1b21c400.png =700x)


---
##Credprovauthui.etl

You can use the following tat file:  
![screenshot of TAT filter](/.attachments/image-1a65fa21-278f-407a-99d0-d6ef4b35f027.png)

or from 
[Websign-in-credprovauthuitrace.tat](https://microsofteur-my.sharepoint.com/:u:/g/personal/jobesanc_microsoft_com/EX0J14TlWCRDjH-q4MxNK5oBWQCjk6pYXD3bAr00m5MNcg?e=qcUtsX)

Here a complete sample:

[Credential provider API](https://learn.microsoft.com/en-us/windows/win32/api/credentialprovider/)

Declares the scenarios in which a credential provider is used, like logon, unlock , credui..
[CREDENTIAL_PROVIDER_USAGE_SCENARIO enumeration](https://learn.microsoft.com/en-us/windows/win32/api/credentialprovider/ne-credentialprovider-credential_provider_usage_scenario)
 
```
949 [1]2D24.2BA4::06/11/24-10:40:46.9927779 [Microsoft.OSG.OSS.CredProvFramework] [CStartCredProvsJob::_StartCredProvsForUsageScenario] EventLevel=Information, Invoke=ICredentialProvider::SetUsageScenario, ProviderId=7, ProviderPointer=0x2B2496AFF70, ProviderCLSID={c5d7540a-cd51-453b-b22b-05305ba03f07}, JobUsageScenario=0x1, Flags=0x0, StartingUsageScenario=0x1, ResultCode=The operation completed successfully. (0x00000000), ExecutionTime=7
952 [2]2D24.2BA4::06/11/24-10:40:47.0063086 [Microsoft.OSG.OSS.CredProvFramework] [CStartCredProvsJob::_StartCredProvsForUsageScenario] EventLevel=Information, Invoke=ICredentialProviderSetUserArray::SetUserArray, ProviderCLSID={c5d7540a-cd51-453b-b22b-05305ba03f07}, ResultCode=The operation completed successfully. (0x00000000)
```

```
978 [3]2D24.2BA4::06/11/24-10:40:47.1080663 [Microsoft.OSG.OSS.CredProvFramework] [AdviseCredProvidersStart] 
981 [3]2D24.2BA4::06/11/24-10:40:47.1081379 [Microsoft.OSG.OSS.CredProvFramework] [CAdviseCredProvsJob::Do] EventLevel=Information, Invoke=ICredentialProvider::Advise, ProviderCLSID={c5d7540a-cd51-453b-b22b-05305ba03f07}, ResultCode=The operation completed successfully. (0x00000000), ExecutionTime=0
988 [1]2D24.2BA4::06/11/24-10:40:47.1083510 [Microsoft.OSG.OSS.CredProvFramework] [AdviseCredProvidersStop] NumberOfRegistedProviders=11, Advise=true
989 [1]2D24.2BA4::06/11/24-10:40:47.1083798 [Microsoft.OSG.OSS.CredProvFramework] 
```
```
[EnumerateCredentialsStart] 
1007 [0]2D24.2BA4::06/11/24-10:40:47.1191475 [Microsoft.OSG.OSS.CredProvFramework] [_CreateEnumeratedCredentialDataForProvider] EventLevel=Information, Invoke=ICredentialProvider::GetCredentialCount, ProviderCLSID={c5d7540a-cd51-453b-b22b-05305ba03f07}, NumOfCredentials=2, DefaultIndex=4294967295, IsAutoLogon=false, ResultCode=The operation completed successfully. (0x00000000), ExecutionTime=10
1008 [0]2D24.2BA4::06/11/24-10:40:47.1191629 [Microsoft.OSG.OSS.CredProvFramework] [_CreateAndAddCredentialDataAtIndexToProvider] EventLevel=Information, Invoke=ICredentialProvider::GetCredentialAt, ProviderCLSID={c5d7540a-cd51-453b-b22b-05305ba03f07}, CredentialIndex=0, ResultCode=The operation completed successfully. (0x00000000), ExecutionTime=0
1009 [0]2D24.2BA4::06/11/24-10:40:47.1191722 [Microsoft.OSG.OSS.CredProvFramework] [_CreateAndAddCredentialDataAtIndexToProvider] EventLevel=Information, Invoke=pProviderData->AddCredentialData, ProviderCLSID={c5d7540a-cd51-453b-b22b-05305ba03f07}, CredentialIndex=0, CredentialId=12, ResultCode=The operation completed successfully. (0x00000000)
1010 [0]2D24.2BA4::06/11/24-10:40:47.1191759 [Microsoft.OSG.OSS.CredProvFramework] [_CreateAndAddCredentialDataAtIndexToProvider] EventLevel=Information, Invoke=ICredentialProvider::GetCredentialAt, ProviderCLSID={c5d7540a-cd51-453b-b22b-05305ba03f07}, CredentialIndex=1, ResultCode=The operation completed successfully. (0x00000000), ExecutionTime=0
1011 [0]2D24.2BA4::06/11/24-10:40:47.1191787 [Microsoft.OSG.OSS.CredProvFramework] [_CreateAndAddCredentialDataAtIndexToProvider] EventLevel=Information, Invoke=pProviderData->AddCredentialData, ProviderCLSID={c5d7540a-cd51-453b-b22b-05305ba03f07}, CredentialIndex=1, CredentialId=13, ResultCode=The operation completed successfully. (0x00000000)
1012 [0]2D24.2BA4::06/11/24-10:40:47.1191801 [Microsoft.OSG.OSS.CredProvFramework] [_CreateEnumeratedCredentialDataForProvider] EventLevel=Information, Invoke=_CreateAndAddCredentialDataAtIndexToProvider, ProviderCLSID={c5d7540a-cd51-453b-b22b-05305ba03f07}, DefaultIndex=4294967295, IsAutoLogon=false, ResultCode=The operation completed successfully. (0x00000000)
```

```
1032 [0]2D24.2BA4::06/11/24-10:40:47.1196072 [Microsoft.OSG.OSS.CredProvFramework] [_GetTileData] EventLevel=Information, Invoke=ICredentialProviderCredential2::GetUserSid, ProviderCLSID={c5d7540a-cd51-453b-b22b-05305ba03f07}, CredentialIndex=0, NumOfCredentials=2, UserSid=S-1-12-1-1643398018-1261955868-3901694363-3017554525
```

```
1249 [1]2D24.2BA4::06/11/24-10:40:47.2285844 [Microsoft.OSG.OSS.CredProvFramework] [EnumerateCredentialsStop] LastLoggedOnProviderId={d6886603-9d2f-4eb2-b667-1971041fa96b}, SupportProviders=({2135F72A-90B5-4ED3-A7F1-8BB705AC276A}, 0)({8FD7E19C-3BF7-489B-A72C-846AB3678C96}, 0)({C5D7540A-CD51-453B-B22B-05305BA03F07}, 2)({D6886603-9D2F-4EB2-B667-1971041FA96B}, 2)({F64945DF-4FA9-4068-A2FB-61AF319EDD33}, 0)({F8A0B131-5F68-486C-8040-7E8FC3C85BB6}, 0), NumberOfSupportProviders=6, NumberOfProviders=11, IsAutoLogon=0, IsConnectedUser=0, IsV2CredProv=0, IsPLAPTile=0, CredTileProviderId={00000000-0000-0000-0000-000000000000}, UserTag=0, SessionId=1, IsRemoteSession=0, ProcessImage=LogonUI.exe
```
```
1259 [1]2D24.2BA4::06/11/24-10:40:47.2287145 [Microsoft.OSG.OSS.CredProvFramework] [AdviseCredentialStart] 
1261 [1]2D24.2BA4::06/11/24-10:40:47.2287235 [Microsoft.OSG.OSS.CredProvFramework] [AdviseCredentialStop] Advise=true, ResultCode=The operation completed successfully. (0x00000000)
```

```
1264 [3]2D24.2200::06/11/24-10:40:47.2292909 [Microsoft.OSG.OSS.CredProvFramework] [CCredentialTileData::IsTileVisible] EventLevel=Information, Invoke=ICredentialProviderCredentialTileDataInfo::GetTileVisibility, IsVisible=1, UserSid=S-1-12-1-1643398018-1261955868-3901694363-3017554525, ProviderCLSID={c5d7540a-cd51-453b-b22b-05305ba03f07}
1270 [2]2D24.2BA4::06/11/24-10:40:47.2302347 [Microsoft.OSG.OSS.CredProvFramework] [SelectCredentialStart] 
1526 [3]2D24.2BA4::06/11/24-10:40:52.4958015 [Microsoft.OSG.OSS.CredProvFramework] [CSelectCredentialJob::Do] EventLevel=Information, Invoke=ICredentialProviderCredential::SetSelected, ProviderCLSID={c5d7540a-cd51-453b-b22b-05305ba03f07}, CredentialId=12, ResultCode=The operation completed successfully. (0x00000000)
1529 [3]2D24.2BA4::06/11/24-10:40:52.4958185 [Microsoft.OSG.OSS.CredProvFramework] [CSelectCredentialJob::Do] EventLevel=Information, Invoke=SelectionChange, ProviderCLSID={c5d7540a-cd51-453b-b22b-05305ba03f07}, TileSelectionFlags=0x21, TileSelectionReplyFlags=0x41
1530 [3]2D24.2BA4::06/11/24-10:40:52.4958202 [Microsoft.OSG.OSS.CredProvFramework] [SelectCredentialStop] TileSelectionFlags=33, TileSelectionReplyFlags=65, WasSelected=1, AutoSubmit=0, ProviderId={c5d7540a-cd51-453b-b22b-05305ba03f07}, ReturnCode=0, IsConnectedUser=0, IsV2CredProv=1, IsPLAPTile=0, CredTileProviderId={c5d7540a-cd51-453b-b22b-05305ba03f07}, UserTag=3, SessionId=1, IsRemoteSession=0, ProcessImage=LogonUI.exe
1534 [3]2D24.2200::06/11/24-10:40:54.4030573 [Microsoft.Windows.CredProvDataModel] [Perftrack_SubmitCredentials_Start] credProvScenario=0, providerId={c5d7540a-cd51-453b-b22b-05305ba03f07}, PartA_PrivTags=16777216
1540 [1]2D24.2BA4::06/11/24-10:40:54.4157030 
```

```
1530 [3]2D24.2BA4::06/11/24-10:40:52.4958202 [Microsoft.OSG.OSS.CredProvFramework] [SelectCredentialStop] TileSelectionFlags=33, TileSelectionReplyFlags=65, WasSelected=1, AutoSubmit=0, ProviderId={c5d7540a-cd51-453b-b22b-05305ba03f07}, ReturnCode=0, IsConnectedUser=0, IsV2CredProv=1, IsPLAPTile=0, CredTileProviderId={c5d7540a-cd51-453b-b22b-05305ba03f07}, UserTag=3, SessionId=1, IsRemoteSession=0, ProcessImage=LogonUI.exe
```

```
[Microsoft.OSG.OSS.CredProvFramework] [CGetSerializationJob::Do] EventLevel=Information, Invoke=ICredentialProviderCredential::GetSerialization, ProviderCLSID={c5d7540a-cd51-453b-b22b-05305ba03f07}, CredentialId=12, CredentialProviderGetSerializationResponse=0x2, ResultCode=The operation completed successfully. (0x00000000)
1541 [0]2D24.2BA4::06/11/24-10:40:54.4226095 [Microsoft.OSG.OSS.CredProvFramework] [GetSerializationStop] ProviderGetSerializationResponse=2, ProviderStatusIcon=0, ProviderId={c5d7540a-cd51-453b-b22b-05305ba03f07}, NumberOfUserInputs=0, ReturnCode=0, IsConnectedUser=0, IsV2CredProv=1, IsPLAPTile=0, CredTileProviderId={c5d7540a-cd51-453b-b22b-05305ba03f07}, AuthenticationPackage=0, CredSerializeProviderId={c5d7540a-cd51-453b-b22b-05305ba03f07}, UserTag=3, SessionId=1, IsRemoteSession=0, ProcessImage=LogonUI.exe
```

Final result:  
2291 [1]2D24.2BA4::06/11/24-10:40:56.0565047 [Microsoft.OSG.OSS.CredProvFramework] [ReportResultStart]   
2292 [1]2D24.2BA4::06/11/24-10:40:56.0566885 [Microsoft.OSG.OSS.CredProvFramework] [CReportResultJob::Do] EventLevel=Information, Invoke=ICredentialProviderCredential::**ReportResult, CredentialId=12, NtStatus=STATUS_SUCCESS, NtSubstatus=STATUS_SUCCESS, ResultCode=The operation completed successfully. (0x00000000)**  
2293 [2]2D24.2200::06/11/24-10:40:56.0580192 [Microsoft.Windows.CredProvDataModel] <mark>**[SignedInCredProv] credProviderGuid={C5D7540A-CD51-453B-B22B-05305BA03F07}, userType=4, logonUiReason=1, credProvScenario=0, ntsStatus=0, ntsSubstatus=0, PartA_UserSid=S-1-12-1-1643398018-1261955868-3901694363-3017554525**</mark>, PartA_PrivTags=16777216  
2294 [0]2D24.2BA4::06/11/24-10:40:56.0584207 [Microsoft.OSG.OSS.CredProvFramework] [ReportResultStop] OpitonalStatusText=The operation completed successfully.  , ProviderStatusIcon=3, Status=0, SubStatus=0, ProviderId={c5d7540a-cd51-453b-b22b-05305ba03f07}, ReturnCode=0, IsConnectedUser=0, IsV2CredProv=1, IsPLAPTile=0, CredTileProviderId={c5d7540a-cd51-453b-b22b-05305ba03f07}, UserTag=3, SessionId=1, IsRemoteSession=0, **ProcessImage=LogonUI.exe**

 on of 06/12/2024, Provider for "Microsoft.Windows.Security.CX.CredProv" // B5A9B1F0-A9CB-41C8-87BD-E5878C6BF66D is not part of authscript not TSS.

---
## NGC.etl

Not too much useful, but you can filter on "Microsoft.Windows.Security.CFL.API" provider.

---
## ShellCore_Oper.evtx

Filter events on 62400,62404,62407  
[Relevant shell events](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1151403/Log-Analysis-of-a-Successful-Sign-In?anchor=**eventviewer-%7C-applications-and-services-logs-%7C-microsoft-%7C-windows-%7C-shell-core-%7C-operational**)

---
##Policies & Configurations affected by WebSignIn and/or FastFirstSignIn policies

The behavior for the following policies will be altered:

In a regular Windows 10/11 PC, irrespective of whether you lock, switch user, sign out, etc. the Logon interface that you see is identical:

- User Tiles shown:  
  - The Last User that Logged on to the System  
  - Other User tile which allows any other user to sign into the system  
- There is no Switch User or Sign Out button shown on the left corner    

DontDisplayLastUserName, HideFastUserSwitching, (and SharedPC) policies however alter this behavior:


| | On Lock |On Switch User or Sign Out or Reboot |
|:--:|:--|:--:|
|No policies|Show user tiles for:<br>- Last logged on user <br>- Other User||
|DontDisplayLastUserName|Show user tiles for:<br>- Last logged on user<br>Show Switch User button|Show user tiles for:<br>- Other User| 
HideFastUserSwitching|Show user tiles for:<br>- Last logged on user<br>Show Sign Out button|Show user tiles for:<br>- Last logged on user<br> - Other User|
SharedPC policy<br>(sets DontDisplayLastUserName and HideFastUserSwitching)|Show user tiles for:<br>- Last logged on user<br>Show Sign Out button|Show user tiles for:<br>- Other User|

EnableWebSignIn and EnableFastFirstSignIn also alter this behavior.   
However the behavior is also dependent on whether this is a SharedPC or not.

| | On Lock |On Switch User or Sign Out or Reboot |
|:--:|:--|:--:|
|No policies|Show user tiles for:<br>- Last logged on user<br>- Other User|
EnableWebSignIn|Show user tiles for:<br>- Last logged on user<br>Show Switch User button|Show user tiles for:<br>- Last logged on user<br>- Other User|
EnableFastFirstSignIn|Show user tiles for:<br>- Last logged on user<br>Show Switch User button|Show user tiles for:<br>- Last logged on user<br>- Other User|
SharedPC policy<br>&&<br>EnableWebSignIn and/or EnableFastFirstSignIn|Show user tiles for:<br>- All currently Logged on Users if any<br>- Other User|

When either of these two policies are set, the changes to the Logon Interface that is induced due to DontDisplayLastUserName and HideFastUserSwitching are effectively ignored.

To Summarize:  
**HideFastUserSwitching**  
HideFastUserSwitching on a regular PC hides the "Other User" tile in LogonUI when a user session is locked, to prevent a different user from logging in without logging out the current user. In SharedPC mode, with WebSignIn and/or FastFirstSignIn enabled, the "Other User" tile will still appear even if HideFastUserSwitching is enabled. However, when a user attempts to log in with the Other user tile, and if that user is different from the currently logged in user, the current logged on user will be allowed to log in and force logoff the existing user at the same time. Before proceeding however, the current user will be presented with a warning prompt stating that there may be potential data loss for the existing user, and will only proceed if the new user accepts. Policies/WindowsLogon/HideFastUserSwitching // TBD: To be verified.

**DontDisplayLastUserName**  
DontDisplayLastUserName, hides the "Other User" tile in a locked session, and hides the "LastLoggedOnUser" in an unsigned in session. With these policies set however, both the locked and unsigned in states will only display the "Other user tile". and tiles of any user if currently logged in. Therefore the DontDisplayLastUserName toggle will have no effect on this state of tiles displayed in LogonUI. Policy Registry key path: HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Policies\System KeyName = DontDisplayLastUserName, Type = REG_DWORD, Values = 1 (Enabled), 0 (Disabled, Default) // TBD: To be verified.

**Remote Desktop Configuration**  
Set to be unsupported and disabled.