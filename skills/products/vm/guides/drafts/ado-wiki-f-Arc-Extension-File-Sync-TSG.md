---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/Azure Arc Extension/Azure Arc Extension for File Sync TSG_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FAzure%20Arc%20Extension%2FAzure%20Arc%20Extension%20for%20File%20Sync%20TSG_Storage"
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

# Troubleshooting  Azure File Sync Agent on Arc-enabled Windows Servers

## Support Boundaries: Azure Arc Agent vs. Azure File Sync (AFS)

### **What CSS Owns (Primary)**
CSS is the first line of support for **AFS agent installation, registration, and topology enablement**regardless of whether the AFS agent was installed manually or via the Arc Extension.

Owned by CSS:
- **AFS agent installation/upgrade failures** initiated from the Arc Extension or manual paths (MSI/PowerShell/ARM/CLI).
- **AFS server registration issues** and **AFS topology configuration** (e.g., cloud endpoint/server endpoint creation, sync health once the agent is present).
- **AFS-specific error interpretation and remediation**, including prerequisites, pending reboot detection, unsupported OS/RTM checks, and version gating for AFS v22+.
- Validating **SA benefits prerequisites on the AFS side** (AFS agent v22+, benefit not tied to extension method).

### **What Requires Azure Arc Team Involvement (Escalate)**
Escalate to the Azure Arc team when the issue is **in the Arc platform/agent layer**, not in AFS:

- **Arc Connected Machine (guest) agent service issues**: agent not running, repeatedly crashing, cannot upgrade/start, or extension platform not applying/rolling back deployments.
- **Arc extension infrastructure faults**: deployment pipeline failures that occur **before** AFS installer is invoked (e.g., extension payload download/auth/signature chain issues attributable to Arc platform rather than AFS package).
- **Arc-side eligibility/telemetry signals** that determine SA benefit status when AFS prerequisites are already met (Arc agent must be 1.55+ and exposing benefit state).

> Rule of Thumb:  
> If the failure occurs **before** the AFS installer runs or is due to the **Arc agent / Arc extension substrate**, escalate to **Arc**. If the failure occurs **within** the AFS installer/registration or is an AFS prerequisite/remediation (reboot, OS level, AFS version), own it in **CSS (AFS)**.

### **Intake Checklist (Decide CSS vs. Arc Quickly)**
Collect these up front to route correctly:

1. **OS & Build**: Confirm Windows Server is a supported **RTM** release (20162025). Unsupported/nonRTM  CSS advises customer to align to RTM.  
2. **Agent Versions**:  
   - Arc agent ** 1.55** (needed for SA benefits exposure).  
   - AFS agent ** v22** (needed for SA benefits and new gating).  
