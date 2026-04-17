---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/ACR How to find user of manifest event"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20How%20to%20find%20user%20of%20manifest%20event"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to find the user of manifest event

## Summary and Goals

It happens sometime that a ACR user accidentally execute some action like delete or untag on image without notifying other users. Then users of ACR may raise a support ticket to track a missing image or a image update activity. This TSG is aim to help support engineer find the user identity and client IP of who execute the manifest event.

### Prerequisites

* Name of the affected ACR
* Access to <https://portal.microsoftgeneva.com/logs/dgrep>
* Access to <https://acr.kusto.windows.net/>

### Involved Components

* ACR kusto database
* Geneva DGREP portal

## Implementation Steps

For example, if we want to find the user identity of who delete the image by untag or delete command, here are steps:

1. Ask user the full name of the image that missing, take the following image as an example: `acr09272023.azurecr.io/cluster-proportional-autoscaler:v1.8.8`

2. Find the manifest event of this image in Kusto, set HTTP method as DELETE:

   ```kql
   Execute [Web] [Desktop] [cluster('acr.kusto.windows.net').database('acrprod')]
   RegistryManifestEvent
   | where PreciseTimeStamp between (datetime(2024-03-25T06:05) .. 1d) 
   | where Registry == "acr09272023.azurecr.io"
   | where Artifact has "cluster-proportional-autoscaler"
   | where Tag == "v1.8.8"
   | where http_request_method == "DELETE"
   | project activitytimestamp, message, Action, Artifact, Registry, Tag, CorrelationId, RegionStamp
   ```

3. Copy the correlationID and use ACR Dgrep to investigate further:
   * In 'Endpoint', select 'Diagnostics PROD'
   * In 'Namespace', select 'AcrProdRegistry'
   * In 'Event to search', select 'RegistryManifestEvent'
   * In 'Time range' select same as output of step 2, with 5-10 minutes range
   * In 'Scoping conditions', set 'Region' filter same as output in step 2, and remember to select 'UTC' (use 'Region' instead of 'RegionStamp', 'RegionStamp' may cause some data loss)
   * In 'Filtering conditions', set `| Registry contains <ACR-name>`
   * In 'Client query' field, input:
     ```kql
     where correlationId == "<correlation-id-from-step-2>"
     take 10
     ```

4. The key columns may be scrubbed to protect user privacy, click on 'Search unscrubbed' beneath the green bar to search unscrubbed.

5. Find the 'auth_user_name' and 'http_request_remoteaddr_ipv4' in the output - these are key info to track the user who executed the manifest event.

6. If the 'auth_user_name' is shown as a strange application ID that cannot be found in user's Azure Portal or the user's tenant, and the 'http_request_remoteaddr_ipv4' shows a Microsoft owned IP, the delete action may be done by 'acr task' or 'acr run', as the command is executed by a shared ACR agent using a special application.

   Cross verify in ARM Kusto table:
   ```kql
   HttpIncomingRequests
   | where TIMESTAMP between (datetime(2024-03-25T06:08:47) .. 5min)
   | where subscriptionId contains "<subscription-id>"
   | where targetUri contains "<acr-name>"
   ```

7. Check targetUri field to identify the operation type:
   - `az acr run` - manual run command
   - `az acr purge` - purge command
   - task run (ca# as a run ID) - triggered by an ACR task

   Note: untag action can be done by purge command or untag command, and both can be content of ACR task.

   To further check task actions, see TSG: Check ACR tasks and outputs.

   Permission reference: <https://learn.microsoft.com/en-us/azure/role-based-access-control/permissions/containers#microsoftcontainerregistry>
