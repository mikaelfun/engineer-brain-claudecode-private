---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2B/Azure AD B2B Cross Tenant Access Policy (XTAP)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
-  cw.comm-extidmgt
- B2B Collaboration
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [Entra](/Tags/AAD) [EntraID](/Tags/AAD%2DAccount%2DManagement) 

 
[[_TOC_]]


# Compliance note
This wiki contains test and/or lab data only.


# Feature overview

We are introducing a new capability that will allow you to configure Cross Tenant Access policy for Secure Collaboration. With this policy administrators will have controls for both outbound and inbound access to their Microsoft Entra ID tenant from invited B2B Guests.

This feature allows additional control for collaboration and provides optimal balance between additional security and increased productivity for users. Control can be in both directions: outbound and inbound.  

- **Outbound access controls** apply to users in your organization signing into external organizations. This will allow you to prevent your identities from being used in un-sanctioned ways.

- **Inbound access controls** apply to users from external organizations signing into your organization. This will allow you to prevent un-sanctioned access to your resources as well as improve security and productivity for your B2B partners that are accessing your resources.

Here are some examples of the core scenarios you can enable with the new Cross Tenant Access policy. In this example, your organization is referred as Contoso. For sample policies for each scenario, please refer to the Sample Policies and Schema document.


**Outbound Access (FromMyTenancy):**

1. As an IT admin of Contoso, I want to block access for my users to tenant Fabrikam.

2. As an IT admin of Contoso, I want to allow access for my users only to tenants Foo and Bar.

3. As an IT admin of Contoso, I want to allow access to Tenants Foo and Bar to only specific users/groups within Contoso (e.g. Grp 1 can only access Foo and Grp 2 can only access Bar).

**Inbound Access (ToMyTenancy):**

1. As an IT admin of Contoso, I want to block access to my resources to users from tenant Fabrikam.

2. As an IT admin of Contoso, I want to allow access to my resources to users only from tenants Foo and Bar.

3. As an IT admin of Contoso, I want to allow access to my resources (protected by MFA) from Tenants Foo and Bar while accepting Foos MFA and avoiding re-MFA in Contoso. 

4. As an IT admin of Contoso, I want to allow access to my resources (protected by CompliantDevice/HybridAADJDevice) from Tenant Bar while accepting Tenant Bars device assertions (claims).

5. As an IT admin of Contoso, I want to accept MFA and device claims from specific users/groups within Tenant Baz before allowing them access to my resources.

# Case handling

This feature is supported by [MSaaS AAD - Account Management Professional](https://msaas.support.microsoft.com/queue/ce0b7553-9d09-e711-8121-002dd815174c), [MSaaS AAD - Account Management Premier](https://msaas.support.microsoft.com/queue/6014a8ba-465c-e711-8129-001dd8b72a0c)

# Licensing

There are no additional licensing requirements. However, to gain access to the full feature and for the best experience an Azure AD P1 subscription is recommended.

# Risks

There are no known risks.

# Limitations and known issues

- Today, policies are unable to block Teams individual instant messages or from users joining Teams meetings.

- When you dont trust an external tenants MFA, the branding may not be displayed correctly. i.e. the user is registering/performing MFA in the external tenant, but the home tenant branding is being displayed.  

- ## User account with GDAP Roles and B2B/guest user object on the resource Tenant - Loop with error AADSTS50076 (MFA required on Resource Tenant) ##  
When accessing a specific blade within the Azure Portal, a loop is verified, where the user is faced with a prompt to sign-in again, and after doing so, navigating back to the same blade, the same prompt is thrown: 

![image.png](/.attachments/image-4133fbcd-a0ea-4c4c-a5c2-358d8ec0b9e0.png)  

The issue has been identified to occur when:  
a) A user has GDAP roles assigned in the resource tenant  
b) The same user also has a B2B invited user object in the resource tenant   
c) MFA is required to access resources  

The issue occurs because the system implicitly trusts MFA from the GDAP users tenant if accessing the resource tenant in context of GDAP, but when switching to an app that is not GDAP eligible, MFA is no longer trusted and the system does not distinguish on where the user needs to perform MFA, forcing the loop.  

<b>Solution:  
To work around this issue today, you can guide Customers to use cross-tenant access settings in the resource tenant to trust MFA from the users home tenant. This will ensure that MFA is always trusted, and the user will be able to satisfy any requests that require MFA in a single, consistent way, using their home MFA registration.
</b> 
 
There is work in progress to investigate a way to avoid the behavior without the need to setup XTAP configuration:  
[Product Backlog Item 2687906: GDAP MFA Issue](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/2687906)

To identify the presence of this issue, aside from the loop behavior shared previously, under the sign-in event details, look for: 
 
