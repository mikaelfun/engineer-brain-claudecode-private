---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Defender for DevOps/[TSG] - Agentless code scanning"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FDefender%20for%20DevOps%2F%5BTSG%5D%20-%20Agentless%20code%20scanning"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Agentless code scanning in DevOps security - Support TSG

# Agentless code scanning PP - Starting 06/05/2025
Previously, agentless code scanning was either enabled or disabled on the connector level and was only supported for Azure DevOps resources.

Starting 06/05/2025 Agentless code scanning will be in PP.
GitHub will be added as supported platform. Additionally, Agentless code scanning can be enabled/disabled on individual inventory (Organization/Project/Repository for Azure DevOps and Owner/Repository for GitHub).
Customers will also have the ability to select the scanning tools to be run as part of Agentless code scans

# Troubleshooting

## Known issues & escalation points
- **Connector-related issues**: Standard troubleshooting applies for connector issues, follow existing support paths. More information in the [common questions section of the documentation](https://learn.microsoft.com/en-us/azure/defender-for-cloud/faq-defender-for-devops)
- **Finding delays**: Findings may take up to 1 hour to appear after enabling agentless code scanning. Verify that the feature is enabled if delays occur.
- **Data refresh intervals**: Scanning for code and IaC vulnerabilities occurs every day when the feature is enabled. Security recommendations (findings) update accordingly.

## Support escalation workflow
1. **Verify feature enablement**: Confirm with the customer that agentless code scanning is enabled. This step ensures accurate troubleshooting with the appropriate engineering team.
2. **Escalate delayed findings**: If findings are delayed beyond a few hours after feature enablement, escalate the issue with verification of the enablement status.

## Backend process overview

Agentless code scanning performs background scans on onboarded repositories without requiring the installation of the MSDO extension or adding pipeline steps. The scanning process leverages Phoenix as its platform.

### Key components of the architecture:
* **Scheduler service**: Orchestrates scanning schedules.
* **Preparation service**: Prepares repositories for scanning.
* **Phoenix bridge service**: Interfaces between scanning components.
* **Phoenix**: Scanning platform.
* **DfD Analyzer (Worker)**: Core scanning engine (container image) executed by Phoenix.
* **Sarif processor service**: Processes and formats the findings.

## Debugging using Dashboard (Post 06/05/2025)

Agentless code scan dashboard: [DfD Agentless](https://dataexplorer.azure.com/dashboards/3107308e-4675-4bf3-925a-9ecdad498d56?p-_startTime=24hours&p-_endTime=now&p-ConnectorId=all#ca943037-d5aa-46a6-98dc-747260f35a61)

- Check if Agentless code scanning was scheduled for the connector via dashboard
- If there is no count on the queued inventory - check if agentless skipped or disabled repository count
- For any queued-up repositories, drill-down on the preparation service flow using the scheduler correlation id field
- In the preparation service dashboard, use the cross-filter function on the repo id to get details about the steps
- If "TriggerPhoenixScan" has a successful state, check the phoenix bridge service via Repository Id field
- Check for the Phoenix Scan success state for the repository

## Debugging specific scenarios

### 1. Connector created with agentless code scanning enabled, but **none** of the repositories are getting processed

(Starting 06/05/2025)
- Validate if agentless is enabled on the inventory by checking the logs: https://portal.microsoftgeneva.com/s/E02D75D7

(Pre 06/02/2025)
- Validate if the connector is onboarded to Agentless by opening Connector resource in the portal
- Check if the scheduler service processes the connector: https://portal.microsoftgeneva.com/s/80C76EC3
- Enter SubscriptionId or connectorId and check logs to see if connector is getting processed for Agentless

### 2. Connector created with agentless code scanning enabled, but **some** repositories not getting processed

#### Scheduler service
- Select the region, ConnectorId & RepositoryId in the query: https://portal.microsoftgeneva.com/s/CC8123F3
- Look for successfully processed message for the repository
- If present, move to Preparation section troubleshooting. Else root cause for skipping should be available in result (e.g., repository size > 1GB)

#### Preparation service
- Check for exceptions for the repo/connector ID: https://portal.microsoftgeneva.com/s/53DC5CB2
- Example: connector lacks correct access to ADO APIs → "forbidden" error when querying
- Validate preparation service has queued up a scan message: https://portal.microsoftgeneva.com/s/DCEF23D4
- Terminal state is "Trigger Phoenix Scan for target." — if present, check Phoenix service

#### Phoenix service
- Query Kusto for scan status:
```kql
let scanned = cluster('romeeus.eastus.kusto.windows.net').database('ProdRawEvents').Phoenix_Assessments_LifeCycleEvents
| union cluster('romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').Phoenix_Assessments_LifeCycleEvents
| where GeneratedTimestamp > ago(1d)
| extend TaskId = AdditionalData.taskManifest.TaskId
| where tostring(ArtifactContext.ArtifactType) == "MsdoTarget"
| extend RepoName = tostring(ArtifactContext.Properties.RepositoryName)
| extend RepoId = tostring(ArtifactContext.Properties.RepoId)
| extend SubscriptionId = tostring(ArtifactContext.Properties.SubscriptionId)
| extend IsSuccess = LifeCycleEvent == "ScrapeSuccessfullyDone"
| extend IsTriggerFailure = LifeCycleEvent == "TriggerScrapeWorkerFailed"
| extend connectorName = tostring(UserContext.ConnectorName)
| extend Region = tostring(ArtifactContext.Region)
| extend ConnectorId = tostring(ArtifactContext.Properties.ConnectorId)
| extend RepositoryName = tostring(ArtifactContext.Properties.RepositoryName);
scanned
| where RepoId == "<<RepoId>>"
| summarize sum(IsSuccess), sum(IsTriggerFailure), any(*) by EventId
```
- If not successful, check failure reason:
```kql
cluster('rome.kusto.windows.net').database('DetectionLogs').Span
| where env_time > ago(2d)
| where site_name contains "prd" and site_name contains "craper"
| where name == "TaskDeleter.ExtractSingleContainerLogs"
| extend customData_json = parse_json(customData)
| extend containerName = tostring(customData_json.containerName)
| extend logs = tostring(todynamic(customData).logs)
| extend gzip_logs = gzip_decompress_from_base64_string(logs)
| where containerName == "<<TaskId from previous query>>"
```

#### Analyzer worker
Follow instructions at: https://dev.azure.com/SecurityTools/DefenderForDevOps/_wiki/wikis/DefenderForDevOps.wiki/3086/DfD-Analyzer-Worker-TSG

#### Sarif service
- Check processing status: https://portal.microsoftgeneva.com/s/FB0A7086
- Update filter with connectorId or ArtifactId (from Phoenix query)
- Click on env_dt_traceid for detailed processing information

## Feature overview

- **Agentless code scanning**: Scans code and IaC templates automatically via connector
- **Broad coverage**: Coverage across all pipelines within 15-60 minutes after configuration
- **No developer involvement needed**: No plugin installation or pipeline steps required
- **Supported languages**: Python, JavaScript, TypeScript; IaC: Bicep, Terraform
- **Security recommendations**: Code vulnerabilities + IaC security issues

## Configuration and enablement
- **New connectors**: Agentless code scanning enabled by default
- **Existing connectors**: Must reconfigure and manually enable
- **Permissions**: Subscription Contributor + Project Collection Admin (ADO) / Org Owner (GitHub)
- **Pricing**: Free during preview, will require D-CSPM in GA

## Public preview limitations
- **Scan frequency**: Upon enablement and every 2-4 days
- **Branch coverage**: Limited to the default (main) branch
- **Repository size**: Only repositories below 1GB
- **No binary scanning**: Only code (SAST) and IaC scanning tools
- **Supported regions**: Australia East, Canada Central, Central US, East Asia, East US, North Europe, Sweden Central, UK South, West Europe
