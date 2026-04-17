---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WebSign-in Support for LogonUI/Log-Analysis of a Successful Sign-In"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWebSign-in%20Support%20for%20LogonUI%2FLog-Analysis%20of%20a%20Successful%20Sign-In"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1151403&Instance=1151403&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1151403&Instance=1151403&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This document provides detailed information on log analysis for the Cloud Experience Credential Provider, including important registry keys, ETW providers, credential provider enumeration, and logs from various sources. 

[[_TOC_]]

# Log analysis

 Please note:  
_All the logs collected are from a test setup and no customer data was used. All the information like SIDs, GUIDs are test users in our test tenants_  

LogonUI.exe loads the credential providers. The credential provider name is "**Cloud Experience Credential Provider**".

Important registry keys where we have the credential providers are:

## Registry location
- `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Authentication\Credential Providers{C5D7540A-CD51-453B-B22B-05305BA03F07}`
- `HKEY_CLASSES_ROOT\CLSID{C5D7540A-CD51-453B-B22B-05305BA03F07}\InProcServer32`

 You can find them in the "Authentication-key.txt"

## ETW providers
Below are the two new Event Tracing for Windows (ETW) providers that contain information about this feature:
- "Microsoft.Windows.Security.CFL.API"
- "Microsoft.Windows.Security.CX.CredProv"

## Credential provider enumeration
Extract from a procmon capture during the sign-in:

![Credential Provider Enumeration Screenshot](/.attachments/image-d7e16575-1289-4255-b15e-1e14c47e51c1.png)

![Credential Provider Enumeration Screenshot](/.attachments/image-ad7b5de8-92a5-46ff-bcbe-b0f856f1e72e.png)

![Credential Provider Enumeration Screenshot](/.attachments/image-e6c2da5a-eb5b-4045-9bcf-4375ada9f632.png)

## Credential provider logs
From etl credprovauthui:
```
[1]1FF4.0B0C::10/13/22-20:48:06.1595859 [Microsoft.Windows.LogonUI.WinlogonRPC] [RequestCredentialsActivity] PartA_PrivTags=16777216, wilActivity=threadId=2828
[1]1FF4.0B0C::10/13/22-20:48:06.1596593 [Microsoft.Windows.LogonController] [CLogonController_RequestCredentials_Activity] PartA_PrivTags=0, wilActivity=threadId=2828
[1]1FF4.0B0C::10/13/22-20:48:06.1596605 [Microsoft.Windows.LogonController] [User_Interaction_Requested] PartA_PrivTags=16777216
[2]1FF4.0B0C::10/13/22-20:48:06.1615450 [Microsoft.Windows.LogonController] [CompleteTransitionToCredEntry] PartA_PrivTags=16777216
[1]1FF4.1EF0::10/13/22-20:48:06.1616241 [Microsoft.Windows.LogonController] [CWebDialogAction_DismissWebDialog_Activity] PartA_PrivTags=0, wilActivity=threadId=7920
[1]1FF4.1EF0::10/13/22-20:48:06.1641807 [Microsoft.Windows.LogonController] [CWebDialogAction_DismissWebDialog_Activity] PartA_PrivTags=0, wilActivity=hresult=0
[1]1FF4.1EF0::10/13/22-20:48:06.1642341 [Microsoft.Windows.LogonController] [UnlockingFromLockAction] PartA_PrivTags=16777216
[1]1FF4.1A64::10/13/22-20:48:06.1758118 [Microsoft.OSG.OSS.CredProvFramework] [SelectCredentialStart] 
[1]1FF4.1A64::10/13/22-20:48:06.1758187 [Microsoft.OSG.OSS.CredProvFramework] [CCredentialTileData::SetSelected] EventLevel=Information, Invoke=FailedToGetUserSidForSelectedTile, ResultCode=Element not found. (0x80070490)
[1]1FF4.1A64::10/13/22-20:48:06.1758200 [Microsoft.OSG.OSS.CredProvFramework] [CSelectCredentialJob::Do] EventLevel=Information, Invoke=ICredentialProviderCredential::SetSelected, ProviderCLSID={**c5d7540a-cd51-453b-b22b-05305ba03f07**}, CredentialId=18, ResultCode=The operation completed successfully. (0x00000000)
[1]1FF4.1A64::10/13/22-20:48:06.1758220 [Microsoft.OSG.OSS.CredProvFramework] [ShowCdplGuidance] 
[1]1FF4.1A64::10/13/22-20:48:06.1758301 [Microsoft.OSG.OSS.CredProvFramework] [ShowCdplGuidance] ReturnCode=0, UserTag=3, SessionId=3, IsRemoteSession=0, ProcessImage=LogonUI.exe
[1]1FF4.1A64::10/13/22-20:48:06.1758366 [Microsoft.OSG.OSS.CredProvFramework] [CSelectCredentialJob::Do] EventLevel=Information, Invoke=SelectionChange, ProviderCLSID={c5d7540a-cd51-453b-b22b-05305ba03f07}, TileSelectionFlags=0x1, TileSelectionReplyFlags=0x1
[1]1FF4.1A64::10/13/22-20:48:06.1758382 [Microsoft.OSG.OSS.CredProvFramework] [SelectCredentialStop] TileSelectionFlags=1, TileSelectionReplyFlags=1, WasSelected=1, AutoSubmit=0, ProviderId={c5d7540a-cd51-453b-b22b-05305ba03f07}, ReturnCode=0, IsConnectedUser=0, IsV2CredProv=1, IsPLAPTile=0, CredTileProviderId={c5d7540a-cd51-453b-b22b-05305ba03f07}, UserTag=4, SessionId=3, IsRemoteSession=0, ProcessImage=LogonUI.exe
[0]1FF4.1A64::10/13/22-20:48:06.1814480 [Microsoft.OSG.OSS.CredProvFramework] [**GetSerializationStart**] 
[3]1FF4.1A64::10/13/22-20:48:06.1818709 [Microsoft.OSG.OSS.CredProvFramework] [CGetSerializationJob::Do] EventLevel=Information, Invoke=ICredentialProviderCredential::GetSerialization, ProviderCLSID={**c5d7540a-cd51-453b-b22b-05305ba03f07**}, CredentialId=18, CredentialProviderGetSerializationResponse=0x2, ResultCode=The operation completed successfully. (0x00000000)
[3]1FF4.1A64::10/13/22-20:48:06.1824775 [Microsoft.OSG.OSS.CredProvFramework] [**GetSerializationStop**] ProviderGetSerializationResponse=2, ProviderStatusIcon=0, ProviderId={**c5d7540a-cd51-453b-b22b-05305ba03f07**}, NumberOfUserInputs=0, ReturnCode=0, IsConnectedUser=0, IsV2CredProv=1, IsPLAPTile=0, CredTileProviderId={c5d7540a-cd51-453b-b22b-05305ba03f07}, AuthenticationPackage=0, CredSerializeProviderId={c5d7540a-cd51-453b-b22b-05305ba03f07}, UserTag=4, SessionId=3, IsRemoteSession=0, ProcessImage=LogonUI.exe
[0]1FF4.0B0C::10/13/22-20:48:06.2021561 [Microsoft.Windows.LogonController] [CLogonController_RequestCredentials_Activity] PartA_PrivTags=0, wilActivity=hresult=0
[0]1FF4.0B0C::10/13/22-20:48:06.2021589 [Microsoft.Windows.LogonUI.WinlogonRPC] [RequestCredentialsActivity] PartA_PrivTags=16777216, wilActivity=hresult=0
[1]1FF4.1EF0::10/13/22-20:48:06.2032533 [Microsoft.Windows.UI.Logon] [DisplayStatusActivity] PartA_PrivTags=16777216, wilActivity=hresult=0
[0]1FF4.0B0C::10/13/22-20:48:06.2032859 [Microsoft.Windows.LogonController] [CLogonController_DisplayStatus_Activity] PartA_PrivTags=0, wilActivity=hresult=0
[0]1FF4.0B0C::10/13/22-20:48:06.2032876 [Microsoft.Windows.LogonUI.WinlogonRPC] [DisplayStatusActivity] PartA_PrivTags=16777216, wilActivity=hresult=0
[0] 1E58.0718::10/13/22-20:48:06.2033236 [core] wlutil_cxx633 WlDisplayStatus() - WlDisplayStatus: Displayed 'Welcome'
```