1) XTAP that refers CloudServiceProvider on the inbound trusts:  
![image.png](/.attachments/image-6792afc3-b7e4-4b6d-adad-df0bf58a40cb.png)  

2) XTenantRel = B2B:  
![image.png](/.attachments/image-706902b0-aeb9-4d46-8edf-6f074d23ac52.png) 

3) MFA Owning Tenant will map to the Resource/Customer's Tenant ID:  
![image.png](/.attachments/image-834e9151-d865-4947-98f8-5dc838276bd1.png)   


# Frequently asked questions (FAQ)

**Q1:** What happens if an object targeted by the policy (such as a tenant or group) gets deleted after the policy has been enabled? 

**A1:** The policy will continue to be applied and evaluated to existing targets within its scope.

 -=-=-=-=-=-

**Q2:** What happens when access to my resource from external users requires MFA (conditional access config) and at the same time I trust MFA from Entra ID tenant of those external users?

**A2:** The external user will be redirected back to their home tenant for MFA. The external users will no longer have an option to register and satisfy MFA in the resource tenant.

If a user has already done MFA in their home tenant prior to accessing the resource tenant, that MFA claim will be trusted by the resource tenant, and they will not be prompted a 2nd time for MFA.

The Azure AD tenant of those external users will need to either have P1 or enable Security Defaults in order to register and satisfy MFA in their home tenant.

 We will continue to honor existing tokens with the MFA claim for as long as they are valid. Once this token is invalidated, from this point on the user will be redirected to their home tenant to perform MFA.

 -=-=-=-=-=-

**Q3:** How does Cross Tenant Access policy work with B2B Management policy (ex: B2B allow/deny list)?

**A3:** Cross tenant access settings currently work only with Entra ID tenants and ultimately control whether or not a user can authenticate and gain a token to a resource. They do not impact whether a user can be invited. B2B allow/deny list controls whether a user from a specific domain can be sent an invitation.

You can block users via cross tenant access settings but still be able to invite them. They will be blocked when they try and access the resource (see end user error messages above for examples).

Recommendation is to use cross tenant access settings to control access to/from other Entra ID tenants and use B2B allow/deny list for non-Entra ID tenants.

 -=-=-=-=-=-

**Q4:** How does cross tenant access settings work with Conditional Access?

**A4:** Cross tenant access settings can be thought of as a coarse-grained control for resource access. The only controls are allow or block. Conditional Access allows fine-grained control to resources, allowing enforcement of things like MFA or device compliance (and many others).

They do work together in some ways. If cross tenant access says the user needs to be in a specific group to access the resource and CA says MFA is required, at runtime we will evaluate to ensure the user is in the correct group and also prompt for MFA. If either item fails the check, access is blocked.

 -=-=-=-=-=-

**Q5:** Whats the difference between Tenant Restrictions and Cross Tenant Access Policies?

**A5:** At a high level here are the differences:

- Tenant restrictions is a network proxy-based solution. All traffic that goes through the proxy will have headers injected into them enroute to the login page. These headers will cause authentication requests to be rejected by non-allowed external tenants. The limitations of this solution is a lack of granularity (either everyone can access an external tenant or no one can) and the fact that all traffic must pass through the proxies (it wont block access if your users are trying to access the external tenant from the internet). It also cannot block anonymous or consumer access to applications, as those flows don't visit the Entra ID login page. 

- Cross Tenant Access (aka Secure Communication Channel) is a policy that is tied to the tenant and evaluated on all your users regardless of location. It includes outbound controls such as only allowing certain groups of your users to access specific external tenants. It also includes inbound controls such as trusting an internal tenants MFA or compliant device signals. The limitation here is that this policy is only tied to your tenant. If a user switches to using an identity outside of your control to access another tenant, then your "FromMyTenancy" policies wont be applied. 

- Overall, TR V1 will take precedence over Cross Tenant Access Policies. This means that while tenant restrictions are in effect, when you update FromMyTenancy to allow access to a certain tenant you must also allow access through tenant restrictions. This will be fixed in the next iteration of tenant restrictions.

- The next iteration of Tenant Restrictions will be part of the Cross Tenant Access Policies, and will be part of a future preview.

 -=-=-=-=-=-

**Q6:** How can I migrate the legacy B2B  Management Policy Allow and Deny Domain List to Cross Tenant Access Policies?

