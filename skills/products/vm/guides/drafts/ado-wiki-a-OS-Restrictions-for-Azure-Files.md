---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/OS Restrictions for Azure Files_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/How%20Tos/OS%20Restrictions%20for%20Azure%20Files_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.How-To
- cw.Reviewed-09-2024
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::




[[_TOC_]]

## Summary

Azure Files requires that a client supports at least SMB 2.1. Also, it requires encryption (SMB 3.0) if a share is being accessed from the broad Internet.

Therefore, there are restrictions on where specific operating systems can access an Azure Files share. This article outlines restrictions that are in place for various OS versions.

## More Information

### Windows Restrictions

To mount an Azure file share outside of the Azure region it is hosted in, such as on-premises or in a different Azure region, the client's OS must support?SMB 3.0 with encryption. ?Check the following table to see if the client that you used to mount the file share supports SMB 3.0.

| **Windows Client**                                 | **SMB Version Supported**                             |
| -------------------------------------------------- | ----------------------------------------------------- |
| Windows Server 2008 R2                             | SMB 2.1 (access only from VM in same region as share) |
| Windows 7                                          | SMB 2.1 (access only from VM in same region as share) |
| Windows Server 2012                                | SMB 3.0                                               |
| Windows Server 2012 R2                             | SMB 3.0                                               |
| Windows 8 .1                                       | SMB 3.0                                               |
| Windows 10<sup>\[1\]</sup>                         | SMB 3.1.1                                              |
| Windows 11                                         | SMB 3.1.1
| Windows Server 2016                                | SMB 3.1.1                                             |
| Windows Server 2019                                | SMB 3.1.1                                             |
| Windows Server 2022                                | SMB 3.1.1
| Windows Server Semi-Annual Channel<sup>\[2\]</sup> | SMB 3.0                                               |

\[1\]: Windows 10, versions 1507, 1607, 1703, and 1709.

\[2\]: Windows Server Semi-Annual Channel, version 1709.

### Linux Restrictions

You must use a Linux distribution that supports at least SMB 2.1

#### Choosing a Linux distribution to use

When creating a Linux virtual machine in Azure, you can specify a Linux image which supports SMB 2.1 or higher from the Azure image gallery.

The following Linux distributions are available for use in the Azure gallery that can have the cifs-utils package installed:

  - Ubuntu Server 14.04+
  - RHEL 7+
  - CentOS 7+
  - Debian 8+
  - openSUSE 13.2+
  - SUSE Linux Enterprise Server 12

<https://docs.microsoft.com/en-us/azure/storage/storage-how-to-use-files-linux>

To mount an Azure file share outside of the Azure region it is hosted in, such as on-premises or in a different Azure region, the client's OS must support SMB 3.0 with encryption. SMB 3.0 encryption support was introduced in Linux kernel version 4.11.

List of recommended Linux images:

|                                                  |                                 |
| ------------------------------------------------ | -------------------------       |
| **Linux distributions**                          | **SMB Version Supported**       |
| Ubuntu Server 14.04+                             | SMB 2.1 , 3.0   and 3.1.1       |
| CentOS 7+                                        | SMB 2.1 , 3.0   and 3.1.1       |
| Open SUSE 13.2+                                  | SMB 2.1 , 3.0   and 3.1.1       |
| SUSE Linux Enterprise Server 12+                 | SMB 2.1 , 3.0   and 3.1.1       |
| SUSE Linux Enterprise Server 12+ (Premium Image) | SMB 2.1 , 3.0   and 3.1.1       |

SMB support and features per different Linux Kernel versions:

|                        |                        |                                                                                      |                                                                                          |
| ---------------------- | ---------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| **Kernel version**     | **SMB Client version** | **What's missing?**                                                                  | **Comments**                                                                             |
| All before version 3.5 | SMB 1.0                | No Encryption, File permissions not working, No secure authentication\!              | 30 years old protocol. Vulnerable to ransomware. Never use it on VMs with public IPs\!\! |
| Kernel\_3.5\*          | SMB2.1                 | No Encryption, File permissions not working, No secure authentication\!              | Insecure, should not be used to connect with on-premises machines.                       |
| Kernel\_3.12\*         | SMB2/SMB3              | No Encryption, File permissions not working, No secure authentication\!              | NOT REAL SMB3 support\! SMB2/SMB3 now symlinks to SMB2.1                                 |
| Kernel\_4.5\*          | SMB2/SMB3              | SMB1/SMB2 -? No Encryption, File permissions not working, No secure authentication\! | First phase of SMB3 per-share encryption support begun (not complete in 4.5).            |
| Kernel\_4.11.12        | SMB2/SMB3              | SMB1/SMB2 - No Encryption, File permissions not working, No secure authentication\!  | **Full support of SMB3 protocol.**                                                       |
| Kernel\_4.13\*         | SMB2/SMB3              | SMB2 is no longer default, replaced by SMB3                                          | **Full support of SMB3 protocol.**                                                       |

#### Additional considerations for Linux

1.  Some technology (notably Mesosphere) will manipulate the DNS configuration, causing DNS lookup of the Azure Files location to fail, which in turn causes a mount failure. In this case it's recommended to mount directly via IP or put the DNS name and IP into /etc/hosts.
2.  File shares cannot be mounted until the network is up, but entries in /etc/fstab may be processed before networking is enabled - causing a mount failure. Use the **\_netdev** option in fstab so that entries like this are not mounted until networking is available.

## References

[Get started with Azure File storage on Windows](https://docs.microsoft.com/en-us/azure/storage/storage-dotnet-how-to-use-files)

[How to use Azure File Storage with Linux](https://docs.microsoft.com/en-us/azure/storage/storage-how-to-use-files-linux)



::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::
