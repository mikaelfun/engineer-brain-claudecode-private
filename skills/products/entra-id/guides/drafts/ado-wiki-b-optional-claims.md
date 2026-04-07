---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Claims_and_Token_Customization/How to/Azure AD Optional Claims"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Claims_and_Token_Customization/How%20to/Azure%20AD%20Optional%20Claims"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-appex
- SCIM Identity
- Claims
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD Authentication](/Tags/AAD-Authentication) [AAD Workflow](/Tags/AAD-Workflow) 
 

[[_TOC_]]

# Feature overview

Application developers can use optional claims in their Entra ID apps to specify which claims they want in tokens sent to their application. Optional claims are claims about who a user is that are not included by default in ID, access or SAML tokens. Applications (clients or resources) use claims for authentication and/or authorization purposes.

Optional claims can be used to:

* Select additional claims to include in tokens for your application.
* Change the behavior of certain claims that Entra ID returns in tokens.
* Add and access custom claims for your application.

Common optional claims use cases include migrating an app from ADFS to Azure or migrating from a third-party Identity Provider (e.g. Ping Identity) to Azure Active Directory.

# Types of optional claims
* <b>[v2-specific](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-optional-claims#v20-specific-optional-claims)</b>: these claims are always included in v1.0 Entra ID tokens, but not included in v2.0 tokens unless requested. These claims are only applicable for JWTs (ID tokens and Access Tokens)
* <b>[v1-v2 common](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-optional-claims#v10-and-v20-optional-claims-set)</b>: the set of optional claims available by default for applications to use are listed below. 
* <b>Directory extension:</b> these are directory schema extensions created specifically through the Entra ID Graph API (these do not apply to MS Graph directory schema extensions)
* <b>Groups:</b> group types (SecurityGroup, DistributionList, DirectoryRole) are applied across all token types; groups additional properties are specific to each token type. Note: DistributionList is only available if SecurityGroup and DirectoryRole are both selected (i.e. DistributionList cannot be selected by itself)

![image.png](/.attachments/AAD-Authentication/261384/image-1d0acf95-9793-413f-bdd2-4d52c952bb2c.png)

# Optional claims applicability

The optional claims applicable to an application are determined by:
* The token type being configured
* Token version (e.g. access token version accepted by the app)
* Source (Null = standard optional claim, User = custom directory extension optional claim)
* The type of user(s) that can sign into the application

![image.png](/.attachments/AAD-Authentication/261384/image-f75044ac-071c-4a32-8af8-d8eb4f90a716.png)



# Engineering teams (ICM)
* For issues with optional claims in the token not behaving as they should within the application, or ESTS failing to issue them in the token.

- **Support engineers** should use [this template](https://portal.microsofticm.com/imp/v3/incidents/cri?tmpl=83L3k1) to open an ICM.
    - **TAs** can escalate to:
        - **Owning Service**: ESTS
        - **Owning Team**: Incident Triage

For issues with specifically the Token Configuration blade (e.g. blade does not list optional claims already defined in the Manifest that are known to be valid or in the user's token already:

- **Support engineers** should use [this template](https://portal.microsofticm.com/imp/v3/incidents/cri?tmpl=83L3k1) to open an ICM.
    - **TAs** can escalate to:
        - **Owning Service**: AppRegPortal
        - **Owning Team**: AppRegPortal Dev Team

# How To Edit Optional Claims in the Azure Portal App Registrations Token Configuration (Preview) blade

## Example 1: Add upn optional claim to ID token:
![image.png](/.attachments/AAD-Authentication/261384/image-fff28259-6740-4222-aa88-37f33be5168a.png)
![image.png](/.attachments/AAD-Authentication/261384/image-960950c1-63e2-425d-92a5-7a0eb490d20f.png)
![image.png](/.attachments/AAD-Authentication/261384/image-277d53bc-191d-4d64-9a45-bc3b4e2f2d8d.png)
![image.png](/.attachments/AAD-Authentication/261384/image-33462d4a-85c6-460d-b4bc-fbbf6b7703a9.png)
![image.png](/.attachments/AAD-Authentication/261384/image-202595cc-0299-4b7b-98f2-18bcd3253d04.png)
![image.png](/.attachments/AAD-Authentication/261384/image-416d8b20-1c9f-49e5-b300-3f3c81fb32fe.png)

## Example 2: edit upn optional claim to include externally authenticated guest upn information:
![image.png](/.attachments/AAD-Authentication/261384/image-dca82a7f-2d05-4170-a43d-3100219d0a3e.png)
![image.png](/.attachments/AAD-Authentication/261384/image-b5e449b1-656e-417e-8f82-784e82b4186d.png)
![image.png](/.attachments/AAD-Authentication/261384/image-628e7cf4-511f-4672-b0d5-0102f98febd7.png)

## Example 3: add the skypeid directory extension optional claim to the app's ID token:
![image.png](/.attachments/AAD-Authentication/261384/image-c3dfcd01-c19a-4ad4-8478-3fe166d735d9.png)
![image.png](/.attachments/AAD-Authentication/261384/image-47710f02-e8b7-4972-b36f-8fff9a4b08b6.png)
![image.png](/.attachments/AAD-Authentication/261384/image-d5ff1c35-d7bf-48ac-9ed4-82ed310a13be.png)
![image.png](/.attachments/AAD-Authentication/261384/image-cdbb882f-c392-4b04-94ef-587e1911cbda.png)
![image.png](/.attachments/AAD-Authentication/261384/image-79fac569-2c9f-49fc-9e34-7a50f117a92d.png)

## Example 4: add the groups claim ('security groups' type only) to the app's ID, access and SAML tokens
![image.png](/.attachments/AAD-Authentication/261384/image-3e0d48df-7199-46b2-8791-ccab5b4b7132.png)
![image.png](/.attachments/AAD-Authentication/261384/image-a5e74e76-8c14-4b29-a57e-a23e7380464f.png)
![image.png](/.attachments/AAD-Authentication/261384/image-e1b2632f-7ab2-406b-9395-d86d69361ad1.png)
![image.png](/.attachments/AAD-Authentication/261384/image-03368a35-448f-4816-b21d-84435768f42d.png)
![image.png](/.attachments/AAD-Authentication/261384/image-268e4694-ddd4-4dc2-80d1-294ddc260d78.png)

## Example 5: configure the SAML token's groups claim to be emitted (shown) in the sAMAccountName format
![image.png](/.attachments/AAD-Authentication/261384/image-8983bc0d-9ac1-4625-a7cf-8252410def5b.png)
![image.png](/.attachments/AAD-Authentication/261384/image-f3201441-41ae-41c4-ad45-efafb4e58baf.png)
![image.png](/.attachments/AAD-Authentication/261384/image-b5cde38d-6d75-4c49-9eed-b74a93874722.png)
![image.png](/.attachments/AAD-Authentication/261384/image-f450b657-c17e-4828-ab7d-6f9192b2bdd1.png)
![image.png](/.attachments/AAD-Authentication/261384/image-d7f868fb-061d-4023-9343-c26ceb4e22df.png)


# How to Edit Optional Claims using the Azure Portal App Registrations Manifest blade

You can configure optional claims for your application by modifying the application manifest (see example below):
![image.png](/.attachments/AAD-Authentication/261384/image-0124a70a-a068-424c-95d9-06724bdcee4d.png)

For more examples please see the [public documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-optional-claims#v10-and-v20-optional-claims-set)

# JWT Optional claims - Edit in Enterprise Application
This addition to options claims for OAuth applications is a replacement for claims mapping policies. It can be found in the Enterprise Apps --> Single Sign-on section for an OAuth application.

Microsoft Documentation - [Customize claims issued in the JSON web token (JWT) for enterprise applications](https://learn.microsoft.com/en-us/entra/identity-platform/jwt-claims-customization)

![JWT optional claims - Enterprise apps.png](/.attachments/JWT%20optional%20claims%20-%20Enterprise%20apps-5b455234-f0b8-4cbc-ad81-9f1c72041347.png)


# Troubleshooting

* <b>Issues Managing Optional Claims in the Token configuration blade:</b> If there are issues Adding/Removing/Editing Optional Claims from the new **Token configuration** blade, determine if the same claim can be Added/Removed/Edited from the **Manifest** blade.  If the change can be performed from the **Manifest** blade, but not the new **Token configuration** blade, get a Fiddler or Browser trace of the action failing in the **Token configuration** blade and file an ICM.
* <b>Access token optional claims:</b> a potential point of user confusion may be around adding optional claims to access tokens. Access tokens are always generated using the manifest of the resource, <b> not the client;</b> thus changing the optional claims for your application's tokens will never cause access tokens for MS Graph to look different. In order to validate that your access token optional claims changes are in effect, request a token for your application, not another app.
* <b>Optional claims not appearing in the token:</b> ensure that 1) the optional claims are applicable to your app (see the table above) and 2) there are no typos in the manifest (the new Entra ID Application Registrations 'Token Configuration' overview screen lists out all incorrectly configured optional claims with an orange triangle)
* <b>Directory extension optional claim naming convention:</b> in the Token Configuration optional claims overview screen, the name of directory extension optional claims matches what is returned in the token (not how directory extension optional claims are entered in the manifest)
* <b>I can't find the additional properties for an optional claim:</b> currently only two optional claims have additional properties (<b>upn</b> and <b>groups</b>)
* <b>I can't find the "essential" optional claims setting:</b> The "essential" optional claim property was left out of the App Registrations Token Configuration optional claims experience since there is only one use case for changing the default value to 'true' (currently only applies to the 'email' optional claim). If needed, users can update their application's manifest and set the "essential" property to true for the email optional claim.
* Optional claims vs. customizing claims (aka claims mapping):

#Optional SAML claims – IsManaged, IsKnown, IsCompliant (For Internal Use - Do not share with customers)

So often we get cases from customers requesting instructions on how to set up the optional claims _**IsManaged, IsKnown and IsCompliant**_ to be sent in the SAML token to be sent to 3rd party applications. The reason why customers request this is because some applications have the capability of creating policies to consume those claims to differentiate an authorized user that is on a managed, compliant, or known device from an authorized user that is on a random device. With that information they can grant different levels of permissions to the session (more restrictive or more relaxed). 

Currently those claims are classified as restricted and aren't supported for 3rd party applications since it presents a business issue as they would allow an application to do its own Conditional Access device evaluation without the need for premium licensing required for CA, however, technically Entra ID can emit these claims by using the method cited in the following articles that customers often refer to:

•	[Azure AD - SAML - Intune - ismanaged attribute](https://learn.microsoft.com/en-us/answers/questions/412018/azure-ad-saml-intune-ismanaged-attribute.html)

•	[SAML Attribute for managed device](https://learn.microsoft.com/en-us/answers/questions/529218/saml-attribute-for-managed-device.html)

Our current message to the customer for this scenario is that **Microsoft does not support those claims for 3rd party applications.** If the customer chooses to proceed with the unsupported method and isn't getting the expected result, the issue should not be escalated to engineering. Our Product Team is aware of this need and might add this feature to their roadmap at some point after deciding on the best technical approach. Customers are encouraged to post this idea at [Ideas · Community](https://feedback.azure.com/d365community) to get more visibility or support the following existing post at https://feedback.azure.com/d365community/idea/b9507d0d-c525-ec11-b6e6-000d3a4f0789

Additional Advisory Information:

1. PG has confirmed there are no plans to block the unsupported claims configuration method because doing so would result in a breaking change.
2. Entra ID's device claims issuance logic is NOT the same as the ADFS claims criteria referenced in the following article: https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/deployment/plan-device-based-conditional-access-on-premises#authenticated-devices
3. Per the ESTS code logic, the "isknown" claim will only be issued in SAML token and set to "true" when the device is "Hybrid AAD Joined". If the device is Haadj, factors such as a trust level change when user logs in from home tenant vs guest tenant can influence the status of the "isknown" parameter. Another example is if a registered device goes out of compliance due to an OS requirement not being satisfied per the company MDM rules. 
4. There are no conditions which will result in the "isknown" claim being emitted as false. 
5. For an AAD registered + MDM enrolled device, it's expected that only "ismanaged" + "iscompliant" claims are issued in SAML token. 

Additional reference: 
[Claims mapping policy](https://learn.microsoft.com/en-us/azure/active-directory/develop/reference-claims-mapping-policy-type#table-2-saml-restricted-claim-set)

Related ICM: https://portal.microsofticm.com/imp/v3/incidents/incident/498997742/summary


# Known issues

* Family_name and given_name optional claims for ID token are not issued for v2 endpoint unless profile is also added to the scope (i.e. "scope=openid+profile"). 

# Public content

- [Access token claims reference - Microsoft identity platform](https://learn.microsoft.com/en-us/entra/identity-platform/access-token-claims-reference)

- [ID token claims reference - Microsoft identity platform](https://learn.microsoft.com/en-us/entra/identity-platform/id-token-claims-reference)

- [Detailed optional claims documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-optional-claims#configuring-directory-extension-optional-claims)

# Training

**Title:** Brownbag  - Azure AD Optional Claims

**Course ID**: S6845934

**Format:** Self-paced eLearning

**Duration:** 45 minutes

**Audience:** Cloud Identity Support Team [MSaaS AAD - Authentication Professional](https://msaas.support.microsoft.com/queue/dc834c65-9d09-e711-811f-002dd8151752) and [MSaaS AAD - Authentication Premier](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751)

**Microsoft Confidential** – Items not in Public Preview or released to the General Audience should be considered confidential. All Dates are subject to change.

**Tool Availability:** December 9, 2019

**Training Completion:** December 9, 2019

**Region**: All regions

**Course Location:** [Learning](https://learn.microsoft.com/activity/S6845934/launch/)
