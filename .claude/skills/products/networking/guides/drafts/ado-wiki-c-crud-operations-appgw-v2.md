---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Expert Troubleshooting/Ultimate Guide on CRUD operations AppGW v2 Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FUltimate%20Guide%20on%20CRUD%20operations%20AppGW%20v2%20Troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Ultimate Guide on CRUD Operations AppGW v2 Troubleshooting

> **WARNING**: Do NOT share infrastructure details with customers.

## Quick Triage Checklist

```
Time of the issue (UTC):
Operation Type (Create / Update / Delete):
Error Message:

Customer Subscription ID:
AppGW Resource Id:
SKU:
Region:

Gateway Subscription ID:
VMSS Resource ID:

ARM Correlation ID (= NRP CorrelationRequestID):
NRP Operation ID (= GatewayManager Activity ID):
Jarvis Control Plane link: https://portal.microsoftgeneva.com/s/3F1E0C4
```

## Control Plane Flow

```
Customer Subscription:
  Step 1: ARM → Step 2: NRP → Step 3: Gateway Manager

Gateway Subscription:
  Step 4: ARM → Step 5: CRP + NRP + KeyVault RP
```

Not all operations progress to the final step — failures can occur at any point.

## Glossary
- **ARM**: Azure Resource Manager
- **NRP**: Network Resource Provider
- **GWM**: Gateway Manager
- **CRP**: Compute Resource Provider
- **KVS**: Key Vault Service
- **VMSS**: Virtual Machine Scale Set

## Where to Start

### Option 1: Using ASC
Find the failed operation in ASC and open the NRP Jarvis link. See wiki: [Failed State on Application Gateway](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1622100/Failed-State-on-Application-Gateway).

### Option 2: Using Ocular
Use Ocular (aka.ms/ocular) to track the first Failed Operation. Filter by AppGW Subscription, Resource Group, and timestamp.

**Important**: If there are multiple Failed operations, start with the FIRST one — later failures often cascade.

## Jarvis Control Plane Dashboard

**Primary Link**: [Jarvis Control Plane Dashboard](https://portal.microsoftgeneva.com/s/3F1E0C4)
- Input: NRP Operation ID or Gateway Manager Activity ID
- Aggregates logs from ARM, NRP, GWM, and CRP in one view
- Displays timestamps, correlation IDs, and status codes for every stage

**Alternative Link**: [Alt Jarvis Dashboard](https://portal.microsoftgeneva.com/s/EAF14C05)

### Dashboard Sections

#### Customer Subscription Logs
1. **Quick Debug** panel (not always populated — can give immediate insight)
2. **NRP FrontendOperationEtwEvent** logs
3. **AsyncWorkerLogs**, **Gateway Operations**, **Tenant logs**

#### Gateway Subscription Logs
- CRP and NRP entries
- Custom Script Extension failures visible here

## ARM, NRP, CRP Tips

### ARM - EventServiceEntries
- Shows 3 key status entries per operation: Started → Accepted → Succeeded/Failed
- Use for quick snapshot when ASC/Ocular feel overwhelming
- ARM CorrelationID = NRP CorrelationRequestID

### NRP - FrontendOperationEtwEvent
- Detailed steps of network resource validation
- Search for "Exception", "Failed", or "Error"
- Bridge between ARM and GWM

### CRP - ContextActivity
- [CRP ContextActivity Jarvis](https://portal.microsoftgeneva.com/s/84DE39B2)
- Trace levels: 8=Informational, 4=Warning, 2=Error
- Filter: `| where tracelevel < 8`
- **"Invoking Action" trick**: Shows what the operation is about + JSON payload of changes

#### CRP Kusto Query
```kql
cluster("azcrp.kusto.windows.net").database('crp_allprod').ContextActivity
| where PreciseTimeStamp >= datetime(YYYY-MM-DDThh:mm:ssZ) and PreciseTimeStamp <= datetime(YYYY-MM-DDThh:mm:ssZ)
| where subscriptionId has "subscriptionID"
| where * has "VMSSResourceGroupName"
| where * has "appgw"
//| where * has "Invoking Action"
| project TIMESTAMP, message
```

## Related Wikis
- [Failed State on Application Gateway](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1622100/Failed-State-on-Application-Gateway)
- [AppGW Failed due to Key Vault](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/448032/AppGW-v2-Failed-State-Due-to-KeyVault-Failure)
- [Failed due to "Input String was not in a correct format"](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/2262384/Failed-State-Input-string-was-not-in-a-correct-format)
- [ILBDeploymentFailureDueToPrivateIPInUse](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/614427/AppGW-v2-CRUD-Operations-Failing-Due-to-the-ApplicationGatewayILBDeploymentFailureDueToPrivateIPInUse-error)

## FAQ

**Q: My operation didn't reach Gateway Manager.**
A: Expected in some cases. Template validation failures stop at ARM; others may halt at NRP. Trace each step to identify where it stopped.

**Q: Where are Custom Script Extension logs?**
A: `/var/log/waagent.log` (agent-level) and `/var/log/azure/custom-script/handler.log` (execution details). These are on VMSS instances — customer doesn't have access.
