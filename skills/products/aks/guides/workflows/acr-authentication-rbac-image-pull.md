# AKS ACR 认证与 RBAC — image-pull — 排查工作流

**来源草稿**: ado-wiki-a-acr-build-image-docker-buildkit-secret.md, ado-wiki-a-acr-define-idea-for-feedback-forum.md, ado-wiki-a-acr-enable-image-deletion-with-locks.md, ado-wiki-a-acr-health-check-command-background.md, ado-wiki-acr-behind-firewall.md, ado-wiki-acr-find-user-of-manifest-event.md, ado-wiki-acr-image-or-repository-recovery.md, ado-wiki-acr-investigate-bulk-image-tag-deletions.md, ado-wiki-acr-list-old-images-script.md, ado-wiki-b-acr-authorization-rbac-abac.md, ado-wiki-b-acr-change-analysis.md, ado-wiki-b-acr-continuous-patching-workflow-tsg.md, ado-wiki-b-acr-custom-domain-configuration.md, ado-wiki-b-acr-devops-cases-template.md, ado-wiki-b-acr-seek-pg-assistance-teams.md, ado-wiki-container-instance-deployment-firewall-acr.md
**Kusto 引用**: image-integrity.md
**场景数**: 17
**生成日期**: 2026-04-07

---

## Scenario 1: ACR task with BuildKit and pass a secret from a repository
> 来源: ado-wiki-a-acr-build-image-docker-buildkit-secret.md | 适用: 适用范围未明确

### 排查步骤

ACR task with BuildKit and pass a secret from a repository

**task.yaml:**
```yaml
version: v1.1.0
steps:
 - build: -t $Registry/hello-world:{{.Run.ID}} --secret id=mysecret,src=mysecret.txt --secret id=mysecret2,src=mysecret2.txt .
   env: ["DOCKER_BUILDKIT=1"]
 - push:
     - $Registry/hello-world:{{.Run.ID}}
```

**Dockerfile:**
```dockerfile
FROM ubuntu
RUN --mount=type=secret,id=mysecret,uid=1001
RUN --mount=type=secret,id=mysecret2,uid=1001
```

**Run the task:**
```sh
#### Quick run
az acr run --registry <acrname> -f task.yaml .

#### Create and run task
az acr task create \
    --image hello-world:{{.Run.ID}} \
    --name <task-name> --registry <acrname> \
    --context /dev/null \
    --file task.yaml \
    --commit-trigger-enabled false

az acr task run -n <task-name> -r <acrname> --context . -f task.yaml
```

---

## Scenario 2: ACR task with BuildKit and pass a secret from Azure Key Vault
> 来源: ado-wiki-a-acr-build-image-docker-buildkit-secret.md | 适用: 适用范围未明确

### 排查步骤

ACR task with BuildKit and pass a secret from Azure Key Vault

**task.yaml:**
```yaml
version: v1.1.0
secrets:
  - id: sampleSecret
    keyvault: https://<keyvault-name>.vault.azure.net/secrets/SampleSecret
  - id: mysecret
    keyvault: https://<keyvault-name>.vault.azure.net/secrets/mysecret

volumes:
  - name: mysecrets
    secret:
      mysecret1: {{.Secrets.sampleSecret | b64enc}}
      mysecret2: {{.Secrets.mysecret | b64enc}}

steps:
  - build: -t $Registry/hello-world:{{.Run.ID}} --secret id=mysecret1,src=/run/test/mysecret1 --secret id=mysecret2,src=/run/test/mysecret2 -f Dockerfile .
    env: ["DOCKER_BUILDKIT=1"]
    volumeMounts:
      - name: mysecrets
        mountPath: /run/test
  - push:
     - $Registry/hello-world:{{.Run.ID}}
```

**Create and run:**
```sh
az acr task create \
    --image hello-world:{{.Run.ID}} \
    --name <task-name> --registry <acrname> \
    --context /dev/null \
    --file task.yaml \
    --commit-trigger-enabled false \
    --assign-identity <resourceID>

az acr task run -n <task-name> -r <acrname> --context . -f task.yaml
```

**Grant managed identity access to Key Vault:**
```sh
az keyvault set-policy --name mykeyvault \
  --resource-group myResourceGroup \
  --object-id $ManagedIdentity-Object-ID \
  --secret-permissions get

#### Get principalID for system-assigned MI
az acr task show \
  --name $task_name --registry $registry_name \
  --query identity.principalId --output tsv
```

---

## Scenario 3: Define a great idea to post on ACR feedback forum
> 来源: ado-wiki-a-acr-define-idea-for-feedback-forum.md | 适用: 适用范围未明确

### 排查步骤

#### Define a great idea to post on ACR feedback forum


#### Introduction

When a customer needs a feature that doesn't exist on Azure, advise them to share it on the [Microsoft Azure Feedback Forum](https://aka.ms/ACTInbox/). This article provides recommendations for creating high-quality posts on the [ACR subforum](https://aka.ms/ACTInbox/).

**Note**: The forum is for feature ideas, NOT issues. Issues should be handled via Service Requests.

#### The Procedure

##### 1. Identify the Opportunity

When there is a need for a feature which doesn't exist on ACR → opportunity to post an idea.

##### 2. State of the Art

Verify if the idea was already posted before submitting. If it exists, note its status and follow up accordingly.

##### 3. List of Recommendations

Before posting, be aware:
- The idea forum is NOT for issues/bugs requiring prompt attention.
- Ideas can be accepted or not; if accepted, subject to product team scheduling.

