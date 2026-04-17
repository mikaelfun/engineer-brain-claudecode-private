---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/External Container Registries VA/Docker Hub Registry Container Image Vulnerability Assessment/[Troubleshooting Guide] Docker Hub Container Image Vulnerability Assessment"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Workload%20Protections/Defender%20for%20Containers/External%20Container%20Registries%20VA/Docker%20Hub%20Registry%20Container%20Image%20Vulnerability%20Assessment/%5BTroubleshooting%20Guide%5D%20Docker%20Hub%20Container%20Image%20Vulnerability%20Assessment"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting Guide (TSG) for Docker Hub Container Image Vulnerability Assessment

## Step 1: Verify Connector Configuration

1. **Run the following query:**

   ```sql
   union 
   cluster("https://mdcentitystoreprodeu.westeurope.kusto.windows.net").database("MDCGlobalData").GetCurrentEnvironments(),
   cluster("https://mdcentitystoreprodus.centralus.kusto.windows.net").database("MDCGlobalData").GetCurrentEnvironments()
   | where TenantId == "{Tenant Id}"
   | extend Subscription = split(Scope, '/')[2]
   | where Subscription  == "{SubscriptionId}" // can be omitted to see all subscriptions
   | where EnvironmentName == "DockerHub"
   | summarize arg_max(TimeStamp, *) by Scope
   | mv-expand Plan=Plans
   | extend PlanName = tostring(Plan["offeringType"])
   | where PlanName in ("CspmMonitor", "DefenderCspm", "DefenderForContainers")
   | extend ContainerImageAssessmentSubPlan = tostring(Plan["additionalData"]["ContainerImageAssessment"])
   | extend isContainerImageAssessmentEnabled = tobool(parse_json(ContainerImageAssessmentSubPlan)["enabled"]) == true
   | where PlanName != "DefenderCspm" or isContainerImageAssessmentEnabled
   | summarize by TenantId, tostring(Subscription), PlanName
   ```

   - **Verify:** Ensure the relevant subscription appears in the result: Foundational Cloud Security Posture Management (CSPM) for image discovery, and Defender CSPM for image vulnerability scanning.
   - **If Plan is Missing:** Verify the user onboarded as required. If they did, contact Microsoft Defender for future support.
   - **If Plans Exist:** Continue to step 2.

## Step 2: Verify Images are Discovered by Discovery

1. **Run the following query:**

   ```sql
   union 
   cluster("https://mdcentitystoreprodeu.westeurope.kusto.windows.net").database("DiscoveryDockerHub").Resources,
   cluster("https://mdcentitystoreprodus.centralus.kusto.windows.net").database("DiscoveryDockerHub").Resources
   | where TimeStamp > ago(1d)
   | extend TenantId = tostring(RecordOrganizationInfo["TenantId"])
   | where TenantId == "{TenantId}"
   | extend SubscriptionId = tostring(RecordOrganizationInfo["SubscriptionId"])
   | where SubscriptionId == "{SubscriptionId}"
   | extend OrganizationIdentifier = tostring(RecordIdentifierInfo["HierarchyIdentifier"])
   | where OrganizationIdentifier == "{OrganizationName}" // can be omitted if unknown.
   ```

   - **Verify:** Ensure images of the user are being discovered.
   - **Specific Repository/Image:** If a specific repository/image is being reported by the user, check if it exists in the result.
   - **If Images are Not Found:** Contact Protectors/Shilo's Team for further investigation.
   - **If Images Exist:** Continue to step 3.

## Step 3: Verify Image Arrives to Phoenix Pipeline

1. **Run the following query:**

   ```sql
   union
   cluster('romeeus.eastus.kusto.windows.net').database('ProdRawEvents').Phoenix_Assessments_LifeCycleEvents,
   cluster('romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').Phoenix_Assessments_LifeCycleEvents
   | where GeneratedTimestamp > ago(3d)
   | where Component == "Trigger"
   | extend RegistryType = tostring(ArtifactContext.RegistryType)
   | where RegistryType == "DockerHub"
   | extend TenantId = tostring(UserContext["TenantId"])
   | where TenantId == "{Tenant Id}"
   | extend Subscription = tostring(UserContext["SubscriptionId"])
   | where Subscription == "{Subscription Id}"
   | extend Organization = tostring(UserContext["HierarchyId"])
   | where Organization == "{Organization Id}" // can be omitted if unknown.
   ```

   - **Verify:** Ensure images are arriving to the Phoenix pipeline for the tenant/subscription/organization.
   - **If Not Arriving:** Contact Protectors/Shilo's Team for future support.
   - **If Arriving:** Continue to step 4.

## Step 4: Verify Image Recommendation Pipeline

1. **Run the following query:**

   ```sql
   cluster('romecore.kusto.windows.net').database("Prod").AssessmentLifeCycle 
   | where GeneratedTimestamp > ago(3d)
   | extend Subscription = split(ResourceId, '/')[2]
   | where Subscription == "{Subscription Id}"
   | where AssessmentKeysList contains "f064651f-2459-47f2-9731-0c5a782891d3" 
   ```

   - **If Assessments are Not Being Created:** Contact Protectors/Shilo's Team.
