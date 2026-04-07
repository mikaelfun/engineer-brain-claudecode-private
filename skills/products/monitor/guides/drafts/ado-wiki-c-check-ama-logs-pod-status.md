---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/How-To/HT Check ama-logs Pod Status"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/How-To/HT%20Check%20ama-logs%20Pod%20Status"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

Check Pod Status
================

[[_TOC_]]

Scenario
--------
Guidance to review and understand the Pod status in an AKS

Information you will need
-------------------------
The resource Id of the affected AKS cluster

Overview & Concepts
-------------------
For a deeper understanding of the Container Insights architecture, refer to the following resource: [Container Insights Architecture For Managed Identity Configuration - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1371324/Container-Insights-Architecture-For-Managed-Identity-Configuration)

Check Pod Status
----------------
We can follow the steps below to check the status of the pods and identify any general errors that might be affecting data ingestion and/or pod health.

>**Note:** General kubectl commands: [Kubectl Commands for Container Insights - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/923091/Kubectl-Commands-for-Container-Insights)

### Check if ama-logs PODS are running
`kubectl get pods -n kube-system -o wide | grep ama-logs`

![Screenshot 2025-09-03 103717.png](/.attachments/Screenshot%202025-09-03%20103717-826250f1-a037-4bc6-a259-fbad1d34774b.png)

### Get details from the pods with the `kubectl describe pod` command

From kubectl command: 
`kubectl describe pod PODNAME -n kube-system`

![image.png](/.attachments/image-c1641be9-0951-44ea-becd-2b8bd00b5e79.png)

From ASC: Go to Microsoft.ContainerService, then ManagedClusters and locate the AKS Cluster. 

![Screenshot 2025-09-03 103806.png](/.attachments/Screenshot%202025-09-03%20103806-6e4f6496-7763-467a-9699-64768bbf4353.png)

Then on the Geneva Actions tab, choose the pods as resource type and write the "kube-system" namespace. It will load the describe response from the pods.

![Screenshot 2025-09-03 103839.png](/.attachments/Screenshot%202025-09-03%20103839-27a8bc17-c9c1-40bd-9c76-22a6abe55175.png)

What to Check After Running `kubectl describe`
----------------------------------------------
*   General Information
![Screenshot 2025-09-03 103922.png](/.attachments/Screenshot%202025-09-03%20103922-dbbf266f-388b-4b7a-b967-e9bfa8c7769c.png)
*   Container details
![Screenshot 2025-09-03 103939.png](/.attachments/Screenshot%202025-09-03%20103939-74177a30-e87c-46e4-b2f2-d3ffe3cee3e4.png)
*   POD status
![Screenshot 2025-09-03 103954.png](/.attachments/Screenshot%202025-09-03%20103954-0ae2f146-633d-4b7d-a3a7-4a66c18235ff.png)
*   Recent Events
![Screenshot 2025-09-03 104007.png](/.attachments/Screenshot%202025-09-03%20104007-21e0ad43-8bb5-47c9-9c9b-b174874ce6af.png)

Resources
---------------------------------------------------
[kubectl describe | Kubernetes](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_describe/)
[kubectl describe | Spacelift Blog](https://spacelift.io/blog/kubectl-describe#what-is-the-kubectl-describe-command)