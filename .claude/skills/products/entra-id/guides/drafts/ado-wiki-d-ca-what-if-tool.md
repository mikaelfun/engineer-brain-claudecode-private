---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Azure AD Conditional Access What If Tool"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FAzure%20AD%20Conditional%20Access%20What%20If%20Tool"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Summary

The Conditional Access "What If" policy evaluation tool allows IT administrators to understand the impact that Conditional Access policies will have when the specified user attempts to sign-in, all from the Conditional Access management blade.

Instead of creating a policy and then performing multiple logins just to find out if a policy applies or not, the "What If" tool gives IT administrators the ability to populate a template with all of the same Conditions they want satisfied by a user at login, and then see if Azure AD will apply the policy as expected.

When a query is submitted, the results will display a list of policies where the Conditions have been satisfied. Those policies that appear in the Evaluation results display all of the Controls (challenges like Block, MFA, Hybrid Domain joined, Compatible, etc) required for the policy to be enforced. The results also inform the IT administrator of the existence of any Classic V1 policies they may have forgotten about that could influence the user's login.

## How the WhatIf UX Works

The Condition options provided in the "What If" tool mimic the Condition options that exist in Conditional Access Policy. From the service-side, a worker process called the Quova cache uploader is responsible for populating the ESTS cache with the same data that is available in the UX. The Conditions supplied in the "What If" tool populate a NuGet package which Azure AD uses to perform policy evaluation against the ESTS cache.

## Entra ID Portal

The "What If" tool for Conditional Access can be accessed by navigating to "Conditional Access" in the Azure Portal, then selecting "Policies" and clicking the "What If" button.

## Microsoft Graph API

WhatIf is now available using a public Microsoft Graph API.

## Supported Conditions

### Configurable Conditions

- **User**: Object picker allows selection of only one user. Adding a Guest account will result in What If discovering any policy where Guest is added to the Include. What If will discover policies where members of Azure AD Role(s) have been added to the Include.

- **Cloud apps**: Two options:
  - Select "All cloud apps" to see what policies apply to the specified user, regardless of which cloud application is selected (default)
  - Choosing "Select apps" allows selecting specific applications. Classic V1 policies will also be evaluated.

- **IP address and Country**: Evaluated together (both must be provided).
  - IP Address and Country are evaluated in a pair
  - Supports a single IPv4 address only (Internet facing IPv4)
  - If customer is on VPN with Split Tunneling, the endpoint may not go through tunnel

- **Device platform**:
  - Select device platform (equivalent to "All platforms including unsupported")
  - Important: InPrivate browsing will not satisfy device-based policy checks like Domain Joined because PRT is not passed
  - Specific platforms: Android, iOS, Windows Phone, Windows, macOS

- **Client app**:
  - Leaving default evaluates all policies with Browser or Mobile apps and desktop clients
  - Selecting Browser evaluates only Browser policies
  - Selecting Mobile apps and desktop clients evaluates those policies

- **Sign-in risk**: No risk, Low, Medium, High

### Evaluation result

#### Classic (V1) policy discovery
If Classic (v1) policies are enabled for the selected cloud application, the What If results will indicate them and provide a direct link to the Classic policies blade.

### Troubleshooting Tips

1. **User filter must use DisplayName** not UPN in sign-in logs
2. **InPrivate browsing** won't satisfy device-based checks (PRT not passed)
3. **VPN Split Tunneling** may cause IP address mismatch - verify client's actual external IP via myipv4address.com
4. **IP and Country must be paired** - providing only one will generate an error message
