# AKS TLS 证书与 Cert-Manager -- Comprehensive Troubleshooting Guide

**Entries**: 15 | **Draft sources**: 4 | **Kusto queries**: 0
**Source drafts**: ado-wiki-b-aci-standby-pools-error-guide.md, ado-wiki-b-automatic-cert-rotation.md, ado-wiki-c-Lets-Encrypt-Cert-Manager-Ingress.md, onenote-nginx-ingress-kv-cert-autorotation.md
**Generated**: 2026-04-07

---

## Phase 1: AKS clusters created before May 2019 have CA certi

### aks-150: AKS cluster certificates expired causing API server communication failure or clu...

**Root Cause**: AKS clusters created before May 2019 have CA certificates expiring after 2 years; clusters created after May 2019 have CA certs expiring after 30 years; all other certificates signed by Cluster CA expire after 2 years; intermediate certificates were NOT auto-rotated during upgrades until AKS release 2021-07-15

**Solution**:
Run `az aks rotate-certs -g $RESOURCE_GROUP_NAME -n $CLUSTER_NAME` to manually rotate all certificates; since AKS release 2021-07-15, intermediate certificates are automatically rotated during version upgrade; check cluster creation date with `kubectl get nodes` to determine CA expiry timeline (docs: https://docs.azure.cn/en-us/aks/certificate-rotation)

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: AKS 节点与 MCR 镜像仓库之间存在中间设备(proxy/firewall/第三方安全设备)进行

### aks-495: AKS 集群 Start 操作卡住，客户端收到 InternalServerError；节点 syslog/kubelet 日志显示 image pull 失败...

**Root Cause**: AKS 节点与 MCR 镜像仓库之间存在中间设备(proxy/firewall/第三方安全设备)进行 SSL packet inspection，篡改了 TLS 证书链导致证书验证失败

**Solution**:
让客户临时禁用 proxy/firewall/第三方设备的 SSL packet inspection 功能，然后重试 Start 操作

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FStart%20and%20Stop%2FInternalServerError%20when%20starting%20certificate%20signed%20by%20unknown%20authority)]`

## Phase 3: AKS does not support proactive/standby scenarios t

### aks-617: Customer requests proactive or standby support for AKS cluster upgrade, certific...

**Root Cause**: AKS does not support proactive/standby scenarios through Microsoft Support. This is by design per AKS support policy.

**Solution**:
Inform customer that proactive/standby support is not available for AKS. For eligible customers, direct them to Azure Event Management (AEM) paid service which must be set up in advance. Customer should raise a case of correct severity if they encounter an issue during operations. Reference: https://learn.microsoft.com/en-us/azure/aks/support-policies

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FCase%20Handling%20E2E%2FAdditional%20Case%20Handling%20Processes%2FBreak%20and%20Fix%20definition)]`

## Phase 4: The AME certificate has an incorrect path that doe

### aks-628: X509 certificate authentication error on SAW machine when using AME card - incor...

**Root Cause**: The AME certificate has an incorrect path that does not create the trust chain. The intermediate CA certificate (AME SC CA 01) is missing from the local certificate store.

**Solution**:
Download and install the certificate chain: open cert > Details > Authority Information Access > copy URL > download and install. Or run PowerShell (non-admin): curl "http://crl.microsoft.com/pkiinfra/Certs/BY2PKISCCA01.AME.GBL_AME SC CA 01(3).crt" -OutFile c:\windows	empy2SC.cer; Import-Certificate -CertStoreLocation cert:\CurrentUser\CA\ -FilePath c:\windows	empy2SC.cer

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Tools/Support/SAW%20and%20CorpVM/AME%20Account%20Access%20Overview/Common%20Issues/AME%20Error%20when%20using%20X509%20cert%20authentication%20on%20SAW)]`

## Phase 5: The verifier and/or certificateStore CRDs are not 

### aks-678: Image Integrity policy reports 'failed notation verification' for container imag...

**Root Cause**: The verifier and/or certificateStore CRDs are not configured correctly; the certificateStore does not contain the correct signing certificate (CA) for the image notation signature

**Solution**:
1) Verify the image is actually signed with notation. 2) Check verifier CRD configuration. 3) Ensure certificateStore has correct signing cert (CA) info and status shows success: kubectl get certificateStore -o yaml

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Image%20Integrity)]`

