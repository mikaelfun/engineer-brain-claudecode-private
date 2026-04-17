---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR Investigate Bulk Image Tag Deletions"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Investigate%20Bulk%20Image%20Tag%20Deletions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Investigate Bulk Image and Tag Deletions in Azure Container Registry

[[_TOC_]]

## Summary and Goals

When investigating a large volume of image or tag deletions in Azure Container Registry (ACR), it's critical to identify what triggered the deletions, when they occurred, and correlate these events with Azure automation processes. This guide provides a comprehensive approach to investigating bulk deletion events, determining the source of the deletions (whether user-initiated, service principal-driven, or triggered by automation), and understanding the timeline and scope of the deletion activity.

This guide is particularly valuable when:

- Customers report unexpected bulk image or tag deletions
- You need to track down the identity and source of mass deletion operations
- Correlation with ACR tasks, retention policies, or other Azure automation is required
- Understanding the timeline and volume of deletions is necessary for root cause analysis

### Prerequisites

- Name of the affected Azure Container Registry
- Subscription ID of the ACR
- Approximate timeframe when deletions occurred (if known)
- Access to <https://acr.kusto.windows.net/>
- Access to <https://portal.microsoftgeneva.com/logs/dgrep>
- Access to Azure Resource Manager (ARM) Kusto database for automation correlation

### Involved Components

- Azure Container Registry (ACR)
- ACR Kusto databases (acrprod)
- Geneva DGREP portal for unscrubbed logs
- Azure Resource Manager (ARM) for tracking automation triggers
- ACR Tasks and retention policies
- Service principals and managed identities

## Implementation Steps

### Step 1: Identify the Scope and Timeline of Deletions

First, determine the overall scope of deletion activity to understand the volume and timeframe involved.

1. Use the following Kusto query to identify deletion events across all repositories in the registry:

   ```kql
   let targetRegistry = "your-registry.azurecr.io";
   let startTime = ago(7d);  // Adjust timeframe as needed
   let endTime = now();
   cluster("ACR").database("acrprod").RegistryManifestEvent
   | where activitytimestamp between (startTime .. endTime)
   | where Registry == targetRegistry
   | where Action in ("Delete", "Untag")
   | summarize DeletionCount=count(),
               FirstDeletion=min(activitytimestamp),
               LastDeletion=max(activitytimestamp),
               AffectedRepos=dcount(Artifact) by Action
   | project Action, DeletionCount, FirstDeletion, LastDeletion, AffectedRepos
   ```

   This query provides a high-level overview showing:
   - Total number of deletions and untags
   - Time range of deletion activity
   - Number of affected repositories

2. To visualize deletion patterns over time, use this query:

   ```kql
   let targetRegistry = "your-registry.azurecr.io";
   let startTime = ago(7d);
   let endTime = now();
   cluster("ACR").database("acrprod").RegistryManifestEvent
   | where activitytimestamp between (startTime .. endTime)
   | where Registry == targetRegistry
   | where Action in ("Delete", "Untag")
   | summarize DeletionCount=count() by Action, bin(activitytimestamp, 1h)
   | render timechart
   ```

   This helps identify if deletions occurred in bursts (suggesting automation) or sporadically (suggesting manual actions).

### Step 2: Identify Specific Deletion Events

Once you understand the scope, drill down into specific deletion events to gather detailed information.

1. Query for detailed deletion events by repository:

   ```kql
   let targetRegistry = "your-registry.azurecr.io";
   let startTime = ago(7d);
   let endTime = now();
   cluster("ACR").database("acrprod").RegistryManifestEvent
   | where activitytimestamp between (startTime .. endTime)
   | where Registry == targetRegistry
   | where Action in ("Delete", "Untag")
   | project activitytimestamp,
             Action,
             Repository,
             Artifact,
             Tag,
             Digest,
             CorrelationId,
             RegionStamp,
             http_request_method
   | order by activitytimestamp desc
   ```

2. If investigating deletions for a specific repository or image:

   ```kql
   let targetRegistry = "your-registry.azurecr.io";
   let targetRepo = "your-repository-name";
   let startTime = ago(7d);
   let endTime = now();
   cluster("ACR").database("acrprod").RegistryManifestEvent
   | where activitytimestamp between (startTime .. endTime)
   | where Registry == targetRegistry
   | where Artifact has targetRepo
   | where Action in ("Delete", "Untag")
   | where http_request_method == "DELETE"
   | project activitytimestamp,
             message,
             Action,
             Artifact,
             Registry,
             Tag,
             Digest,
             CorrelationId,
             RegionStamp
   | order by activitytimestamp desc
   ```

### Step 3: Identify the Source of Deletions Using DGREP

