---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Workloads/Azure Portal for ALDO"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FWorkloads%2FAzure%20Portal%20for%20ALDO"
importDate: "2026-04-06"
type: troubleshooting-guide
---

### Overview

The Azure portal for Azure Local disconnected operations delivers a familiar user experience that mirrors Azure Public, enabling consistent management even in fully offline environments. This capability is part of the broader Azure Local offering, designed to support scenarios where connectivity to the public cloud is limited or unavailable.

### Key Capabilities

| **Feature** | **Description** |
| --- | --- |
| **Familiar UI** | Offers a local Azure portal interface that closely resembles the public Azure portal, reducing the learning curve for administrators. |
| **Local Control Plane** | Operates entirely within the disconnected environment, ensuring that all management actions remain within the organizational boundary. |
| **Azure Resource Manager (ARM)** | Supports ARM templates, resource groups, and CLI operations locally, enabling infrastructure-as-code practices without cloud dependency. |
| **Security and Compliance** | Ideal for sectors with strict data residency and compliance requirements, such as government, healthcare, and finance. |
| **Use Case Scenarios** | Supports operations in remote or isolated locations (e.g., oil rigs, manufacturing sites) and high-security environments. |

### Supported Services in Disconnected Mode

* **Azure Portal** - Localized version of the Azure portal
* **Azure Resource Manager (ARM)**
* **Azure CLI**
* **VM and container deployment**
* **Azure Arc-enabled services**

### Deployment Considerations

* Requires a local control plane setup with Azure Arc integration.
* Operates on validated hardware with support for Azure Stack HCI.
* Disconnected operations are currently in **preview** and subject to change.

### Additional Resources

* [Disconnected operations for Azure Local overview (preview)](https://learn.microsoft.com/en-us/azure/azure-local/manage/disconnected-operations-overview?view=azloc-2503)