Recommendations for a high-quality post:
- Thoroughly describe the technical limitation or innovation on existing products/tools/services.
- Reference similar posts but address an original concept.
- Frame the best scenario with detail and a text diagram if applicable (image uploads are unsupported).
- Reference similar solutions from other companies/products.
- Search for the idea in Microsoft-owned channels: GitHub repositories, public roadmap of [ACR](https://github.com/orgs/Azure/projects/259), etc.
- Describe the business impact for the submitter and potentially other companies.
- State the desired implementation timeline (if approved).
- Estimate how broadly the idea applies (ACR only or other Azure services).
- Use Microsoft Copilot to generate additional content.

If you (as a Microsoft employee/Support Engineer) originate the idea, spread the word via email, Teams, Yammer to gather votes and feedback.

##### 4. Communicate Recommendations

Decide which recommendations to share with the customer; these are suggestions they can adapt.

#### Conclusion

A high-quality feedback forum post thoroughly describes the technical limitation, provides business impact context, and invites engagement.

The [ACR subforum](https://aka.ms/ACTInbox/) accepts ideas from both customers and Microsoft employees.

#### Owner and Contributors

**Owner:** Walter Lopez <walter.lopez@microsoft.com>

---

## Scenario 4: Enable image and repository deletion with ACR locks
> 来源: ado-wiki-a-acr-enable-image-deletion-with-locks.md | 适用: 适用范围未明确

### 排查步骤

#### Enable image and repository deletion with ACR locks


#### Context

When ACR locks (Delete and Write) are added at all possible levels — Repository, Image by Tag, and Image by Digest — deletion operations will fail. The Image by Digest level is often the most problematic because when you change locks by Tag, the output also shows the related digest, leading to confusion about which level is actually blocking the operation.

Reference: [ACR - Lock Images](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-image-lock)

**Key insight**: You must unlock at ALL three levels:
1. Repository level
2. Image by Tag level
3. Image by Digest level ← most commonly overlooked

#### Sample Scripts

##### Check current settings for a repository and each Image by Tag and Digest

```bash
#!/bin/bash
#### getRepoNImgDetails.sh
#### Lists current settings for repository, each image by Tag and each image by Digest

while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
      --acr-name) ACR_NAME="$2"; shift ;;
      --repo-name) REPOSITORY_NAME="$2"; shift ;;
  esac
  shift
done

#### Print details from repository
echo "Repository: $REPOSITORY_NAME"
az acr repository show --name $ACR_NAME --repository $REPOSITORY_NAME --output jsonc

#### Loop through images by tag
IMAGE_LIST=$(az acr repository show-tags -n $ACR_NAME --repository $REPOSITORY_NAME --output json)
for i in $(echo $IMAGE_LIST | jq -r '.[]'); do
    echo "Image: $i"
    az acr repository show -n $ACR_NAME --image $REPOSITORY_NAME:$i --output json | jq '.'
done

#### Loop through images by digest
IMAGE_DIGESTS=$(az acr repository show-manifests --name $ACR_NAME --repository $REPOSITORY_NAME --query "[].digest" --output tsv)
for digest in $IMAGE_DIGESTS; do
    echo "Image Digest: $digest"
    az acr repository show -n $ACR_NAME --image $REPOSITORY_NAME@$digest --output json
done
```

Usage:
```bash
chmod 755 getRepoNImgDetails.sh
./getRepoNImgDetails.sh --acr-name <ACR_NAME> --repo-name <REPO_NAME>
```

##### Enable Delete and Write options (unlock all levels)

```bash
#!/bin/bash
#### enableRepoNImgDW.sh
#### Enable Delete and Write options at repository level, by tag, and by digest

while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
      --acr-name) ACR_NAME="$2"; shift ;;
      --repo-name) REPOSITORY_NAME="$2"; shift ;;
  esac
  shift
done

#### Unlock at repository level
az acr repository update --name $ACR_NAME --repository $REPOSITORY_NAME --delete-enabled true &> /dev/null
az acr repository update --name $ACR_NAME --repository $REPOSITORY_NAME --write-enabled true &> /dev/null
az acr repository show --name $ACR_NAME --repository $REPOSITORY_NAME --output jsonc

#### Unlock each image by tag
IMAGE_LIST=$(az acr repository show-tags -n $ACR_NAME --repository $REPOSITORY_NAME --output json)
for i in $(echo $IMAGE_LIST | jq -r '.[]'); do
    echo "Image: $i"
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME:$i --delete-enabled true &> /dev/null
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME:$i --write-enabled true &> /dev/null
    az acr repository show -n $ACR_NAME --image $REPOSITORY_NAME:$i --output json | jq '.'
done

#### Unlock each image by digest
IMAGE_DIGESTS=$(az acr repository show-manifests --name $ACR_NAME --repository $REPOSITORY_NAME --query "[].digest" --output tsv)
for digest in $IMAGE_DIGESTS; do
    echo "Image Digest: $digest"
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME@$digest --delete-enabled true &> /dev/null
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME@$digest --write-enabled true &> /dev/null
    az acr repository show -n $ACR_NAME --image $REPOSITORY_NAME@$digest --output json
done
```

Usage:
```bash
chmod 755 enableRepoNImgDW.sh
./enableRepoNImgDW.sh --acr-name <ACR_NAME> --repo-name <REPO_NAME>
```

##### Disable Delete and Write options (lock all levels)

```bash
#!/bin/bash
#### disableRepoNImgDW.sh
#### Disable Delete and Write options at all levels (repository, tag, digest)

while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
      --acr-name) ACR_NAME="$2"; shift ;;
      --repo-name) REPOSITORY_NAME="$2"; shift ;;
  esac
  shift
done

#### Lock each image by tag first
IMAGE_LIST=$(az acr repository show-tags -n $ACR_NAME --repository $REPOSITORY_NAME --output json)
for i in $(echo $IMAGE_LIST | jq -r '.[]'); do
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME:$i --delete-enabled false &> /dev/null
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME:$i --write-enabled false &> /dev/null
done

#### Lock each image by digest
IMAGE_DIGESTS=$(az acr repository show-manifests --name $ACR_NAME --repository $REPOSITORY_NAME --query "[].digest" --output tsv)
for digest in $IMAGE_DIGESTS; do
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME@$digest --delete-enabled false &> /dev/null
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME@$digest --write-enabled false &> /dev/null
done

#### Lock at repository level
az acr repository update --name $ACR_NAME --repository $REPOSITORY_NAME --delete-enabled false &> /dev/null
az acr repository update --name $ACR_NAME --repository $REPOSITORY_NAME --write-enabled false &> /dev/null
az acr repository show --name $ACR_NAME --repository $REPOSITORY_NAME --output jsonc
```

Usage:
```bash
chmod 755 disableRepoNImgDW.sh
./disableRepoNImgDW.sh --acr-name <ACR_NAME> --repo-name <REPO_NAME>
```

#### Owner and Contributors

**Owner:** Kenneth Gonzalez Pineda <kegonzal@microsoft.com>
**Contributors:** Tiago Furtado Goncalves

---

## Scenario 5: ACR Health-Check Command Background
> 来源: ado-wiki-a-acr-health-check-command-background.md | 适用: 适用范围未明确

### 排查步骤

#### ACR Health-Check Command Background

The `az acr check-health` command performs the following checks:

1. Check docker is installed and check version. Old docker doesn't conform to the OCI spec, hence some functionality might not work as expected.
2. Check you can use `docker pull` an image from MCR.
3. Check Azure CLI version so users know to upgrade to try out new features.
4. Ensure we can connect to the data endpoint of `<reg name>.azurecr.io` and get a token back — so DNS works.
5. Ensure the helm is installed and newer than the minimum version.

**NOTE:** This command can be expanded to add more checks for self-help.

#### Owner and Contributors

**Owner:** Naomi Priola <Naomi.Priola@microsoft.com>
**Contributors:** Ines Monteiro, Karina Jacamo, johngose, Arindam Dhar

---

## Scenario 6: ACR Behind Firewall
> 来源: ado-wiki-acr-behind-firewall.md | 适用: 适用范围未明确

### 排查步骤

#### ACR Behind Firewall

When customer has Azure Container Registry behind the Firewall, they often need to allow specific URLs for successful connectivity to registry and image pull operations.

#### ACR Firewall Background

When Docker Daemon tries to pull an image from the registry:

1. Docker client calls ACR endpoint to get manifest first: `GET /v2/<repo>/manifests/<tag>`
2. Docker client parses the manifest, gets the layer digest list, downloads them in parallel:
   - Docker client calls ACR endpoint: `GET /v2/<repo>/blobs/sha256:<sha256 digest>` to get layer blob redirect URL
   - Docker client gets the blob storage URL, follows the link to download content from Azure blob storage

#### What Customer needs to allow

Customer has to allow the REST ENDPOINT and the STORAGE ENDPOINT as mentioned in https://docs.microsoft.com/bs-cyrl-ba/azure/container-registry/container-registry-firewall-access-rules.

When customer has also enabled vNET Firewall on ACR, `docker pull` goes through data proxy `region-acr-dp.azurecr.io` instead of directly going via blob URL.

##### Important

1. Customer must allow data proxy `region-acr-dp.azurecr.io` in their Firewall for successful connectivity. For example, if registry is hosted in North Europe, the data proxy address would be `neu-acr-dp.azurecr.io`.

2. If customer has GEO-REPLICATION enabled, they must allow the data proxy address for all replicated regions. Example: if replicated region is West Europe, data plane is `weu-acr-dp.azurecr.io`.

#### Pain Points

1. Customer is not aware of the data plane URL
2. Customer is not comfortable allowing `*.blob.core.windows.net` (allows all blob storage)
3. Customer is not comfortable allowing all IP ranges for the region

#### Upcoming Changes

ACR PG is working on a consistent data plane format:
1. REST ENDPOINT (ACR FQDN)
2. DATA ENDPOINT: `registry_name.region.data.azurecr.io`
   Example: `myregistry.northeurope.data.azurecr.io`

Note: Data endpoint is regional. With GEO REPLICATION, customer must allow data endpoint for each replicated region.

---

## Scenario 7: How to find the user of manifest event
> 来源: ado-wiki-acr-find-user-of-manifest-event.md | 适用: 适用范围未明确

### 排查步骤

#### How to find the user of manifest event


#### Summary and Goals

It happens sometime that a ACR user accidentally execute some action like delete or untag on image without notifying other users. Then users of ACR may raise a support ticket to track a missing image or a image update activity. This TSG is aim to help support engineer find the user identity and client IP of who execute the manifest event

##### Prerequisites

* Name of the affected ACR
* Access to <https://portal.microsoftgeneva.com/logs/dgrep>
* Access to <https://acr.kusto.windows.net/>

##### Involved Components

* ACR kusto database
* Geneva DGREP portal

#### Implementation Steps

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

3. Copy the correlationID and use ACR Dgrep(<https://portal.microsoftgeneva.com/logs/dgrep>) to investigate further, use the following filter
    * In 'Endpoint', select 'Diagnostics  PROD'
    * In 'Namespace', select 'AcrProdRegistry'
    * In 'Event to search', select 'RegistryManifestEvent'
    * In 'Time range' select same as output of step 2, with 5-10 mintes range
    * In 'Scoping conditions', set 'Region' filter same as output in step 2, and remember to select 'UTC'(Notice: use 'Region' instead of 'RegionStamp', 'RegionStamp' may cause some data loss)
    * In 'Filtering conditions', set `| Registry contains <ACR-name>`
      * In 'Client query' field, input the follow:

          ```kql
           where correlationId == "546394e5-42cd-4ae6-9b86-784f84bf1268" //---->correlation ID get in step 2
           take 10 //--->this line is very necessary to aviod null output caused by throtlling!
          ```

4. The key columns may be scrubbed to protect user privacy, click on 'Search unscrubbed' beneath the green bar to search unscrubbed.

5. Find the 'auth_user_name' and 'http_request_remoteaddr_ipv4' in the output, these are key info to track the user execute manifest event.

6. If the 'auth_user_name' is shown as an strange application ID that cannot be found either in user's Azure Portal or the user's tenant, and the 'http_request_remoteaddr_ipv4' shows a Microsoft owned IP, the delete action may be done by 'acr task' or 'acr run', as the command is execute by a shared acr agent using a special application.

   We can cross verify that action in ARM Kusto table:

   ```kql
   HttpIncomingRequests
   | where TIMESTAMP between (datetime(2024-03-25T06:08:47) .. 5min)
   | where subscriptionId contains "3da23e52-6023-4d28-bb55-80a3e579cbe4"
   | where targetUri contains "acr09272023"
   ```

7. Above sample shows there was a 'az acr run' command run via AzureCLI at the time when image get deleted. Notice that a untag action can be done by purge command or untag command, and both commands can be the content of ACR task.

#### Owner and Contributors

**Owner:** April Li <siyueli@microsoft.com>

---

## Scenario 8: ACR Image or Repository Recovery
> 来源: ado-wiki-acr-image-or-repository-recovery.md | 适用: 适用范围未明确

### 排查步骤

#### ACR Image or Repository Recovery

Customers sometimes "accidentally" delete images from ACR that they need. Even though ACR does support soft deletes, not all clusters are using it, _or_ a customer may want to recover an image that is too old for soft-delete to retrieve.

[The default retention period for soft-delete is seven days](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-soft-delete-policy).

#### Mitigation Steps

1. To see deleted repositories you can use this Kusto query:

   ```sql
   cluster('acr').database('acrprod').RegistryManifestEvent
   | where PreciseTimeStamp > ago(1d)
   | where  Registry == "registryname.azurecr.io"
   | where Action == "DeleteRepository"
   | project PreciseTimeStamp, message, Registry, Action, Artifact, ArtifactType, Tag, SubscriptionId, Digest
   ```

2. From the output of this query note down the ArtifactType.

   Unfortunately the output of the above query does not provide the tag, but we can get it from another query IF the repository was not created more than 30 days ago, if it was created more than 30 days ago you'll have to get the tag from the customer if they did not provide it already

   ```sql
   cluster('acr').database('acrprod').WorkerServiceActivity
   | where env_time > ago(1d)
   | where Repository == "aks-helloworld"
   | where RegistryLoginUri == "registryname.azurecr.io"
   | extend Count = 1
   | distinct Repository , Tag, Digest, Count, OperationName, PreciseTimeStamp
   ```

   Also if there are multiple tags, then we'd need to verify with the customer which one to restore.

   Once you have the above details, please reach out to your TA to do the recovery of the image/s.

#### Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Christopher Hanna <chrhanna@microsoft.com>
- Hanno Terblanche <hanter@microsoft.com>

---

## Scenario 9: How to Investigate Bulk Image and Tag Deletions in Azure Container Registry
> 来源: ado-wiki-acr-investigate-bulk-image-tag-deletions.md | 适用: 适用范围未明确

### 排查步骤

#### How to Investigate Bulk Image and Tag Deletions in Azure Container Registry

#### Summary and Goals

When investigating a large volume of image or tag deletions in Azure Container Registry (ACR), it's critical to identify what triggered the deletions, when they occurred, and correlate these events with Azure automation processes. This guide provides a comprehensive approach to investigating bulk deletion events, determining the source of the deletions (whether user-initiated, service principal-driven, or triggered by automation), and understanding the timeline and scope of the deletion activity.

This guide is particularly valuable when:

- Customers report unexpected bulk image or tag deletions
- You need to track down the identity and source of mass deletion operations
- Correlation with ACR tasks, retention policies, or other Azure automation is required
- Understanding the timeline and volume of deletions is necessary for root cause analysis

##### Prerequisites

- Name of the affected Azure Container Registry
- Subscription ID of the ACR
- Approximate timeframe when deletions occurred (if known)
- Access to <https://acr.kusto.windows.net/>
- Access to <https://portal.microsoftgeneva.com/logs/dgrep>
- Access to Azure Resource Manager (ARM) Kusto database for automation correlation

##### Involved Components

- Azure Container Registry (ACR)
- ACR Kusto databases (acrprod)
- Geneva DGREP portal for unscrubbed logs
- Azure Resource Manager (ARM) for tracking automation triggers
- ACR Tasks and retention policies
- Service principals and managed identities

#### Implementation Steps

##### Step 1: Identify the Scope and Timeline of Deletions

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

##### Step 2: Identify Specific Deletion Events

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

##### Step 3: Identify the Source of Deletions Using DGREP

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

##### Step 4: Determine if Deletions Were Triggered by ACR Tasks

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

##### Step 5: Check for Retention Policy Activity

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

##### Step 6: Check Repository Delete Operations

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

##### Step 7: Correlate with External Azure Automation

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

##### Step 8: Document Findings and Provide Recommendations

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

#### References

- [ACR Retention Policy Documentation](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-retention-policy)
- [ACR Diagnostic Logs and Auditing](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-diagnostics-audit-logs)
- [ACR Image Locks](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-image-lock)
- [Azure RBAC Permissions for ACR](https://learn.microsoft.com/en-us/azure/role-based-access-control/permissions/containers#microsoftcontainerregistry)

---

## Scenario 10: Shell script for getting all images older than a year from the repos in an ACR
> 来源: ado-wiki-acr-list-old-images-script.md | 适用: 适用范围未明确

### 排查步骤

#### Shell script for getting all images older than a year from the repos in an ACR

#### Summary

To list all repo images/manifests  which are older than a year from an ACR.
But the issue was, CX had an ACR with 20000 repos which had images in it and manually executing the below command for each repo was not possible.

Command gives output of a single repo images/manifests data from the ACR older than a year
az acr manifest list-metadata --name $repository --registry $acr_name --orderby time_asc -o tsv --query "[?lastUpdateTime < '2023-10-04'].[digest, lastUpdateTime]"

CX had 22k repos in single ACR ,hence needed to iterate the repos to fetch all the images older than a year, and cx wanted to select the number of repos to query(ex first 4k ,then next 4k etc)
as querying 22k repos images was taking > 1day ,and hence needed a shell script.

#### Solution

##### The below script will iterate repos and fetch all repo images older a year ,from the ACR as beow

1)Get the list of repositories in the ACR in acr.txt file

```bash
az acr repository list --name aiindevops --output tsv > acr.txt
```

2)Get the acr.txt, shows list of repo names of ACR

3)Script to fetch the ACR repo names and images/manifest of each repo

```bash
#!/bin/bash

#### Set the ACR name and registry
acr_name="aiindevops"

#### fetches total no of lines count (ex 22k) from acr.txt (which has all the repo names in acr)
max=$(cat acr.txt | wc -l)
echo $max

#### set 1 to 4k lines to fetch repo images out of 22k, next time set loop from 4001 to 8000 each iteration respectively
for (( i=1; i <= 4000; ++i ))
do
  repositories=$(sed -n "${i}p" acr.txt)
  for repository in $repositories
  do
   manifests=$(az acr manifest list-metadata --repository $repository --name $acr_name --orderby time_asc -o tsv --query "[?lastUpdateTime < '2023-10-04'].[digest, lastUpdateTime]")

   # Output the repository name
   echo "$i: Repository: $repository"

   # Output the image manifests and their metadata
   echo "Manifests:"
   echo "$manifests"

  done
done
```

4)Run the script to fetch the repo images/manifest from the ACR and redirect/append output to a file

