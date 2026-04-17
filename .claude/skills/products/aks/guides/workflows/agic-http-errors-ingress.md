# AKS AGIC HTTP 错误码排查 — ingress — 排查工作流

**来源草稿**: ado-wiki-a-AGIC-Support-Boundary.md, ado-wiki-a-agic-appgw-config-update-verification.md, ado-wiki-a-agic-backend-app-issues.md, ado-wiki-agic-multiple-apps-one-appgw.md
**Kusto 引用**: 无
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Application Gateway Ingress Controller
> 来源: ado-wiki-a-AGIC-Support-Boundary.md | 适用: 适用范围未明确

### 排查步骤

#### Application Gateway Ingress Controller


#### Overview

The Application Gateway Ingress Controller (AGIC) is a Kubernetes application, which makes it possible for AKS  customers to leverage Azure's native Application Gateway L7 load-balancer to expose cloud software to the Internet. AGIC monitors the Kubernetes cluster it is hosted on and continuously updates an App Gateway, so that selected services are exposed to the Internet.

#### AppGw AGIC GitHub versus Addon

- GitHub: When AppGw Ingress Controller was first released, customers were only able to deploy with the AGIC GitHub method.  In this deployment type, the Ingress Controller runs in its own pod on the customer�s AKS.
- AddOn: AppGw Ingress Controller (as of 2020-06-10) can be deployed using the AddOn.  In this deployment type, AGIC runs within the AKS cluster and updates are managed by the service.

#### AGIC Support

Support cases can come in under either the AKS service, or the AppGW service. The following is from the AppGW wiki for AGIC. **The Azure Networking POD is the primary support team for Azure AppGw Ingress controller for AKS as of 2019-11-04**

##### Case Opened With AKS Support Topics

- Customer
  - Opens case in Azure Portal using AKS Support Topics
- CSS AKS engineer
  - Determines if the Azure Kubernetes Service (AKS) is up and running, and works any deployment related issues for AKS.
  - Test connectivity to the resource through front end LB IP.
  - Determines if there are specific questions about the AKS Ingress Controller for AppGw.  If yes, then **collaborate with CSS ANP**.
- CSS ANP Escalation
  - Verify AppGw deployment is in a good state. If not, troubleshoot.
  - Verify AppGw configuration.
  - Verify correct version of AGIC tooling.
  - If appropriate, **Escalate to CloudNet > EEE CloudNet**
- EEE CloudNet Escalation
  - Troubleshoot the issue.
  - If appropriate, **Escalate to CloudNet > Application Gateway Ingress Controller**

##### Case Opened With Azure Application Gateway Support Topics

- Customer
  - Opens case in Azure Portal using Azure Application Gateway Support Topics
- CSS ANP engineer
  - Verify AppGw deployment is in a good state. If not, troubleshoot.
  - Verify AppGw configuration.
  - Verify correct version of tooling used for Ingress Controller.
  - Requests AGIC YAML config files from the customer.
  - For any AKS service state, deployment issues, etc **Collaborate with CSS AKS**
- CSS AKS engineer
  - Troubleshoot AKS specific issues.
  - AppGw unable to communicate over the network to the specific Agent PODs (Linux/Windows, etc)
- CSS ANP Escalation
  - Troubleshoot
  - If appropriate, **Escalate to CloudNet > EEE CloudNet**
- EEE CloudNet Escalation
  - Troubleshoot the issue.
  - If appropriate, **Escalate to CloudNet > Application Gateway Ingress Controller**

#### References

- Networking Wiki on AGIC: <https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/218967/Azure-AppGw-Ingress-Controller-for-AKS>

#### Owner and Contributors

**Owner:** Jordan Harder <joharder@microsoft.com>
**Contributors:**

- Naomi Priola <Naomi.Priola@microsoft.com>
- Jordan Harder <joharder@microsoft.com>
- Karina Jacamo <Karina.Jacamo@microsoft.com>
- Jeff Martin <jemartin@microsoft.com>

---

