---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/msix appattach setup guide"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/In-Development%20Content/Outdated%3F%20-%20Needs%20review%20if%20still%20useful/msix%20appattach%20setup%20guide"
importDate: "2026-04-06"
type: troubleshooting-guide
note: "Marked as Outdated - Needs review if still useful. 21v: MSIX app attach partially supported in Mooncake."
---

# MSIX App Attach Setup Guide

## Create VM

1. Create VM that is same version as AVD VMs.
1. Login into VM with administrator account.

## Create Self Signed Certificate

Reference: [Create a certificate for package signing](https://docs.microsoft.com/en-us/windows/msix/package/create-certificate-package-signing)

1. Open PowerShell as administrator and enter the following (replace FriendlyName):

   ```powershell
   New-SelfSignedCertificate -Type Custom -Subject "CN=Contoso Software, O=Contoso Corporation, C=US" -KeyUsage DigitalSignature -FriendlyName "Your friendly name goes here" -CertStoreLocation "Cert:\CurrentUser\My" -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")
   ```

1. Select Run from the Start menu and enter `certmgr.msc`.
1. Expand **Personal** > Right click on certificate > **All Tasks** > **Export**.
1. Select **Yes, export the private key**.
1. Select format options, enter a password, choose save location, and complete wizard.

## Download .MSI

1. Download the MSI of the desired program to create a package.

## Create MSIX Package

1. Install **MSIX Packaging Tool** from Microsoft Store.
1. Open MSIX Packaging Tool and select **Application package**.
1. Select **Create package on this computer** > **Next**.
1. Confirm driver is installed and Windows Update/Search is disabled > **Next**.
1. Under **Choose the Installer**: browse to the MSI. Under **Signing preference**: browse to PFX. Enter PFX password.
1. Package information should populate automatically.
1. Program will be installed. Restart machine if application requires restart. Click **Next**.
1. Package will be listed > **Next**.
1. Click **Yes** to move on.
1. Review package report > **Next**.
1. Select location to save package > **Create**.

## Create a VHD or VHDX Package for MSIX

Note: Requires Hyper-V role installed.

Follow: [Create a VHD or VHDX package for MSIX](https://docs.microsoft.com/en-us/azure/virtual-desktop/app-attach-image-prep#create-a-vhd-or-vhdx-package-for-msix)

## Expand MSIX Package

Follow: [Expand MSIX](https://docs.microsoft.com/en-us/azure/virtual-desktop/app-attach-image-prep#expand-msix)

After completion, detach the VHD.

## Add Package to Host Pool

1. Go to **Host Pool** > **MSIX packages** > Select **Add**.
1. Enter UNC path to VHD — details should populate.
1. Enter display name, change state to **Active**, select **Add**.
