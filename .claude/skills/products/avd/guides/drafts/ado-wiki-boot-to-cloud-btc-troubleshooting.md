---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/Archived Content/Deprecated Content/DEPRECATED - Boot To Cloud (BTC)"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/Archived%20Content/Deprecated%20Content/DEPRECATED%20-%20Boot%20To%20Cloud%20(BTC)"
importDate: "2026-04-05"
type: troubleshooting-guide
---
[[_TOC_]]

# Boot To Cloud (BTC)

## Overview

These steps are meant to help diagnose and triage issues specifically
related to the Boot to Cloud experience on the local device that are not
specific to W365, AVD, or Shell. Once the issue is isolated to one of
the teams, additional steps in their respective troubleshooting areas
can be followed.

## WindowsCoreEvent Kusto Access - FTE Only
Cluster: https://wdgeventstore.kusto.windows.net
Database: Webster

## Triaging

**Sequence Diagram**

![Picture17.jpg](/.attachments/Picture17-9551caf8-3671-4e25-a2eb-ee46ebbc308e.jpg)

**Part A**

- In this section, the main processing component would be Windows OS. It
  will be handling the normal machine lifecycle and logon mechanism.
  Boot to Cloud feature is not involved here and will be started when
  this part has been completed successfully.

**Part B**

- In this part, the main process will be Shell App Runtime. This is a
  special shell built for Boot to Cloud feature that will replace
  exporer.exe as the main shell that gets launched post Logon.