To identify the user, service principal, or automation source, you need to access unscrubbed logs through Geneva DGREP.

1. From the results in Step 2, copy one or more `CorrelationId` values from deletion events you want to investigate.

2. Navigate to Geneva DGREP: <https://portal.microsoftgeneva.com/logs/dgrep>

3. Configure the DGREP query with the following settings:
   - **Endpoint**: Select `Diagnostics PROD`
   - **Namespace**: Select `AcrProdRegistry`
   - **Event to search**: Select `RegistryManifestEvent`
   - **Time range**: Set to match the timestamp from your Kusto query (use a 5-10 minute window around the event)
   - **Scoping conditions**:
     - Add a `Region` filter matching the `RegionStamp` from your Kusto results
     - **Important**: Use `Region` instead of `RegionStamp` to avoid data loss
     - Select `UTC` for the timezone
   - **Filtering conditions**: Set `| Registry contains <ACR-name>`
   - **Client query**: Enter the following:

     ```kql
     where correlationId == "your-correlation-id-here"
     take 10  // This limit is necessary to avoid throttling
     ```

4. Click **Search** to execute the query.

5. The initial results will have key columns scrubbed for privacy. Click **Search unscrubbed** beneath the green result bar to access full details.

6. In the unscrubbed results, look for the following critical fields:
   - **auth_user_name**: The identity that performed the deletion (user email, service principal ID, or managed identity)
   - **http_request_remoteaddr_ipv4**: The source IP address of the deletion request
   - **http_request_useragent**: The client tool used (Azure CLI, Docker, REST API, etc.)

### Step 4: Determine if Deletions Were Triggered by ACR Tasks

If the `auth_user_name` shows an unfamiliar application ID and the source IP is Microsoft-owned, the deletions may have been triggered by ACR Tasks, ACR Run commands, or ACR Purge operations.

1. Correlate with ARM activity to identify ACR Task or Run commands:

   ```kql
   let startTime = datetime(2024-03-25T06:00:00);  // Use timestamp from deletion event
   let endTime = startTime + 15min;
   let targetSubscription = "your-subscription-id";
   let targetRegistry = "your-registry-name";
   cluster("AzureResourceManager").database("ARMProd").HttpIncomingRequests
   | where TIMESTAMP between (startTime .. endTime)
   | where subscriptionId contains targetSubscription
   | where targetUri contains targetRegistry
   | where targetUri has_any ("runs", "tasks", "purge")
   | project TIMESTAMP,
             operationName,
             targetUri,
             userAgent,
             callerIdentity,
             callerIpAddress,
             httpStatusCode
   | order by TIMESTAMP desc
   ```

2. Common patterns in the `targetUri` field that indicate automation:
   - `*/registries/*/runs?*` - ACR Run command execution
   - `*/registries/*/tasks/*/runs/*` - ACR Task execution
   - `*/registries/*/scheduleRun?*` - Scheduled ACR Task run
   - Contains "purge" - ACR Purge operation

3. To further investigate ACR Tasks, refer to the guide: [How to check ACR task and output](/Azure-Kubernetes-Service-Wiki/ACR/How-Tos/Check-ACR-tasks-and-outputs.md)

### Step 5: Check for Retention Policy Activity

Retention policies can automatically delete untagged manifests based on configured rules. Check if a retention policy is active and caused the deletions.

1. Verify if retention policy was active during the deletion timeframe:

   ```kql
   let targetRegistry = "your-registry.azurecr.io";
   let startTime = ago(7d);
   let endTime = now();
   cluster("ACR").database("acrprod").RegistryActivity
   | where TIMESTAMP between (startTime .. endTime)
   | where service == "eventserver"
   | where message startswith "queued_purge_message"
   | where message has targetRegistry
   | parse kind=regex message with *
       "queued_purge_message: message id: " parsedMessageId:string
       " policy name: " parsedPolicyName:string
       " loginserver: " parsedLoginServer:string
       " expiration: " parsedExpiration:string
       " repo: " parsedRepo:string
       " digest: " parsedDigest:string
       " retention days: " parsedRetentionDays:int *
   | project TIMESTAMP,
             parsedPolicyName,
             parsedRetentionDays,
             parsedRepo,
             parsedDigest
   | order by TIMESTAMP desc
   ```

