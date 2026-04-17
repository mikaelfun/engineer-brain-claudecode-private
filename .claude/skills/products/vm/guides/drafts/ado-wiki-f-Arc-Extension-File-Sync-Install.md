---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/Azure Arc Extension/Azure Arc Extension for File Sync_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FAzure%20Arc%20Extension%2FAzure%20Arc%20Extension%20for%20File%20Sync_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-Sync
- cw.TSG
- cw.Reviewed-11-2025
--- 

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::

[[_TOC_]]

# Install and Manage Azure File Sync Agent on Arc-enabled Windows Servers

## Overview

The **Azure File Sync Agent extension** enables an **Azure Arc-enabled Windows Server** to synchronize on-premises file data with an **Azure file share**. Deployed and managed as an Arc **VM extension**, it installs the Azure File Sync agent in a consistent, policy-driven manner without requiring server login. This extension is published by Microsoft and can be managed via:

- **Azure Portal**
- **Azure PowerShell**
- **Azure CLI**

> **Important:** The Azure File Sync agent extension is supported **only on Windows**. Linux Arc-enabled servers are **not supported**.

---

**Key points for CSS support engineers:**

- **Platform:** Windows Server **2016+ (RTM)** only; **Linux is not supported** for this extension.
- **Prerequisites:**
    - Server is **connected to Azure Arc** (Azure Connected Machine agent installed and onboarded).
    - **Microsoft Root Certificate Authority 2011** is present in **Local Computer  Trusted Root Certification Authorities**.
    - Outbound **HTTPS (443)** access to Azure control/data-plane endpoints.
- **Management planes:** Azure **Portal**, **PowerShell**, and **CLI** are supported.
- **Next steps after installation:** Register the server to a **Storage Sync Service**, add to a **Sync Group**, and create the **Server Endpoint** that points to the local path.

---

## Prerequisites

Before installation, ensure:

- **Azure Arc-enabled server:**
    - Connected to Azure Arc with **Azure Connected Machine agent** installed and onboarding completed.
- **Operating System:**
    - Windows Server **2016 or later** (RTM versions only).
- **Certificates:**
    - Microsoft Root Certificate (**Microsoft Root Certificate Authority 2011**) installed.
- **System Requirements:**
    - Refer to [Azure File Sync system requirements and interoperability](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-extension).

---

## Installation Steps

![arcextportal.png](/.attachments/SME-Topics/Azure-Files-Sync/Arc-Ext-FileSync/arcextportal.png)

### 1. Enable the Azure File Sync Agent via the Azure Portal

**Pro Tip:** Use this approach when customers prefer a click-through path or when validating extension behavior before automating with CLI/PowerShell.

#### Step-by-step

1. **Open the server in Azure Arc**
     - Portal: **Azure Arc**  **Servers**  click the target **Windows server**.

2. **Add the extension**
     - In the server blade, select **Extensions**  **+ Add**.
     - In the extension gallery, search for **Azure File Sync Agent** (Publisher: **Microsoft.Azure.FileSync**).
     - Select **Azure File Sync Agent**  **Next/Install**.
     - No custom settings are typically requiredaccept defaults and **Create/Install**.

3. **Monitor deployment**
     - Stay on **Extensions** and watch **Provisioning state**.
     - Desired state: **Provisioning succeeded** (usually within a few minutes).
     - If the state stalls or fails, capture the **operation details** and see the Troubleshooting section (install failures / proxy / RBAC).

4. **Verify the agent on the server (optional but recommended)**
     - From the **Extensions** list, click **AzureFileSyncAgent** and open **Instance view** for logs.
     - On the server (if you have access), confirm services:
         ```powershell
         Get-Service | Where-Object {$_.DisplayName -like "*File Sync*"} | Select Name, Status, StartType
         ```
     - Check **Event Viewer  Applications and Services Logs  Microsoft-FileSync-Agent/Operational** for a clean startup.

5. **Register with Storage Sync Service**
     - In the portal, navigate to your **Storage Sync Service** resource.
     - Open **Registered servers**  **+ Register** (or use the agent UI on the server).
     - Complete registration, then create/add to a **Sync Group**:
         - **Cloud endpoint**  your Azure file share.
         - **Server endpoint**  local path on the Windows server (ensure NTFS permissions).

#### Post-enable validation (CSS checklist)

- **Extension:** Arc server  **Extensions**  *AzureFileSyncAgent* = **Provisioning succeeded**.
- **Registered server:** SSS  **Registered servers** shows the machine **Online**.
- **Sync group health:** SSS  **Sync groups** shows **Healthy** cloud and server endpoints; initial sync starts without errors.
- **Networking:** `Test-NetConnection <storageaccount>.file.core.windows.net -Port 443` succeeds from the server.

#### Common portal-time errors you can resolve quickly

- **Extension not offered:** Confirm the resource is a **Windows** Arc server; Linux nodes won't list this extension.
- **Provisioning failed:** Check Arc connectivity (**Connected status**), RBAC, proxy/TLS interception, and AV/EDR blocks.
- **Registered server offline** after success: Verify outbound 443 to region endpoints; check File Sync agent services and event logs.

---

### 2. Using Azure PowerShell

```powershell
# Install Azure File Sync Agent extension
Set-AzConnectedMachineExtension `
    -Name "AzureFileSyncAgent" `
    -ExtensionType "AzureFileSyncAgent" `
    -Publisher "Microsoft.Azure.FileSync" `
    -ResourceGroupName "<ResourceGroup>" `
    -MachineName "<ArcServerName>"
```

---

### 3. Using Azure CLI

```bash
# Install Azure File Sync Agent extension
az connectedmachine extension create \
    --name AzureFileSyncAgent \
    --machine-name <ArcServerName> \
    --resource-group <ResourceGroup> \
    --publisher Microsoft.Azure.FileSync \
    --type AzureFileSyncAgent
```

---

## Validation

After installation:

- Confirm the extension status in **Azure Portal** under **Extensions**.
- Use PowerShell:

```powershell
Get-AzConnectedMachineExtension -MachineName "<ArcServerName>"
```

---

## Uninstallation

To remove the extension:

### PowerShell

```powershell
Remove-AzConnectedMachineExtension `
    -Name "AzureFileSyncAgent" `
    -MachineName "<ArcServerName>" `
    -ResourceGroupName "<ResourceGroup>"
```

### CLI

```bash
az connectedmachine extension delete \
    --name AzureFileSyncAgent \
    --machine-name <ArcServerName> \
    --resource-group <ResourceGroup>
```

---

# Training

- [[New Feature - CSS Deep Dive] Arc Extension for Azure File Sync-20251117_110313-Meeting Recording](https://microsofteur.sharepoint.com/teams/dante/Lists/ListProd/DispForm.aspx?ID=744)

---

## More Information

- [Install and manage the Azure File Sync agent extension on Azure Arc-enabled Windows servers](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-extension?tabs=azure-portal)

::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md
:::
