# Purview Sovereign Cloud 工具与访问 — 排查工作流

**来源草稿**: `ado-wiki-a-css-alias-sovereign-cloud.md`, `ado-wiki-a-jit-access-gov-cloud.md`, `ado-wiki-gov-cloud-overview.md`, `ado-wiki-sovereign-cloud-faqs.md`
**Kusto 引用**: 无
**场景数**: 20
**生成日期**: 2026-04-07

---

## Scenario 1: Team level Access
> 来源: ado-wiki-a-css-alias-sovereign-cloud.md | 适用: 未标注

### 排查步骤
| Team | Security Groups | Require SAW | Require AME | Require CME/USME | JIT & Escort session | Kusto Access | Geneva | Subscription access |
|--|--|--|--|--|--|--|--|--|
| Engineering | AME\TM-Babylon | **Yes** | **Yes** | Optional | **Yes** | JIT & Escort | JIT & Escort | JIT & Escort |
| CSS | AME\TM-Babylon-CSS [Yet to create] | **Yes** | **Yes** | Optional | **Yes** | JIT & escort | JIT & Escort | No |

`[来源: ado-wiki-a-css-alias-sovereign-cloud.md]`

---

## Scenario 2: Pre-Requisite
> 来源: ado-wiki-a-jit-access-gov-cloud.md | 适用: 未标注

### 排查步骤
SAW access for JIT: go to https://cloudmfa-support.azurewebsites.net/SawSupportServices/SAVM, request access

`[来源: ado-wiki-a-jit-access-gov-cloud.md]`

---

## Scenario 3: 2) Navigate to Fairfax JIT portal
> 来源: ado-wiki-a-jit-access-gov-cloud.md | 适用: 未标注

### 排查步骤
https://jitaccess.security.core.usgovcloudapi.net/

`[来源: ado-wiki-a-jit-access-gov-cloud.md]`

---

## Scenario 4: 3) Request Escort session
> 来源: ado-wiki-a-jit-access-gov-cloud.md | 适用: 未标注

### 排查步骤
https://jitaccess.security.core.usgovcloudapi.net/WorkFlowTempAccess.aspx

**Notes when using the form:**
- If you use _Work Item Source_ as ICM, then the _Work Item Id_ is the ICM number or Task ID
- If you use _Work Item Source_ as Other, then the _Work Item Id_ is the DFM ticket number
- Select Escort, RDP (Jumpbox only), Data center, Debugging, Jumpbox name, and Remote Desktop

`[来源: ado-wiki-a-jit-access-gov-cloud.md]`

---

## Scenario 5: 4) JIT approval
> 来源: ado-wiki-a-jit-access-gov-cloud.md | 适用: 未标注

### 排查步骤
Escort will contact you via Teams (1 to 8 min) and provide RDP on jumpbox. Ask the escort for Azure portal or Kusto access.

`[来源: ado-wiki-a-jit-access-gov-cloud.md]`

---

## Scenario 6: 5) Open the RDP
> 来源: ado-wiki-a-jit-access-gov-cloud.md | 适用: 未标注

### 排查步骤
Paste the command the Escort provides you into a PowerShell Prompt.

`[来源: ado-wiki-a-jit-access-gov-cloud.md]`

---

## Scenario 7: 6) Open Kusto - Add connection - Add Clusters
> 来源: ado-wiki-a-jit-access-gov-cloud.md | 适用: Mooncake ✅

### 排查步骤
**Purview Babylon & Data Scan Logs:**

| Cloud | Kusto Name |
|-------|------------|
| Purview Fairfax US Virginia | https://purviewadxbn.usgovvirginia.kusto.usgovcloudapi.net |
| Purview Mooncake | https://purviewadxcn3.kusto.chinacloudapi.cn:433/BabylonMdsLogs |
| ADF Fairfax | ADMS: https://azuredmusgov.kusto.usgovcloudapi.net:443/AzureDataMovement / ADF: https://adfusgovtexas.kusto.usgovcloudapi.net:443/azuredatafactorygov |

> Note: there is an authentication issue on Fairfax jumpbox to access log via Geneva portal, please ask operator to open Kusto to query log.

JIT portal: https://aka.ms/jit

`[来源: ado-wiki-a-jit-access-gov-cloud.md]`

---

## Scenario 8: What is Gov Cloud?
> 来源: ado-wiki-gov-cloud-overview.md | 适用: 未标注

### 排查步骤
GCC, GCC High, and DoD are all different Gov tenants based on different restriction/compliance requirements.

`[来源: ado-wiki-gov-cloud-overview.md]`

---

## Scenario 9: How to Identify Gov Cloud Tenant
> 来源: ado-wiki-gov-cloud-overview.md | 适用: 未标注

### 排查步骤
Check the M365 Tenant ID. Gov Cloud domain is `https://portal.azure.us/`

`[来源: ado-wiki-gov-cloud-overview.md]`

---

## Scenario 10: Gov Cloud Identity Mapping
> 来源: ado-wiki-gov-cloud-overview.md | 适用: 未标注

### 排查步骤
| Tenant Type | Cloud | Identity Provider |
|-------------|-------|-------------------|
| GCC | Public Cloud (Azure Commercial) | Microsoft Entra Public Identity |
| GCC High | Gov Cloud (Fairfax) | Microsoft Entra Government Identity |
| DoD | Gov Cloud (Fairfax) | Microsoft Entra Government Identity |

