---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Azure AD Conditional Access Authentication Flows"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/Azure%20AD%20Conditional%20Access%20Policy/Azure%20AD%20Conditional%20Access%20Authentication%20Flows"
importDate: "2026-04-07"
type: troubleshooting-guide
---

----
Tags:
- cw.AAD
- cw.AAD-Authentication
- cw.AAD-Workflow
- cw.Conditional-Access
- comm-idsp
----
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
 

[[_TOC_]]

### Compliance note  

This wiki contains test/lab data only.

# Feature overview  

Microsoft Entra ID supports a wide variety of authentication and authorization flows to provide a seamless experience across all application and device types. Some of these authentication flows, are higher risk than others. To provide more control over your security posture, we’re adding the ability to control certain authentication flows to Conditional Access. This control starts with the ability to explicitly target [device code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-device-code).

## Update June 8, 2024:

We are making some changes to the in-preview Authentication Flows condition surrounding how policies are enforced on device registration scenarios. Starting on July 10th, 2024, Microsoft will begin enforcing Authentication Flows policies on device registration scenarios. No other Conditional Access policies will be enforced on device registration scenarios by default.

If your organization currently uses Device Code Flow for device registration purposes, you will need to exempt the Device Registration Service resource from the scope of your Conditional Access Policy to avoid impact. To do this, we are introducing the ability to exempt the Device Registration Resource via the "Target Resources" option in Conditional Access. To exempt DRS via UX, you will need to go to Target Resources -> Exclude -> Select excluded cloud apps -> Device Registration Service. For API, you will need to update your policy by excluding the Client ID for Device Registration Service: 01cb2876-7ebd-4aa4-9cc9-d28bd4d359a9. If you use Device Code Flow for device registration scenarios, and want to exempt Device Registration Service from your Conditional Access policy before we begin enforcement, you will be able to do so starting the week of July 8th, 2024.

If you are unable to successfully exempt Device Registration Service via either of the two above avenues, you may also use Conditional Access app filters to accomplish this.

## Device code flow

Device Code Flow is an OAuth 2.0 grant type that enables cross-device authorization to occur. This flow is used when signing into devices that are input-constrained and cannot run a browser, such as TVs, HoloLens devices, and various IoT devices. The flow allows a user to authenticate via a secondary device (like a phone or laptop) and have tokens sent to the initiating device. Device Code Flow is a high-risk authentication flow that might be used as part of a phishing attack or to access corporate resources on unmanaged devices. You can configure the device code flow control along with other controls in your Conditional Access policies. For example, if device code flow is used for android based conference room devices, you might choose to block device code flow everywhere except for android devices in a specific network location.

You should only allow device code flow where necessary. Microsoft recommends blocking device code flow wherever possible.

### Device Code Flow Security Improvements

Around August 30, 2024, security improvements will be made to the Entra Device Code Flow (DCF). Entra users are directed to open a browser and navigate `https://microsoft.com/devicelogin` where they are prompted a code that is on the screen directing them to open the browser.

| Flow | Enter Code |	Account Picker | Sign In | Speedbump | Enter Password | Confirmation Screen | Verification Screen |
|-----|-----|-----|-----|-----|-----|-----|-----|
| **Before** | ![CurrentDCFCode](/.attachments/AAD-Authentication/1389386/CurrentDCFCode.jpg) | ![DCFAccountPick](/.attachments/AAD-Authentication/1389386/DCFAccountPick.jpg) | ![DCFAccountPick2](/.attachments/AAD-Authentication/1389386/DCFAccountPick2.jpg) | N/A | ![DCFpwd](/.attachments/AAD-Authentication/1389386/DCFpwd.jpg) |  | ![DCFverification](/.attachments/AAD-Authentication/1389386/DCFverification.jpg) |	 
| **After**	| ![NewDCFCode](/.attachments/AAD-Authentication/1389386/NewDCFCode.jpg) | ![DCFAccountPick](/.attachments/AAD-Authentication/1389386/DCFAccountPick.jpg) | ![DCFAccountPick2](/.attachments/AAD-Authentication/1389386/DCFAccountPick2.jpg) | ![NewDCFSpeedbump](/.attachments/AAD-Authentication/1389386/NewDCFSpeedbump.jpg) | ![DCFpwd](/.attachments/AAD-Authentication/1389386/DCFpwd.jpg) | ![OldConsent](/.attachments/AAD-Authentication/1389386/OldConsent.jpg) | ![DCFverification](/.attachments/AAD-Authentication/1389386/DCFverification.jpg) |	  	 	 	 	 	 
| **Screen** | Modified<br><br>This will happen around August 30, 2024 | Unchanged | Unchanged | New<br><br>This will happen around December 2024<br><br>This will show company branding, list the app they are signing into and their location to assure the user the sign-in is as they intended. | Unchanged | TBD | Unchanged |

