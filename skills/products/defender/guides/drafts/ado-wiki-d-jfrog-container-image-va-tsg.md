---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/External Container Registries VA/JFrog Container Registry Image Vulnerability Assessment/[TSG] - Troubleshooting issues with JFrog Container Image VA"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Workload%20Protections/Defender%20for%20Containers/External%20Container%20Registries%20VA/JFrog%20Container%20Registry%20Image%20Vulnerability%20Assessment/%5BTSG%5D%20-%20Troubleshooting%20issues%20with%20JFrog%20Container%20Image%20VA"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# JFrog Container Image VA Troubleshooting Guide

> :exclamation: To complete this TSG you will require SAW machine access. CSG (Contractors) or DP (Delivery Partners) please connect with an FTE resource to assist as needed.

## Required Kusto Access

| Cluster Path | Database | Permissions |
|--|--|--|
| https://mdcentitystoreprodeu.westeurope.kusto.windows.net | MDCGlobalData | TBD |
| https://mdcentitystoreprodus.centralus.kusto.windows.net | MDCGlobalData | TBD |
| https://mdcentitystoreprodeu.westeurope.kusto.windows.net | DiscoveryJFrog | TBD |
| https://mdcentitystoreprodus.centralus.kusto.windows.net | DiscoveryJFrog | TBD |
| https://romeeus.eastus.kusto.windows.net | ProdRawEvents | MDC CSS Access Permissions |
| https://romeuksouth.uksouth.kusto.windows.net | ProdRawEvents | MDC CSS Access Permissions |

## Step 1: Verify Connector Configuration

Run the following query (Needs to be run from SAW machine):

```sql
union
cluster("https://mdcentitystoreprodeu.westeurope.kusto.windows.net").database("MDCGlobalData").GetCurrentEnvironments(),
cluster("https://mdcentitystoreprodus.centralus.kusto.windows.net").database("MDCGlobalData").GetCurrentEnvironments()
| where TenantId == "{Tenant Id}"
| extend Subscription = split(Scope, '/')[2]
| where Subscription == "{Subscription Id}" // can be omitted to see all subscriptions
| where EnvironmentName == "JFrog"
| summarize arg_max(TimeStamp, *) by Scope
| mv-expand Plan=Plans
| extend PlanName = tostring(Plan["offeringType"])
| where PlanName in ("CspmMonitor", "DefenderCspm", "DefenderForContainers")
| extend ContainerImageAssessmentSubPlan = tostring(Plan["additionalData"]["ContainerImageAssessment"])
| extend isContainerImageAssessmentEnabled = tobool(parse_json(ContainerImageAssessmentSubPlan)["enabled"]) == true
| where PlanName != "DefenderCspm" or isContainerImageAssessmentEnabled
| summarize by TenantId, tostring(Subscription), PlanName
```

- Verify relevant subscription appeared in the result - Foundational CSPM for image discovery, and Defender CSPM for image vulnerability scanning.
- If plan is missing, verify the user onboarded as required. If they did, contact Defenders for future support.
- If plans exist, continue to step 2.

## Step 2: Verify Images are Discovered by Discovery

Run the following query (Needs to be run from SAW machine):

```sql
union 
cluster("https://mdcentitystoreprodeu.westeurope.kusto.windows.net").database("DiscoveryJFrog").Resources,
cluster("https://mdcentitystoreprodus.centralus.kusto.windows.net").database("DiscoveryJFrog").Resources
| where TimeStamp > ago(1d)
| extend TenantId = tostring(RecordOrganizationInfo["TenantId"])
| where TenantId == "{Tenant Id}"
| extend SubscriptionId = tostring(RecordOrganizationInfo["SubscriptionId"])
| where SubscriptionId == "{Subscription Id}"
| extend OrganizationIdentifier = tostring(RecordIdentifierInfo["HierarchyIdentifier"])
| where OrganizationIdentifier == "{Organization Name}" // can be omitted if unknown.
```

- Verify images of the user are being discovered.
- If a specific repository/image is being reported by the user, check if it exists in the result.
- If image(s) are not found, contact Protectors/Shilo's Team for further investigation.
- If image(s) exist, continue to step 3.

## Step 3: Verify Image Arrives to Phoenix Pipeline

Run the following query (Needs to be run from SAW machine):

```sql
union
cluster('romeeus.eastus.kusto.windows.net').database('ProdRawEvents').Phoenix_Assessments_LifeCycleEvents,
cluster('romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').Phoenix_Assessments_LifeCycleEvents
| where GeneratedTimestamp > ago(3d)
| where Component == "Trigger"
| extend RegistryType = tostring(ArtifactContext.RegistryType)
| where RegistryType == "JFrogArtifactory"
| extend TenantId = tostring(UserContext["TenantId"])
| where TenantId == "{Tenant Id}"
| extend Subscription = tostring(UserContext["SubscriptionId"])
| where Subscription == "{Subscription Id}"
| extend Organization = tostring(UserContext["HierarchyId"])
| where Organization == "{Organization Id}" // can be omitted if unknown.
```

- Verify images are arriving to Phoenix pipeline for the tenant/subscription/Organization.
- If they weren't, contact Protectors/Shilo's Team for future support.
- If images are arriving to Phoenix pipeline, continue to step 4.

## Step 4: Verify Image Recommendation Pipeline

```sql
cluster('romecore.kusto.windows.net').database("Prod").AssessmentLifeCycle 
| where GeneratedTimestamp > ago(3d)
| extend Subscription = split(ResourceId, '/')[2]
| where Subscription == "{Subscription Id}"
| where AssessmentKeysList contains "942c9df8-97d1-4db9-8428-5372b9655110" 
```

## Escalating to Product Group (PG)

In case assessments are not being created for subscription:
- **Team name:** Protectors/Shilo's Team