## Scenario 2: AGIC: Is the Application Gateway Receiving Configuration Updates from AGIC?
> 来源: ado-wiki-a-agic-appgw-config-update-verification.md | 适用: 适用范围未明确

### 排查步骤

#### AGIC: Is the Application Gateway Receiving Configuration Updates from AGIC?

#### Purpose

Confirm if AGIC is successfully translating K8s resource changes into AppGW configuration updates.

#### Method 1: AGIC Pod Logs

```bash
kubectl logs -f -l app=ingress-appgw -n kube-system
```

Successful update sequence:
1. "BEGIN AppGateway deployment"
2. "Applied generated Application Gateway configuration"
3. "END AppGateway deployment"
4. "Completed last event loop run in..."

CSS: Also available via Jarvis Action → CustomerCluster - Get pods log.

#### Method 2: Application Gateway Activity Logs (Azure Portal)

Check Activity Log for:
- **Operation**: "Create or Update Application Gateway"
- **Status**: "Succeeded"
- **Timestamp**: matches K8s resource change time
- **Initiated by**: `ingressapplicationgateway-<CLUSTER_NAME>` (for addon clusters)

#### Method 3: ARM Logs (Kusto - CSS Internal)

```kql
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where subscriptionId == "<SUB_ID>"
| where PreciseTimeStamp > ago(1d)
| where targetUri contains "<APPGW_RESOURCE_ID>"
| where userAgent contains "ingress-appgw"
| project PreciseTimeStamp, userAgent, operationName, targetUri, clientIpAddress, TaskName, httpStatusCode
| order by PreciseTimeStamp asc
```

Check: userAgent contains "ingress-appgw/<version>", httpStatusCode=200, TaskName contains "EndWithSuccess".

#### Method 4: NRP Logs (Kusto - CSS Internal)

```kql
cluster("Nrp").database("mdsnrp").QosEtwEvent
| where SubscriptionId == "<SUB_ID>"
| where PreciseTimeStamp > ago(1d)
| where ResourceGroup == "<RG>"
| where ResourceName == "<APPGW_NAME>"
| where ClientAppId == "<AGIC_APP_ID>"
| project PreciseTimeStamp, ClientAppId, OperationName, ResourceGroup, ResourceName, Success, UserError
| order by PreciseTimeStamp asc
```

Check: Success=True, UserError=False.

---

## Scenario 3: Troubleshooting Backend Application Issues (AGIC)
> 来源: ado-wiki-a-agic-backend-app-issues.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshooting Backend Application Issues (AGIC)

> Note: Microsoft does not support development issues affecting AKS workloads (per AKS support policy). CSS drives investigation to the point where it is clear the issue is with the application itself.

#### Check Application Pod State

```bash
kubectl get pod <POD_NAME> -n <NAMESPACE> -o wide
```

Check:
- **READY**: all containers ready (e.g. "1/1")
- **STATUS**: should be "RUNNING"
- **RESTARTS**: stable number (high/increasing = instability)

#### Describe the Application Pod

```bash
kubectl describe pod <POD_NAME> -n <NAMESPACE>
```

Check: Pod status, Container state (+ last state/exit code), Pod conditions, Events.

#### Check Application Pod Logs

```bash
kubectl logs <POD_NAME> -n <NAMESPACE>
#### For CrashLoopBackOff:
kubectl logs -p -f <POD_NAME> -n <NAMESPACE>
```

> CSS tools (Jarvis) cannot access customer application pod logs due to data privacy policies.

#### Exec into Container

```bash
kubectl exec -it <POD_NAME> -n <NAMESPACE> -- /bin/bash
```

Useful for:
- Checking additional log files not visible in stdout/stderr
- Installing troubleshooting tools (strace, VisualVM, etc.)

#### Common Issues

##### Pod in Pending Status
- Insufficient resources preventing scheduling
- Check `kubectl describe` for scheduler events
- Ref: https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/#example-debugging-pending-pods

##### Pod Crashing or Unhealthy
- Check container exit codes
- Check pod logs for errors
- Common exit codes reference: https://komodor.com/learn/exit-codes-in-containers-and-kubernetes-the-complete-guide/

