---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Microsoft First Party Connectors/Dynamics 365 Data connector - missing or delayed logs in MS Sentinel"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FData%20Ingestion%20-%20Connectors%2FMicrosoft%20First%20Party%20Connectors%2FDynamics%20365%20Data%20connector%20-%20missing%20or%20delayed%20logs%20in%20MS%20Sentinel"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Dynamics 365 Data connector - missing logs/delayed logs in MS Sentinel

## Summary

This article provides troubleshooting guidance for addressing issues related to missing or delayed Dynamics 365 logs in Microsoft Sentinel. Dynamics 365 logs are ingested through the Office Audit logs pipeline. Logs must first be available in Office Audit logs for ingestion into Sentinel. Generally, logs take 60-90 minutes to become available, but delays may occur due to various reasons or outages requiring investigation.

Refer to the following documentation for more information:
[Audit Search FAQ](https://learn.microsoft.com/en-us/purview/audit-search?tabs=microsoft-purview-portal#frequently-asked-questions)

## Reported and observed symptoms

### Symptoms

- Missing or delayed Dynamics 365 logs in Microsoft Sentinel.

### Environment Details

- Microsoft Sentinel workspace connected to Dynamics 365 logs.
- Logs ingested via Office Audit logs pipeline.
- Impact may occur in production environments, as this connector is unavailable for sandbox environments.

## Cause

Dynamics 365 logs rely on the Office Audit logs pipeline for ingestion into Sentinel. Delays or missing logs could occur due to several reasons, such as:

- Sentinel workspace health issues.
- Missing workspace or tenant permissions.
- Licensing prerequisites for the Dynamics 365 data connector not being met.
- Microsoft Purview auditing not enabled or configured properly.
- Dynamics 365 production environment audit settings not enabled.
- Outages or latency in the Office Audit logs pipeline.

## Mitigation steps

### Step 1: Check Sentinel workspace health

Confirm the health of the Microsoft Sentinel workspace and verify if the latency issue is affecting only Dynamics 365 audit logs.

### Step 2: Run diagnostic queries in Sentinel workspace

Use the following queries to analyze delays in Dynamics 365 logs ingestion:

```kusto
let startDate = ago(30d);
Dynamics365Activity
| where TimeGenerated > startDate
| extend LatencyInHours = datetime_diff('hour', ingestion_time(), TimeGenerated)
| project TimeGenerated, ingestion_time(), LatencyInHours
| summarize avg(LatencyInHours) by bin(TimeGenerated, 1h)
| sort by avg_LatencyInHours desc
```

```kusto
let startDate = ago(30d);
Dynamics365Activity
| where TimeGenerated > startDate
| extend LatencyInHours = datetime_diff('hour', ingestion_time(), _TimeReceived)
| project TimeGenerated, ingestion_time(), LatencyInHours
| summarize avg(LatencyInHours) by bin(TimeGenerated, 1h)
| sort by avg_LatencyInHours desc
```

### Step 3: Verify connector prerequisites

Ensure the following prerequisites are met for the Dynamics 365 data connector:

- **Workspace permissions:** Users must have read and write permissions on the Log Analytics workspace.
- **Administrator roles:** Security administrator role or equivalent permissions on the Microsoft Sentinel workspace tenant.
- **Environment requirements:** Dynamics 365 data connector is only available for production environments.
- **Licensing:** Each admin audit user needs a Microsoft 365 E1 license or higher. Refer to [Microsoft Dataverse and model-driven apps activity logging](https://learn.microsoft.com/en-us/power-platform/admin/enable-use-comprehensive-auditing#requirements).
- **Audit logging enabled:** Audit logging must be enabled in Microsoft Purview. Refer to [Turn auditing on or off](https://learn.microsoft.com/en-us/purview/audit-log-enable-disable).

### Step 4: Check logs in Microsoft Purview compliance portal

If logs are missing or delayed in Microsoft Sentinel, check their availability in the Microsoft Purview compliance portal. Use the following steps:

1. Navigate to the [Microsoft Purview compliance portal](https://compliance.microsoft.com/).
2. Set **Record type** as **CRM** and **Activities** as **All Dynamics 365 activities**.

Refer to [Review your audit data](https://learn.microsoft.com/en-us/power-platform/admin/enable-use-comprehensive-auditing#review-your-audit-data-using-reports-in-microsoft-purview-compliance-portal).

### Step 5: Verify Dynamics 365 audit settings

If logs are missing in Purview, confirm audit settings in your Dynamics 365 production environment:

1. Go to the [Power Platform Admin Center (PPAC)](https://aka.ms/ppac).
2. Select **Environments** from the left menu.
3. Choose the production environment to check.
4. Click **Settings** and navigate to **Audit and logs** > **Audit settings**.

Ensure the following options are enabled:

- **Start Auditing**
- **Log Access**
- **Read Logs**

Adjust the Purview data retention period if needed. Save any changes made by clicking the **Save** button.

For table-level audit configuration, refer to [Enable auditing](https://learn.microsoft.com/en-us/power-platform/admin/enable-use-comprehensive-auditing#enable-auditing).

### Step 6: Engage additional support if necessary

If the issue persists, engage Dynamics 365 or Microsoft Purview teams for further assistance. Use the following SAPs and Queue names:

#### Dynamics 365 Support

- **SAP:** Dynamics/Dynamics 365 Sales/Product/Unable to add products
- **Queue Name:** MSaaS D365-GE-Application

#### Microsoft Purview Support

- **SAP:** Security/Microsoft Purview Compliance/Auditing
- **Queue Name:** Cybersecurity Information Protection - Strategic

### Notes

- Purview does not record all audit logs. For details about data stored in Purview, refer to [Review your audit data using reports](https://learn.microsoft.com/en-us/power-platform/admin/enable-use-comprehensive-auditing#review-your-audit-data-using-reports-in-microsoft-purview-compliance-portal).
