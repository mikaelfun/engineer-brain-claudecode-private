---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR Investigate Bulk Image Tag Deletions"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Investigate%20Bulk%20Image%20Tag%20Deletions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Investigate Bulk Image and Tag Deletions in Azure Container Registry

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

2. To visualize deletion patterns over time:

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

1. From Step 2 results, copy `CorrelationId` values from deletion events.
2. Navigate to Geneva DGREP: <https://portal.microsoftgeneva.com/logs/dgrep>
3. Configure the DGREP query:
   - **Endpoint**: `Diagnostics PROD`
   - **Namespace**: `AcrProdRegistry`
   - **Event to search**: `RegistryManifestEvent`
   - **Time range**: Match Kusto timestamp (5-10 minute window)
   - **Scoping conditions**: Add `Region` filter (use `Region` NOT `RegionStamp` to avoid data loss), select `UTC`
   - **Filtering conditions**: `| Registry contains <ACR-name>`
   - **Client query**:
     ```kql
     where correlationId == "your-correlation-id-here"
     take 10  // Necessary to avoid throttling
     ```
4. Click **Search unscrubbed** to access full details.
5. Key fields:
   - **auth_user_name**: Identity that performed deletion
   - **http_request_remoteaddr_ipv4**: Source IP address
   - **http_request_useragent**: Client tool used

### Step 4: Determine if Deletions Were Triggered by ACR Tasks

If `auth_user_name` shows unfamiliar application ID + Microsoft IP → likely ACR Task/Run/Purge.

1. Correlate with ARM activity:

   ```kql
   let startTime = datetime(2024-03-25T06:00:00);
   let endTime = startTime + 15min;
   let targetSubscription = "your-subscription-id";
   let targetRegistry = "your-registry-name";
   cluster("AzureResourceManager").database("ARMProd").HttpIncomingRequests
   | where TIMESTAMP between (startTime .. endTime)
   | where subscriptionId contains targetSubscription
   | where targetUri contains targetRegistry
   | where targetUri has_any ("runs", "tasks", "purge")
   | project TIMESTAMP, operationName, targetUri, userAgent, callerIdentity, callerIpAddress, httpStatusCode
   | order by TIMESTAMP desc
   ```

2. Common `targetUri` patterns:
   - `*/registries/*/runs?*` — ACR Run command
   - `*/registries/*/tasks/*/runs/*` — ACR Task execution
   - `*/registries/*/scheduleRun?*` — Scheduled ACR Task
   - Contains "purge" — ACR Purge operation

### Step 5: Check for Retention Policy Activity

1. Check if retention policy was active:

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
   | project TIMESTAMP, parsedPolicyName, parsedRetentionDays, parsedRepo, parsedDigest
   | order by TIMESTAMP desc
   ```

2. Verify manifest deletions triggered by retention:

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
   | project env_time, parsedRepo, parsedManifest, parsedPurgeDeleteFlag, parsedPolicyName
   | order by env_time desc
   ```

### Step 6: Check Repository Delete Operations

If entire repositories were deleted:

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

1. Note `callerIdentity` from DGREP results
2. Cross-reference with Azure Activity Logs or automation system
3. Query for activity from specific service principal:

   ```kql
   let targetRegistry = "your-registry.azurecr.io";
   let servicePrincipalId = "your-sp-object-id";
   let startTime = ago(7d);
   let endTime = now();
   cluster("ACR").database("acrprod").RegistryManifestEvent
   | where activitytimestamp between (startTime .. endTime)
   | where Registry == targetRegistry
   | where Action in ("Delete", "Untag")
   | project activitytimestamp, Action, Artifact, Tag, CorrelationId
   | order by activitytimestamp desc
   ```

### Step 8: Document Findings and Provide Recommendations

Compile findings including:
1. **Timeline**: When deletions started, peak periods, when ended
2. **Volume**: Total images/tags deleted, affected repositories
3. **Source**: Identity (user, service principal, automation)
4. **Trigger**: What initiated (manual, ACR Task, retention policy, external)
5. **IP Address**: Source IP of requests
6. **Client Tool**: What was used (Azure CLI, Docker, REST API)

Recommendations:
- Unintended automation → review/update automation scripts or policies
- Retention policy → review configuration
- Manual deletions → implement RBAC controls or audit log monitoring
- Enable diagnostic logs for future auditing
- Implement image locks for critical images

## References

- [ACR Retention Policy Documentation](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-retention-policy)
- [ACR Diagnostic Logs and Auditing](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-diagnostics-audit-logs)
- [ACR Image Locks](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-image-lock)
- [Azure RBAC Permissions for ACR](https://learn.microsoft.com/en-us/azure/role-based-access-control/permissions/containers#microsoftcontainerregistry)
