---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Quick Start Check List/Quick Start Check List"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/899235"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/899235&Instance=899235&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/899235&Instance=899235&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This guide provides a quick start checklist for handling Windows Hello for Business (WHFB) cases, including how to distinguish between WHFB and other sign-in methods, essential scoping questions, and troubleshooting steps for common issues.

[[_TOC_]]

# Case handling
If you are not sure who supports what, please review the [case handling section](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/417899/WHFB?anchor=support-topic).

---

## Is it really WHFB, Windows Hello, or convenience PIN?

[How to confirm](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/431162/WHAT-is-the-product-Convenience-PIN-or-WHFB-)

You can start by asking the customer what type of WHFB deployment they have configured (Hybrid Key Trust or Hybrid Cert Trust) and what deployment guide they followed to configure WHFB. If they are not sure, this may not actually be WHFB.

**Windows Hello aka Convenience PIN**
This [link](https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-overview#the-difference-between-windows-hello-and-windows-hello-for-business) helps to explain the difference between Windows Hello and Windows Hello for Business.

You can check and see if convenience PIN is enabled. If so, this is not compatible with WHFB.

- GPO: Computer Configuration\Administrative Templates\System\Logon\**Turn on convenience PIN sign-in**
- REG KEY: `HKLM\Software\Policies\Microsoft\Windows\System\AllowDomainPINLogon`

If the customer has registered for WHFB on this Windows 10 PC before, you can check the following registry path to see if any accounts have been registered under this WHFB credential provider.

- `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Authentication\CredentialProviders\{D6886603-9D2F-4EB2-B667-1971041FA96B}`

A Windows Hello gesture sign-in to Azure Active Directory (AAD) must be done through a valid Windows Hello for Business deployment. A convenience PIN sign-in, which includes PIN and biometrics sign-in to the PC, is not compatible with WHFB or with Hybrid AAD Join.

**SAP**: Windows\Windows 10\Windows 10 edition\ or Windows\Windows 11\Windows 11 edition\
**Category**: Windows Security Technologies\Biometric, Passwordless Authentication, SSO, and Windows Hello

---

## Quick scoping questions

The entire scoping questions section is [here](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430678/Workflow-WHFB-Scoping).

Gather the following information to advance the investigation. Note every case should collect the [Scoping Matrix](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430678/Workflow-WHFB-Scoping).

1. Production environment or non-production?
2. What is the client Windows OS version? (Example: Windows 10 1909 or Server 2016 1909 xxx for server; get the build number)
3. How many clients are impacted, or how many are they working with on this scenario?
4. Is this on-premises only, AADJ cloud only, or a hybrid WHFB deployment?
5. Is the client Intune managed?
6. AADJ cloud only?
7. WHFB Cert Trust or Key Trust deployment?
   - [WHFB Hybrid Key Trust Deployment](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/hybrid-key-trust)
   - [WHFB Hybrid Cert Trust Deployment](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/hybrid-cert-trust)
8. On-premises only?
   - [On-Premises Key Trust Deployment](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/on-premises-key-trust)
   - [On-Premises Certificate Trust Deployment](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/on-premises-cert-trust)
9. Is the issue with the initial setup, user enrollment, or user sign-in for previous enrollment?
10. If initial setup, what deployment guide document are they following?
    - What setup step is the problem? (a link to the setup step would be helpful)
    - Gather as many details, logs, screenshots, and any other related data as possible before reaching out for assistance.
11. If initial enrollment issue, is it a new deployment?
    - If new deployment, what guide are they following and where are they in the deployment process?
    - Ensure the user is well-connected to the domain and internal network.
    - Is the user remote? If the user is remote, ensure they are on VPN during enrollment.
    - You can manually kick off the enrollment from the RUN command line with the following command: `ms-cxh://nthaad`
    - Be sure to collect error UPN, error messages, and the step at which it errors out.
12. A PSR.exe steps recording of the enrollment or a video (from a mobile device) showing the enrollment process would also be very helpful.

**Collect [Auth tracing script](https://internal.evergreen.microsoft.com/topic/4487175) logs of the issue** or review the [data collection](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430676/Workflow-WHFB-Data-Collection) section.

---

## Sign-in issues

- Is the client using a wired Ethernet connection or Wi-Fi?
- Is the client on-premises or remote?
  - If remote, is the client connected to VPN?
  - If using a VPN, is it a manual startup VPN after PC sign-in or an always-on VPN solution that is connected at PC OS startup before user sign-in?
- What does `DSREGCMD /Status` show when using password sign-in? (Collect `DSREGCMD /Status` data)
- Can the user sign in with WHFB PIN?
  - If not, what is the exact error message? (provide the exact message in text format; however, screenshots, pictures, or video can be helpful or needed)
- If they cant sign in with PIN, collect Auth Tracing script data.
  - [Auth tracing script](https://internal.evergreen.microsoft.com/topic/4487175) or review the [data collection](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430676/Workflow-WHFB-Data-Collection) section
  - Ensure the user is not on remote desktop as this is a prerequisite not to be on RDP.
  - The Hello for Business and AAD Operational log are often the most helpful.

---

For **Key Trust** deployments, remember the key must sync back to the users on-premises Active Directory (AD) account into the attribute `ms-ds-keycredential link`.

The default sync interval is every 30 minutes, but sometimes it can take two sync cycles before the key is synced. Be sure to tell customers and users to normally wait an hour before trying the WHFB sign-in after Key Trust enrollment. You can review this in the attribute editor in ADUC to confirm it is populated. However, just being populated does not confirm the correct key for this device is present. There are additional methods to confirm the right key is present, but the best thing would be to look at the new AAD Connect logs to verify the key was synced successfully.

Note that the initial sign-in to the Windows 10 PC desktop is a Kerberos authentication against the domain controller (DC). A common issue seems to be certificate revocation list (CRL) and similar certificate issues on the DCs.

A cached credential sign-in could be used, but just like a password cached credential sign-in must be cached when the PC is connected to the domain, a WHFB NGC cached sign-in would also need to be cached when connected to the domain. These are separate cached credentials, and having the password credential cached does not mean the WHFB credential is cached.

---

### Hybrid AAD Join (HAADJ) issues

- Does the client get the AAD Primary Refresh Token (PRT)? (`DSREGCMD /Status`)
  - If not, then engage AAD Authentication support to troubleshoot.
    - [HAADJ for Federated Domains](https://learn.microsoft.com/entra/identity/devices/how-to-hybrid-join#federated-domains)
    - [HAADJ for Managed Domains](https://learn.microsoft.com/entra/identity/devices/how-to-hybrid-join#managed-domains)
  - If yes, and it's a Certificate Trust deployment, then:
    - Does the client get an Enterprise PRT?
    - If not, then troubleshooting is on ADFS [DRS and Device Auth](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/hybrid-cert-trust#device-registration-and-device-write-back).
    - In some cases, the customer is not using ADFS, but instead SCEP via Intune: open a task to Intune.
  - If yes, then HAADJ is working.
    Collect [Auth Tracing](https://internal.evergreen.microsoft.com/topic/4487175) or review the [data collection](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430676/Workflow-WHFB-Data-Collection) section during the sign-in attempt.
    - A lock then unlock operation is triggering a sign-in with WHFB credentials and can be used to capture the sign-in attempt.

---

### AADJ cloud-only join scenarios

When you join a Windows 10/11 device to AAD (cloud-only join), the user will be prompted to enroll WHFB. This is a Windows 10/11 OS default.

Some customers ask how to disable this. It is recommended to manage these non-domain joined systems with Intune. This feature can be managed and disabled by Intune or registry keys.

[Use Intune to disable Windows Hello for Business enrollment](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/hello-aad-join-cloud-only-deploy#use-intune-to-disable-windows-hello-for-business-enrollment)

- User Policy  
  `HKEY_USERS\UserSID\SOFTWARE\Policies\Microsoft\PassportForWork`
- Device Policy  
  `HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\PassportForWork`  
  DWORD "Enabled"  
  Value = 0 for Disable and Value = 1 for Enable

---

### On-premises only WHFB scenarios

[On-Prem Key Trust](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/on-premises-key-trust)

[On-Prem Cert Trust](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/deploy/on-premises-cert-trust)

- Determine the deployment type and what the issue is (setup, enrollment, or sign-in).
- Much of the information above for hybrid scenarios still applies.
- Collect information about the error as well as [Auth tracing](https://internal.support.services.microsoft.com/en-us/help/4487175) or review the [data collection](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430676/Workflow-WHFB-Data-Collection) section.

---

**NEXT STEP**:
Go to: [Troubleshooting provisioning](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/515081/Quick-troubleshooting-steps-for-a-provisioning-problem) or [Troubleshooting Authentication](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/515091/Quick-troubleshooting-steps-for-an-authenticatio).