2. Verify manifest deletions triggered by retention policy:

   ```kql
   let targetRegistry = "your-registry.azurecr.io";
   let startTime = ago(7d);
   let endTime = now();
   cluster("ACR").database("acrprod").RPActivity
   | where env_time between (startTime .. endTime)
   | where Message startswith "Queuing new delete manifest metadata message"
   | where Message has targetRegistry
   | parse kind=regex Message with *
       "Queuing new delete manifest metadata message for Registry: " parsedRegistryLoginUri:string
       " Repo: " parsedRepo:string
       " Manifest: " parsedManifest:string
       ", isPurgeDelete: " parsedPurgeDeleteFlag:bool
       ", policyName : " parsedPolicyName:string
   | project env_time,
             parsedRepo,
             parsedManifest,
             parsedPurgeDeleteFlag,
             parsedPolicyName
   | order by env_time desc
   ```

3. To visualize retention policy deletion patterns over time:

   ```kql
   let targetRegistry = "your-registry.azurecr.io";
   let startTime = ago(30d);
   let endTime = now();
   cluster("ACR").database("acrprod").RPActivity
   | where env_time between (startTime .. endTime)
   | where Message startswith "Queuing new delete manifest metadata message"
   | where Message has targetRegistry
   | parse kind=regex Message with *
       "Queuing new delete manifest metadata message for Registry: " parsedRegistryLoginUri:string
       " Repo: " parsedRepo:string
       " Manifest: " parsedManifest:string
       ", isPurgeDelete: " parsedPurgeDeleteFlag:bool
       ", policyName : " parsedPolicyName:string
   | summarize DeletionCount=dcount(parsedManifest) by parsedRepo, bin(env_time, 1d)
   | render timechart
   ```

### Step 6: Check Repository Delete Operations

If entire repositories were deleted (not just individual images), track these operations separately:

1. Query for repository delete operations:

   ```kql
   let targetRegistry = "your-registry.azurecr.io";
   let startTime = ago(7d);
   let endTime = now();
   cluster("ACR").database("acrprod").RegistryActivity
   | where PreciseTimeStamp between (startTime .. endTime)
   | where http_request_host == targetRegistry
   | where http_request_method == "DELETE"
   | where http_request_uri startswith "/v2/_acr/"
   | where http_request_uri contains "/repository"
   | project Day = bin(PreciseTimeStamp, 1d),
             Registry = http_request_host,
             Uri = http_request_uri,
             HttpStatus = http_response_status,
             http_request_method,
             http_request_remoteaddr
   | order by PreciseTimeStamp desc
   ```

### Step 7: Correlate with External Azure Automation

If deletions were triggered by external automation (Azure DevOps pipelines, Azure Functions, Logic Apps, etc.), correlate the timing and identity information.

1. From Step 3, note the `callerIdentity` (service principal or managed identity) from DGREP results.

2. Cross-reference with Azure Activity Logs or your automation system:
   - Check if the service principal is used by Azure DevOps pipelines
   - Verify if the managed identity is assigned to Azure Functions or Logic Apps
   - Review the timing correlation between automation runs and deletion events

3. Query for activity from specific service principal or managed identity:

   ```kql
   let targetRegistry = "your-registry.azurecr.io";
   let servicePrincipalId = "your-sp-object-id";
   let startTime = ago(7d);
   let endTime = now();
   cluster("ACR").database("acrprod").RegistryManifestEvent
   | where activitytimestamp between (startTime .. endTime)
   | where Registry == targetRegistry
   | where Action in ("Delete", "Untag")
   // Note: Additional correlation with DGREP auth_user_name is needed
   | project activitytimestamp, Action, Artifact, Tag, CorrelationId
   | order by activitytimestamp desc
   ```

### Step 8: Document Findings and Provide Recommendations

After completing the investigation, compile your findings including:

1. **Timeline**: When deletions started, peak deletion periods, and when they ended
2. **Volume**: Total number of images/tags deleted, affected repositories
3. **Source**: Identity that performed deletions (user, service principal, automation)
4. **Trigger**: What initiated the deletions (manual, ACR Task, retention policy, external automation)
5. **IP Address**: Source IP of deletion requests
6. **Client Tool**: What was used to perform deletions (Azure CLI, Docker, REST API, etc.)

Provide recommendations based on findings:

- If unintended automation triggered deletions, review and update automation scripts or policies
- If retention policy caused unexpected deletions, review policy configuration and document expectations
- If manual deletions occurred, recommend implementing RBAC controls or audit log monitoring
- Suggest enabling diagnostic logs if not already configured for future auditing
- Recommend implementing image locks for critical images to prevent accidental deletion

## References

- [ACR Retention Policy Documentation](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-retention-policy)
- [ACR Diagnostic Logs and Auditing](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-diagnostics-audit-logs)
- [ACR Image Locks](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-image-lock)
- [Azure RBAC Permissions for ACR](https://learn.microsoft.com/en-us/azure/role-based-access-control/permissions/containers#microsoftcontainerregistry)