```bash
./AcrRepoFetch.sh >> acrrepoamnifest.txt
```

---

## Scenario 11: ACR Authorization - RBAC/ABAC
> 来源: ado-wiki-b-acr-authorization-rbac-abac.md | 适用: 适用范围未明确

### 排查步骤

#### ACR Authorization - RBAC/ABAC


#### Goals

Troubleshooting guide for the runtime AAD authorization checks that are performed using the new compliant data plane authorization service CheckAccess V2 (Remote PDP), RBAC, and ABAC.

#### Non Goals

This is not a reference for questions like when & where complaint RBAC (Role-Based Access Control) or ABAC (Attribute-Based Access Control) are used. For detailed information about the authorization process in ACR, please refer to the [ABAC public documentation](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-abac-repository-permissions).

#### Introduction

All authorization for AAD identities with compliant RBAC is handled by token server irrespective of where the request gets routed. Azure RBAC is an authorization system that helps manage who has access to Azure resources, what they can do with those resources, and what areas they have access to. Azure ABAC builds on Azure RBAC by adding role assignment conditions based on attributes in the context of specific actions.

In the token server, RBAC is handled by AzureRBACProvider.cs which uses different layers of cache to optimize the authorization checks. It writes a consolidated log entry with all details with the message name `rbac_request_log`. You can query the RBAC log for a request using the request's correlationId:

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | where message == "rbac_request_log"
    | sort by PreciseTimeStamp asc
    | project-reorder PreciseTimeStamp, message, TenantId, http_request_host, Subscription, http_response_status, http_response_duration, rbac_response_source, rbac_cachekey, rbac_redis_duration, rbac_memorycache_count, err_detail
