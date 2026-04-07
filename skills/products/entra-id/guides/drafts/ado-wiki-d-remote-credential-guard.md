---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Credential Guard Troubleshooting/Remote Credential Guard"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FCredential%20Guard%20Troubleshooting%2FRemote%20Credential%20Guard"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# What is Remote Credential Guard?

Remote Credential Guard helps protect user credentials over a Remote Desktop Protocol (RDP) connection by redirecting Kerberos requests in the RDP session back to the RDP client where the RDP connection is initiated. It also provides single sign-on (SSO) experiences to RDP sessions.

## Remote Credential Guard Requirements

### RDP Client

- Must be running at least Windows 10, version 1703, to be able to supply credentials, which are sent to the remote device. This allows users to run as different users without having to send credentials to the remote machine.
- Must be running at least Windows 10, version 1607, or Windows Server 2016 to use the user's signed-in credentials. This requires the user's account to be able to sign in to both the client device and the remote host.
- Must be running the Remote Desktop Classic Windows application. The Remote Desktop Universal Windows Platform application does not support Windows Defender Remote Credential Guard.
- Must use Kerberos authentication to connect to the remote host. If the client cannot connect to a domain controller, then RDP attempts to fall back to NTLM (NT LAN Manager). Windows Defender Remote Credential Guard does not allow NTLM fallback because this would expose credentials to risk.

### Remote Desktop Session Host (RDSH)

- Must be running at least Windows 10, version 1607, or Windows Server 2016.
- Must allow Restricted Admin connections.
- Must allow the client's domain user to access Remote Desktop connections.
- Must allow delegation of non-exportable credentials.
