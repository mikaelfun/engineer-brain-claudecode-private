---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/How Tos/Azure Arc Extension/How to check Software Assurance Benefits for Azure File Sync on Arc Enabled Servers_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FHow%20Tos%2FAzure%20Arc%20Extension%2FHow%20to%20check%20Software%20Assurance%20Benefits%20for%20Azure%20File%20Sync%20on%20Arc%20Enabled%20Servers_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Install or Restore Microsoft Root CA 2011 in Trusted Root Certification Authorities

## Overview

The **Microsoft Root Certificate Authority 2011** is required for Azure File Sync and other Microsoft services to establish secure TLS connections. If missing or corrupted, restore it in the **Local Computer** certificate store under **Trusted Root Certification Authorities**.

## Steps

### 1. Verify if the certificate exists

```powershell
Get-ChildItem -Path Cert:\LocalMachine\Root | Where-Object { $_.Subject -like "*Microsoft Root Certificate Authority 2011*" }
```

### 2. Download the certificate

- Go to: https://aka.ms/rootcert
- Locate **Microsoft Root Certificate Authority 2011**
- Download the `.cer` file (Base64 or DER format)

### 3. Install via MMC

1. Press **Win + R**, type `mmc`, press **Enter**
2. **File > Add/Remove Snap-in** > **Certificates** > **Computer account** > **Local computer**
3. Navigate to: `Certificates (Local Computer) > Trusted Root Certification Authorities > Certificates`
4. Right-click **Certificates** > **All Tasks** > **Import**
5. Browse to downloaded `.cer` file, place in **Trusted Root Certification Authorities**

### 4. Install via PowerShell (alternative)

```powershell
$certPath = "C:\Temp\MicrosoftRootCA2011.cer"
Import-Certificate -FilePath $certPath -CertStoreLocation Cert:\LocalMachine\Root
```

### 5. Validate installation

```powershell
Get-ChildItem -Path Cert:\LocalMachine\Root | Where-Object { $_.Subject -like "*Microsoft Root Certificate Authority 2011*" }
```

### 6. Restart dependent services

```powershell
Restart-Service AzureConnectedMachineAgent
Restart-Service FileSyncSvc
```

## Important Considerations

- Always download certificates from the **Microsoft official source**
- Ensure the **Local Computer** store is used (not Current User)
- If Group Policy manages root certificates, confirm policy refresh after manual import
- For large-scale environments, use **GPO** or **PowerShell DSC** for deployment
