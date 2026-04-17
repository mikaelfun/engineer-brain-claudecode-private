---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Processes/Sovereign Cloud/[Archive] Get JIT Access"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FProcesses%2FSovereign%20Cloud%2F%5BArchive%5D%20Get%20JIT%20Access"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Pre-Requisite
SAW access for JIT: go to https://cloudmfa-support.azurewebsites.net/SawSupportServices/SAVM, request access

## Access Fairfax logs via escort - accessing Azure Government Kusto logs

### 1) Log into MSVPN

### 2) Navigate to Fairfax JIT portal
https://jitaccess.security.core.usgovcloudapi.net/

### 3) Request Escort session
https://jitaccess.security.core.usgovcloudapi.net/WorkFlowTempAccess.aspx

**Notes when using the form:**
- If you use _Work Item Source_ as ICM, then the _Work Item Id_ is the ICM number or Task ID
- If you use _Work Item Source_ as Other, then the _Work Item Id_ is the DFM ticket number
- Select Escort, RDP (Jumpbox only), Data center, Debugging, Jumpbox name, and Remote Desktop

### 4) JIT approval
Escort will contact you via Teams (1 to 8 min) and provide RDP on jumpbox. Ask the escort for Azure portal or Kusto access.

### 5) Open the RDP
Paste the command the Escort provides you into a PowerShell Prompt.

### 6) Open Kusto - Add connection - Add Clusters

**Purview Babylon & Data Scan Logs:**

| Cloud | Kusto Name |
|-------|------------|
| Purview Fairfax US Virginia | https://purviewadxbn.usgovvirginia.kusto.usgovcloudapi.net |
| Purview Mooncake | https://purviewadxcn3.kusto.chinacloudapi.cn:433/BabylonMdsLogs |
| ADF Fairfax | ADMS: https://azuredmusgov.kusto.usgovcloudapi.net:443/AzureDataMovement / ADF: https://adfusgovtexas.kusto.usgovcloudapi.net:443/azuredatafactorygov |

> Note: there is an authentication issue on Fairfax jumpbox to access log via Geneva portal, please ask operator to open Kusto to query log.

JIT portal: https://aka.ms/jit