3. **Pending Reboot**: If flagged, have customer reboot before reattempting install/registration.  
4. **Install Path**: Extension vs. manual install (benefits **not** tied to the extension).  
5. **Logs** (attach to case):  
   - Arc Extension logs: `C:\ProgramData\GuestConfig\ExtensionLogs\` (status and extension pipeline).  
   - AFS installer logs (if available from the deployment status/AFS MSI).

### **Error Code Handling**

- **Arc Extension error codes are integers** (Arc convention), not the usual AFS hex codes. Use the code pattern to decide who owns triage.  
  - Integer codes surfaced **before AFS MSI**  **Arc**.  
  - AFS MSI/registration errors (hex patterns, AFSspecific messages)  **CSS (AFS)**.

**Examples**

**Example A  CSS (AFS) owns**  
- Symptom: Arc extension shows deployment succeeded, but AFS registration fails with pending reboot or unsupported OS.  
- Route: **CSS (AFS)** to remediate reboot/OS/AFS prerequisites and complete registration/topology.

**Example B  Escalate to Arc**  
- Symptom: Arc Connected Machine agent wont start; extension cannot reach apply state; repeated extension platform rollbacks before AFS MSI begins.  
- Route: **Azure Arc team** for guest agent/extension substrate.

**Example C  Benefits signal not present**  
- Symptom: AFS v22+ installed and registered; customer enabled SA benefits in Portal, but billing signal not recognized. Arc agent is < 1.55.  
- Route: **Ask customer to upgrade Arc agent to 1.55+**. If still missing after upgrade and AFS v22+, open with **Arc** for benefit signal/telemetry validation.

### Customer Messaging (If collaboration is required)
- Well handle **AFS installation/registration and topology**. If we see the issue is with the **Arc agent or extension platform**, well coordinate an **Arc** escalation.



## **Arc-enabled Windows servers | Troubleshooting**
<details close> 
<summary> You can view more details here, but keep in mind that the steps described are done to the best of our ability. If you encounter any support issues, please redirect them to the Azure Arc team as mentioned above.  </summary>
<br>

## **Key Notes for CSS Support Engineers**

*   **Scope**: Applies only to **Arc-enabled Windows servers**.
*   **Troubleshooting**:
    *   Verify **Arc connectivity** and **certificate installation**.
    *   Check **logs** in Azure portal for extension deployment issues.
*   **Security**:
    *   Ensure servers meet compliance and certificate requirements before installation.

***

### 1) Quick triage checklist

1.  **Arc status**: `azcmagent check`  Connected = **Yes**
2.  **Extension state**: Portal  Arc server  **Extensions** = **Provisioning succeeded**
3.  **OS & certs**: Windows Server 2016+ RTM; **Microsoft Root CA 2011** installed
4.  **Networking**: Outbound HTTPS (443) to Azure endpoints; proxy exceptions configured
5.  **Permissions**: Caller has `Azure Connected Machine Resource Administrator` (or equivalent) on the Arc server + required roles for Storage Sync
6.  **Services**: **Azure File Sync** services running after install
7.  **Registration**: Server registered with the **Storage Sync Service** and associated with a **Sync Group**

<details close> 
<summary>How to verify the Arc Status on the server.</summary>
<br>

**Note:** These procedures are considered best-effort recommendations, and direct engagement with the Azure ARC team is advised as necessary. If all other checks have been successfully validated on the agent side, further action can then be determined appropriately.


To check **Arc status internally** on the server, you use the **Azure Connected Machine Agent (azcmagent)** command-line tool. 

### **Command**

```powershell
& "C:\Program Files\AzureConnectedMachineAgent\azcmagent.exe" check
```

***

### **Expected Output**

*   Look for:
        Connected: Yes
    This means the server is successfully onboarded and communicating with Azure Arc.

***

### **Other Useful Flags**

*   **Show full metadata**:
    ```powershell
    & "C:\Program Files\AzureConnectedMachineAgent\azcmagent.exe" show
    ```
    Displays subscription, resource ID, region, and last heartbeat.

*   **Repair if unhealthy**:
    ```powershell
    & "C:\Program Files\AzureConnectedMachineAgent\azcmagent.exe" repair
    ```
    Attempts to fix connectivity issues.

***

### **Log Locations**

*   Agent logs:  
    `C:\ProgramData\AzureConnectedMachineAgent\Logs\gc\*`

***

### **CSS Quick Check**

*   If `Connected = No`:
    *   Validate outbound **443** to Azure endpoints.
    *   Check proxy settings:
        ```powershell
        netsh winhttp show proxy
        ```
    *   Restart the agent service:
        ```powershell
        Restart-Service AzureConnectedMachineAgent
        ```

</details>
<br>


***

### 2) Extension install fails (`Provisioning failed` / timeout)

**Symptoms**

*   Portal shows *Provisioning failed*
*   `az connectedmachine extension create` returns nonzero exit code
*   No agent binaries present after several minutes

**Likely causes**

*   Arc agent unhealthy or not connected
*   Missing outbound connectivity / proxy authentication issues
*   Insufficient RBAC to install extensions
*   Antimalware or EDR blocking installer

**What to check**

```powershell
# Arc agent health
& "C:\Program Files\AzureConnectedMachineAgent\azcmagent.exe" check