## WAM tracing
From etl webauth:
```
[1]03BC.0368::10/13/22-20:48:06.2085097 [Microsoft-Windows-AAD/Analytic ] AadCloudAPPlugin GetToken Start 
[1] 03BC.0368::10/13/22-20:48:06.2085109 [dll] dllmain_cpp35 WPPTraceLogA() - aadcloudap.cpp:AadPluginGetToken enter
[1] 03BC.0368::10/13/22-20:48:06.2085223 [dll] dllmain_cpp35 WPPTraceLogA() - aadcloudap.cpp:DoGetToken enter
[1]03BC.0368::10/13/22-20:48:06.2085258 [Microsoft-Windows-AAD/Analytic ] AadCloudAPPlugin GetToken Correlation ID: e3621bf5-ca26-49a2-ba84-586120badf3c.
[1] 03BC.0368::10/13/22-20:48:06.2087778 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000004 aadcloudap.cpp:1085 : Get token correlation ID:e3621bf5-ca26-49a2-ba84-586120badf3c
[1] 03BC.0368::10/13/22-20:48:06.2087995 [dll] dllmain_cpp35 WPPTraceLogA() - pluginstate.cpp:PluginState::CheckAuthorityUri enter
[1] 03BC.0368::10/13/22-20:48:06.2088019 [dll] dllmain_cpp35 WPPTraceLogA() - pluginstate.cpp:PluginState::CheckAuthorityUri exit: 0x0
[1] 03BC.0368::10/13/22-20:48:06.2088088 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:CheckDeviceCertificatePrivateKey enter
[1] 03BC.0368::10/13/22-20:48:06.2131964 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:CheckDeviceCertificatePrivateKey exit: 0x0
[0] 03BC.0368::10/13/22-20:48:06.2138247 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:LogonIdentity enter
[0] 03BC.0368::10/13/22-20:48:06.2138280 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000000 login.cpp:914 : correlation id:e3621bf5-ca26-49a2-ba84-586120badf3c
[0] 03BC.0368::10/13/22-20:48:06.2138295 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000000 login.cpp:915 : authority:https://login.microsoftonline.com
[0] 03BC.0368::10/13/22-20:48:06.2138307 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000000 login.cpp:916 : tenant id:7dd2219b-90e5-4477-87d3-da54b61ecd4b
[0] 03BC.0368::10/13/22-20:48:06.2138320 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000000 login.cpp:917 : client id:38aa3b87-a06d-4817-b275-7a316988d93b
[0] 03BC.0368::10/13/22-20:48:06.2138329 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000000 login.cpp:918 : flags:96
[0] 03BC.0368::10/13/22-20:48:06.2138343 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000000 login.cpp:936 : user name:RonStock@deverett.org
[0] 03BC.0368::10/13/22-20:48:06.2138354 [dll] dllmain_cpp35 WPPTraceLogA() - endpointhelper.cpp:EndpointHelper::GetTokenEndPoint enter
[0] 03BC.0368::10/13/22-20:48:06.2138434 [dll] dllmain_cpp35 WPPTraceLogA() - endpointhelper.cpp:EndpointHelper::GetTokenEndPoint exit: 0x0
[0]03BC.0368::10/13/22-20:48:06.2138477 [Microsoft-Windows-AAD/Analytic ] Credential type: 4 Correlation ID: e3621bf5-ca26-49a2-ba84-586120badf3c 
[0] 03BC.0368::10/13/22-20:48:06.2138489 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000004 login.cpp:942 : Credential type:
[0] 03BC.0368::10/13/22-20:48:06.2138497 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:CheckVsmBindingKeys enter
[0] 03BC.0368::10/13/22-20:48:06.2138514 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000000 login.cpp:3896 : pVsmKeyRefresh:0
[0] 03BC.0368::10/13/22-20:48:06.2138521 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:CheckVsmBindingKeys exit: 0x0
[0] 03BC.0368::10/13/22-20:48:06.2138892 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:GetNonce enter
[0] 03BC.0368::10/13/22-20:48:06.2138919 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:SendWebRequest enter
[0] 03BC.0368::10/13/22-20:48:06.2138930 [dll] dllmain_cpp35 WPPTraceLogA() - winhttptransport.cpp:WinHttpTransport::SendRequest enter
[0] 03BC.0368::10/13/22-20:48:06.2138949 [dll] dllmain_cpp35 WPPTraceLogA() - diagnosticcontext.cpp:DiagnosticContext::AddDiagnosticMessage enter
[0] 03BC.0368::10/13/22-20:48:06.2138992 [dll] dllmain_cpp35 WPPTraceLogA() - diagnosticcontext.cpp:DiagnosticContext::AddDiagnosticMessage exit: 0x0
[0]03BC.0368::10/13/22-20:48:06.2139005 [Microsoft-Windows-AAD/Analytic ] Endpoint Uri: https://login.microsoftonline.com/7dd2219b-90e5-4477-87d3-da54b61ecd4b/oauth2/token 
[0] 03BC.0368::10/13/22-20:48:06.2139025 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000000 winhttptransport.cpp:74 : Endpoint URI:https://login.microsoftonline.com/7dd2219b-90e5-4477-87d3-da54b61ecd4b/oauth2/token
[0] 03BC.0368::10/13/22-20:48:06.2139067 [dll] dllmain_cpp35 WPPTraceLogA() - noncerequest.cpp:NonceRequest::BuildRequest enter
[0] 03BC.0368::10/13/22-20:48:06.2139138 [dll] dllmain_cpp35 WPPTraceLogA() - noncerequest.cpp:NonceRequest::BuildRequest exit: 0x0

[0]0274.23D0::10/13/22-20:48:06.2640851 [Microsoft.Windows.ResourceManager] [ResourceSet_ReleaseResources] 
[0]0274.23D0::10/13/22-20:48:06.2640945 [Microsoft.Windows.ResourceManager] [ResourceSet_PerformRelease] resourceSet=0x12000000000000AF
[0]0274.23D0::10/13/22-20:48:06.2640960 [Microsoft.Windows.ResourceManager] [ResourceSet_ReleaseResources] hr=The operation completed successfully. (0x00000000), resourceSet=0x12000000000000AF
[2]0274.2564::10/13/22-20:48:06.2642854 [Microsoft.Windows.ResourceManager] [ActivityHost_QueryCommit] hostId=0x1000000000000024, psmKey=Microsoft.Windows.CloudExperienceHost_10.0.22621.1_neutral_neutral_cw5n1h2txyewy+App, hostJobType=2, effectiveCommitUsageBytes=97280000, privateCommitUsageBytes=90927104, sharedCommitUsageBytes=6352896, commitDebtBytes=0
[2]0274.2564::10/13/22-20:48:06.2643705 [Microsoft-Windows-ProcessStateManager/Diagnostic] ApplicationId=106, SessionId=3, PsmKey=Microsoft.Windows.CloudExperienceHost_10.0.22621.1_neutral_neutral_cw5n1h2txyewy+App, PlmRequestedPriority=Low, EffectivePriority=Low
[2]0274.2564::10/13/22-20:48:06.2643738 [Microsoft.Windows.ResourceManager] [ActivityHost_SetPsmApplicationPriority] status=STATUS_SUCCESS, hostId=0x1000000000000024, applicationPriority=1
[2]0274.2564::10/13/22-20:48:06.2644179 [Microsoft.Windows.ResourceManager] [ComputedUsageLimits] maximumCommitBytes=25344864256, totalPhysicalBytes=8387428352, commitThresholdsBytes.Count=5, commitThresholdsBytes=0, physicalThresholdsBytes.Count=5, physicalThresholdsBytes=0, activeLowPriThresholdBytes=0, lazyEmptyThresholdBytes=5451828428
[2]0274.2564::10/13/22-20:48:06.2649292 [Microsoft.Windows.ResourceManager] [QueriedMemUtilMetrics] hostId=0x1000000000000024, pid=11200, queryFlags=0x1, validMask=0x1, privateWorkingSetBytes=79433728, totalWorkingSetBytes=0, storeSizeBytes=0
[3]0274.1CF4::10/13/22-20:48:06.2650063 [Microsoft.Windows.ResourceManager] [ProcessPendingList] 
[2]0274.2564::10/13/22-20:48:06.2650922 [Microsoft-Windows-ProcessStateManager/Diagnostic] Application Microsoft.Windows.CloudExperienceHost_10.0.22621.1_neutral_neutral_cw5n1h2txyewy+App state changed from Active to Quiescing. MixedWorkItems: 0, PureWorkItems: 0, SystemWorkItems: 0 106, 3, Microsoft.Windows.CloudExperienceHost_10.0.22621.1_neutral_neutral_cw5n1h2txyewy+App, Active, Quiescing
[0]05F0.28E0::10/13/22-20:48:06.2651585 [Microsoft.Windows.ProcessLifetimeManager] [Notification_Received] 
[0]05F0.28E0::10/13/22-20:48:06.2679440 [Microsoft.Windows.ProcessLifetimeManager] [Notification_Received] Name=Microsoft.Windows.CloudExperienceHost_10.0.22621.1_neutral_neutral_cw5n1h2txyewy+App, Subject=0, Payload=0x20
[0]05F0.28E0::10/13/22-20:48:06.2679468 [Microsoft.Windows.ProcessLifetimeManager] [Notification_Received] 
[0]05F0.28E0::10/13/22-20:48:06.2679489 [Microsoft.Windows.ProcessLifetimeManager] [Notification_Received] Name=Microsoft.Windows.CloudExperienceHost_cw5n1h2txyewy, Subject=1, Payload=0x420
[0]0274.27C8::10/13/22-20:48:06.2728552 [Microsoft.Windows.ResourceManager] [PsmHostStateNotification] psmKey=Microsoft.Windows.CloudExperienceHost_10.0.22621.1_neutral_neutral_cw5n1h2txyewy+App, userSid=S-1-5-21-2217622643-136112039-38133678-1002, sessionId=3, hostCount=1, firstHostType=2, firstHostId=0x1000000000000024, psmHostState=1
[3]0274.2564::10/13/22-20:48:06.2731460 [Microsoft.Windows.ResourceManager] [ComputedUsageLimits] maximumCommitBytes=25344864256, totalPhysicalBytes=8387428352, commitThresholdsBytes.Count=5, commitThresholdsBytes=0, physicalThresholdsBytes.Count=5, physicalThresholdsBytes=0, activeLowPriThresholdBytes=0, lazyEmptyThresholdBytes=5451828428
[3]0274.2564::10/13/22-20:48:06.2734697 [Microsoft.Windows.ResourceManager] [QueriedMemUtilMetrics] hostId=0x1000000000000024, pid=11200, queryFlags=0x1, validMask=0x1, privateWorkingSetBytes=77467648, totalWorkingSetBytes=0, storeSizeBytes=0
[2]0274.2564::10/13/22-20:48:06.2739542 [Microsoft-Windows-ProcessStateManager/Diagnostic] ApplicationId=106, SessionId=3, PsmKey=Microsoft.Windows.CloudExperienceHost_10.0.22621.1_neutral_neutral_cw5n1h2txyewy+App, PlmRequestedPriority=Low, EffectivePriority=Normal
[2]0274.2564::10/13/22-20:48:06.2739686 [Microsoft-Windows-ProcessStateManager/Diagnostic] Application Microsoft.Windows.CloudExperienceHost_10.0.22621.1_neutral_neutral_cw5n1h2txyewy+App state changed from Quiescing to Halted. MixedWorkItems: 0, PureWorkItems: 0, SystemWorkItems: 0 106, 3, Microsoft.Windows.CloudExperienceHost_10.0.22621.1_neutral_neutral_cw5n1h2txyewy+App, Quiescing, Halted
[3]05F0.28E0::10/13/22-20:48:06.2740706 [Microsoft.Windows.ProcessLifetimeManager] [Notification_Received] 
[0]0274.2564::10/13/22-20:48:06.2745438 [Microsoft.Windows.ResourceManager] [ComputedUsageLimits] maximumCommitBytes=25344864256, totalPhysicalBytes=8387428352, commitThresholdsBytes.Count=5, commitThresholdsBytes=0, physicalThresholdsBytes.Count=5, physicalThresholdsBytes=0, activeLowPriThresholdBytes=0, lazyEmptyThresholdBytes=5451828428
[0]0274.2564::10/13/22-20:48:06.2747110 [Microsoft.Windows.ResourceManager] [QueriedMemUtilMetrics] hostId=0x1000000000000024, pid=11200, queryFlags=0x1, validMask=0x1, privateWorkingSetBytes=75993088, totalWorkingSetBytes=0, storeSizeBytes=0
[3]05F0.28E0::10/13/22-20:48:06.2760536 [Microsoft.Windows.ProcessLifetimeManager] [Notification_Received] Name=Microsoft.Windows.CloudExperienceHost_10.0.22621.1_neutral_neutral_cw5n1h2txyewy+App, Subject=0, Payload=0x40
[3]05F0.28E0::10/13/22-20:48:06.2760554 [Microsoft.Windows.ProcessLifetimeManager] [Notification_Received] 
[3]05F0.28E0::10/13/22-20:48:06.2760758 [Microsoft.Windows.ProcessLifetimeManager] [Notification_Received] Name=Microsoft.Windows.CloudExperienceHost_cw5n1h2txyewy, Subject=1, Payload=0x440
[1]0274.2564::10/13/22-20:48:06.2842733 [Microsoft.Windows.ResourceManager] [ComputedUsageLimits] maximumCommitBytes=25344864256, totalPhysicalBytes=8387428352, commitThresholdsBytes.Count=5, commitThresholdsBytes=0, physicalThresholdsBytes.Count=5, physicalThresholdsBytes=0, activeLowPriThresholdBytes=0, lazyEmptyThresholdBytes=5451828428
[1]0274.2564::10/13/22-20:48:06.2843045 [Microsoft.Windows.ResourceManager] [ProcessPendingList] 

[1] 03BC.0368::10/13/22-20:48:06.4898168 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:ProcessOAuthRequest enter
[1] 03BC.0368::10/13/22-20:48:06.4898722 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000000 login.cpp:393 : isFirstLogon:1
[1] 03BC.0368::10/13/22-20:48:06.4898793 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:SendOAuthRequest enter
[1] 03BC.0368::10/13/22-20:48:06.4898821 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:SendWebRequest enter
[1] 03BC.0368::10/13/22-20:48:07.2129284 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:SendOAuthRequest exit: 0x0
[1] 03BC.0368::10/13/22-20:48:07.2129294 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:ProcessOAuthRequest exit: 0x0
[1] 03BC.0368::10/13/22-20:48:07.2134091 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:DumpGroupSids enter
[1] 03BC.0368::10/13/22-20:48:07.2134127 [dll] dllmain_cpp35 WPPTraceLogA() - 4 0x00000000 login.cpp:4183 : user sid::S-1-12-1-320029913-1285877949-2089964930-2234078703
[1]03BC.0368::10/13/22-20:48:07.2134160 [Microsoft-Windows-AAD/Analytic ] User sid: S-1-12-1-320029913-1285877949-2089964930-2234078703
Group sids:
 
[1] 03BC.0368::10/13/22-20:48:07.2134168 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:DumpGroupSids exit: 0x0
[1] 03BC.0368::10/13/22-20:48:07.2134216 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:ReleaseVsmBindingKeys enter
[1] 03BC.0368::10/13/22-20:48:07.2134222 [dll] dllmain_cpp35 WPPTraceLogA() - login.cpp:ReleaseVsmBindingKeys exit: 0x0
[1] 03BC.0368::10/13/22-20:48:07.2134238 [dll] dllmain_cpp35 WPPTraceLogA() - aadcloudap.cpp:DoGetToken exit: 0x0
[1] 03BC.0368::10/13/22-20:48:07.2134266 [dll] dllmain_cpp35 WPPTraceLogA() - httpwebsession.cpp:HttpWebSession::Close enter
[1] 03BC.0368::10/13/22-20:48:07.2135265 [dll] dllmain_cpp35 WPPTraceLogA() - httpwebsession.cpp:HttpWebSession::Close exit: 0x0
[1]03BC.0368::10/13/22-20:48:07.2135284 [Microsoft-Windows-AAD/Analytic ] AadCloudAPPlugin GetToken Stop.
Status: 0x0 
[1] 03BC.0368::10/13/22-20:48:07.2135294 [dll] dllmain_cpp35 WPPTraceLogA() - aadcloudap.cpp:AadPluginGetToken exit: 0x0
[1] 03BC.0368::10/13/22-20:48:07.2135294 [dll] dllmain_cpp35 WPPTraceLogA() - aadcloudap.cpp:AadPluginGetToken exit: 0x0
```