## Phase 6: Dapr mTLS self-signed CA certificate has expired. 

### aks-702: AKS Dapr sidecar fails to initialize with error: error creating CA: issuer chain...

**Root Cause**: Dapr mTLS self-signed CA certificate has expired. Default validity is only 1 year for Dapr self-signed certificates.

**Solution**:
Manually rotate CA certs per MS docs (Configure Dapr extension > Generate new self-signed cert). Note: rotation causes downtime. Recommend customers use their own certificates instead of Dapr self-signed certs.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Addons%20and%20Extensions/dapr%20sidecar%20initialization%20failure)]`

## Phase 7: Corrupted or expired certificate/private keys on t

### aks-875: Microsoft Defender publisher pods crash with 403 on a single specific node only....

**Root Cause**: Corrupted or expired certificate/private keys on the specific node under /var/microsoft/microsoft-defender-for-cloud/.

**Solution**:
SSH to the node, delete all files under /var/microsoft/microsoft-defender-for-cloud/, restart the defender pod. Agent will re-onboard with new certificate.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/Microsoft%20defender%20publisher%20pods%20crashing%20%28OOMKilled%29%20with%20403%20errors)]`

## Phase 8: VPA objects configured with updatePolicy.updateMod

### aks-1004: VPA addon enabled but recommendations not applied to pods. VPA admission control...

**Root Cause**: VPA objects configured with updatePolicy.updateMode set to 'Off'. In this mode VPA only produces recommendations but does not apply them. TLS handshake errors are benign - from konnectivity-agent pod IPs, normal connection resets, not blocking webhook functionality.

**Solution**:
Check VPA updateMode: 'kubectl get vpa -A -o yaml | grep -i updateMode'. If 'Off', change to 'Auto' (mutate running pods) or 'Initial' (apply at pod creation) via 'kubectl edit vpa <name>'. To reset: 'az aks disable-addons --addons vertical-pod-autoscaler' then re-enable.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FVPA%20Certificate%20issues%20AdmissionPod)]`

## Phase 9: FIPS nodes use OpenSSL 1.1.1. SSH keys generated w

### aks-868: SSH key generated on non-FIPS Ubuntu 18.04 (OpenSSL 1.0.x, before April 2021) fa...

**Root Cause**: FIPS nodes use OpenSSL 1.1.1. SSH keys generated with OpenSSL 1.0.x are incompatible with the SSH daemon on FIPS nodes.

**Solution**:
Generate SSH keys on a system with OpenSSL 1.1.1+ (Ubuntu 18.04 after April 2021 or newer OS). Keys generated with 1.1.1 work across both FIPS and non-FIPS nodes.

`[Score: [B] 7.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/FIPS%20nodes)]`

## Phase 10: Kubernetes cluster certificates (apiserver.crt) ex

### aks-1100: AKS node enters NotReady state due to expired certificates

**Root Cause**: Kubernetes cluster certificates (apiserver.crt) expired, preventing kubelet API server communication

**Solution**:
Check cert expiry via openssl x509 -enddate; apply certificate auto rotation (no downtime); or manually rotate (requires downtime). Note: node image/same-version upgrade does NOT renew expired certs - only full CP+nodepool upgrade does

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-expired-certificates)]`

## Phase 11: AKV secret provider extension version 1.5.5 has mo

### aks-1319: OpenSSL component (1.1.1) which part of akv secret provider extension, is no lon...

**Root Cause**: AKV secret provider extension version 1.5.5 has monitor pod (akvsecretsprovider-arc-monitoring-xxxxxxxxxx-xxxxx) which has Images with Open SSL component.

