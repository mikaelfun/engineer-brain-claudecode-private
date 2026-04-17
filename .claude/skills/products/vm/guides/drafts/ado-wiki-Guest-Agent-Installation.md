---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/GA/Guest Agent Installation_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FGA%2FGuest%20Agent%20Installation_AGEX"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Guest Agent Installation (Manual Uninstall/Reinstall)

## Windows

### Uninstall & Reinstall Steps
1. Check if Guest Agent is in Add/Remove Programs
   - If installed via .MSI → visible in Add/Remove Programs → uninstall from there
   - If installed during image provisioning → not visible → use command line
2. Open elevated command prompt
3. Stop services (if they won't stop, set to manual startup and restart VM):
   ```
   net stop rdagent
   net stop WindowsAzureGuestAgent
   ```
4. Delete services:
   ```
   sc delete rdagent
   sc delete WindowsAzureGuestAgent
   ```
5. Create `C:\WindowsAzure\OLD` folder, move Packages/GuestAgent folders into it
6. Download latest MSI from https://github.com/Azure/WindowsVMAgent/releases
7. Install:
   ```
   msiexec.exe /i c:\VMAgentMSI\WindowsAzureVmAgent.2.7.<version>.fre.msi /L*v C:\Windows\Panther\msiexec.log
   ```
8. If installation fails, collect: `C:\Windows\Panther\msiexec.log` and `VmAgentInstaller.xml`

### Offline Installation (Rescue VM)
Only when customer can't RDP. Requires export/import of registry hives from another VM.
Discuss with SME before applying.
Ref: https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/install-vm-agent-offline

## Linux

### Uninstall
- Ubuntu ≥18.04: `apt -y remove walinuxagent`
- RHEL ≥7.7: `yum -y remove WALinuxAgent`
- SUSE: `zypper --non-interactive remove python-azure-agent`

### Install
Follow: https://docs.microsoft.com/en-us/azure/virtual-machines/extensions/update-linux-agent

### Warning
Do NOT manually remove Linux Guest Agent installation files unless instructed by AGEX SME or EEE. Removing all associated artifacts prevents future reinstallation.
