---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Tools and Processes/ICM Creation Alignment"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Nexus/Tools%20and%20Processes/ICM%20Creation%20Alignment"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**This Wiki is duplicated from [AzureForOperatorsIndustry Wiki](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_wiki/wikis/AzureForOperatorsIndustry.wiki/33712/ICM-Creation-Alignment) for Azure Stack Hub team as they do not have the access to original Wiki owned by SRE team.**

### Impacted Resources and Queue Mapping

| **Impacted Resources** | **Queue Name / Owning Team** | **Note** |
|--|--|--|
| NAKS, Cloud service network (CSN), Layer 3 network (L3 Network), Layer 2 network (L2 Network), Trunked Network, Virtual Machine, Agent pool / NAKS nodes, ARC VM, SDN, Vnet/Lnet, NIC, KubeOVN | **Owning service**: AFOI-Network Cloud / **Owning team**: Tenant K8s, VM and Networking team | "Failed to establish connection to kubernetes cluster" errors that mention the "connectedCluster" resource, need to be routed to the Undercloud Team |
| Layer 2 Isolation domain (L2 ISD), Layer 3 Isolation domain (L3 ISD), Route Policy, Network Packet broker (NPB), Failed to delete internal network, Device Upgrade Failures, Device related issues, Micro BFD feature flag Enable/Disable, Fabric commit failure, NF provision failure, Fabric device rotation failure, Partial reconcile on devices, Terminal Server related issues, Logs not flowing in Fabric Devices, TORs stuck in maintenance, Payload Replacement Issues, Rack Compact Maintenance Mode Errors, LLDP Neighbor Mapping Issues, High CPU utilization on Ethernet port, AggRack Mgmt switches issues, Network Fabric Controller | **Owning service**: Nexus Network Fabric / **Owning team**: Network Fabric Triage | |
| BMM provision / Unhealthy BMM, Cluster issues, BMC credential issues | **Owning service**: AFOI-Network Cloud / **Owning team**: Baremetal Provisioning and Lifecycle Team | |
| Cluster Manager issues, Keysets, Cred and Cert rotation, Run-read commands | **Owning service**: AFOI-Network Cloud / **Owning team**: Cluster Manager and Lifecycle Services Team | |
| Storage appliance failures, Persistent Volumes (PV) issues | **Owning service**: AFOI-Network Cloud / **Owning team**: Remote Storage Team | |
| Monitoring, Logs not flowing, iDRAC and Filespace metric issues | **Owning service**: AFOI-Network Cloud / **Owning team**: Observability Infrastructure | |
| CVE (Common Vulnerabilities and Exposures), Security issues | **Owning service**: AFOI-Network Cloud / **Owning team**: Security Engineering, Governance & Compliance | |
| Feature flag: AllowRoleAssignmentsForClusterMRG, ACL for Cluster Manager, Tagging issues for Cluster Manager | **Owning service**: AFOI-Network Cloud / **Owning team**: Production Engineering Systems | |
