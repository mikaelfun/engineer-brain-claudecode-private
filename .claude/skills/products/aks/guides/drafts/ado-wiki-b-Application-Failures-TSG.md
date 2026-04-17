---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Applications/Application Failures TSG"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Applications/Application%20Failures%20TSG"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Application Failures - Scoping Guide

[[_TOC_]]

## Summary

Application failures on Kubernetes can manifest in many different ways. This guide provides a systematic approach to **scope and categorize** application issues so engineers can quickly identify the root cause domain and navigate to the appropriate existing TSGs for detailed troubleshooting.

> **Key Principle:** Before diving into application-level debugging, always determine whether the issue is truly application-related or caused by underlying infrastructure (compute, networking, storage, or cluster management).
> **Tooling:** Use [Application Failure Tooling Guide](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Applications/Application-Failure-Tooling-Guide.md) for ASI/Jarvis workflows, kubectl command patterns, and copy-paste investigation sequences.

---

## Application Issue Scoping Flowchart

```text

                    APPLICATION ISSUE SCOPING FLOWCHART                          

                                        
                                        
                    
                       1. IS THE POD RUNNING/SCHEDULED?    
                          kubectl get pods -n <namespace>  
                    
                                        
                       
                                                        
                                                        
                                   
                  NO - Pod                        YES - Pod  
                  Not Running                     Is Running 
                                   
                                                        
                                                        
         
        Check Pod Status/Events:           2. CAN YOU REACH THE POD?     
        kubectl describe pod <name>           (Service/Ingress working?) 
         
                                                          
                  
                                                                   
              
    Pending    CrashLoop     Image       NO -          YES -    
    (Sched.)   BackOff       Pull      Network         App Level
               Error/OOM     Error     Issue           Issue    
              
                                                                 
                                                                 
              
    COMPUTE     APP/        ACR/       NETWORK         3. CHECK 
    or          COMPUTE/    IDENTITY   TSGs            LOGS &   
    STORAGE     STORAGE     TSGs                       EVENTS   
    TSGs        TSGs                                            
              
                                                                    
                                                                    
                                                   
                                                     Check: kubectl logs <pod> 
                                                     Is the error in app logs? 
                                                   
                                                                    
                                                       
                                                                                
                                                              
                                                  YES -                  NO -     
                                                  App Code               Check    
                                                  Issue                  Infra    
                                                  (3P/Cx)                Deps     
                                                              
                                                                                
                                                                    
                                                                                          
                                                                
                                                               Storage    Network/   Secrets/ 
                                                               Mount      DNS/Ext.   ConfigMap
                                                               Issues     Service    Issues   
                                                                
                                                                                          
                                                                                          
                                                                
                                                               STORAGE    NETWORK    SECURITY 
                                                               TSGs       TSGs       TSGs     
                                                                
```

```text
1) Determine pod state:
      - kubectl get pods -n <namespace>
      - kubectl describe pod <pod-name> -n <namespace>

2) If pod is not running:
      - Pending: check compute, scheduling, and storage TSGs
      - CrashLoopBackOff: check app logs, probes, and resource limits
      - ImagePullBackOff/ErrImagePull: check ACR, identity, and network paths

3) If pod is running but app fails:
      - Test service and pod reachability
      - Check logs and events
      - Decide app issue versus infrastructure dependency issue

4) If app logs do not show request handling:
      - Check service endpoints, DNS, network policy, and ingress path

5) Route to the matching TSG domain:
      - Networking, Storage, Compute, Security, or Cluster Management
```

---

## Step-by-Step Scoping Process

### Step 1: Determine Pod State

Run the following commands to understand the current state:

```bash
# Get pod status
kubectl get pods -n <namespace> -o wide

# Get detailed pod information and events
kubectl describe pod <pod-name> -n <namespace>

# Check recent events in the namespace
kubectl get events -n <namespace> --sort-by='.metadata.creationTimestamp'
```

