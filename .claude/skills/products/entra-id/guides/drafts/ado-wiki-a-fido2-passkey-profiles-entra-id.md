---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Passkey Profiles in Entra ID"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/FIDO2%20passkeys/FIDO2:%20Passkey%20Profiles%20in%20Entra%20ID"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:  
- cw.AAD
- cw.AAD-Authentication
- cw.AzureAD
- cw.Azure-AD
- cw.AAD-Workflow
- cw.Passwordless
---
:::template /.templates/Shared/findAuthorContributor.md
:::

:::template /.templates/Shared/MBIInfo.md
:::


[[_TOC_]]

# Compliance note

This wiki contains test/lab data only.

___

# Feature Overview

Microsoft Entra ID now supports **Passkey Profiles**, enabling organizations to create authentication policies tailored to groups. These profiles are compatible with third-party synced passkeys such as **iCloud Keychain**, **Google Password Manager**, **Bitwarden**, **1Password** and more.

Administrators can assign passkey profiles to high-privilege users who rely on FIPS-compliant keys for enhanced protection. Organizations can also selectively deploy Microsoft Authenticator to targeted groups, allowing for a flexible and phased rollout of passkey-based authentication.

**Public Preview Scope at Microsoft Ignite 2025**

During the Public Preview, the Passkey (FIDO2) policy will support three passkey profiles, including:

- **Default Passkey Profile**  This reflects the settings from the legacy policy at the time of conversion and cannot be deleted.

- **Two additional profiles**  Fully customizable and able to be deleted.

## Profile Behavior and Evaluation Logic

- Each profile supports group targeting, simplifying policy application across large user sets.

- Users can belong to multiple profiles. When a user is in scope of more than one profile, each profile is evaluated.

- If any profile allows the passkey the user is trying to register or use, access will be granted.

> **Example**: If Alice is included in Profile 1 (which allows Authenticator App passkeys) and Profile 2 (which blocks them), she will still be allowed to use Authenticator App passkeys because Profile 1 permits it.

## Attestation and Compatibility

As part of this update in November 2025, if **Enforce attestation** is disabled, Entra ID will accept any WebAuthn-compliant passkey provider that uses the following attestation statements: 

- `none`

- `tpm` 

- `packed` (AttCA type only) 

- Custom attestation formats  32 characters

- `packed` (self) is expected to be deployed from early January 2026 to early February 2026 