# List extension and status
Get-AzConnectedMachineExtension -MachineName "<ArcServerName>" -ResourceGroupName "<RG>"

# CLI view
az connectedmachine extension show \
  --name AzureFileSyncAgent --machine-name <ArcServerName> --resource-group <RG>
```

*   **Logs (Arc guest config / extensions)**
    *   `C:\ProgramData\AzureConnectedMachineAgent\Logs\gc\*`
    *   `C:\ProgramData\GuestConfig\extension_logs\*`
*   **Security tooling**: Review AV/EDR quarantine/blocks around the install time.

**Resolutions**

*   Restore Arc connectivity: `azcmagent connect` if needed; repair: `azcmagent repair`
*   Ensure outbound **443** and allow-list Azure endpoints used by Arc & extension content
*   Re-run with sufficient rights (or have an owner/admin apply)
*   Temporarily exclude installer paths in AV/EDR; reattempt install
*   Retry install:

```bash
az connectedmachine extension create \
  --name AzureFileSyncAgent \
  --machine-name <ArcServerName> \
  --resource-group <RG> \
  --publisher Microsoft.Azure.FileSync \
  --type AzureFileSyncAgent
```

### 3) Unsupported OS / Pre-req validation failure

**Symptoms**

*   Immediate failure with messages about OS version, platform, or architecture

**Likely causes**

*   Windows Server earlier than 2016, or nonRTM SKU
*   Attempting on **Linux** (not supported)
*   Missing **Microsoft Root Certificate Authority 2011**

**Resolutions**

*   Verify: `winver` and SKU; move to Windows Server **2016 or later**
*   Install / restore **Microsoft Root CA 2011** in **Trusted Root Certification Authorities**
*   Reattempt installation after prerequisites are met

***

### 4) Extension succeeded but File Sync services not present/running

**Symptoms**

*   Portal shows extension **Succeeded**, but Azure File Sync binaries/services are missing or stopped

**Likely causes**

*   Post-install task failed (service creation/start blocked)
*   Local policy or third-party tools prevented service install
*   Pending reboot

**What to check**

```powershell
Get-Service | Where-Object {$_.DisplayName -like "*File Sync*"} | Select Name, Status, StartType
```

*   **Event Viewer**  *Applications and Services Logs*  **Microsoft-FileSync-Agent/Operational**
*   **Windows Installer** logs, if available

**Resolutions**

*   Reboot the server; then verify services
*   Start services manually and set to **Automatic**
*   If absent, **uninstall & reinstall** the extension:

```bash
az connectedmachine extension delete --name AzureFileSyncAgent --machine-name <ArcServerName> --resource-group <RG>
# then create again
```

***

### 5) Server registration to Storage Sync Service fails

<!-- [We can review it again to maintain consistency.]
**Symptoms**

*   Agent installed, but server cannot **register** with the Storage Sync Service (SSS)
*   Registration UI/PowerShell returns authentication or connectivity errors

**Likely causes**

*   Missing RBAC on the **Storage Sync Service** resource
*   TLS inspection/proxy interfering with Azure Files/management endpoints
*   Time skew or invalid system certificates

**What to check**

*   Caller role on SSS: `Microsoft.StorageSync/*` operations permitted (e.g., **Owner**, **Contributor**, or **Storage File Data SMB Share Elevated Contributor** as applicable)
*   Time sync: `w32tm /query /status`
*   Proxy settings: `netsh winhttp show proxy` and system proxy policy

**Resolutions**

*   Grant proper role on **Storage Sync Service** resource scope
*   Bypass TLS inspection for Azure management/file endpoints; ensure outbound 443
*   Correct time sync and machine trust chain; reattempt registration
-->

- [File-sync-troubleshoot-agent-registration-failures_Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1598715)

***

### 6) Sync not starting or stays in pending state

<!-- [We can review it again to maintain consistency.]
**Symptoms**

*   Registered server appears in SSS (Storage Sync Service), but **Sync Group** doesnt progress
*   Cloud endpoint/Server endpoint health is degraded

**Likely causes**

*   Server endpoint path invalid or lacks NTFS permissions
*   Azure file share quota/throughput limits reached
*   Network egress blocked to Azure Files region
*   File screening, thirdparty filters, or onaccess scanning interfering

**What to check**

*   **Server endpoint** path exists and service account (Local System) has full control
*   Azure Storage account metrics/alerts; check throttling
*   Event Logs: **Microsoft-FileSync-Agent/Operational**
*   AV/EDR realtime protection exclusions for File Sync working directories

**Resolutions**

*   Fix NTFS permissions and confirm path availability
*   Increase Azure file share quota or adjust workload profile
*   Add AV/EDR exclusions recommended for Azure File Sync
*   Validate region egress; test with `Test-NetConnection <storageaccount>.file.core.windows.net -Port 443`
-->

- [File-Not-Syncing-from-File-Share-to-Server_Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495829)
- [TSG-193-AFS-Investigate-Missing-Server-Telemetry-or-Server-Showing-No-Activity_Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/784049)

***

### 7) Proxy / TLS interception issues

**Symptoms**

*   Installation or sync works only intermittently
*   Errors referencing SSL/TLS handshake, `CERTIFICATE_VERIFY_FAILED`, or 407 Proxy Auth

**Likely causes**

*   Auth proxy not configured for system context
*   TLS interception without trusted issuer root on the server
*   PAC file not honored by service context

**What to check**

```powershell
netsh winhttp show proxy
# If using system proxy, ensure service accounts can reach it
```

*   Confirm the **issuing CA** of intercepted certificates is trusted by **Local Computer  Trusted Root CAs**
*   Consider static proxy config for services (WinHTTP), not just user-level

**Resolutions**

*   Configure **WinHTTP** proxy (`netsh winhttp set proxy <proxy:port>`), or clear if not intended
*   Add corporate TLS inspection root to **Local Computer** store, or exempt Azure endpoints from inspection
*   Ensure proxy allows longlived connections and WebSockets if applicable

***

### 8) RBAC / Authorization failures

**Symptoms**

*   API returns `403`, portal actions disabled, or extension operations blocked

**Likely causes**

*   Missing roles on the **Arc server** resource or SSS

**Resolutions**

*   For extension lifecycle: assign **Azure Connected Machine Resource Administrator** (minimum) on the Arc servers resource scope
*   For Storage Sync operations: assign appropriate roles on **Storage Sync Service** and **Storage Account** (data-plane roles for Azure Files if needed)

***

### 9) Corrupt extension state / stuck in `Uninstalling` or `Updating`

**Symptoms**

*   Extension shows stale state and wont transition

**What to check**

*   Arc guest config logs under:
    *   `C:\ProgramData\AzureConnectedMachineAgent\Logs\gc\`
    *   `C:\ProgramData\GuestConfig\extension_logs\AzureFileSyncAgent\*`

<!-- 

- [Arc Extension Queries]()
-->

**Resolutions**

1.  **Force delete** the extension:
    ```bash
    az connectedmachine extension delete \
      --name AzureFileSyncAgent \
      --machine-name <ArcServerName> \
      --resource-group <RG>
    ```
2.  Wait \~23 minutes for state to converge; refresh Portal
3.  **Re-create** the extension (see install commands)
4.  If persists, **repair Arc agent**:
    ```powershell
    & "C:\Program Files\AzureConnectedMachineAgent\azcmagent.exe" repair
    ```

***

### 10) Post-install verification fails (no heartbeat to service)

<!-- [We can review it again to maintain consistency.]
**Symptoms**

*   Portal marks extension succeeded, but (Storage Sync Service) shows **Server Offline**

**Likely causes**

*   Outbound to Storage Sync service endpoints blocked
*   Local firewall blocking agent service egress
*   Service crashes (faulting module logged)

**What to check**

*   Windows Defender Firewall rules for the agent
*   Event logs for application crashes
*   Network egress test to Azure Files/management endpoints

**Resolutions**

*   Open outbound 443 and required URLs to your Azure region
*   Create explicit allow rules for the agent executables
*   Update to latest agent via extension update; verify after reboot
-->

- [Azure Arc Extension installation troubleshooting](Pending-Update)

***

### 11) Uninstall/rollback required

**Goal**

*   Cleanly remove the extension and (optionally) unregister the server

**Procedure**

```bash
# Remove extension
az connectedmachine extension delete \
  --name AzureFileSyncAgent \
  --machine-name <ArcServerName> \
  --resource-group <RG>

# Validate removal
az connectedmachine extension list --machine-name <ArcServerName> --resource-group <RG>
```

*   If decommissioning: unregister from **Storage Sync Service** first to avoid orphaned metadata.

***

## Useful commands

```powershell
# Arc agent health & metadata
& "C:\Program Files\AzureConnectedMachineAgent\azcmagent.exe" show
& "C:\Program Files\AzureConnectedMachineAgent\azcmagent.exe" check

# PowerShell extension view
Get-AzConnectedMachineExtension -MachineName "<ArcServerName>" -ResourceGroupName "<RG>" |
  Select Name, ProvisioningState, Type

# CLI extension lifecycle
az connectedmachine extension list   --machine-name <ArcServerName> --resource-group <RG>
az connectedmachine extension show   --name AzureFileSyncAgent --machine-name <ArcServerName> --resource-group <RG>
az connectedmachine extension delete --name AzureFileSyncAgent --machine-name <ArcServerName> --resource-group <RG>
```

*** 

**Key log locations**

*   Arc guest config / extensions: `C:\ProgramData\AzureConnectedMachineAgent\Logs\gc\*`, `C:\ProgramData\GuestConfig\extension_logs\*`
*   Azure File Sync agent (post-install): *Event Viewer*  **Applications and Services Logs  Microsoft-FileSync-Agent/Operational**

</details>
<br>

***


### Error code reference and remediation
 
| **Error Message** | **Error Code** | **Remediation steps** |
|-------------------|----------------|------------------------|
| Cannot install Azure File Sync agent because .NET Framework 4.7.2 or later is required. Install the latest .NET Framework and try again | 206 | Install .NET Framework 4.7.2 or later, then restart your computer. |
| Azure File Sync agent is already installed. No further action needed. | 0 | No action required. The extension is installed, but no customization is applied. |
| The Azure File Sync agent is only supported on RTM (Release to Manufacturing) versions of supported operating systems. | 51 | Azure File Sync agent and extension are supported only on RTM versions of Windows Server 2016, 2019, 2022, and 2025. |
| Proxy settings error. `UseCustomProxy` is enabled but ProxyAddress is missing or invalid. ProxyAddress must be specified without port and length must be less than 255 characters. | 201 | Ensure that the `ProxyAddress` is specified and doesn't exceed 255 characters in length. |
| Proxy settings error. `UseCustomProxy` is enabled but ProxyPort is missing or invalid. Proxy port must be a number between 1 and 65535 | 202 | Provide a valid `ProxyPort` (a numeric value between 1 and 65535) when `UseCustomProxy` is enabled. |
| Proxy settings error. `ProxyAuthRequired` is enabled but ProxyUsername is missing or invalid. `ProxyUsername` length must be between 3 and 255 characters | 203 | Ensure `ProxyUsername` is specified and its length is between 3 and 255 characters. |
| Proxy settings error. `ProxyAuthRequired` is enabled but ProxyPassword is missing or empty | 204 | Provide a non-empty `ProxyPassword` when `ProxyAuthRequired` is enabled. |
| A system reboot is pending due to Storage Sync file rename operations. Restart your server before installing the Azure File Sync agent. | 83 | A reboot is required. Restart the server before installing the agent again. |
| The file signature is not valid. Or Signature validation failed for the downloaded MSI file | 86 | The installer file might be corrupted or tampered with. Download the MSI file again from a trusted source. |
| Certificate chain validation failed. | 86 | Ensure the required root certificates are installed. Refer to [Prerequisites for AKS Edge Essentials offline installation](/azure/aks/aksarc/aks-edge-howto-offline-install).<br><br>If using a proxy, ensure the following domains are bypassed:<br>`login.microsoftonline.com`, `management.azure.com`, `go.microsoft.com`, `download.microsoft.com`, `download.windowsupdate.com`, `crl.microsoft.com`, `oneocsp.microsoft.com`, `ocsp.msocsp.com`, `www.microsoft.com`.<br><br>Restart the computer to apply any updates. |
| Azure File Sync agent download or configuration failed. Details: Failed to configure auto update settings: Agent install directory not found in registry. Please check the installation. | 214 | Open an elevated PowerShell session and check if .NET 4.7.2 or higher is installed:<br>```$releaseKey = (Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full" -ErrorAction SilentlyContinue).Release```<br><br>If `$releaseKey` is less than `461808`, .NET 4.7.2 isn't installed. In this case, download and install .NET Framework 4.7.2 or later from the [official .NET download site](https://dotnet.microsoft.com/download/dotnet-framework). |

***

**Key Log locations**

Below are the paths from which logs should be collected and shared for case or IcM purposes related to the AFS extension.
 
* **C:\ProgramData\GuestConfig\extension_logs\Microsoft.StorageSync.AzureFileSyncAgentExtension** // share all the files from the datetime when the failure happened
* **C:\Packages\Plugins\Microsoft.StorageSync.AzureFileSyncAgentExtension\1.0.9\Scripts** // search for *.log fil(s) in this path (and sub paths)

> Note: if a new version is released (say 1.0.10)then path to be updated with that 

**Log location snippets**


![AFSlogs.png](/.attachments/SME-Topics/Azure-Files-Sync/Arc-Ext-FileSync/AFSlogs.png)
![arcextension.png](/.attachments/SME-Topics/Azure-Files-Sync/Arc-Ext-FileSync/arcextension.png)

Kusto Tables - 

https://microsoft.sharepoint.com/teams/KailaniOps/_layouts/Doc.aspx?sourcedoc={A30352F6-6C36-428E-BF14-332F262DE98D}&wd=target%28TSGs.one%7CAD1BCE18-9AEB-4F4D-B8A0-BE8ECE51286E%2FKusto%20Queries%7C0875678B-8273-4604-B202-8EA36216A761%2F%29&wdpartid={60A88A0B-7830-0F68-3BF8-3E21BFF8A907}{1}&wdsectionfileid={31D3D0CB-68BE-40FF-A8D2-0FAEC68E5B73}
onenote:https://microsoft.sharepoint.com/teams/KailaniOps/SiteAssets/Kailani%20Operations/TSGs.one#Kusto%20Queries&section-id={AD1BCE18-9AEB-4F4D-B8A0-BE8ECE51286E}&page-id={0875678B-8273-4604-B202-8EA36216A761}&end

***

## CSS escalation 

*   Capture: **exact error**, **activity ID / correlation ID**, **UTC timestamp**, **region**, **subscription & resource IDs**, **proxy details**, **log bundles** above.
*   Confirm **roles** and **network** prior to product escalation.
*   If multiple servers are impacted simultaneously, look for **proxy/PKI** changes or **policy rollouts** in the same window.


- [IaaS Escalation](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/869944/IaaS-Storage-Escalation_Storage?anchor=how-to-approach-file-sync-escalations)

***

# Training 

- [[New Feature - CSS Deep Dive] Arc Extension for Azure File Sync-20251117_110313-Meeting Recording](https://microsofteur.sharepoint.com/teams/dante/Lists/ListProd/DispForm.aspx?ID=744)

***

## **More Information**

- [Install the Azure File Sync Agent on Arc-enabled Windows Servers](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-extension?tabs=azure-portal)
- [Troubleshoot Azure File Sync agent installation and server registration](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/files/file-sync/file-sync-troubleshoot-installation#agent-installation-via-azure-arc-extension)
- [What's new with Azure Connected Machine agent](https://learn.microsoft.com/en-us/azure/azure-arc/servers/agent-release-notes)



::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md
:::