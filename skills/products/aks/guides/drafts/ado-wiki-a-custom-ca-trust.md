---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Preview Features/Custom CA Trust"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FPreview%20Features%2FCustom%20CA%20Trust"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Custom CA Trust

## Overview

Custom certificate authorities (CAs) allow you to establish trust between your AKS cluster and your workloads, such as private registries, proxies, and firewalls. A Kubernetes secret stores the CA information, then it's passed to all nodes in the cluster.

This feature is applied per nodepool, so new and existing nodepools must be configured to enable this feature.

## Troubleshooting

If CAs are not being installed correctly on node, check the following:

### Is Custom CA Trust Enabled?

Custom CA Trust is a node-pool level property, enabled by setting `enableCustomCATrust` to True in `agentPoolProfiles`.

### Is Custom CA Trust daemonset deployed and is its pod running?

Custom CA Trust utilizes a Kubernetes daemonset to deploy a pod which copies cert files to the agent pool node.

- Check daemonset: `kubectl get ds custom-ca-trust -n kube-system`
- Check pod: `kubectl get pod custom-ca-trust -n kube-system`

### Is cluster using a correct image version?

Custom CA Trust works on VHDs with version 2022.05.04 or newer.

Check: `az aks show -g resourceGroupName -n clusterName | jq .agentPoolProfiles[0].nodeImageVersion`

### Is NEW Custom CA Trust deployed on a cluster?

Starting with 2022.10.31 image version, Custom CA Trust received a major overhaul. Requires at least 2022-09-02-preview API version.

In the updated version:
- User no longer needs to create the secret themselves
- Base64 encoded certificates are sent during PUT MC request as part of `securityProfile.customCATrustCertificates`
- A secret containing passed CAs will be created and managed by AKS
- CLI users pass path to file with up to 10 certificates (not base64 encoded)

Users can still use the old approach (self-created secret), but new version is recommended as it covers more edge cases (e.g. CAs are added to trust stores during node boot).

### If user is using old version, is Custom CA Trust secret deployed?

CA data is passed from a secret named `custom-ca-trust-secret` in kube-system namespace. **This secret must be created by user.**

Check: `kubectl get secret -n kube-system custom-ca-trust-secret`

### Are certificates base64 encoded in secret?

Data passed in `custom-ca-trust-secret` must be base64 encoded.

### Are Custom CA Trust systemd units visible and operational?

Custom CA Trust requires 3 systemd units:
- `update_certs.path`
- `update_certs.timer`
- `update_certs.service`

Check: `systemctl status update_certs.path/timer/service`

### Is update_certs.service reporting any errors

The service is a one-shot type triggered periodically by timer and by path when new files are detected in `/usr/local/share/ca-certificates/certs`.

Check: `systemctl -l status update_certs.service`

### Other issues

#### User spots labels on their nodes

This is expected. AKS adds `custom-ca-trust-enabled` and `custom-ca-trust-certificates` labels. They are used by daemonset label selector and AKS to determine node rolling.

## Useful links

- PG Design Doc: <https://dev.azure.com/msazure/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/227712/trustedCA>
- Source PG TSG: <https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-kubernetes-service/azure-kubernetes-service/doc/tsg/tsg-custom-ca-trust>
