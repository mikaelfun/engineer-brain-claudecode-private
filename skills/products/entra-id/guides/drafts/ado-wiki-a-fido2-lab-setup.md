---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: How to build your lab"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29/FIDO2%20passkeys/FIDO2%3A%20How%20to%20build%20your%20lab"
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
--- 
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::


[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AzureAD](/Tags/AzureAD) [Azure-AD](/Tags/Azure%2DAD) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Passwordless](/Tags/Passwordless) [Webauthn](/Tags/Webauthn) [FIDO2](/Tags/FIDO2) [Passkey](/Tags/Passkey)         

[[_TOC_]]

# Why use IDmelon?

----

[IDmelon](https://idmelon.com) has a FIDO2 solution enables users to use their smartphone as a FIDO2 security key via an app.  

The overall solution involves installing the _pairing tool_ on the PC, the IDmelon app on the phone and pairing them together.  

The pairing tool creates a software-based USB FIDO2 key on the PC (visible in device manager). All CTAP2 interactions by the OS to the FIDO2 key result in push notifications sent to the phone paired to the machine. The user acknowledges requests within the IDmelon app and uses a pin or biometric gestures to either create credentials (makecredential) or sign in (getassertion) using already created credentials.  

A PC can be paired with just one phone at anytime.
But a phone can be paired with many PCs simultaneously.  

Here are the reasons why you should consider deploying it in your lab in addition to any FIDO2 hardware keys you may be using.

- Available for free use for both personal and enterprise (1-year free trial).
- Free trial for any enterprise for up to 5 keys (or 5 users with one key per user).
- Can be used on both Physical and Virtual machines.
- Can be used on Hyper-V based VMs for testing console based interactive logon where physical keys cannot be used.
- Can be used within any VM (Azure, Windows 365, Hyper-V etc) that is accessed via RDP using WebAuthn redirection.  

# Step 1: Setup IDmelon personal and provision a user credential for browser logon

----
**You can skip this section if you are not relying on IDmelon and have hardware FIDO2 keys.**

This section provides the simplest guidance for getting a FIDO2 credential provisioned via your smartphone.
This involves signing up for the free personal offering from IDmelon to create one key and provisioning the credentials required for your demo tenants.  

 [IDmelon personal quick start](https://docs.idmelon.com/docs/for_personal_users/quick_start/) offers a very good step by step guide.

You can provision more than one credential on the key. You can test the key using a demo site such as https://aka.ms/webauthntest  

Now you can visit the https://aka.ms/mysecurityinfo and logon as any account from your lab environment and [provision a FIDO2 credential](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-security-key#user-registration-and-management-of-fido2-security-keys) that will be stored on the IDmelon key you just enrolled for using the personal offering.

For using the FIDO2 credentials within a virtual machine via WebAuthn redirection over RDP, you should install the pairing tool on the RDP client side and pair it to your phone. You can also install it on any other physical or virtual machines where you want to test interactive logon. The phone can be paired with more than one PC.  

# Step 2: Enable interactive logon to Entra ID joined Windows PC

----

Enable [Windows 10 FIDO2 interactive logon](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-security-key-windows) using either registry or Intune specific guidance.  

This essentially involves enabling interactive logon to an Entra ID joined Windows PC using a previously provisioned credential (via the https://aka.ms/mysecurityinfo).  

Follow on to the next section to enable hybrid Entra ID joined devices for interactive logon and to ensure SSO to on-premises resources via Kerberos.  

# Step 3: Enable SSO to on-premises resources

----

This section will help ensure both interactive logon to a hybrid Entra ID joined PC and ensure Kerberos based SSO to on-premises resources from direct Entra ID joined and hybrid Entra ID joined devices.  

Enable [SSO to on premises](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-security-key-on-premises) to ensure kerberos based SSO to access on-premises resources.