### Authentication transfer

Authentication transfer is a new flow that offers a seamless way to transfer authenticated state from one device to another. For example, users could be presented with a QR code within the desktop version of Outlook that, when scanned on their mobile device, transfers their authenticated state to the mobile device. This capability provides a simple and intuitive user experience that reduces the overall friction level for users.

The ability to control authentication transfer is in preview use the **Authentication flows** condition in Conditional Access to manage the feature.

### Protocol tracking

To ensure Conditional Access policies are accurately enforced on specified authentication flows, we use functionality called protocol tracking. This tracking is applied to the session using device code flow or authentication transfer. In these cases, the sessions are considered protocol tracked. Any protocol tracked sessions are subject to policy enforcement if a policy exists. Protocol tracking state is sustained through subsequent refreshes. Nondevice code flow or authentication transfer flows can be subject to enforcement of authentication flows policies if the session is protocol tracked.

For example:

1. You configure a policy to block device code flow everywhere except for SharePoint.
1. You use device code flow to sign-in to SharePoint, as allowed by the configured policy. At this point, the session is considered protocol tracked
1. You try to sign in to Exchange within the context of the same session using any authentication flow not just device code flow.
1. You're blocked by the configured policy due to the protocol tracked state of the session

# Case handling  

This feature is supported by the **Identity Security and Protection** community.

# Licensing  

- A working Microsoft Entra tenant with at least a Microsoft Entra ID P1 license enabled.  
- You will need 1 license per user using this feature.

## Regions

- Public
- Fairfax/Arlington <span style="color:orange;font-weight:700;font-size:16px">TBD</span>
- Gallatin/Mooncake <span style="color:orange;font-weight:700;font-size:16px">TBD</span>

# How to configure and manage  

