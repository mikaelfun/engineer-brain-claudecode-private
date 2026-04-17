---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Azure Copilot AKS Handlers"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Azure%20Copilot%20AKS%20Handlers"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Copilot AKS Handlers

[[_TOC_]]

## Overview

The Azure Portal now has copilot integrated into it. Support for copilot in the Azure portal is mainly owned by the VM team, however there are multiple handlers specific to AKS.

## Basic Troubleshooting
<!-- markdownlint-disable MD033-->
:::mermaid

graph TD

 Start[Start] -->ConfirmIssue(<b>Verify the issue is Copilot</b> <br><br> Can the task be performed in the Portal or CLI manually without issue?)

 ConfirmIssue --> |NO| ServiceIssue(The issue appears to be with the underlying service and not with Copilot itself. <br><br> - Troubleshoot/fix the issue so the customer can perform the task in Portal or CLI successfully.)

 ConfirmIssue --> |YES| CopilotIssue(Is the action working correctly, but the customer doesn't like the response? <br> - For example, a YAML file is created but does not do what they want. )

 CopilotIssue --> |YES| Feedback(Have the customer submit feedback through the copilot interface)

CopilotIssue --> |No| DataCollection(<b>Data Collection</b><br><br> Gather the requested data in the <b>Data Gathering</b> section at the bottom of this wiki page. )

 DataCollection --> Escalate(Escalate the issue with the ICM template at the bottom of this wiki..)
:::
<!-- markdownlint-enable MD033-->
## AKS Handlers

### Create an AKS cluster

This skill guides users through the process of creating an Azure Kubernetes Service (AKS) cluster with an NGINX Ingress Controller. It also secures a custom domain using a Let s Encrypt certificate. Whether users prefer one-click or a learn mode deployment, this skill streamlines the entire infrastructure setup for them.
<!-- markdownlint-disable MD036 -->
**Specific Handler IDs**

* createaksdeploymentterminal

**Sample Questions**

* "Guide me through creating an AKS cluster",
* "How do I make a scalable AKS cluster?",
* "How can I deploy an AKS cluster on Azure?",
* "What are the steps to deploy an AKS cluster on Azure?",
* "I'm new to AKS. Can you help me deploy a cluster?",
* "I need a detailed guide on deploying an AKS cluster on Azure. Can you provide that?",
* "Step by step guide to deploying an aks cluster on azure",
* "Seamless deployment for aks cluster on azure",
* "Learn mode deployment for aks cluster deployment on azure",
* "One click deployment for aks cluster deployment on azure",
* "How can i deploy a aks cluster infrastructure within a specific subscription? Is there a guide to doing this?"

---

### Nodepool Start/Stop

Customers will be able to start and stop AKS node pools from the Copilot blade. This is a common action that will help customer perform this on many clusters without navigating to each one individually. Customers will be able to easily find and act on clusters for things like scaling, load balancing, resource optimization, and more.

**Specific Handler IDs**

1. aks_start_stop_node_pool

**Sample Questions**

* "Stop a node pool.",
* "Start a node pool.",
* "I want to halt a node pool.",
* "Stop the node pool in my cluster.",
* "Start the node pool in my cluster.",
* "Can you start a node pool?",
* "Can you stop a node pool",
* "I want to take action on a node pool."

---

### Monitoring Navigational Handler

This skill streamlines the process of installing Azure Monitor onto users  clusters. Additionally, it provides visibility of cluster, node, and container level insight if already configured. In both scenarios, users are guided to the Insights blade within the AKS management experience. There, they can seamlessly confirm installation or view data from the portal blade.

**Specific Handler IDs**

1. "aks_configure_monitoring_navigationterminal

**Sample Questions**

* "Configure monitoring on my aks cluster",
* "Navigate to the monitoring page",
* "Navigate to the monitoring page for my aks cluster",
* "I want to configure monitoring",
* "I want to configure monitoring for my aks cluster",
* "I want to navigate to the monitoring page",
* "I want to navigate to the monitoring page of my aks cluster",
* "Can you configure monitoring?",
* "Can you configure monitoring for my aks cluster?",
* "Can you navigate to the monitoring page?",
* "Can you navigate to the monitoring page of my aks cluster?",
* "Navigate to the monitoring page for a different aks cluster"

---

### Istio Navigational Handler

This skill streamlines the process of installing the Istio to users  clusters. Additionally, it provides the ability to view and create traffic management rules if already configured. In both scenarios, users are guided to the Service Mesh - Istio blade within the AKS management experience. There, they can seamlessly confirm installation or view data from the portal blade.

**Specific Handler IDs**

1. aks_enable_istio_navigationterminal

**Sample Questions**

* "Enable istio",
* "Enable istio on my aks cluster",
* "Navigate to the Istio page",
* "Navigate to the Istio page for my aks cluster",
* "I want to enable Istio",
* "I want to enable Istio on my aks cluster",
* "I want to navigate to the Istio page",
* "I want to navigate to the Istio page of my aks cluster",
* "Can you enable Istio?",
* "Can you enable Istio on my aks cluster?",
* "Can you navigate to the Istio page?",
* "Can you navigate to the Istio page for my aks cluster?"

---

### Update AKS Pricing Tier

This skill will allow users to make AKS pricing tier updates. It helps in upgrading selected AKS clusters to Standard or Premium options, as well as downgrading to Standard or Free tiers. It also offers a comprehensive list of pricing tiers, enabling users to make informed decisions before updating their AKS clusters.

**Specific Handler IDs**

1. Update_AKS_Pricing_Tier
2. Update_AKS_pricing_Tier_Headless

**Sample Questions**

*  Update my AKS cluster pricing tier 
*  Upgrade AKS cluster pricing tier to Standard 
*  Downgrade AKS cluster pricing tier to Free 
*  AKS cluster pricing tier update 
*  AKS cluster pricing tier upgrade 

---

### Cluster IP Authorization

This skill identifies the user s client IP address and facilitates the addition of authorized IP ranges to their cluster. If the user wishes to include an alternate IP range, they will be presented with the option to navigate to the Networking blade within the AKS experience. There, they can conveniently edit the relevant field.

**Specific Handler IDs**

1. update_authorized_ip_ranges
2. update_authorized_ip_ranges_view_specifi

**Sample Questions**

*  Allow my IP to access my AKS cluster 
*  Add my IP address to the allow list of my AKS cluster s network policies 
*  Add my IP address to the authorized IP ranges of AKS cluster s networking configuration 
*  Add IP CIDR to my AKS cluster s authorized IP ranges 
*  Update my AKS cluster s authorized IP ranges 

---

### KubeCTL Command Execution/Generation

This skill executes kubectl commands whenever the user is on any blade related to Azure Kubernetes Service (AKS). It prompts Copilot to either run or construct commands relevant to cluster information like  namespace ,  pod ,  node ,  deployment , and more. If the user chooses to run the command, they will be navigated to the Run Command blade within the AKS experience. Alternatively, users can copy the command and execute it in their local terminal.

**Specific Handler IDs**

1. RunAksKubeCtlCommandHandler
2. RunAksKubeCtlCommandHandlerHeadless

**Sample Questions**

*  List all my namespaces 
*  List all of my failed pods in this cluster 
*  Check the rollout status for deployment  aksdeployment 
*  Get all pods which are in pending states in all namespaces 
*  Can you delete my deployment named  my-deployment  in namespace  my-namespace ? 
*  Scale the number of replicas of my deployment  my-deployment  to 5 
* "How do I get the status of all nodes in my AKS cluster?"
* "List all services in my aks cluster with kubectl"

---

### YAML Autocomplete + Code gen

This skill serves as a comprehensive resource for all inquiries related to AKS YAML deployment files. When users seek guidance, it navigates them to the YAML editor blade within their AKS cluster. Within this blade, users have the option to press  Alt + \  to invoke an in-line Copilot. By doing so, they can use descriptive prompts to generate new YAML code, explain the meaning of existing code snippets, or fix issues with existing YAML code. Users can also accept and discard Copilot code suggestions inline and edit code suggestions before accepting and merging into their YAML file.

**Specific Handler IDs**

1. open_aks_yaml_generatorterminal

**Sample Questions**

*  Create and edit an AKS YAML deployment file 
*  Troubleshoot an existing AKS YAML deployment 
*  Explain a YAML deployment file for AKS 
*  What does my AKS YAML deployment file mean? 
*  How can I scale up my AKS cluster using YAML? 
* "Write a YAML script to schedule a CronJob in Kubernetes for deleting logs older than 30 days from a specific directory every Sunday at 4 AM."
* "Generate a YAML file to set up a horizontal pod autoscaler in Kubernetes for a web application based on CPU usage."
* " Deploy my application manifest to an AKS cluster"

---

### AKS - Can I pull utility

This handler allows a user to deploy AKS CanIpull to their AKS cluster. CanIpull is a diagnostic tool that checks if your AKS cluster can pull container images from Azure Container Registry.

The AKS canipull tool is a diagnostic utility designed to perform health checks on Azure Kubernetes Service (AKS) clusters, specifically focusing on image pulls. This tool helps ensure that your AKS clusters can successfully pull container images from container registries, which is crucial for the smooth operation of your applications.

The AKS canipull tool provides several key features:

* Health Checks: It performs comprehensive health checks to verify that your AKS clusters can pull images without any issues.
* Diagnostic Information: The tool offers detailed diagnostic information to help you identify and resolve any problems related to image pulls.
* Ease of Use: With a user-friendly interface, the AKS canipull tool simplifies the process of diagnosing and troubleshooting image pull issues in your AKS clusters.
* [This is an Azure supported AKS tool](https://github.com/Azure/aks-canipull)
  
**Specific Handler IDs:**

1. akscanipullhandlerheadless

**Sample Questions:**

*   "Help me deploy CanIpull to my AKS cluster",
*   "Help me deploy CanIpull to my AKS cluster",
*   "Deploy CanIpull to my cluster",
*   "Add CanIpull to my cluster",
*   "Add CanIpull health check to my cluster",
*   "Do I have access to a specific Azure Container Registry from my AKS cluster",
*   "Help me test if ACR is attached to my AKS cluster"

---

### AKS - Deploy periscope

This handler allows a user to deploy AKS Periscope to their AKS cluster. Deploying periscope allows diagnostics and logs collection for clusters.

Description of the Periscope tool:  
The AKS Periscope tool is designed to help Azure Kubernetes Service (AKS) customers diagnose and troubleshoot issues within their clusters. It collects and exports logs and diagnostic information from nodes and pods, making it easier to identify and resolve problems.

Key features of the AKS Periscope tool include:  

* Log Collection: It gathers container logs, Docker and Kubelet system service logs, and network connectivity checks.
* Diagnostic Information: The tool provides initial diagnostics and collects logs to help analyze and identify potential issues.
* Ease of Use: Users can run the tool with a simple `az aks kollect` command, and it integrates with Azure Blob storage for log export.
* For more information, you can visit the [GitHub repository](https://github.com/Azure/aks-periscope)

**Specific Handler IDs:**

1. microsoft_azure_containerservice__aksperiscopehandlerheadless

**Sample Questions:**

* "Help me deploy Periscope to my AKS cluster",
* "Deploy Periscope to my cluster",
* "Add Periscope to my cluster",
* "Add periscope logging to my cluster",
* "Help me collect diagnostics logs from my AKS cluster"

---

### AKS Troubleshooting Handler

The AKS Troubleshooting Agent offers an intuitive, guided agentic experience that helps users detect, triage, and resolve common Kubernetes issues in their AKS clusters. This agent may detect problems like resource failures and scaling bottlenecks. It intelligently correlates signals across metrics and events using kubectl commands when reasoning and provides actionable solutions. By simplifying complex diagnostics and offering clear next steps, the agent empowers users to troubleshoot independently.

The Kubernetes troubleshooting agent provides intelligent support for diagnosing and resolving issues in AKS clusters. For Ignite, we committed the following plugins (skills): Kubectl (execute_kubectl_command), and Applens (applens_aks_detectors)

The agent will scan AKS clusters and diagnose issues while providing customers solutions in plain-English. It is expected to:

* Detect common cluster problems such as pod scheduling failures, node readiness issues, and control plane anomalies.
* Present findings in simple English, making diagnostics accessible to a broader range of users.
* Integrate seamlessly into the AKS blade, offering contextual nudges and guided troubleshooting flows.
* Support a  Troubleshoot  CTA that launches the agent s analysis with minimal setup.

**Specific Handler IDs:**

1. AKSTroubleshootAgent

**Sample Questions:**

* "Why is my AKS cluster's CPU usage high?"
* "How do I fix OOMKilled errors?"
* "Steps to troubleshoot AKS networking issues?"
* "Why did my AKS upgrade fail?"
* "How to resolve memory pressure in AKS?"
* "Causes of pod evictions in AKS?"
* "How to check AKS node health?"
* "Why isn't my AKS cluster scaling?"
* "Troubleshoot DNS issues in AKS?"
* "Best practices for monitoring AKS?"

---

### AKS SKU Handler

This handler provides users recommendations on which azure VM sizes/SKUs to use for creating AKS clusters based on their message or request. The handler also provides options to deploy the AKS cluster by redirecting to AKS create on Azure portal. Invoke this handler if users have any questions regarding recommendations for which Azure size to use to support their application. The handler will recommend sizes based on the CPU and memory requirements of the user's application and which azure sizes can support those requirements. This handler is LLM-based.

**Specific Handler IDs:**

1. aks_copilot_sku_recommendationTerminal

**Sample Questions:**

* "Recommend VM sizes for AKS clusters",
* "Recommend VM sizes for Kubernetes Service for my AI workload"
* "Suggest VM sizes for AKS deployments",
* "Recommend Azure Sizes for Kubernetes Service",
* "I am creating Kubernetes Service Resource for my workload, which Azure size should I use?"

---

### AKS Navigation Handler

Azure Copilot includes a Copilot Navigational Handler that helps users quickly locate and access specific AKS operations within the Azure portal. This feature streamlines the experience by interpreting natural language queries and guiding users directly to the relevant configuration or management page.

The handler enables users to:

* Search for AKS operations using natural language.
* Navigate directly to the corresponding Azure portal experience.

**Specific Handler IDs:**

1. aks_search_and_nav_handler

**Sample Questions:**

*  Where to upgrade node channel type in my cluster? 
*  Take me to AKS node pool configuration. 
*  Where do I manage AKS network policies? 
*  How do I enable workload identity for my cluster? 
*  Where can I go to enable secret store CSI driver for AKS? 
*  Where can I enable image cleaner for my AKS cluster? 
*  Where can I go to choose Authentication and Authorization for my cluster? 
*  How do I get to AKS workload identity management? 

---

## Data Gathering

You can identify the invoked handler [using this guide.](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1520909/Identify-Invoked-Copilot-Handlers_Portal)

If copilot is using one of the AKS handlers, gather the following data:

* Problem Description
* Session ID or Ctrl+Alt+A Output
* Any applicable screesnshots
* Reproduction Steps
* Browser trace

## Escalation

Then you can create an ICM using the following template: [Copilot ICM Template](https://aka.ms/azurecopilot/createicm)

## Reference docs

[Getting Started with Copilot in Azure | Azure Portal (IbizaFx)](https://eng.ms/docs/products/azure-portal-framework-ibizafx/copilot)  
[What is Copilot in Azure_Portal - Overview](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1263214/What-is-Copilot-in-Azure_Portal)

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>

**Contributors:**

* Jordan Harder <Jordan.Harder@microsoft.com>
