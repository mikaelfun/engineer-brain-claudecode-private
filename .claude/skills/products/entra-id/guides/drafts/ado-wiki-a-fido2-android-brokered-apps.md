---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Authentication Android for Brokered Native Apps"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29/FIDO2%20passkeys/FIDO2%3A%20Authentication%20Android%20for%20Brokered%20Native%20Apps"
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
- cw.Webauthn
- cw.FIDO2
- cw.Passkey
- cw.comm-strauth
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::


[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AzureAD](/Tags/AzureAD) [Azure-AD](/Tags/Azure%2DAD) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Passwordless](/Tags/Passwordless) [Webauthn](/Tags/Webauthn) [FIDO2](/Tags/FIDO2) [Passkey](/Tags/Passkey)         

[[_TOC_]]

# Compliance note

This wiki contains test/lab data only.

# FIDO2 Native Application Support for Android With Authentication Broker

Microsoft applications provide native support for FIDO2 authentication for all users who have an authentication broker installed for their operating system. FIDO2 authentication is also supported in preview for third-party applications using the authentication broker.

The following tables lists which authentication brokers are supported for different operating systems.

![img](/.attachments/AAD-Authentication/204646/BrokerTable.png)

1. On macOS, the [Microsoft Enterprise Single Sign On (SSO) plug-in](https://learn.microsoft.com/en-us/entra/identity-platform/apple-sso-plugin) is required to enable Company Portal as an authentication broker. Devices that run macOS must meet SSO plug-in requirements, including enrollment in mobile device management. For FIDO2 authentication, make sure that you run the latest version of native applications.

2. Native application support for FIDO2 security keys on Android version 13 and lower is in development.

   If a user installed an authentication broker, they can choose to sign in with a security key when they access an application such as Outlook. They're redirected to sign in with FIDO2, and redirected back to Outlook as a signed in user after successful authentication.