This will allow a wider range of security keys and passkey providers to be accepted for registration and authentication in Microsoft Entra ID. To compare this upcoming update with the current behavior, refer to [Microsoft Entra ID attestation for FIDO2 security key vendors](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-fido2-hardware-vendor#attestation-requirements).

## Deprecation of Duplicate Properties in Passkey Policy

Starting October 2027, Microsoft will deprecate the`isAttestationEnforced`and`keyRestrictions`properties from the existing [fido2AuthenticationMethodConfiguration](https://learn.microsoft.com/graph/api/resources/fido2authenticationmethodconfiguration?view=graph-rest-1.0) API schema. 

Corresponding properties have been added with the latest update to the passkey policy API schema, which introduces support for granular group-based configurations with passkey profiles. During the deprecation period,`isAttestationEnforced`and`keyRestrictions`will be kept in sync with their counterparts`attestationEnforcement`and`keyRestrictions`within the default passkey profile. 

Customers are encouraged to review their current configuration and update any custom automations and third-party integrations to support the new schema. They should also notify their admins about this change and update internal documentation.

> **Note**: The original retirement date of November 2027 was never communicated and has been moved to October 2027.

## Opt-In and Reversion Mechanics

- **Prior to General Availability (GA)**, organizations with the Passkey (FIDO2) policy enabled could opt in to passkey profiles via a persistent banner in the Microsoft Entra admin portal.

- **General Availability for synced passkeys and passkey profiles begins rolling out on March 17, 2026**. As GA rolls out, organizations with the Passkey (FIDO2) policy enabled are automatically migrated to passkey profiles.

- **Preview reversion and optout mechanisms are not available at GA**. After GA rollout begins, organizations can no longer revert to legacy Passkey (FIDO2) policy behavior by deleting nondefault profiles or returning to the Default profile configuration.

___

# Use Case Scenarios

**Example 1: Managing High-Privilege Accounts** 

A user can be part of multiple passkey profiles. If a passkey meets the requirements of any one profile assigned to the user, it will be allowed. Entra checks each profile for a match. If none match, the passkey is denied. There is no specific order in how profiles are evaluated.

| **Passkey Profile** | **Target Group(s)** | **Configuration** |
|-----|-----|-----|
| **FIPS-compliant security keys** | IT admins, Executives, Engineering | **Passkey Types:** Device-bound<br>- **Attestation Enforcement:** `Enabled`<br>- **Key Restrictions:** `Allow`<br>- **AAGUIDs:** FIPS key model 1, FIPS key model 2 |
| **All device-bound passkeys** | Marketing, Engineering, Finance, HR, Legal, Customer service | **Passkey Types:** Device-bound<br>- **Attestation Enforcement:** `Enabled`<br>- **Key Restrictions:** `None` |

 **Example 2: Targeted rollout of Passkeys in Microsoft Authenticator** 

This setup allows organizations to control which users can use Microsoft Authenticator for passkeys.

| **Passkey Profile** | **Target Group(s)** | **Configuration** |
|-----|-----|-----|
| **All device-bound passkeys (excluding Microsoft Authenticator)** | All users | **Passkey Types:** Device-bound<br>- **Attestation Enforcement:** `Enabled`<br>- **Key Restrictions:** `Block`<br>- **AAGUIDs:** MSFT Authenticator iOS, MSFT Authenticator Android |
| **Passkeys in Microsoft Authenticator** | Pilot group 1, Pilot group 2 | **Passkey Types:** Device-bound **Attestation Enforcement:** Enabled **Key Restrictions:** Allow **AAGUIDs:** MSFT Authenticator iOS, MSFT Authenticator Android |

___

# Known Issues

## 1. Save Failure When Target Lacks Passkey Profile Link

Once the Passkey Profile schema is enabled by opting in to the preview, attempts to **Save** the policy will fail if a *Target* is added, which is not linked to a Passkey Profile.

![NoPKProfile](/.attachments/AAD-Authentication/2248756/NoPKProfile.jpg)

This error appears in the Portal when **Save** fails.

| Text | Image |
|-----|-----|
| **Saving authentication methods**<br>An error occurred while trying to save the policy.<br>Help me troubleshoot | ![SavePolicyFail](/.attachments/AAD-Authentication/2248756/SavePolicyFail.jpg) |

A browser trace show this response.

```json
{
    "responses": [
        {
            "id": "1b694405-5bcf-4f09-a4f5-0285496d66d4",
            "status": 400,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": {
                "error": {
                    "code": "badRequest",
                    "message": "Include conditions are missing passkey profile targets",
                    "innerError": {
                        "message": "Include conditions are missing passkey profile targets",
                        "date": "2025-10-14T19:14:35",
                        "request-id": "7ca569a6-d65d-47a4-b4f4-1a9df0346f50",
                        "client-request-id": "cead45eb-8e9d-40a0-85dd-3404508ece93"
                    }
                }
            }
        }
    ]
}
```

**Solution**: Before clicking **Save**, the admin must link the targeted group to a passkey profile.

![GroupPKLinnk](/.attachments/AAD-Authentication/2248756/GroupPKLinnk.jpg)

___

# Prerequisites

- Global Administrator
- Authentication Policy Administrator

___

# General Availability: Passkey Profiles and Registration Campaign Behavior

Starting **March 2026**, Microsoft Entra ID will introduce **passkey profiles** and **synced passkeys** will become **General Availability (GA)**. This update enables administrators to opt in to the new passkey profiles experience, which supports group based configuration and introduces a new `passkeyType` property. The `passkeyType` property allows profiles to explicitly allow device bound passkeys, synced passkeys, or both, based on attestation configuration.

Message Center post [MC1221452](https://admin.cloud.microsoft/?#/MessageCenter/:/messages/MC1221452) was published on January 22, 2026.

**Important**: Only tenants that already have Passkeys (FIDO2) enabled are affected by this update.
 
## Rollout and auto enablement timing
 
### Worldwide
 
- GA rollout begins early March 2026 and is expected to complete by **late March 2026**

- Auto enablement for tenants that have not opted in begins **early April 2026** and is expected to complete by **late May 2026**
 
### GCC, GCC High, DoD
 
- GA rollout begins **early April 2026** and is expected to complete by **late April 2026**

- Auto enablement begins **early June 2026** and is expected to complete by **late June 2026**
 
Passkey profiles and synced passkeys will remain **opt in until the auto enablement period begins**. Opt-out will not be allowed.

Customers that currently have their **Passkey (FIDO2) settings** authentication method policy **turned off** will **not** be impacted by this rollout. 
 
### What happens if customers do not opt in

During the auto enablement window, tenants that have not manually opted in to passkey profiles will be automatically migrated, with the following changes applied:
 
- Existing **Passkey (FIDO2)** configurations will be moved into the **Default passkey profile**

- The `passkeyType` property is populated based on current attestation settings:

    - If **attestation enforcement is enabled**, `passkeyType` is set to device bound only

    - If **attestation enforcement is disabled**, `passkeyType` is set to device bound and synced

- Existing key restrictions and user targeting are preserved
 
Migration is phased based on policy size. Tenants with policies within supported limits migrate earlier, while larger policies migrate later in the rollout window. Tenants will receive **at least two week'** notice via an **M365 Message Center** post with a tenant specific migration date.
 
## Registration campaign behavior (Microsoft managed campaigns only)
 
Registration campaign behavior doesn't change at GA or at manual opt in. It changes only when passkey profiles are auto enabled.
 
Upon auto enablement:
 
- If **synced passkeys are enabled** in one of the profiles, AND

- The registration campaign is set to **Microsoft managed**
 
Then:
 
- The campaign's targeted authentication method updates from **Microsoft Authenticator** to **passkeys**

- Default user targeting updates from voice or SMS users to **all MFA capable users**

- The settings **Limited number of snoozes** and **Days allowed to snooze** will no longer be configurable. These will be set to allow unlimited snoozes with a one-day reminder cadence.
 
When this occurs, some users who previously completed registration through Microsoft Authenticator may be prompted to set up a passkey during sign in or registration flows.
 
### Not impacted
 
- Registration campaigns set to **Disabled**

- Campaigns set to **Enabled** where admins explicitly continue targeting Microsoft Authenticator
 
### Why this matters
 
The new passkey profiles model provides clearer and more flexible control over passkey usage while preserving existing security posture and policy intent. However, during passkey profiles auto enablement, tenants that both allow synced passkeys and use Microsoft managed registration campaigns may see changes to user registration behavior.
 
Organizations that want to avoid having users who have registered Microsoft Authenticator from having to register a passkey should review both their **Passkey (FIDO2) policy** and registration campaign configuration to avoid unexpected user impact when auto enablement rolls out.
 
## Recommended actions
 
Organizations that want settings different from the migration defaults should opt in to passkey profiles before April 2026 and configure the **Default passkey profile** with their preferred `passkeyType` values.
 
In preparation for this change, organizations should:
 
- Review the **Passkey (FIDO2)** authentication methods policy to confirm group assignments and attestation state.

    - If Attestation is enabled, synced passkeys will not be available if they wait for Microsoft to enable passkey profiles.

    - If Attestation is disabled, both device-based and synced passkeys will be available if they wait for Microsoft to enable passkey profiles.

- Validate registration and sign in with representative user groups such as frontline workers, privileged administrators, and developers.

- Audit the existing **AAGUID allow or deny lists** to confirm that key restrictions continue to meet compliance and vendor requirements after migration.

- Update help content and runbooks so help desk and users understand any changes to passkey behavior or availability.
 
Organizations that want the registration campaign to continue using Microsoft Authenticator or do not want Microsoft managed campaigns to target passkeys:
 
- Set the registration campaign to Enabled and keep Microsoft Authenticator selected

- Or set the campaign to Disabled
 
## Resources 

- [How to Enable Passkey (FIDO2) Profiles in Microsoft Entra ID (Preview)](https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-authentication-passkey-profiles)

- [How to Enable Synced Passkeys (FIDO2) in Microsoft Entra ID (Preview)](https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-authentication-synced-passkeys)

- [Synced passkeys FAQs](https://learn.microsoft.com/en-us/entra/identity/authentication/synced-passkey-faq)

- [How to run a registration campaign to set up Microsoft Authenticator](https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-mfa-registration-campaign)


___

# Entra ID Passkey Profiles Entering Public Preview

On June 17, 2025 Message Center post [MC1097225](https://admin.microsoft.com/Adminportal/Home?#/MessageCenter/:/messages/MC1097225) was released informing customers that Microsoft Entra ID will introduce passkey profiles in public preview in In November 2025. This will expand the FIDO2 authentication methods policy to support group-based configuration control. The rollout begins **mid-October** and completes by **mid-November**, with **no admin action required beforehand**. This update informs customers that they can enable granular management of passkey settings and introduces new API schema changes.

- **Group-based control:** Apply different passkey configurations per user group. 
  - Example: Allow specific FIDO2 key models for Group A; enable Microsoft Authenticator passkeys for Group B.
- **Schema behavior:** 
  - Changes take effect if modified via Azure or Entra portal during preview.
  - Graph API or third-party tools will retain the old schema until General Availability.
- **Expanded compatibility**: Any WebAuthn-compliant key or provider will be accepted when attestation is disabled.
- **Admin Center location**: Microsoft 365 admin center > Home > Security > Authentication methods > Passkey (FIDO2) settings.
- **Preparation tips**: Review current configurations, notify admins, and update documentation.

If customers edit the **Passkey (FIDO2)** policy using the portal before General Availability (GA), the preview experience will be automatically enabled for your organization.

- To keep using the legacy policy, manage it through Graph API.

- If your customer modified their Passkey (FIDO2) policy in the portal their tenant is automatically moved to the preview schema. If they are not allowed to use preview code in their production environment, they can revert to the old Profile using the [Revert to the Old UX (API)](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2248756&anchor=revert-to-the-old-ux-(api)) option. However, any further changes to the policy must be performed using Microsoft Graph API or Microsoft Graph PowerShell. This option is available until GA.

**Note**: Once General Availability (GA) rollout for passkey profiles and synced passkeys begins (MarchApril 2026, depending on cloud), preview rollback or optout is no longer supported.

___

# Policy Size Limit

When configuring Passkey Profiles in the Entra Portal, you may encounter a failure with the following error:

| Image | Text |
|-----|-----|
| ![PolicySizeError](/.attachments/AAD-Authentication/2248756/PolicySizeError.jpg) | **Saving authentication methods**<br>The policy did not save successfully. |

A browser trace reveals a **400 Bad Request** during the PATCH call to the Microsoft Graph API, indicating the policy size exceeded the allowed limit:

```json
{
    "error": {
        "code": "badRequest",
        "message": "Persistence of policy failed with error: Policy size is larger than allowed by 52 bytes. Please change your targeting to fewer groups or settings and try again.",
        "innerError": {
            "message": "Persistence of policy failed with error: Policy size is larger than allowed by 52 bytes. Please change your targeting to fewer groups or settings and try again.",
            "date": "2025-09-30T15:30:37",
            "request-id": "bee5367e-e35e-42ef-8748-c413e151216b",
            "client-request-id": "bee5367e-e35e-42ef-8748-c413e151216b"
        }
    }
}
```

**Quick Fix**: Reduce the number of targeted groups or simplify settings to stay within the 20KB policy size limit.

# Audit Logs

Starting in the AprilMay 2026 timeframe, successful **Authentication Methods Policy Update** and **Authentication Methods Policy Reset** audit events no longer include the entire authentication methods policy in **Modified Properties**. Instead, the audit log now shows only the specific settings that changed, with their corresponding **Old Values** and **New Values**. The audit log activity name and trigger behavior remain unchanged. This is a formattingonly change.

- **Service**: Authentication Methods  
- **Category**: PolicyManagement
- **Activity**: Authentication Methods Policy Update OR Authentication Methods Policy Reset

An examination of **Modified Properties** shows the following:

| Target | Property Name | Old Value | New Value |
|-----|-----|-----|-----|
|  | AuthenticationMethodsPolicy | \"passkeyProfiles\":[{\"id\":\"00000000-0000-0000-0000-000000000001\",\"name\":\"Default passkey profile\",\"passkeyTypes\":1,\"attestationEnforcement\":1,\"keyRestrictions\":{\"isEnforced\":true,\"enforcementType\":0,\"aaGuids\":[\"73bb0cd4-e502-49b8-9c6f-b59445bf720b\",\"de1e552d-db1d-4423-a619-566b625cdc84\",\"90a3ccdf-635c-4729-a248-9b709135078f\"]}},{\"id\":\"032c8781-d687-48d8-ba7d-457518f349b6\",\"name\":\"Allow Synced Passkeys\",\"passkeyTypes\":3,\"attestationEnforcement\":0,\"keyRestrictions\":{\"isEnforced\":true,\"enforcementType\":0,\"aaGuids\":[\"dd4ec289-e01d-41c9-bb89-70fa845d4bf2\",\"d548826e-79b4-db40-a3d8-11116f7e8349\",\"ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4\",\"fbfc3007-154e-4ecc-8c0b-6e020557d7bd\"]}},{\"id\":\"c2450bed-0ebd-48ca-9c74-3dedbaada48f\",\"name\":\"Windows Passkey Profile\",\"passkeyTypes\":1,\"attestationEnforcement\":0,\"keyRestrictions\":{\"isEnforced\":true,\"enforcementType\":0,\"aaGuids\":[\"08987058-cadc-4b81-b6e1-30de50dcbe96\",\"9ddd1817-af5a-4672-a2b9-3e3dd95000a9\",\"6028b017-b1d4-4c02-b4b3-afcdafc96bb2\"]}}], | \"passkeyProfiles\":[{\"id\":\"00000000-0000-0000-0000-000000000001\",\"name\":\"Default passkey profile\",\"passkeyTypes\":1,\"attestationEnforcement\":1,\"keyRestrictions\":{\"isEnforced\":true,\"enforcementType\":0,\"aaGuids\":[\"73bb0cd4-e502-49b8-9c6f-b59445bf720b\",\"de1e552d-db1d-4423-a619-566b625cdc84\",\"90a3ccdf-635c-4729-a248-9b709135078f\"]}},{\"id\":\"032c8781-d687-48d8-ba7d-457518f349b6\",\"name\":\"Allow Synced Passkeys\",\"passkeyTypes\":3,\"attestationEnforcement\":0,\"keyRestrictions\":{\"isEnforced\":true,\"enforcementType\":0,\"aaGuids\":[\"dd4ec289-e01d-41c9-bb89-70fa845d4bf2\",\"d548826e-79b4-db40-a3d8-11116f7e8349\",\"ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4\",\"fbfc3007-154e-4ecc-8c0b-6e020557d7bd\",\"**bada5566-a7aa-401f-bd96-45619a55120d**\"]}},{\"id\":\"c2450bed-0ebd-48ca-9c74-3dedbaada48f\",\"name\":\"Windows Passkey Profile\",\"passkeyTypes\":1,\"attestationEnforcement\":0,\"keyRestrictions\":{\"isEnforced\":true,\"enforcementType\":0,\"aaGuids\":[\"08987058-cadc-4b81-b6e1-30de50dcbe96\",\"9ddd1817-af5a-4672-a2b9-3e3dd95000a9\",\"6028b017-b1d4-4c02-b4b3-afcdafc96bb2\"]}}], |

## Policy Size Limit Events

When this error occurs, two audit events are recorded:

- **Service**: `Authentication Methods`

- **Category**: `PolicyManagement`

- **Activity**: `Authentication Methods Policy Update`

- **Status**: `clientError`

- **Status reason**: `Persistence of policy failed with error: Policy size is larger than allowed by 52 bytes. Please change your targeting to fewer groups or settings and try again.`

**Note**: **Modified Properties** does not indicate which specific authentication method policy triggered the error.

**Current Limit**

- The Default User Credential Policy in Entra acts as a container for all authentication method policies.
- This container has a 20KB size limit, which includes all nested configurations.

**Upcoming Change**

- The *Default User Credential Policy* will retain its 20KB limit.
- The **Passkey (FIDO2)** authentication method policy will soon be decoupled from the default container.
- Once independent, the Passkey policy will have its own 20KB limit, allowing more flexibility in configuration.

___

## How to Check Policy Size

To determine the current size of your Default User Credential Policy:

1. Call the [Get authenticationMethodsPolicy](https://learn.microsoft.com/en-us/graph/api/authenticationmethodspolicy-get?view=graph-rest-1.0&tabs=http) Microsoft Graph API.
2. Save the JSON response as a .txt file.
3. Right-click the file > **Properties** > Check the file size.

The file size approximates the policy size stored in Entra.

**API Details**

- **Method**: `Get`

- **URL**: `https://graph.microsoft.com/beta/policies/authenticationMethodsPolicy`

Reference Sizes

| Scenario | Approx. Size |
|-----|-----|
| Base passkey policy (no changes) | 1.44KB |
| Target with 1 applied passkey profile | 0.23KB |
| Target with 5 applied passkey profiles | 0.4KB |
| Passkey profile without AAGUIDs | 0.4KB |

___

# Policy Management

## Public Preview: Opt-In & Opt-Out Guide

During Public Preview, the Entra portal shows a banner with **Opt-In** and **Opt-Out** capabilities.

### Opt-In (Entra Portal)

1. Sign in as a **Global Administrator** or **Authentication Policy Administrator** (required to manage Authentication Methods).

2. Click *Opt-in to public preview* link in the banner.

- This updates the banner and shows the **Edit default passkey profile** button.

- **Note**: No actual policy change happens yet.

![Opt-In](/.attachments/AAD-Authentication/2248756/Opt-In.jpg)

3. From the updated banner, click **Edit the default passkey profile** and select at least one **Target type** to complete the opt-in.

![Edit-to-Opt-In](/.attachments/AAD-Authentication/2248756/Edit-to-Opt-In.jpg)

4. Click **Edit the default passkey profile**, choose a **Target type**, and click **Save** to finalize the opt-in.

![Opt-In-SelectTarget](/.attachments/AAD-Authentication/2248756/Opt-In-SelectTarget.jpg)

### Opt-In (API)

Follow the guide [here](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2248756&anchor=enable-the-passkey-auth-methods-policy-(api)).

### Opt-Out (Entra Portal)

Clicking **Opt-out of public preview** presents a warning that:

- All passkey profiles and targets will be removed.

- The policy will revert to the default profile.

- Synced passkeys will be disabled.

![Opt-Out-Warn](/.attachments/AAD-Authentication/2248756/Opt-Out-Warn.jpg)

### Opt-Out (API)

- **Method**: `PATCH`

- **URL**: `https://graph.microsoft.com/beta/policies/authenticationMethodsPolicy/authenticationMethodConfigurations/fido2`

- **Request Body**:

```json
{
  "id": "Fido2",
  "state": "enabled",
  "isSelfServiceRegistrationAllowed": true,
  "excludeTargets": [],
  "includeTargets": [
    {
      "targetType": "group",
      "id": "all_users",
      "isRegistrationRequired": false
    }
  ],
  "passkeyProfiles": []
}
```

See [Revert to the Old UX (API)](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=2248756&anchor=edit-passkey-profiles-(entra-portal)) for more information.

___

## Edit Passkey Profiles (Entra Portal)

The updated **Passkeys (FIDO2)** policy includes two main tabs:

**Enable and Target**

- The **Registration** column is now a **Passkey Profiles** drop-down.
- For each group, you can choose:
    - **All**
    - **Default passkey profile**
    - Any additional passkey profiles that have been created.

   ![Enable-n-target](/.attachments/AAD-Authentication/2248756/Enable-n-target.jpg)

**Configure**

- **General** settings

    - **Allow self-service set-up** is enabled by default.

    This maps to the `"isSelfServiceRegistrationAllowed"` property (`true` or `false`).
     
    It controls whether users can register new FIDO2 security keys.
     
- **Passkey Profiles**
     
    This is a list of passkey profiles in the tenant. 
       
    - **Default passkey profile** is always present and cannot be deleted or renamed.
    - Other passkey profile can be deleted only if they are not assigned to any group in the **Enable and Target** tab.
       
    - The **Default passkey profile** aligns with the global passkey authentication methods policy.
     
       - Changes to this profile will also update the global policy.
       - Eventually, the global policy will be retired in favor of the default passkey profile.


   ![Configure](/.attachments/AAD-Authentication/2248756/Configure.jpg)
   
    - **Add a Passkey Profile**
   
    Click **Add Profile** to open the **Add Passkey Profile** fly-out.
    - **Name** the profile.
   
     - **Enforce attestation** (optional): Verifies the authenticity of the security key or provider during registration.
   
    - **Target types**
      
       - **Device-bound**: Private key stays on the device (e.g., FIDO2 key, Microsoft Authenticator, Windows device).
         
          - **Synced**: Key stored with a service (e.g., BitWarden, 1Password, iCloud Keychain, Google Password Manager).
            
            - *Note*: **Synced** does not support attestation.
            - If **Enforce attestation** is enabled later, **Synced** will be removed from target options.
              - At the API level, the attestation setting name changed from `"isAttestationEnforced"` (which used`true` or `false`) to `"attestationEnforcement"` (which now uses `registrationOnly` or `disabled`).
            
            | Enforce Attestation Checked | Enforce Attestation Unchecked |
            |-----|-----|
            | ![NoSync](/.attachments/AAD-Authentication/2248756/NoSync.jpg) | ![BothTypes](/.attachments/AAD-Authentication/2248756/BothTypes.jpg) |
       
    - **Target specific passkeys**: Allows admins to **Allow** or **Block** specific models/providers.
   
    ![AddAAGUID](/.attachments/AAD-Authentication/2248756/AddAAGUID.jpg)
   
   **Add AAGUID Options**
   
   When adding AAGUIDs, youll see three options:
   
   - **Windows Hello**
   
   | First-party AAGUID | Device Key Type | Description |
   |-----|-----|-----|
   | 08987058-cadc-4b81-b6e1-30de50dcbe96 | Windows Hello Hardware Authenticator | Private key stored in a hardware based TPM |
   | 9ddd1817-af5a-4672-a2b9-3e3dd95000a9 | Windows Hello VBS Hardware Authenticator | Virtualization-based Security (VBS) uses hardware virtualization and the Windows hypervisor to store private keys in the host machine's TPM |
   | 6028b017-b1d4-4c02-b4b3-afcdafc96bb2 | Windows Hello Software Authenticator | Private key stored in a software based TPM |
   
   - **Microsoft Authenticator**
   
   | First-party AAGUID | Device Key Type | Description |
   |-----|-----|-----|
   | 90a3ccdf-635c-4729-a248-9b709135078f | iOS Microsoft Authenticator | Private key stored in Microsoft Authenticator for iOS |
   | de1e552d-db1d-4423-a619-566b625cdc84 | Android Microsoft Authenticator | Private key stored in Microsoft Authenticator for Android |
   
   - **Enter AAGUID**
     
     - Admins can enter AAGUIDs one at a time.
     
     - After each entry, click **Save**, then **Add AAGUID** again to add more.

___

## Microsoft Graph API

### Permissions (API)

1. Go to [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer).

2. Sign into your admin account by clicking on the person icon in the top right corner.

3.  Under **Modify permissions**, make sure youve consented to the `Policy.Read.All` and `Policy.ReadWrite.AuthenticationMethod` permissions.

#### View the Passkey (FIDO2) Policy (API)

Running this query returns both the legacy Passkey (FIDO2) policy and any configured passkey profiles.

The **Default passkey profile** is designed to match the global passkey authentication methods policy. If you change the default profile, the global policy will update the same way, and vice versa. Eventually, the global policy will be phased out in favor of the default passkey profile.

Inside the default profile, there is a new property called `"passkeyTypes"`, which controls what types of passkeys are allowed. The options are `"deviceBound"` and `"synced"`.

Also, the attestation setting has been updated. Previously called `"isAttestationEnforced"` with values of `"true"` or `"false"`, it is now `"attestationEnforcement"` with values `"registrationOnly"` and `"disabled"`. 

**API Details:**

- **Method**: `GET`

- **URL**: `https://graph.microsoft.com/beta/policies/authenticationMethodsPolicy/authenticationMethodConfigurations/fido2`

  Each passkey profile that exists, will be returned with an ID in the response. The ID is required to apply it to a target or to modify that passkey profile later. 

___

#### Enable the Passkey auth methods policy (API)

If the policy isn't enabled already, perform this PATCH operation to enable the passkey auth methods policy.

**API Details:**

- **Method**: `PATCH`

- **URL**: `https://graph.microsoft.com/beta/policies/authenticationMethodsPolicy/authenticationMethodConfigurations/fido2`

- **Request Body**:

```json
{
    "@odata.type": "#microsoft.graph.fido2AuthenticationMethodConfiguration",
    "state": "enabled"
} 
```

#### Create a New Passkey Profile (API)

To create a new passkey profile, perform a PATCH operation on the passkeyProfiles collection and add a new passkey profile object.

In this example, a new passkey profile is being created with key restrictions that only allow the Windows Hello AAGUIDs.

<span style="color:red;">**IMPORTANT**</span>: If other passkey profiles already exist, make sure to include them in the request body. If an existing profile is left out, the API will assume the admin wants to delete it.

**API Details:**

- **Method**: `PATCH`

- **URL**: `https://graph.microsoft.com/beta/policies/authenticationMethodsPolicy/authenticationMethodConfigurations/fido2`

- **Request Body**:

```json
{ 
    "@odata.type": "#microsoft.graph.fido2AuthenticationMethodConfiguration", 
    "passkeyProfiles": [ 
        { 
            "id": "00000000-0000-0000-0000-000000000001", // Default passkey profile 
            "name": "Default passkey profile", 
            "passkeyTypes": "deviceBound", 
            "attestationEnforcement": "disabled", 
            "keyRestrictions": { 
                "isEnforced": false, 
                "enforcementType": "allow", 
                "aaGuids": [] 
            } 
        }, 
 { 
            "name": "EPOW passkey profile", // New passkey profile 
            "passkeyTypes": "deviceBound", 
            "attestationEnforcement": "registrationOnly", 
            "keyRestrictions": { 
                "isEnforced": true, 
                "enforcementType": "allow", 
                "aaGuids": [ 
                    "08987058-cadc-4b81-b6e1-30de50dcbe96", 
                    "9ddd1817-af5a-4672-a2b9-3e3dd95000a9", 
                    "6028b017-b1d4-4c02-b4b3-afcdafc96bb2" 
                ] 
            } 
        } 
    ] 
} 
```
___

#### Apply a Passkey Profile to a Group Target (API)

To apply a passkey profile to a target in the `includeTarget` collection, perform a PATCH operation.

This operation performed below scopes the new passkey profile to all users.

**API Details:**

- **Method**: `PATCH`

- **URL**: `https://graph.microsoft.com/beta/policies/authenticationMethodsPolicy/authenticationMethodConfigurations/fido2`

- **Request Body**:

```json
{ 
    "@odata.type": "#microsoft.graph.fido2AuthenticationMethodConfiguration", 
    "includeTargets": [ 
        { 
            "targetType": "group", 
            "id": "all_users", 
            "isRegistrationRequired": false, 
            "allowedPasskeyProfiles": [ 
                "00000000-0000-0000-0000-000000000001", 
                "84c712c1-8688-4679-8546-a603ff82da46" // Apply new passkey profile 
            ] 
        } 
    ] 
} 
```

___

#### Create a New Group Target (API)

You can assign different passkey profiles to multiple targets, each with its own scope. To add a new target to the `includeTarget` collection, use a PATCH operation. In this example, a new target is created for a specific user group that is only allowed to use a new passkey profile requiring Windows Hello passkeys.

**API Details:**

- **Method**: `PATCH`

- **URL**: `https://graph.microsoft.com/beta/policies/authenticationMethodsPolicy/authenticationMethodConfigurations/fido2`

- **Request Body**:

```json
{ 
    "@odata.type": "#microsoft.graph.fido2AuthenticationMethodConfiguration", 
    "includeTargets": [ 
        { 
            "targetType": "group", 
            "id": "all_users", 
            "isRegistrationRequired": false, 
            "allowedPasskeyProfiles": [ 
                "00000000-0000-0000-0000-000000000001", 
                "84c712c1-8688-4679-8546-a603ff82da46" 
            ] 
        }, 
        { 
            "targetType": "group", 
            "id": "58506270-8123-4827-b928-19706a5f6ac5", // Scoped to a group 
            "isRegistrationRequired": false, 
            "allowedPasskeyProfiles": [ 
                "84c712c1-8688-4679-8546-a603ff82da46" // Scoped to the new profile 
            ] 
        } 
    ] 
} 
```
___

#### Modifying a Passkey Profile (API)

To modify an existing passkey profile, perform a PATCH operation on the `passkeyProfiles` collection and directly modify the contents of an existing passkey profile.

In this example, the new passkey profile is being renamed.

**Note**: It is not possible to rename the default passkey profile. 

**API Details:**

- **Method**: `PATCH`

- **URL**: `https://graph.microsoft.com/beta/policies/authenticationMethodsPolicy/authenticationMethodConfigurations/fido2`

- **Request Body**:

```json
{ 
    "@odata.type": "#microsoft.graph.fido2AuthenticationMethodConfiguration", 
    "passkeyProfiles": [ 
        { 
            "id": "00000000-0000-0000-0000-000000000001", 
            "name": "Default passkey profile", 
            "passkeyTypes": "deviceBound", 
            "attestationEnforcement": "registrationOnly", 
            "keyRestrictions": { 
                "isEnforced": false, 
                "enforcementType": "allow", 
                "aaGuids": [] 
            } 
        }, 
 { 
            "id": "84c712c1-8688-4679-8546-a603ff82da46", 
            "name": "My renamed passkey profile", // Rename passkey profile 
            "passkeyTypes": "deviceBound", 
            "attestationEnforcement": "registrationOnly", 
            "keyRestrictions": { 
                "isEnforced": true, 
                "enforcementType": "allow", 
                "aaGuids": [ 
                    "de1e552d-db1d-4423-a619-566b625cdc84", 
                    "90a3ccdf-635c-4729-a248-9b709135078f"  
                ] 
            } 
        } 
    ] 
} 
```

___

#### Add Another Passkey Profile (API)

To add another passkey profile to those that already exist, perform a PATCH operation on the passkeyProfiles collection and add an additional passkey profile object.

In this example, a new passkey profile is being created with key restrictions that allow `deviceBound` and `synced` AAGUIDs.

<span style="color:red;">**IMPORTANT**</span>: If other passkey profiles already exist, make sure to include them in the request body. If an existing profile is left out, the API will assume the admin wants to delete it.

Once this new profile has been added, another PATCH call will be required to the `includeTarget` collection to have the new passkey profile apply to a target. 

**API Details:**

- **Method**: `PATCH`

- **URL**: `https://graph.microsoft.com/beta/policies/authenticationMethodsPolicy/authenticationMethodConfigurations/fido2`

- **Request Body**:

```json
{ 
    "@odata.type": "#microsoft.graph.fido2AuthenticationMethodConfiguration", 
    "passkeyProfiles": [ 
        { 
            "id": "00000000-0000-0000-0000-000000000001", // Default passkey profile 
            "name": "Default passkey profile", 
            "passkeyTypes": "deviceBound", 
            "attestationEnforcement": "disabled", 
            "keyRestrictions": { 
                "isEnforced": false, 
                "enforcementType": "allow", 
                "aaGuids": [] 
            } 
        }, 
        { 
            "name": "EPOW passkey profile", // New passkey profile 
            "passkeyTypes": "deviceBound", 
            "attestationEnforcement": "registrationOnly", 
            "keyRestrictions": { 
                "isEnforced": true, 
                "enforcementType": "allow", 
                "aaGuids": [ 
                    "08987058-cadc-4b81-b6e1-30de50dcbe96", 
                    "9ddd1817-af5a-4672-a2b9-3e3dd95000a9", 
                    "6028b017-b1d4-4c02-b4b3-afcdafc96bb2" 
                ] 
            } 
        },
        {
            "id": "fe8346da-8aba-41de-af77-0783f30c768a",
            "name": "Allowed Synched Passkeys",
            "passkeyTypes": "deviceBound,synced",
            "attestationEnforcement": "disabled",
            "keyRestrictions": {
                "isEnforced": true,
                "enforcementType": "allow",
                "aaGuids": [
                    "dd4ec289-e01d-41c9-bb89-70fa845d4bf2",
                    "d548826e-79b4-db40-a3d8-11116f7e8349",
                    "ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4",
                    "fbfc3007-154e-4ecc-8c0b-6e020557d7bd"
                ]
            }
        }
    ] 
} 
```

___

#### Delete a Passkey Profile (API)

To delete a passkey profile, perform a PATCH operation. In the request body, simply leave out the profile you want to remove from the `passkeyProfiles` collection.

Keep in mind the following:

- The default passkey profile cannot be deleted.
- If a profile is currently assigned to a target, it must be removed from that target before it can be deleted.

____

#### Revert to the Old UX (API)

While Passkey Profiles is in preview, these steps can be used to revert a tenant back to the old Passkey policy. However, any further changes to the policy must be performed using Microsoft Graph API or Microsoft Graph PowerShell. This option is available until GA.

<span style="color: red;">**Important**</span>: These steps require deleting all additional passkey profiles created besides the Default passkey profile. The Default passkey profile settings will populate the **Passkey (FIDO2)** policy when the preview is disabled.

1. Perform a GET operation to view the current state of the policy.

**API Details:**

- **Method**: `GET`

- **URL**: `https://graph.microsoft.com/beta/policies/authenticationMethodsPolicy/authenticationMethodConfigurations/fido2`

2. Copy the entire response and update the following fields only: 

- Set `passkeyProfiles` to `null`. 

- Remove `allowedPasskeyProfiles` from `includeTargets`

3. Perform a PATCH operation to view the current state of the policy.

- **Method**: `PATCH`

- **URL**: `https://graph.microsoft.com/beta/policies/authenticationMethodsPolicy/authenticationMethodConfigurations/fido2`

- **Request Body**:

**SAMPLE OLD**:

```json
{... 
    "includeTargets": [ 
        { 
            "targetType": "group", 
            "id": "all_users", 
            "isRegistrationRequired": false, 
            "allowedPasskeyProfiles": [ // remove 
                "00000000-0000-0000-0000-000000000001" 
            ] 
        } 
    ], 
    "passkeyProfiles": [ // set to null 
        { 
            "id": "00000000-0000-0000-0000-000000000001", 
            "name": "Default passkey profile", 
            "passkeyTypes": "deviceBound", 
            "attestationEnforcement": "disabled", 
            "keyRestrictions": { 
                "isEnforced": true, 
                "enforcementType": "allow", 
                "aaGuids": [ 
                    "6028b017-b1d4-4c02-b4b3-afcdafc96bb2", 
                ] 
            } 
        } 
    ] 
}
```

**SAMPLE NEW**:

```json
{... 
    "includeTargets": [ 
        { 
            "targetType": "group", 
            "id": "all_users", 
            "isRegistrationRequired": false 
        } 
    ], 
    "passkeyProfiles": null 
}
```
___

## Microsoft Graph PowerShell



___

# Troubleshooting

Verify which passkey profiles the user is in scope of:

## Azure Support Center (ASC)

### Audit logs (ASC)

Policy CRUD operations:


### Passkey (FIDO2) Policy

Work item request [3324460](https://identitydivision.visualstudio.com/Engineering/_workitems/edit/3324460) was created to rename the **FIDO2 Security Key** authentication method policy **Passkey (FIDO2)** and extend it to support Passkey Profiles.

See [Graph Explorer (ASC)]() to view passkey profiles while this change is in development.

1. In ASC, select **Sign-Ins**.

2. Select **Authentication Methods** > **Passkey (FIDO2)**

Once it is complete, it should look like this mockup.

![ASCPasskeyProfiles](/.attachments/AAD-Authentication/2248756/ASCPasskeyProfiles.jpg)

### Graph Explorer (ASC)

**Query Url**: `/users/{user-objectID-or-UPN}/authentication/policy`

**Version**: `beta`

1. Copy the contents of the **fido2** section into a JSON editor and format it.

2. Look at all entries under the `"PasskeyProfiles"` section.

___

# ICM Path

## API Issues

The change fails using the portal and the API.

- **Owning Service**: Credential Configuration Endpoint

- **Owning Team**: Credentials Management

## Portal Issues

The change works using API but fails in the portal only. SE should collect the error returned by the MsGraph API when an action is performed in the Auth Method Policy UX.

- **Owning Service**: Credential Enforcement and Provisioning

- **Owning Team**: Credential Recovery

___

# Training

## Deep Dive 204685 - Passkey Profiles and Synced Passkeys in Entra ID

**Format**: Self-paced eLearning

**Duration**: 57 minutes

**Audience**: Cloud Identity Support Communities **Strong Auth Methods**

**Tool Availability**: November 18, 2025

**Training Completion**: November 18, 2025

**Region**: All regions

**Course Location**: [QA platform](https://aka.ms/AAyebu9)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.