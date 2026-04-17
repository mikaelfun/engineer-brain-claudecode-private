---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/App protection policy for Edge on Windows"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FApp%20protection%20policy%20for%20Edge%20on%20Windows"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.CA
- cw.edge
- cw.Appprotection
- cw.Authstrengths
- SCIM Identity
- Conditional Access
-  App protection
- Authentication Strengths
-  Edge
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Conditional-Access](/Tags/Conditional%2DAccess) 




[[_TOC_]]


# Compliance note

This wiki contains test and/or lab data only.

___

# Summary

Microsoft Intune's desktop Mobile Application Management (MAM) API has been extended to support Microsoft Edge on Windows 11 workplace joined BYOD devices. This feature allows users to securely access work content from their home PC while placing restrictions on what they can do with that data once they have access.

If the administrator configures the conditional access policy with only the **Require app protection policy** grant control, and the user accesses the protected application from a browser that is not MAM aware, their sign in will be blocked and they will be redirected to **Launch in Edge**. Once in Edge, the user’s device is workplace joined and enrolled in MAM. The application content accessed via Edge is managed by data protection which controls the user’s ability to Save, Copy, Edit and View content.

**Note**: If the administrator configures the policy with the **Require app protection policy** and **Require compliance device** grant controls but selects the OR operand of **Require one of the selected controls**, then the user will be prompted to download and install the extension (i.e., Chrome extension) to become MDM complaint.

This capability uses the following functionality:

- Intune Application Configuration Policies (ACP) to customize the org user experience in Microsoft Edge
- Intune Application Protection Policies (APP) to secure org data and ensure the client device is healthy when using Microsoft Edge
- Windows Security Center threat defense integrated with Intune APP to detect local health threats on personal Windows devices
- Application Protection Conditional Access to ensure the device is protected and healthy before granting protected service access via Entra ID (AAD).

MAM-aware Edge acquires an access token from Web Account Manager (WAM) using silent and interactive flows for resources protected with Intune App Protection.