`[来源: ado-wiki-gov-cloud-overview.md]`

---

## Scenario 11: Cross-Cloud Scanning Rules
> 来源: ado-wiki-gov-cloud-overview.md | 适用: 未标注

### 排查步骤
- Cross cloud scanning is **NOT** possible (e.g., West US 2 to US Gov Virginia)
- Cross region scanning **within same cloud** is possible (e.g., US Gov Texas to US Gov Virginia)

`[来源: ado-wiki-gov-cloud-overview.md]`

---

## Scenario 12: Gov Regions
> 来源: ado-wiki-gov-cloud-overview.md | 适用: 未标注

### 排查步骤
- US Gov Arizona
- US Gov Virginia
- US Gov Texas

`[来源: ado-wiki-gov-cloud-overview.md]`

---

## Scenario 13: Fabric / Power BI Government URLs
> 来源: ado-wiki-gov-cloud-overview.md | 适用: 未标注

### 排查步骤
| Tenant | URL |
|--------|-----|
| Commercial | https://app.powerbi.com |
| GCC | https://app.powerbigov.us |
| GCC High | https://app.high.powerbigov.us |
| DoD | https://app.mil.powerbigov.us |

`[来源: ado-wiki-gov-cloud-overview.md]`

---

## Scenario 14: Key Limitations
> 来源: ado-wiki-gov-cloud-overview.md | 适用: 未标注

### 排查步骤
1. **GCC ≠ Gov Power BI**: GCC maps to public cloud; GCC High/DoD map to Gov cloud. Purview in Azure Commercial cannot scan Power BI in Azure Government.
2. **Gov Purview + Fabric**: Gov Cloud Purview can only connect to Government Fabric if tenant is GCC.
3. **Unsupported sources in Azure Government**: Power BI (non-GCC), Amazon RDS, Amazon S3

`[来源: ado-wiki-gov-cloud-overview.md]`

---

## Scenario 15: Common Error
> 来源: ado-wiki-gov-cloud-overview.md | 适用: 未标注

### 排查步骤
If Purview is Commercial but Fabric/Power BI is Government, test connection fails with "PowerBI administrator API could not fetch basic metadata and lineage" — Access succeeds but Assets/Lineage/Enhanced fail.

`[来源: ado-wiki-gov-cloud-overview.md]`

---

## Scenario 16: References
> 来源: ado-wiki-gov-cloud-overview.md | 适用: 未标注

### 排查步骤
- [Cloud feature availability](https://learn.microsoft.com/en-us/purview/feature-availability#azure-government-guidance-and-recommendations)
- [Power BI for US Government](https://learn.microsoft.com/en-us/power-bi/enterprise/service-govus-overview)
- [Region pairing](https://learn.microsoft.com/en-us/azure/azure-government/documentation-government-welcome#region-pairing)

`[来源: ado-wiki-gov-cloud-overview.md]`

---

## Scenario 17: How to check Purview Kusto logs on Sovereign cloud
> 来源: ado-wiki-sovereign-cloud-faqs.md | 适用: Mooncake ✅

### 排查步骤
**NOTE:** Unlike public cloud, Sovereign clouds like Mooncake and Fairfax have higher security requirements and Kusto logs of those clouds cannot be viewed directly on dev machines.

1. Open Kusto explorer and add connection, then the logs can be used like in public cloud.
2. More details like cluster info and add connection settings:
   - **Mooncake**: dSTS-Federated auth, cluster: `https://purviewadxcn3.chinanorth3.kusto.chinacloudapi.cn`
   - **Fairfax**: JIT access via SAVM, cluster: `https://purviewadxbn.usgovvirginia.kusto.usgovcloudapi.net`

`[来源: ado-wiki-sovereign-cloud-faqs.md]`

---

## Scenario 18: How to check ADF Kusto logs on Sovereign cloud
> 来源: ado-wiki-sovereign-cloud-faqs.md | 适用: 未标注

### 排查步骤
1. ADF Kusto logs on Sovereign cloud have to be accessed from Escort jump box through JIT.
2. Follow JIT process to create ICM for access to open the JIT portal.
3. After JIT approved, ICM PG will provide the jump box info.
4. Kusto explorer is installed on the jump box and you can add Purview Kusto connection there.

`[来源: ado-wiki-sovereign-cloud-faqs.md]`

---

## Scenario 19: How to login different Purview portal?
> 来源: ado-wiki-sovereign-cloud-faqs.md | 适用: Mooncake ✅

### 排查步骤
| Cloud | Portal URL |
|-------|-----------|
| Public | https://portal.azure.com |
| Mooncake | https://portal.azure.cn |
| Fairfax | https://portal.azure.us |

`[来源: ado-wiki-sovereign-cloud-faqs.md]`

---

## Scenario 20: How to check Jarvis/Geneva logs in sovereign clouds
> 来源: ado-wiki-sovereign-cloud-faqs.md | 适用: Mooncake ✅

### 排查步骤
Geneva endpoints are different between clouds:

| | Public | Mooncake | Fairfax |
|--|--------|----------|---------|
| Geneva Endpoint | Diagnostics Prod | CA Mooncake | CA Fairfax |

Select the correct endpoint in Geneva portal based on the cloud environment.

`[来源: ado-wiki-sovereign-cloud-faqs.md]`

---