```

##### RBAC log fields

| Log Field              | Description                                                                                                                                   |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| rbac_cachekey          | The cache key used for looking into the RBAC caches. Format: CheckAccessVersion:RegistryId:InputTokenId                                       |
| rbac_response_source   | Source from where the RBAC response is returned (local in-memory / Redis cache, or direct Azure RBAC API call)                               |
| rbac_redis_duration    | Duration in ms for Redis lookup (if Redis cache was accessed)                                                                                 |
| rbac_memorycache_count | Current count of the local in-memory cache                                                                                                    |
| rbac_abac              | Indicates whether the request uses ABAC                                                                                                       |
| TenantId               | Tenant Id of the subscription where the resource exists                                                                                       |
| Subscription           | Subscription Id of the resource                                                                                                               |
| http_request_host      | The registry login server being authenticated                                                                                                 |
| http_response_status   | The response status                                                                                                                           |
| http_response_duration | Response duration in ms of Azure RBAC API (if invoked)                                                                                       |
| err_detail             | Exception details if the request failed                                                                                                       |

Check whether ABAC (repo permission) feature is enabled:

```sql
RegistryMasterData
    | where RegistryName == "<registry name>"
    | summarize arg_max(PreciseTimeStamp, EnableRepoPermission)
```

##### MSAL request log

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | where message == "msal_request_log"
    | sort by PreciseTimeStamp asc
    | project-reorder PreciseTimeStamp, message, http_response_status, http_response_duration, msal_token_source, msal_duration_total_ms, msal_duration_cache_ms, msal_duration_http_ms, err_detail
```

