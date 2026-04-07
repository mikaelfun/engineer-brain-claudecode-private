---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/Authentication and Access/Blocking token roaming in VDI machines"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FAuthentication%20and%20Access%2FBlocking%20token%20roaming%20in%20VDI%20machines"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Feature overview

Previously, customers could move tokens from one VDI machine to another to facilitate Single-Sign-on (SSO). Microsoft has long provided guidance in documentation to **not do this**. With this release enforcement is now applied in the backend. This impacts some users trying to sign in with refresh tokens that were not intended for that VDI machine. Users will not be blocked from logging in, but they will need to re-complete their MFA second factor.

## Scenarios (using Outlook as an example)

This change only impacts **refresh tokens that are device bound**. RTs from machines that are not HAADJ or AADJ are not impacted by this change. PRTs are also not impacted by this change.

**Scenario 1:** Hybrid AAD joined machine (HAADJ) or AAD joined machine (AADJ) and user logs into virtual machine B with only single factor (logon session does not have MFA).
- When MFA is required by Outlook:
   1. User opens Outlook on machine A, signs-in and performs MFA.
   2. Token is roamed (not supported).
   3. User opens Outlook on machine B.
   4. Token is rejected and error is logged.
   5. Machine B's PRT is used silently to acquire new tokens. New token will not include an MFA flag.
   6. User will be prompted to complete MFA (not password) when launching an app.
   7. Prompt for completing MFA will only be for the first app (in this case Outlook) and not for subsequent apps.

- When MFA is NOT required by Outlook:
   1. User opens Outlook on machine A and signs-in.
   2. Token is roamed (not supported).
   3. User opens Outlook on machine B.
   4. Token is rejected and error is logged.
   5. Machine B's PRT is used silently to acquire new tokens.
   6. User will not receive an MFA prompt nor a password prompt.

**Scenario 2:** Hybrid AAD joined machine (HAADJ) or AAD joined machine (AADJ) and user logs into virtual machine B using MFA
- Both MFA required and MFA NOT required by Outlook:
   1. User opens Outlook on machine A, signs-in and performs MFA.
   2. Token is roamed (not supported).
   3. User opens Outlook on machine B.
   4. Token is rejected and error is logged.
   5. Machine B's PRT is used silently to acquire new tokens. New token will include MFA flag.
   6. User will not be prompted for first or second factors.

**Scenario 3:** Device is not AAD joined and user logs in with either single or multifactor.
- Not impacted by this change.

## Scenario Flowchart

The following chart assumes that there are 2 or more non-persistent VDI machines and that the customer is roaming tokens against our support statement.

```
Second device with roamed RT
  -> Devices HAADJ or AADJ?
     -> Not Joined -> Not Impacted
     -> Joined -> Resource requires MFA?
        -> Not Required -> PRT used, no MFA prompt
        -> Required -> MFA Completed during local device sign-in?
           -> Yes -> PRT used, no MFA prompt
           -> No -> User Prompted for MFA when opening first app
```

## Troubleshooting

A new error code has been created. This error will appear in both the **Azure sign-in logs** and the user's computer's Windows Event Viewer. The error will be under Applications and Services Logs/Microsoft/Windows/**AAD/Operational** in Event Viewer.

- Error=invalid_grant
- Error_codes=**1000504**
- Error_description=Request contains mismatched device ids (with non-PRT scope).

## Customer guidance

To avoid the additional MFA prompt, we recommend that customers enable [Microsoft Entra auth for RDP](https://learn.microsoft.com/en-us/azure/virtual-desktop/configure-single-sign-on#enable-microsoft-entra-authentication-for-rdp) and [enforce MFA](https://learn.microsoft.com/en-us/azure/virtual-desktop/set-up-mfa?tabs=avd).

If the customer is using the legacy MFA protocol they can also log into the local device with an NGC logon (face, smartcard, etc.). If they log into the device with MFA the user will not see another MFA prompt when opening apps (like Outlook).

## Customer ready support statement

> "As part of our ongoing commitment to enhancing security, Microsoft is incrementally rolling out an enforcement that prevents the roaming of token caches across VDI machines. This change ensures that authentication tokens cannot be reused across machines in ways that might bypass Conditional Access policies or multi-factor authentication (MFA) requirements.
>
> As a result, users who sign in to a VDI machine without MFA may be prompted for a second factor auth when launching their first app. This prompt will only occur once per session; subsequent apps will not require additional prompts."

## Case handling

This feature is supported by both **M365 Identity** and **Identity Security and Protection** communities. Please route the case based on the client application the issue is encountered with.

## Root Cause coding

Please code any cases the result from this change with this root cause: **/Root Cause - CID O365 Auth and Access/Sign-in to Office Apps/Token Roaming blocked in VDI**

## Regions

- Public
- Fairfax/Arlington - will come after public complete
- Gallatin/Mooncake - will come after public complete

## ICM escalations - Whitelist procedure

It is possible to temporarily exempt a customer from enforcement. To make this request please open an IcM to:

- Service: **Identity AuthN Client**
- Team: **Cloud Identity AuthN MSAL Objective C**

Please add following details to the ICM:

- Title: Request for KDFv1 exception
- Severity: 2.5
- **Include Tenant ID**

Attach the customer request email where they are acknowledging the risk. You can share the following template to customers.

**Email template**

```
Subject: Request for Temporary Exception: Roamed Refresh Token Blocking

Dear Microsoft Support,

We are requesting a temporary exception for Tenant [TenantId] from the rollout of roamed refresh token blocking due to the following: [Insert justification].

We acknowledge and accept the security risks associated with this exception, including the potential for a threat actor replaying a stolen signed refresh token from a different device.

We also understand that this exception is temporary and contingent upon our implementation of the mitigations provided by Microsoft.

Sincerely,

[Name and Title]

On behalf of [Customer Name]
```

## Supportability documentation

### Public documentation

[Device identity and desktop virtualization](https://learn.microsoft.com/en-us/entra/identity/devices/howto-device-identity-virtual-desktop-infrastructure#non-persistent-vdi)
