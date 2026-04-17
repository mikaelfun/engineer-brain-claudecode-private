---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/Azure AD Federated Certificate Based Auth For Azure Virtual Desktop"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FAzure%20AD%20Federated%20Certificate%20Based%20Auth%20For%20Azure%20Virtual%20Desktop"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-adfs
- cw.adfs troubleshooting
- cw.adfs cba
- SCIM Identity
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   


[[_TOC_]]

# Compliance note

This wiki contains test/lab data only.

# Summary

Smart card Authentication for Azure Virtual Desktop (AVD) is Generally Available as of August 16th, 2021.

ADFS customers can use [Azure AD Federated Certificate Based Authentication](https://docs.microsoft.com/en-us/azure/active-directory/authentication/active-directory-certificate-based-authentication-get-started) to perform smart card and user based certificate sign in to Azure AD when they connect to Azure Virtual Desktop host pools.

No new code is involved with any component that is used to make this solution work. However, it does require the configuration of numerous components, including the recently announced support of [Configure AD FS single sign-on for Azure Virtual Desktop](https://docs.microsoft.com/en-us/azure/virtual-desktop/configure-adfs-sso).

# Public documents

| Link | Description |
|-----|-----|
| [Signing in to Azure AD using smart cards now supported in Azure Virtual Desktop](https://techcommunity.microsoft.com/t5/azure-virtual-desktop/signing-in-to-azure-ad-using-smart-cards-now-supported-in-azure/m-p/2654209#M7671) | Public announcement that Azure Virtual Desktop now supports signing in to Azure AD using smart cards. |
| [Configure AD FS single sign-on for Azure Virtual Desktop](https://docs.microsoft.com/en-us/azure/virtual-desktop/configure-adfs-sso) | Configuring AVD service for SSO is optional. If this service is configured, the **issuer** and **serialnumber** claims for federated CBA must be configured on the *Microsoft Office 365 Identity Platform Worldwide* Relying Party Trust in AD FS, not on the *Windows Virtual Desktop ADFS Logon SSO* Relying Party Trust that gets created by the script that enabled AD FS single sign-on for Azure Virtual Desktop. |
| [KDC Proxy for Remote Access](https://syfuhs.net/kdc-proxy-for-remote-access) | Use this document to enable The Kerberos Key Distribution Proxy service to service Network Location Awareness (NLA) calls.<br><br><b>Note</b>: There is no public Microsoft document that covers the configuration as straight forward as this. Also, the `netsh http add sslcert ` command is not necessary if a Server Authentication certificate is already bound to TCP port 443. To determine this run `netsh http show sslcert ipport=0.0.0.0:443`. If a response shows `Certificate Hash` verify it is a Server Authentication certificate in the computer store. Otherwise, run the command. Once KDCProxy is configured, request new *Domain Controller Authentication* certificates on each domain controller, delete the old certificate and reboot the DC. Its unknown why this must be done but Kerberos tickets will not be issued until this is done as seen in two separate test labs. |
| [Configure a Kerberos Key Distribution Center proxy](https://docs.microsoft.com/en-us/azure/virtual-desktop/key-distribution-center-proxy) | Configure the Azure Virtual Device service to use the KDCProxy. |
| [Enabling CEP and CES for enrolling non-domain joined computers for certificates](https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/enabling-cep-and-ces-for-enrolling-non-domain-joined-computers/ba-p/397821) | If external clients not joined to the domain will be requesting user certificates or smart card certificates for connecting to the AVD host pool, the CES and CEP services will allow these requests to be serviced. This also covers how to configure the client to request certificates using CES and CEP services. Ensure issued certificates chain correctly by importing the root and issuing Certificate Authority (CA) Certificate into Trusted Root Certification Authorities and Intermediate Certification Authorities on the client.<br><br><b>Important</b>: This service <u>must not</u> be installed on a server that is a Certificate Authority. |
| [Configure the CDP and AIA Extensions on the CA](https://docs.microsoft.com/en-us/windows-server/networking/core-network-guide/cncg/server-certs/configure-the-cdp-and-aia-extensions-on-ca1) | Before certificates are issued to end users, configure a Certificate Revocation List Distribution Point (CDP) that is accessible from the Internet on the **Extensions** tab of the certificate authorities. It's critical that the certificate revocation list (CRL) appear on certificates issued to the end users, and that the URL is accessible from the Internet in order for Azure AD to support revocation. |
| [Configuring AD FS for user certificate authentication](https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/operations/configure-user-certificate-authentication)<br><br>[Azure Active Directory certificate-based authentication on iOS](https://docs.microsoft.com/en-us/azure/active-directory/authentication/active-directory-certificate-based-authentication-ios)<br><br>[Get started with certificate-based authentication in Azure Active Directory](https://docs.microsoft.com/en-us/azure/active-directory/authentication/active-directory-certificate-based-authentication-get-started) | These documents cover how to deploy the root and intermediate certificate authority certificates to Azure AD using Microsoft Graph PowerShell cmdlets.  They also cover how to include the `Issuer` and `Serial Number` AD FS claim rules to the *Windows Virtual Desktop ADFS Logon SSO* Relying Party Trust for ADFS to support federated Active Directory Certificate Based Authentication. |

# End-To-End Deployment Guide

The AVD support team has created an [end-to-end deployment guide](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pageID=510962) for enabling federated smart card based sign-in to Azure AD for Azure Virtual Desktop. 

# Using Smart Card Emulator

Using a user certificate would be far less complicated, but Microsoft Support Engineers can use the smart card emulator if needed.  This must too is not to be distributed to customers.

<span style="color:red">**CRITICAL**</span>: **The emulator <u>requires</u> the client run from the <u>Console</u> or Basic session, not from an RDP session. This can be done using Hyper-v Basic session or Logmein.**

1. Download the oldest version of the tool (6558.1.080229-1800) from `\\winsect\backup\Smartcard\Simulator`.
2. Download the latest copy of *CardUtil.exe* from here `\\winsect\backup\Smartcard\Simulator\Current\amd64\CardUtil.exe`
3. Turn on Test mode on your Windows 10 computer by running this command and rebooting the computer.  This needs to be done on the client and on the AVD host pool VMs.

`bcdedit -set TESTSIGNING ON`

4. Copy the 6558.1.080229-1800 folder to C:\temp on the client and the AVD VMs.
5. From an elevated command prompt run this command to create the *C:\MSCARD* folder:

`C:\temp\6558.1.080229-1800\scsiminstall.cmd`

**Important**: Two unsigned driver installation prompts will appear that must be Approved.

6. Add this registry value to the client and the AVD VMs.

`REG ADD "HKLM\SOFTWARE\Microsoft\Cryptography\Calais" /v AllowServiceAccessWithNoReaders /t REG_DWORD /d 0x1 /f`

7. Copy **CardUtil.exe** that was downloaded earlier into the root of the C:\MSCARD folder.
8. From an elevated command prompt run these commands and have it end with a reboot:

```cmd
cd \mscard
scsimsvc -create
shutdown -r -f -t 0
```

9. Sign-in to Console or Basic session.
10. Make sure the **Certificate Propagation** and **Start Smart** card service
11. From an elevated command prompt run these commands, make sure to replace *federateduser* in the commands below with the alias of the user:

**Note**: These commands must be run in a console or basic session or they will fail. 

```cmd
cd \mscard
vscctrl -listreaders
vscctrl -newreader
vscctrl -newcard federateduser
vscctrl -insertcard federateduser "Microsoft Smart Card Simulator 0"
cardutil /g
certutil -scinfo
```

# Support Boundaries

Support incidents will route to the Azure Virtual Desktop (AVD) team.

| Feature | Support Team | Support Area Path |
|-----|-----|-----|
| Azure Active Directory certificate-based authentication | [MSaaS AAD - Authentication Professional](https://msaas.support.microsoft.com/queue/dc834c65-9d09-e711-811f-002dd8151752) and [MSaaS AAD - Authentication Premier](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751) | Azure\Azure Active Directory\AD FS (Active Directory Federation Services) |
| AD FS | [MSaaS AAD - Authentication Professional](https://msaas.support.microsoft.com/queue/dc834c65-9d09-e711-811f-002dd8151752) and [MSaaS AAD - Authentication Premier](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751)<br><br>(everything is scripted) | Azure\Azure Active Directory\AD FS (Active Directory Federation Services) |
| Azure Virtual Desktop | [MSaaS WVD - Windows](https://msaas.support.microsoft.com/queue/2c933625-d2ec-e811-8145-00155d895b06) | Azure\Windows Virtual Desktop |
| KDCProxy/Kerberos | AD DS | Windows Servers\\\<Server Version>\\\<Server Version, all editions>\\\Active Directory<br><br><b>Example</b>: Windows Servers\Windows Server 2019\Windows Server 2019, all editions\Active Directory\LSASS high CPU, memory or performance on member and DC role computers |
| Certificate Authority and Certificate Enrollment Policy Web Service (CEP) and Certificate Enrollment Web Service (CES) | AD DS<br><br>Only if the certificate authority being used is Microsoft Certificate Authority. | Windows Servers\\\<Server Version>\\\<Server Version, all editions>\Certificates and Public Key Infrastructure\Active Directory Certificate Services (ADCS)<br><br><b>Example</b>: Windows Servers\Windows Server 2019, all editions\Windows Server 2019 Standard\Certificates and Public Key Infrastructure\Active Directory Certificate Services (ADCS) |

# Collaboration

## AVD Support Wiki

[ADFS with Smartcard](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/510960/ADFS-with-Smartcard)

## AVD Teams Swarming Channel

Identity engineers can submit Azure Virtual Desktop questions to the AVD [swarming channel](https://teams.microsoft.com/l/channel/19%3a89b918c47bfd4d57aeb9c5f2d21c860f%40thread.skype/Azure%2520Virtual%2520Desktop?groupId=78da20ea-7ee8-45d8-b758-ffd57ed57975&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47).

# Troubleshooting

If the Session Desktop prompts for a password credential, click **More choices** and select the Smart card credential that is registered, then enter the PIN.  Remove Forms based authenticating method from the External interface to skip this.

## KDCProxy

1. Enable **Kerberos-KDCProxy** \ **Operational** event logging.
2. Attempt an RDP connection using the [Windows Desktop client](https://docs.microsoft.com/en-us/azure/virtual-desktop/user-documentation/connect-windows-7-10).
3. Disable **Kerberos-KDCProxy** \ **Operational** event logging.

**Note**: These logs only show if a request is made and the DC that is discovered. In two labs it was found Kerberos tickets were only issued and connection using NLA succeeded after a new *Domain Controller Authority* certificate was requested, the old certificate deleted, and the DC rebooted on all domain controllers.

## ADFS

The `issuer` and `serialnumber` claims must be added to the *Windows Virtual Desktop ADFS Logon SSO* Relying Party Trust in ADFS.

**Certificate authentication** must be enabled as an authentication method from the Extranet. When the Windows Desktop client connects, the user is redirected to the STS where they will see a credential prompt. **Forms** based authentication must be unchecked on the Extranet to eliminate this prompt.

**Note**: If the user has a user certificate, they will log straight in. If the user is connecting with a smart card, they will still encounter a PIN prompt at the STS. The PIN prompt unlocks the smart card and is not part of the authentication pipeline.

If the WAP is domain joined and using the `certauth.<adfs-farm-name>` endpoint over TCP port 443 for certificate authentication instead of TCP port 49443, be sure to add a hosts file entry for `certauth.sts` in addition to the `<adfs-farm-name>`.  Make sure TCP port 443 or 49443 are accessible on the ADFS and WAP servers. 

## Azure Virtual Desktop service

The Azure Virtual Desktop service must be enabled to support federated authentication using the process documented above.

The Azure Virtual Desktop service must be configured to use a KDCProxy to acquire Kerberos tickets for Network Location Awareness (NLA) to succeed.
