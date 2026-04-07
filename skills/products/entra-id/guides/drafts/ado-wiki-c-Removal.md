---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Deployment/Removal"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops%2FDeployment%2FRemoval"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Uninstallation/Removal

## How To de-Register a machine from Azure AD (Optional)

> There is no direct path to directly de-register the machine from the AAD Tenant. 

If it is a must is to go to the Azure AD Devices portal, search for that user, identify that users devices, and then select remove from the menu.

---

## How To Unenroll from Intune Management (Optional)

There are two ways to unenroll the device from Intune. 
1. Use the Intune Agent (Company Portal) interface to unenroll
2. Manually execute a script to remove the components

### To Remove Edge/Intune/Broker using the Company Portal
- Launch the Intune Agent (Company Portal)
- Select the Context Menu, and select `Remove Device`
- Select `Yes` or `No` depending on your desire

---

## To Remove Edge/Intune/Broker using Command-Line

### Ubuntu/Debian
<details><summary>.DEB - Ubuntu/Debian</summary>

```bash
# Stop Identity Service
sudo systemctl stop microsoft-identity-device-broker  
systemctl --user stop microsoft-identity-broker  

# Clean up state
sudo systemctl clean --what=configuration --what=runtime --what=state microsoft-identity-device-broker  
systemctl --user clean --what=state --what=configuration --what=runtime microsoft-identity-broker 
rm -r ~/.config/intune 

# Uninstall the Intune package
sudo apt remove intune-portal 
 
# Uninstall any versions relevant of Edge that are installed
sudo apt remove microsoft-edge-dev

# If they are using a dev or other ring, adjust the remove command
sudo apt remove microsoft-edge-beta
sudo apt remove microsoft-edge
 
# Optional, but this can potentially free space by some larger dependencies that the auth broker require
sudo apt autoremove 
```

</details>

### RedHat/Fedora
<details><summary>.RPM - RHEL/Fedora</summary>

```bash
# Stop Identity Service
sudo systemctl stop microsoft-identity-device-broker 
systemctl --user stop microsoft-identity-broker 

# Clean up state
sudo systemctl clean --what=configuration --what=runtime --what=state microsoft-identity-device-broker 
systemctl --user clean --what=state --what=configuration --what=runtime microsoft-identity-broker
rm -r ~/.config/intune

# Uninstall the Intune package
sudo dnf remove intune-portal

# Optional, but this can potentially free space by some larger dependencies that the auth broker require
sudo dnf autoremove

# To confirm the package has been deleted:
rpm -qi microsoft-identity-broker
```

</details>

---

## How to Verify Removal

To Verify that the device has been removed from Company Portal:
- On a managed device browse to https://aka.ms/cpweb
- Click Devices
- Locate the Linux device, and if it is there select it
- Click Remove
