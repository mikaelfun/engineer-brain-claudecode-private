---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Third Party Connectors/SAP/[Procedure] - Exclude SAP non-production systems from billing"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FData%20Ingestion%20-%20Connectors%2FThird%20Party%20Connectors%2FSAP%2F%5BProcedure%5D%20-%20Exclude%20SAP%20non-production%20systems%20from%20billing"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [Procedure] Exclude SAP Non-Production Systems from Billing

## Introduction

The Microsoft Sentinel solution for SAP applications bills customers per production SAP systems per hour. Non-production systems are free of charge. However, some customers have non-production systems marked as production in SAP table T000, leading to over-charging.

## Steps

### Step 1: Request the hardware key from the customer
- Customer logs on to SAP as administrator
- Runs transaction code `SLICENSE`
- On License Administration > System Data, copies the Hardware Key value
- Customer sends the hardware key of the system that is marked as production but is actually non-production

### Step 2: Request customer to add permissions for the Microsoft agent
Customer needs to add RFC authorization for function modules `/SDF/SLIC_READ_LICENSES_700` and `SLIC_LOCAL_HWKEY`:
- Transaction `PFCG` > Role (e.g. `/MSFTSEN/SENTINEL_CONNECTOR`) > Authorizations
- Add Authorization Object: `S_RFC` (Activity: 16 Execute, RFCTYPE: FUGR, RFC_NAME: `/SDF/SLIC_READ_LICENSES_700`)
- Add Authorization Object: `S_ADMI_FCD` (Field: S_ADMI_FCD, Activity: PADM)
- Save and Generate

### Step 3: Open ICM ticket to Sentinel for SAP team
- Service: Microsoft Azure Sentinel
- Owning team: BizApps - SAP, Dynamics and Power Platform
- Incident Type: Service Request
- Severity: 3
- Include: customer name, hardware key, reason for exclusion

### Step 4: Ask customer to update the agent
After PG updates agent code with hardware key, customer updates the agent per [container update reference](https://learn.microsoft.com/en-us/azure/sentinel/sap/reference-update).