---

## Credentials stored for the authenticated for the user logon


```
[2]03BC.0368::10/13/22-20:48:07.6449314 [Microsoft.Windows.Security.CloudAp] [CloudApAcceptCreds] logonIdHighPart=0, logonIdLowPart=10617167, status=0, credType=0, primaryCredentialFlags=603984129, threadId=872, PartA_PrivTags=16777216
[2] 03BC.0368::10/13/22-20:48:07.6449362 [wdigest] credapi_cxx74 SpAcceptCredentials() - SpAcceptCredentials: Entering
[2] 03BC.0368::10/13/22-20:48:07.6449370 [wdigest] credapi_cxx75 SpAcceptCredentials() - SpAcceptCredentials:    Credential: LogonType 2
[2] 03BC.0368::10/13/22-20:48:07.6449374 [wdigest] credapi_cxx81 SpAcceptCredentials() - SpAcceptCredentials:  Entering AccountName ronstock@deverett.org
[2] 03BC.0368::10/13/22-20:48:07.6449378 [wdigest] credapi_cxx92 SpAcceptCredentials() - SpAcceptCredentials:           DomainName\DownlevelName AzureAD\ronstock@deverett.org
[2] 03BC.0368::10/13/22-20:48:07.6449383 [wdigest] credapi_cxx95 SpAcceptCredentials() - SpAcceptCredentials:           UPN  DnsDomainName ronstock@deverett.org  ett.org
[2] 03BC.0368::10/13/22-20:48:07.6449391 [wdigest] credapi_cxx99 SpAcceptCredentials() - SpAcceptCredentials:           LogonID (0:a2014f)  Flags 0x24001101
[2] 03BC.0368::10/13/22-20:48:07.6449524 [wdigest] credapi_cxx312 SpAcceptCredentials() - SpAcceptCredentials:  Leaving status 0x0
```