**When compliant RBAC is used** (may expand in future):
- Requests to token server for a registry belonging to a tenant with private endpoints enabled
- Requests with AAD tokens scoped to ACR audience `https://containerregistry.azure.net`
- Requests with AAD tokens scoped to ARM audience when UseCheckAccessForAuth feature flag is enabled (now enabled for all registries)

#### Possible Troubleshooting scenarios

##### 1. Token Server request fails with unexpected status code (>= 500)

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where http_request_host == "myregistry.azurecr.io"
    | where message == "ts_request_stop" or message == "fe_request_stop"
    | where http_response_status == 500
    | sort by PreciseTimeStamp asc
    | project PreciseTimeStamp, correlationId
```

Then check detailed logs and RBAC/MSAL exceptions:

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | where message == "rbac_request_log" or message == "msal_request_log"
    | project-reorder PreciseTimeStamp, message, http_response_status, err_detail
```

If error relates to CheckAccess API, see scenario 3. If exception indicates downtime/outage → create ICM.

##### 2. Token server requests have long latency or time out

Get correlationId for slow request, then check RBAC/MSAL latency:

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | where message == "rbac_request_log" or message == "msal_request_log"
    | sort by PreciseTimeStamp asc
    | project-reorder PreciseTimeStamp, message, http_response_status, http_response_duration, err_detail
```

##### 3. CheckAccess API request fails

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationId == "<correlationId>"
    | where message == "checkAccess_api_stop"
    | project-reorder PreciseTimeStamp, correlationid, message, http_response_status, http_response_duration, err_detail, http_request_uri
```

If deeper investigation on CheckAccess is needed → escalate via ICM.

