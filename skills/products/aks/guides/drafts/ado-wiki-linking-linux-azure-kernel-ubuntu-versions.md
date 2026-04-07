---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Linux/Linking Linux AzureKernel with Upstream UbuntuKernel Versions"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FLinux%2FLinking%20Linux%20AzureKernel%20with%20Upstream%20UbuntuKernel%20Versions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Link Between Linux-Azure Kernel Versions and Upstream Ubuntu Kernel Versions

## Scenario

Some customers want to understand how an AKS Linux-Azure kernel version (which has a completely different version number or naming convention than the upstream Ubuntu kernel version) is linked or tied together to identify CVEs.

## Documentation of CVEs Fixes in Linux-Azure Kernel Versions & Ubuntu Kernel Version

To find which Ubuntu kernel fixes are included in a Linux Azure kernel version, refer to Ubuntu's CVE pages. The linux-azure kernel versions that contain specific CVE fixes are tracked on these pages.

For example, for CVE-2024-36016, visit the Ubuntu CVE page and scroll down to the linux-azure section:
https://ubuntu.com/security/CVE-2024-36016

The page shows the version of the linux-azure derivative kernel with the fix. For AKS, the 22.04 LTS version has the fix in 5.15.0-1070.79 for this example CVE.

## Linking Ubuntu Kernel Version and Azure Kernel Versions

The link between Ubuntu kernel versions and Linux Azure kernel versions is included in the changelogs for new Linux Azure kernels.

Example: linux-azure (5.15.0-1078.87) is built on generic kernel Ubuntu: 5.15.0-130.140, and the previous linux-azure (5.15.0-1077.86) was built on Ubuntu: 5.15.0-128.138. The latter linux-azure kernel 1078 also contains the CVE fixes described under section for 1077.

Changelog: https://launchpad.net/ubuntu/+source/linux-azure/5.15.0-1078.87

## Accessing Changelogs via CLI

Changelogs can be accessed through CLI from an instance running the kernel of interest:

```bash
apt changelog linux-headers-<kernel_version>-azure
```

For example, on an instance running the 6.8 kernel:

```bash
apt changelog linux-headers-6.8.0-1020-azure
```
