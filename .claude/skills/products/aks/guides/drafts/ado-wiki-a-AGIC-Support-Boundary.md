---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Addons and Extensions/AGIC"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FAGIC"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Gateway Ingress Controller

[[_TOC_]]

## Overview

The Application Gateway Ingress Controller (AGIC) is a Kubernetes application, which makes it possible for AKS  customers to leverage Azure's native Application Gateway L7 load-balancer to expose cloud software to the Internet. AGIC monitors the Kubernetes cluster it is hosted on and continuously updates an App Gateway, so that selected services are exposed to the Internet.

## AppGw AGIC GitHub versus Addon

- GitHub: When AppGw Ingress Controller was first released, customers were only able to deploy with the AGIC GitHub method.  In this deployment type, the Ingress Controller runs in its own pod on the customer�s AKS.
- AddOn: AppGw Ingress Controller (as of 2020-06-10) can be deployed using the AddOn.  In this deployment type, AGIC runs within the AKS cluster and updates are managed by the service.

## AGIC Support

Support cases can come in under either the AKS service, or the AppGW service. The following is from the AppGW wiki for AGIC. **The Azure Networking POD is the primary support team for Azure AppGw Ingress controller for AKS as of 2019-11-04**

### Case Opened With AKS Support Topics

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

### Case Opened With Azure Application Gateway Support Topics

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

## References

- Networking Wiki on AGIC: <https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/218967/Azure-AppGw-Ingress-Controller-for-AKS>

## Owner and Contributors

**Owner:** Jordan Harder <joharder@microsoft.com>
**Contributors:**

- Naomi Priola <Naomi.Priola@microsoft.com>
- Jordan Harder <joharder@microsoft.com>
- Karina Jacamo <Karina.Jacamo@microsoft.com>
- Jeff Martin <jemartin@microsoft.com>