**Solution**:
Upgrade to next version of 1.5.6 where monitoring pod was removed in the version 1.5.6 az k8s-extension update --cluster-name  --resource-group  --cluster-type connectedClusters --name akvsecretsprovider --auto-upgrade false
 Use Azure Key Vault Secrets Provider extension to fetch secrets into Azure Arc-enabled Kubernetes clusters - Azure Arc | Microsoft Learn

`[Score: [B] 6.5 | Source: [ContentIdea#197585](https://support.microsoft.com/kb/5051211)]`

## Phase 12: Customer has a resource lock (Delete or ReadOnly) 

### aks-024: AKS certificate rotation (az aks rotate-certs) fails; cluster enters Failed stat...

**Root Cause**: Customer has a resource lock (Delete or ReadOnly) applied to the node resource group (MC_*). During cert rotation, AKS must delete and recreate agent nodes with the same names. The resource group lock prevents VM deletion, causing the reconciler to fail. Behavior: AKS deletes old node → creates new node with same name → propagates updated certs.

**Solution**:
1) Query ARM kusto (armmcadx / AKSprod AsyncContextActivity) for exact error. 2) Check for resource locks on the MC_* resource group: az lock list --resource-group <MC_rg>. 3) Remove or suspend locks before rotation: az lock delete --name <lock> --resource-group <MC_rg>. 4) Re-run az aks rotate-certs. 5) Re-apply locks after success. Check cert expiry: kubectl config view --raw -o jsonpath=... | base64 -d | openssl x509 -text | grep -A2 Validity.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.3]]`

## Phase 13: cert-manager Custom Resource Definitions (CRDs) we

### aks-175: cert-manager helm install fails with no matches for kind Certificate in version ...

**Root Cause**: cert-manager Custom Resource Definitions (CRDs) were not installed before the Helm chart. New cert-manager releases require CRDs to be applied separately first. Additionally, a ClusterIssuer resource must exist before Certificate resources can reference it.

**Solution**:
Install CRDs first: kubectl apply -f https://raw.githubusercontent.com/jetstack/cert-manager/release-0.6/deploy/manifests/00-crds.yaml. Then create ClusterIssuer resource with name letsencrypt-prod before deploying certificates.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 14: HTTP Application Routing is not supported in Moonc

### aks-200: HTTP Application Routing addon shows not applicable or cannot be enabled in AKS ...

**Root Cause**: HTTP Application Routing is not supported in Mooncake (Azure China). This is a known feature gap between global Azure and Mooncake.

**Solution**:
1) Do not use HTTP Application Routing in Mooncake. 2) Use nginx-ingress controller (helm install stable/nginx-ingress) as alternative. 3) For custom DNS, manually configure DNS records + ingress rules.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 15: Azure Linux stores certificates differently from U

### aks-1176: Certificate-related errors in containers running on Azure Linux (Mariner) nodes;...

**Root Cause**: Azure Linux stores certificates differently from Ubuntu: /etc/ssl/certs is a symlink to /etc/pki/tls/certs. Containers mapping only /etc/ssl/certs get a broken symlink since /etc/pki is not mapped.

**Solution**:
Map /etc/pki as a hostPath volume with DirectoryOrCreate type in addition to /etc/ssl/certs. This works for both Ubuntu and Azure Linux hosts.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-common-azure-linux-aks)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster certificates expired causing API server communication failure or clu... | AKS clusters created before May 2019 have CA certificates ex... | Run `az aks rotate-certs -g $RESOURCE_GROUP_NAME -n $CLUSTER... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS 集群 Start 操作卡住，客户端收到 InternalServerError；节点 syslog/kubelet 日志显示 image pull 失败... | AKS 节点与 MCR 镜像仓库之间存在中间设备(proxy/firewall/第三方安全设备)进行 SSL packe... | 让客户临时禁用 proxy/firewall/第三方设备的 SSL packet inspection 功能，然后重试 ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FStart%20and%20Stop%2FInternalServerError%20when%20starting%20certificate%20signed%20by%20unknown%20authority) |
| 3 | Customer requests proactive or standby support for AKS cluster upgrade, certific... | AKS does not support proactive/standby scenarios through Mic... | Inform customer that proactive/standby support is not availa... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FCase%20Handling%20E2E%2FAdditional%20Case%20Handling%20Processes%2FBreak%20and%20Fix%20definition) |
| 4 | X509 certificate authentication error on SAW machine when using AME card - incor... | The AME certificate has an incorrect path that does not crea... | Download and install the certificate chain: open cert > Deta... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Tools/Support/SAW%20and%20CorpVM/AME%20Account%20Access%20Overview/Common%20Issues/AME%20Error%20when%20using%20X509%20cert%20authentication%20on%20SAW) |
| 5 | Image Integrity policy reports 'failed notation verification' for container imag... | The verifier and/or certificateStore CRDs are not configured... | 1) Verify the image is actually signed with notation. 2) Che... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Image%20Integrity) |
| 6 | AKS Dapr sidecar fails to initialize with error: error creating CA: issuer chain... | Dapr mTLS self-signed CA certificate has expired. Default va... | Manually rotate CA certs per MS docs (Configure Dapr extensi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Addons%20and%20Extensions/dapr%20sidecar%20initialization%20failure) |
| 7 | Microsoft Defender publisher pods crash with 403 on a single specific node only.... | Corrupted or expired certificate/private keys on the specifi... | SSH to the node, delete all files under /var/microsoft/micro... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/Microsoft%20defender%20publisher%20pods%20crashing%20%28OOMKilled%29%20with%20403%20errors) |
| 8 | VPA addon enabled but recommendations not applied to pods. VPA admission control... | VPA objects configured with updatePolicy.updateMode set to '... | Check VPA updateMode: 'kubectl get vpa -A -o yaml \| grep -i... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FVPA%20Certificate%20issues%20AdmissionPod) |
| 9 | SSH key generated on non-FIPS Ubuntu 18.04 (OpenSSL 1.0.x, before April 2021) fa... | FIPS nodes use OpenSSL 1.1.1. SSH keys generated with OpenSS... | Generate SSH keys on a system with OpenSSL 1.1.1+ (Ubuntu 18... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/FIPS%20nodes) |
| 10 | AKS node enters NotReady state due to expired certificates | Kubernetes cluster certificates (apiserver.crt) expired, pre... | Check cert expiry via openssl x509 -enddate; apply certifica... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-expired-certificates) |
| 11 | OpenSSL component (1.1.1) which part of akv secret provider extension, is no lon... | AKV secret provider extension version 1.5.5 has monitor pod ... | Upgrade to next version of 1.5.6 where monitoring pod was re... | [B] 6.5 | [ContentIdea#197585](https://support.microsoft.com/kb/5051211) |
| 12 | AKS certificate rotation (az aks rotate-certs) fails; cluster enters Failed stat... | Customer has a resource lock (Delete or ReadOnly) applied to... | 1) Query ARM kusto (armmcadx / AKSprod AsyncContextActivity)... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.3] |
| 13 | cert-manager helm install fails with no matches for kind Certificate in version ... | cert-manager Custom Resource Definitions (CRDs) were not ins... | Install CRDs first: kubectl apply -f https://raw.githubuserc... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 14 | HTTP Application Routing addon shows not applicable or cannot be enabled in AKS ... | HTTP Application Routing is not supported in Mooncake (Azure... | 1) Do not use HTTP Application Routing in Mooncake. 2) Use n... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 15 | Certificate-related errors in containers running on Azure Linux (Mariner) nodes;... | Azure Linux stores certificates differently from Ubuntu: /et... | Map /etc/pki as a hostPath volume with DirectoryOrCreate typ... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-common-azure-linux-aks) |
