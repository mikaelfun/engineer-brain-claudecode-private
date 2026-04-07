---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/TSGs/Confidential VMs Encryption/Confidential Temp Disk Encryption_Encryption"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Encryption%2FTSGs%2FConfidential%20VMs%20Encryption%2FConfidential%20Temp%20Disk%20Encryption_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Confidential VM: Temp Disk Encryption (public preview)

## What is a Confidential VM

- Azure VM offering where hosting hardware supports AMD SEV-SNP or Intel TDX VM isolation
- Memory of the guest VM is encrypted using a symmetric key known only to the Platform Security Provider (PSP)
- OS disk is encrypted in the Confidential Provisioning Service (CPS) during VM provisioning
- Secure and measured boot enabled against early boot attacks (bootkits, rootkits)
- Reference: https://learn.microsoft.com/en-us/azure/confidential-computing/confidential-vm-overview

## VM SKUs and Regions

- Confidential VM SKUs contain **DC** and **EC** series (e.g., Standard_DC4ads_v5)
- Supported OS: Windows Server 2019/2022; Ubuntu 20.04/22.04; RHEL 9.3; SUSE 15 SP5
- Not all Azure regions have CVM support - see available regions at Azure product-by-region page

## Pre-requirements

1. Resource (temp) disk present in VM SKUs whose names contain "d" (e.g., DC_a**d**s, EC_a**d**s)
2. Supported OS: Windows Server 2019/2022, Ubuntu 20.04/22.04, RHEL 9.3
3. OS disk must be encrypted by ConfidentialVM Provisioning Service (CPS)

## How to Enable and Verify

Public preview since November 2023 (announced at Ignite).

Steps:
1. Install ADE using respective scripts:
   - Windows: https://github.com/Azure/confidential-computing-cvm-guest-attestation/blob/main/cvm-datadisk-enc-scripts/CVM-enable-conftempdiskenc-Win.ps1
   - Linux: https://github.com/Azure/confidential-computing-cvm-guest-attestation/blob/main/cvm-datadisk-enc-scripts/CVM-enable-conftempdiskenc-Lnx.ps1

2. Verify ADE extension state and health in portal or Azure PS/CLI

3. Verify temp disk encrypted state inside guest VM

Script parameters to replace:
- subscriptionId, resourceGroup, cvmName, location, kvName (Azure Key Vault name, must exist)

## Troubleshooting - Log Collection

### Windows
- Extension logs: `C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Security.AzureDiskEncryption\<VERSION>`
- Extension config: `C:\Packages\Plugins\Microsoft.Azure.Security.AzureDiskEncryption\<version>\RuntimeSettings`
- Extension status: `C:\Packages\Plugins\Microsoft.Azure.Security.AzureDiskEncryption\<version>\Status`
- GuestAgent logs: `C:\WindowsAzure\Logs\WaAppAgent.log`
- BitLocker state: `manage-bde -status` and `manage-bde -protectors -get C:`
- WMI repo: `winmgmt /verifyrepository`, Diskmgmt.msc screenshot
- DISM logs: `C:\Windows\logs\dism\dism.log`, `C:\Windows\logs\cbs\*.*`, `C:\Windows\servicing\sessions\sessions.xml`

### Linux
- Collect `/var/log/azure/AzureDiskEncryption/*` files

## Incident Transfer to PG

After verifying the CRI is for a CVM and following troubleshooting:
- Request assistance or transfer ICM to: `Cloud Provisioning Service \ Confidential VM provisioning service`
- Email: cvmpsdev@microsoft.com