---

## LSA.etl


```
[1] 03BC.0368::10/13/22-20:48:07.6176420 [lsasrv] logons_cxx608 LsapCreateLsaLogonSession() - Creating logon session 0:a2014f
[1] 03BC.0368::10/13/22-20:48:07.6179080 [IdProvExt] IdProvReg_h42 CONNECTED_TRACE_ENTER() - ConnectedAccounts:Entering LsaISanitizeSAMName.
[1] 03BC.0368::10/13/22-20:48:07.6179960 [IdProvExt] IdProvReg_h60 CONNECTED_TRACE_EXIT_EX() - ConnectedAccounts:Exiting LsaISanitizeSAMName with status = 0.
[2]03BC.0368::10/13/22-20:48:07.6400586 [Microsoft.Windows.Security.LsaSrv] [NegLogonUserEx3WorkerStop] logonType=2, isStandaloneManagedServiceAccount=0, status=0, apiSubStatus=0
[2] 03BC.0368::10/13/22-20:48:07.6400650 [IdProvExt] IdProvReg_h42 CONNECTED_TRACE_ENTER() - ConnectedAccounts:Entering LsapFindConnectedUserByInternetSid.
[2] 03BC.0368::10/13/22-20:48:07.6400661 [IdProvExt] IdProvReg_h71 CONNECTED_TRACE_WARNING() - ConnectedAccounts: LsapIsUserSidIssuedByMsaIdProv failed,0xc0000078.
[2] 03BC.0368::10/13/22-20:48:07.6400668 [IdProvExt] IdProvReg_h60 CONNECTED_TRACE_EXIT_EX() - ConnectedAccounts:Exiting LsapFindConnectedUserByInternetSid with status = 0xc0000078.
[2] 03BC.0368::10/13/22-20:48:07.6400689 [IdProvExt] IdProvReg_h42 CONNECTED_TRACE_ENTER() - ConnectedAccounts:Entering LsapIdProvHostGetProvInfo.
[2] 03BC.0368::10/13/22-20:48:07.6400697 [IdProvExt] IdProvReg_h60 CONNECTED_TRACE_EXIT_EX() - ConnectedAccounts:Exiting LsapIdProvHostGetProvInfo with status = 0.
[2] 03BC.0368::10/13/22-20:48:07.6403199 [lsalib] aufilter_cxx4024 LsapAuBuildTokenInfoAndAddLocalAliases() - NewTokenInfo : 000001DCD8722100
[2] 03BC.0368::10/13/22-20:48:07.6403204 [lsalib] aufilter_cxx4025 LsapAuBuildTokenInfoAndAddLocalAliases() - TokenSize : 52c
[2] 03BC.0368::10/13/22-20:48:07.6403207 [lsalib] aufilter_cxx4026 LsapAuBuildTokenInfoAndAddLocalAliases() - CurrentSid : 000001DCD8722310
[0] 03BC.1E64::10/13/22-20:48:07.6406818 [VaultEngine] VaultGlobals_cpp404 VaultLogonSessionNotification() - Entering VaultLogonSessionNotification
[0] 03BC.1E64::10/13/22-20:48:07.6406827 [VaultEngine] VaultGlobals_cpp426 VaultLogonSessionNotification() - Created 0x2 logon session (0:a2014f)
[0] 03BC.1E64::10/13/22-20:48:07.6406832 [VaultEngine] VaultGlobals_cpp503 VaultLogonSessionNotification() - Exiting VaultLogonSessionNotification (0)
[2] 03BC.0368::10/13/22-20:48:07.6407150 [lsalib] aulogon_cxx1652 LsapAuApiDispatchLogonUser() - Updating logon session 0:a2014f for logon type 2
[2] 03BC.0368::10/13/22-20:48:07.6407196 [lsasrv] sphelp_cxx3550 LsapUpdateNamesAndCredentialsWorker() - Whacking package Negotiate with 0:a2014f = ronstock@deverett.org
[2] 03BC.0368::10/13/22-20:48:07.6407209 [lsasrv] sphelp_cxx3550 LsapUpdateNamesAndCredentialsWorker() - Whacking package Kerberos with 0:a2014f = ronstock@deverett.org
[2] 03BC.0368::10/13/22-20:48:07.6445593 [lsasrv] sphelp_cxx3550 LsapUpdateNamesAndCredentialsWorker() - Whacking package NTLM with 0:a2014f = ronstock@deverett.org
[2] 03BC.0368::10/13/22-20:48:07.6446481 [lsasrv] sphelp_cxx3550 LsapUpdateNamesAndCredentialsWorker() - Whacking package TSSSP with 0:a2014f = ronstock@deverett.org
[2] 03BC.0368::10/13/22-20:48:07.6449279 [lsasrv] sphelp_cxx3550 LsapUpdateNamesAndCredentialsWorker() - Whacking package CloudAP with 0:a2014f = ronstock@deverett.org
[2] 03BC.0368::10/13/22-20:48:07.6449330 [lsasrv] sphelp_cxx3550 LsapUpdateNamesAndCredentialsWorker() - Whacking package WDigest with 0:a2014f = ronstock@deverett.org
[2] 03BC.0368::10/13/22-20:48:07.6449532 [lsasrv] sphelp_cxx3550 LsapUpdateNamesAndCredentialsWorker() - Whacking package SFAP with 0:a2014f = ronstock@deverett.org
```

