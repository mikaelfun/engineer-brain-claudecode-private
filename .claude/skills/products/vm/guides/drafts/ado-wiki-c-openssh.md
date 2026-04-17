---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/OpenSSH_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FOpenSSH_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# OpenSSH in Azure VMs

## What is OpenSSH?

OpenSSH is a secure network protocol suite providing SSH, SCP, and SFTP for encrypted communication between two untrusted hosts over an insecure network.

- [OpenSSH manual](https://www.openssh.com/manual.html)

## How to Use OpenSSH in Azure

1. Create a Linux-based virtual machine in Azure
2. Install the OpenSSH server on the VM
3. Connect to the VM using an OpenSSH client

**Compatible clients:** Linux/macOS built-in SSH, Windows 10 build 1809+, Windows Server 2019+, PuTTY, WinSCP

## Support Routing

| Scenario | Support Team |
|----------|-------------|
| Application malfunction on Windows | Windows User Experience |
| Network misconfiguration on Windows | Windows Networking |
| Azure Active Directory integration | AAD team |
| Unable to SSH to Linux VMs | Azure IaaS VM |

**References:**
- [Get started with OpenSSH for Windows](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse?tabs=gui)
- [SSH authentication with Azure Active Directory](https://learn.microsoft.com/en-us/azure/active-directory/fundamentals/auth-ssh)

## Azure AD Integration

1. Enable Azure AD Domain Services on the Azure virtual network
2. Join Linux VMs to the Azure AD Domain Services domain
3. Configure the OpenSSH server to use Azure AD Domain Services for authentication and authorization

Once configured, users can authenticate SSH connections using Azure AD credentials.
