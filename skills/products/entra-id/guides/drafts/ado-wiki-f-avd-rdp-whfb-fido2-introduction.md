---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/AVD or RDP Sign in using WHfB or FIDO2/AVD or RDP Sign in using WHfB or FIDO2 Introduction"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/Hello%20for%20Business/AVD%20or%20RDP%20Sign%20in%20using%20WHfB%20or%20FIDO2/AVD%20or%20RDP%20Sign%20in%20using%20WHfB%20or%20FIDO2%20Introduction"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Feature Overview

This feature adds a new RDP authentication protocol that is used to connect to Entra joined (AADJ) or Hybrid Entra joined (HAADJ) VMs using the built-in windows Remote Desktop Client (mstsc.exe) or Azure Virtual desktop Remote Desktop clients. This new protocol builds on top of the existing TLS protocol but uses a delegation token instead of the user's credentials for authentication. The key benefit is Single Sign-On and support for Passwordless credentials like Passkey (FIDO2) and WHfB.

The new authentication protocol for Remote Desktop connections replaces PKU2U and RDSTLS protocols by leveraging Entra ID to generate a short-lived RDP token to sign into Windows. The RDP token, which is bound to the target device. During Windows logon the short-lived RDP token is verified in Entra ID before it is exchanged for a PRT.

In addition to adding support for passwordless authentication, this will add native support for Entra ID Single Sign-on for both Gateway and Windows login without ADFS, and it will allow organizations to enforce Conditional Access policies at sign-in.

This new protocol can be enabled on Azure Virtual Desktop (AVD) host pools by setting an *Advanced* RDP Property.

The Remote Desktop Client (mstsc.exe) that is built into Windows 11 also benefits from this new protocol. This can be used by enabling a new **Advanced** *User Authentication* property in the .RDP file called **Use a web account to sign in to the remote computer**.

# Public Documents

- [Device identity and desktop virtualization](https://learn.microsoft.com/en-us/entra/identity/devices/howto-device-identity-virtual-desktop-infrastructure)
- [Insider Preview: Single sign-on and passwordless authentication for Azure Virtual Desktop](https://techcommunity.microsoft.com/t5/azure-virtual-desktop/insider-preview-single-sign-on-and-passwordless-authentication/m-p/3608842)
- [Configure single sign-on for Azure Virtual Desktop](https://learn.microsoft.com/en-us/azure/virtual-desktop/configure-single-sign-on)
- [In-session passwordless authentication](https://learn.microsoft.com/en-us/azure/virtual-desktop/authentication#in-session-passwordless-authentication)
- [Supported identities and authentication methods](https://learn.microsoft.com/en-us/azure/virtual-desktop/authentication)

# Requirements

Microsoft Entra authentication can be used on the following operating systems for both the local and remote device:

- Windows 11 with 2022-10 Cumulative Updates for Windows 11 (KB5018418) or later installed.
- Windows 10, version 20H2 or later with 2022-10 Cumulative Updates for Windows 10 (KB5018410) or later installed.
- Windows Server 2022 with 2022-10 Cumulative Update for Microsoft server operating system (KB5018421) or later installed.
- Either a WHfB credential registered on the client -AND/OR- a FIDO2 Security key registered on the user account.
- To perform interactive sign-in to the Windows client where MSTSC.EXE or AVD client are launched using a FIDO2 Security key, the **Turn on security key sign-in** policy must be enabled. This is not required to be enabled on the target device for FIDO to be used.

**NOTE**: There are plans to create a service update that will backport this to Windows Server 2019+, and support will be added for non-Windows clients and with Web clients.

# Entra ID Sign-in Logs

While this uses the WebAuthN protocol to make the connection there are no remote calls made over CTAP (Client to Authenticator Protocol) like there are when a user connects to a remote computer via RDP and initiates a Browser flow that requires a second factor. This Entra ID Sign-in event looks like a Windows interactive sign-in.

# Conditional Access Policies for Azure Virtual Desktop

For Azure Virtual Desktop, implementing Conditional Access Policies is crucial to ensure secure and controlled access. The detailed guidelines and best practices for setting up these policies can be found in the Conditional Access Policies for Azure Virtual Desktop access document.

# Legacy versus new authentication protocol for Remote Desktop connections

For Remote Desktop connections, there are two authentication protocols to consider:
- **New protocol**: Leverages modern authentication methods such as WHfB and FIDO2, uses delegation tokens via TLS.
- **Legacy protocol**: Primarily relies on WHfB for authentication via PKU2U, does not support FIDO2.