1. Open the create a [Conditional Access Policy](https://entra.microsoft.com/#view/Microsoft_AAD_ConditionalAccess/PolicyBlade) portion of the Microsoft Entra portal.
2. Select your Users and Target resources as normal.
3. Under Conditions click the **Not configured** link underneath **Authentication flows**.
4. Toggle the **Configure** slider to **Yes**
   
    ![alt text](../../../../.attachments/AAD-Authentication/1389386/PolicyCreationZoom.png)
   
5. Check **Device code flow** and/or **Authentication transfer** as desired.
6. Configure any other Conditions, Grant and Session controls you desire.
7. Click the **Create** button.

## Testing in your lab

The easiest way to replicate an device code auth flow is with  [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli).  Install and then launch the Azure CLI.  Login to Azure with the following command:

>az login --use-device-code

You will receive a message like this:

>To sign in, use a web browser to open the page https://microsoft.com/devicelogin and enter the code XXXXXXXXXX to authenticate.

Complete the steps as shown in the message.

![Azure CLI Test Login](../../../../.attachments/AAD-Authentication/1389386/AzureCLILogin.png)

## Policy Object

You will find a new attribute in the CA policy object that represents this feature.  It till be found under **"authenticationFlows": { "transferMethods":}**.  The valid values are **authenticationTransfer** and/or **deviceCodeFlow**.

Here is an example of a policy that applies to both **authentication transfer** and **device code flow**.

```json
{
  "id": "4e314002-xxxx-xxxx-xxxx-898cb1389709",
  "templateId": null,
  "displayName": "MyAuthFlowPolicy",
  "createdDateTime": "2024-02-28T20:53:28.3344512Z",
  "modifiedDateTime": "2024-02-28T21:01:33.5611747Z",
  "state": "enabledForReportingButNotEnforced",
  "sessionControls": null,
  "conditions": {
    "userRiskLevels": [],
    "signInRiskLevels": [],
    "clientAppTypes": ["all"],
    "platforms": null,
    "locations": null,
    "times": null,
    "deviceStates": null,
    "devices": null,
    "clientApplications": null,
    "applications": {
      "includeApplications": ["All"],
      "excludeApplications": [],
      "includeUserActions": [],
      "includeAuthenticationContextClassReferences": [],
      "applicationFilter": null
    },
    "users": {
      "includeUsers": ["9b0e57b3-xxxx-xxxx-xxxx-3c1bfd8a1026"],
      "excludeUsers": [],
      "includeGroups": [],
      "excludeGroups": [],
      "includeRoles": [],
      "excludeRoles": [],
      "includeGuestsOrExternalUsers": null,
      "excludeGuestsOrExternalUsers": null
    },
    "authenticationFlows": {
      "transferMethods": "deviceCodeFlow,authenticationTransfer"
    }
  },
  "grantControls": {
    "operator": "OR",
    "builtInControls": ["block"],
    "customAuthenticationFactors": [],
    "termsOfUse": [],
    "authenticationStrength@odata.context": "https://graph.microsoft.com/beta/$metadata#identity/conditionalAccess/policies('4e314002-xxxx-xxxx-xxxx-898cb1389709')/grantControls/authenticationStrength/$entity",
    "authenticationStrength": null
  }
}
```

# Troubleshooting  

## Customer Sign-in logs

When configuring a policy to restrict or block device code flow, it’s important to understand if and how device code flow is used in your organization. Creating a Conditional Access policy in report-only mode or filtering the sign-in logs for device code flow events with the **authentication protocol** filter can help.

![Auth Protocol Sign-in Log Filter](../../../../.attachments/AAD-Authentication/1389386/AuthProtocolFilter.png)

To aid in troubleshooting protocol tracking related errors, we’ve added a new property called **original transfer method** to the **activity details** section of the Conditional Access **sign-in logs**. This property displays the protocol tracking state of the request in question. For example, for a session in which device code flow was performed previously the **original transfer method** is set to **Device code flow**.

![Entra Portal Activity Details](../../../../.attachments/AAD-Authentication/1389386/EntraPortalSignIn.png)

Admins can also see if the Authentication flow condition applied in the Conditional Access Policy details section of the sign-in logs.

![Entra Portal CA Details](../../../../.attachments/AAD-Authentication/1389386/Entra-CA-Details.png)

## ASC Troubleshooting

In ASC engineers can check the properties of the sign-in attempt and view the **orginalTranferMethod**.

![ASC originalTransferMethod](../../../../.attachments/AAD-Authentication/1389386/ASC.png)

You can also check to see if an Authentication flow CA policy applied by checking the **appliedConditionalAccessPolicies** section.  You will see an entry named **authenticationFlow** under **conditionsSatisfied**.

![ASC applied policies](../../../../.attachments/AAD-Authentication/1389386/ASC-SignInLog.png)

In the CA diagnostics sections of the ASC sign-in troubleshooter, we also expose if a Authentication Flow policy applies.

![ASC CA Diagnostic](../../../../.attachments/AAD-Authentication/1389386/ASC-CADiag-Block.png)

## Troubleshooting unexpected blocks

If you have a sign-in unexpectedly blocked by a Conditional Access policy, you should confirm whether the policy was an authentication flows policy. You can do this confirmation by going to **sign-in logs**, clicking on the blocked sign-in, and then navigating to the **Conditional Access** tab in the **Activity details: sign-ins** pane. If the policy enforced was an authentication flows policy, select the policy to determine which authentication flow was matched.

If device code flow was matched but device code flow wasn't the flow performed for that sign-in, that means the refresh token was protocol tracked. You can verify this case by clicking on the blocked sign-in and searching for the **Original transfer method** property in the **Basic info** portion of the **Activity details: sign-ins** pane.

 > **Note:** Blocks due to protocol tracked sessions are expected behavior for this policy. There is no recommended remediation.

## Troubleshooting unexpected allows

Some forms of device code flow are considered conditional access [bootstrap scenarios](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageid=712097) and may not be blocked as expected by the customer.  Please review the [Conditional Access Bootstrap Scenarios](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageid=712097) wiki for more information.

## IcM Creation

### Conditional Access Policy (ESTS)

EvoSTS (ESTS) - This team handles issues involving the EvoSTS authentication service.  This is the token issuance portion of Azure Active Directory. Please make sure you have reviewed the support workflows on the [CSS Support Wiki](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/589898/ICM) and consult a Cloud Identity TA prior to submitting.

#### Support Engineer Instructions

Create IcM from ASC tool, by using Escalate Case button and searching for IcM template with Code [ID][AUTH][CA] - CA policy investigation and Id: F2N2ox

#### Target ICM Team (TA use)

  - **Owning Service**: ESTS
  - **Owning Team**: Conditional Access

## Supportability documentation  

### Public documentation  

- [Conditional Access: Authentication flows](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-authentication-flows)
- [Block authentication flows with Conditional Access policy](https://learn.microsoft.com/en-us/entra/identity/conditional-access/how-to-policy-authentication-flows)
- [Conditional Access: Conditions](https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-conditions#authentication-flows) 

### Training  

- [Deep Dive 195908 - Authentication flows for Conditional Access](https://aka.ms/AApv9qr)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.
- Deep Dive Transcript: https://aka.ms/AApvhg0