---

## Microsoft.Windows.Security.CX.CredProv & Microsoft.Windows.Security.CFL.API ETW Tracing logs


```
[3]1FC4.163C::10/19/22-12:59:28.4592700 [Microsoft.Windows.Security.CFL.API] [CflSetupAuthEnvironmentActivity] PartA_PrivTags=0, wilActivity=threadId=5692, imageName=C:\Windows\System32\LogonUI.exe, commandLine="LogonUI.exe" /flags:0x2 /state0:0xa13cb855 /state1:0x41c64e6d
[1]25E0.14C0::10/19/22-12:59:41.2129474 [Microsoft.Windows.Security.CFL.API] [CflGetScenarioDataActivity] PartA_PrivTags=0, wilActivity=threadId=5312, imageName=C:\Windows\System32\RuntimeBroker.exe, commandLine=C:\Windows\System32\RuntimeBroker.exe -Embedding
[0]1FC4.163C::10/19/22-13:01:00.7566713 [Microsoft.Windows.Security.CFL.API] [CflGetTransitionScenarioDataActivity] PartA_PrivTags=0, wilActivity=threadId=5692, imageName=C:\Windows\System32\LogonUI.exe, commandLine="LogonUI.exe" /flags:0x2 /state0:0xa13cb855 /state1:0x41c64e6d
[2]1FC4.163C::10/19/22-12:59:20.5212988 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=SetDisplayState
3]1FC4.163C::10/19/22-12:59:28.4569725 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=CommandLinkClicked
[3]1FC4.163C::10/19/22-12:59:28.4569741 [Microsoft.Windows.Security.CX.CredProv] [CommandLinkClicked] fieldId=2
[3]1FC4.163C::10/19/22-12:59:28.4583110 [Microsoft.Windows.Security.CX.CredProv] [UserInitiatedWebSignIn] fieldId=2, scenarioId=ms-cxh://AADWEBAUTH, PartA_PrivTags=33554432
[1]1FC4.163C::10/19/22-12:59:28.4675752 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=GetSerialization
[1]1FC4.163C::10/19/22-12:59:28.4679861 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=GetSubmissionOptions
[0]1FC4.163C::10/19/22-12:59:28.4965866 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=SetDisplayState
[0]1FC4.163C::10/19/22-12:59:28.5639973 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=ReportResult
[0]1FC4.163C::10/19/22-12:59:38.6038675 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=SetSessionContext
[0]1FC4.163C::10/19/22-12:59:38.6053526 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=SetUserArray
[0]1FC4.163C::10/19/22-12:59:38.6104376 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=Advise
[0]1FC4.163C::10/19/22-12:59:38.6159789 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=GetCredentialCount
[0]1FC4.163C::10/19/22-12:59:38.6177685 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=GetCredentialAt
0]1FC4.163C::10/19/22-12:59:38.6177817 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=GetFieldDescriptorCount
[0]1FC4.163C::10/19/22-12:59:38.6178232 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=GetBitmapBufferValue
[0]1FC4.163C::10/19/22-12:59:38.6178374 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=GetBitmapValue
[0]1FC4.163C::10/19/22-12:59:38.6178406 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=GetFieldState
[0]1FC4.163C::10/19/22-12:59:38.6178482 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=GetStringValue
[0]1FC4.163C::10/19/22-12:59:38.6178869 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=GetUserSid
[0]1FC4.163C::10/19/22-12:59:38.6178962 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=GetShouldAssignPrimaryUser
[2]1FC4.00E8::10/19/22-12:59:38.6794965 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=GetWebDialogUrl
[0]1FC4.163C::10/19/22-13:01:00.7565420 [Microsoft.Windows.Security.CX.CredProv] [FunctionName] name=OnWebDialogVisiblityChange
```

