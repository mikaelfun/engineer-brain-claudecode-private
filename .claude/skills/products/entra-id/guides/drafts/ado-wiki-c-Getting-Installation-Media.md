---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Deployment/Getting Installation Media"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops%2FDeployment%2FGetting%20Installation%20Media"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Download/Install a RHEL Linux Image/VM:

## To download media, goto:

  - **Ubuntu Desktop**: https://ubuntu.com/download/desktop
  - **RHEL**: https://developers.redhat.com/products/rhel/download
  - **Fedora Workstation**: https://www.fedoraproject.org/workstation/download/

## Setup a local VM
For help getting through the installer, you can reference this step-by-step Justin put together. There are a wealth of sites that enumerate how to setup distros on VMs/etc - just linking one:

   https://ploegert.gitbook.io/til/general/virtualization/setup-rhel-9.2-linux-vm

## Activation for Updates **RHEL only** 
In order to download patches/updates for the OS, you will need to activate the OS. We have enterprise licensing, so you should be able to do so using the following command:

```
# Register your systems for any version of RHEL with:
subscription-manager register --org=<SOME_ORG> --activationkey=<SOME_KEY>
```

> If you don't have a key, contact the IDNA team to request the info.  

## Transferring Files to/from a VM
*Note:** If you need to copy files to/from windows to/from linux and don't want to mount files, I put together instructions on how to setup SFTP using WinSCP:

<https://ploegert.gitbook.io/til/os/virtualization/transfer-files-from-windows-to-ubuntu-vm>
