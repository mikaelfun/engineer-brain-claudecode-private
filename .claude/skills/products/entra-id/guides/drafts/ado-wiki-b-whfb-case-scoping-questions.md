---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/WHfB: Case scoping questions"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FHello%20for%20Business%2FWHfB%3A%20Case%20scoping%20questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# WHfB Quick Start Checklist

## What

- Production environment or Non-Prod?
- Is the customer facing issues with windows hello for business provisioning or authentication?
- Which Entra join deployment method is implemented (e.g. Entra join, Entra Hybrid join)?
- Which Windows Hello for Business Trust type is used (e.g. Cloud-only, Entra Hybrid join with key, certificate or cloud kerberos trust or Onprem with key or certificate trust)?
- Is the user affected joined to a federated or managed domain?
- What is the client Windows OS version? (Example: Win 10 1909 or Server 2016 1909 xxx for server get the build num)

## When

- When did the failures start? If this is a new deployment then it has never worked.
- Is the issue reproducible at will or intermittent?

## Where

- Does the issue occur when the device is offline or online?
- Is corpnet access and internet access both available, or one of the two or neither?

## Windows Hello (Convenience PIN) or Windows Hello for Business?

**Convenience Pin:** You can check and see if convenience PIN is enabled. If so, this is not compatible with WHFB or Hybrid AAD Join. The registry is the only place to check and know for sure as this can be set in the Registry, Domain GPO, or Local GPO.

- GPO: Computer Configuration\Administrative Templates\System\Logon\Turn on convenience PIN sign-in
- REG: HKLM\Software\Policies\Microsoft\Windows\System\AllowDomainPINLogon

If the customer has registered for WHFB on this Win10 PC before you can check the following reg path to see if any accounts have been registered under this WHFB credential provider:

- HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Authentication\Credential Providers\{D6886603-9D2F-4EB2-B667-1971041FA96B}

A Windows Hello gesture sign-in to AAD must be done though a valid Windows Hello Business deployment. A Convenience Pin sign-in (Windows Hello gesture only) which includes PIN, and Biometrics sign-in to the PC is not compatible with WHFB or with Hybrid AAD Join.

**SAP routing for Convenience PIN issues:** Windows\Windows 10\<Windows 10 edition>, Category: Windows Security Technologies\Biometric, Passwordless Authentication, SSO, and Windows Hello

Using `DSREGCMD /STATUS` you can check the `NgcSet` status under the User State section. If Yes this indicates the user has configured a NGC/WHFB Key on this device.

## Additional scoping questions for MDM scenarios

1. Is the client Intune Managed?
2. Is this an Intune Autopilot scenario?
3. Does the Issue happen outside of the Intune Autopilot scenario?
   - If NO → engage Intune Support for TS of the Intune Autopilot scenario
   - If YES → focus efforts on the non-Intune manual setup scenario

## Case Handling when Intune is used as MDM

- **Intune** - If the case starts with Intune support due to use of Intune in the scenario, then Intune support should continue to own the case and collab/AR as needed.
- If there is NO Intune at all, then for Hybrid and Cloud Scenarios AAD Auth support should own the case.
- For On-prem Only scenarios where there is NO Azure AD Tenant Involved at all then Windows DS should be engaged on a collab/AR as needed for PKI Cert, Kerberos Auth, GPOs, and other AD DS issues.