**Dashboards:**
- [CheckAccess Dashboard](https://portal.microsoftgeneva.com/dashboard/AzureContainerRegistry/Public/Dataplane/Features/Compliant-RBAC/CheckAccess)
- [ABAC Repo Permission Dashboard](https://portal.microsoftgeneva.com/dashboard/AzureContainerRegistry/Public/Dataplane/Features/Compliant-RBAC/ABAC%2520Repo%2520Permission)

##### 4. Authorization Issues with Role Assignments (RBAC vs ABAC)

Check whether the registry uses ABAC repository permissions:

```sql
RegistryMasterData
| where env_time > ago(1d)
| where RegistryName == '<registry-arm-resource-name>' or LoginServerName == '<registryfqdn.azurecr.io>'
| project-reorder RegistryName, LoginServerName, EnableRepoPermission
```

- `EnableRepoPermission = True` → "RBAC Registry + ABAC Repository Permissions" (`roleAssignmentMode = AbacRepositoryPermissions`)
- `EnableRepoPermission = False` → "RBAC Registry Permissions only" (`roleAssignmentMode = LegacyRegistryPermissions`)

Consult [ACR role directory reference](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-built-in-roles-directory-reference) for correct built-in roles per mode.

##### 5. Troubleshooting Authorization Issues (Step-by-Step)

#### Customer Self-Diagnosis
Suggest customer run:
```bash
az acr check-health -n myregistry --repository myrepo
```
This shows which permissions they have (full / partial / none) to the specific repository.

#### Step 1: Get correlationId for the failed request

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(3h)
    | where http_request_host == "myregistry.azurecr.io"
    | where message == "fe_request_stop" or message == "ts_request_stop"
    | project-reorder PreciseTimeStamp, correlationid, jwtid, message, http_response_status, auth_token_access, err_detail, http_request_uri, err_code, err_message, http_request_useragent
```

#### Step 2: Analyze frontend request logs

Check `err_detail` — e.g. `bearer token authentication challenge ... err_auth_insufficient_scope`
Check `auth_token_access` — empty scope means the token received by the registry has no permissions.

#### Step 3: Trace the token server request using jwtid

```sql
RegistryActivity
    | where PreciseTimeStamp > ago(1d)
    | where correlationid == "<correlationid>"
    | project-reorder PreciseTimeStamp, correlationid, message, auth_token_access_granted, auth_token_access, http_request_host
```

#### Step 4: Compare requested vs. granted permissions

- **`auth_token_access`**: scope the user requested (e.g. `repository:hello-world:pull`)
- **`auth_token_access_granted`**: scope actually granted (e.g. `repository:hello-world:` — missing pull)

This reveals which specific permissions are missing, pointing to a role assignment gap.

#### References

- [ACR RBAC Public Doc](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-built-in-roles-overview)
- [ACR ABAC Public Doc](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-abac-repository-permissions)
- [ACR roles directory reference](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-built-in-roles-directory-reference)

#### Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>
**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>

---

## Scenario 12: Azure Container Registry Change Analysis
> 来源: ado-wiki-b-acr-change-analysis.md | 适用: 适用范围未明确

### 排查步骤

#### Azure Container Registry Change Analysis

Often we come across situation where customer would like to know what flags were changed in their Azure Container Registry and who initiated the change. We have received numerous feedback to allow visibility of these information to customers so that customer need to necessarily contact support.

For example:

1. Customer claims that admin account associated with registry is disabled/enabled.
2. Which property or policy associated with the registry is changed recently.

Now customer has visibility to these information in their portal. Note this is **not** same as ACR [audit logs](../ACR-Audit-Logs).

#### How to check the flag change details

##### Step 1: Register the Microsoft.ChangeAnalysis resource provider

1. In the Azure Portal, navigate to your subscription.
2. Search for **Resource Providers**.
3. Find and **Register** `Microsoft.ChangeAnalysis`.
4. Wait until the status shows **Registered**.

##### Step 2: Make changes on the Registry (for testing)

For example:
- Changed SKU from Standard to Premium
- Disabled Admin Account
- Enabled Retention
- Enabled Content Trust

##### Step 3: Locate the Change Analysis Service in Portal

Search for "Change Analysis" in the Azure Portal global search.

##### Step 4: Select the Resource Group and the Registry

- Use the filter dropdowns to select the target resource group and registry.
- The results will show what changes were made and who initiated them.
- Note: For some flags (like "Retention" and "Content Trust"), the change shows as "NAME=status" — see Step 5 for detailed info.

##### Step 5: View detailed change info via Activity Logs

1. Navigate to **Activity Logs** on the registry.
2. Select the relevant operation.
3. Click **Change History (preview)**.
4. This shows the **previous value** and the **new value** for the changed property.

#### Owner and Contributors

**Owner:** Naomi Priola <Naomi.Priola@microsoft.com>

---

## Scenario 13: Continuous Patching Workflow Troubleshooting
> 来源: ado-wiki-b-acr-continuous-patching-workflow-tsg.md | 适用: 适用范围未明确

### 排查步骤

#### Continuous Patching Workflow Troubleshooting

#### Overview

Continuous Patching is a feature in Azure Container Registry that enables scan and patch of specified artifacts for OS-level vulnerabilities within a registry.

When the customer enables Continuous Patching, three ACR tasks are created on their registry named `cssc-trigger-workflow`, `cssc-scan-image` and `cssc-patch-image`.

As the name implies, the trigger task runs on a specified set cadence and queues up scan and patch tasks on the configured list of images for vulnerabilities scan and patches using Trivy and Copacetic (Copa) respectively.

#### Check if Continuous Patching Workflow is enabled on Cx Registry

[Run Query](https://dataexplorer.azure.com/clusters/acr/databases/acrprod?query=H4sIAAAAAAAAA5VSPW%2FbMBDd%2BysOmiRAjoNk6VBlqDs0RZHBdqaiMC7UVWIskQLvGEVFfnyPrqUkQJdOJO%2Fde%2Ffx%2BDnarv7qWfYBDX14gbGlQEDu6SC2J7gBbHx%2BfVkXsF7DZrfbgCAfGbj1sauhxSeCEB2gdIQs4J0hsA6kJehS4PoSapx4kd5jAywYhEcrLWTb6LbEsZNMU4bgH8nIUr9UrmA1YGA6PLJ3%2BRd9f9NLodn0LORq2MWH27oSHSJY1%2BQ8dFbyxLsI1FiNTlrAx2Doti6zdVb8uPpZlFtq7rCn%2F%2BJ9VN67BAVOHV6kpSS51xlWOOJ0ApfR0%2BMwZ6Yl5ZlhNiut3zQUVqMPx1%2BdH7Pyb5wNupXtsaE5MqCY9hwqFt3zKFBVkH0ykcX3FGDu8SZT6%2B4HLU7qimUQf3JnxsEl7uQjjOgkoaYlc1R1jn2Pwf4m2PioUAUmnXlRwne1Vp3bpz9SQY%2FP%2BWxZAQ%2FT3FGpbp%2BnrWBZ9Ls1FG9cfyNa%2FlNivv4BsF5N7rYCAAA%3D)

```sql
BuildHostTrace
| where env_time > ago(30d) // CSSC tasks should have run atleast once in the last 30 days
| where Tag startswith "RunResult"
| project env_time, data=parse_json(DataJson)
| extend SubId=tostring(split(data.registryResourceId,"/")[2]),RegName=tostring(split(data.registryResourceId,"/")[8]),data.registryId, data.taskName
| project-away data
| where data_taskName in ("cssc-trigger-workflow","cssc-scan-image","cssc-patch-image")
| where RegName == "<customer registry>" // Update this to the registry name you want to check
| summarize Count = count(), LastRunTime = max(env_time) by RegName, TaskName = tostring(data_taskName)
| project LastRunTime, RegName, TaskName = TaskName
```

Result should return 1-3 rows for each cssc task type and when was it last run in the last 30 days.

#### Common Issues and Troubleshooting Steps

##### Case 1: Customer reports failures during Patching in their registry

Use the query below to get customer **SubscriptionId** and failed patch task **RunIds** for the customer's registry

```sql
BuildHostTrace
| where env_time > ago(5d) //Update this to the time range you want to check
| where Tag startswith "RunResult"
| project env_time, data=parse_json(DataJson)
| extend subId=tostring(split(data.registryResourceId,"/")[2]),RegName=tostring(split(data.registryResourceId,"/")[8]), RunIds=data.id, data.registryLocation,data.taskName, data.status, data.runDuration
| project-away data
| where RegName == "<customer registry>" //Update this to the registry name you want to check
| where data_status == "Failed"
| where data_taskName == "cssc-patch-image"
```

##### Case 2: Customer reports failures during Scanning in their registry

Use the query below to get customer **SubscriptionId** and failed scan task **RunIds** for the customer's registry

```sql
BuildHostTrace
| where env_time > ago(5d) //Update this to the time range you want to check
| where Tag startswith "RunResult"
| project env_time, data=parse_json(DataJson)
| extend subId=tostring(split(data.registryResourceId,"/")[2]),RegName=tostring(split(data.registryResourceId,"/")[8]), RunIds=data.id, data.registryLocation,data.taskName, data.status, data.runDuration
| project-away data
| where RegName == "<customer registry>" //Update this to the registry name you want to check
| where data_status == "Failed"
| where data_taskName == "cssc-scan-image"
```

#### ACIS

- Use the ACIS action to get failed patch and/or scan task logs using the Subscription Id and RunIds from the previous step.
- Analyze the logs to see what went wrong during the scan/patch task run.
- Refer to [Common Issues TSG](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-cloud-native-and-management-platform/containers-bburns/azure-container-registry/registry/topics/cssc/continuous-patching-workflow-common-issues) for common error patterns.

#### Patch Failures

##### 1. Patch task failure due to cache rule

- **Issue**: Patch task failed at "push-image" step due to cache rule error
- **Solution**: CSSC workflows are not supported on repositories containing just PTC (Pull-Through Cache) based rules. Customer can either switch to Artifact sync based cache rules or use the CSSC workflow on a different repository that does not contain PTC based rules.

##### 2. Patch task failure due to image "not found" in MCR

- **Issue**: Patch task failed with image "not found" in MCR error
- **Solution**: This happens when the tooling image that copa uses for patching is not available in MCR. Contact upstream team (azcu-publishing@microsoft.com) or raise a PR to pull the missing image to MCR.

##### 3. Patch task failure during "patch-image" step

For any other failures during patch-image step, the issue could be due to copa. Contact the Copa team.

#### External resources

##### Contact Copa team

Copacetic and Trivy are projects external to Microsoft, not covered by Microsoft's support policies (IcM tracking). Support is provided on a best-effort basis through GitHub issues.

- Confidential issues: copacetic@microsoft.com
- Key contacts: Sertac Ozercan (seozerca@microsoft.com), Robbie Cronin (robbiecronin@microsoft.com)
- [Copa Team TSG](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/722923/TSG-Copa)
- [Copa external FAQ](https://project-copacetic.github.io/copacetic/website/faq)
- [Copa troubleshoot guide](https://project-copacetic.github.io/copacetic/website/troubleshooting)

---

## Scenario 14: Troubleshooting Flow
> 来源: ado-wiki-b-acr-custom-domain-configuration.md | 适用: 适用范围未明确

### 排查步骤

1. Upload your cert into Azure Key Vault
2. Under custom-domain/key-vault-setup/, run the following:
   1. (Optional) Create an Azure Key Vault, if you don't already have one:
      `.\ensure-vault.ps1 -subscriptionName <subscription> -resourceGroupName <resourceGroup> -vaultName <new VaultName>`
   2. Upload contoso.pfx to Azure Key Vault:
      `.\upload-cert.ps1 -pfxFilePath <pfxFile> -pfxPwFile <pwdFile> -secretName <new SecretName> -vaultName <vaultName>`
3. Deploy and configure an Nginx Docker image on a new Azure VM
4. Deploy via Azure Portal

Alternatively, to deploy using powershell script, custom-domain/docker-vm-deploy/, do the following:

1. Edit azuredeploy.parameters.json and populate all necessary parameters
2. Run the following script to create the new VM:
   `.\deploy.ps1 -resourceGroupName <resourceGroup>`
3. Configure DNS zone
4. Configure the DNS zone so registry.contoso.com points to the Azure VM you have just created. If you are using an Azure DNS Zone. You can use the following command:
`New-AzureRmDnsRecordSet -Name <registry> -RecordType CNAME -ZoneName <contoso.com> -ResourceGroupName <resourceGroup> -Ttl <Ttl> -DnsRecords (New-AzureRmDnsRecordConfig -Cname <AddrToAboveVM>)`
5. Quick verification -
   A simple way to test the setup is to call docker login to quickly confirm that the requests are properly forwarded:

   `docker login -u <username> -p <password> registry.contoso.com`

---

## Scenario 15: ACR DevOps Case Template
> 来源: ado-wiki-b-acr-devops-cases-template.md | 适用: 适用范围未明确

### 排查步骤

#### ACR DevOps Case Template

Here is a template sample to request information in those cases where Azure DevOps as main product interacts with ACR for images to be used in the pipelines.

1. What are the DevOps organization and Project where the pipeline is failing? Is this failing in other organizations or projects?

2. Can you provide us the configuration of the webhook? If possible, attach screenshots of the Trigger and Action tab and advise when the pipeline will trigger.

3. Collect information from a few pipeline runs and provide information where applicable:
   1. A successful run of the Pipeline
   2. The run containing the first instance of the problem (if possible)
   3. One run demonstrating the problem with `system.debug` set to `true`

      To run a pipeline with system.debug please follow our documentation here: [Review logs to diagnose pipeline issues - Azure Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/troubleshooting/review-logs?view=azure-devops)

   4. How many times has this failed? Is it sporadic, or all runs?

      **For each of those runs, collect:**

      * URL of pipeline results: `https://dev.azure.com/<org>/<project>/_build/results?buildId=<id>&view=results`

        If you cannot get the URL, please provide:
        - Project name:
        - Pipeline name:
        - Run / Build / Release Id:

      * Screenshots of the recent pipeline runs
      * Zip file containing any downloadable pipeline logs from the run

4. Pipeline definition logs:

   * If using **yaml pipelines**: attach final yaml by clicking "Download full yaml" in the `...` menu of the pipeline editor view.
   * If using **designer (non-yaml) pipelines**: please export the JSON for the failing definition (at the version active at first failure) and attach to the issue.

#### Owner and Contributors

**Owner:** Naomi Priola <Naomi.Priola@microsoft.com>

---

## Scenario 16: How to seek assitance from ACR PG using Teams Channel
> 来源: ado-wiki-b-acr-seek-pg-assistance-teams.md | 适用: 适用范围未明确

### 排查步骤

#### How to seek assitance from ACR PG using Teams Channel

1. Be part of the [ACR-SUP](https://teams.microsoft.com/l/channel/19%3a587a166080b64df99c2375a0b22c91b1%40thread.skype/General?groupId=3854ec50-7444-40d8-94a4-5989ec49b470&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) Teams Channel.

2. Fill in the details as mentioned below

   |             |       |
   |-------------|-------|
   | Case Number |       |
   | ASC Link    |       |
   | Issue       |       |
   | Repro       |       |
   | Error       |       |
   | ACR Name    |       |
   | Location    |       |

3. Submit.

#### Note

`Maintain 1 thread per issue. This helps PG to keep track of the cases and also some documentation on Engineering side.`

#### Point of contact

Please feel free to reach out to `ardhar@microsoft.com` for any queries.

#### Owner and Contributors

**Owner:** Naomi Priola <Naomi.Priola@microsoft.com>
**Contributors:**

- Ines Monteiro <t-inmont@microsoft.com>
- Karina Jacamo <Karina.Jacamo@microsoft.com>
- johngose <johngose@microsoft.com>
- Arindam Dhar <ardhar@microsoft.com>
- Jeff Martin <Jeffrey.Martin@microsoft.com>

---

## Scenario 17: Container Instance Deployment from Firewall protected ACR
> 来源: ado-wiki-container-instance-deployment-firewall-acr.md | 适用: 适用范围未明确

### 排查步骤

#### Container Instance Deployment from Firewall protected ACR

#### Objective

Deploy an Azure Container Instance using an image hosted in Azure Container Registry that is protected by Network Firewall (Allow Selected Subnets).

#### Deployment Steps

Use a **User Managed Identity** with **acr-pull** RBAC permissions on the Container Registry.

1. Create a User Managed Identity:
```bash
az identity create --resource-group <rg-name> --name <identity-name>
```

2. Get the Identity **Id** and **PrincipalID**:
```bash
userID=$(az identity show --resource-group <rg-name> --name <identity-name> --query id --output tsv)
spID=$(az identity show --resource-group <rg-name> --name <identity-name> --query principalId --output tsv)
```

3. Create Azure RBAC permissions on the ACR:
```bash
az role assignment create --assignee <principalId> --scope <acr-resource-id> --role acrpull
```

4. Deploy Container Instance with managed identity:
```bash
az container create -g <rg-name> --name <aci-name> \
  --assign-identity "<managed-identity-resource-id>" \
  --acr-identity "<managed-identity-resource-id>" \
  --image="<acr-name>.azurecr.io/<image>:<tag>" \
  --subnet <subnet-resource-id> \
  --registry-login-server "<acr-name>.azurecr.io"
```

5. On the ACR Networking Tab, enable:
   - "Allow Microsoft Services to access this container registry"
   - "Selected Networks"

#### Key Flags

- `--assign-identity`: The user-assigned managed identity resource ID
- `--acr-identity`: The identity used to pull from ACR (same managed identity)
- `--subnet`: Required for VNET-integrated ACI deployment

---

## 附录: Kusto 诊断查询

### 来源: image-integrity.md

# Image Integrity 功能查询

## 查询语句

### 查询 Image Integrity 启用操作

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").FrontEndQoSEvents
//| where PreciseTimeStamp > ago(7d)
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where resourceGroupName contains "{resourceGroup}"
| where resourceName contains "{cluster}"
| where userAgent has "azure-resource-manager"
| where operationName == "PutManagedClusterHandler.PUT"
| where propertiesBag has "\"enableImageIntegrity\":\"true\""
| project PreciseTimeStamp, apiVersion, operationID, correlationID, resultCode, errorDetails, propertiesBag
```

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照

---
