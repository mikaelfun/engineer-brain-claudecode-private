---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Monitoring/Logging Azure AD Users operation on AKS Cluster"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FLogging%20Azure%20AD%20Users%20operation%20on%20AKS%20Cluster"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Logging Azure AD Users operation on AKS Cluster

We often need to know who executed an operation at the cluster level. For an AKS cluster with AAD Integration this is how you can achieve this:

1. Create an AAD Group in Azure Active Directory

We take the ObjectId of this Group as we'll need to add it later at the cluster creation time.

2. We create an AKS-AAD integrated cluster for testing purpose with the Azure CLI:

`az aks create -g aad -n aad --enable-aad --aad-admin-group-object-ids 7938ded3-6d6d-4116-b5d0-8ac7f734ec68 --aad-tenant-id 716e7f5b-8914-47f5-85f0-84db07e6xxxx --enable-azure-rbac --node-count 1 --generate-ssh-keys`

3. Create an AAD User and assign to the aksadmin Group.

4. Assign permission for respective Group:

`AKS_ID=$(az aks show --resource-group aad --name aad --query id -o tsv)`

`az role assignment create --assignee 7938ded3-6d6d-4116-b5d0-8ac7f734ec68 --role "Azure Kubernetes Service Cluster User Role" --scope $AKS_ID`

5. Creating Role/RoleBinding for that cluster. For this step, we need to get credentials for admin user (az aks get-credentials -n aks -g aks --admin)

```yaml
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: dev-user-full-access
rules:
- apiGroups: ["", "extensions", "apps"]
  resources: ["*"]
  verbs: ["*"]
- apiGroups: ["batch"]
  resources:
  - jobs
  - cronjobs
  verbs: ["*"]
```

```yaml
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: dev-user-access
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: dev-user-full-access
subjects:
- kind: Group
  namespace: default
  name: 7938ded3-6d6d-4116-b5d0-8ac7f734ec68
```

6. Login with AAD User and execute some operations on the cluster level.

7. We assume that we enabled the kube-audit and kube-audit-admin Settings in Log Analytics for this AKS Cluster. Execute the following Kusto query:

```kusto
AzureDiagnostics 
| where log_s contains "nginx" 
| where log_s contains "aksdev"
```

```kusto
AzureDiagnostics
| where TimeGenerated > ago(4h)
| where Category contains 'kube-audit'
| project TimeGenerated, Category , pod=tostring(pod_s), log=tostring(log_s)
| where log contains "ResponseComplete"
| extend audit=parse_json(log)
| project TimeGenerated, pod, requestURI=tostring(audit.requestURI), verb=tostring(audit.verb), status=tostring(audit.responseStatus.code), userAgent=tostring(audit.userAgent), user=tostring(audit.user.username),latency=datetime_diff('millisecond', todatetime(audit.stageTimestamp), todatetime(audit.requestReceivedTimestamp)), audit
| where user !in ("aksService", "masterclient", "nodeclient")
| sort by TimeGenerated asc
| summarize count() by user, userAgent
```

In the **log_s** part of the result will find the user that executed that operation.
