---
source: ado-wiki
sourceRef: "/Features/Dependencies/Authentication/SSO: AADJ, HAADJ and Provisioning Policy SSO"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FDependencies%2FAuthentication%2FSSO%3A%20AADJ%2C%20HAADJ%20and%20Provisioning%20Policy%20SSO"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# **Single Sign On**
Please find below the different topics related to Windows 365 and SSO. The following information is as I understand it and based on feature recordings.

**1. SSO to onprem resources, eg. file server from an AADJ CPC**
In this scenario we are talking about accessing a file share or internal domain resource without having to perform authentication. With HAADJ CPCs, the machines are domain joined, they have a TGT, and any access to a domain resource will be granted with no additional prompts, but with AADJ machines with line of sight with the domain network, these are not having the onprem TGT, so they cannot access that resource without authenticating the user first.

You can spot the TGT status in **dsregcmd /status** in the SSO State section.

With AADJ CPCs, the onprem TGT will say **No**
To overcome this we need to create the Kerberos Object on the domain.
This can be done following the instructions on this page:
[SSO - Create Kerberos Object](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-security-key-on-premises#install-the-azureadhybridauthenticationmanagement-module)

**2. Provisioning Policy SSO for HAADJ CPCs**
With AADJ CPCs, the SSO feature you can enable in the provisioning policy is straight forward. You sign in the Remote Desktop Client and then the access to your AADJ CloudPC is done as SSO, being a cloud machine with Auth done at Entra ID side.

With HAADJ machines the situation is different because the Windows Logon is not done against Entra ID but against the domain. Your Entra ID login token cannot be used straightforward to do the windows login on the HAADJ without an additional change: **Kerberos Object** explained at point 1. This is the reason we are checking for it in the HAADJ ANC. Without this Object present, the SSO to your HAADJ CPC will not work because the domain cannot authenticate the user with the Entra ID token. The trust relationship is not established to use the cloud token without the Kerb object and the partial TGT is not converted to Full TGT.

**3. SSO Stopped working despite the cx has created the Kerb object in the past**
This is an isolated scenario but may appear if the customer has any cleanup rules in place, deleting the Kerb Object components from the Domain Controllers container or from the Users Container.

The Kerberos Object has **two components**:
- Users Container Object (in Users container)
- Domain Controllers Container Object (in Domain Controllers container)

When running the **Get-AzureAdKerberosServer** command line to verify the object, you should see **both** objects listed with values and complete information.
