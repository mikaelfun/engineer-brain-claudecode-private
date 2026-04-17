---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Trident Storage - Net App"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Trident%20Storage%20-%20Net%20App"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# NetApp Trident

[[_TOC_]]

## Summary

Trident is a fully supported open-source project maintained by NetApp. It has been designed from the ground up to help you meet your containerized applications persistence demands using industry-standard interfaces, such as the Container Storage Interface (CSI).

Trident deploys in Kubernetes clusters as pods and provides dynamic storage orchestration services for your Kubernetes workloads. It enables your containerized applications to quickly and easily consume persistent storage from NetApps broad portfolio that includes ONTAP (AFF/FAS/Select/Cloud/Amazon FSx for NetApp ONTAP),Element Software (NetApp HCI/SolidFire), as well as theAzure NetApp Filesservice,Cloud Volumes Service on Google Cloud, and theCloud Volumes Service on AWS.

Trident is also a foundational technology for NetAppsAstra, which addresses your data protection, disaster recovery, portability, and migration use cases for Kubernetes workloads leveraging NetApps industry-leading data management technology for snapshots, backups, replication, and cloning.

Take a look at the Astra documentation to get started today. SeeNetApps Support site for details on Tridents support policy under the Tridents Release and Support Lifecycletab.

## Support Boundry

- Verify Cluster Health
- Gather failure/error info
- Get Pod/PV/PVC/SC info and/or logs (See TSG)
- Escalate

### Escalation Paths

Collab can be sent to `Azure Bare Metal team` to run basic Net App health checks. Use the SAP path, ```Azure\Azure NetApp Files```, and choose the L2/L3 topic underneath that best fits the customer issue.

ICM to NetApp:  
[AzureNetAppFiles:NFS Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=sA144x)

## Verified Learning Resources

| Resource | Description |
| ---------- | ------------- |
| [Trident Home](https://netapp.io/persistent-storage-provisioner-for-kubernetes/) | Trident Home Page |
| [Trident Documentation](https://netapp-trident.readthedocs.io/en/stable-v21.07/index.html) | Full Trident Documentation |
| [Trident and Azure NetApp Files (ANF)](https://netapp-trident.readthedocs.io/en/stable-v21.07/kubernetes/operations/tasks/backends/anf.html) | Azure NetApp Files Documentation |
| [What is Trident](https://netapp-trident.readthedocs.io/en/stable-v21.07/introduction.html) | What is Trident? |
| [Troubleshooting](https://netapp-trident.readthedocs.io/en/stable-v21.07/kubernetes/troubleshooting.html) | Trident Troubleshooting Documentation |

## Basic TSG

- Customer Problem
  - Provide detailed description of the bug (include when and how the bug occurred)
    - Explain expected behavior vs actual result observed
    - Did problem occur after new deployment or installation of Trident?  If install issue refer to Install/Deploy section
    - What was the exact command used which generated the error? (ie. install or upgrade trident, update a PV, etc..)?
    - When was the last time this command or process completed successfully?
- Provide steps to reproduce the issue
- Can the customer reproduce the issue [Yes/No/Don't Know/ NA]
  - If so how consistent / intermittent?
  - What happens when a retry of the job is attempted? Same or different result?
- Provide console errors, snippets or screenshots (if applicable)
- Any recent changes in the Trident and Kubernetes environment?
  - IP network: addresses, nds, ports, etcc
  - Credential, passwords, ect.
- Provide build & environment details below
  - Trident / Kubernetes
    - ```kubectl get nodes -o wide - (versions for k8s, orchestrators, linux OS, ip's, etc. on all nodes)```
    - ```kubectl get pods -o wide -n trident - (all trident pods and node where they reside)```
    - ```kubectl get all -n trident - (pods, servicedeployments, daemonset, replicaset)```
    - ```tridentctl -n trident version - (trident version currently running on the servers)```
    - ```tridentctl get backend -n trident - (health of trident backendS)```
  - Azure NetApp Files storage -
    - Volume Resource ID, Name, other relevant data?
    - ANF logs, Screenshots?
  - Create a trident support bundle and send it to the case
    - ```tridentctl logs -a -n trident <--- creates a zip file in the local directory```
- Install/Deploy
  - What install method is being used (orchestrator, tridentctl, helm)
  - Are all Trident pods Running? If not collect the pod describe for the unhealthy pod
    - ```kubectl describe pod trident-********-**** -n trident```
  - ```kubectl describe torc trident```
- Upgrade
  - What install method was used (orchestrator, tridentctl, helm)
    - Note: Upgrade must use same method as used for install
  - ```kubectl describe torc trident```
- PVC Create Error
  - PVC / PV:
    - ```kubectl get pvc <pvc-name> -n <namesspace>```
    - ```kubectl describe pvc <pvc-name> -n <namesspace>```
    - ```kubectl get pv <pv-name>```
    - ```kubectl describe pv <pv-name>```
  - What is the Storage Class?
    - ```kubectl get sc```
- PVC Mount/User Pod Creation Issue
  - ```kubectl get pod -n <name-space>```
  - ```kubectl describe pod <pod-name> -n <name-space>```
  - ```kubectl get pv <pv-name>```
  - Can you manually mount the pv from a worker node
    - ```mount -f nfs <ANF_IP/hostname>:/<trident_pvc_name> /data```
- Trident Pod Issue
  - Are all Trident pods Running?
  - if not collect the pod describe for the unhealthy pod
    - ```kubectl describe pod trident-********-**** -n trident```
  - ```kubectl describe torc trident```

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>

**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>
- Chase Overmire <chover@microsoft.com>
- Ben Parker <bparke@microsoft.com>

