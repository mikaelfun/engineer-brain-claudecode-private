---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/Azure Local Agents, Extensions and services/Core Clustered Services in Azure Local"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Infrastructure/Azure%20Local%20Agents,%20Extensions%20and%20services/Core%20Clustered%20Services%20in%20Azure%20Local"
importDate: "2026-04-06"
type: troubleshooting-guide
---

 Overview:

The**Core Clustered Services in Azure Local**are a set of high-availability, cluster-aware roles that underpin the infrastructure management, update orchestration, health monitoring, and hybrid connectivity of Azure Local (formerly Azure Stack HCI). These servicessuch as the Cloud Management, Download, Health, Orchestrator, and Update Servicesare deployed as generic clustered roles and operate within Failover Cluster Manager to ensure resilience and continuity. They enable critical functions like local caching of Azure content, lifecycle orchestration for Azure Arc-connected resources, and controlled update workflows, all while supporting disconnected or semi-connected environments. Together, they form the operational backbone of Azure Local, enabling cloud-like capabilities in edge and sovereign deployments.


When you run the below command from any of the Azure Local nodes, you will get the clustered services in Azure Local:
```powershell
 get-clusterresource | Where-Object {$_.ResourceType -like "Generic Service"}
```
![image.png](/.attachments/image-a24b31e4-84b5-4de1-aa4a-08c84b8f5e6b.png)

These services are deployed as**cluster-aware roles**and are essential for managing infrastructure, updates, orchestration, and hybrid connectivity in Azure Local (formerly Azure Stack HCI).

| **Service Name** | **Cluster Group** | **Purpose** |
| --- | --- | --- |
| [**Azure Stack HCI Cloud Management**](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2161503/Core-Clustered-Services-in-Azure-Local?anchor=%F0%9F%A7%A9-azure-stack-hci-cloud-management-(azure-local)) | Cloud Management | Manages cloud registration, telemetry, and hybrid service integration. |
| [**Azure Stack HCI Download Service**](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2161503/Core-Clustered-Services-in-Azure-Local?anchor=%E2%AC%87%EF%B8%8F-azure-stack-hci-download-service-(azure-local)) | Download Service Cluster Group | Handles downloading of updates and metadata from Azure or internal repos. |
| [**Azure Stack HCI Health Service**](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2161503/Core-Clustered-Services-in-Azure-Local?anchor=%E2%9D%A4%EF%B8%8F-azure-stack-hci-health-service-(azure-local)) | Health Service Cluster Group | Monitors cluster health and emits telemetry for diagnostics. |
| [**Azure Stack HCI Orchestrator Service**](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2161503/Core-Clustered-Services-in-Azure-Local?anchor=%F0%9F%A7%AC-azure-stack-hci-orchestrator-service-(azure-local)) | Orchestrator Service Cluster Group | Coordinates lifecycle operations like provisioning, scaling, and updates. |
| [**Azure Stack HCI Update Service**](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2161503/Core-Clustered-Services-in-Azure-Local?anchor=%F0%9F%94%84-azure-stack-hci-update-service-(azure-local)) | Update Service Cluster Group | Manages update workflows using Cluster-Aware Updating (CAU). |
| [**MOC Cloud Agent Service**](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2161503/Core-Clustered-Services-in-Azure-Local?anchor=%E2%98%81%EF%B8%8F-moc-cloud-agent-service-(azure-local)) | CA-* Cluster Group | Central orchestrator for Microsoft On-premises Cloud (MOC); manages VM lifecycle and infrastructure coordination. |

* * *


 Cluster Service Operations
-----------------------------

*   These services are deployed as**generic clustered roles**and are visible in**Failover Cluster Manager**.
*   They are designed for**high availability**and will failover between nodes if needed.
*   If any of these services go offline, it can impact update orchestration, health reporting, or hybrid connectivity.

* * *


#  Azure Stack HCI Cloud Management (Azure Local)

##  Overview

**Azure Stack HCI Cloud Management** is a **clustered Windows service** that enables cloud-like orchestration and integration features for Azure Stack HCI systems  even in **disconnected or semi-connected environments** like **Azure Local (formerly MOC)**.

It is part of the hybrid cloud architecture, coordinating Azure Arc, policy management, monitoring, and update services from **on-premises**, via the **Azure Resource Bridge**.

---

