---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/How To/1- Install and use WSL and AGC scripts to automate the installation of AGC Labs (Part 1 of video series)"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/How%20To/1-%20Install%20and%20use%20WSL%20and%20AGC%20scripts%20to%20automate%20the%20installation%20of%20AGC%20Labs%20(Part%201%20of%20video%20series)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Install and use WSL and AGC scripts to automate the installation of AGC Labs (Part 1 of video series)

## Description

Because Application Gateway for containers cannot be shutdown, when we build AGC labs for testing we need to delete them when done. Else they will quickly eat up our subscription cost quota.

Using WSL on your local corp machine allows you to not have to run through the install commands that we have documented and instead utilize scripts on your machine to automate the installation of the various flavors and configurations of AGC.

## How to automate the process of installing WSL - And the usage of canned scripts to automate AGC installs

A workflow and scripts exist to automate the process of installing WSL on your corp environment, and then the install of all the tools needed from WSL to manage Azure, AGC, AGIC and AKS. This includes the installs of Kubectl, Azure CLI, HELM, etc.

### Setup Steps

1. Download AGC.zip (password-protected; password is `password`) and extract contents directly into `c:\AGC`.

2. (Optional) Unblock `starthere.ps1` via Properties → uncheck Unblock, then set execution policy:
   ```powershell
   Set-ExecutionPolicy Unrestricted -scope CurrentUser
   ```

3. Type `WSL` and press a key to install the WSL Windows feature. Reboot when prompted.

4. After reboot, right-click the `c:\AGC` folder → Open in Terminal, then run:
   ```powershell
   .\starthere.ps1
   ```
   This installs Ubuntu into WSL and all required tools (kubectl, Azure CLI, HELM, etc.).

5. Once complete, open WSL from `c:\AGC` terminal, log in to Azure CLI, and use one of the 6 canned scripts to automate AGC installs.

### Available AGC Install Scripts (6 flavors)

Scripts are located in `c:\AGC`. Before running, update the `subscriptionID` variable in each script to your own subscription ID.

### Cleanup

After lab work, delete the `NewIngress5` resource group (or whatever name was set in the script variable) to remove the entire lab.

## Video Walkthrough

- [Part 1 - WSL.mp4](https://microsoft-my.sharepoint.com/:v:/p/eashton/IQD6S_qHbR7sSpfkLnSMSAKiAYhp_5AO3YQ-f6s5f5ygi6o)
- [Full Series - WSL and AGC Tips and Tricks.mp4](https://microsoft-my.sharepoint.com/:v:/p/eashton/IQD-nGHacoQjSqVfM3X7ROHDAXG01TMjTCJon0x75w6QQYo)

## Contributors

- Eric Ashton (eashton@microsoft.com)