- For more details on the expected behaviors and key events, please
  visit the [Shell section](#_Happy_Path_+).

- This section will end upon the successful start of the W365
  Application.

**Part C**

- In this part, the Windows 365 App will be the main process.

- This section will handle the Cloud PC info gathering mechanism and
  will start the AVD App once CPC license and info has been gathered and
  validated.

- For more details on the expected behaviors and key events, please
  visit the [W365 App section](#_Happy_Path_+_1).

- The end of this section will be marked by the successful start of the
  AVD App and the graceful termination of W365 App.

**Part D**

- In this part, the AVD App will attempt to connect with the userÆs
  Cloud PC and render the CPCÆs windows to the user.

- For more details on the expected behaviors and key events, please
  visit the [AVD App section](#_Happy_Path_+_2).

- The end of this section will be marked by the successful connection
  with Cloud PC and the display of Cloud PC Windows screen to the user.

## Getting Logs for W365 and AVD

1.  Get Correlation Id from the end user or IT admin.

<!-- -->

1.  In the Boot to Cloud mode, the Correlation Id is displayed in the
    error dialog box or in the interstitial screen at the end of the
    2-minute timeout. Please ask the customer to take a picture of that
    and share it with the support team.á

<!-- -->

2.  Sample pictures of Error Dialog Boxá

![Picture18.png](/.attachments/Picture18-fce43953-d719-450c-a490-7953be134a4d.png)

3.  Interstitial screen at the 2-minutes timeoutá

![Picture19.jpg](/.attachments/Picture19-0c384a76-0b5d-4300-b158-1c798d61248b.jpg)

2.  Using the correlationId you can query W365 telemetry using sample
    queries mentioned in the [W365 Telemetry section](#w365-telemetry)
    in the Appendix.

<!-- -->

3.  If you are not able to access the CPC from a Boot to Cloud device,
    then:

<!-- -->

1.  Ask the customer to verify if they can login to their CPC from the
    browser at
    [https://windows365.microsoft.com](https://windows365.microsoft.com/)á

<!-- -->

2.  Or ask them to login to their CPC from another regular device by
    installing the Windows 365 app from the Microsoft Store.á

<!-- -->

3.  If they are able to login to their CPC then it is definitely an
    issue with their Boot to Cloud device.á

<!-- -->

4.  Ask the IT Admin to un-enroll the device from boot to cloud mode by
    removing the device from the Boot to Cloud Device group by going to
    [https://endpoint.microsoft.com](https://endpoint.microsoft.com/)áá

![Picture20.png](/.attachments/Picture20-6e4d547c-db9e-42f3-a54f-510aba88a7fe.png)

1.  Sync the device with Intune : Devices -\> Selected Device -\>
    Overview -\> Syncáá

> ![Picture21.png](/.attachments/Picture21-18bc3f70-1975-46bf-8d7a-f800bc3482f2.png)

2.  It will take about 10 mins for the policies to revert and the device
    to return to normal mode. Please note that removing the device from
    the group, will only revert the policies. The Windows 365 App and
    the Azure Virtual Desktop Host App will still remain installed on
    the device.á

3.  Login to the device, collect all the logs from the following
    locations, zip them and send it to the engineering team for further
    investigation:á

    1.  C:\Users\\{username}\AppData\Local\Temp\DiagOutputDir\Windows365\Logsá

    2.  C:\Users\\{username}\AppData\Local\Temp\DiagOutputDir\RdClientAutoTraceá

## Understanding Windows 365 App Telemetry

![Picture22.png](/.attachments/Picture22-2a2757c0-bbef-40f3-869f-e0c8caa17d35.png)

1.  Below is the first telemetry of W365 App indicating the app has
    started and will now begin processing in Boot to Cloud mode.
![Picture23.png](/.attachments/Picture23-0ed9e84e-df24-4ec9-98ce-9195471778cd.png)

2.  W365 app will then attempt to validate the AVD App installation
    status and provide the version and install date of the AVD
    app.
![Picture24.png](/.attachments/Picture24-069759d4-06b2-476b-ae32-972b86705741.png)

If AVD App is not present, W365 App will attempt to install the AVD App.

![Picture25.png](/.attachments/Picture25-819c55ad-f5c5-4f36-a906-f828db154fc5.png)

3.  W365 App will register with the ShellAppRuntime (the OS) using
    Connecting status. This is an indication to the ShellAppRuntime to
    display the interstitial screen with ôConnecting to Cloud PCö
    message.
![Picture26.png](/.attachments/Picture26-619ff890-ddeb-42a3-aedb-8784d035dd58.png)

4.  W365 App will request user token from OneAuth library.
![Picture27.png](/.attachments/Picture27-489044c3-f542-461b-b518-5d308c6835af.png)

5.  W365 App will attempt to fetch Cloud PC information from the W365
    backend services (graph call).
![Picture28.png](/.attachments/Picture28-e0a12163-eeb8-404f-9fac-d377ed1fba79.png)

6.  W365 will launch the AVD app with Cloud PC information.
    ![Picture29.png](/.attachments/Picture29-3d60c237-b20d-40e9-b8ea-b3ed35e543a0.png)

7.  W365 will monitor AVD notifications for HWND registration. Once it
    gets the ôMSRDCWWindowRegistrationSucceededö event, it will mark the
    avd host app launch as
    succeeded.
![Picture30.png](/.attachments/Picture30-1bc80dbc-9934-4873-b739-e943586d0a1a.png)

8.  W365 will remain online and wait for AVD to notify whether the login
    and connection process has been completed or the connection attempt
    was disconnected. Once you see this telemetry, the W365 App has now
    completed its task and received ack from AVD. You should now
    continue with the AVD app telemetry.
    ![Picture31.png](/.attachments/Picture31-a5f080b6-2c85-43e4-b791-2b77149a66c5.png)

### Key events



<table>
<colgroup>
<col style="width: 37%" />
<col style="width: 34%" />
<col style="width: 27%" />
</colgroup>
<thead>
<tr class="header">
<th>Tag</th>
<th>Action_Detail (contains)</th>
<th>Meaning</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>cloudpc_provider_api</td>
<td>Status=Started</td>
<td><p>W365 is sending status to Shell</p>
<p>Status::Connecting: Shell will show the interstitial screen with
ôConnecting to Cloud PCö message.</p>
<p>Status::UserInputNeeded: Shell will remove the interstitial screen.
W365 will prompt AAD auth UI (MFA). User completes the MFA.</p>
<p>Status::Disconnected: Shell will remove the connecting screen. If an
error occurred, W365 or AVD app will show an error message with
correlationId or ActivityId. This id can be used to query W365 App or
AVD App telemetry.</p></td>
</tr>
<tr class="even">
<td>cloudpc_provider_api</td>
<td>Status=Succeeded</td>
<td>Shell successfully received new W365 status</td>
</tr>
<tr class="odd">
<td>cloudpc_provider_api</td>
<td>Status=Failed</td>
<td>Shell API failed to communicate new status</td>
</tr>
</tbody>
</table>



| Tag                    | Action_Detail (contains) | Meaning                                         |
|------------------------|--------------------------|-------------------------------------------------|
| boot_to_cloud_scenario | sign_in_account_ready    | W365 found an active account on the host device |



| Tag                   | Action_Detail (contains) | Meaning                                                                                                               |
|-----------------------|--------------------------|-----------------------------------------------------------------------------------------------------------------------|
| Get_token_silently    | Status=Started           | W365 is attempting to get a token for the user account for auth or API call                                           |
| Get_token_silently    | Status=Succeeded         | W365 successfully got a token for the user account and can continue uninterrupted                                     |
| Sign_in_silently      | Status=Started           | W365 is attempting to sign in the user to their AAD account via credentials that the user has recently logged in with |
| Sign_in_silently      | Status=Succeeded         | W365 successfully signed in the user and the application can continue uninterrupted                                   |
| Sign_in_interactively | Status=Started           | W365 is going to prompt the user to sign in with their credentials                                                    |
| Sign_in_interactively | Status=Succeeded         | W365 has validated the userÆs input credentials and the app can resume                                                |



<table>
<colgroup>
<col style="width: 24%" />
<col style="width: 15%" />
<col style="width: 27%" />
<col style="width: 32%" />
</colgroup>
<thead>
<tr class="header">
<th>Tag</th>
<th>Error_Code</th>
<th>Error_Detail (contains)</th>
<th>Meaning</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>boot_to_cloud_scenario</td>
<td>Sign_in_error</td>
<td>AuthError</td>
<td><p>Something went wrong with auth. User will either be prompted to
sign in interactively or will be taken to an error dialog box which
contains the error message and the correlationId that can be used to
query W365 app telemetry.</p>
<p>Once the user clicks the OK button, they will be signed out to the
Windows logon screen.</p></td>
</tr>
<tr class="even">
<td>Sign_in_interactively</td>
<td>OneAuthError</td>
<td>Status=Failed</td>
<td>Interactive sign in failed. User will be taken to an error dialog
box.</td>
</tr>
<tr class="odd">
<td>Sign_in_silently</td>
<td>Failed</td>
<td><p>Status=Failed;</p>
<p>InteractiveSignInDisabled=InteractionRequired</p></td>
<td>Silent sign in failed. User will be prompted to input their
credentials (MFA).</td>
</tr>
</tbody>
</table>

<img src="media/image39.png" style="width:6.5in;height:0.34236in" />

<table>
<colgroup>
<col style="width: 37%" />
<col style="width: 29%" />
<col style="width: 32%" />
</colgroup>
<thead>
<tr class="header">
<th>Tag</th>
<th>Action_Detail (contains)</th>
<th>Meaning</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>http_request</td>
<td>Status=Started</td>
<td>W365 is sending a request to Graph API to retrieve the userÆs cloud
PC information</td>
</tr>
<tr class="even">
<td>http_request</td>
<td>Status=Completed<br />
ResponseCode=200</td>
<td>W365 has returned with a result from the Graph API call to retrieve
the userÆs cloud PC information, and the user has a cloud PC
available.</td>
</tr>
<tr class="odd">
<td>http_request</td>
<td>Status=Completed<br />
ResponseCode=(<strong><u>not 200</u></strong>)</td>
<td>W365 has returned with a result from the Graph API call to retrieve
the userÆs cloud PC information, but did not successfully retrieve the
information. <strong><u>The user may not have a cloud PC assigned to
them, or their subscription may be expired.</u></strong></td>
</tr>
</tbody>
</table>

<img src="media/image40.png" style="width:6.5in;height:0.18472in" /><img src="media/image41.png" style="width:6.5in;height:0.37222in" />

| Tag          | Error_Code        | Error_Detail (contains) | Meaning                                                                                                                                                                                                                                     |
|--------------|-------------------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Error_page   | NoCloudPcAssigned | Status=Failed           | W365 has returned with a result from the Graph API call to retrieve the userÆs cloud PC information but did not successfully retrieve the information. The user does not have a cloud PC assigned to them, and should speak to their admin. |
| http_request | SystemError       | Status=Failed           | W365 has failed to perform a HTTP request because of some internal problem. This will likely cause the app to crash. **\*\*Fixed in newer versions.**                                                                                       |
| http_request | NetWorkError      | Status=Failed           | W365 has failed to perform a HTTP request because the network was down.                                                                                                                                                                     |



| Tag                      | Action_Detail (contains)                     | Meaning                                                                                                                                     |
|--------------------------|----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| Rd_client_notification   | ôStatusö:öMsrdcwWindowRegistrationSucceededö | AVD has registered their HWND with MSRDC. W365 is no longer the primary app communicating with Shell.                                       |
| Rd_client_notification   | ôStatusö:öMsrdcwWindowRegistrationFailedö    | AVD was unable to register their HWND with MSRDC. This means that the AVD app will fail to launch. The user should receive an error window. |
| Msrdcw_hwnd_registration | Status=Succeeded                             | W365 has acknowledged receipt of AVD notification and will close shortly after this message.                                                |
| Msrdcw_hwnd_registration | Status=Failed;Message=MSRDCW is unresponsive | W365 has timed out of waiting for MSRDCW and has not yet received a success event from AVD. Session may timeout with Shell.                 |



| Tag       | Action_Detail (contains)                           | Meaning                                                                  |
|-----------|----------------------------------------------------|--------------------------------------------------------------------------|
| terminate | Terminating App                                    | W365 has closed without crashing.                                        |
| Window    | Create window with class name, ErrorMessageWindow. | W365 has encountered an error and will be showing the error to the user. |

## Troubleshooting Azure Virtual Desktop (HostApp)

Look at the AVD supportability documentation over here:
<https://aka.ms/avdcsswiki>

## Getting Shell Logs:

### Option 1: ASIMOV - Using Kusto query or device Drill

Using Kusto, one can easily correlate boot to cloud related telemetry
events using correlation id displayed in the error UI using Kusto
queries. Learn more about Kusto: [AsimovInKusto -
OSGWiki](https://www.osgwiki.com/wiki/AsimovInKusto)

![Picture34.jpg](/.attachments/Picture34-fb69a954-b511-4b09-8338-84020a740b32.jpg)
  
Example:  
This query gives all the windows telemetry related to a given
correlation ID:

*let CorrelationID = "0BF74709-C93F-49CB-8358-91241F2A3478";*

*WindowsCoreEvents*

*\| extend data = todynamic(\_data)*

*\| extend correlationId = tostring(data.CorrelationId)*

*\| extend correlationId2 = tostring(data.correlationId)*

*\| where correlationId á=\~ CorrelationID or correlationId2 =\~
CorrelationID*

Result:  
![Picture35.png](/.attachments/Picture35-0a542061-9ed9-4ab2-96f8-5ba93f04d493.png)

Analysis on order of events is further explained in the ôProcess the
device diagnostics data (logs/device drill/Kusto)ö section.

- Alternatively, one can visualize the information by device drill
  [Asimov Device Drill -
  (microsoft.com)](https://devicedrill.microsoft.com/) if one of the
  following information is available:

  - deviceid û g:\<device-id\>

  - alias - \<alias\> \[This works only for Microsoft Internal devices\]

- One can filter out the events for specific time range as by default
  the device drill shows complete device events

![Picture36.png](/.attachments/Picture36-d9fc0452-cbf1-4ecb-9db7-35132e007f6d.png)

- Select a core event and click on Drill.

![Picture37.png](/.attachments/Picture37-596093ea-8b07-4226-85a0-e9d2510d2876.png)
Core eventsÆ detail explanation is available in the [*Understanding
Shell Telemetry*](#understanding-shell-telemetry) section.  
  
Note: Data coming from enterprises is highly controlled, so there are
chances the enterprise device data might not be seen.

### Option 2: Using Intune

As IT admins are already acquainted with Intune, they can get the
diagnostics information from executing below steps.

1\. Apply the right device configuration

- Add
  [EnableDiagnosticData.ps1](https://microsoft.sharepoint-df.com/:u:/r/teams/Windows365Windows/Shared%20Documents/BootToCloudDocs/Supportability/WDD%20Collection%20Scripts/EnableDiagnosticData.ps1?csf=1&web=1&e=eLpQZd)
  script on endpoint manager (Intune) to get the diagnostic tool
  installed & enabled on devices.

- Assign this script to the group of B2C devices, this step will allow
  Diagnostic data viewer to start collecting telemetry logs locally for
  devices.

2\. Reproduce the issue.

3\. Collect the device diagnostics data

- Apply the
  [ExportDiagnosticData.ps1](https://microsoft.sharepoint-df.com/:u:/r/teams/Windows365Windows/Shared%20Documents/BootToCloudDocs/Supportability/WDD%20Collection%20Scripts/ExportDiagnosticData.ps1?csf=1&web=1&e=F27qsg)
  script to unhealthy device from Intune to record telemetry data of
  last twelve hours (Modify script if data for duration longer or
  shorter than 12 hour is required).

- Go to device level page -\> click on Collect diagnostics and confirm
  start of data collection  
![Picture38.png](/.attachments/Picture38-5fe33372-1ef4-4a76-8084-9c8ef960f6b7.png)

- Data will be available under device diagnostics section in the same
  page once completed. It can be downloaded in a zip file.
![Picture39.png](/.attachments/Picture39-a1f00015-382d-4155-bc3d-99ff6441cb12.png)

Extract the diagnostic files. A file named
**DiagnosticDataViewerLog**-\<TimeStamp\>.log will be available in a
folder similar to *FoldersFiles
ProgramData_Microsoft_IntuneManagementExtension_Logs*. Open the file in
excel. Seaarch the event by name
Microsoft.Windows.Shell.CustomShellHost.BootToCloud and use Timestamp
column to map to correct event when issue was faced.  
  
Copy the value in payload for corresponding row in a text editor,
payload is in JSON format.

**Correlation Id** can also be extracted from this payload as
highlighted below:

![Picture40.png](/.attachments/Picture40-59be2f5b-ef54-4c89-b05c-fd573089c978.png)
The log file consists of Telemetry events which can be used to analyze
the issue further. The order of the events for troubleshooting are the
same irrespective of whether the logs are extracted from Intune, or if
we use device drill for the same.

Once extracted, sort the logs by time for the interval at the which the
error occurred. Make sure that the events that are taken for the
interval have the same correlation Id as shared by the user.

Core eventsÆ detail explanation is available in the [*Understanding
Shell Telemetry*](#understanding-shell-telemetry) section.

Note: These scripts can also be executed using PowerShell Remoting
technology if the devices support it.

### Option 3: Perform manual steps on Local PC

1\. Pre-requisites: Enable *Send optional diagnostics data* and *Turn on
the Diagnostics Data Viewer settings*. By enabling this option, the user
is giving consent to collect diagnostic logs from your device. Ideally,
these settings should be pre-configured.

![Picture41.png](/.attachments/Picture41-0aa17e90-c055-4a17-830f-038d5a5fc826.png)

- Open task manager using ctrl+alt+del.

- Run new task and enter æms-settings:SystemÆ and click ok. Please
  navigate to

- Go to Privacy & security \> Diagnostics & feedback, then click on
  æView diagnostics dataÆ and turn on the Diagnostics Data Viewer.

2\. Reproduce the issue.

3\. Collect the device diagnostics data.

- Open local PC settings using the above method.

- Go to Privacy & security \> Diagnostics & feedback, then click on
  æView diagnostics dataÆ and then click on æOpen Diagnostics Data
  ViewerÆ.

![Picture42.png](/.attachments/Picture42-3f740e14-a8d4-4cdd-824c-718c4cce0d85.png)

- Click on æExport DataÆ present on top right corner.

![Picture43.png](/.attachments/Picture43-fd97e759-00ed-47c4-a2bb-dd685f7e2379.png)

- Enter the file name and click on save to collect diagnostic data file.

- Share the file with your admin along with the error UI screenshot
  consisting of the Correlation ID.

Core eventsÆ detail explanation is available in the [*Understanding Shell Telemetry*](#understanding-shell-telemetry) section.

## Understanding Shell Telemetry

Sequence diagram from login to the point where shell launches the W365
app:  
![Picture44.png](/.attachments/Picture44-1ea65328-a8e5-4b0a-815b-bca85694a20c.png)

### Expected Telemetry

1.  After the authentication, ShellAppRuntime is launched.
    ShellAppRuntime initializes the CPC component and emits the below
    event:  
    **Microsoft.Windows.Shell.CustomShellHost.BootToCloud  
    **

2.  After CPC component is initialized, the transition screen is shown
    to the user which emits below event. **  
    Microsoft.Windows.Shell.CloudDesktop.TransitionScreen.TSShowCalled  
    **

3.  Parallel to point 2, the Windows 365 app is launched, and the below
    event is emitted with success status in its payload.  
    **Microsoft.Windows.CloudPC.CPCProviderAppLaunchResult  
    **

4.  After a successful connection to Cloud PC is established, transition
    screen gets dismissed. The below event is emitted with
    *DismissalReason:3* which means cloud pc desktop is ready.  
    **Microsoft.Windows.Shell.CloudDesktop.TransitionScreen.TSDismissStarted  
      
    **<u>If the time difference between the events in point 2 and point
    4 is more than 2 minutes, then cloud pc is not launched
    successfully.</u>

### Other key events 

Apart from the above expected telemetry, there are few key events which
can be analyzed for troubleshooting.

1.  **Microsoft.Windows.Shell.CloudDesktop.TransitionScreen.CheckTimeout  
    **The presence of this event implies that the cloud pc hasnÆt
    connected for 2 minutes because of some error and transition screen
    timeout occurred.

2.  **Microsoft.Windows.FaultReporting.AppCrashEvent**

Crash events to be looked only for .exeÆs relevant to B2C. Ex û
shellappruntime.exe  
One can analyze crash logs in Watson link - [Watson : User (microsoft.com)](https://watsonportal.microsoft.com/User)

## Device Setup Troubleshooting

If the device is

- Booting to local after enrolling in boot to cloud mode or

- getting stuck at a particular state but there is no telemetry or
  telemetry is insufficient

then, please check if it falls under one of the following common
scenarios.

1.  Booting to Local Shell

    1.  **Validate OS Version** û Validate if the OS is on one of the
        Windows Insider Program Channel or not. We require the OS to be
        in the Windows Insider Program to receive the latest Boot to
        Cloud app updates.

        1.  In theory, the May Moment with Public Apps should work as
            well, but the content may be old and not patched with the
            latest changes or updates.

        2.  If you are on an internal build that is not one of the
            channels and you are an external customer, you should switch
            back to the channel for proper support.

    2.  **Intune Policy sync** - Sync the policy with following steps:

        1.  Settings (Win + I) -\> Accounts -\> Access work or school
            -\> Connected by {email address} -\> Managed by Microsoft
            -\> Info -\>Scroll down to Device Sync status -\> Sync

        2.  Ask IT Admin to sync the device in Intune
            (endpoint.microsoft.com -\> Device Page -\> Sync)

    3.  **Validate Boot to cloud policies** - Validate policy
        configuration by checking registry key:

        1.  HKLM\Software\Microsoft\PolicyManager\current\device\CloudDesktop
            BootToCloudMode 1

        2.  HKLM\Software\Microsoft\PolicyManager\current\device\WindowsLogon
            OverrideShellProgram 1

        3.  HKLM\Software\Microsoft\Windows\CurrentVersion\SharedPC\NodeValues
            01=1 (EnableSharedPC Mode) 18=1 (EnableWIPFlighting)

![Picture45.png](/.attachments/Picture45-73ef29e5-608e-4cf9-9a8f-bb9481a09526.png)

2.  **Verify that the right version of W365 App and AVD App is installed
    properly**

    1.  Verify that your W365 App and AVD app are on the latest insider
        version with the latest features and fixes

    2.  Running the following command in admin powershell will get you
        the App installation information

        1.  Get-AppxPackage -AllUsers -Name \*MicrosoftCorporationII\*

    3.  If the app installed are on the wrong version, you can either
        wait for the apps to be updated by WinGet mechanism or you can
        follow the steps below to force an app sync

        1.  Get app name by running:

            1.  Get-appxpackage -AllUsers -Name {App Display Name}

        2.  Delete the app using the installed package name.

            1.  Remove-AppxPackage -AllUsers -Package {App Package Name}

        3.  Delete the Intune Management Extension node in Registry

            1.  Computer\HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\IntuneManagementExtension

        4.  Restart Intune Management Extension service from task
            manager

3.  Boot to Cloud failures during logon

    1.  When a new user tries to use the device, sometimes the app
        registration does not happen properly due to timing conflict
        (race condition). In this situation, one or both apps might
        appear missing. Please try to log in again, this usually
        resolves the issue.

    2.  If apps telemetry appears to be correct but Boot to Cloud fails,
        please try to do Alt + Tab to see if the Cloud PC is available
        as a window on the device. If this is the case, there is likely
        an issue with apps interacting with OS to convey the correct
        status of the apps.

    3.  For apps not functional after multiple tries, it is recommended
        that you reset the Boot to Cloud setup process and retry from
        post OOBE state without any apps installed. {Add Link to Product
        Doc}