##  Key Characteristics

| Property           | Description                                         |
|--------------------|-----------------------------------------------------|
| **Type**           | Clustered Role (High Availability)                 |
| **Runs On**        | One active node in the HCI cluster at a time       |
| **Purpose**        | Coordinates Azure-connected services locally        |
| **Azure Dependency** | Works with or without internet (via Resource Bridge) |
| **Visibility**     | Shown in Failover Cluster Manager and via PowerShell |

---

##  Functionality

-  Registers HCI cluster with Azure Arc
-  Syncs configuration and health data to Azure (when online)
-  Coordinates background services:
  - Azure Monitor agent
  - Azure Policy compliance
  - Microsoft Defender for Cloud (if enabled)
  - Update Management assessments
-  Manages heartbeat to Azure (via the resource bridge)

---



---

##  Location in Failover Cluster

```powershell
Get-ClusterGroup | Where-Object { $_.Name -like "*Cloud Management*" }
```

---

#  Azure Stack HCI Download Service (Azure Local)

##  Overview

The **Azure Stack HCI Download Service** is a **clustered Windows service** used in **Azure Local (disconnected)** environments to **cache and distribute Azure content** locally. This includes content such as updates, agents, extensions, and templates used by the Azure Stack HCI infrastructure.

It ensures that services like Azure Kubernetes Service (AKS), Azure Monitor agents, and platform updates are **retrieved from a local download source** instead of directly accessing the internet  ideal for air-gapped or semi-connected environments.

---

##  Key Characteristics

| Property            | Description                                         |
|---------------------|-----------------------------------------------------|
| **Type**            | Clustered Role (High Availability)                 |
| **Runs On**         | One active node in the HCI cluster at a time       |
| **Purpose**         | Local download proxy for Azure content             |
| **Azure Dependency**| Not required; works fully offline                  |
| **Management**      | PowerShell / Failover Cluster Manager              |

---

##  Functionality

-  Caches downloadable content for:
  - Azure Kubernetes Service (AKS) engine deployments **AKS-HCI base images**
  - Azure Monitor agents and updates
  - Azure Arc agent extensions
  - Policy and guest configuration packages
-  Provides content locally for use across the cluster
-  Eliminates dependency on direct internet access



---

##  Location in Failover Cluster

In **Failover Cluster Manager**:
- Navigate to `Roles` > Look for a service named **Azure Stack HCI Download Service**

Or use PowerShell:
```powershell
Get-ClusterGroup | Where-Object { $_.Name -like "*Download*" }
```

---

#  Azure Stack HCI Health Service (Azure Local)

##  Overview

The **Azure Stack HCI Health Service** is a **clustered service** in Azure Stack HCI (including Azure Local deployments) that continuously monitors the health and performance of the cluster infrastructure. It provides **real-time diagnostics**, **alerts**, and **recommendations** to improve system stability and reliability.

This service acts as the **local engine for health monitoring**, even when disconnected from Azure, enabling **administrators to identify and resolve issues proactively**.

---

##  Key Characteristics

| Property            | Description                                           |
|---------------------|-------------------------------------------------------|
| **Type**            | Clustered Role (High Availability)                   |
| **Runs On**         | One active node in the HCI cluster at a time         |
| **Purpose**         | Local monitoring, diagnostics, and health telemetry  |
| **Azure Dependency**| Optional  fully functional in disconnected mode     |
| **Management**      | PowerShell, Cluster Manager, or Windows Admin Center |

---

##  Functionality

-  Evaluates health across:
  - Hardware (disks, NICs, nodes)
  - Cluster storage and networking
  - HCI infrastructure services
-  Produces health summaries and alerts
-  Reports issues with severity levels (Critical, Warning, Informational)
-  Triggers notifications in WAC or Azure Portal (if connected)
-  Feeds into Arc-enabled monitoring when connected to Azure

---

##  Log Access and Diagnostics


### Read Events from the Log
```powershell
Get-WinEvent -LogName "Microsoft-Windows-Health-Hci/Operational" -MaxEvents 50
```

---

##  Health Evaluation Commands

```powershell

```

---

##  Location in Failover Cluster
```powershell
Get-ClusterGroup | Where-Object { $_.Name -like "*Health*" }
```

---

#  Azure Stack HCI Orchestrator Service (Azure Local)

##  Overview