**A6:** There is a PowerShell script which can be utilized to assist in migrating the policies.  See [GitHub - Azure-Samples/B2BAllowDenyList-to-XTAP: Sample script to migrate Azure AD domains from the External Collaboration Settings (allow/deny list) to Cross Tenant Access Settings.](https://github.com/Azure-Samples/B2BAllowDenyList-to-XTAP)




# How to configure and manage

[Cross-tenant access settings - Microsoft Entra External ID | Microsoft Learn](https://learn.microsoft.com/entra/external-id/cross-tenant-access-settings-b2b-collaboration)

# Troubleshooting

<span
style="color:black;font-weight:bold;background-color:yellow">
   **NOTE:** Watch demo recording [Troubleshoot XTAP failure with Auth Troubleshooter](https://microsoft.sharepoint.com/:v:/t/Community-ExternalIdentityManagement/EUVBZ9m53gJMk6iTQyb9eH8BtMh2oSdGuyW_v6MTxY7Lmg?e=ay1Wwc) of these steps to follow along
</span>

## Typical errors
These are typical errors an end user may encounter/ They must be resolved by an admin.

### **Oubound error AADSTS500212 - NotAllowedByOutboundPolicyTenant**

* Message Examples:

   * Your tenant administrator has restricted which organizations can be accessed.
   * AADSTS500212: The user's administrator has set an outbound access policy that does not allow access to the resource tenant.

- Triggers when your company is preventing you from being a guest in someone elses tenant. 
- Your admin needs to fix this, if you see it. 

Example:

[![outbounderror1.png](/.attachments/AAD-Account-Management/527944/outbounderror1.png)](/.attachments/AAD-Account-Management/527944/outbounderror1.png)

[![outbounderror2.png](/.attachments/AAD-Account-Management/527944/outbounderror2.png)](/.attachments/AAD-Account-Management/527944/outbounderror2.png)



### **Inbound error AADSTS500213 - NotAllowedByInboundPolicyTenant**
* Message Examples:
   
  * The x.onmicrosoft.com administrator has restricted which organizations can access their tenant.
  * AADSTS500213: The resource tenant's cross-tenant access policy does not allow this user to access this tenant.

- Shown when the tenant youre trying to access doesnt want to let you in as a guest. 
- The admin of the tenant you want to access needs to fix this. 

Example:

[![inbounderror1.png](/.attachments/AAD-Account-Management/527944/inbounderror1.png)](/.attachments/AAD-Account-Management/527944/inbounderror1.png)

### **Cross Cloud XTAP Troubleshooting (US Gov \ GCCH \ Mooncake etc.)**
For cross cloud XTAP troubleshooting please refer to [Cross Cloud XTAP troubleshooting Steps](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/604918/B2B-collaboration-cross-cloud-settings?anchor=**cross-cloud-xtap-troubleshooting-steps%3A**)  while cross cloud (Commercial to US Gov \ GCCH or Mooncake) is supported there are special requirements that must be reviewed.  Namely the default inbound + outbound policies do not apply to cross cloud partners.  Customers must explicitly allow the other cloud in their trust settings as well as explicitly add the partner tenant to their inbound + outbound partners.

### **Tenant Restriction's Version 2 error - AADSTS5000211 - NotAllowedTenantRestrictionsV2Tenant**

* Message Examples

   *  A tenant restrictions policy added to this request by a device or network administrator does not allow access to the resource tenant.
   * The administrator of the tenant that owns this tenant restrictions policy does not allow this access. If this is not expected that administrator should allow
access by editing their cross tenant access policy

- Triggers when your company prevents you from accessing another tenant using a foreign account (an account from another tenant)
- Your admin needs to fix this, if you see it. 

  Example:

  [![trverror1.png](/.attachments/AAD-Account-Management/527944/trverror1.png)](/.attachments/AAD-Account-Management/527944/trverror1.png)

- Resolutions
   - This error is controlled by AAD Tenant Restrictions v2 Policy, reference [AAD Auth TSG for Azure AD Tenant Restrictions V2](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/669951/Azure-AD-Tenant-Restrictions-V2)

### **Tenant Restriction's Version 1 errors - AADSTS500021 or 80045C4D- NotAllowedTenantRestrictedTenant**

* Message Examples

   *  Your network administrator has blocked access
   *  External access is blocked by policy.  Contact your IT department for access

- Triggers when your company prevents you from accessing another tenant using a foreign account (an account from another tenant)
- Your admin needs to fix this, if you see it. 

  Example:

  ![image.png](/.attachments/image-c0411961-4578-4fc5-8aa9-80548dcb5dbb.png)

- Resolutions
   - This error is controlled by AAD Tenant Restrictions v1 Policy, reference [AAD Auth TSG for Azure AD Tenant Restrictions V1](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183985/Azure-AD-Tenant-Restrictions-V1)

### **Unsupported cross-tenant access policy error**

- For customers who participated early in the private preview of cross-tenant access, they may receive this error when viewing the admin UX or calling the MS Graph APIs
- This error may occur when customer tries to accept a GDAP relationship with CSP partner as well where GDAP API would show error : `ConflictingCrossTenantAccessPolicyAccessRule : conflicting Cross Tenant Access Policy access rule was detected in the customer tenant`
- You can verify this scenario by using ASC Graph explorer query for `/policies/crossTenantAccessPolicy/default` and `/policies/crossTenantAccessPolicy/partners` for the response `Unsupported CrossTenantAccessPolicy configuration found. Please contact support`
- Admins must manually update their cross-tenant access settings policy definition to use the new supported schema to resolve this error
- Customers can use this document to help migrate: [Migrate your XTAP](https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/items?path=/AzureAD/GeneralPages/AAD/AAD-Account-Management/Azure-AD-B2B/Migration%20of%20existing%20XTAPs.pdf&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=master&resolveLfs=true&%24format=octetStream&api-version=5.0&download=true) (Internal) or [Migrate CrossTenantAccessPolicy JSON to the new Microsoft Graph API](https://learn.microsoft.com/en-us/entra/external-id/migrate-to-xtap-v2-api) (Public)
- Customers can check their legacy policy via [Graph Explorer](https://aka.ms/ge) query GET `https://graph.microsoft.com/beta/legacy/policies` 
 and locating the policy with `type = B2BManagementPolicy` + `isOrganizationDefault = True` or via example Graph Powershell cmdlets:
   ```powershell
   Connect-MgGraph -Scopes 'Directory.Read.All'
   
   # Get legacy policies
   $url = "https://graph.microsoft.com/beta/legacy/policies"
   $legacypolicies = Invoke-MgGraphRequest -Uri $url -Method GET -OutputType PSObject
   
   # Get legacy B2B policy
   $b2bpolicy = $legacypolicies.value | ? {($_.type -eq 'B2BManagementPolicy') -and ($_.isOrganizationDefault)}
   
   # List legacy B2B policy definition
   $b2bpolicy.definition
   ```
   Once obtained, follow [Migrate your XTAP](https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/items?path=/AzureAD/GeneralPages/AAD/AAD-Account-Management/Azure-AD-B2B/Migration%20of%20existing%20XTAPs.pdf&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=master&resolveLfs=true&%24format=octetStream&api-version=5.0&download=true) (Internal) or [Migrate CrossTenantAccessPolicy JSON to the new Microsoft Graph API](https://learn.microsoft.com/en-us/entra/external-id/migrate-to-xtap-v2-api) (Public) to migrate the legacy policy to new supported XTAP schema

- Contact Cross Tenant Experience Team (xtenantex@microsoft.com) or for live site issues work with TA to raise ICM to the [IAM Services \ Cross Tenant Experience Team](https://portal.microsofticm.com/imp/v3/incidents/search/advanced?serviceCategories=null&services=5&teams=94585)


### **Found invalid target for Applications" error when adding application to Cross-Tenant Access Settings**

* Scenario: Customer is trying to [Cross-tenant access settings - Microsoft Entra External ID | Microsoft Learn](https://learn.microsoft.com/entra/external-id/cross-tenant-access-settings-b2b-collaboration) and receives the error "Found invalid target for applications"

   Example:

   *    ![image.png](/.attachments/image-754525a8-0c06-428e-9b50-ec02b17d04d6.png =500x)

* Solution: As per [Cross-tenant access settings - Microsoft Entra External ID | Microsoft Learn](https://learn.microsoft.com/entra/external-id/cross-tenant-access-settings-b2b-collaboration#add-the-microsoft-admin-portals-app-to-b2b-collaboration) and [ICM 420600078](https://portal.microsofticm.com/imp/v3/incidents/details/420600078) the only valid app that can be added via GUI is the "Office 365" app today.  If admin wishes to add a different app to their XTAP policy they must do so via Graph Explorer.  See [TSG: Example of adding new appid to xtap policy via graph explorer](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/527944/Azure-AD-B2B-Cross-Tenant-Access-Policy-(XTAP)?anchor=example-of-adding-new-appid-to-xtap-policy-via-graph-explorer)

### **AADSTS900144: The request body must contain the following parameter: 'id_token'**

**Scenario**

If the resource tenant has a Terms of Use policy , the error `AADSTS900144: The request body must contain the following parameter: 'id_token'` may be seen by end user at URL `https://login.microsoftonline.com/common/federation/Oauth2ClaimsProvider`.

**Cause**

For Terms of Use to function the inbound and outbound cross-tenant access policies must allow this app `d52792f4-ba38-424d-8140-ada5b883f293 (AAD Terms of Use)` .  Otherwise, the silent call by Terms of Use to get an id_token will fail and in the Fiddler\HAR you will see the XTAP error being returned like the following:

```
AADSTS500212: The user's administrator has set an outbound access policy that does not allow access to the resource tenant. Trace ID: 35180eef-95c8-48de-879c-3ac11b541c00 Correlation ID: d47a4164-1e91-43d6-ad92-7d0c6427bf82 Timestamp: 2025-11-17 13:15:45Z
```

**Solution**


Add app `d52792f4-ba38-424d-8140-ada5b883f293 (AAD Terms of Use)` [to the allowed apps for the inbound and outbound cross-tenant access policies](https://learn.microsoft.com/en-us/entra/external-id/cross-tenant-access-settings-b2b-collaboration) (depending on which one is blocking per the error). 

You can also find this as root cause by querying the correlation ID in the XTAP error using ASC Auth Troubleshooter ->Expert view -> Diagnostic logs -> XTAP tab and finding the JSON XTAP policy for resource tenant and home tenant and determining which one has a block applied to Applications.

<hr>

## ASC Authentication Troubleshooter Analysis

<span
style="color:black;font-weight:bold;background-color:yellow">
   **NOTE:** Watch demo recording [Troubleshoot XTAP failure with Auth Troubleshooter](https://microsoft.sharepoint.com/:v:/t/Community-ExternalIdentityManagement/EUVBZ9m53gJMk6iTQyb9eH8BtMh2oSdGuyW_v6MTxY7Lmg?e=ay1Wwc) of these steps to follow along
</span>

You can use the ASC Tenant Explorer's Auth Troubleshooter experience to diagnose the inbound and outbound XTAP policy that caused a XTAP failure.

1. Request the customer send screenshot or copy to clipboard the XTAP failure's troubleshooting info shown in yellow below:

   ![image.png](/.attachments/image-6c9e24dd-e3b2-451e-a9c4-f61033495d4a.png)

1. Open **ASC Tenant Explorer** (of home or resource tenant)
2. Sign-Ins blade -> Diagnostics tab -> **Go to the new sign-in troubleshooting experience**

      ![image.png](/.attachments/image-87c58e70-b2e5-47a8-8fbc-b21379a987a0.png)

3. Choose **Troubleshoot** under Search by Correlation ID or Request ID

   ![image.png](/.attachments/image-ebd8027d-d77e-4509-a925-927a6ec10331.png)

4. From the customer facing "Access is blocked by the organization" error.  Take the Correlation ID and Timestamp and fill out Do you have = Correlation ID, What is the ID = paste the customer provided Correlation ID, Timestamp = customer provided Timestamp
5. Choose What was the result of the sign-in = **Show All Activity**

   ![image.png](/.attachments/image-286fcbd1-dfbc-4d7b-b151-b64ab92833ee.png)

6. Choose **Next**
7. The results should show the final error to be **NotAllowedByInboundPolicyTenant** or **NotAllowedByOutboundPolicyTenant**.  Select this log entry and allow ASC to run diagnosis
8. From Expert View, Review the XTAP tab to analyze the **Resource Tenant XTAP policy (for NotAllowedByInboundPolicyTenant errors)** or the **Home Tenant XTAP policy (for NotAllowedByOutboundPolicyTenant)** to understand why the policy blocked the signin.

   ![image.png](/.attachments/image-af6ddbec-edee-4d9b-acff-93d57550a51d.png)

9. <span
style="color:black;font-weight:bold;background-color:yellow">
   **NOTE:** Watch demo recording [Troubleshoot XTAP failure with Auth Troubleshooter](https://microsoft.sharepoint.com/:v:/t/Community-ExternalIdentityManagement/EUVBZ9m53gJMk6iTQyb9eH8BtMh2oSdGuyW_v6MTxY7Lmg?e=ay1Wwc) of these steps to follow along
</span>

11. If customer is trying to add an Inbound or Outbound Application block or allow list, the XTAP UX only supports adding by either customer owned app ID, or via the friendly name Office365.  If the customer wishes to add a Microsoft app ID not available via the UX they need to do this via Graph API and Graph Explorer today.

### Example of adding new appID to XTAP policy via Graph Explorer
**Scenario:** In this example, the customer wishes to **allow** only the `Office365` app suite, and the Azure Portal appID `c44b4083-3bb0-49c1-b47d-974e53cbdf3c` to their tenant's inbound XTAP policy for their partner tenant `abc12345-5ead-468c-a6ae-048e103d57f0`.  The Azure Portal app ID cannot be added via the XTAP portal interface today so customer must do this via Graph Explorer

**Steps:** <span
style="color:black;font-weight:bold;background-color:yellow">
   **[Watch demo recording of below steps](https://microsoft.sharepoint.com/:v:/t/Community-ExternalIdentityManagement/Eat9cvASWVBNvIz0OkrDv3UBpnIUeSN8FTwfxgldrRKGDw?e=hyrqSo)** 
</span>

1. Open Graph Explorer [Graph Explorer | Try Microsoft Graph APIs - Microsoft Graph](https://developer.microsoft.com/en-us/graph/graph-explorer) and sign in with tenant Global Administrator
2. Run a request to **GET** `https://graph.microsoft.com/beta/policies/crossTenantAccessPolicy/partners/abc12345-5ead-468c-a6ae-048e103d57f0?$select=b2bCollaborationInbound` , replacing partner tenant ID with the partner you wish to modify inbound XTAP policy for.
3. Review the response section to verify the current b2bCollaborationInbound policy is returned.  It should look something like the following:

   ```json
   {
    "@odata.context": "https://graph.microsoft.com/beta/$metadata#policies/crossTenantAccessPolicy/partners(b2bCollaborationInbound)/$entity",
    "b2bCollaborationInbound": {
        "usersAndGroups": {
            "accessType": "allowed",
            "targets": [
                {
                    "target": "AllUsers",
                    "targetType": "user"
                }
            ]
        },
        "applications": {
            "accessType": "allowed",
            "targets": [
                {
                    "target": "Office365",
                    "targetType": "application"
                }
            ]
        }
    }
   }


4. Copy the entire response section result, and paste it in the top half of Graph Explorer labelled the Request Body
5. In the Request Body section you have populated, locate the `applications` section, and the list of `target` apps.
6. Add a new target app to the list by adding  a comma after the existing target app and adding a new app to the list.  In this example we have added the Azure Portal appID `c44b4083-3bb0-49c1-b47d-974e53cbdf3c` to the list of allowed target apps.  

   It now looks like this:

   ```json
   {
    "@odata.context": "https://graph.microsoft.com/beta/$metadata#policies/crossTenantAccessPolicy/partners(b2bCollaborationInbound)/$entity",
    "b2bCollaborationInbound": {
        "usersAndGroups": {
            "accessType": "allowed",
            "targets": [
                {
                    "target": "AllUsers",
                    "targetType": "user"
                }
            ]
        },
        "applications": {
            "accessType": "allowed",
            "targets": [
                {
                    "target": "Office365",
                    "targetType": "application"
                },
                {
                    "target": "c44b4083-3bb0-49c1-b47d-974e53cbdf3c",
                    "targetType": "application"
                }
            ]
        }
    }
   }

7. When our new policy looks good, change the Graph Explorer request type from `GET` to `PATCH` as we will be saving our updates to the policy.  And then click RUN to update the policy
8. If all is successful, the Graph Explorer response should show a 204 response code

   ![image.png](/.attachments/image-e40eaf5d-635f-4099-a00e-9541c997b1b3.png =600x)

9. Browsing back to the Azure Portal's XTAP inbound policy applications list, should now show the Azure Portal app was added successfully.

   ![image.png](/.attachments/image-7240003e-6df3-4857-b6bb-f3d74b65cc8e.png =500x)



## Azure Support Center XTAP Policy Review
With Azure Support Center, support engineers can query the following Graph Endpoints in ASC's Graph Explorer to review the configured XTAP inbound and outbound policies.


|**Endpoint**| **Public Doc**  | **Description** | **Example** |
|--|--|--|--|
|/policies/crossTenantAccessPolicy  | [Link](https://learn.microsoft.com/graph/api/crosstenantaccesspolicy-list-partners?view=graph-rest-beta&tabs=http) | Read the base policy in the directory for cross-tenant access settings.  |
|/policies/crossTenantAccessPolicy/default  |[Link](https://learn.microsoft.com/graph/api/crosstenantaccesspolicyconfigurationdefault-get?view=graph-rest-beta&tabs=http)  | Read the default configuration defined for inbound and outbound settings of Azure AD B2B collaboration and B2B direct connect. | ![image.png](/.attachments/image-a499dee9-7286-4c7d-93bd-8d175689b608.png) |
|   
/policies/crossTenantAccessPolicy/partners?$select=tenantId&$expand=identitySynchronization| [Link](https://learn.microsoft.com/graph/api/crosstenantaccesspolicy-list-partners?view=graph-rest-beta&tabs=http) |Read a list of all partner configurations within a cross-tenant access policy.  |  ![image.png](/.attachments/image-95be72b8-5e47-4c04-bec1-a2f657cebc0d.png) |
| /policies/crossTenantAccessPolicy/partners/{id}?expand=identitySynchronization| [Link](https://learn.microsoft.com/graph/api/crosstenantaccesspolicyconfigurationpartner-get?view=graph-rest-beta&tabs=http) |Read the properties and relationships of a partner-specific configuration.  Note: replace {id} with the external tenantID of the partner. | ![image.png](/.attachments/image-c1138d20-90ac-487d-8d65-42ab395e7dd4.png) |



# CrossTenantAccessPolicy element

| Property        | Type          | Description                                                                                                                                                                                                                                                                                          |
|-----------------|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Version         | String        | The string version of the specific policy. Mandatory, must be equal to 1 for now.                                                                                                                                                                                                                    |
| LastModified    | String        | String representation of last modification timestamp. String representation of last modification timestamp. Recommended format [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601) yyyy-MM-ddTHH:mm:ssZ. In general, any format supported by String to DateTime conversion inside .Net will work fine. |
| TenantGroup     | TenantGroup[] | Collection of TenantGroup entries. Every tenant group aggregates all the tenants, which have the same level of trust by the given company. It is required to have at least one entry in the collection.                                                                                              |
| SupportedClouds | String[]      | Enumerates identifiers of Microsoft clouds, which are allowed for collaboration per company policies.                                                                                                                                                                                                |


## TenantGroup element

| Property        | Type     | Description                                                                                                                                                                                                                                                                                                                                                                                                       |
|-----------------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Id              | String   | Contains a unique identifier (GUID) given to this tenant group upon its creation. Primary use: a reference to the tenant group from other place, such as Substrate XTAP extension (a.k.a. M365 Authorization policy), Conditional Access policy, etc. When policy gets uploaded in a form of JSON blob through PowerShell cmdlet or otherwise, API will auto-generate ID for any tenant group that omits the one. |
| DisplayName     | String   | Contains a short display name associated with given tenant group                                                                                                                                                                                                                                                                                                                                                  |
| Tenants         | String[] | Collection of tenant Context IDs, for which below described level of trust is applied. It is required to have at least one entry in the collection. See available keywords that can be specified on this collection in the below section.                                                                                                                                                                         |
| FromMyTenancy[] | Array    | Container of outbound rules applied to identities owned by the company holding the policy. Multiple entries can to prescribe rules constrained via provided conditions.                                                                                                                                                                                                                                           |
| ToMyTenancy[]   | Array    | Container of inbound rules applied to identities owned by tenants referenced by Tenants[] collection. Multiple entries can to prescribe rules constrained via provided conditions.                                                                                                                                                                                                                                |
| FromMyDevices[] | Array    | Container of outbound rules applied to devices owned by the company holding the policy.                                                                                                                                                                                                                                                                                                                           |


## FromMyTenancy element

| Property                     | Type     | Description                                                                                                                                                                                                                                                                                                                                                                             |
|------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| AllowAccess                  | Boolean? | Specifies whether or not members of given category can acquire security access tokens targeting tenants referred by Tenants collection (also controls ability for members to receive and accept B2B invites coming from specified tenants and actually use them).                                                                                                                       |
| AllowNativeFederation        | Boolean? | When set into false, this tenant will turn off Native Federation, prohibiting their users to access other tenants as Native Identities. When set into true, enabled Native Federation flow in its outbound direction. For Native federation flow to work, both inbound policy on resource tenant, and outbound policy on home tenant should configure AllowNativeFederation into true.  |
| AllowCrossCloudTeamsMeetings | Boolean? | Special case for cross-cloud Teams scenario.                                                                                                                                                            |
| Targets                      | Class    | Condition applied to the rule. Specifies to whom the rule applies, through enumeration of local identities and local security groups. OR expression is implied between all the supported lists of members, so if any list is satisfied, evaluation of Targets is considered as successful. If not configured, Targets refer to entire tenant population regardless of group membership. |
| Applications                 | String[] | Condition applied to the rule. Collection of client (token requestors) and resource (token audiences) application identifiers, for which this section must apply. If the client or resource in a request matches any identifier in this rule, the rule applies. If not configured, rule refers to all applications without exceptions. Special keywords (such as Office365) are supported.                                                                          |
| Devices                      | String   | Condition applied to the rule. OData filter applied to device attributes, please refer to below chapter for more details.                                                                                                                                                                                                                                                               |

## ToMyTenancy element

| Property                         | Type     | Description                                                                                                                                                                                                                                                                                                                                                                                             |
|----------------------------------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| AllowAccess                      | Boolean? | Specifies whether or not members of referenced companies to acquire tokens targeting tenant that holds the policy (also controls an ability of home members to send B2B invitations to be mentioned companies). If this is set to FALSE, none of the remaining knobs available on the section do apply. No more than a single entry with no Include/Exclude conditions may co-exist on a TenantGroup.      |
| AllowNativeFederation            | Boolean? | Specifies whether Native Federation flow (see chapter below) is enabled or not.NativeFederation simplifies x-tenant access, whileitrequiresa symmetrical consent on the home tenant side. In order for Native Federation flow to work,AllowAccessmust also be set into true.                                                                                                                     |
| ExternalUserProfile              | Int?     | Defines a desired mode enforced for usage of external user profiles, more details are in the section down below.                                                                                                                                                                                                                                                                                        |
| AllowCrossCloudTeamsMeetings     | Boolean? | Special case for cross-cloud Teams scenario.                                                                                                        |
| AcceptMFA                        | Boolean? | When set into true, MFA claim acquired inside home tenant will be trusted and accepted by the resource one. This trust is not anyhow limited to a particular MFA method used. Later on (with server side support to carry over MFA method information) fine grained controls will be supported.                                                                                                         |
| AcceptCompliantDevice            | Boolean? | When set into true, "dvc_cmp" claim available from external token/session will be honored by given company tenant.                                                                                                                                                                                                                                                                                      |
| AcceptLocation                   | Boolean? | When set into true, Resource Tenant will trust Home Tenants trusted locations                                                                                                                                                                                                                                                                                                                           |
| AcceptHybridAzure-ADJoinedDevice | Boolean? | When set into true, "dvc_dmjd" claim from external token/session will be honored by given company tenant.                                                                                                                                                                                                                                                                                               |
| AllowServiceProvider             | Boolean? | When set into true, this enables CSP access for a technician coming from a trusted cloud service provider tenant.                                                                                                                                                                                                                                                                                       |
| Targets                          | Class    | Condition applied to the rule. Specifies to whom the rule applies, through enumeration of foreign identities and foreign security groups, when known. OR expression is implied between all the supported lists of members, so if any list is satisfied, evaluation of Targets is considered as successful. If not configured, Targets refer to entire tenant population regardless of group membership. |
| Applications                     | String[] | Condition applied to the rule. Collection of client (token requestors) and resource (token audiences) application identifiers, for which this section must apply. If the client or resource in a request matches any identifier in this rule, the rule applies. If not configured, rule refers to all applications without exceptions. Special keywords (such as Office365) are supported. |



# ICM escalations

Follow the normal ICM creation process for when you have B2B related issues. See the steps in Microsoft Entra B2B: 
[Azure AD B2B - Overview](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183938/Azure-AD-B2B)

If the issue is with configuring cross tenant access settings via Azure portal or MS Graph API, use this ICM path: **IAM Services  Cross tenant experiences**

Only if the issue is UX related and originating from a specific blade within Azure portal, then use the owning team in ICM to engage appropriate team. Please find the spreadsheet showing ownership and ICM team names of various UX blades here: aka.ms/microsoft_aad_iam/bladelookup

(Please don't use **Entra - Management Admin UX** as the one team in ICM to escalate any issue within the Azure portal)

# Supportability documentation

## External documentation

- Overview: [Cross-tenant access overview - Microsoft Entra External ID | Microsoft Learn](https://learn.microsoft.com/entra/external-id/cross-tenant-access-overview)

- How to configure: [Cross-tenant access settings - Microsoft Entra External ID | Microsoft Learn](https://learn.microsoft.com/entra/external-id/cross-tenant-access-settings-b2b-collaboration)

- Using the MS Graph API: [Cross-tenant access settings API overview - Microsoft Graph beta | Microsoft Learn](https://learn.microsoft.com/graph/api/resources/crosstenantaccesspolicy-overview?view=graph-rest-beta)

- See how users are collaborating with other organizations: [Cross-tenant access activity workbook - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/entra/identity/monitoring-health/workbook-cross-tenant-access-activity)



## Training sessions and Deep Dives

### Deep Dive: 19579 - Azure Active Directory Cross Tenant Access Policy intro and overview session

1. [Login](https://cloudacademy.com/login/) to Cloud Academy (now QA) and click **Log in to your company workspace**.
2. In the *Company subdomain* field, type `Microsoft`, then click **Continue**.
3. Launch the [Deep Dive: 19579 - Azure Active Directory Cross Tenant Access Policy Intro and Overview Session](https://aka.ms/AAf1lmr) course.


### Deep Dive: 19579 - Azure Active Directory Cross Tenant Access Policy review and troubleshooting session

1. [Login](https://cloudacademy.com/login/) to Cloud Academy (now QA) and click **Log in to your company workspace**.
2. In the *Company subdomain* field, type `Microsoft`, then click **Continue**.
3. Launch the [Deep Dive: 19579 - Azure Active Directory Cross Tenant Access Policy Intro and Overview Session | QA Platform](https://platform.qa.com/resource/deep-dive-19579-azure-active-directory-cross-tenant-access-policy-intro-and-overview-session-1854/) course.

### Brownbag Recording
<span
style="color:black;font-weight:bold;background-color:yellow">
   **NOTE:** Watch demo recording [Troubleshoot XTAP failure with Auth Troubleshooter](https://microsoft.sharepoint.com/:v:/t/Community-ExternalIdentityManagement/EUVBZ9m53gJMk6iTQyb9eH8BtMh2oSdGuyW_v6MTxY7Lmg?e=ay1Wwc) of these steps to follow along
</span>