| Pod Status | Likely Category | Next Action |
|------------|-----------------|-------------|
| `Pending` | Compute/Storage/Scheduling | Go to [Step 2A](#step-2a-pod-not-running---pending) |
| `CrashLoopBackOff` | App Code/Resource Limits/Dependencies | Go to [Step 2B](#step-2b-pod-not-running---crashloopbackoff) |
| `ImagePullBackOff`/`ErrImagePull` | ACR/Identity/Network | Go to [Step 2C](#step-2c-pod-not-running---image-pull-errors) |
| `ContainerCreating` (stuck) | Storage/Network/Runtime | Go to [Step 2D](#step-2d-pod-stuck-in-containercreating) |
| `Running` but not working | Network/App Logic/Dependencies | Go to [Step 3](#step-3-pod-is-running-but-application-not-working) |

---

### Step 2A: Pod Not Running - Pending

**Common Causes:**

- Insufficient cluster resources (CPU/Memory)
- Node selector/affinity rules cannot be satisfied
- PVC cannot be bound
- Taints preventing scheduling

**Diagnostic Commands:**

```bash
kubectl describe pod <pod-name> -n <namespace> | grep -A 20 "Events:"
kubectl get nodes -o wide
kubectl describe nodes | grep -A 5 "Allocated resources"
kubectl get pvc -n <namespace>
```

**Relevant TSGs:**

| Issue Type | TSG Link |
|------------|----------|
| Node scaling/capacity | [Node scaling fails due to allocation or capacity issues](/Azure-Kubernetes-Service-Wiki/AKS/TSG/CRUD/Node-scaling-fails-due-to-allocation-or-capacity-issues) |
| VM SKU availability | [VM-SKU-not-available-in-region](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/VM-SKU-not-available-in-region) |
| PVC node affinity conflicts | [PVC-node-affinity-conflict-resulting-pods-to-unscheduled](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Storage/PVC-node-affinity-conflict-resulting-pods-to-unscheduled) |
| Resource constraints | [Resource-Constraint-Troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Resource-Constraint-Troubleshooting) |
| Cluster Autoscaler | [Cluster-Autoscaler](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Cluster-Autoscaler) |

---

### Step 2B: Pod Not Running - CrashLoopBackOff

**Common Causes:**

- Application code errors
- Missing environment variables/secrets
- Resource limits too restrictive (OOMKilled)
- Liveness/readiness probe failures
- Dependency services unavailable

> **Probe behavior reminder:** Readiness probes control whether Service traffic is routed to a pod, while liveness probes control container restarts. See [Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

**Diagnostic Commands:**

```bash
# Check logs from current and previous container
kubectl logs <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous

# Check container termination reason
kubectl get pod <pod-name> -n <namespace> -o jsonpath='{.status.containerStatuses[*].lastState}'
```

**Relevant TSGs:**

| Issue Type | TSG Link |
|------------|----------|
| OOMKilled/Resource issues | [Resource-Constraint-Troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Resource-Constraint-Troubleshooting) |
| PID exhaustion | [Linux-PID-Exhaustion](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Linux-PID-Exhaustion-AKA-pthread_create-failed%3A-Resource-temporarily-unavailable) |
| Disk I/O throttling | [Detecting-Disk-IO-Throttling](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Detecting-Disk-IO-Throttling) |
| Service Account Token issues | [Troubleshooting-K8s-Service-account-Token-Secrets](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Security-and-Identity/Troubleshooting-K8s-Service-account-Token-Secrets) |

---

### Step 2C: Pod Not Running - Image Pull Errors

**Common Causes:**

- ACR authentication issues
- Network connectivity to registry blocked
- Image doesn't exist or wrong tag
- Rate limiting from public registries

**Diagnostic Commands:**

```bash
kubectl describe pod <pod-name> -n <namespace> | grep -A 10 "Events:"
kubectl get secret <pull-secret> -n <namespace> -o yaml
```

**Relevant TSGs:**

| Issue Type | TSG Link |
|------------|----------|
| ACR connectivity via proxy | [Unable-to-connect-to-private-ACR-via-proxy](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Networking/Outbound-Connectivity/Unable-to-connect-to-private-ACR-via-proxy) |
| Identity/Authentication | [Multiple-user-assigned-identities-error](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Security-and-Identity/Multiple-user-assigned-identities-error-with-AKS-extensions) |
| General ACR issues | [ACR TSGs](/Azure-Kubernetes-Service-Wiki/ACR/TSG) |

---

### Step 2D: Pod Stuck in ContainerCreating

**Common Causes:**

- Volume mount failures (PVC/CSI issues)
- Network plugin initialization
- Secrets/ConfigMaps not found
- CNI issues

**Diagnostic Commands:**

```bash
kubectl describe pod <pod-name> -n <namespace>
kubectl get events -n <namespace> --field-selector involvedObject.name=<pod-name>
```

**Relevant TSGs:**

| Issue Type | TSG Link |
|------------|----------|
| Storage mount issues | [AKS-Storage-Troubleshooting-Methodology](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Storage/AKS-Storage-Troubleshooting-Methodology) |
| MountVolume failures | [MountVolume.MountDevice-failed-for-volume](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Storage/MountVolume.MountDevice-failed-for-volume) |
| Disk attachment issues | [PVC-failure-with-error-AttachDiskWhileBeingDetached](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Storage/PVC-failure-with-error-%22AttachDiskWhileBeingDetached%22) |
| Network sandbox failures | [Failed-Create-Pod-SandBox](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Failed-Create-Pod-SandBox-failed-to-setup-network-for-sandbox) |

---

### Step 3: Pod is Running but Application Not Working

If the pod shows `Running` status but the application isn't functioning correctly, follow this decision tree:

```text
Pod Running but App Not Working
      |
      +-- Port-forward works?
      |      |
      |      +-- No --> Application-level investigation (logs, code path, dependencies)
      |      |
      |      +-- Yes --> Service/Ingress path investigation (networking)
      |
      +-- External traffic still failing?
             |
             +-- Yes --> Inbound connectivity checks (LB, Ingress, NSG)
```

#### 3A: Check if the Pod is Reachable

```bash
# Port-forward to test pod directly
kubectl port-forward <pod-name> 8080:<container-port> -n <namespace>

# Test from another pod in cluster
kubectl run test-pod --rm -it --image=busybox -- wget -qO- http://<service-name>.<namespace>.svc.cluster.local:<port>
```

| Result | Category | Next Step |
|--------|----------|-----------|
| Pod responds via port-forward, but not via Service | **Networking** (Service/Ingress) | See [Network TSGs](#networking-tsgs) |
| Pod doesn't respond via port-forward | **Application** issue | Check logs ([3B](#3b-check-application-logs)) |
| External traffic doesn't reach pod | **Networking** (Ingress/LB/NSG) | See [Network TSGs](#networking-tsgs) |

#### 3B: Check Application Logs

```bash
kubectl logs <pod-name> -n <namespace> -f
kubectl logs <pod-name> -n <namespace> -c <container-name>  # for multi-container pods
```

**Common patterns and their categories:**

| Log Pattern | Likely Category | TSG Area |
|-------------|-----------------|----------|
| Connection refused/timeout to database | Network/DNS | [DNS-Troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Networking/DNS/DNS-Troubleshooting) |
| Permission denied on file/volume | Storage | [Storage TSGs](#storage-tsgs) |
| Authentication/authorization errors | Security/Identity | [Security TSGs](#security-and-identity-tsgs) |
| Memory/heap errors | Compute/Resources | [Resource-Constraint-Troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Resource-Constraint-Troubleshooting) |
| Application business logic errors | **Out of Scope** (3P/Customer code) | Advise customer to debug |

---

## Quick Reference: TSG Categories

### Networking TSGs

For connectivity, DNS, load balancer, ingress, and service mesh issues:

- **Methodology:** [AKS-Network-Troubleshooting-Methodology](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-Network-Troubleshooting-Methodology)
- [DNS-Troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Networking/DNS/DNS-Troubleshooting)
- [Troubleshoot-SNAT-Port-exhaustion](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Networking/Outbound-Connectivity/Troubleshoot-SNAT-Port-exhaustion)
- [Load-Balancer-Health-probes-failing](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Networking/Inbound-Connectivity/Load-Balancer-Health-probes-failing-after-upgarding-to-v1.24)
- [Managed-Istio](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Networking/Managed-Istio)
- [AGIC TSGs](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Networking/AGIC)
- [HTTP-Proxy-Troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Networking/Ungrouped/Troubleshooting-HTTP-Proxy-Feature)

### Storage TSGs

For PVC, PV, CSI driver, and disk/file mount issues:

- **Methodology:** [AKS-Storage-Troubleshooting-Methodology](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Storage/AKS-Storage-Troubleshooting-Methodology)
- [MountVolume failures](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Storage/MountVolume.MountDevice-failed-for-volume)
- [Disk I/O Throttling](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Detecting-Disk-IO-Throttling)
- [CIFS-Credits-Troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Storage/CIFS-Credits-Troubleshooting)
- [Blob-CSI-Driver-OOM](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Storage/Blob-CSI-Driver-OOM-issues-when-mounting-volumes)

### Compute TSGs

For node, VM, resource limit, and scaling issues:

- [VMSS Troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Azure_Virtual-Machine_Scale-Set_TSG_Troubleshoot-AKS-VMSS-Clusters)
- [Unexpected node reboots](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Investigating-unexpected-node-reboots)
- [Windows on AKS](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Windows-On-AKS)
- [PID Exhaustion](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Linux-PID-Exhaustion-AKA-pthread_create-failed%3A-Resource-temporarily-unavailable)

### Security and Identity TSGs

For AAD, RBAC, managed identity, and secrets issues:

- [AAD-integrated-with-AKS-MFA](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Security-and-Identity/AAD-integrated-with-AKS-%2D---MFA-enabled)
- [Kubelogin-requirements-for-1.24+](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Security-and-Identity/Kubelogin-requirements-for-1.24+)
- [Azure-Policy-blocks-cluster-operations](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Security-and-Identity/Azure-Policy-blocks-cluster-operations)
- [Service Account Token Secrets](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Security-and-Identity/Troubleshooting-K8s-Service-account-Token-Secrets)

### Cluster Management TSGs

For scaling, upgrades, extensions, and cluster operations:

- [Cluster-Autoscaler](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Cluster-Autoscaler)
- [Resource-Constraint-Troubleshooting](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Resource-Constraint-Troubleshooting)
- [Extension-installation-failures](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Extension-installation-failures)
- [Admission-webhook-related-TSG](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Kubernetes-admission-webhook-related-TSG)

---

## Support Boundaries Reminder

| Scenario | Support Scope |
|----------|---------------|
| Pod won't schedule due to AKS/Azure issues | In Scope |
| Service/Ingress not routing traffic | In Scope |
| CSI driver/storage mount failures | In Scope |
| Customer application code bugs | Out of Scope - Advise & redirect |
| Third-party software configuration | Out of Scope - Best effort guidance |
| Performance tuning application code | Out of Scope - General guidance only |

Reference: [AKS support policies](https://learn.microsoft.com/en-us/azure/aks/support-policies)

---

## Owner and Contributors

**Owner:** jamesonhearn <jamesonhearn@microsoft.com>

**Contributors:**

- jamesonhearn <jamesonhearn@microsoft.com>