The **Azure Stack HCI Orchestrator Service** is a **clustered role** within Azure Stack HCI, responsible for **coordinating complex workflows** and **automated actions** across the cluster. In **Azure Local** (disconnected) environments, this service ensures that Azure-integrated features like **extension deployment**, **agent orchestration**, and **custom location operations** are carried out in a controlled and reliable manner.

It plays a critical role in managing lifecycle events for Azure-connected resources using **Azure Arc** and the **Azure Resource Bridge**.

---

##  Key Characteristics

| Property            | Description                                            |
|---------------------|--------------------------------------------------------|
| **Type**            | Clustered Role (High Availability)                    |
| **Runs On**         | One active node in the cluster at a time              |
| **Purpose**         | Orchestration of workflows, extensions, and policies  |
| **Azure Dependency**| Works with Resource Bridge; supports disconnected mode |
| **Management**      | PowerShell / Cluster Manager                          |

---

##  Functionality

-  Coordinates the execution of background tasks and workflows
-  Supports lifecycle operations for Azure Arc-connected services
-  Handles deployment of Arc extensions and policy packages
-  Tracks the state of operations initiated via Azure or local API calls
-  Manages orchestration across services like:
  - Cloud Management
  - Health Service
  - Download Service



 Location in Failover Cluster
-------------------------------

```powershell
Get-ClusterGroup | Where-Object { $_.Name -like "*Orchestrator*" }
```
---

#  Azure Stack HCI Update Service (Azure Local)

##  Overview

The **Azure Stack HCI Update Service** is a **clustered service** that manages update orchestration for Azure Stack HCI clusters, especially in **Azure Local (disconnected or semi-connected) environments**. It coordinates **download, staging, and installation** of updates for the OS, drivers, and Azure-integrated components.

This service ensures that updates are applied in a controlled, reliable, and highly available manner to minimize downtime and maintain cluster health.

---

##  Key Characteristics

| Property            | Description                                           |
|---------------------|-------------------------------------------------------|
| **Type**            | Clustered Role (High Availability)                   |
| **Runs On**         | One active node in the cluster at a time             |
| **Purpose**         | Manage update downloads and orchestrate cluster patching |
| **Azure Dependency**| Works offline with local content cache, syncs when connected |
| **Management**      | PowerShell, Failover Cluster Manager, Windows Admin Center |

---

##  Functionality

-  Downloads and caches updates locally (via Download Service)
-  Coordinates cluster-wide update installation and node reboots.The service**integrates with Cluster-Aware Updating (CAU)**and**respects node drain policies**to ensure workload continuity
-  Integrates with Windows Update, driver updates, and Azure extensions
-  Supports rolling updates to maintain cluster availability
-  Reports update compliance and status in monitoring tools

---

 Location in Failover Cluster
-------------------------------


```powershell
Get-ClusterGroup | Where-Object { $_.Name -like "*Update*" }
```
---
#  MOC Cloud Agent Service (Azure Local)

##  Overview

The **MOC Cloud Agent Service** is a **clustered on-premises service** deployed in Azure Local (formerly Microsoft On-premises Cloud, MOC) environments. It acts as a local agent facilitating communication, telemetry, and coordination between the on-premises Azure Stack HCI cluster and Azure services via the **Azure Resource Bridge**.

This service supports hybrid cloud scenarios by managing resource state synchronization, command orchestration, and health telemetry reporting between the cluster and Azure.

---

##  Key Characteristics

| Property            | Description                                       |
|---------------------|---------------------------------------------------|
| **Type**            | Clustered Role (Highly Available)                |
| **Runs On**         | One active node in the cluster at a time          |
| **Purpose**         | Hybrid cloud agent for state sync and telemetry  |
| **Azure Dependency**| Works offline with periodic sync via Resource Bridge |
| **Management**      | PowerShell, Failover Cluster Manager              |

---

##  Functionality

-  Syncs cluster resource state with Azure Arc and Resource Bridge
-  Sends telemetry and health data to Azure
-  Receives and executes commands issued from Azure
-  Supports hybrid management scenarios in disconnected or semi-connected environments
-  Integrates with other Azure Local services like Orchestrator and Cloud Management

---

 Location in Failover Cluster
-------------------------------

```powershell
Get-ClusterGroup | Where-Object { $_.Name -like "*CloudAgent*" }
```