This feature allows Administrators to configure a MAM policy for Edge on Windows without requiring the organization to manage the entire device. The **Require app protection policy** grant control in conditional access policy protects access to resources by leverages Intune app protection policies. If the browser is not MAM compliant, access will be blocked by Conditional Access policies and a token will not be issued. This is not supported with the **Require approved client app** grant control which will be [retired on 30 June 2026](https://learn.microsoft.com/en-us/entra/identity/conditional-access/migrate-approved-client-app).

___

# Requirements

- Windows 11 Version 22H2 (OS build 22621) with KB 5031455. or later
   - During public preview, and at GA, this will only be supported on Nickel (Windows 11, build 10.0.22621 (22H2) or later).
   - In October 2023 the feature will be available in all retail versions of Windows Ni (22621), Co(22000), Fe (20348) and Vb (19045).
- Windows 10 Version 20H2 (OS build 19042) with KB 5031445.

   **Note** Backporting to earlier builds doesn't change the build numbers. The KB numbers won't be available until later in the backport process.

- Workplace join only.
   - The device can be workplace joined via Edge profile or through another app.
   - MDM Enrolled devices (AADJ and HAADJ) are not supported.
   - No more than three users can Workplace Join (WPJ) from the same BYOD device across all tenants

   **IMPORTANT**: The **Allow my organization to manage my device** check box <u>must</u> be unchecked when registering the device. If this remains checked the device becomes MDM managed; which is unsupported. Also, don't select **No, sign in to this app only**. After selecting **OK**, you may see a progress window while policy is applied. A window will say *You're all set* once app protection policies are applied.

- Microsoft Edge (build v115.0.1901.155 or later)
   - Enter `edge://flags/#edge-desktop-mam` in the address bar and set **Enable MAM on Edge desktop platforms feature** to Enable and click the **Restart** button.
- Intune App Protection Policies (APP) for Windows configured for Microsoft Edge. 
- Users must have an Intune license.
- Azure AD Premium 1 or higher is required for Conditional Access enforcement using the **Require app protection policy** grant control.

___

# Known Issues

## Issue 1: Clicking Switch Edge profile in endless loop

Users on registered Windows 10 10 22H2 devices end up repeatedly clicking **Switch Edge profile** while the user is signed into their profile in Edge. 

The Entra ID Sign-in log records this event:

| Event Property | Event Value |
|-----|-----|
| Date | 11/9/2023, 10:47:00 AM |
| Request ID | 12c536c7-53be-4d69-b677-3c62cb892400 |
| Correlation ID	| ecb524d5-b34a-4c9a-bcd8-bfcdf08a0725 |
| Authentication requirement	| Single-factor authentication |
| Status | Failure |
| Sign-in error code | 53003 |
| Failure reason	| Access has been blocked by Conditional Access policies. The access policy does not allow token issuance. |

MDM policy is enforced preventing them from copying content out of the browser.

The `MamLog.txt` file shows the following:

```text
[2023-11-09T16:17:28.466Z] [INFO] Queuing check-in for UserID:099891d0-####-####-####-################ to run as soon as possible.
[2023-11-09T16:17:28.467Z] [ERROR] The application did not supply an access token on request for UserID:099891d0-####-####-####-################.
[2023-11-09T16:17:28.467Z] [WARNING] Unable to acquire an access token during check-in for UserID:099891d0-####-####-####-################.
[2023-11-09T16:17:28.467Z] [ERROR] An unexpected error occurred during check-in for UserID:099891d0-####-####-####-################; the operation will be reattempted after a brief delay on local conditions.
[2023-11-09T16:17:28.636Z] [INFO] Check-in for UserID:099891d0-####-####-####-################ requested by the application.
[2023-11-09T16:17:28.636Z] [INFO] Queuing check-in for UserID:099891d0-####-####-####-################ to run as soon as possible.
[2023-11-09T16:17:36.527Z] [INFO] Requested check-in to the MAM Service for UserID:099891d0-####-####-####-################ is complete. (client-request-id:869007a3-7341-4172-8dac-d80198a27f08)
[2023-11-09T16:17:36.531Z] [INFO] Requesting MTD device health report for UserID:099891d0-####-####-####-################ with wdmam://mamreport?user_hint=099891d0-####-####-####-################.
[2023-11-09T16:17:36.548Z] [ERROR] Exception occurred while triggering MTD report for UserID:099891d0-####-####-####-################: Couldn't launch: wdmam://mamreport?user_hint=099891d0-####-####-####-################
```

___

## Solution 1: Clicking Switch Edge profile in endless loop

The customer failed to install *Optional Quality Update 5031445* from Windows Update prior to testing. At the time, this update was still "optional" and was not pushed as a regular Windows 10 update.

Customers must opt to install the [October 26, 2023—KB5031445 (OS Build 19045.3636) Preview](https://support.microsoft.com/en-us/topic/october-26-2023-kb5031445-os-build-19045-3636-preview-03f350cb-57f9-45e6-bfd7-438895d3c7fa) update until it becomes part of the regular Windows 10 update path and installs automatically. 

___

# Licensing

- Entra ID P1 for Conditional Access
- E3/Microsoft Intune Plan 1 for MAM

___

# Limitations

- This will not be available for USGov

___

# ClientAppId for Edge

| Application | ClientAppId | 
|-----|-----|
| Microsoft Edge | ecd6b820-32c2-49b6-98a6-444530e5a77a |

___

# Case Handling

This capability is supported by four separate support teams: Edge, Intune, Windows Defender and Azure AD. Azure Identity supports Conditional Access.

Unlike on mobile, the Desktop MAM SDK does not participate in authentication at all. The Desktop MAM SDK makes a request to the Edge app layer for an access token, and Edge replies. All of the communication with WAM, whether there's an in-app cache, what parameters are used, what logging or other diagnostics exist around the auth flow, all live within Edge code.

| Issue | Support Team | SAP |
|-----|-----|-----|
| Conditional Access with the *Require app protection policy* grant control fails with Edge on Windows | [MSaaS AAD - Authentication Professional](https://msaas.support.microsoft.com/queue/dc834c65-9d09-e711-811f-002dd8151752) and [MSaaS AAD - Authorization Premier](https://msaas.support.microsoft.com/queue/f82fcb6a-5f8e-4cc4-9117-92f2b3bb7730)<br><br>it may be necessary to collaborate with Edge support | Azure/Azure Active Directory Sign-In and Multi-Factor Authentication/Conditional Access/Grant or block access |
| Workplace Join fails when a work or school account is added to a Profile in Edge<br><br>- No more than three users can workplace join on the same device. | Edge support<br><br>Identity should collaborate with Edge support. | Browser\Microsoft Edge\Edge for Windows |
| Placing `edge://edge-dlp-internals` into the address bar of the Edge browser shows MAM flags are not enabled and enabling them does not persist after closing all instances of msedge.exe. | Edge support | Browser\Microsoft Edge\Edge for Windows |
| Placing `edge://edge-dlp-internals` into the address bar of the Edge browser shows MAM flags are enabled in Edge, but compliance check fails causing conditional access to block access. | Intune support | Azure\Microsoft Intune\App Configprofiles - Windows\ManagedApps |
| Placing `edge://edge-dlp-internals` into the address bar of the Edge browser shows MAM flags remain enabled in Edge after closing all instances of msedge.exe, but they are lost over time. | Intune support | Azure\Microsoft Intune\App Configprofiles - Windows\ManagedApps |

___

# Public Documentation

- [Require an app protection policy on Windows devices](https://learn.microsoft.com/en-us/entra/identity/conditional-access/how-to-app-protection-policy-windows)

___

# Architecture

At user sign-in, ESTS fetches the policy Enrollment Id by the user, device and application IDs.

Conditional access policy using Intune App Protection uses a `"EnrollmentIds"` property which contains the required Microsoft enrollment ID. A user signing in from a version of Edge that has MAM enabled, passes a base64 encoded version of the Microsoft enrollment ID in a request header called `"x-ms-enrollments"`, which is sent to AAD Authorize endpoint. If the Microsoft enrollment ID in `"x-ms-enrollments"` matches the `"EnrollmentIds"` property on the CA policy the user is granted access.

The `"x-ms-enrollments"` header request is a comma separated list of Microsoft enrollment IDs that is base64 encoded. This can be decoded in Fiddler by right-clicking and selecting **Send to TextWizard**, then select **From Base64** in the **Tansform** drop-down. This value must match the  `"EnrollmentIds"` property in ASC's Authentication Diagnostics in the *DataForConditionEvaluation* message for a successful sign-in. If it matches `"MatchedEnrollmentId"` will appear in the *DataForConditionEvaluation* message of a successful sign-in.

Updates made to WAM to support MAM on Windows:

- The ability to send App identity of the user agent that is calling APIs to ESTS. This is required because CA policy is dependent on the identity of the User agent along with the app identity of the web app, and resource the user is accessing within the user agent.

- Support for Client ID and RedirectURI was added to the PRT and Device headers.

___

# Conditional Access Policy Configuration

In the conditional access policy wizard, under **Access controls** > **Grant**, select **Grant access** and check **Require app protection policy** to use MAM enabled Edge.

The **Client apps** condition must be enabled with **Browser** selected.

If a user is in a browser that is not MAM enabled, like Chrome or Firefox, and the site they are accessing is protected with the **Require app protection policy** grant control, they will see a **Launch in Edge** prompt.

![LaunchInEdge](/.attachments/AAD-Authentication/1136926/LaunchInEdge.jpg =303x244)

**IMPORTANT**: If the administrator configures the CA policy with the **Require app protection policy** and **Require compliance device** grant controls, but selects the OR operand of **Require one of the selected controls**, users in non-MAM aware browsers will be prompted to download and install the extension (i.e. Chrome extension) to become MDM complaint.

![MDMorMAMinNonMAMbrowser](/.attachments/AAD-Authentication/1136926/MDMorMAMinNonMAMbrowser.jpg =308x384)

Once Edge launches and they sign in they may be prompted to click **Switch Edge profile**. They must uncheck the **Allow my organization to manage my device** check box when they are prompted to allow workplace join to occur.

**Note**: it is recommended Windows MAM policy be separated from Android and iOS policies for simplified administration.
___

# Overview of WAM SSO scenario

Edge supplies the Enrollment ID to the platform API to build a cookie. For this to work with multiple users WAM and CloudAP were extended to link Enrollment to a particular user.

Clients are responsible for attaching a new `"x-ms-enrollments"` header to the requests. Edge builds and attaches this data when the request is sent to AAD Authorize endpoint. The client using WAM builds and provides the `"x-ms-enrollments"` containing all entitlement IDs in a comma separated list as a "pass-through" parameter. ESTS parses the header and matches IDs to the enrollments it finds on the device enrollments collection. If an enrollment is found, ESTS replies back with a token. If an enrollment is not found an "unauthorized client" error code is returned. A sub-error code of "protection_policy_required" indicates MAM enrollment is required.

```json
{
"error":"unauthorized_client",
"error_description":"AADSTS53005: Application needs to enforce Intune protection policies.\r\nTrace ID: de4be191-6780-407f-8c78-f8ba085bc501\r\nCorrelation ID: f7e9cd11-0507-4279-a7e8-ca067c4a420a\r\nTimestamp: 2021-08-09 22:04:00Z",
"error_codes":[53005],
"timestamp":"2021-08-09 22:04:00Z",
"trace_id":"de4be191-6780-407f-8c78-f8ba085bc501",
"correlation_id":"f7e9cd11-0507-4279-a7e8-ca067c4a420a",
"suberror":"protection_policy_required",
"adi":account@contoso.onmicrosoft.com
}
```

CA matching code in ESTS looks for a policy in the device object.

Clients using WAM know the exact user ID in the WAM response. For Edge it's harder since Edge redirects the user to the RP page and doesn't do any extra work if login succeeds. ESTS sends back the current enrollment ID in a (new) response header. The enrollment ID is only known when the user logs in and policy is checked. Clients are responsible for picking the current enrollment ID from the WAM\ESTS response and enforcing the policies.

## High Level MAM Flow

1. Application enrolls itself using an MDM/MAM API.

2. Application sends its enrollment ID to ESTS via a parameter when requesting tokens using WAM APIs.

3. Edge sends its enrollment ID and Edge Application ID inside the "Enrollment" cookie it attaches to login requests.

4. ESTS validates target resource, if resource is requiring MAM enrollment it looks for MAM enrollment ID parameter in the request.

5. Device must be AAD registered (workplace joined) for MAM enrollment to work.

6. MAM must be supported in WAM and browser SSO scenarios.

7. When ESTS requires MAM enrollment for a client, but enrollment ID is not supplied in the request, it sends an error message with a special code to indicate that application requires enrollment. On the client side this results in an “interaction required” error and a special error code requiring MAM enrollment.

8. In a browser scenario when MAM is required, but the enrollment ID is not supplied, ESTS redirects to an error page showing the error description and a link to invoke WAM to start the enrollment.

![AuthFlow](/.attachments/AAD-Authentication/1136926/AuthFlow.jpg)

___

## Edge SSO Flow

Edge SSO is similar to what WAM is doing with the following differences:

1. Edge makes a "Get Cookies" call into AAD SSO APIs (WAM and CloudAP plug-ins) on Windows.

2. AAD SSO APIs create two sets of headers: PRT and Device.

3. Edge builds the `"x-ms-enrollment-id"` header and attaches it to the request.

4. Edge navigates to the login endpoint, SSO headers are attached to the request.

5. The user will eventually end up picking an account they want to login with. The enrollment header has the set of enrollment IDs enrolled by the caller and the PRT\device header contains the calling application (client) ID. ESTS loads the device object from MSODS.

6. ESTS matches the enrollments IDs from the request to the enrollment IDs on the device object. If there is a match, CA policy check is satisfied and ESTS will issue a token.

![EdgeAuthFlow](/.attachments/AAD-Authentication/1136926/EdgeAuthFlow.jpg)

___

# Troubleshooting

MDM (i.e.: Intune) is responsible for setting the **Enable MAM on Edge desktop platforms** feature to Enabled in Edge.

1. Verify the device has a *Join Type* of **Azure AD registered**.
   - Navigate to the **Devices** blade on the user account in the portal.
   - Devices with a *Join Type* of **Azure AD joined** and **Hybrid Azure AD joined** are not supported.
   - When workplace join takes place, verify the **Allow my organization to manage my device** check box was *unchecked* at the time the device was registered.

   **NOTE**: The device can also be WPJ through another app besides Edge. A maximum of three users can workplace join the same device across all tenants. Azure AD Join (AADJ) and Hybrid Azure AD Join (HAADJ) are not supported because these leverage MDM/device wide management.

2. [Ensure MAM flags are enabled in Edge](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=1136926&anchor=ensure-mam-flags-are-enabled-in-edge)
3. Determine if [Mamlog.txt shows access token issues](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=1136926&anchor=mamlog.txt-shows-access-token-issues)

___

## Conditional Access Failure

1. Obtain the date/time of a failed sign-in and the correlation or request ID.
2. Locate the sign-in event in ASC.
3. Click the *Troubleshoot this sign-in* link for that event to launch ASC's Authentication Diagnostics.
4. Select the Call that contains the error.

- The **CA Diagnostics** tab will show a Failure like this.

```json
All Of The Following Grant Controls Were Unsatisfied:
- The User Signed In Using {application-name} ({appId}), Which Was Not A Compliant Application, So They Were Blocked From Signing In.
```

5. The **Device** tab shows the Client App Id for Edge (ApplicationId), the MaMEnrollmentID that is required, along with the UserID:

ApplicationId:ecd6b820-32c2-49b6-98a6-444530e5a77a
ExpirationTime:09/29/2023 18:28:23
MamEnrollmentId:0eb0aa6b-f843-4014-ab8a-bc89c6be3ee7
UserId:099891d0-####-####-####-############

6. Click **+ Expert view** button, then select **Diagnostic logs** tab.

- In the *Filter by name or value box* type `Parsed Microsoft enrollment IDs`. If this is present, the client passed a request header called `"x-ms-enrollments"` on the header of the sign-in request. The value shown in `Parsed Microsoft enrollment IDs` is the base64 decoded value that was in that request header.

7. Clear the *Filter by name or value box*, then search for the `EnrollmentIds`.

- The *DataForConditionEvaluation* message should appear. It will contain a string that looks like this and `MAMApplicationId` will <u>NOT</u> be the Edge app of `ecd6b820-32c2-49b6-98a6-444530e5a77a`:

**Note**: ESTS honors the MAM aware Edge browser app id of ecd6b820-32c2-49b6-98a6-444530e5a77a if it is present. Otherwise, it uses the client application id as the MAM enrolled app.

```json
"EnrollmentIds":["0eb0aa6b-f843-4014-ab8a-bc89c6be3ee7"],"MAMApplicationId":"3ad94f41-49d8-46b3-a0f1-d7e85a82d771"
```

- Alternatively, when a Successful sign-in occurs, the request has a `"x-ms-enrollments"` header containing the required enrollment ID. MAM CA Policy is satisfied and ESTS populates the `MatchedEnrollmentId` property in the *DataForConditionEvaluation* message with the enrollment id that matched the compliant application. It looks like this:

```json
"EnrollmentIds":["0eb0aa6b-f843-4014-ab8a-bc89c6be3ee7"],"MatchedEnrollmentId":"0eb0aa6b-f843-4014-ab8a-bc89c6be3ee7","MAMApplicationId":"ecd6b820-32c2-49b6-98a6-444530e5a77a"
```

___

## 'Launch in Edge' appears in Non-MAM browser 

Users signing in from a browser other than Edge will get a **Launch in Edge** prompt if the cloud app is protected with **Require app protection policy** grant control in conditional access policy.

The STS context request to the `/login` endpoint of the tenant (i.e.: https://login.microsoftonline.com/7dd2219b-####-####-####-############/login) will contain a "CTX" property in the RAW response. Once **Launch in Edge** is clicked, the sign-in URL is built using the CTX value and looks like this.

https://login.microsoftonline.com/common/resume?<span style="color:red">**ctx**</span>=rQQIARAA42Kwki0...

- In Fiddler, the WebForms tab of the request shows the "CTX" property.
- The Headers tab for this request contains `"x-ms-enrollments"` with a base64 encoded value which is the Microsoft enrollment ID.

___

## Ensure MAM flags are enabled in Edge

Verify Edge has the required MAM settings enabled.

On the client computer, place `edge://edge-dlp-internals` into the address bar of the Edge browser.

- Verify these **Feature Flag Settings** are set.

   | Feature Flag Name                         | Feature Flag State |
   | ----------------------------------------- | ------------------ |
   | mslrmv2                                   | Enabled            |
   | msMamDlp                                  | Enabled            |

   -AND-

- Verify this **Provider States** is set.

   | Provider Name                             | Provider State |
   | ----------------------------------------- | -------------- |
   | Mam Intune Data Loss Prevention (Mam Dlp) | Available      |

___

## If MAM flags fail to persist

If MAM flags fail to persist in Edge after closing all instances of msedge.exe, issue this command from the RUN command to open Edge with the settings enabled.

- Verify the flags are enabled by placing `edge://edge-dlp-internals` into the address bar of the Edge browser.

   `msedge --enable-features="msDesktopMam"`

___

## Mamlog.txt shows access token issues

The *mamlog.txt* file located in the  the Edge user data directory under %LOCALAPPDATA%\Microsoft\ may show access token issues similar to this.

`[2023-08-24T01:17:04.752Z] [WARNING] Unable to acquire an access token during check-in for UserID:099891d0-####-####-####-############.`

Refresh the user token by logging the user out of their profile and back in to refresh the user token.

___

## View MAM Policy Info

From the Windows client, have the admin place `edge://policy` into the address bar of the Edge browser. This shows when MAM policy last applied and the version number.

___

## Debug identity errors in Edge

Issue this command from the RUN command.

`msedge --enable-logging --v=0`

This will output identity errors to *chrome_debug.log* in the Edge user data directory under %LOCALAPPDATA%\Microsoft\, but this may not be suitable for CSS purposes.

___

# ICM Paths

## Conditional Access Policy (ESTS)

EvoSTS (ESTS) - This team handles issues involving the EvoSTS authentication service. An example scenario might be Edge is sending the correct Microsoft enrollment ID in the `"x-ms-enrollments"` request header but ESTS is not honoring it. 

### Support Engineer ICM Template (ESTS)

Create IcM from ASC tool, by using Escalate Case button and searching for IcM template with Code [ID][AUTH][CA] CA Policy investigation and Id F2N2ox.
___

### Target ICM Team (ESTS) - TA use

**Owning Service**: ESTS

**Owning Team**: Incident Triage

___

## WAM Fails to Provide Edge Token info

All of the communication with WAM, whether there's an in-app cache, what parameters are used, what logging or other diagnostics exist around the auth flow, all live within Edge code. Edge support should verify they are making the proper request and Identity determines WAM is at fault.

### Support Engineer ICM Template (WAM)

Create IcM from ASC tool, by using Escalate Case button and searching for IcM template with Code [ID][M365][WAM] - Issues with Web Account Manager and Id: P10441

### Target ICM Team (WAM) - TA use

**Owning Service**: Cloud Identity AuthN Client

**Owning Team**: Cloud Identity AuthN Client Team (Windows)

___

# Training

Daniel Emerson, Matt Babey, Priyanka Dua, Shuqi Shang, Jordan Gross, Joaquin Lozano, Arunesh Chandra, Scott Sheehan, Paul Huijbregts, and Marius Dobrescu provide a walkthrough of **MAM for Windows** feature.

**Course Title**: Deep Dive 159259 - Intune Readiness Walkthrough [2309] MAM for Windows

**Course ID**: TBD

**Format**: Self-paced eLearning

**Audience**: Identity Security and Protection Support Engineers in [MSaaS AAD - Authorization Premier](https://msaas.support.microsoft.com/queue/f82fcb6a-5f8e-4cc4-9117-92f2b3bb7730)

**Duration**: 77 Minutes

**Tool Availability**: July 4, 2023

**Training Completion**: September 12, 2023

**Region**: All regions

**Course Location**: [QA](https://aka.ms/AAmn2ol)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.