---

## Scenario 4: One Application gateway ingress, One cluster, 2 or more apps
> 来源: ado-wiki-agic-multiple-apps-one-appgw.md | 适用: 适用范围未明确

### 排查步骤

#### One Application gateway ingress, One cluster, 2 or more apps

The scope of this document is to provide some more specific instructions for creating and using a single application gateway ingress for multiple applications in the same AKS cluster. The below instructions will be for HTTP only, not HTTPS.

#### Prerequisites

- One AKS cluster, created using Azure cli, <https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough> OR using the Azure portal, <https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough-portal>
- One Application Gateway, created using Azure cli, <https://docs.microsoft.com/en-us/azure/application-gateway/quick-create-cli> OR using the Azure Portal, <https://docs.microsoft.com/en-us/azure/application-gateway/quick-create-portal>
- Inside the cluster create 2 namespaces, in the instructions below I will use UAT and DEV as my namespaces. App1 will be in UAT, and App2 will be in DEV.

#### Instructions

##### 1. Create the AAD pod Identity deployment

AAD Pod Identity consists of the Managed Identity Controller (MIC) deployment, the Node Managed Identity (NMI) daemon set, and several standard and custom resources.

Run this command to create the aad-pod-identity deployment on an RBAC-enabled cluster:
```
kubectl apply -f https://raw.githubusercontent.com/Azure/aad-pod-identity/master/deploy/infra/deployment-rbac.yaml
```

Or run this command to deploy to a non-RBAC cluster:
```
kubectl apply -f https://raw.githubusercontent.com/Azure/aad-pod-identity/master/deploy/infra/deployment.yaml
```

##### 2. Create an Azure Identity

Create a managed identity to update/manage the app gateway config:

```bash
az identity create -g <resourcegroup> -n <appid> -o json
```

Save the `clientId` and `id` values from the output.

##### 3. Install the Azure Identity

Create `aadpodidentity.yaml`:

```yaml
apiVersion: "aadpodidentity.k8s.io/v1"
kind: AzureIdentity
metadata:
  name: <appid>
spec:
  type: 0
  ResourceID: /subscriptions/<subid>/resourcegroups/<resourcegroup>/providers/Microsoft.ManagedIdentity/userAssignedIdentities/appid
  ClientID: <clientId>
```

Apply: `kubectl apply -f aadpodidentity.yaml`

##### 4. Install the Azure Identity Binding

Create `aadpodidentitybinding.yaml`:

```yaml
apiVersion: "aadpodidentity.k8s.io/v1"
kind: AzureIdentityBinding
metadata:
  name: <app-azure-identity-binding>
spec:
  AzureIdentity: <appid>
  Selector: <appid>
```

Apply: `kubectl apply -f aadpodidentitybinding.yaml`

##### 5. Set Permissions for MIC

Assign Managed Identity Operator role to the cluster service principal:

```bash
az aks show -g <resourcegroup> -n <name> --query servicePrincipalProfile.clientId -o tsv
az role assignment create --role "Managed Identity Operator" --assignee <sp id> --scope <full id of the managed identity>
```

##### 6. Install Helm and AGIC

```bash
helm repo add application-gateway-kubernetes-ingress https://appgwingress.blob.core.windows.net/ingress-azure-helm-package/
helm repo update
```

Download and edit `helm-config.yaml` with appgw subscription, name, and armAuth settings.

```bash
helm install appgw-ingress -f helm-config.yaml application-gateway-kubernetes-ingress/ingress-azure
```

##### 7. Deploy Applications with Host-based Routing

Deploy apps in separate namespaces (e.g., UAT, DEV). Use Ingress resources with `kubernetes.io/ingress.class: azure/application-gateway` annotation and host-based routing via nip.io or custom DNS.

Each app gets its own Ingress resource with a unique hostname, all sharing the same Application Gateway public IP.

#### Owner and Contributors

**Owner:** Naomi Priola
**Contributors:** Ines Monteiro, Karina Jacamo, Hanno Terblanche

---