---

## Eventviewer | Applications and Services Logs | Microsoft | Windows | Shell-Core | Operational


```
Log Name:      Microsoft-Windows-Shell-Core/Operational
Source:        Microsoft-Windows-Shell-Core
Date:          10/13/2022 8:48:03 PM
Event ID:      62400
Task Category: (62400)
Level:         Information
Keywords:      (34359738368),(65536)
User:          S-1-5-21-2217622643-136112039-38133678-1002
Computer:      DESKTOP-58R1OI2
Description:
CloudExperienceHost App Activity started. Source: 'ms-cxh://AADWEBAUTH/', Experience: '{"source":"ms-cxh://AADWEBAUTH/","protocol":"ms-cxh","host":"AADWEBAUTH","port":"","params":{},"file":"","hash":"","path":"/","segments":[""]}'.

Log Name:      Microsoft-Windows-Shell-Core/Operational
Source:        Microsoft-Windows-Shell-Core
Date:          10/13/2022 8:48:03 PM
Event ID:      62407
Task Category: (62407)
Level:         Information
Keywords:      (34359738368),(65536)
User:          S-1-5-21-2217622643-136112039-38133678-1002
Computer:      DESKTOP-58R1OI2
Description:
CloudExperienceHost Web App Event 2. Name: 'NavigationSucceed', Value: '{"webErrorStatus":18,"uri":"https://login.microsoftonline.com/7dd2219b-90e5-4477-87d3-da54b61ecd4b/login"}'.

Log Name:      Microsoft-Windows-Shell-Core/Operational
Source:        Microsoft-Windows-Shell-Core
Date:          10/13/2022 8:48:03 PM
Event ID:      62404
Task Category: (62404)
Level:         Information
Keywords:      (34359738368),(65536)
User:          S-1-5-21-2217622643-136112039-38133678-1002
Computer:      DESKTOP-58R1OI2
Description:
CloudExperienceHost Web App Activity started. CXID: 'AadWebAuth'.

Log Name:      Microsoft-Windows-Shell-Core/Operational
Source:        Microsoft-Windows-Shell-Core
Date:          10/13/2022 8:48:04 PM
Event ID:      62407
Task Category: (62407)
Level:         Information
Keywords:      (34359738368),(65536)
User:          S-1-5-21-2217622643-136112039-38133678-1002
Computer:      DESKTOP-58R1OI2
Description:
CloudExperienceHost Web App Event 2. Name: 'NavigationSucceed', Value: '{"webErrorStatus":18,"uri":"https://login.microsoftonline.com/WebApp/WindowsLogon/1"}'.

Log Name:      Microsoft-Windows-Shell-Core/Operational
Source:        Microsoft-Windows-Shell-Core
Date:          10/13/2022 8:48:04 PM
Event ID:      62407
Task Category: (62407)
Level:         Information
Keywords:      (34359738368),(65536)
User:          S-1-5-21-2217622643-136112039-38133678-1002
Computer:      DESKTOP-58R1OI2
Description:
CloudExperienceHost Web App Event 2. Name: 'Identity.WindowsLogon.AADResponse', Value: 'null'.


Log Name:      Microsoft-Windows-Shell-Core/Operational
Source:        Microsoft-Windows-Shell-Core
Date:          10/13/2022 8:48:04 PM
Event ID:      62407
Task Category: (62407)
Level:         Information
Keywords:      (34359738368),(65536)
User:          S-1-5-21-2217622643-136112039-38133678-1002
Computer:      DESKTOP-58R1OI2
Description:
CloudExperienceHost Web App Event 2. Name: 'Identity.WindowsLogon.HasCodeQS', Value: 'true'.

Log Name:      Microsoft-Windows-Shell-Core/Operational
Source:        Microsoft-Windows-Shell-Core
Date:          10/13/2022 8:48:04 PM
Event ID:      62407
Task Category: (62407)
Level:         Information
Keywords:      (34359738368),(65536)
User:          S-1-5-21-2217622643-136112039-38133678-1002
Computer:      DESKTOP-58R1OI2
Description:
CloudExperienceHost Web App Event 2. Name: 'Identity.WindowsLogon.RedeemAuthCode', Value: 'null'.

Log Name:      Microsoft-Windows-Shell-Core/Operational
Source:        Microsoft-Windows-Shell-Core
Date:          10/13/2022 8:48:04 PM
Event ID:      62407
Task Category: (62407)
Level:         Information
Keywords:      (34359738368),(65536)
User:          S-1-5-21-2217622643-136112039-38133678-1002
Computer:      DESKTOP-58R1OI2
Description:
CloudExperienceHost Web App Event 2. Name: 'Identity.WindowsLogon.ProcessCode.Start', Value: 'null'.

Log Name:      Microsoft-Windows-Shell-Core/Operational
Source:        Microsoft-Windows-Shell-Core
Date:          10/13/2022 8:48:06 PM
Event ID:      62407
Task Category: (62407)
Level:         Information
Keywords:      (34359738368),(65536)
User:          S-1-5-21-2217622643-136112039-38133678-1002
Computer:      DESKTOP-58R1OI2
Description:
CloudExperienceHost Web App Event 2. Name: 'Identity.WindowsLogon.ProcessCode.Success', Value: 'null'.

Log Name:      Microsoft-Windows-Shell-Core/Operational
Source:        Microsoft-Windows-Shell-Core
Date:          10/13/2022 8:48:06 PM
Event ID:      62407
Task Category: (62407)
Level:         Information
Keywords:      (34359738368),(65536)
User:          S-1-5-21-2217622643-136112039-38133678-1002
Computer:      DESKTOP-58R1OI2
Description:
CloudExperienceHost Web App Event 2. Name: 'Identity.WindowsLogon.Success', Value: 'null'.

Log Name:      Microsoft-Windows-Shell-Core/Operational
Source:        Microsoft-Windows-Shell-Core
Date:          10/13/2022 8:48:06 PM
Event ID:      62407
Task Category: (62407)
Level:         Information
Keywords:      (34359738368),(65536)
User:          S-1-5-21-2217622643-136112039-38133678-1002
Computer:      DESKTOP-58R1OI2
Description:
CloudExperienceHost Web App Event 2. Name: 'Identity.WindowsLogon.SetupAadUserTransition', Value: 'null'.
```