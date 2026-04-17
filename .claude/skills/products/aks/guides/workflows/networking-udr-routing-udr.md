# AKS UDR 与路由 — udr — 排查工作流

**来源草稿**: ado-wiki-a-imds-restriction.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: IMDS Restriction
> 来源: ado-wiki-a-imds-restriction.md | 适用: 适用范围未明确

### 排查步骤

#### IMDS Restriction

#### Overview

The Azure Instance Metadata Service (IMDS) is a REST API available at 169.254.169.254. AKS provides a managed solution that restricts IMDS endpoint access for customer pods. Only Pods with host network can access IMDS.

#### Validations or Limitations

- Minimal supported API version: v20240402preview
- Does not support clusters having Windows nodepool and VMS nodepool at preview stage
- Incompatible with several addons requiring IMDS access (mostly for retrieving managed identity token from node IMDS)

#### Background

1. Toggling between enabling/disabling IMDS restriction is implemented in AgentBaker's provision script using iptables
2. Updating IMDS restriction needs reimage the node to take effect:
   1. Customer sends update request
   2. AKS RP updates VMSS model but won't reimage
   3. Customer must send another request to reimage: `az aks nodepool upgrade --node-image-only`
   4. Only after reimage does toggling take effect

#### Code Path and Log Collection

##### Frontend

Check user's IMDS restriction by viewing sanitized request body. Versioned property: `networkProfile.PodLinkLocalAccess` - "None" = ENABLED, "IMDS" = DISABLED.

Unversioned property: `managedCluster.Properties.SecurityProfile.PodLinkLocalAccess`: 1 = disabled, 2 = enabled.

```kql
FrontEndContextActivity
| where operationID == '<opId>'
| where msg contains 'sanitized'
```

##### Async

Provision script log at: `/var/log/azure/cluster-provision.log`

Verify iptables rule:
```sh
iptables -t filter -S
#### or check mangle table:
iptables -t mangle -S
```

Note: IMDS restriction rule is inserted to different table (filter or mangle) based on different CNI.

---
