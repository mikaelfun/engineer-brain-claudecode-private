# AKS Workload Identity / OIDC — 排查工作流

**来源草稿**: ado-wiki-a-Azure-Copilot-AKS-Handlers.md, ado-wiki-a-Azure-Dedicated-Host-On-AKS.md, ado-wiki-a-CICD-using-AKS-and-Jenkins-TSG.md, ado-wiki-a-Microsoft.Flux-AKS-Extensions.md, ado-wiki-a-aks-communication-manager.md, ado-wiki-a-aks-event-grid.md, ado-wiki-a-azure-managed-lustre-with-aks.md, ado-wiki-a-coredns-testing-in-aks-clusters.md, ado-wiki-aks-ado-support-boundary.md, ado-wiki-aks-emerging-issues-reporting.md, ado-wiki-aks-enable-swap-memory.md, ado-wiki-aks-ml-azure-machine-learning-tsg.md, ado-wiki-aks-platform-diagrams.md, ado-wiki-aks-tcpdump-instructions.md, ado-wiki-aks-track-fix-rollout-progress.md, ado-wiki-b-AKS-Remediator.md, ado-wiki-b-E2E-AKS-Cluster-Provisioning-Tracing.md, ado-wiki-b-Service-Connector-with-AKS.md, ado-wiki-b-aks-backup-troubleshooting.md, ado-wiki-b-validating-azure-policies-in-aks.md, ado-wiki-c-IP-Address-Allocation-AKS.md, ado-wiki-capturing-memory-dumps-aks-nodes.md, ado-wiki-check-overlake-enabled-aks-nodes.md, ado-wiki-coredns-nodelocaldns-aks.md, ado-wiki-disable-environment-variables-globally-on-aks.md, ado-wiki-keda-implementation-aks.md, ado-wiki-logging-aad-users-operation-on-aks.md, ado-wiki-network-connection-monitor-in-aks.md, ado-wiki-publish-aks-services-private-link-front-door.md, ado-wiki-pull-private-registry-images-from-aks-nodes.md, mslearn-aks-error-codes-reference.md, mslearn-connection-issues-app-hosted-aks.md, onenote-aks-best-practices-faq.md, onenote-aks-cross-product-ownership.md, onenote-aks-dockerhub-gitops-migration.md, onenote-aks-ephemeral-os-disk.md, onenote-aks-keyvault-workload-identity.md, onenote-aks-mooncake-support-tools.md
**Kusto 引用**: msi-connector.md
**场景数**: 38
**生成日期**: 2026-04-07

---

## Scenario 1: Azure Copilot AKS Handlers
> 来源: ado-wiki-a-Azure-Copilot-AKS-Handlers.md | 适用: 适用范围未明确

### 排查步骤

#### Azure Copilot AKS Handlers


#### Overview

The Azure Portal now has copilot integrated into it. Support for copilot in the Azure portal is mainly owned by the VM team, however there are multiple handlers specific to AKS.

#### Basic Troubleshooting
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
#### AKS Handlers

##### Create an AKS cluster

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

##### Nodepool Start/Stop

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

##### Monitoring Navigational Handler

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

##### Istio Navigational Handler

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

##### Update AKS Pricing Tier

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

##### Cluster IP Authorization

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

##### KubeCTL Command Execution/Generation

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

##### YAML Autocomplete + Code gen

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

##### AKS - Can I pull utility

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

##### AKS - Deploy periscope

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

##### AKS Troubleshooting Handler

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

##### AKS SKU Handler

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

##### AKS Navigation Handler

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

#### Data Gathering

You can identify the invoked handler [using this guide.](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1520909/Identify-Invoked-Copilot-Handlers_Portal)

If copilot is using one of the AKS handlers, gather the following data:

* Problem Description
* Session ID or Ctrl+Alt+A Output
* Any applicable screesnshots
* Reproduction Steps
* Browser trace

#### Escalation

Then you can create an ICM using the following template: [Copilot ICM Template](https://aka.ms/azurecopilot/createicm)

#### Reference docs

[Getting Started with Copilot in Azure | Azure Portal (IbizaFx)](https://eng.ms/docs/products/azure-portal-framework-ibizafx/copilot)
[What is Copilot in Azure_Portal - Overview](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1263214/What-is-Copilot-in-Azure_Portal)

#### Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>

**Contributors:**

* Jordan Harder <Jordan.Harder@microsoft.com>

---

## Scenario 2: Azure Dedicated Host on AKS
> 来源: ado-wiki-a-Azure-Dedicated-Host-On-AKS.md | 适用: 适用范围未明确

### 排查步骤

#### Azure Dedicated Host on AKS

#### Description

Azure Dedicated Host is a service that provides physical servers - able to host one or more virtual machines - dedicated to one Azure subscription. It will now be supported in AKS as an option at cluster create and once created with that feature option have the ability to add in additional node pools from those hosts.

##### Support Boundary

* Any AKS reason a cluster could not be deployed?
* Any AKS related reason a node pool could not be added to a cluster?

##### Basic Flow

- Cluster Deployed Successfully?
  - Yes -> Node pool/vmss instance unable to be added?
    - Yes -> Standard troubleshooting does not expose the issue? -> Escalate
    - No -> Escalate
  - No -> Errors in ARMProd or elsewhere that might indicate the reason that can be solved?
    - No -> Escalate

##### Escalation Paths

#### The following scenarios may require an ICM to be filed against _AzureRT/ CRP Core Service_

[AzureRT/ CRP Core Service Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=z2j2W1)

* Unable to deploy a cluster using a Dedicated Host
* Unable to add a node pool or instance using a Dedicated Host

##### Verified Learning Resources

| Resource | Description |
|------|------|
| [TSG](https://eng.ms/docs/cloud-ai-platform/azure/azure-core-compute/control-plane-bburns/azure-kubernetes-service/azure-kubernetes-service/doc/tsg/aks-dedicatedhostgroup) | Troubleshooting TSG |

---

## Scenario 3: CI/CD using AKS and Jenkins - TSG
> 来源: ado-wiki-a-CICD-using-AKS-and-Jenkins-TSG.md | 适用: 适用范围未明确

### 排查步骤

#### CI/CD using AKS and Jenkins - TSG

Author: <xinhaoxiong@microsoft.com>

<br>


<br>

#### Summary

This article aims at providing the troubleshoot steps from the ACR and AKS side when a customer has issue with jenkins deploying workloads on an AKS cluster.

**Please note that Jenkins is a third-party software application. According to [Microsoft's support policy](https://learn.microsoft.com/en-us/azure/aks/support-policies), Jenkins' configuration guidance and its own failures are not within Microsoft's support. If you encounter these issues, please advise customers to seek Jenkins community support.**

<br>

#### Escalation Paths

* Jenkins related issue --\> [Issue Reporting (jenkins.io)](<https://www.jenkins.io/participate/report-issue/>)

* AKS related issue --\> AKS team

* Couldn't identify the ownership of the issue --> Raise AVA ticket and ping the corresponding [SME team](<https://microsoftapc.sharepoint.com/teams/AzureNetteam-China/Lists/ACT%2520Asia%2520App%2520SME/AllItems.aspx?skipSignal=true>)

<br>

#### Verified Learning Resources

* Architecture that intergrates Jenkisn and AKS : [AKS container CI/CD with Jenkins and Kubernetes - Azure Architecture Center \| Microsoft Learn](<https://learn.microsoft.com/en-us/azure/architecture/solution-ideas/articles/container-cicd-using-jenkins-and-kubernetes-on-azure-container-service>)

* Tutorial from Azure: [Tutorial - Deploy from GitHub to Azure Kubernetes Service using Jenkins \| Microsoft Learn](<https://learn.microsoft.com/en-us/azure/developer/jenkins/deploy-from-github-to-aks>)

* Jenkins community doc: [Jenkins User Documentation](<https://www.jenkins.io/doc/>)

* Jenkins demo pipeline script: [JenkinLab/Lab2_Deploy_An_APP_Into_AKS.txt at master · alexxiongxiong/JenkinLab (github.com)](https://github.com/alexxiongxiong/JenkinLab/blob/master/Lab2_Deploy_An_APP_Into_AKS.txt)

<br>

#### Important logs for Jenkins troubleshooting

##### Logs from Server side

**Pipeline console output:**

Jenkins Dashboard --> One Specific Pipeline --> Build history --> Console Output

##### Logs from the Agent side

/$jenkins_user_home_directory/remoting/logs   -->  contains java exceptions happened on the agent host

<br>

#### Symptoms

* Jenkins failed to pull source code from GitHub  

* Jenkins failed to build and push Docker container to Azure Container Registry

* Jenkins failed to deploy your new containerized app to Kubernetes on Azure

<br>

##### Symptom 1

Jenkins failed to pull source code from GitHub  

##### Cause / Mitigation 1

| Issue Type                           | Error messages                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | How to verify that the error message is true                                                                                                                                                                                                                   | Mitigation Steps                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Note                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Authentication failure               | The following error message is displayed in the console output of the pipeline: <br/> {   <br/>"message": "Bad credentials", <br/> "documentation_url": "<https://docs.github.com/rest>"<br/>}                                                                                                                                                                                                                                                                                           | Use the curl command to manually verify that the personal access token is correct<br/> <br/>root@AlexRampUpVM-01:~# curl -H "Authorization: token xxx_replace_your_personal_access_token_xxx" -L <https://api.github.com/repos/alexxiongxiong/wordpress/tarball> | Please ask CX to correct the personal access token of Github repo  [How to get your personal access tokens for GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic) <br/>[How to store GitHub personal access token in Jenkins](https://learn.microsoft.com/en-us/azure/developer/jenkins/deploy-from-github-to-aks#create-a-credential-resource-in-jenkins-for-the-acr-service-principal) | Skip this if cx is using Public repo |
| Jenkins Agent couldn't access Github | The following error message is displayed in the console output of the pipeline:<br/><br/> 16:22:19  Caused by: hudson.plugins.git.GitException: Command "git fetch --tags --progress -- <https://github.com/alexxiongxiong/GoWebApp> +refs/heads/_:refs/remotes/origin/_" returned status code 128: <br/> 16:22:19  stdout: <br/>16:22:19  stderr: fatal: unable to access '<https://github.com/alexxiongxiong/GoWebApp/>': Failed to connect to github.com port 443: Connection timed out | SSH to the Jenkins agent and run telnet to test the connection to the three websites below <br/><br/> Jenkins server IP: Port <br/> <https://github.com><br/> <https://api.github.com><br/>                                                                        | Jenkins Agent needs to access the following websites when pulling repo files from Github <br/><br/> Jenkins server IP: Port<br/> <https://github.com><br/> <https://api.github.com>                                                                                                                                                                                                                                                                                                                             |                                      |

**Note:**

How to verify if source code has been downloaded on the Jenkin agent host successfully?

Check the files under the directory $jenkins_user_home_directory/workspace/<Pipeline Name>

<br>

##### Symptom 2

Jenkins failed to build and push Docker container to Azure Container Registry

##### Cause / Mitigation 2

| Issue Type                                                 | Error messages                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | How to Verify/test                                                                                                                                                                                                                                                                                                                                  | Mitigation Steps                                                                                                                                     |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrong SP password                                          | The following error message is displayed in the console output of the pipeline: <br/><br/>15:32:53  + docker login alexrampuptest.azurecr.io -u 5e66ed61-bc8e-4f63-a469-76f1a1c9bf4f -p ****<br/>15:32:53 WARNING! Using --password via the CLI is insecure. Use --password-stdin.<br/>15:32:53 Error response from daemon: Get "<https://alexrampuptest.azurecr.io/v2/>": unauthorized: Invalid clientid or client secret.                                                               | Run the following command to verify if the sp password is correct<br/>az login --service-principal --username \$sp_id --password \$sp_secret --tenant $ten_id<br/><br/>Expected output:<br/>![](/.attachments/2024-01-15-13-34-17-image.png)                                                                                                        | Please ask cx to verify and correct the password of service principal.                                                                               |
| No permission to push the image into ACR                   | The following error message is displayed in the console output of the pipeline: <br/><br/>15:44:37  + docker login alexrampuptest.azurecr.io -u 5e66ed61-bc8e-4f63-a469-76f1a1c9bf4f -p ****<br/>15:44:37  WARNING! Using --password via the CLI is insecure. Use --password-stdin.<br/>15:44:37  Error response from daemon: Get "<https://alexrampuptest.azurecr.io/v2/>": unauthorized: authentication required, visit <https://aka.ms/acr/authorization> for more information.          | 1. Ask CX to provide the Service principal ID which was used to authenticate with ACR<br/>2. Guide CX to login Azure Portal and navigate to ACR page<br/>3. Go to access control(IAM) part and check if any existing role assignment for this SP. at least this SP should have AcrPush role.                                                        | At a minimum, add the "AcrPush" role for this service principal                                                                                      |
| Jenkins agent couldn't connect ACR                         | The following error message is displayed in the console output of the pipeline: <br/><br/>15:38:12  + docker login alexrampuptest.azurecr.io -u 5e66ed61-bc8e-4f63-a469-76f1a1c9bf4f -p ****<br/>15:38:12 WARNING! Using --password via the CLI is insecure. Use --password-stdin.<br/>15:38:12 Error response from daemon: Get "<https://alexrampuptest.azurecr.io/v2/>": denied: client with IP '20.78.92.41' is not allowed access. Refer <https://aka.ms/acr/firewall> to grant access. | 1. Use SSH to connect to the jenkins agent host<br/>2. Run the networking test command "nc -z -v <acr_name>.azurecr.io 443" (If cx is using jenkins built-in agent, please ask cx to add this command in his pipeline script)<br/><br/>Expected output:<br/>Connection to <acr_name>.azurecr.io 443 port [tcp/https] succeeded!                     | The jenkins agent host should be able to connect ACR FQDN. If not, please ask CX to check whether any firewall or NSG rules are blocking the traffic |
| Missing docker command on the Jenkins agent to build image | The following error message is displayed in the console output of the pipeline: <br/><br/>14:53:33  + docker build -t alexrampuptest.azurecr.io/webapp:jenkins19 .<br/><br/>14:53:33  /var/jenkins_home/workspace/Deply a web app into AKS@tmp/durable-4e89bad5/script.sh: 10: docker: not found                                                                                                                                                                                        | By default, Docker will not be installed within jenkins built-in agent, no matter how many plugins with the name "docker" are installed. If the jenkins server is running as a Pod in the AKS cluster and the jenkins built-in agent is been used, it is hard to install the docker command through pipeline script due to uncontrollable agent OS. | CX can use self-hosted agent and manually install docker daemon on it.                                                                               |

<br>

##### Symptom 3

Jenkins failed to deploy your new containerized app to Kubernetes on Azure

##### Cause / Mitigation 3

| Issue Type                          | Error messages                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | How to Verify/test                                                                                                                                                                                                                                                                                                            | Mitigation Steps                                                                                                                                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No permission to get AKS credential | The following error message is displayed in the console output of the pipeline: <br/><br/>16:19:37  + az aks get-credentials --resource-group AKSforHackathon --name AKSforHackathon<br/>16:19:38 WARNING: The behavior of this command has been altered by the following extension: aks-preview<br/>16:19:38 ERROR: (AuthorizationFailed) The client 'fd13ad70-3684-40b9-9807-5d94c3675472' with object id 'fd13ad70-3684-40b9-9807-5d94c3675472' does not have authorization to perform action 'Microsoft.ContainerService/managedClusters/listClusterUserCredential/action' over scope '/subscriptions/4728f3f2-8386-4527-ae25-60e3318585a0/resourceGroups/AKSforHackathon/providers/Microsoft.ContainerService/managedClusters/AKSforHackathon' or the scope is invalid. If access was recently granted, please refresh your credentials.<br/>16:19:38 Code: AuthorizationFailed | 1. Ask CX to provide the Service principal ID which was used to authenticate with AKS<br/>2. Guide CX to login Azure Portal and navigate to AKS page<br/>3. Go to access control(IAM) part and check if any existing role assignment for this SP.                                                                             | We can ask cx to grant the Contributor role of the AKS cluster to the service principal.                                                                                                                                                        |
| Jenkins agent couldn't connect AKS  | Jenkins agent may fail to connect AKS apiserver due to AKS authorized ip range or private endpoint. The console output of the pipeline will have the following error messages: <br/><br/>16:10:44  + kubectl apply -f ./manifests/deployment.yaml<br/>16:11:20 Unable to connect to the server: dial tcp 20.239.226.189:443: i/o timeout                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 1. Use SSH to connect to the jenkins agent host<br/>2. Run the networking test command "nc -z -v <AKS_apiserver_FQDN> 443" (If cx is using jenkins built-in agent, please ask cx to add this command in his pipeline script)<br/><br/>Expected output:<br/>Connection to <AKS_apiserver_FQDN> 443 port [tcp/https] succeeded! | 1. If the issue was caused by AKS authorized IP range, please ask cx to add Jenkins agent IP in the AKS authorized ip range.<br/><br/>2. If the issue was caused by private endpoint, please peer the VNETs of AKS apiserver and jenkins agent. |
| Jenkins Server/Agent Issue          | Check Jenkins Agent host: /$jenkins_user_home_directory/remoting/logs   -->  contains java exceptions happened on the agent host                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |                                                                                                                                                                                                                                                                                                                               | Raise tickets for Jenkins community                                                                                                                                                                                                             |

#### Owner and Contributors

**Owner:** Xinhao Xiong <xinhaoxiong@microsoft.com>
**Contributors:**

- Xinhao Xiong <xinhaoxiong@microsoft.com>

---

## Scenario 4: Microsoft.Flux AKS Extension
> 来源: ado-wiki-a-Microsoft.Flux-AKS-Extensions.md | 适用: 适用范围未明确

### 排查步骤

#### Microsoft.Flux AKS Extension


Get an introduction to Microsoft.Flux [here](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Addons-and-Extensions/Microsoft.Flux-Introduction)

#### Support Boundary

- Extension Deployed correctly
- Control Plane Running
  - Should be a deployed namespace `flux-system` that contains all of the following pods:
    - fluxconfig-agent
    - fluxconfig-controller
    - source-controller (by default)
    - kustomize-controller (by default)
    - helm-controller (by default)
    - notification-controller (by default)
    - image-automation-controller (not installed by default)
    - image-reflector-controller (not installed by default)

##### Basic Flow

::: mermaid

graph TD;
A[Microsoft.Flux Extension Deployed on Cluster?] -- Yes --> B[Which Pod is Hanging in `flux-system`?];
A -- No --> C[Extension Installation Failure TSG - L1]
B --> D[fluxconfig-agent]
B --> E[Other Pods]

D --> F[Run `kubectl logs -n flux-system fluxconfig-agent-pod-name -c fluxconfig-agent`]
F --> G[Authentication Issue?]
F --> H[Networking Issue?]
F --> I[Other?]

E --> M

G -- Yes --> J[AAD Pod Identity Installed?]
J -- Yes --> K[AAD Pod Identity TSG - L2]
J -- No --> M

H --> L[Flux TSG - L3]

I --> M[Escalate to Microsoft.KubernetesConfiguration TSG - L4]

:::

##### Links to related TSGs

`- L1` [View Extension Installation Failure TSG](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Microsoft.Flux-Extension-Installation-TSG)

`- L2` [View AAD Pod Identity TSG]("https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/troubleshooting#flux-v2---installing-the-microsoftflux-extension-in-a-cluster-with-azure-ad-pod-identity-enabled")

`- L3` [View Flux TSG](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Microsoft.Flux-FluxConfiguration-TSG)

`- L4` [View Escalate to Microsoft.KubernetesConfiguration TSG](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Microsoft.KubernetesConfiguration-Escalation)

#### Kusto

Obtain Entitlement PTN-ClusterConfig in CoreIdentity via [PTN-ClusterConfig](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/ptnclusterco-w3wd)

##### Kusto cluster and database info

cluster:  <https://clusterconfigprod.kusto.windows.net>
Database: ClusterConfig

##### Kusto tables of interest

| # | Table | Description |
|----|------|-------------|
| 1 | ConfigAgentTraces | This table has Arc extension operator and Arc agent log  from  user k8s cluster.|
| 2 | ClusterConfigTraces | This table has Arc Azure Service (Resource provider and Data plane) logs. |

#### Verified Learning Resources and TSGs

| Resource | Description |
|--------- | ------------|
| [Microsoft.Flux Troubleshooting Guide](https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/troubleshooting#gitops-management) | Microsoft Docs Flux Troubleshooting guide |
| [Flux Official Docs](https://fluxcd.io/docs) | Troubleshooting information is spread throughout the docs depending on the specific issue |

#### Owner and Contributors

**Owner:** Francisco Mu�oz <Francisco.Javier@microsoft.com>
**Contributors:**

- Francisco Mu�oz <Francisco.Javier@microsoft.com>
- Jordan Harder <joharder@microsoft.com>
- Eric Lucier <ericlucier@microsoft.com>
- Jadranko Tomic <jatomic@microsoft.com>
- Jonathan Innis <joinnis@microsoft.com>

---

## Scenario 5: AKS Communication Manager
> 来源: ado-wiki-a-aks-communication-manager.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Communication Manager

#### Feature Enablement

This feature is enabled for all clusters by default. The notifications are sent to Azure Resource Graph (ARG) and can be queried. To receive notifications through email, cx needs to set up system topic subscription.

#### [Customer and Support Engineer] Sample Azure Resource Graph (ARG) query for notifications of a cx cluster

1. Go to the portal ARG query blade:
<https://ms.portal.azure.com/#view/HubsExtension/ArgQueryBlade>

2. Query the containerserviceeventresources table:

```
containerserviceeventresources
| where type == "microsoft.containerservice/managedclusters/scheduledevents"
| where id contains "/subscriptions/subid/resourcegroups/rgname/providers/Microsoft.ContainerService/managedClusters/clustername"
```

#### [Support Engineer Only] In Depth Debug of Issues

##### If no notification is received in ARG

The notification follows the following travelling path:

**Auto upgrader -> Event grid domain (deployed by AKS team) -> ARN service -> ARG service**

1. From Auto upgrader -> Event grid domain (deployed by AKS team)

Check logs for debug issues. If an issue is suspected when publishing message for a cx cluster, use the following query with a cx cluster resource id to check error details:

```
AutoUpgraderEvents
| where msg contains "Failed to publish event" and msg contains "/subscriptions/subid/resourcegroups/rgname/providers/Microsoft.ContainerService/managedClusters/clustername"
```

A sample error message looks like:

"Failed to publish event when transitioning /subscriptions/subid/resourcegroups/rgname/providers/Microsoft.ContainerService/managedClusters/clustername to terminal state with error: reason xyz."

2. From Event grid domain (deployed by AKS team) -> ARN service -> ARG service

If something goes wrong in these two steps. Engineer should involve ARN team to debug. Record the resource name "/subscriptions/subid/resourcegroups/rgname/providers/Microsoft.ContainerService/managedClusters/clustername" and the time a message is supposed to be sent and pass the information to the ARN team so they can search on their end for lost messages.

The ARN team alias in IcM is: azure resource notifications -> triage team

##### If notification is received in ARG, but the subscriber to the system topic does not receive any notification

Engineer should also involve ARN team to debug. Record the resource name "/subscriptions/subid/resourcegroups/rgname/providers/Microsoft.ContainerService/managedClusters/clustername" and the time a message is supposed to be sent and pass the information to the ARN team so they can search on their end for lost messages.

The ARN team alias in IcM is: azure resource notifications -> triage team

#### Owner and Contributors

**Owner:** Jordan Harder <joharder@microsoft.com>
**Contributors:**

---

## Scenario 6: Introduction
> 来源: ado-wiki-a-aks-event-grid.md | 适用: 适用范围未明确

### 排查步骤

#### Introduction

AKS provides useful events for their customers relating to their ManagedClusters. Currently, we notify on the following events:

- NewKubernetesVersionAvailable
- ClusterSupportEnded
- ClusterSupportToBeEnded
- NodePoolRollingStarted
- NodePoolRollingCompleted
- NodePoolRollingFailed

The Azure documentation for the specifics of each event can be found [here](https://learn.microsoft.com/en-us/azure/event-grid/event-schema-aks?tabs=event-grid-event-schema).

#### Expected Frequency of Events

##### NewKubernetesVersionAvailable, ClusterSupportEnded, ClusterSupportToBeEnded

These events are triggered upon rp-async pod restart and deduplicated by Service Bus in a 7-day window. This means that we expect at most one event to be published per cluster per 7-day window. If rp-async pods do not restart (perhaps during CCOA), these events will not trigger.

##### NodePoolRollingStarted, NodePoolRollingCompleted, NodePoolRollingFailed

These events are triggered during rolling of nodes. We expect one event to be published per operation per node pool. For example, if a two node pool cluster undergoes an upgrade successfully. We would expect 4 total messages: 2 NodePoolRollingStarted and 2 NodePoolRollingCompleted.

#### Event Path / Architecture

Please refer to [these diagrams](https://dev.azure.com/msazure/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/509604/Event-Path-for-Event-Grid-Integrations) as reference for the eventing flow

#### Alerting

##### Agentpool rolling publish (for AKS Event Grid) failure rate > 10% in ${REGION}

This alert is independent of the QoS of Agentpool Upgrade / Put operations. I.e. QoS could be doing poorly without the alert firing and vice versa. If the alert is firing, it is likely related to issues in the interaction between rp-async and service bus.
<https://aks.kusto.windows.net/AKSProd>

```
cluster("Aks").database("AKSprod").AsyncContextActivity
| where TIMESTAMP > ago(1h)
| where msg startswith_cs "Failed to publish agent pool rolling"
| where msg contains "{VMSS_URI}"
```

#### TSG for Potential IcMs

Errors occurring during the subscription of the events via Azure Event Grid (via portal, cli, etc) are supported by Azure Event Grid and we have little visibility. Such tickets should not be handled by AKS.

The Kusto tables for all below queries can be found at <https://aks.kusto.windows.net/AKSProd>.

1) Make sure clusters are appropriately subscribed to AKS Events. (Out of scope for AKS)

2) Check if our Event Grid Handler successfully published event. If it has and customer has still not received event, transfer incident to `Event Grid DRI`.

```
Eventgrid
| where TIMESTAMP > ago(1h)
| where msg startswith "publish $EVENT_NAME"
| where msg contains "/subscriptions/$SUB_ID/resourceGroups/$RG/providers/Microsoft.Compute/ManagedCluster/$MC_NAME"
```

3) Check if Event Grid Listener has received and processed event successfully.

```
Eventgrid
| where TIMESTAMP > ago(1h)
| where msg contains "processing $EVENT_NAME for $MCNAME:"
```

4) Check if source message (that is supposed to be sent to AKS Event Grid) was sent. The former query is for NodePoolRolling while the latter for ClusterSupport.

```
cluster("Aks").database("AKSprod").AsyncContextActivity
| where TIMESTAMP > ago(1h)
| where msg startswith_cs "Failed to publish agent pool rolling"
| where msg contains "{VMSS_URI}"
```

```
RegionalLooperEvents
| where TIMESTAMP > ago(1h)
| where msg startswith_cs "publishing outofsupport event"
| where msg contains $MCNAME
```

#### Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>

---

## Scenario 7: Azure Managed Lustre and AKS
> 来源: ado-wiki-a-azure-managed-lustre-with-aks.md | 适用: 适用范围未明确

### 排查步骤

#### Azure Managed Lustre and AKS

#### Azure Lustre CSI Driver

| CSI driver version | Container image | Supported K8s | Lustre client |
|--|--|--|--|
| main branch | mcr.microsoft.com/oss/kubernetes-csi/azurelustre-csi:latest | 1.21+ | 2.15.1 |

#### Setup Steps

1. Create Azure Managed Lustre File System
2. Peer AKS vnet with Lustre FS vnet
3. Create AKS Cluster with peered vnet
4. Install the CSI Driver
5. Configure Persistent Volume
6. Verify PVC: `kubectl get pvc`
7. Create test pod with PVC mount
8. Verify filesystem: `mount | grep lustre`

#### Support Status

AMLFS is supported by the Azure High Complexity Low Volume (HCLV) team.

#### Escalation

Create IcM assigned to "Avere Azure Storage Cache/AMLFS Triage" with:
* Customer name, description, error message, timestamp, subscription ID, resource group, AMLFS name
* Reference support request number in ICM title

#### References

* Regional failover: https://learn.microsoft.com/en-us/azure/azure-managed-lustre/amlfs-region-recovery
* CSI driver: https://github.com/kubernetes-sigs/azurelustre-csi-driver

**Owner:** RAGHU NANDAN SHUKLA <rashukla@microsoft.com>

---

## Scenario 8: Testing DNS resolution in AKS containers
> 来源: ado-wiki-a-coredns-testing-in-aks-clusters.md | 适用: 适用范围未明确

### 排查步骤

#### Testing DNS resolution in AKS containers

#### Summary and Goals

This script implementation is used for testing name resolution across the CoreDNS endpoints in AKS cluster.
It will perform the networking connectivity check directly on the IP address of CoreDNS instances,
name resolution in an extended loop for checking the availability to respond to DNS queries, and also
can enable the logging process for the entire CoreDNS deployment.

#### Prerequisites

This script should be run in a **bash** instance. It requires a working AKS cluster along with
**kubectl** configured for accessing the cluster. It was tested with an nginx Pod (Debian based)
but it can be customized with any other base image.

#### Usage

Copy the file content locally and make it executable:

```bash
chmod +x ./kubectl-dnstest
```

##### Modes

| Mode | Description |
|------|-------------|
| (no args) | Deploy nginx test pod, install tools, test TCP connectivity to all CoreDNS endpoints on port 53 |
| `query` | Execute 20 nslookup queries for microsoft.com against each CoreDNS endpoint |
| `reload` | Delete CoreDNS pods one by one (force restart) |
| `logging` | Enable CoreDNS logging by deploying coredns-custom ConfigMap |

##### Script

```bash
#!/bin/bash

if [ "$#" -eq 0 ];
then
  echo "CoreDNS CheckUp"
  echo "Usage: "
  echo "kubednscheck "
  IPS=$(kubectl get pod --namespace=kube-system -l k8s-app=kube-dns -o jsonpath='{.items[*].status.podIP}')
  echo "Deploy nginx test Pod"
  kubectl run nginx --image=nginx
  sleep 8
  kubectl exec -it nginx -- apt update
  kubectl exec -it nginx -- apt install netcat -y
  kubectl exec -it nginx -- apt install dnsutils -y
  for instance in $IPS;
    do
      for i in {1..20}; do kubectl exec -it nginx --  nc -zv $instance 53; done;
  done
elif [[ "$1" == "query" ]];
then
  IPS=$(kubectl get pod --namespace=kube-system -l k8s-app=kube-dns -o jsonpath='{.items[*].status.podIP}')
  for instance in $IPS;
    do
      for i in {1..20}; do kubectl exec -it nginx --  nslookup microsoft.com $instance; done;
  done
elif [[ "$1" == "reload" ]];
then
  POD=$(kubectl get pod --namespace=kube-system -l k8s-app=kube-dns -o jsonpath='{.items[*].metadata.name}')
  for podName in $POD;
     do
       kubectl delete pod -n kube-system $podName;
     done
elif [[ "$1" == "logging" ]];
then
cat << EOF > ./coredns-logging.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns-custom
  namespace: kube-system
data:
  log.override: |
        log
EOF
kubectl apply -f ./coredns-logging.yaml
fi
```

#### Involved Components

- nginx Pod (test pod for DNS queries)
- CoreDNS pods in kube-system namespace (label: k8s-app=kube-dns)
- coredns-custom ConfigMap (for enabling logging)

Point of contact: Ovidiu Borlean (oborlean@microsoft.com)

---

## Scenario 9: Support boundary for Azure DevOps related cases
> 来源: ado-wiki-aks-ado-support-boundary.md | 适用: 适用范围未明确

### 排查步骤

#### Support boundary for Azure DevOps related cases

#### Summary

This document is focused on troubleshooting issues when Azure DevOps cases land in the AKS queue and outlines the necessary steps to perform before engaging the Azure DevOps team. This wiki was created by mutual agreement from both DevOps TA's and AKS team.

##### Architecture and Involved Components

- Azure DevOps (ADO) Services/Agents
- Azure Kubernetes Service (AKS) Cluster
- Pipelines (YAML/Classic)
- Kubernetes components (Pods, Secrets, etc.)
- Helm/kubectl

##### Isolate the issue from AKS perspective

- Verify if the AKS platform is healthy
- Identify the AKS component which will be deployed into AKS by the pipeline (Pods, secrets, etc.). Check the health of these components and verify if they can be deployed directly without pipeline
- Check and analyze the logs of the deployment at AKS end for the service or pods and identify if the failure is related to AKS or not
- Assist in verifying the connection between the ADO service/Agent and AKS cluster
- Ask the customer to perform a manual deployment (outside of the pipeline) using the same manifests or deployment commands. If the manual deployment is successful but fails when running via the pipeline, the issue likely lies within the pipeline configuration and is ADO-owned. If the manual deployment fails, the issue needs to be investigated by AKS engineer.

#### Scenarios Owned by Azure DevOps Engineer

These scenarios are fully within the DevOps domain. If the failure/issue is before step numbers 5 and 7, they need to be owned by the DevOps team.

1. **Pipeline YAML/Classic Configuration Issues** - Syntax errors, stage/job/task misconfiguration, or missing environment variables.
2. **Service Connection Issues (Kubeconfig, Azure Resource Manager)** - Misconfigured or expired service connections. Service connection configuration and troubleshooting for AKS is owned by ADO team; however, for AKS cluster where local accounts are disabled and RBAC is enabled, help from AKS team in collaboration is needed for role-binding and role assignment.
3. **Pipeline Agent Issues** - Pipeline not picking up jobs, agent capabilities mismatched, or agent startup issues.
4. **Deployment Step Failures** - Helm/kubectl ADO task failures due to wrong parameters, chart paths, or missing binaries.
5. **DevOps Variable/Substitution/Secrets Scope Issues** - Errors in secret substitution or scoped variables during AKS deployment.
6. **Helm Chart Packaging, Publishing and deployment** - Supported by ADO team only if the process fails through the pipeline using Helm tasks/commands but succeeds locally. Helm custom graph support is not provided by either team (best-effort basis).
7. **Agent Configuration on AKS Clusters** - Responsibility of Azure DevOps support team.
8. **Nested Scenarios** - Running ADO agents inside an ADO agent Pod is not supported.

#### Scenarios to be Owned by AKS Team

1. **Cluster Provisioning Failures (AKS API Errors)** - e.g., `aks create` fails or clusters stuck in Updating/Failed state.
2. **Node Pool Scaling/Upgrade/Autoscaler Issues** - e.g., Cluster autoscaler not functioning; node pool fails to scale or upgrade.
3. **Kubelet/Docker/Containerd Errors at Node Level** - e.g., Pods crashing due to runtime errors or node misconfiguration.
4. **AKS-Specific Networking Issues (CNI/Calico/Overlay)** - e.g., Pods can't reach external services due to overlay networking problems.

#### Scenarios Requiring Collaboration with AKS Engineers

1. **Deployment Failures Due to Cluster Misconfiguration** - Pipeline deploys fine but pods fail due to node taints, pod security policies, or misconfigured namespaces.
2. **Agent Pool Issues with Self-Hosted Agents on AKS** - Self-hosted DevOps agents deployed on AKS are not connecting or showing offline.
3. **Intermittent Pipeline Failures with Cluster-Level Events** - Pods evicted during builds due to resource pressure, node restarts, or AKS upgrades.
4. **Permissions or RBAC Issues Between Pipeline and AKS** - Pipeline fails with RBAC errors (forbidden, no permissions to list pods).
5. **Network or DNS Issues Affecting Pipeline to AKS Access** - Pipelines hang/fail when accessing AKS due to DNS or VNET misconfigurations.

**Tip:** A good practice is to validate:
- If the issue is inside the cluster → likely AKS team.
- If it's before/during deployment or DevOps agent-related → DevOps engineer owns it.
- If it spans both → open a collaboration case, tag both teams and work in parallel.

#### Escalation Paths

DevOps TA: Aditya Ranjan, Shiva Kumar
AKS SME: Vinay Choudhary, Sanath Shetty

#### References

> https://learn.microsoft.com/en-us/azure/architecture/guide/aks/aks-cicd-azure-pipelines

---

## Scenario 10: Emerging Issues (EI)
> 来源: ado-wiki-aks-emerging-issues-reporting.md | 适用: 适用范围未明确

### 排查步骤

#### Emerging Issues (EI)

#### What are emerging issues

Bugs, regressions, LSIs which are being actively identified and worked on that could impact the support volume. You can count outages as well but they are more well known, better communicated and reported.

#### How to track an emerging issue?

You can track emerging issues through following sources. For detailed review, you can go to the work item embedded within them.

* [Dedicated Teams Channel](https://teams.microsoft.com/l/channel/19%3a5dbf71f1240c41699bf8d89aa9f62062%40thread.skype/Emerging%2520Issues?groupId=074e4c99-14b9-4454-98ae-9eff23b77872&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)
* [Emerging Issues Wiki](/Azure-Kubernetes-Service-Wiki/Emerging-and-Known-Issues#emerging-issues)
* AKS PG updates emerging issues per SIG in real time at [AKS Emerging Issues](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/242218/Ongoing-Issues)

#### How to report an Emerging Issue?

Please note that at this time, only TA/EEE are tasked to report an emerging issue.

1. Identify: TA or EEE identify the Emerging Issue in their respective areas.
2. Report: TA/EEE can report emerging issue by sending an email formulated with following details. Once reported, this email will trigger updates to Teams channel and wiki listing.

   * Email To: actemergingissue@microsoft.com
   * Email Subject line: **#emergingissue #aks** _<provide brief issue title here>_

   Insert only the following table in Email body:

   | Field | Value |
   |--|--|
   | **Issue/symptoms** |  |
   | **Error message** |  |
   | **Cause** |  |
   | **How to diagnose / Identify** |  |
   | **Mitigation** |  |
   | **Tracking IcM** (Validate and link your case to this IcM in DFM. Check with TA if case needs new IcM.) | |
   | **Reference ICMs** |  |
   | **Status** |  |

#### Process lifecycle and Triggers from reporting emerging issues email

1. EEE/TA/PG will identify and report an Emerging Issue.
2. _Automated_ An Emerging Issue work item is created in ADO.
3. _Automated_ A message is posted in the Emerging Issue Teams channel.
4. _Automated_ The emerging issues list on the AKS wiki will be updated.
5. _Automated_ An email will go out to the broader team with the details.
6. Assigned AKS CSS engineer will act as an anchor and coordinate updates.

Select the Work Item Type = "Emerging Issue" and enter the item number to link it in IcM.

---

## Scenario 11: How to enable swap memory for AKS nodes
> 来源: ado-wiki-aks-enable-swap-memory.md | 适用: 适用范围未明确

### 排查步骤

#### How to enable swap memory for AKS nodes

Author: <dandshi@microsoft.com>

#### Summary and Goals

By default, as what is mentioned at <https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#before-you-begin>, the Kubernetes nodes should have swap memory disabled. However, in some cases, customer may want to enable and further leverage it for Kubernetes workloads. This article introduces how to enable the swap memory in AKS cluster.

##### **Attention!!!**

**We are not officially support using swap memory in AKS nodes and pods. Please do set proper expectation to your customers before introducing it.**

##### Prerequisites

* AKS cluster version is greater than 1.22.
* Daemonset with privilege container for configuring kubelet feature gate. (node-installer)

##### Limitation

* It can only be updated to newly added node pools. We can't enable it on existing node pools.
* For AKS cluster greater than 1.28, only Cgroup v2 supports enabling swap memory.

#### Implementation Steps

1. By leveraging this [feature](https://learn.microsoft.com/en-us/azure/aks/custom-node-configuration?tabs=linux-node-pools), we can enable swap memory for AKS nodes by specifying size of the swap file and set the failSwapOn for kubelet as false.

    The Linux OS config should contain following content which specify the swap file size.

    ```json
    {
      "swapFileSizeMB": 1024
    }
    ```

   The kubelet config should contain following content

   ```json
   {
     "failSwapOn": "false"
   }
   ```

2. Enable swap memory for new AKS cluster: `az aks create --name <AKSName> --resource-group <AKSResourceGroup> --kubelet-config <kubeletConfigFilePath> --linux-os-config <linuxConfigFilePath>`
3. Enable swap memory for new node pools: `az aks nodepool add --name <nodePoolName> --cluster-name <AKSName> --resource-group <AKSResourceGroup> --kubelet-config <kubeletConfigFilePath> --linux-os-config <linuxConfigFilePath>`

4. Enable the feature gate "NodeSwap" by adding following content in kubelet configuration file under "/etc/default/kubeletconfig.json" on the node and then restart the kubelet.

    Leverage an open-source project [Node Installer](https://github.com/patnaikshekhar/AKSNodeInstaller) to enable the feature gate of Kubelet.

    Sample YAMLs:

    ```yaml
    apiVersion: v1
    kind: Namespace
    metadata:
      name: node-installer
    ---
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: node-swap-installer-config
      namespace: node-installer
    data:
      install.sh: |
        #!/bin/bash
        cat /etc/default/kubeletconfig.json | jq '.featureGates.NodeSwap=true' > /etc/default/kubeletconfig.json.tmp && mv /etc/default/kubeletconfig.json.tmp /etc/default/kubeletconfig.json
        systemctl restart kubelet
    ---
    apiVersion: apps/v1
    kind: DaemonSet
    metadata:
      name: installer
      namespace: node-installer
    spec:
      selector:
        matchLabels:
          job: installer
      template:
        metadata:
          labels:
            job: installer
        spec:
          hostPID: true
          nodeSelector:
            agentpool: swaptest
          restartPolicy: Always
          containers:
          - image: patnaikshekhar/node-installer:1.3
            name: installer
            securityContext:
              privileged: true
            volumeMounts:
            - name: install-script
              mountPath: /tmp
            - name: host-mount
              mountPath: /host
          volumes:
          - name: install-script
            configMap:
              name: node-swap-installer-config
          - name: host-mount
            hostPath:
             path: /tmp/install
    ```

##### Result

After configuring all the stuffs, we should be able to see the swap memory using `free -m` in the nodes.

#### References

* [Kubernetes official - Nodes](https://kubernetes.io/docs/concepts/architecture/nodes/#swap-memory)
* [Kubernetes blog](https://kubernetes.io/blog/2023/08/24/swap-linux-beta/)
* [MS official - Custom node configuration](https://learn.microsoft.com/en-us/azure/aks/custom-node-configuration?tabs=linux-node-pools)
* [3rd party documentation - What is Swap space and how it works](https://phoenixnap.com/kb/swap-space)

---

## Scenario 12: Azure Kubernetes Machine Learning
> 来源: ado-wiki-aks-ml-azure-machine-learning-tsg.md | 适用: 适用范围未明确

### 排查步骤

#### Azure Kubernetes Machine Learning

#### Summary

This document is focused on troubleshooting issues when an Azure Machine Learning endpoint deployment is present or running on an AKS cluster.

#### Support Boundary

- Verify ML managed application
- Gather failure/error info
- Check ML extension log
- Verify application connection
- Escalate/Collaboration

##### Escalation Paths

- You can submit AVA escalation to AKS ML channel for help
- Collab can be sent to Azure Machine Learning team to help if you already identify this is ML related.
- Usually if you need a ML ICM please open the collab to ML team and they will help to do this after check.

#### Verified Learning Resources

- ML Specialist: https://cloudacademy.com/learning-paths/machine-learning-specialist-1854-4215/
- ML Advanced: https://cloudacademy.com/learning-paths/machine-learning-advanced-content-learning-path-1854-5432/
- AKS Extension: https://learn.microsoft.com/en-us/azure/machine-learning/how-to-deploy-kubernetes-extension?tabs=deploy-extension-with-cli
- ML Github Doc: https://github.com/Azure/AML-Kubernetes/
- ML Github TS guide: https://github.com/Azure/AML-Kubernetes/blob/master/docs/troubleshooting.md

#### TSG

##### How to check if an application is managed by ML

Use kube-audit logs to check if AzureML manages a pod in the cluster:

```kql
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp >= datetime(2022-12-11 00:01:00) and PreciseTimeStamp <= datetime(2022-12-11 23:00:00)
| where resourceId has "{sub_ID}" and resourceId has "{cluster_Name}"
| where category =~ 'kube-audit'
| extend Pod = extractjson('$.pod', properties, typeof(string))
| extend ContainerID = extractjson('$.containerID', properties , typeof(string))
| extend Log = extractjson('$.log', properties , typeof(string))
| extend _jlog = parse_json(Log)
| extend requestURI = tostring(_jlog.requestURI)
| where requestURI contains "{cluster_Name}"
| extend ismlapp = _jlog.requestObject.metadata.labels.isazuremlapp
| where ismlapp == "true"
| project PreciseTimeStamp,ismlapp, requestURI,category, Pod, ContainerID, Log
| take 10
```

Check a full application list managed by ML:

```kql
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp >= datetime(2022-12-11 00:01:00) and PreciseTimeStamp <= datetime(2022-12-11 23:00:00)
| where resourceId has "{sub_ID}" and resourceId has "{cluster_Name}"
| where category =~ 'kube-audit'
| extend Pod = extractjson('$.pod', properties, typeof(string))
| extend ContainerID = extractjson('$.containerID', properties , typeof(string))
| extend Log = extractjson('$.log', properties , typeof(string))
| extend _jlog = parse_json(Log)
| extend requestURI = tostring(_jlog.requestURI)
| extend ismlapp = _jlog.requestObject.metadata.labels.isazuremlapp
| where ismlapp == "true"
| where requestURI contains "deployments/"
| project PreciseTimeStamp,ismlapp, requestURI,category, Pod, ContainerID, Log
| distinct requestURI
```

##### ML application scale issue

When cx mentioned their ML application has scaling issue in AKS, normally we will think its AKS HPA issue but however ML application is a special thing which is not controlled by AKS but by ML FE management.

If we confirmed the application is managed by ML which means the scaling is not managed by AKS. ML FE has 2 versions now and there is confirmed scaling issue in V1 extension.

**Identify V1 vs V2 extension:**

```kql
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp >= datetime(2022-12-11 00:01:00) and PreciseTimeStamp <= datetime(2022-12-11 23:00:00)
| where resourceId has "{sub_ID}" and resourceId has "{cluster_Name}"
| where category =~ 'kube-audit'
| extend Pod = extractjson('$.pod', properties, typeof(string))
| extend ContainerID = extractjson('$.containerID', properties , typeof(string))
| extend Log = extractjson('$.log', properties , typeof(string))
| extend _jlog = parse_json(Log)
| extend requestURI = tostring(_jlog.requestURI)
| where requestURI contains "azureml-fe"
| project PreciseTimeStamp, requestURI,category, Pod, ContainerID, Log
| take 100
```

- Pod name prefixed with `azureml-fe` → V1 extension
- Pod name prefixed with `azureml-fe-v2` → V2 extension

**Check scaling history (triggered by ml-fe service account):**

```kql
let ['_namespace']="{ccp_Namespace}";
let ['_podName']= '';
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp >= datetime(2022-12-11 00:01:00) and PreciseTimeStamp <= datetime(2022-12-11 23:00:00)
| where resourceId has "{sub_ID}" and resourceId has "{cluster_Name}"
| where category =~ 'kube-audit'
| extend Log = extractjson('$.log', properties , typeof(string))
| extend _jlog = parse_json(Log)
| extend _objectRef = _jlog.objectRef
| where _jlog.user.username contains 'azureml-fe'
| where _jlog.requestURI has strcat(_namespace, "/deployments/", _podName)
| where _jlog.verb == 'update'
| project PreciseTimeStamp,_jlog.verb,_jlog.user.username, _objectRef.namespace,_objectRef.name,_jlog.responseObject,_jlog.responseObject.status, _jlog
```

**V1 Scaling Bug Details:**
- In V1, the FE scales the application pod aggressively (e.g., from max to 96), causing many pending pods
- This is a confirmed FE issue but V1 is deprecated, no fix will be provided
- **Fix**: (1) Restart all FE pods to normalize scaling; (2) Upgrade to V2 extension (engage ML team)
- Related tickets: 2211040030000806, 2210180040007537

##### How to check ML application deployment issue in ML extension V2

Installation: https://learn.microsoft.com/en-us/azure/machine-learning/how-to-deploy-kubernetes-extension?tabs=deploy-extension-with-cli

**Important**: Register feature providers on new subscriptions:

```bash
az provider register --namespace Microsoft.Kubernetes
az provider register --namespace Microsoft.KubernetesConfiguration
```

Otherwise there will be permission issues during extension deployment.

**How to check ML application deployment logs:**

1. Connect to the AKS cluster
2. Check the azureml pod under azureml namespace: `kubectl get pods -n azureml`
3. Get the log from related pod: `kubectl logs pod_name -n azureml`

**Useful pods during research:**

| Pod name | Description |
| --- | --- |
| Gateway | Contains all logs for Azure endpoint operations |
| azureml-fe | Contains logs for endpoint access status |
| amlarc-identity | Contains all logs for auth process |
| inference-operator | Contains all logs for inference endpoint operations |

All ML extension pods: https://learn.microsoft.com/en-us/azure/machine-learning/how-to-deploy-kubernetes-extension?tabs=deploy-extension-with-cli#review-azureml-extension-component

##### How to test ML application connection

ML service deploys the application on AKS like a normal RESTful API application through a deployment and service.

From the AKS perspective we focus on the connection layer:
1. Find the REST endpoint on the ML endpoint page
2. Test the connection to this endpoint (this is the LB IP of ML FE pods)
3. If connection has issues, troubleshoot like a normal AKS application with LB services
4. For application pods, find the related service and do normal tests

**Note**: ML service builds the image with user application and runs it on the AKS cluster. If any issue is related to the image (missing lib, application pod fails to start), this is the scope of ML services, not AKS.

#### Contact

Owner: Luis Alvarez <lualvare@microsoft.com>
Contributors: Zhijie Fang <zhfang@microsoft.com>

---

## Scenario 13: Azure Kubernetes Service Platform Diagrams
> 来源: ado-wiki-aks-platform-diagrams.md | 适用: 适用范围未明确

### 排查步骤

#### Azure Kubernetes Service Platform Diagrams

#### Summary

A collection of diagrams on AKS features and flows — useful reference for understanding AKS architecture during troubleshooting.

#### List of diagrams

|Name|Area of Interest|Link|Notes|
|---|---|---|---|
|AKS resource request flow|CRUD|[How AKS Request Is Processed](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/ES1oeM_LDklCnYW76bRqAI0BER86uj3PQV86P585Qeykzg?e=87Sab4)|"Red" line covers request reception; "green" line covers consequent ARM calls RP sends during the operation|
|Traffic from pod to internet|Networking|[Traffic-Pod-Internet](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/EfeELIWk1thPjk0vHcDjum0BbjpyO0X1K1yU8STamjedHQ?e=0XiaVP)|Double SNAT takes place|
|Relationship between Ids|Others/upstream|[Pod-Asso-Ids](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/EZDbwGGCHOFInJ5pPRxX8TEBxRpsV-ytY_6N9aLwxezyqQ?e=cjgbKa)|Blue:obtained via KubeAPI;Yellow:obtained inside agent node|
|FQDNs of a cluster|Networking|[aks-access-fqdns](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/ER1M4zBNFoNPoYzdu2e5pRMB7fITPM0S52pnj1c0cVKwpQ?e=U3DVHo)|BlueArea:user sub;YellowArea:pg sub|
|AKS traffic classification|Networking|[aks-traffic-maze](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/EQzu1cHJAFxBrdVZUp3noUYBQTu_DBfqaK_d0w4q7wJ0qg?e=Titd4f)|NA|
|Config landscape|Management|[aks-config-landscape](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/ERKXjtu56-FDuSXGXilfZxABNkUKUOtgBxR6dhmKdZ8zmw?e=A3KR2C)|Continuously updated|
|AKS and Prometheus|Observability|[prom-man-vs-byo](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/EYd3Kig3NfBMslqsh-SU7sEBaA1F0bKn1wSZpscj93lWfg?e=WyvUeK)|NA|
|Private vs Public Cluster|Networking|[private-public-cluster](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/EbH0q_3f8GxHnDGT_2rqZlgBX9a44WYxApanPWODaJPSuQ?e=42C4DG)|NA|
|Workflow of Disk CSI Driver|Storage|[csi-work-order](https://microsoftapc-my.sharepoint.com/:wb:/g/personal/kuzhao_microsoft_com/EQFM1sHVEclGrwd9_ywjaWsBSBH4MDj8jtOvoPUsYw40Yg?e=fXwkGR)|NA|

#### Annotations for each diagram

##### AKS resource request flow

- When an AKS CRUD request arrives, ARM frontend logs the record in ARMHttpIncoming Kusto table with correlationId from the client.
- ARM worker then forwards the call to AKS RP frontend, and also logs the record in ARMHttpOutgoing table.
- Upon receiving the request, AKS RP frontend logs it in RP incomingRequestTrace table, assigning "operationId" field to the record.
- Most CRUD requests require async task forking. After async task is created for the operation, it logs all subsequent ARM calls(in Green), i.e. creating VMSS and LB, in outgoingRequestTrace.
- The async task keeps "operationId" in the outgoingReq table, but replaces all other Ids with new ones associated with the outgoing ARM request.
- For instance, a nodepool upgrade request from user has its own correlationId. OperationId is assigned upon processing start, and subsequent VMSS scaling/reimaging requests bear the same operationId but new correlationIds in AKS outgoingRequestTrace.

##### Relationship between Ids

- Linux commands involved: pstree, crictl, ip netns, ip link, ip route, ps
- Pay attention to where you are through this maze of IDs.
- Crictl communicates with containerd on the node. The podId, in similar format with docker containerId, within is another matter than poduuid which K8s control plane is aware of.
- Each pod has its unique shim (dockershim in the past and containerdshim nowadays) process in the OS. Also, its unique "pause" process resides under the shim.
- Blue handwriting cmds can be interpreted as "you can get arrowEnd from arrowStart by exec the cmd".

##### FQDNs of a cluster

- 1:AKS resource management requests; 2:KubeAPI calls; 3:cluster workload traffic.
- 4x FQDNs in this diagram: publicFQDN of cluster LB frontend; ARM; AKS-RP; api-server in ccp
- Note that "publicFQDN" can also be FQDN of private domain if on cluster internal LB frontend

##### AKS traffic classification

- For pod-pod: No addr translation happens; difference lies on VFP rules hit.
- All pod egress -> external can be treated as iptables SNAT+normal VM egress. **Exception** egress to same vnet under AzureCNI: no SNAT.
- For different ext egress destination, the difference lies in both VFP rules hit and VFP pkt encapsulation.
- As incoming traffic all goes through either internal or public LB of the cluster, related troubleshooting can follow normal steps on any Azure LB.

##### AKS and Prometheus

- "scraping targets" is a prom specific term. It refers to prometheus metric endpoints configured in prometheus server yaml.

##### Workflow of Disk CSI Driver

- In AKS, "csi folder" on a node means this path under OS filesystem: /var/lib/kubelet/plugins/kubernetes.io/csi/disk.csi.azure.com

---

## Scenario 14: AKS TCPDump Instructions
> 来源: ado-wiki-aks-tcpdump-instructions.md | 适用: 适用范围未明确

### 排查步骤

#### AKS TCPDump Instructions

#### Overview

When we have networking issues, getting network traces are often required. There are two ways to take network traces and these instructions apply to both ACS And AKS.

#### TCPDump from node

The first is to connect to the node (Azure VM) and take trace there. This will capture traces on the VM and all pods running on the VM and is typically the preferred method for obtaining network traces for AKS networking issues.

To capture a TCPDump from the ACS/AKS nodes, first to get traces from the node, you need to follow the steps in this link to get SSH access to the node: <https://docs.microsoft.com/en-us/azure/aks/ssh>

Once you are connected to the node, then you can do the following to get the network trace: `apt-get update && apt-get install tcpdump`

Then you can run tcpdump using this command: `tcpdump -s 0 -vvv -w /path/nameofthecapture.cap` or `tcpdump -ni eth0 -w ethcap-%H.pcap -e -C 200 -G 3600 -K`

This will instruct customer to press ctrl+c to stop the TCPDump capture.

Once the trace files have been created, have customer copy them to the workspace (DTM). To do so, we first need to get the traces off the cluster and onto the customer's machine. The steps below outline how to do this.

1. Exit the SSH connection to the node from the helper pod.
2. From the helper pod run: `scp -i id_rsa azureuser@10.240.0.4:/home/azureuser/ethcap-20.pcap .`
3. The packet capture should now be on the helper pod, confirm by running `ls`.
4. Exit the helper pod. You should now be back on the development machine.
5. Run `kubectl cp aks-ssh-66cf68f4c7-vwgvg:/ethcap-20.pcap .`
6. The `.pcap` is now on the customer's laptop an can be uploaded to the DTM workspace.

> NOTE: If customer is using ACS and the node is a Windows VM, then in order to get a network trace, you should run the following from an elevated cmd prompt:

1. `netsh trace start capture=yes tracefile=c:\AKS_node_name.etl`
2. Reproduce the issue.
3. Run the following command on both servers to stop the trace once the issue has been reproduced: `netsh trace stop`
4. This will generate two files a cab and an etl. These can simply be copied using drag and drop through the RDP session.
5. Need to open .etl file on Microsoft Message Analyzer
6. If you want to analyse it on Wireshark, choose Save as and Export to .cap

#### TCPDump from Node using Node-Shell

For Node-Shell installation/setup go here - <https://github.com/kvaps/kubectl-node-shell>

1. Once installed connect into the node with `kubectl node-shell <nodeName>`.
2. At the node prompt start the capture with `tcpdump -s 0 -vvv -w /tcpdump/testcapture.pcap` and reproduce the issue.
3. Use CTRL+c to end the capture, don't exit the node yet.

#### Copying the pcap off of the node

1. Open a second terminal connected to the cluster and get the pods (the pod name always starts with "nsenter").
2. Copy the file from the node/helper pod to the local machine: `kubectl cp nsenter-azqnbr:/tcpdump/testcapture.pcap /mnt/c/aks/testcapture.pcap`
3. Now you can go back to the other terminal that is connected into the node and exit.
4. The customer can now upload the file to DTM for analysis.

#### TCPDump from pod

1. First, connect to the pod and spawn a bash shell (Linux): `kubectl exec -it POD_NAME /bin/bash`
2. Once connected to the pod, you can run the following to install tcpdump: `apt-get update && apt-get install tcpdump`
3. Then you can run tcpdump using this command: `tcpdump -s 0 -vvv -w /path/nameofthecapture.cap`
4. You can then use this command to copy it out, even to Windows: `kubectl cp [namespace]/[pod_name]:/path/nameofthecapture.cap /path/destination_folder`

> **NOTE**: If using Windows and you want to copy to the user profile folder, path would look like `/users/username`. The file then exists inside the "username" folder (do not use "c:" as the first "/" implies the root of C:\)

#### Node Packet Capture - all nodes at once

Use the DaemonSet script here to capture tcpdump on all nodes at once: <https://github.com/tdihp/dspcap>

#### Analyzing the Packet Captures

##### Option 1 - Consult Azure Networking Pod

Create a collaboration task to Azure Networking Pod for assistance. Provide the source IP (Pod IP) and the destination IP & Port.

##### Option 2 - Analyze the traces yourself

You can use Wireshark, Network Monitor 3.4 or Message Analyzer.

**Network Monitor filter examples:**
- Find traffic containing an IP: `ipv4.address==192.168.0.4`
- Find traffic using a specific port: `tcp.port==443`
- Find traffic with IP and port: `ipv4.address==192.168.0.4 and tcp.port==443`
- Filter on ephemeral port for specific TCP conversation: `tcp.port==52453`

#### More Information

- [TCP Troubleshooting](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/301277/TCP-Troubleshooting)
- [Wireshark primer](https://www.instructables.com/id/Wireshark-primer/)

---

## Scenario 15: Tracking Rollout Progress of a Fix in AKS
> 来源: ado-wiki-aks-track-fix-rollout-progress.md | 适用: 适用范围未明确

### 排查步骤

#### Tracking Rollout Progress of a Fix in AKS

#### How to track the progress of a Fix ?

For those who are working on cases where the issue is caused by a bug and for which the customer is waiting for a Fix, I'm sure you've been asked for an "ETA" (Estimated Time of Arrival) on that Fix.

It's never easy to know when a Fix (or even a feature) will be deployed in Azure regions, so this TSG is made to simplify things and try to get this ETA.

But before diving into it, please keep in mind that we can never promise on an exact ETA. bug fixes are like all releases, and they are subject to changes. Our Engineering Teams are developing the fixes and testing them, so it can happen that a Fix is causing a new bug or unexpected behavior, or a breaking change, or something not wanted. In that case, they might have to cancel the rollout of the Fix and delay it, to make further tests & analysis.

So when giving an ETA to a customer, please always tell them that this is tentative date is given as an indication and can never be a committed date from Microsoft. You can ask your TA or an EEE if you need more details.

#### Step 1 - get the bug reference

If you're here, that means you're working on a case with a bug. First thing is to get the bug reference. This will usually come from your TA, or an EEE, or you'll find the bug reference in a known issue or an emerging one - or even in that wiki.

For AKS, the bug reference will usually be stored in the **Azure DevOps / MSAzure / CloudNativeCompute** database.

eg. _[Bug 9927172](https://msazure.visualstudio.com/CloudNativeCompute/_workitems/edit/9927172): Cloud provider should not change VMSS capacity on updates to network._

#### Step 2 - Get the PR details

Now that we have the bug details, the next step is to find which PR (_Pull Request = code change_) includes the Fix.

Usually our AKS developers will include a list of links to their development work in the right hand side of the bug item. This includes the list of builds including it, but also the Pull Request.

So clicking on the link of the PR will bring you to the details of it. Here, you can see the code changes brought by the developers, on all the files, and you can also check the validations from the bots, and the comments from the other developers to validate the changes.

The important part in the PR here is the Pull Request ID.

#### Step 3 - Find the Release containing the Fix

Take the Pull Request ID and search for it directly in the Teams application. Right now, the AKS PG is using Teams to discuss about their releases, and that's how they track the PRs included in them.

Search in Teams channel: **Azure Container Compute / AKS Overlay** and **AKS Overlay Release Manager**

From the release thread, find the links to the Pipelines Releases.

#### Step 4 - Check the progress in the Pipelines Releases

The Fix is included in an Official Release which typically includes multiple component releases (e.g. RPHCP, OverlayManager, CX Underlay).

Click on each component release to check the progression in different regions.

**Important notes:**
- Sometimes a release may be canceled and replaced with a new one
- "Canary" or "EUAP" refers to test regions (usually EastUSEUAP)
- It usually takes a few days to be deployed WorldWide after hitting Canary regions

**Quick ETA estimation:** ~10 days from the Sunday after the fix was made.
- If the bug was resolved on May 25th → release starts next Sunday (May 30th) → all regions ~June 10th
- These dates are tentative and given as an indication only

#### Extra Step - Check the progress directly in ASI

Azure Service Insights (ASI) tool can retrieve a bug's details and track deployment containing its Fix.

Enter the Bug reference / Work Item ID at: https://azureserviceinsights.trafficmanager.net

#### Owner and Contributors

**Owner:** axelg <axelg@microsoft.com>
**Contributors:** axelg, Naomi Priola

---

## Scenario 16: Troubleshooting Flow
> 来源: ado-wiki-b-AKS-Remediator.md | 适用: 适用范围未明确

### 排查步骤

There's a Kusto table for AKS Remediator events:

```txt
cluster('Aks').database('AKSprod').RemediatorEvent
| where PreciseTimeStamp >= datetime(2020-04-13 01:30:00) and PreciseTimeStamp <= datetime(2020-04-17 11:00:59)
| where subscriptionID == "{SubID}"
//| where msg contains "begin"
| project PreciseTimeStamp, reason, msg, ccpNamespace
```

And we'll usually search for the keyword `begin`, which shows where the remediation is starting.

The next rows will tell us what kind of remediation - eg. below is a Docker Restart because of CustomerLinuxNodesNotReady.

```log
Beginning remediation on 5e961bb831e376000112bd9b due to CustomerLinuxNodesNotReady
Remediation complete
Restarting docker on vm {true  0 aks-nodepool1-55514301-vmss} on 5e961bb831e376000112bd9b
Restarted docker on vm {true  0 aks-nodepool1-55514301-vmss} on 5e961bb831e376000112bd9b
Restarting docker on vm {true  1 aks-nodepool1-55514301-vmss} on 5e961bb831e376000112bd9b
Restarted docker on vm {true  1 aks-nodepool1-55514301-vmss} on 5e961bb831e376000112bd9b
Remediation for CustomerLinuxNodesNotReady on 5e961bb831e376000112bd9b completed
```

In addition to the above AKS RemediatorEvent Table, one can also see the Control Plane Remediator logs using following table.

```txt
cluster('Aks').database('AKSprod').CPRemediatorLogs
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate})) //datetime format YYYY-MM-DD HH:MM:ss
//| where PreciseTimeStamp >= ago(2d)
| where namespace =="{ccpNamespace}"
```

"Restarting docker" is the 1st remediation for NodesNotReady.

Then it'll try to soft reboot the nodes. eg:

```log
Beginning remediation on 5e961bb831e376000112bd9b due to CustomerLinuxNodesNotReady
Remediation complete
Attempting soft reboot of vm {true  0 aks-nodepool1-55514301-vmss} on 5e961bb831e376000112bd9b
```

Note that if you see something like below, it doesn't mean that the remediation failed. It simply means that _not enough time_ has spent since the last remediation. Sometimes Remediator is waiting for 10min, or 6 hours before attempting something else.

```log
Remediation failed: remediation (CustomerLinuxNodesNotReady) for cluster (5e961bb831e376000112bd9b) has run too recently
```

##### Documentation

Here's the link to the [Product Group wiki on the AKS Remediator steps](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/personalplayground/545806/Remediator-Steps)

And here's [AKS Remediator Source Code](https://msazure.visualstudio.com/CloudNativeCompute/_git/aks-monitoring?path=%2Fremediator%2Fhttp.go&version=GBmaster&_a=contents), which explains the different remediations, like **restartDockerOnNode**, **restartNotReadyNodes**... and the amount of time it requires.

Also this is the public documentations:

* <https://docs.microsoft.com/en-us/azure/aks/support-policies#aks-support-coverage-for-worker-nodes>
* <https://docs.microsoft.com/en-us/azure/aks/node-auto-repair>

Point of contact: <axelg@microsoft.com>

---

## Scenario 17: End-to-End AKS Cluster Provisioning and Deep-Dive Tracing
> 来源: ado-wiki-b-E2E-AKS-Cluster-Provisioning-Tracing.md | 适用: 适用范围未明确

### 排查步骤

#### End-to-End AKS Cluster Provisioning and Deep-Dive Tracing


#### Introduction

> This wiki provides a focused walkthrough of AKS cluster creation tracing, highlighting how to follow operations across Azure Resource Manager (ARM) and Resource Providers. It combines practical session steps and architectural diagrams [EE - ARM.vsdx](https://microsofteur-my.sharepoint.com/:u:/g/personal/mhedhbisaber_microsoft_com/IQC3MPMwUp6uT4UpJRfxtUR4AVdwiM9dEsy9kF5okKJDy8s?e=19kfwb) to help you quickly understand, audit, and troubleshoot the AKS provisioning process.
> I began by creating a new AKS cluster using the following command:

```text
> az aks create
  --resource-group myResourceGroup \
  --name myAKSCluster \
  --node-count 2 \
  --generate-ssh-keys
```

> Now, let's trace the AKS creation step by step:

#### Part I: ARM (Azure Resource Manager)

##### Introduction

> ARM serves as _Azure\'s unified control plane_, _required for all Azure services_ . It provides a single endpoint for customers to perform **CRUD** (create, retrieve, update, and delete) operations consistently _across any Azure service or resource type._

##### 1. HttpIncomingRequests

> This Table will have call logs which **came into ARM**.

```text
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where PreciseTimeStamp > ago(1d)
| where subscriptionId == "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where targetUri contains "/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster"
| where httpMethod notcontains "GET"
| where commandName contains "aks create" // For Tracing AKS creation operation for example
| project PreciseTimeStamp, operationName, httpMethod, httpStatusCode, correlationId, serviceRequestId, clientApplicationId, commandName, parameterSetName, userAgent, principalOid, targetUri, failureCause, subscriptionId, clientSessionId
```

<table>
<colgroup>
<col style="width: 4%" />
<col style="width: 11%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 5%" />
<col style="width: 5%" />
<col style="width: 5%" />
<col style="width: 3%" />
<col style="width: 7%" />
<col style="width: 12%" />
<col style="width: 5%" />
<col style="width: 18%" />
<col style="width: 3%" />
<col style="width: 5%" />
<col style="width: 3%" />
</colgroup>
<thead>
<tr>
<th>PreciseTimeSta mp</th>
<th style="text-align: left;"><blockquote>
<p>operationName</p>
</blockquote></th>
<th>httpMetho d</th>
<th>httpStatusC ode</th>
<th>correlationId</th>
<th>serviceRequestId</th>
<th><blockquote>
<p>clientApplicationI d</p>
</blockquote></th>
<th style="text-align: center;"><blockquote>
<p>commandN ame</p>
</blockquote></th>
<th><blockquote>
<p>parameterSetName</p>
</blockquote></th>
<th><blockquote>
<p>userAgent</p>
</blockquote></th>
<th><blockquote>
<p>principalOid</p>
</blockquote></th>
<th><blockquote>
<p>targetUri</p>
</blockquote></th>
<th><blockquote>
<p>failureCau se</p>
</blockquote></th>
<th><blockquote>
<p>subscriptionId</p>
</blockquote></th>
<th><blockquote>
<p>clientSessi onId</p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T11:</p>
<p>52:51.2474709Z</p></td>
<td style="text-align: left;"><blockquote>
<p><strong><mark>PUT</mark></strong>/SUBSCRIPTIONS/RESOURCEGROU
PS/PROVIDERS/MICROSOFT.CONTAINE RSERVICE/MANAGEDCLUSTERS/</p>
</blockquote></td>
<td>PUT</td>
<td>-1</td>
<td><p>17818e60-7ddc-4 c69-</p>
<p>b5de-03c27724da 9d</p></td>
<td></td>
<td></td>
<td style="text-align: center;">aks create</td>
<td><blockquote>
<p>--resource-group -- name --node-count -- generate-ssh-keys</p>
</blockquote></td>
<td><blockquote>
<p>AZURECLI/2.79.0 (RPM) azsdk-python- core/1.35.0 Python/3.12.9
(Linux-6.1.91.1- microsoft-standard-x86_64-with-glibc2.38)
cloud-shell/1.0</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p><a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>https://management.azure.com:443/subscriptions/28abb06e-</u></a>
<a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>c75e-47f2-ba8d-</u></a>
<a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Mic</u></a>
<a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>rosoft.ContainerService/managedClusters/myAKSCluster?api-</u></a></p>
<p><a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>version=2025-08-01</u></a></p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>28abb06e-</p>
<p>c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
<td></td>
</tr>
<tr>
<td><p>2025-11-28T11:</p>
<p>52:59.1749254Z</p></td>
<td style="text-align: left;"><blockquote>
<p><strong>PUT</strong>/SUBSCRIPTIONS/RESOURCEGROU
PS/PROVIDERS/MICROSOFT.CONTAINE RSERVICE/MANAGEDCLUSTERS/</p>
</blockquote></td>
<td>PUT</td>
<td>201</td>
<td><p>17818e60-7ddc-4 c69-</p>
<p><mark>b5de-03c27724da</mark> 9d</p></td>
<td><p>6df685b8-5985-4a</p>
<p>36-8a00-7233bda</p>
<p>89377</p></td>
<td><blockquote>
<p>b677c290-</p>
<p>cf4b-4a8e-</p>
<p>a60e-91ba650a4a be</p>
</blockquote></td>
<td style="text-align: center;"><strong>aks create</strong></td>
<td><blockquote>
<p><strong>--resource-group -- name --node-count --
<mark>generate-ssh-keys</mark></strong></p>
</blockquote></td>
<td><blockquote>
<p><strong>AZURECLI</strong>/2.79.0 (RPM) azsdk-python- core/1.35.0
Python/3.12.9 (Linux-6.1.91.1- microsoft-standard-x86_64-with-glibc2.38)
cloud-shell/1.0</p>
</blockquote></td>
<td><blockquote>
<p>21dfbf8c- a408-491c-</p>
<p>bc3d-6d8b88cb61 69</p>
</blockquote></td>
<td><blockquote>
<p><a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>https://management.azure.com:443/subscriptions/28abb06e-</u></a>
<a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>c75e-47f2-ba8d-</u></a>
<a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Mic</u></a>
<a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>rosoft.ContainerService/managedClusters/myAKSCluster?api-</u></a>
<a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>version=2025-08-01</u></a></p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>28abb06e-</p>
<p>c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
<td></td>
</tr>
</tbody>
</table>

> From the Table above:
    - _Operation Name_: PUT /SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.CONTAINERSERVICE/MANAGEDCLUSTERS/
    - _Command Executed_: aks create --resource-group --name --node-count --generate-ssh-keys
    - _User Agent_: AZURECLI/2.79.0  The operation was triggered via Azure CLI.
    - _Target URI_: Points to the managed cluster resource in Azure.
    - _Correlation Id_: is the correlation ID for the cluster creation operation (correlationId = 17818e60-7ddc-4c69-b5de-03c27724da9d)
>
> Now, let's see who created the cluster and which tools were used based on the Claims column information. To do, we will use the **EventServiceEntries** Table.

##### 2. EventServiceEntries

> This Table will have Activity logs which is **also viewable on portal**.
> Important: **EventServiceEntries** table has a Claims column _that contains the_ username/AppID _from which the operation was performed._
> As mentioned above, we can identify the correlation ID for the cluster creation operation from the HttpIncomingRequests table . The correlation ID for the cluster creation operation is correlationId = 17818e60-7ddc-4c69-b5de-03c27724da9d

```text
macro-expand isfuzzy=true cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').ARMProdEG as X (
    X.database('Requests').EventServiceEntries
 | where correlationId == "17818e60-7ddc-4c69-b5de-03c27724da9d"
    | where PreciseTimeStamp > ago(1d)
    | where operationName == "Microsoft.ContainerService/managedClusters/write"
| where resourceProvider == "Microsoft.ContainerService"
| extend SourceRun = case
                    (
                        applicationId == "c44b4083-3bb0-49c1-b47d-974e53cbdf3c",
                        "Azure Portal",
                        applicationId == "04b07795-8ddb-461a-bbee-02f9e1bf7b46",
                        "Azure CLI",
                        applicationId == "1950a258-227b-4e31-a9cf-717495945fc2",
                        "Azure PowerShell",
                        applicationId == "7f59a773-2eaf-429c-a059-50fc5bb28b44",
                        "Microsoft docs",
                        applicationId == "0c1307d4-29d6-4389-a11c-5cbe7f65d7fa",
                        "Azure Mobile APP",
                        applicationId == "b677c290-cf4b-4a8e-a60e-91ba650a4abe",
                        "Cloud Shell in Azure Portal",
                        applicationId == "b1395854-dccf-4fe6-9186-655f101f919b",
                        "shell.azure.com",
                        applicationId == "7319c514-987d-4e9b-ac3d-d38c4f427f4c",
                        "AKS RP APP",
                        applicationId == "aebc6443-996d-45c2-90f0-388ff96faa56",
                        "VS Code",
                        applicationId == "61d65f5a-6e3b-468b-af73-a033f5098c5c",
                        "Azure Java Tools",
                        applicationId == "Windows Admin Center(WAC)",
                        "3aa85724-c5ce-42f5-b7f9-36b5a387b7b4",
                        applicationId == "245e1dee-74ef-4257-a8c8-8208296e1dfd",
                        "Cloud Shell in Windows Terminal",
                        "Client application or others"
                    )
| project
   PreciseTimeStamp,
   operationName,
   resourceProvider,
   correlationId,
   status,
   subStatus,
   resourceUri,
   eventName,
   operationId,
   armServiceRequestId,
   subscriptionId,
   applicationId,
   SourceRun,
   claims
| sort by PreciseTimeStamp desc nulls last
)
| where status == "Accepted"
| where subStatus == "Created"
| extend claims = parse_json(claims)
| extend creatorName = claims.name
| project correlationId, SourceRun, creatorName, PreciseTimeStamp
```

  <table>
  <colgroup>
  <col style="width: 6%" />
  <col style="width: 6%" />
  <col style="width: 4%" />
  <col style="width: 29%" />
  <col style="width: 8%" />
  <col style="width: 8%" />
  <col style="width: 3%" />
  <col style="width: 4%" />
  <col style="width: 5%" />
  <col style="width: 22%" />
  </colgroup>
  <thead>
  <tr>
  <th>PreciseTimeStamp</th>
  <th>operationName</th>
  <th>suboperationName</th>
  <th>targetURI</th>
  <th>correlationID</th>
  <th>operationID</th>
  <th>region</th>
  <th>msg</th>
  <th>durationInMilliseconds</th>
  <th>userAgent</th>
  </tr>
  </thead>
  <tbody>
  <tr>
  <td>2025-11-28T11:52:59.0868319Z</td>
  <td>Cloud Shell in Azure Portal</td>
  <td>None</td>
  <td>N/A</td>
  <td>17818e60-7ddc-4c69-b5de-03c27724da9d</td>
  <td>N/A</td>
  <td>N/A</td>
  <td>Saber MHEDHBI</td>
  <td>N/A</td>
  <td>N/A</td>
  </tr>
  </tbody>
  </table>

> To determine who performed an operation within a customer\'s subscription, please refer to the  TSG _Who-Performed-Operation_Tool_
>
> NB: _When everything works fine, the content of Incoming (_HttpIncomingRequests_) and Outgoing (_HttpOutgoingRequests_) tables **should be equal.** If instead an operation is only seen in Incoming requests, it means that it wasn\'t processed further by the ARM frontend_
>

##### 3. HttpOutgoingRequests

> HttpOutgoingRequests Table will have call logs which **go out of ARM to RPs**.

```text
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpOutgoingRequests")
| where PreciseTimeStamp > ago(1d)
| where subscriptionId == "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where targetUri contains "/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster"
| where operationName == "PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.CONTAINERSERVICE/MANAGEDCLUSTERS/"
| where correlationId == "17818e60-7ddc-4c69-b5de-03c27724da9d"
| project PreciseTimeStamp, operationName, httpMethod, httpStatusCode, correlationId, serviceRequestId, clientApplicationId, principalOid, targetUri, failureCause, subscriptionId, clientSessionId
| sort by PreciseTimeStamp asc
```

  <table>
  <colgroup>
  <col style="width: 5%" />
  <col style="width: 14%" />
  <col style="width: 3%" />
  <col style="width: 3%" />
  <col style="width: 7%" />
  <col style="width: 7%" />
  <col style="width: 6%" />
  <col style="width: 6%" />
  <col style="width: 29%" />
  <col style="width: 3%" />
  <col style="width: 6%" />
  <col style="width: 3%" />
  </colgroup>
  <thead>
  <tr>
  <th>PreciseTimeStamp</th>
  <th><blockquote>
  <p>operationName</p>
  </blockquote></th>
  <th><blockquote>
  <p>httpMetho d</p>
  </blockquote></th>
  <th><blockquote>
  <p>httpStatusC ode</p>
  </blockquote></th>
  <th><blockquote>
  <p>correlationId</p>
  </blockquote></th>
  <th><blockquote>
  <p><strong><mark>serviceRequestId</mark></strong></p>
  </blockquote></th>
  <th><blockquote>
  <p>clientApplicationId</p>
  </blockquote></th>
  <th>principalOid</th>
  <th>targetUri</th>
  <th>failureCaus e</th>
  <th>subscriptionId</th>
  <th>clientSessio nId</th>
  </tr>
  </thead>
  <tbody>
  <tr>
  <td><p>2025-11-28T11:52:</p>
  <p>52.7329156Z</p></td>
  <td><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL</p>
  <p>USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>-1</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td></td>
  <td><blockquote>
  <p>b677c290-cf4b-4a8e- a60e-91ba650a4abe</p>
  </blockquote></td>
  <td>21dfbf8c-a408-491c- bc3d-6d8b88cb6169</td>
  <td><p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <u><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01">bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClust</a>e</u></p>
  <p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>rs/myAKSCluster?api-version=2025-08-01</u></a></p></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T11:52:</p>
  <p>58.9867455Z</p></td>
  <td><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL</p>
  <p>USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>201</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td><blockquote>
  <p><strong>6df685b8-5985-4a36-8 a00-7233bda89377</strong></p>
  </blockquote></td>
  <td><blockquote>
  <p>b677c290-cf4b-4a8e- a60e-91ba650a4abe</p>
  </blockquote></td>
  <td>21dfbf8c-a408-491c- bc3d-6d8b88cb6169</td>
  <td><p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedCluste</u></a></p>
  <p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>rs/myAKSCluster?api-version=2025-08-01</u></a></p></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:03:</p>
  <p>47.5926165Z</p></td>
  <td style="text-align: left;"><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>-1</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td></td>
  <td><blockquote>
  <p>6c1361c1-056d-42f7-</p>
  <p>a303-0cf8cfa8960e</p>
  </blockquote></td>
  <td><p>4561fa45-58c8-4f19-9c</p>
  <p>04-ee509c6733b5</p></td>
  <td><a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedCluster</u></a>
  <a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>s/myAKSCluster?api-version=2021-07-01</u></a></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:03:</p>
  <p>47.7935831Z</p></td>
  <td><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL</p>
  <p>USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>-1</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td></td>
  <td><blockquote>
  <p>6c1361c1-056d-42f7-</p>
  <p>a303-0cf8cfa8960e</p>
  </blockquote></td>
  <td><p>4561fa45-58c8-4f19-9c</p>
  <p>04-ee509c6733b5</p></td>
  <td><p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedCluster</u></a></p>
  <p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>s/myAKSCluster?api-version=2021-07-01</u></a></p></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:03:</p>
  <p>52.9883516Z</p></td>
  <td style="text-align: left;"><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>200</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td><blockquote>
  <p>f4223b6e-aed3-4e60- be72-dadd45637c6e</p>
  </blockquote></td>
  <td><blockquote>
  <p>6c1361c1-056d-42f7-</p>
  <p>a303-0cf8cfa8960e</p>
  </blockquote></td>
  <td><p>4561fa45-58c8-4f19-9c</p>
  <p>04-ee509c6733b5</p></td>
  <td><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedCluste</u></a>r
  <a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>s/myAKSCluster?api-version=2021-07-01</u></a></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:03:</p>
  <p>53.0808420Z</p></td>
  <td><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL</p>
  <p>USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>200</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td><blockquote>
  <p>f4223b6e-aed3-4e60- be72-dadd45637c6e</p>
  </blockquote></td>
  <td><blockquote>
  <p>6c1361c1-056d-42f7-</p>
  <p>a303-0cf8cfa8960e</p>
  </blockquote></td>
  <td><p>4561fa45-58c8-4f19-9c</p>
  <p>04-ee509c6733b5</p></td>
  <td><p><a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedCluster</u></a></p>
  <p><a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>s/myAKSCluster?api-version=2021-07-01</u></a></p></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:35:</p>
  <p>05.5130158Z</p></td>
  <td><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL</p>
  <p>USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>-1</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td></td>
  <td><blockquote>
  <p>42f6d500-765e-4259-</p>
  <p>baf0-5e5b4a22f26d</p>
  </blockquote></td>
  <td>8ca9b6bc-05cf-4f3a- abe2-b9b987092eec</td>
  <td><p><a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedCluste</u></a>r</p>
  <p><a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>s/myAKSCluster?api-version=2022-06-01</u></a></p></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:35:</p>
  <p>05.7526374Z</p></td>
  <td><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL</p>
  <p>USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>-1</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td></td>
  <td><blockquote>
  <p>42f6d500-765e-4259-</p>
  <p>baf0-5e5b4a22f26d</p>
  </blockquote></td>
  <td>8ca9b6bc-05cf-4f3a- abe2-b9b987092eec</td>
  <td><p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedCluste</u></a>r</p>
  <p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>s/myAKSCluster?api-version=2022-06-01</u></a></p></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:35:</p>
  <p>10.4262703Z</p></td>
  <td style="text-align: left;"><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>200</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td><blockquote>
  <p>1b4df55e-8791-4451-9b</p>
  <p>63-63e7b3549547</p>
  </blockquote></td>
  <td><blockquote>
  <p>42f6d500-765e-4259-</p>
  <p>baf0-5e5b4a22f26d</p>
  </blockquote></td>
  <td>8ca9b6bc-05cf-4f3a- abe2-b9b987092eec</td>
  <td><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedCluste</u></a>r
  <a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>s/myAKSCluster?api-version=2022-06-01</u></a></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:35:</p>
  <p>10.5543741Z</p></td>
  <td><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL</p>
  <p>USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>200</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td><blockquote>
  <p>1b4df55e-8791-4451-9b</p>
  <p>63-63e7b3549547</p>
  </blockquote></td>
  <td><blockquote>
  <p>42f6d500-765e-4259-</p>
  <p>baf0-5e5b4a22f26d</p>
  </blockquote></td>
  <td>8ca9b6bc-05cf-4f3a- abe2-b9b987092eec</td>
  <td><p><a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedCluste</u></a>r</p>
  <p><a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>s/myAKSCluster?api-version=2022-06-01</u></a></p></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  </tbody>
  </table>

Important:
**ServiceRequestId** is the ID that RP\'s send back to ARM after accepting the request. _\[serviceRequestId = 6df685b8-5985-4a36-8a00-7233bda89377\]_

#### Part II: AKS RP

##### Introduction

> AKS RP stands for **Azure Kubernetes Service Resource Provider**. It is the **service component registered with Azure Resource Manager (ARM)** that handles all API requests for AKS clusters operations CRUD.
> **The AKS RP uses the namespace Microsoft.ContainerService in ARM.**
>
> The RP exposes a **REST API contract** that defines operations like Create, Read, Update, and Delete (CRUD) for AKS clusters. These operations are documented in the Azure REST API specs.
>
> **Cluster Lifecycle Management**:
>
> - Validates client requests.
> - Persists the desired state of the cluster in its database.
> - Orchestrates asynchronous operations to bring Azure resources (VMs, networking, storage) into the desired state.
> - Manages control plane resources through components like the OverlayManager.
>
>
> Before we start, please note the key difference between Correlation ID and Operation ID:
>
> - **Correlation ID**: Groups multiple related operations under one logical transaction for observability.
> - **Operation ID**: Tracks a single operation instance for status and lifecycle management.
>
> **Important**: _ServiceRequestId_ in the ARM HttpOutgoingRequests table **equals** _OperationID_ in AKS RP QoS tables (FrontEndQoSEvents, AsyncQoSEvents) **equals** _OperationID_ in AKS RP Verbose tables (FrontEndContextActivity, AsyncContextActivity)

##### 1. IncomingRequestTrace

> This table contains summary of calls that come into **AKS RP from ARM**.

```text
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpOutgoingRequests")
| where PreciseTimeStamp > ago(1d)
| where subscriptionId == "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where targetUri contains "/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster"
| where operationName == "PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.CONTAINERSERVICE/MANAGEDCLUSTERS/"
| where correlationId == "17818e60-7ddc-4c69-b5de-03c27724da9d"
| project PreciseTimeStamp, operationName, httpMethod, httpStatusCode, correlationId, serviceRequestId, clientApplicationId, principalOid, targetUri, failureCause, subscriptionId, clientSessionId
| sort by PreciseTimeStamp asc
```

<table>
<colgroup>
<col style="width: 6%" />
<col style="width: 6%" />
<col style="width: 4%" />
<col style="width: 29%" />
<col style="width: 8%" />
<col style="width: 8%" />
<col style="width: 3%" />
<col style="width: 4%" />
<col style="width: 5%" />
<col style="width: 22%" />
</colgroup>
<thead>
<tr>
<th>PreciseTimeStamp</th>
<th>operationName</th>
<th>suboperationN ame</th>
<th>targetURI</th>
<th>correlationID</th>
<th>operationID</th>
<th>region</th>
<th>msg</th>
<th>durationInMillise conds</th>
<th>userAgent</th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T11:52:52.</p>
<p>7393534Z</p></td>
<td>PutManagedClusterH andler.PUT</td>
<td>None</td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters</p>
<p>/myAKSCluster?api-version=2025-08-01</p></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>6df685b8-5985-4a36-8a00-</p>
<p>7233bda89377</p></td>
<td>francecentr al</td>
<td>RPHttpRequest Start</td>
<td>na</td>
<td><p>AZURECLI/2.79.0 (RPM) azsdk-python-core/1.35.0 Python/3.12.9</p>
<p>(Linux-6.1.91.1-microsoft-standard-x86_64-with-glibc2.38)
cloud-shell/1.0</p></td>
</tr>
<tr>
<td><p>2025-11-28T11:52:52.</p>
<p>7393534Z</p></td>
<td>PutManagedClusterH andler.PUT</td>
<td>None</td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters</p>
<p>/myAKSCluster?api-version=2025-08-01</p></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>6df685b8-5985-4a36-8a00-</p>
<p>7233bda89377</p></td>
<td>francecentr al</td>
<td>RPHttpRequest Start</td>
<td>na</td>
<td><p>AZURECLI/2.79.0 (RPM) azsdk-python-core/1.35.0 Python/3.12.9</p>
<p>(Linux-6.1.91.1-microsoft-standard-x86_64-with-glibc2.38)
cloud-shell/1.0</p></td>
</tr>
<tr>
<td><p>2025-11-28T11:52:58.</p>
<p>9852284Z</p></td>
<td>PutManagedClusterH andler.PUT</td>
<td>None</td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters</p>
<p>/myAKSCluster?api-version=2025-08-01</p></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>6df685b8-5985-4a36-8a00-</p>
<p>7233bda89377</p></td>
<td>francecentr al</td>
<td>RPHttpRequest End</td>
<td>6245</td>
<td><p>AZURECLI/2.79.0 (RPM) azsdk-python-core/1.35.0 Python/3.12.9</p>
<p>(Linux-6.1.91.1-microsoft-standard-x86_64-with-glibc2.38)
cloud-shell/1.0</p></td>
</tr>
<tr>
<td><p>2025-11-28T11:52:58.</p>
<p>9852284Z</p></td>
<td>PutManagedClusterH andler.PUT</td>
<td>None</td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters</p>
<p>/myAKSCluster?api-version=2025-08-01</p></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>6df685b8-5985-4a36-8a00-</p>
<p>7233bda89377</p></td>
<td>francecentr al</td>
<td>RPHttpRequest End</td>
<td>6245</td>
<td><p>AZURECLI/2.79.0 (RPM) azsdk-python-core/1.35.0 Python/3.12.9</p>
<p>(Linux-6.1.91.1-microsoft-standard-x86_64-with-glibc2.38)
cloud-shell/1.0</p></td>
</tr>
</tbody>
</table>

##### 2. FrontEndQoSEvents and FrontEndContextActivity

> These tables have logs related to _Container Service RP_:
>
> FrontEndQoSEvents table - Will have summary of all the operations that reach _Container Service_ code of AKS RP. This is where most the frontend validations takes place.

```text
cluster('akshuba.centralus').database('AKSprod').FrontEndQoSEvents
| where PreciseTimeStamp > ago(5d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where correlationID contains "17818e60-7ddc-4c69-b5de-03c27724da9d"
| where operationName notcontains "GET"
| project PreciseTimeStamp, operationName, suboperationName, correlationID, operationID, agentPoolName, clientPrincipalName, region, errorDetails , resourceName, resourceGroupName, resultCode, userAgent, httpMethod, httpStatus, targetURI, subscriptionID
```
>
<table>
<thead>
<tr>
    <th>operationName</th>
    <th>suboperationName</th>
    <th>correlationID</th>
    <th>operationID</th>
    <th>agentPoolName</th>
    <th>clientPrincipalName</th>
    <th>errorDetails</th>
    <th>resourceName</th>
    <th>resourceGroupName</th>
    <th>resultCode</th>
    <th>userAgent</th>
    <th>httpMethod</th>
    <th>httpStatus</th>
    <th>targetURI</th>
</tr>
</thead>
<tbody>
<tr>
    <td>PutManagedClusterHandler.PUT</td>
    <td>Creating</td>
    <td>17818e60-7ddc-4c69-b5de-03c27724da9d</td>
    <td>6df685b8-5985-4a36-8a00-7233bda89377</td>
    <td></td>
    <td>@microsoft.com</td>
    <td></td>
    <td>myAKSCluster</td>
    <td>myResourceGroup</td>
    <td>Success</td>
    <td>AZURECLI/2.79.0 (RPM) azsdk-python-core/1.35.0 Python/3.12.9 (Linux-6.1.91.1-microsoft-standard-x86_64-with-glibc2.38) cloud-shell/1.0</td>
    <td>PUT</td>
    <td>201</td>
    <td>/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01</td>
</tr>
<tr>
    <td>PutManagedClusterHandler.PUT</td>
    <td>Creating</td>
    <td>17818e60-7ddc-4c69-b5de-03c27724da9d</td>
    <td>6df685b8-5985-4a36-8a00-7233bda89377</td>
    <td></td>
    <td>@microsoft.com</td>
    <td></td>
    <td>myAKSCluster</td>
    <td>myResourceGroup</td>
    <td>Success</td>
    <td>AZURECLI/2.79.0 (RPM) azsdk-python-core/1.35.0 Python/3.12.9 (Linux-6.1.91.1-microsoft-standard-x86_64-with-glibc2.38) cloud-shell/1.0</td>
    <td>PUT</td>
    <td>201</td>
    <td>/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01</td>
</tr>
</tbody>
</table>

> **FrontEndContextActivity** table - Will have **verbose** logs for each operation (OperationID) we see in FrontEndQoSEvents table.
> We will use _OperationID_ from FrontEndQoSEvents table to see all the activity that takes place.

```text
cluster('akshuba.centralus').database('AKSprod').FrontEndContextActivity
| where PreciseTimeStamp > ago(5d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where operationName notcontains "GET"
| extend Message = parse_json(msg)
| where operationID contains "6df685b8-5985-4a36-8a00-7233bda89377"
| project PreciseTimeStamp, level, code=tostring(Message.code), suboperationName, msg, operationName, operationID, correlationID, region, fileName, resourceName, resourceGroupName, subscriptionID
```

> Now, let's focus on the **key log** generated when you run the above Kusto query.

<table style="width:100%;">
<colgroup>
<col style="width: 4%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 52%" />
<col style="width: 4%" />
<col style="width: 4%" />
<col style="width: 4%" />
<col style="width: 3%" />
<col style="width: 5%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 4%" />
</colgroup>
<thead>
<tr>
<th>PreciseTime Stamp</th>
<th>level</th>
<th>code</th>
<th><blockquote>
<p>suboperati onName</p>
</blockquote></th>
<th>msg</th>
<th style="text-align: left;"><blockquote>
<p>operationNa me</p>
</blockquote></th>
<th><blockquote>
<p>operationID</p>
</blockquote></th>
<th><blockquote>
<p>correlationID</p>
</blockquote></th>
<th>region</th>
<th>fileName</th>
<th>resourceN ame</th>
<th>resourceGr oupName</th>
<th>subscriptionI D</th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T</p>
<p>11:52:52.859</p>
<p>9834Z</p></td>
<td>info</td>
<td></td>
<td><blockquote>
<p>None</p>
</blockquote></td>
<td><p><strong>sanitized request body</strong>:
{"location":"francecentral","properties":{"kubernetesVersion":"","dnsPrefix":"myAKSClust-</p>
<p>myResourceGroup-28abb0","agentPoolProfiles":[{"name":"<strong>nodepool1</strong>","count":2,"vmSize":"","type":"VirtualMachineScaleSets","enableAutoScaling":false,"enableNodePublicIP":false,"scaleSetP
riority":"Regular","scaleSetEvictionPolicy":"Delete","spotMaxPrice":-1,"mode":"System","enableEncryptionAtHost":false,"enableUltraSSD":false,"osType":"Linux","upgradeSettings":{},"enableFIPS
":false}],"linuxProfile":{"adminUsername":"azureuser","ssh":{"publicKeys":[{"keyData":"ssh-rsa
AAAAB3NzaC1yc2EAAAADAQABAAABAQCTZP8rTTPVUtTIfc+Rjc5Xt9ZhhcZcCCHtGbA3OJ1eU5K8nS5svQfNeEGkP/AfREw3zAs8BF3A8SZBoUv/CUaNQijlANNC1AZNXUop2d50jDJMZSMpwgA</p>
<p>dwFDQ/0FPYM0fTX0AWdzvidSvwWKFd4bUUkLvVnVtferf2Ui+qZpOPe2DGlehCs6izm1p42DYJVjfLuUrnD/TDsM0JwBynhmAZstr7N3W2jVbXvO5AkhSTFTdFi/f8azZ/mnMoOHWQHND76Y59lqh
dHMNi7hKPk13TT28AnmScnf8eJNMFe3L4SNrBj6MeFMFODhYsnKg/uHq6SwZqQDKwOi207msS8Tp"}]}},"enableRBAC":true,"<strong>networkProfile</strong>":{"loadBalancerSku":"standard","podCidr":"10.244.
0.0/16","serviceCidr":"10.0.0.0/16","dnsServiceIP":"10.0.0.10","outboundType":"loadBalancer"},"disableLocalAccounts":false,"storageProfile":{},"bootstrapProfile":{"artifactSource":"Direct"}},"ide</p>
<p>ntity":{"type":"SystemAssigned"},"sku":{"name":"Base","tier":"Free"}}</p></td>
<td style="text-align: left;"><blockquote>
<p>PutManaged ClusterHandl er.PUT</p>
</blockquote></td>
<td><blockquote>
<p>6df685b8-598</p>
<p>5-4a36-8a00-</p>
<p>7233bda8937</p>
<p>7</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7d</p>
<p>dc-4c69- b5de-03c2772 4da9d</p>
</blockquote></td>
<td>francecent ral</td>
<td>microsoft.com/c ontainerservice/d atamodel/apiloa
der/sanitizer.go</td>
<td>myAKSClu ster</td>
<td>myResourc eGroup</td>
<td>28abb06e- c75e-47f2- ba8d- bcd3aa9e0ff5</td>
</tr>
</tbody>
</table>

> From the screenshot, here's what we can observe about the sanitized request body in AKS RP logs:

**Key Details Visible**:

- Location: francecentral
- Properties included:
- Agent Pool Profiles:
  - Name: nodepool1
  - Count: 2
  - VM Size: VirtualMachineScaleSets
  - Scale settings: enableAutoScaling:false, enableNodePublicIP:false
  - Scale-down policies: scaleSetPriority:Regular,scaleSetEvictionPolicy:Delete
  - OS type: Linux
- Network Profile:
  - loadBalancerSku: \"standard\"
  - podCidr: \"10.244.0.0/16\"
  - serviceCidr: \"10.0.0.0/16\"
  - dnsServiceIP: \"10.0.0.10\"
  - outboundType: \"loadBalancer\"
- Other flags:
  - enableEncryptionAtHost:false
  - enableUltraSSD:false
  - enableIPV6:false
  - enableRBAC:true
  - disableLocalAccounts:false
  - Identity: SystemAssigned
  - SKU: Base, Tier: Free

##### 3. AsyncQoSEvents and AsyncContextActivity

> **AsyncQoSEvents** table - Will have summary of all the operations that reach _Container Service Async_ code of _AKS RP_.

```text
cluster('akshuba.centralus').database('AKSprod').AsyncQoSEvents
| where PreciseTimeStamp > ago(5d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where operationName notcontains "GET"
| where correlationID contains "17818e60-7ddc-4c69-b5de-03c27724da9d"
| extend Count = parse_json(tostring(parse_json(propertiesBag).LinuxAgentsCount))
| project insertionTime, PreciseTimeStamp, correlationID, operationID, Count , operationName, suboperationName, agentPoolName ,result, errorDetails, resultCode, resultSubCode, k8sCurrentVersion, k8sGoalVersion, subscriptionID, resourceGroupName, resourceName, region, pod, UnderlayName, Underlay
```

> **AsyncContextActivity** table - Will have verbose logs for each operation we see in **AsyncQoSEvents** table.
> We will use OperationID from AsyncQoSEvents table to see all the activity that takes place.

```text
cluster('akshuba.centralus').database('AKSprod').AsyncContextActivity
| where PreciseTimeStamp > ago(5d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where operationName notcontains "GET"
| where operationID contains "6df685b8-5985-4a36-8a00-7233bda89377"
| project PreciseTimeStamp, level, msg, namespace, correlationID, operationID
```

> From the _Kusto query output_ , we can see:

- The message has been picked up from the queue.

    <table>
    <thead>
    <tr>
        <th>msg</th>
        <th>namespace</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>created apiTracking from message 6df685b8-5985-4a36-8a00-7233bda89377</td>
        <td>containerservice-async</td>
    </tr>
    <tr>
        <td>created apiTracking from message 6df685b8-5985-4a36-8a00-7233bda89377</td>
        <td>containerservice-async</td>
    </tr>
    <tr>
        <td>got Message with ID: 6df685b8-5985-4a36-8a00-7233bda89377, and dequeue count: 1</td>
        <td>containerservice-async</td>
    </tr>
    <tr>
        <td>got Message with ID: 6df685b8-5985-4a36-8a00-7233bda89377, and dequeue count: 1</td>
        <td>containerservice-async</td>
    </tr>
    <tr>
        <td>servicebusManagedSettlingHandler handling message 6df685b8-5985-4a36-8a00-7233bda89377</td>
        <td>containerservice-async</td>
    </tr>
    <tr>
        <td>servicebusManagedSettlingHandler handling message 6df685b8-5985-4a36-8a00-7233bda89377</td>
        <td>containerservice-async</td>
    </tr>
    </tbody>
    </table>

- The timeout value for the operation is set to 2 hours.

    <table>
    <thead>
    <tr>
        <th>msg</th>
        <th>namespace</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>Start of a PutManagedClusterHandler.PUT operation. Delaying control plane CR reconciliation until underlay is set</td>
        <td>containerservice-async</td>
    </tr>
    <tr>
        <td>Operation Timeout: 2h0m0s</td>
        <td>containerservice-async</td>
    </tr>
    <tr>
        <td>Operation Timeout: 2h0m0s</td>
        <td>containerservice-async</td>
    </tr>
    </tbody>
    </table>

- The managed cluster body and the agent pool body to verify the configuration used in the PUT call.

<table>
  <thead>
    <tr>
      <th>section</th>
      <th>json</th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td>Unversioned Managed Cluster body</td>
      <td>
        { "controlPlaneID":"69298d19806281000116e263",
          "containerService":{
            "id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster",
            "location":"francecentral",
            "name":"myAKSCluster",
            "tags":null,
            "type":"Microsoft.ContainerService/ManagedClusters",
            "properties":{
              "ClusterID":"",
              "powerState":{"code":"Running","lastStateChange":"2025-11-28T11:52:56.299635859Z"},
              "orchestratorProfile":{
                "orchestratorType":"Kubernetes",
                "orchestratorVersion":"1.32.9",
                "kubernetesConfig":{
                  "kubernetesImageBase":"mcr.microsoft.com/oss/kubernetes/",
                  "clusterSubnet":"10.244.0.0/16",
                  "networkPlugin":"azure",
                  "dnsServiceIP":"10.0.0.10",
                  "serviceCidr":"10.0.0.0/16",
                  "useManagedIdentity":true,
                  "userAssignedID":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.ManagedIdentity/userAssignedIdentities/myAKSCluster-agentpool",
                  "useCloudControllerManager":true,
                  "enableRbac":true,
                  "enableSecureKubelet":true,
                  "kubeletConfig":{"--cloud-config":"","--cloud-provider":"external","--feature-gates":"","--rotate-certificates":"true"},
                  "cloudProviderBackoffMode":"",
                  "loadBalancerSku":"standard",
                  "disableLocalAccounts":false,
                  "ipFamilies":["IPv4"],
                  "clusterSubnets":["10.244.0.0/16"],
                  "serviceCIDRs":["10.0.0.0/16"],
                  "networkPluginMode":"overlay"
                },
                "specifiedOrchestratorVersion":"1.32"
              },
              "linuxProfile":{"adminUsername":"azureuser","ssh":{"publicKeys":[{"keyData":"REDACTED"}]},"sshPublicKeyVersion":""},
              "extensionProfiles":null,
              "servicePrincipalProfile":{"clientId":"msi","secret":"REDACTED"},
              "hostedMasterProfile":{
                "fqdn":"myaksclust-myresourcegroup-28abb0-lg0xm6cm.hcp.francecentral.azmk8s.io",
                "publicFQDN":"myaksclust-myresourcegroup-28abb0-lg0xm6cm.hcp.francecentral.azmk8s.io",
                "privateFQDN":"",
                "dnsPrefix":"myAKSClust-myResourceGroup-28abb0",
                "fqdnSubdomain":"",
                "subnet":"",
                "apiServerWhiteListRange":null,
                "ipMasqAgent":true,
                "ipAddress":""
              },
              "addonProfiles":{
                "image-cleaner":{"enabled":true,"config":{"addonv2":"true"}},
                "keda":{"enabled":true,"config":{"addonv2":"true"}},
                "overlay-upgrade-data":{"enabled":true,"config":{"addonv2":"true"}},
                "trustedaccess":{"enabled":true,"config":{"addonv2":"true"}},
                "workload-identity":{"enabled":true,"config":{"addonv2":"true"}}
              },
              "provisioningState":"Creating"
            }
          },
          "CloudProviderProfile":{
            "cloud":"AzurePublicCloud",
            "tenantId":"16b3c013-d300-468d-ac64-7eda0820b6d3",
            "subscriptionId":"28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5",
            "aadClientId":"msi",
            "aadClientSecret":"REDACTED",
            "useManagedIdentityExtension":true,
            "location":"francecentral",
            "vmType":"vmss",
            "loadBalancerSku":"standard",
            "networkResourceTenantId":"16b3c013-d300-468d-ac64-7eda0820b6d3",
            "networkResourceSubscriptionId":"28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
          },
          "createApiVersion":"2025-08-01",
          "provisionInfo":{"provisionError":"","TunnelVersion":"","controlPlaneUnderlay":null,"aksHTTPCustomFeatures":null,"enableAzureDiskFileCSIDriver":"true","enableCloudControllerManager":"true","overrideAddonVersion":null,"enableEno":false,"overrideControlplaneResources":null,"etcdServersOverrides":null},
          "isSSHKeyAutoGenerated":false,
          "nodeResourceGroup":"MC_myResourceGroup_myAKSCluster_francecentral",
          "createdTime":"2025-11-28T11:52:57Z",
          "syncLastUpdatedTime":"2025-11-28T11:52:58Z",
          "asyncLastUpdatedTime":"",
          "MSIProfile":{
            "type":"SystemAssigned",
            "identityUrl":"https://control-francecentral.identity.azure.net/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster/credentials/v2/systemassigned?arpid=5c706ee7-912a-48cf-9b5d-b4453124e034&keyid=12f71d4a-f330-432f-9688-3bb8dacae5e5&said=a137755a-02a9-46eb-aae9-64a395b2c595&sigver=1.0&tid=16b3c013-d300-468d-ac64-7eda0820b6d3&sig=WviHrGbmDy2ujLhYng7RZZ-BSEuSvQql7iuDU1uB5V4",
            "principalId":"b7c7564a-2e58-4a9c-af25-b8725f914d00",
            "tenantId":"16b3c013-d300-468d-ac64-7eda0820b6d3",
            "InputUserAssignedIdentities":null
          },
          "latestOperationID":"6df685b8-5985-4a36-8a00-7233bda89377",
          "LoadBalancerProfile":{"managedOutboundIPs":{"desiredCount":1},"backendPoolType":"nodeIPConfiguration"},
          "_etag":"aca75b4b-2fc6-46be-95a9-a1578e8d32e4",
          "storageAccountProfile":{"storageAccount":"etcdfrancecentral","container":"69298d19806281000116e263"},
          "outboundType":"loadBalancer",
          "sku":{"name":"Basic","tier":"Free"},
          "networkResourceSubscription":{ "ID":"28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5", "State":"Registered", "RegisteredFeatures":[
            {"name":"Microsoft.ContainerService/AutomaticSKUPreview","state":"Registered"},
            {"name":"Microsoft.ContainerService/NetworkIsolatedClusterPreview","state":"Registered"},
            {"name":"Microsoft.ContainerService/StaticEgressGatewayPreview","state":"Registered"}
          ] },
          "autoUpgradeProfile":{"NodeOSUpgradeChannel":4},
          "securityProfile":{"podLinkLocalAccess":{"method":1}},
          "storageProfile":{"diskCSIDriver":{"enabled":true,"version":"v1"},"fileCSIDriver":{"enabled":true},"snapshotController":{"enabled":true}},
          "oidcProfile":{"enabled":false,"id":"00000000-0000-0000-0000-000000000000"},
          "apiServerServiceAccountIssuerFQDN":"myaksclust-myresourcegroup-28abb0-lg0xm6cm.hcp.francecentral.azmk8s.io",
          "encryptionProfile":{"version":"REDACTED","encryptedAESKey":"REDACTED","secretURI":"REDACTED","encryptionTime":{"seconds":1764330778,"nanos":952612317}},
          "azurePortalFQDN":"myaksclust-myresourcegroup-28abb0-lg0xm6cm.portal.hcp.francecentral.azmk8s.io",
          "ccpWebhookProfile":{"autoAssignHostPortsEnabled":true},
          "metricsProfile":{"costAnalysis":{"enabled":false}},
          "secretProperties":"REDACTED",
          "ccpPluginProfiles":{"azure-monitor-metrics-ccp":{"enableV2":true},"gpu-provisioner":{"enableV2":true},"karpenter":{"enableV2":true},"kubelet-serving-csr-approver":{"enableV2":true},"live-patching-controller":{"enableV2":true},"static-egress-controller":{"enableV2":true}},
          "nodeProvisioningProfile":{"mode":"Manual","defaultNodePools":"Auto"},
          "bootstrapProfile":{"artifactSource":"Direct","containerRegistryResourceId":"","byoContainerRegistry":null,"containerRegistryCacheRulePrefix":""},
          "kind":"Base",
          "internalLifeCycleInfo":{"operationName":"PutManagedClusterHandler.PUT","subOperationName":"Creating","operationStartTime":{"seconds":1764330778,"nanos":951807054},"previousOperationID":""},
          "dataBoundaryProfile":{"dataBoundary":"Global"},
          "hostedSystemPoolProfile":{"hobo_subscription_id":"REDACTED","hobo_tenant_id":"REDACTED","hobo_resource_group":"REDACTED","hobo_enabled":false},
          "enableFIPS":false
        }
      </td>
    </tr>
    <tr>
      <td>Unversioned Agent Pool body</td>
      <td>
        { "agentPoolResource":{
            "id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster/agentPools/nodepool1",
            "location":"francecentral",
            "name":"nodepool1",
            "type":"Microsoft.ContainerService/managedClusters/agentPools",
            "properties":{
              "name":"nodepool1",
              "count":2,
              "vmSize":"Standard_D8ds_v5",
              "osDiskSizeGB":300,
              "osType":"Linux",
              "osSku":"Ubuntu",
              "powerState":{"code":"Running","lastStateChange":"2025-11-28T11:52:52.86609573Z"},
              "availabilityProfile":"VirtualMachineScaleSets",
              "storageProfile":"Ephemeral",
              "ipAddressCount":1,
              "distro":"aks-ubuntu-containerd-22.04-gen2",
              "acceleratedNetworkingEnabled":true,
              "kubernetesConfig":{
                "clusterSubnet":"10.244.0.0/16",
                "networkPlugin":"azure",
                "containerRuntime":"containerd",
                "dnsServiceIP":"10.0.0.10",
                "serviceCidr":"10.0.0.0/16",
                "enableRbac":true,
                "enableSecureKubelet":true,
                "kubeletConfig":{
                  "--authentication-token-webhook":"true",
                  "--authorization-mode":"Webhook",
                  "--eviction-hard":"memory.available<100Mi,nodefs.available<10%,nodefs.inodesFree<5%,pid.available<2000",
                  "--image-credential-provider-bin-dir":"/var/lib/kubelet/credential-provider",
                  "--image-credential-provider-config":"/var/lib/kubelet/credential-provider-config.yaml",
                  "--kube-reserved":"cpu=180m,memory=5050Mi,pid=1000",
                  "--max-pods":"250",
                  "--read-only-port":"0",
                  "--rotate-server-certificates":"true",
                  "--serialize-image-pulls":"false"
                }
              },
              "orchestratorVersion":"1.32.9",
              "agentPoolMode":"System",
              "provisioningState":"Creating",
              "securityProfile":{"sshAccess":0,"enableVTPM":false,"enableSecureBoot":false},
              "specifiedOrchestratorVersion":"1.32"
            }
          },
          "syncLastUpdatedTime":"2025-11-28T11:52:58Z",
          "latestOperationId":"6df685b8-5985-4a36-8a00-7233bda89377",
          "upgradeSettings":{"maxSurge":"10%","maxUnavailable":"0"},
          "internalLifeCycleInfo":{"operationName":"PutManagedClusterHandler.PUT","subOperationName":"Creating","operationStartTime":{"seconds":1764330778,"nanos":951807054},"previousOperationID":""}
        }
      </td>
    </tr>
    </tbody>
    </table>

From the log above:

- **From the Managed Cluster body:** we can see details about the cluster configuration, including the network profile, orchestrator settings, identity configurat ion, and enabled add-ons. It also shows the provisioning state and operational context for the cluster.
- **From the Agent Pool body:** we can see information about the node pool configuration, such as compute profile, storage settings, networking configuration , and kubelet parameters. It also includes scaling options, security settings, and operational state for the agent pool.

- The infrastructure resource group \"Create/update\" operation completed successfully

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>Create/Update resource group MC_myResourceGroup_myAKSCluster_francecentral</td></tr>
    <tr><td>Create/Update resource group MC_myResourceGroup_myAKSCluster_francecentral</td></tr>
    <tr><td>CreateOrUpdate resource group /subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral successfully</td></tr>
    <tr><td>CreateOrUpdate resource group /subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral successfully</td></tr>
    </tbody>
    </table>

- Create role assignment succeeded.

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>Create role assignment succeeded.</td></tr>
    <tr><td>Create role assignment succeeded.</td></tr>
    </tbody>
    </table>

- The AKS cluster requires a Standard Load Balancer with one managed outbound IP for egress traffic

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>managedCluster requires SLB with 1 managed outbound IP(s)</td></tr>
    <tr><td>managedCluster requires SLB with 1 managed outbound IP(s)</td></tr>
    <tr><td>Resolved outbound goal for outbound type: loadBalancer. Goal: {"Location":"francecentral",...,"BackendPoolType":"nodeIPConfiguration"}</td></tr>
    <tr><td>Resolved outbound goal for outbound type: loadBalancer. Goal: {"Location":"francecentral",...,"BackendPoolType":"nodeIPConfiguration"}</td></tr>
    </tbody>
    </table>

- Created public ip address

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>EnsureOutboundIPs: Created public ip address "12498857-13b0-4113-806a-c631da6e48da"</td></tr>
    <tr><td>EnsureOutboundIPs: Created public ip address "12498857-13b0-4113-806a-c631da6e48da"</td></tr>
    <tr><td>Successfully ensured 1 public ip address</td></tr>
    <tr><td>Successfully ensured 1 public ip address</td></tr>
    </tbody>
    </table>

- Load Balancer Creation

    <table>
      <thead>
        <tr>
          <th>msg</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            ensureLoadbalancer: Begin to put LB "kubernetes" in resource group "MC_myResourceGroup_myAKSCluster_francecentral" subscription id 28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5
          </td>
        </tr>
        <tr>
          <td>
            ensureLoadbalancer: Begin to put LB "kubernetes" in resource group "MC_myResourceGroup_myAKSCluster_francecentral" subscription id 28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5
          </td>
        </tr>
        <tr>
          <td>
            ensureLoadbalancer: Succeeded in put LB "kubernetes" in        ensureLoadbalancer: Succeeded in put LB "kubernetes" in resource group "MC_myResourceGroup_myAKSCluster_francecentral" subscription id 28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5, result: kubernetes
          </td>
        </tr>
        <tr>
          <td>
            ensureLoadbalancer: Succeeded in put LB "kubernetes" in resource group "MC_myResourceGroup_myAKSCluster_francecentral" subscription id 28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5, result: kubernetes
          </td>
        </tr>
      </tbody>
      </table>

- Set networkPlugin to azure

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>set networkPlugin to azure</td></tr>
    <tr><td>set networkPlugin to azure</td></tr>
    <tr><td>set networkPluginMode to overlay</td></tr>
    <tr><td>set networkPluginMode to overlay</td></tr>
    <tr><td>set networkPolicy to</td></tr>
    <tr><td>set networkPolicy to</td></tr>
    </tbody>
    </table>

- Identity Profile Setup & FQDN Assignment

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>Setting Identity profile in control plane ResourceID: .../userAssignedIdentities/myAKSCluster-agentpool, ClientID: ab1a44db-265e-44eb-886e-2bff6a3ab904, ObjectID: 3c5b8d54-e6a7-4517-8f44-4e915a4764c8</td></tr>
    <tr><td>Setting Identity profile in control plane ResourceID: .../userAssignedIdentities/myAKSCluster-agentpool, ClientID: ab1a44db-265e-44eb-886e-2bff6a3ab904, ObjectID: 3c5b8d54-e6a7-4517-8f44-4e915a4764c8</td></tr>
    <tr><td>fqdn: myaksclust-myresourcegroup-28abb0-lg0xm6cm.hcp.francecentral.azmk8s.io, publicFqdn: ..., privatFqdn:</td></tr>
    <tr><td>fqdn: myaksclust-myresourcegroup-28abb0-lg0xm6cm.hcp.francecentral.azmk8s.io, publicFqdn: ..., privatFqdn:</td></tr>
    <tr><td>The dns goal is: ... FQDN: myaksclust-myresourcegroup-28abb0-lg0xm6cm.hcp.francecentral.azmk8s.io, IP: 4.251.147.167, TTL: 60</td></tr>
    <tr><td>The dns goal is: ... FQDN: myaksclust-myresourcegroup-28abb0-lg0xm6cm.hcp.francecentral.azmk8s.io, IP: 4.251.147.167, TTL: 60</td></tr>
    <tr><td>The dns goal is: ... FQDN: myaksclust-myresourcegroup-28abb0-lg0xm6cm.portal.hcp.francecentral.azmk8s.io, IP: 4.251.147.167, TTL: 60</td></tr>
    <tr><td>The dns goal is: ... FQDN: myaksclust-myresourcegroup-28abb0-lg0xm6cm.portal.hcp.francecentral.azmk8s.io, IP: 4.251.147.167, TTL: 60</td></tr>
    </tbody>
    </table>

- CCP components certificates are created.

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>CertificateProfile CA certificate is generated successfully</td></tr>
    <tr><td>CertificateProfile APIServer private key is generated successfully</td></tr>
    <tr><td>CertificateProfile APIServer certificate is generated successfully</td></tr>
    <tr><td>CertificateProfile kubeconfig certificate is generated successfully</td></tr>
    <tr><td>CertificateProfile aksService client certificate is generated successfully</td></tr>
    <tr><td>CertificateProfile node client certificate is generated successfully</td></tr>
    <tr><td>CertificateProfile master client certificate is generated successfully</td></tr>
    </tbody>
    </table>

- Waiting for Overlay components to become healthy / All Overlay components are ready / CCP IP is configured / DNS reference is configured

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>waiting for overlay "69298d19806281000116e263" to become healthy</td></tr>
    <tr><td>all overlay components are ready, 36.271046 seconds elapsed in this function.</td></tr>
    <tr><td>updating service ip from "" to "4.251.147.167"</td></tr>
    <tr><td>DNS resource reference: {737d3b89-5550-4cd5-802a-3af418c81181 hcp-underlay-francecentral ...}</td></tr>
    </tbody>
    </table>

- Creation of agent pools.

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>[Perf log]: Start to create vmss for agent pool "nodepool1"</td></tr>
    <tr><td>create VMSS aks-nodepool1-16061838-vmss succeeded.</td></tr>
    <tr><td>[Perf log]: Create vmss for agent pool "nodepool1" succeeded</td></tr>
    <tr><td>validateControlPlaneAddOns: Validating Control Plane AddOns</td></tr>
    <tr><td>Operation finished after 193.518376 seconds, with state Succeeded, removing messageID: 6df685b8-5985-4a36-8a00-7233bda89377 from the queue</td></tr>
    </tbody>
    </table>

- Validate the CCP Add-ons

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>validateControlPlaneAddOns: Validating Control Plane AddOns</td></tr>
    </tbody>
    </table>

- When the operation successfully processed, the message is deleted from the queue .

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>Operation finished after 193.518376 seconds, with state Succeeded, removing messageID: 6df685b8-5985-4a36-8a00-7233bda89377 from the queue</td></tr>
    </tbody>
    </table>

##### 4. HcpSyncContextActivity

> The Hosted Control Pane is a database abstraction layer for the AKS Resource Provider(AKS -RP), holds all the entities related to AKS -RP. Entities describe the state of Customer Control plane CCP, like the customer subscription, usage, billing, underlay, mana ged cluster and other azure resources operated by RP backend and front end. The HCP API abstraction provides for scalability, sharding and ca ching of the entities Identified by RP.

```text
cluster('akshuba.centralus').database('AKSprod').HcpSyncContextActivity
| where PreciseTimeStamp > ago(10d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where operationName notcontains "GET"
| where operationID contains "6df685b8-5985-4a36-8a00-7233bda89377"
| extend Message = parse_json(msg)
| project PreciseTimeStamp, level, Message
```
>
##### 5. OverlaymgrEvents

> This table Contains events of CCP components.

```text
cluster('akshuba.centralus').database('AKSprod').OverlaymgrEvents
| where PreciseTimeStamp > ago(10d)
| where operationID contains "6df685b8-5985-4a36-8a00-7233bda89377"
| where isnotempty(eventObjectName) and isnotempty(eventReason)
| extend StartTime = todatetime(logPreciseTime)
| project PreciseTimeStamp, level, msg
```

  <table>
  <thead><tr><th>msg</th></tr></thead>
  <tbody>
  <tr><td>sending event for component deployments/69298d19806281000116e263-etcd-etcd-operator in state "Ready"</td></tr>
  <tr><td>sending event for component services/azure-dnc-primary in state "Ready"</td></tr>
  <tr><td>sending event for component pods/ccp-webhook-6fffcfcfc8-tbxzb in state "Ready"</td></tr>
  <tr><td>sending event for component pods/csi-azuredisk-controller-7c4d8dd45d-8vlb6 in state "Ready"</td></tr>
  </tbody>
  </table>

##### 6. OutgoingRequestTrace

>This table: Contains summary of calls that **go out of** AKS RP.

```text
cluster('akshuba.centralus').database('AKSprod').OutgoingRequestTrace
| where PreciseTimeStamp > ago(14d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where httpMethod !contains "GET" and suboperationName !contains "na"
| where operationID contains "6df685b8-5985-4a36-8a00-7233bda89377"
//| where correlationID contains "17818e60-7ddc-4c69-b5de-03c27724da9d"
| project PreciseTimeStamp, operationName, suboperationName, targetURI, correlationID, statusCode, durationInMilliseconds, operationID
```

  <table>
  <thead><tr><th>suboperationName</th><th>targetURI</th></tr></thead>
  <tbody>
  <tr><td>Creating</td><td>https://login.microsoftonline.com/16b3c013-d300-468d-ac64-7eda0820b6d3/oauth2/v2.0/token</td></tr>
  <tr><td>Creating</td><td>https://francecentral.management.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral?api-version=2021-04-01</td></tr>
  <tr><td>Creating</td><td>https://aks-msi-francecentral.vault.azure.net/secrets/ff0bb9...568?api-version=2016-10-01</td></tr>
  </tbody>
  </table>

#### Part III: CRP, DiskRP and NRP

> Now: let\'s see interaction with the others RP (focus on CRP, DiskRP and NRP):

##### CRP and DiskRP

```text
cluster('akshuba.centralus').database('AKSprod').OutgoingRequestTrace
| where PreciseTimeStamp > ago(14d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where httpMethod !contains "GET" and suboperationName !contains "na"
| where operationID contains "6df685b8-5985-4a36-8a00-7233bda89377"
| where targetURI contains "Microsoft.Compute"
//| where correlationID contains "17818e60-7ddc-4c69-b5de-03c27724da9d"
| project PreciseTimeStamp, operationName, suboperationName, targetURI, correlationID, statusCode, durationInMilliseconds, operationID, serviceRequestID
```

  <table>
  <thead><tr><th>suboperationName</th><th>targetURI</th><th>serviceRequestID</th></tr></thead>
  <tbody>
  <tr><td>Creating</td><td>https://francecentral.management.azure.com/.../<tr><td>Creating</td><td>https://francecentral.management.azure.com/.../virtualMachineScaleSets/aks-nodepool1-16061838-vmss?api-version=2024-11-01</td><td>na</td></tr>
  <tr><td>Creating</td><td>https://francecentral.management.azure.com/.../virtualMachineScaleSets/aks-nodepool1-16061838-vmss?api-version=2024-11-01</td><td>4cde1129-cb5f-4214-acdb-a65ffccfca9f</td></tr>
  </tbody>
  </table>

>
> Note **the correlation ID** and Go to ARM:

```text
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","EventServiceEntries")
| where TIMESTAMP > ago(14d)
| where subscriptionId has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where correlationId contains "17818e60-7ddc-4c69-b5de-03c27724da9d"
| where operationName notcontains "Microsoft.Authorization/policies/auditIfNotExists/action"
| where operationName notcontains "Microsoft.Authorization/policies/audit/action"
| where operationName notcontains "Microsoft.Authorization/policies/deployIfNotExists/action"
| where operationName contains "microsoft.compute"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId , status, subStatus , resourceUri , eventName , operationId, armServiceRequestId, subscriptionId
| sort by PreciseTimeStamp desc nulls last
```

<table>
<colgroup>
<col style="width: 6%" />
<col style="width: 9%" />
<col style="width: 4%" />
<col style="width: 8%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 34%" />
<col style="width: 3%" />
<col style="width: 8%" />
<col style="width: 8%" />
<col style="width: 8%" />
</colgroup>
<thead>
<tr>
<th>PreciseTimeStamp</th>
<th>operationName</th>
<th>resourceProvid er</th>
<th>correlationId</th>
<th style="text-align: center;">status</th>
<th>subStatus</th>
<th>resourceUri</th>
<th style="text-align: center;">eventName</th>
<th><blockquote>
<p>operationId</p>
</blockquote></th>
<th><blockquote>
<p>armServiceRequestId</p>
</blockquote></th>
<th><blockquote>
<p>subscriptionId</p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T12:05:27.</p>
<p>8215869Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>Succeede d</td>
<td></td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac</p>
<p>hineScaleSets/aks-nodepool1-16061838-vmss</p></td>
<td style="text-align: center;">EndRequest</td>
<td><blockquote>
<p>2dab7361-</p>
<p>dad6-40d3-9730-3a19d552b</p>
<p>b9a</p>
</blockquote></td>
<td><blockquote>
<p>145c233d-1fad-437e- b82e-3e842d787f59</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T12:05:19.</p>
<p>4255371Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td style="text-align: center;">Accepted</td>
<td>OK</td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac</p>
<p>hineScaleSets/aks-nodepool1-16061838-vmss</p></td>
<td style="text-align: center;">EndRequest</td>
<td><blockquote>
<p>effa2095-5b60-42c3-913f-97</p>
<p>c0dba59dcb</p>
</blockquote></td>
<td><blockquote>
<p>145c233d-1fad-437e- b82e-3e842d787f59</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T12:05:17.</p>
<p>2676207Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td style="text-align: center;">Started</td>
<td></td>
<td>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac
hineScaleSets/aks-nodepool1-16061838-vmss</td>
<td style="text-align: center;"><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><blockquote>
<p>effa2095-5b60-42c3-913f-97</p>
<p>c0dba59dcb</p>
</blockquote></td>
<td><blockquote>
<p>145c233d-1fad-437e- b82e-3e842d787f59</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T12:05:11.</p>
<p>1761428Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>Succeede d</td>
<td></td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac</p>
<p>hineScaleSets/aks-nodepool1-16061838-vmss</p></td>
<td style="text-align: center;">EndRequest</td>
<td><blockquote>
<p>8abe1882-42d8-4d35-92a5-</p>
<p>690e9b46236c</p>
</blockquote></td>
<td><blockquote>
<p>abcb7035-74c2-42bd- a98d-45bc89696626</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T12:05:06.</p>
<p>2713176Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td style="text-align: center;">Accepted</td>
<td>OK</td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac</p>
<p>hineScaleSets/aks-nodepool1-16061838-vmss</p></td>
<td style="text-align: center;">EndRequest</td>
<td><blockquote>
<p>a83d876e-a83d-405d- a489-70479e6100f3</p>
</blockquote></td>
<td><blockquote>
<p>abcb7035-74c2-42bd- a98d-45bc89696626</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T12:05:03.</p>
<p>9976032Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td style="text-align: center;">Started</td>
<td></td>
<td>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac
hineScaleSets/aks-nodepool1-16061838-vmss</td>
<td style="text-align: center;"><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><blockquote>
<p>a83d876e-a83d-405d- a489-70479e6100f3</p>
</blockquote></td>
<td><blockquote>
<p>abcb7035-74c2-42bd- a98d-45bc89696626</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T11:55:54.</p>
<p>3857825Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>Succeede d</td>
<td></td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac</p>
<p>hineScaleSets/aks-nodepool1-16061838-vmss</p></td>
<td style="text-align: center;">EndRequest</td>
<td><blockquote>
<p>eef603ef-9679-44fc-89e3-3a eebeb18252</p>
</blockquote></td>
<td><blockquote>
<p>e8a57d7d-5a96-4dcf-a716- ab6d019ea447</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T11:54:36.</p>
<p>0929307Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td style="text-align: center;">Accepted</td>
<td><strong>Created</strong></td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac</p>
<p>hineScaleSets/aks-nodepool1-16061838-vmss</p></td>
<td style="text-align: center;">EndRequest</td>
<td><blockquote>
<p>8086c7cb-8a0f-4a3c-a497- c39c83ee426a</p>
</blockquote></td>
<td><blockquote>
<p>e8a57d7d-5a96-4dcf-a716- ab6d019ea447</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T11:54:34.</p>
<p>4769220Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac</p>
<p>hineScaleSets/aks-nodepool1-16061838-vmss</p></td>
<td style="text-align: center;"><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><blockquote>
<p>8086c7cb-8a0f-4a3c-a497- c39c83ee426a</p>
</blockquote></td>
<td><blockquote>
<p>e8a57d7d-5a96-4dcf-a716- ab6d019ea447</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
</tbody>
</table>

> Now, let\'s switch to the Compute RP:
> **Important** ServiceRequestId in ARM EventServices **equals** OperationID in CRP VMSSQosEvent table **equals** ActivityID in contextactivity

#### 1. ApiQosEvent_nonGet

```text
Open in [ADX Web] [Kusto.Explorer] [Fabric] [cluster('azcrp.kusto.windows.net').database('crp_allprod')]
ApiQosEvent_nonGet
| where PreciseTimeStamp > ago(16d)
| where subscriptionId has '28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5'
| where resourceGroupName contains "MC_myResourceGroup_myAKSCluster_francecentral"
//| where resourceName contains "<vmss-name>"
| where operationId contains "4cde1129-cb5f-4214-acdb-a65ffccfca9f" //ServiceRequestId in ARM EventServices == OperationID in CRP VMSSQosEvent table == ActivityID in contextactivity
| project PreciseTimeStamp, resourceName, correlationId, operationId, userAgent, operationName, clientPrincipalName, errorDetails, resourceGroupName, resultCode, e2EDurationInMilliseconds, durationInMilliseconds , httpStatusCode , region , clientApplicationId , subscriptionId, requestEntity
```

  <table>
  <thead>
  <tr><th>resourceName</th><th>userAgent</th><th>operationName</th><th>requestEntity</th></tr>
  </thead>
  <tbody>
  <tr>
  <td>aks-nodepool1-16061838-vmss</td>
  <td>AKS-VMSS azsdk-go-armcompute/v6.4.0 (go1.24.7 X:nocoverageredesign;<td>AKS-VMSS azsdk-go-armcompute/v6.4.0 (go1.24.7 X:nocoverageredesign; linux)</td>
  <td>VirtualMachineScaleSets.ResourceOperation.PUT</td>
  <td>{ "name": "aks-nodepool1-16061838-vmss", "type": "Microsoft.Compute/virtualMachineScaleSets", "location": "francecentral", "tags": { "aks-managed-azure-cni-overlay": "true", "aks-managed-bootstrap-profile-acr-name": "", "aks-managed-consolidated-additional-properties": "c8eea863-cc50-11f0-b226-ee6259910934", "aks-managed-createOperationID": "6df685b8-5985-4a36-8a00-7233bda89377", "aks-managed-creationSource": "vmssclient-aks-nodepool1-16061838-vmss", "aks-managed-enable-imds-restriction": "false", "aks-managed-kubeletIdentityClientID": "ab1a44db-265e-44eb-886e-2bff6a3ab904", "aks-managed-networkisolated-outbound-type": "", "aks-managed-orchestrator": "Kubernetes:1.32.9", "aks-managed-poolName": "nodepool1", "aks-managed-resourceNameSuffix": "29823133", "aks-managed-ssh-access": "LocalUser", "compute.aks.billing": "true", "aks-managed-coordination": "true" }, "identity": { "type": "UserAssigned", "userAssignedIdentities": { "/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.ManagedIdentity/userAssignedIdentities/myAKSCluster-agentpool": {} } }, "sku": { "name": "Standard_D8ds_v5", "tier": "Standard", "capacity": 2 }, "properties": { "singlePlacementGroup": false, "orchestrationMode": "Uniform", "upgradePolicy": { "mode": "Manual" }, "virtualMachineProfile": { "osProfile": { "computerNamePrefix": "aks-nodepool1-16061838-vmss", "adminUsername": "azureuser", "linuxConfiguration": { "disablePasswordAuthentication": true, "ssh": { "publicKeys": [ { "path": "/home/azureuser/.ssh/authorized_keys", "keyData": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCTZP8rTTPVUtTIfc+Rjc5Xt9ZhhcZcCCHtGbA3OJ1eU5K8nS5svQfNeEGkP/AfREw3zAs8BF3A8SZBoUv/CUaNQijlANNC1AZNXUop2d50jDJMZSMpwgAdwFDQ/0FPYM0fTX0AWdzvidSvwWKFd4bUUkLvVnVtferf2Ui+qZpOPe2DGlehCs6izm1p42DYJVjfLuUrnD/TDsM0JwBynhmAZstr7N3W2jVbXvO5AkhSTFTdFi/f8azZ/mnMoOHWQHND76Y59lqhdHMNi7hKPk13TT28AnmScnf8eJNMFe3L4SNrBj6MeFMFODhYsnKg/uHq6SwZqQDKwOi207msS8Tp" } ] } } }, "storageProfile": { "osDisk": { "diffDiskSettings": { "option": "Local", "placement": "ResourceDisk" }, "createOption": "FromImage", "caching": "ReadOnly", "managedDisk": { "storageAccountType": "Standard_LRS" }, "diskSizeGB": 300 }, "imageReference": { "id": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/AKS-Ubuntu/providers/Microsoft.Compute/galleries/AKSUbuntu/images/2204gen2containerd/versions/202511.07.0" }, "dataDisks": [] }, "networkProfile": {"networkInterfaceConfigurations":[{"name":"aks-nodepool1-16061838-vmss","properties":{"enableAcceleratedNetworking":true,"enableIPForwarding":true,"ipConfigurations":[{"name":"ipconfig1","properties":{"loadBalancerBackendAddressPools":[{"id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalancers/kubernetes/backendAddressPools/aksOutboundBackendPool"},{"id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalancers/kubernetes/backendAddressPools/kubernetes"}],"primary":true,"subnet":{"id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/virtualNetworks/aks-vnet-29823133/subnets/aks-subnet"}}}],"primary":true}}]}, "extensionProfile": { "extensions": [ { "name": "vmssCSE", "properties": { "autoUpgradeMinorVersion": true, "publisher": "Microsoft.Azure.Extensions", "type": "CustomScript", "typeHandlerVersion": "2.0" } }, { "name": "aks-nodepool1-16061838-vmss-AKSLinuxBilling", "properties": { "autoUpgradeMinorVersion": true, "publisher": "Microsoft.AKS", "type": "Compute.AKS.Linux.Billing", "typeHandlerVersion": "1.0" } } ], "extensionsTimeBudget": "PT16M" } }, "provisioningState": 0, "overprovision": false, "uniqueId": "00000000-0000-0000-0000-000000000000", "platformFaultDomainCount": 1 } }</td>
  </tr>
  </tbody>
  </table>

#### 2. VmssQoSEvent

> The VmssQoSEvent table will have summary of all the operations on VMSS.

```text
Open in [ADX Web] [Kusto.Explorer] [Fabric] [cluster('azcrp.kusto.windows.net').database('crp_allprod')]
VmssQoSEvent
| where PreciseTimeStamp > ago(16d)
| where subscriptionId has '28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5'
| where resourceGroupName contains "MC_myResourceGroup_myAKSCluster_francecentral"
//| where resourceName contains "<vmss-name>"
| where operationId contains "4cde1129-cb5f-4214-acdb-a65ffccfca9f"
| project PreciseTimeStamp, operationName, operationId, resourceGroupName, vmssName, oSType, availabilitySetCount, targetInstanceCount, vMCountDelta, e2EDurationSeconds, extensionNamesCsv, predominantErrorCode, predominantErrorDetail, predominantExceptionType
```

<table>
<colgroup>
<col style="width: 7%" />
<col style="width: 10%" />
<col style="width: 8%" />
<col style="width: 10%" />
<col style="width: 7%" />
<col style="width: 3%" />
<col style="width: 5%" />
<col style="width: 5%" />
<col style="width: 4%" />
<col style="width: 5%" />
<col style="width: 15%" />
<col style="width: 5%" />
<col style="width: 5%" />
<col style="width: 6%" />
</colgroup>
<thead>
<tr>
<th>PreciseTimeStamp</th>
<th>operationName</th>
<th><blockquote>
<p>operationId</p>
</blockquote></th>
<th><blockquote>
<p>resourceGroupName</p>
</blockquote></th>
<th>vmssName</th>
<th>oSType</th>
<th>availabilitySetCo unt</th>
<th>targetInstanceCo unt</th>
<th>vMCountDelt a</th>
<th>e2EDurationSeco nds</th>
<th>extensionNamesCsv</th>
<th>predominantError Code</th>
<th>predominantError Detail</th>
<th>predominantExceptio nType</th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T11:55:19.49</p>
<p>02969Z</p></td>
<td>VirtualMachineScaleSets.Resource Operation.PUT</td>
<td><blockquote>
<p>4cde1129-cb5f-4214-acdb- a65ffccfca9f</p>
</blockquote></td>
<td><blockquote>
<p>MC_myResourceGroup_myAKSClust er_francecentral</p>
</blockquote></td>
<td><p>aks-</p>
<p>nodepool1-16061838- vmss</p></td>
<td><mark>Linux</mark></td>
<td><mark>2</mark></td>
<td><mark>2</mark></td>
<td><mark>2</mark></td>
<td>44</td>
<td>Microsoft.Azure.Extensions.CustomScript,Microsoft.AKS.
Compute.AKS.Linux.Billing</td>
<td></td>
<td></td>
<td></td>
</tr>
</tbody>
</table>

#### 3. VMApiQosEvent
>
> The VMApiQosEvent table will have summary of all the operations on VMSS instances.
>
```text
Open in [ADX Web] [Kusto.Explorer] [Fabric] [cluster('azcrp.kusto.windows.net').database('crp_allprod')]
VMApiQosEvent
| where PreciseTimeStamp > ago(16d)
| where subscriptionId has '28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5'
| where resourceGroupName contains "MC_myResourceGroup_myAKSCluster_francecentral"
//| where resourceName contains "<vmss-name>"
| where operationId contains "4cde1129-cb5f-4214-acdb-a65ffccfca9f"
| where operationName notcontains "VirtualMachines.RetrieveVMConsoleScreenshot.POST"
| where operationName notcontains "VirtualMachines.RetrieveVMConsoleSerialLogs.POST"
| project PreciseTimeStamp, operationId, operationName, resourceGroupName, resourceName,  fabricCluster, fabricTenantName, correlationId, durationInMilliseconds
```

  <table>
    <thead>
      <tr>
        <th>operationName</th>
        <th>resourceGroupName</th>
        <th>resourceName</th>
        <th>fabricCluster</th>
        <th>fabricTenantName</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>VirtualMachineScaleSets.ResourceOperation.PUT</td>
        <td>MC_myResourceGroup_myAKSCluster_francecentral</td>
        <td>aks-nodepool1-16061838-vmss_0</td>
        <td>francec-prod-c</td>
        <td>9ccc8658-bc67-4aef-b2fd-6966f40b5fcb</td>
      </tr>
      <tr>
        <td>VirtualMachineScaleSets.ResourceOperation.PUT</td>
        <td>MC_myResourceGroup_myAKSCluster_francecentral</td>
        <td>aks-nodepool1-16061838-vmss_1</td>
        <td>francec-prod-c</td>
        <td>345ff9d5-b25c-44f5-83d4-cf3084e55894</td>
      </tr>
    </tbody>
    </table>

#### 4. ContextActivity

> The ContextActivity Table will have verbose logs for each operation we see in VMSSQosEvent table.

```text
Open in [ADX Web] [Kusto.Explorer] [Fabric] [cluster('azcrp.kusto.windows.net').database('crp_allprod')]
ContextActivity | union VmssVMGoalSeekingActivity
| where PreciseTimeStamp > ago(16d)
| where subscriptionId has '28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5'
| where activityId contains "4cde1129-cb5f-4214-acdb-a65ffccfca9f"
| project TIMESTAMP , traceLevel , message , callerName
```

- First, we can see the type of operation that came to CRP

    <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            Request: PUT https://10.0.118.246:30004/f491ff58-9c6e-4c06-b03b-186170d146b7_134057336666909495/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss?api-version=2024-11-01        Request: PUT https://10.0.118.246:30004/f491ff58-9c6e-4c06-b03b-186170d146b7_134057336666909495/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss?api-version=2024-11-01 HTTP/2
          </td>
        </tr>
      </tbody>
      </table>

- We can see also Invoking action, which contains many important information like:
  - VM SKU,
  - Network Profile,
  - Storage Profile
  - Image Reference

  <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
          Invoking action VirtualMachineScaleSets.ResourceOperation.PUT(subscriptionId=28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5, resourceGroupName=MC_myResourceGroup_myAKSCluster_francecentral, resourceName=aks-nodepool1-16061838-vmss, vmss={ "name": "aks-nodepool1-16061838-vmss", "type": "Microsoft.Compute/virtualMachineScaleSets", "location": "francecentral", "tags": { "aks-managed-azure-cni-overlay": "true", "aks-managed-bootstrap-profile-acr-name": "", "aks-managed-consolidated-additional-properties": "c8eea863-cc50-11f0-b226-ee6259910934", "aks-managed-createOperationID": "6df685b8-5985-4a36-8a00-7233bda89377", "aks-managed-creationSource": "vmssclient-aks-nodepool1-16061838-vmss", "aks-managed-enable-imds-restriction": "false", "aks-managed-kubeletIdentityClientID": "ab1a44db-265e-44eb-886e-2bff6a3ab904", "aks-managed-networkisolated-outbound-type": "", "aks-managed-orchestrator": "Kubernetes:1.32.9", "aks-managed-poolName": "nodepool1", "aks-managed-resourceNameSuffix": "29823133", "aks-managed-ssh-access": "LocalUser", "compute.aks.billing": "true" }, "identity": { "type": "UserAssigned", "userAssignedIdentities": { "/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.ManagedIdentity/userAssignedIdentities/myAKSCluster-agentpool": {} } }, "sku": { "name": "Standard_D8ds_v5", "tier": "Standard", "capacity": 2 }, "properties": { "singlePlacementGroup": false, "orchestrationMode": "Uniform", "upgradePolicy": { "mode": "Manual" }, "virtualMachineProfile": { "osProfile": { "computerNamePrefix": "aks-nodepool1-16061838-vmss", "adminUsername": "azureuser", "linuxConfiguration": { "disableREDACTED": true, "ssh": { "publicREDACTED": [ { "path": "/home/azureuser/.ssh/authorized_REDACTED", "REDACTED" } ] } } }, "storageProfile": { "osDisk": { "diffDiskSettings": { "option": "Local", "placement": "ResourceDisk" }, "createOption": "FromImage", "caching": "ReadOnly", "diskSizeGB": 300 }, "imageReference": { "id": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/AKS-Ubuntu/providers/Microsoft.Compute/galleries/AKSUbuntu/images/2204gen2containerd/versions/202511.07.0" } }, "networkProfile": {"networkInterfaceConfigurations":[{"name":"aks-nodepool1-16061838-vmss","properties":{"enableAcceleratedNetworking":true,"enableIPForwarding":true,"ipConfigurations":[{"name":"ipconfig1","properties":{"loadBalancerBackendAddressPools":[{"id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalancers/kubernetes/backendAddressPools/aksOutboundBackendPool"},{"id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalancers/kubernetes/backendAddressPools/kubernetes"}],"primary":true,"subnet":{"id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/virtualNetworks/aks-vnet-29823133/subnets/aks-subnet"}}}],"primary":true}}]}, "extensionProfile": { "extensions": [ { "name": "vmssCSE", "properties": { "autoUpgradeMinorVersion": true, "publisher": "Microsoft.Azure.Extensions", "type": "CustomScript", "typeHandlerVersion": "2.0" } }, { "name": "aks-nodepool1-16061838-vmss-AKSLinuxBilling", "properties": { "autoUpgradeMinorVersion": true, "publisher": "Microsoft.AKS", "type": "Compute.AKS.Linux.Billing", "typeHandlerVersion": "1.0" } } ], "extensionsTimeBudget": "PT16M" } }, "provisioningState": 0, "overprovision": false, "uniqueId": "00000000-0000-0000-0000-000000000000", "platformFaultDomainCount": 1 } })
          </td>
        </tr>
      </tbody>
    </table>

- CRP talks to PIR - Platform image Repository to check for image used for VM creation.

<table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            GetGalleryImageVersion uri: internal/Providers/Microsoft.Compute/galleries/109a5e88-712a-48ae-9078-9ca8b3c81345-AKSUBUNTU/images/2204gen2containerd/versions/202511.07.0?inputGalleryResourceId=%2Fsubscriptions%2F109a5e88-712a-48ae-9078-9ca8b3c81345%2FresourceGroups%2FAKS-Ubuntu%2Fproviders%2FMicrosoft.Compute%2Fgalleries%2FAKSUbuntu%2Fimages%2F2204gen2containerd%2Fversions%2F202511.07.0&subscriptionId=28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5&tenantId=16b3c013-d300-468d-ac64-7eda0820b6d3&api-version=2015-06-15&$expand=image<br><br>
            Got GalleryImageVersion from PIR: { "properties": { "storageProfile": { "osDiskImage": { "diskSizeGB": 30, "hostCaching": "None" } }, "IsDerived1PGalleryImageVersion": false, "ownerResourceId": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/AKS-UBUNTU/providers/Microsoft.Compute/galleries/AKSUbuntu/images/2204gen2containerd/versions/202511.07.0", "incarnationId": "9907a202-0419-48db-9c27-60c4de916ba8", "commonId": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/PPSCommonId$ResourceGroup/providers/Microsoft.Compute/galleries/AKSUBUNTU/images/2204gen2containerd/versions/202511.07.0", "publishedDate": "2025-11-07T09:22:03.7425755+00:00", "publishingProfile": { "allocationConstraints": { "replicas": 20 } } }, "image": { "properties": { "osType": "Linux", "osState": "Generalized", "hyperVGeneration": "V2", "architecture": "x64", "features": [ { "name": "DiskControllerTypes", "value": "SCSI, NVMe" } ], "identifier": { "publisher": "microsoft-aks", "offer": "AKSUbuntu", "sku": "2204gen2containerd" }, "recommended": {} }, "location": "FranceCentral", "name": "2204gen2containerd" }, "location": "FranceCentral", "name": "202511.07.0" }
          </td>
        </tr>
        <tr>
          <td>
            GetGalleryImageVersion uri: internal/Providers/Microsoft.Compute/galleries/109a5e88-712a-48ae-9078-9ca8b3c81345-AKSUBUNTU/images/2204gen2containerd/versions/202511.07.0?inputGalleryResourceId=%2Fsubscriptions%2F109a5e88-712a-48ae-9078-9ca8b3c81345%2FresourceGroups%2FAKS-Ubuntu%2Fproviders%2FMicrosoft.Compute%2Fgalleries%2FAKSUbuntu%2Fimages%2F2204gen2containerd%2Fversions%2F202511.07.0&subscriptionId=28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5&tenantId=16b3c013-d300-468d-ac64-7eda0820b6d3&api-version=2015-06-15&$expand=image<br><br>
            Got GalleryImageVersion from PIR:
            { "properties": { "storageProfile": { "osDiskImage": { "diskSizeGB": 30, "hostCaching": "None" } }, "IsDerived1PGalleryImageVersion": false, "ownerResourceId": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/AKS-UBUNTU/providers/Microsoft.Compute/galleries/AKSUbuntu/images/2204gen2containerd/versions/202511.07.0", "incarnationId": "9907a202-0419-48db-9c27-60c4de916ba8", "commonId": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/PPSCommonId$ResourceGroup/providers/Microsoft.Compute/galleries/AKSUBUNTU/images/2204gen2containerd/versions/202511.07.0", "publishedDate": "2025-11-07T09:22:03.7425755+00:00", "publishingProfile": { "allocationConstraints": { "replicas": 20 } } }, "image": { "properties": { "osType": "Linux", "osState": "Generalized", "hyperVGeneration": "V2", "architecture": "x64", "features": [ { "name": "DiskControllerTypes", "value": "SCSI, NV        Got GalleryImageVersion from PIR: { "properties": { "storageProfile": { "osDiskImage": { "diskSizeGB": 30, "hostCaching": "None" } }, "IsDerived1PGalleryImageVersion": false, "ownerResourceId": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/AKS-UBUNTU/providers/Microsoft.Compute/galleries/AKSUbuntu/images/2204gen2containerd/versions/202511.07.0", "incarnationId": "9907a202-0419-48db-9c27-60c4de916ba8", "commonId": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/PPSCommonId$ResourceGroup/providers/Microsoft.Compute/galleries/AKSUBUNTU/images/2204gen2containerd/versions/202511.07.0", "publishedDate": "2025-11-07T09:22:03.7425755+00:00", "publishingProfile": { "allocationConstraints": { "replicas": 20 } } }, "image": { "properties": { "osType": "Linux", "osState": "Generalized", "hyperVGeneration": "V2", "architecture": "x64", "features": [ { "name": "DiskControllerTypes", "value": "SCSI, NVMe" } ], "identifier": { "publisher": "microsoft-aks", "offer": "AKSUbuntu", "sku": "2204gen2containerd" }, "recommended": {} }, "location": "FranceCentral", "name": "2204gen2containerd" }, "location": "FranceCentral", "name": "202511.07.0" }
          </td>
        </tr>
      </tbody>
</table>

- CRP talks to DiskRP with DiskAllocation request.

    <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            AllocateDisksRequest: { "colocationType": "PolicyBased", "vmScaleSetId": "/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss", "vms": [ { "tags": { "aks-managed-azure-cni-overlay": "true", "aks-managed-bootstrap-profile-acr-name": "", "aks-managed-consolidated-additional-properties": "c8eea863-cc50-11f0-b226-ee6259910934", "aks-managed-createOperationID": "6df685b8-5985-4a36-8a00-7233bda89377", "aks-managed-creationSource": "vmssclient-aks-nodepool1-16061838-vmss", "aks-managed-enable-imds-restriction": "false", "aks-managed-kubeletIdentityClientID": "ab1a44db-265e-44eb-886e-2bff6a3ab904", "aks-managed-networkisolated-outbound-type": "", "aks-managed-orchestrator": "Kubernetes:1.32.9", "aks-managed-poolName": "nodepool1", "aks-managed-resourceNameSuffix": "29823133", "aks-managed-ssh-access": "LocalUser", "compute.aks.billing": "true", "aks-managed-coordination": "true" },
            "imageReference": { "id": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/AKS-Ubuntu/providers/Microsoft.Compute/galleries/AKSUbuntu/images/2204gen2containerd/versions/202511.07.0" },
            "id": "/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss/virtualMachines/aks-nodepool1-16061838-vmss_0",
            "faultDomain": 0,
            "colocationConstraints": { "colocationT2Spine": { "id": "par61:-520283205" }, "colocationZone": { "id": "francec-az02" } },
            "vmGoalState": "Allocated",
            "disks": [ { "properties": { "osType": "Linux", "creationData": { "createOption": "FromPreprovisioned", "sourceResourceId": "/subscriptions/14bab04b-6fe6-4b71-bae5-507899974b1b/resourceGroups/97c0ac70-7d37-4c56-8ec3-1b7c695d        "disks": [ { "properties": { "osType": "Linux", "creationData": { "createOption": "FromPreprovisioned", "sourceResourceId": "/subscriptions/14bab04b-6fe6-4b71-bae5-507899974b1b/resourceGroups/97c0ac70-7d37-4c56-8ec3-1b7c695d24b0/providers/Microsoft.Compute/disks/pps-vm-01_pps-vm-01_0_OsDisk_1_6a6bc1baf62741ec9636fcc9cbc262d8" },
            "crpDiskId": "6bcc8953-0c0d-453c-9ad3-046c28a30d6e", "isArmResource": false, "disableBilling": false,
            "billingUriOverride": "/subscriptions/010c879a-9b76-4efc-a9fe-3f63de9b3242/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/VMScaleSets/aks-nodepool1-16061838-vmss" },
            "associatedXStoreEntities": [], "sku": { "name": "Standard_LRS" } } ] } ], "faultDomainCount": 1 }
            DiskRP response for AllocateDisks request: { ... full VM0 disk allocation result ... }
          </td>
        </tr>
        <tr>
          <td>
            AllocateDisksRequest: { ... VM1 request block exactly as in source ... }
            DiskRP response for AllocateDisks request: { ... full VM1 disk allocation result ... }
          </td>
        </tr>
      </tbody>
      </table>

- CRP makes several calls to NRP.

    <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            Start: POST https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_MYRESOURCEGROUP_MYAKSCLUSTER_FRANCECENTRAL/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss/validate?api-version=2015-06-15. OngoingCallCount = 1
            End: POST https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_MYRESOURCEGROUP_MYAKSCLUSTER_FRANCECENTRAL/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss/validate?api-version=2015-06-15. OngoingCallCount = 0. ResponseHttpVersion: 2.0
            Start: PUT https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss?api-version=2015-06-15. OngoingCallCount = 1
            End: PUT https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss?api-version=2015-06-15. OngoingCallCount = 0. ResponseHttpVersion: 2.0
            Response has Azure-AsyncOperation header https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/providers/Microsoft.Network/locations/francecentral/operations/ae1875bf-1571-4282-bf17-a010d7682fb1?api-version=2015-06-15
            Waiting for the timed task NRP.ValidateVMScaleSet to complete. Remaining time: 00:00:36.9218763.
            Invoking NRP ValidateVMScaleSet with 1 UpdateGroups, 2 vmInstances and IsMultiTenant as True
            Request Header x-ms-client-request-id: b8157d10-4ce5-4832-8af4-1b60f7190ebe
            Start: POST https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_MYRESOURCEGROUP_MYAKSCLUSTER_FRANCECENTRAL/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss/validate?api-version=2015-06-15. OngoingCallCount = 1
            NRPValidateClient: Try sending request with cached dsts token. ValidFrom: 11/28/2025 1:15:45 AM, ValidTo: 11/29/2025 1:15:45 AM<br><br>
            End: POST https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_MYRESOURCEGROUP_MYAKSCLUSTER_FRANCECENTRAL/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss/validate?api-version=2015-06-15. OngoingCallCount = 0. ResponseHttpVersion: 2.0
            Received HTTP status code OK. x-ms-request-id: 201243d9-9af9-44e5-9885-0b154fac01fe
            From NRP ValidateVMScaleSet response, VMSS healthProbeEnabled: False,
            CanUsePreProvisionedVMs: True,
            NetworkInterfaceCount: 1,
            AccelNetRequired: True,
            VmSizeAccelNetAvailability: Guaranteed,
            RequiredNetworkingCapabilities: [FpgaEnabled],
            SkipOverProvision: False,
            FastPathEnabled: True
          </td>
        </tr>
      </tbody>
      </table>

> Important: We will use the \"x-ms-request-id\" to trace the calls in NRP logs. (see next section)

- Based on VM size and few constraints (Eg - EphemeralDisk) CRP will look-up all the clusters in the region.

    <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>After applying EphemeralDisk constraint candidates are: francec-prod-c</td>
        </tr>
        <tr>
          <td>After applying VMSize constraint candidates are: francec-prod-c</td>
        </tr>
        <tr>
          <td>After applying EphemeralDisk constraint candidates are: francec-prod-c</td>
        </tr>
        <tr>
          <td>After applying VMSize constraint candidates are: francec-prod-c</td>
        </tr>
        <tr>
          <td>[Reprovision] Skipping reprovision because 0 candidates for ReprovisionOSProvisionTimeOutVMs after set intersection, and m_attemptReprovisionForOSProvisioningTimeout:False</td>
        </tr>
      </tbody>
      </table>

> Important: Based on cluster Utilization and few constraints, one/many fabric clusters will be chosen for VM allocation.

- CRP translates VM model and generates .SVD (Service model) file that fabric understands.

    <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Generate skeletal SVD with assigned FD's for 0 non-existent VMs with allocated disks and determine FD of live VM's</td>
        </tr>
        <tr>
          <td>Generate skeletal SVD with assigned FD's for 0 non-existent VMs with allocated disks and determine FD of live VM's</td>
        </tr>
      </tbody>
      </table>

- CRP talks to Fabric with a commit Tenant allocation call.

    <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            CommitTenantResourceAllocationRequest: { "FabricTenantName": "9ccc8658-bc67-4aef-b2fd-6966f40b5fcb", "FabricClusterName": "francec-prod-c", "ServiceInstanceId": "9ccc8658-bc67-4aef-b2fd-6966f40b5fcb.0", "LogicalTimeStamp": 1 }
            CallbackUri for CommitTenantResourceAllocation request:
            https://francecentral.compute.azure.com:10010/internal/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/nrpCallback/00912dc7-bb44-4618-b45e-406bc94119a2/onOperationComplete?resourceGroup=MC_myResourceGroup_myAKSCluster_francecentral&availabilitySet=_aks-nodepool1-16061838-vmss_9ccc8658bc674aefb2fd6966f40b5fcb&operationName=CommitTenantResourceAllocation&p=f491ff58-9c6e-4c06-b03b-186170d146b7
            Start: POST https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/tenants/9ccc8658        Start: POST https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/tenants/9ccc8658-bc67-4aef-b2fd-6966f40b5fcb/CommitTenantResourceAllocation?api-version=2015-06-15&logicalTimeStamp=1. OngoingCallCount = 1
            End: POST https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/tenants/9ccc8658-bc67-4aef-b2fd-6966f40b5fcb/CommitTenantResourceAllocation?api-version=2015-06-15&logicalTimeStamp=1.
            OngoingCallCount = 0. ResponseHttpVersion: 2.0
          </td>
        </tr>
        <tr>
          <td>
            CommitTenantResourceAllocationRequest: { "FabricTenantName": "345ff9d5-b25c-44f5-83d4-cf3084e55894", "FabricClusterName": "francec-prod-c", "ServiceInstanceId": "345ff9d5-b25c-44f5-83d4-cf3084e55894.0", "LogicalTimeStamp": 1 }
          </td>
        </tr>
      </tbody>
      </table>

- CRP sends a start call to Fabric and polls for a response.

    <table>
      <thead>
        <tr>
          <th>TIMESTAMP</th>
          <th>traceLevel</th>
          <th>message</th>
          <th>callerName</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>2025-11-28T11:54:43.5440265Z</td>
          <td>8</td>
          <td>Poll for RoleInstance _aks-nodepool1-16061838-vmss_0, shouldBeRunning True completed.</td>
          <td>PollForRoleInstanceStatus</td>
        </tr>
        <tr>
          <td>2025-11-28T11:54:44.8680505Z</td>
          <td>8</td>
          <td>Poll for RoleInstance _aks-nodepool1-16061838-vmss_1, shouldBeRunning True completed.</td>
          <td>PollForRoleInstanceStatus</td>
        </tr>
      </tbody>
      </table>

- There was a callback notification from Fabric stating the VM provisioning succeeded.

    <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            Got Fabric callback notification: { "serviceInstanceName": "9ccc8658-bc67-4aef-b2fd-6966f40b5fcb.0", "roleInstanceIsRunning": true, "roleInstanceIsExpectedToRun": true, "vmId": "5df553f1-db37-405b-a07d-b4172a77bf7e", "guestOsProvisioningResult": "InProgress", "expectedRunningStateChangedReason": "Start", "containerState": { "isUpdatedToLatestConfigFile": true, "isRunning": true, "isFaulted": false, "toBeDeleted": false, "normalizedFaultInfo": { "faultCode": 0 } }, "logicalTimeStamp": 638999276835058147 }
          </td>
        </tr>
        <tr>
          <td>
            Got Fabric callback notification: { "serviceInstanceName": "9ccc8658-bc67-4aef-b2fd-6966f40b5fcb.0", "roleInstanceIsRunning": true, "roleInstanceIsExpectedToRun": true, "vmId": "5df553f1-db37-405b-a07d-b4172a77bf7e", "guestOsProvisioningResult": "Success", "expectedRunningStateChangedReason": "Start", "containerState": { "isUpdatedToLatestConfigFile": true, "isRunning": true, "isFaulted": false, "toBeDeleted": false, "normalizedFaultInfo": { "faultCode": 0 } }, "logicalTimeStamp": 638999276845839265 }
          </td>
        </tr>
        <tr>
          <td>
            Got Fabric callback notification: { "serviceInstanceName": "345ff9d5-b25c-44f5-83d4-cf3084e55894.0", "roleInstanceIsRunning": true, "roleInstanceIsExpectedToRun": true, "vmId": "3407ff7a-0841-4d3c-a00e-1c5c48742e4a", "guestOsProvisioningResult": "InProgress", "expectedRunningStateChangedReason": "Start", "containerState": { "isUpdatedToLatestConfigFile": true, "isRunning": true, "isFaulted": false, "toBeDeleted": false, "normalizedFaultInfo": { "faultCode": 0 } }, "logicalTimeStamp": 638999276848554563 }
          </td>
        </tr>
        <tr>
          <td>
            Got Fabric callback notification: { "serviceInstanceName": "345ff9d5-b25c-44f5-83d4-cf3084e55894.0", "roleInstanceIsRunning": true, "roleInstanceIsExpectedToRun": true, "vmId": "3407ff7a-0841-4d3c-a00e-1c5c48742e4a", "guestOsProvisioningResult": "Success", "expectedRunningStateChangedReason": "Start", "containerState": { "isUpdatedToLatestConfigFile": true, "isRunning": true, "isFaulted": false, "toBeDeleted": false, "normalizedFaultInfo": { "faultCode": 0 } }, "logicalTimeStamp": 638999276892148613 }
          </td>
        </tr>
      </tbody>
      </table>

> **Now regarding the CRP \--\> NRP trace as mentioned above** We will use the \"x-ms-request-id\" to trace the calls in NRP logs.
>
> **Important:** \'x-ms-request-id\' in CRP ContextActivity _equals_ OperationID in NRP QOSEtwEvent table _equals_ OperationID in NRP FrontEndOperationEtwEvent

##### NRP

#### 1. QosEtwEvent

> **QosEtwEvent table** will have summary of all the operations in NRP.

```text
Open in [ADX Web] [Kusto.Explorer] [Fabric] [cluster('nrp.kusto.windows.net').database('mdsnrp')]
QosEtwEvent
| where PreciseTimeStamp between(datetime("2025-11-28T11:50:35.1488140Z") .. datetime("2025-11-28T12:54:35.1488140Z"))
| where SubscriptionId has '28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5'
| where ResourceGroup contains "MC_MYRESOURCEGROUP_MYAKSCLUSTER_FRANCECENTRAL"
| where HttpMethod notcontains "GET"
//| where Success != "1"
| project StartTime, PreciseTimeStamp, CorrelationRequestId, OperationId, HttpMethod, ErrorCode, UserError, Success, ErrorDetails, TeamName, ResourceType, ResourceName, OperationName, Region, TraceSource, ResourceGroup
```

<table>
<colgroup>
<col style="width: 7%" />
<col style="width: 7%" />
<col style="width: 9%" />
<col style="width: 9%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 6%" />
<col style="width: 9%" />
<col style="width: 8%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 13%" />
</colgroup>
<thead>
<tr>
<th>StartTime</th>
<th><blockquote>
<p>PreciseTimeStamp</p>
</blockquote></th>
<th>CorrelationRequestId</th>
<th>OperationId</th>
<th><blockquote>
<p>HttpMetho d</p>
</blockquote></th>
<th>ErrorCode</th>
<th style="text-align: center;">UserError</th>
<th style="text-align: center;">Success</th>
<th><blockquote>
<p>ErrorDetails</p>
</blockquote></th>
<th><blockquote>
<p>TeamName</p>
</blockquote></th>
<th><blockquote>
<p>ResourceType</p>
</blockquote></th>
<th><blockquote>
<p>ResourceName</p>
</blockquote></th>
<th><blockquote>
<p>OperationName</p>
</blockquote></th>
<th><blockquote>
<p>Region</p>
</blockquote></th>
<th><blockquote>
<p>TraceSourc e</p>
</blockquote></th>
<th>ResourceGroup</th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T11:53:10.779</p>
<p>8491Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:10.810</p>
<p>1821Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>0512a14f-b45b-4c78-bcba- cac0a3b8c7fd</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>publicIPAddresses</p>
</blockquote></td>
<td><blockquote>
<p>12498857-13b0-4113-806a-</p>
<p>c631da6e48da</p>
</blockquote></td>
<td><blockquote>
<p>PutPublicIpAddressOperatio n</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:10.779</p>
<p>8491Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:11.032</p>
<p>0966Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>0512a14f-b45b-4c78-bcba- cac0a3b8c7fd</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>publicIPAddresses</p>
</blockquote></td>
<td><blockquote>
<p>12498857-13b0-4113-806a-</p>
<p>c631da6e48da</p>
</blockquote></td>
<td><blockquote>
<p>PutPublicIpAddressOperatio n</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:13.076</p>
<p>7439Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:13.110</p>
<p>4134Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>8624f6a6-93dc-45a7-9a54-</p>
<p>d14c9fdf1d99</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Slb</p>
</blockquote></td>
<td><blockquote>
<p>loadBalancers</p>
</blockquote></td>
<td><blockquote>
<p>kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>PutLoadBalancerOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:15.404</p>
<p>8885Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:15.420</p>
<p>9502Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>e3610cc4-8e72-455b- b593-202c29f67ba2</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Slb</p>
</blockquote></td>
<td><blockquote>
<p>loadBalancers</p>
</blockquote></td>
<td><blockquote>
<p>kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>PutLoadBalancerOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:20.264</p>
<p>3083Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:20.298</p>
<p>4760Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>0c58447f-3c62-439b-88df-48a43</p>
<p>a58df48</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkSecurityGro ups</p>
</blockquote></td>
<td><blockquote>
<p>aks-agentpool-29823133-nsg</p>
</blockquote></td>
<td><blockquote>
<p>PutNetworkSecurityGroupO peration</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:20.264</p>
<p>3083Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:20.560</p>
<p>1187Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>0c58447f-3c62-439b-88df-48a43</p>
<p>a58df48</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkSecurityGro ups</p>
</blockquote></td>
<td><blockquote>
<p>aks-agentpool-29823133-nsg</p>
</blockquote></td>
<td><blockquote>
<p>PutNetworkSecurityGroupO peration</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:22.998</p>
<p>7037Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:23.048</p>
<p>9831Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>01822e35-be78-46d0-</p>
<p>a5f0-8f3d5a2dea18</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>virtualNetworks</p>
</blockquote></td>
<td><blockquote>
<p>aks-vnet-29823133</p>
</blockquote></td>
<td><blockquote>
<p>PutVirtualNetworkOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:22.998</p>
<p>7037Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:24.658</p>
<p>5012Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>01822e35-be78-46d0-</p>
<p>a5f0-8f3d5a2dea18</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>virtualNetworks</p>
</blockquote></td>
<td><blockquote>
<p>aks-vnet-29823133</p>
</blockquote></td>
<td><blockquote>
<p>PutVirtualNetworkOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:35.124</p>
<p>3204Z</p></td>
<td><blockquote>
<p>2025-11-28T11:54:35.143</p>
<p>4710Z</p>
</blockquote></td>
<td>4cde1129-cb5f-4214-acdb- a65ffccfca9f</td>
<td><p>201243d9-9af9-44e5-9885-0b15</p>
<p>4fac01fe</p></td>
<td><blockquote>
<p>POST</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>virtualMachineScale Sets</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>ValidateVMScaleSetOperatio n</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_MYRESOURCEGROUP_MYAKSCLUSTER_FR ANCECENTRAL</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:36.343</p>
<p>0875Z</p></td>
<td><blockquote>
<p>2025-11-28T11:54:36.382</p>
<p>9357Z</p>
</blockquote></td>
<td>4cde1129-cb5f-4214-acdb- a65ffccfca9f</td>
<td><p>05e79930-3896-4e3f-a12a-</p>
<p>b22abede7b2a</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkInterfaces</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>BatchPutNicOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:36.358</p>
<p>7006Z</p></td>
<td><blockquote>
<p>2025-11-28T11:54:36.408</p>
<p>1170Z</p>
</blockquote></td>
<td>4cde1129-cb5f-4214-acdb- a65ffccfca9f</td>
<td>bc008fd5-9d81-49da-99f4-37ec3 9bbd2d0</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkInterfaces</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>PutNicOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:36.358</p>
<p>7006Z</p></td>
<td><blockquote>
<p>2025-11-28T11:54:36.408</p>
<p>1315Z</p>
</blockquote></td>
<td>4cde1129-cb5f-4214-acdb- a65ffccfca9f</td>
<td>6c3e2ebf-abe8-4a6f- be37-2f1ce9cb862e</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkInterfaces</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>PutNicOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:36.343</p>
<p>0875Z</p></td>
<td><blockquote>
<p>2025-11-28T11:54:36.408</p>
<p>3574Z</p>
</blockquote></td>
<td>4cde1129-cb5f-4214-acdb- a65ffccfca9f</td>
<td><p>ae1875bf-1571-4282-bf17-</p>
<p>a010d7682fb1</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>virtualMachineScale Sets</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>PutVMScaleSetOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:36.358</p>
<p>7006Z</p></td>
<td><blockquote>
<p>2025-11-28T11:54:36.799</p>
<p>6436Z</p>
</blockquote></td>
<td>4cde1129-cb5f-4214-acdb- a65ffccfca9f</td>
<td>6c3e2ebf-abe8-4a6f- be37-2f1ce9cb862e</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkInterfaces</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>PutNicOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:36.358</p>
<p>7006Z</p></td>
<td><blockquote>
<p>2025-11-28T11:54:36.799</p>
<p>6442Z</p>
</blockquote></td>
<td>4cde1129-cb5f-4214-acdb- a65ffccfca9f</td>
<td>bc008fd5-9d81-49da-99f4-37ec3 9bbd2d0</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkInterfaces</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>PutNicOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 7%" />
<col style="width: 7%" />
<col style="width: 9%" />
<col style="width: 9%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 6%" />
<col style="width: 9%" />
<col style="width: 8%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 13%" />
</colgroup>
<thead>
<tr>
<th><p>2025-11-28T11:54:36.343</p>
<p>0875Z</p></th>
<th><blockquote>
<p>2025-11-28T11:54:36.813</p>
<p>1853Z</p>
</blockquote></th>
<th><p>4cde1129-cb5f-4214-acdb-</p>
<p>a65ffccfca9f</p></th>
<th><p>ae1875bf-1571-4282-bf17-</p>
<p>a010d7682fb1</p></th>
<th><blockquote>
<p>PUT</p>
</blockquote></th>
<th></th>
<th><blockquote>
<p>false</p>
</blockquote></th>
<th><blockquote>
<p>true</p>
</blockquote></th>
<th></th>
<th><blockquote>
<p>Rnm</p>
</blockquote></th>
<th><blockquote>
<p>virtualMachineScale</p>
<p>Sets</p>
</blockquote></th>
<th><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></th>
<th><blockquote>
<p>PutVMScaleSetOperation</p>
</blockquote></th>
<th><blockquote>
<p>francec</p>
</blockquote></th>
<th></th>
<th><p>MC_myResourceGroup_myAKSCluster_francec</p>
<p>entral</p></th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T12:04:00.101</p>
<p>6438Z</p></td>
<td><blockquote>
<p>2025-11-28T12:04:00.115</p>
<p>8249Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>8adf4885-ca8a-4801- bc7f-5f0310b0c653</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>false</p>
</blockquote></td>
<td><blockquote>
<p>true</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>Slb</p>
</blockquote></td>
<td><blockquote>
<p>loadBalancers</p>
</blockquote></td>
<td><blockquote>
<p>kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>PutLoadBalancerOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T12:05:19.696</p>
<p>0419Z</p></td>
<td><blockquote>
<p>2025-11-28T12:05:19.710</p>
<p>0840Z</p>
</blockquote></td>
<td>396c83fc-bef2-4aa9- b916-06482bba1bc4</td>
<td>9dccaf94-922e-4c27-805f-583c9 76387a2</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>false</p>
</blockquote></td>
<td><blockquote>
<p>true</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkInterfaces</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>BatchPutNicOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T12:05:19.680</p>
<p>4165Z</p></td>
<td><blockquote>
<p>2025-11-28T12:05:19.730</p>
<p>7864Z</p>
</blockquote></td>
<td>396c83fc-bef2-4aa9- b916-06482bba1bc4</td>
<td>30dd9615-454d-4caa-a44c- ec0481cc92cf</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>false</p>
</blockquote></td>
<td><blockquote>
<p>true</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>virtualMachineScale Sets</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>PutVMScaleSetOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T12:05:19.758</p>
<p>5447Z</p></td>
<td><blockquote>
<p>2025-11-28T12:05:19.793</p>
<p>7248Z</p>
</blockquote></td>
<td>396c83fc-bef2-4aa9- b916-06482bba1bc4</td>
<td><p>63123644-85c3-40aa-</p>
<p>a81e-691ffcf53470</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>false</p>
</blockquote></td>
<td><blockquote>
<p>true</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>virtualMachineScale Sets</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>PutVMScaleSetOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T12:35:17.601</p>
<p>7769Z</p></td>
<td><blockquote>
<p>2025-11-28T12:35:17.612</p>
<p>9360Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>68c2fe8e-da03-42de-80b2- b84ccc106020</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>false</p>
</blockquote></td>
<td><blockquote>
<p>true</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>Slb</p>
</blockquote></td>
<td><blockquote>
<p>loadBalancers</p>
</blockquote></td>
<td><blockquote>
<p>kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>PutLoadBalancerOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
</tbody>
</table>

#### 2. FrontendOperationEtwEvent

> The FrontendOperationEtwEvent table  will have verbose logs for each operation we see in QosEtwEvent table.

```text
Open in [ADX Web] [Kusto.Explorer] [Fabric] [cluster('nrp.kusto.windows.net').database('mdsnrp')]
FrontendOperationEtwEvent
| where PreciseTimeStamp between(datetime("2025-11-28T11:50:35.1488140Z") .. datetime("2025-11-28T12:54:35.1488140Z"))
| where SubscriptionId has '28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5'
| where ResourceGroup contains "MC_MYRESOURCEGROUP_MYAKSCLUSTER_FRANCECENTRAL"
| where OperationId contains "0512a14f-b45b-4c78-bcba-cac0a3b8c7fd"
| project PreciseTimeStamp, Message, ResourceName, ResourceGroup, HttpMethod, EventCode
```

  <table>
    <thead>
      <tr>
        <th>Message</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          GetNrpAuditEvent completed in 0 ms
          Start->PutPublicIpAddressOperation:11/28/2025 11:53:10 AM
          PUT https://francecentral.network.azure.com:30112/11d2ef40-dfa2-492d-a2df-2c920409c411/134059748699071081/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPAddresses/12498857-13b0-4113-806a-c631da6e48da?api-version=2024-07-01
          x-ms-client-session-id: 6df685b8-5985-4a36-8a00-7233bda89377
          x-ms-client-request-id: 9019190e-cbcd-406f-87a9-48481f70a6d1
          client-request-id: 9019190e-cbcd-406f-87a9-48481f70a6d1
          traceparent: 00-e353f77cd3dabd00c4f3d53a5b9d55ef-287d112921d12775-01
          X-Forwarded-For: 98.66.132.152
          X-Azure-Ref: Ref A: 76AEC75924CD47E38CF374C53F449923 Ref B: PAR611100604031 Ref C: 2025-11-28T11:53:10Z
          X-Forwarded-Host: francecentral.management.azure.com
          X-Forwarded-Proto: https
          X-Azure-RequestChain: hops=1
          X-Azure-JA4-Fingerprint: t13d1311h2_f57a46bbacb6_e7c285222651
          x-ms-operation-context: (appId=7319c514-987d-4e9b-ac3d-d38c4f427f4c, tenantId=16b3c013-d300-468d-ac64-7eda0820b6d3, ...)
          x-ms-arm-resource-system-data: {"createdBy":"7319c514-987d-4e9b-ac3d-d38c4f427f4c", ...}
          Azure-AsyncNotificationUri: https://francecentral.management.azure.com/providers/Microsoft.Resources/notifyResourceJobs?api-version=2018-02-01&asyncNotificationToken=...
          Operation PutPublicIpAddressOperation (0512a14f-b45b-4c78-bcba-cac0a3b8c7fd), thread 872 acquiring lock
          PublicIP '/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/.../12498857-13b0-4113-806a-c631da6e48da' has 'IPv4' configuration
          Standard Static public ip requires a VIP  creating Vip Allocation 47ef59ae-897d-4ff3-9644-0aa33e3a0633 (target: fabric:/rnm/vipmanager/11)
          Added SLbServiceModule /subscriptions/.../slbServiceModule/82075459-09ae-45cc-b234-d4c14e5e077a for V2 public IP
          Incrementing subscription public IP counts (Standard IPv4 = +1)
          AsyncOperation: https://francecentral.management.azure.com/subscriptions/.../operations/0512a14f-b45b-4c78-bcba-cac0a3b8c7fd?api-version=2024-07-01
          Allocating VIP for public ip /subscriptions/.../12498857-13b0-4113-806a-c631da6e48da
          InventoryManagementFacade AllocateVips request (AllocationId: 47ef59ae-897d-4ff3-9644-0aa33e3a0633)
          Completed Async Job Batch (RnmVipAllocationAsyncJobQueue)
          Finished AllocateVips  AllocatedIpAddress: 4.251.129.109
         Allocated public Ip 4.251.129.109 for the resource, allocationId 47ef59ae-897d-4ff3-9644-0aa33e3a0633
        </td>
      </tr>
    </tbody>
    </table>

##### ARM to NRP

```text
Open in [ADX Web] [Kusto.Explorer] [Fabric] [cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd')]
cluster('akshuba.centralus').database('AKSprod').OutgoingRequestTrace
| where PreciseTimeStamp > ago(14d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where httpMethod !contains "GET" and suboperationName !contains "na"
| where operationID contains "6df685b8-5985-4a36-8a00-7233bda89377"
| where targetURI contains "Microsoft.Network"
//| where correlationID contains "17818e60-7ddc-4c69-b5de-03c27724da9d"
| project PreciseTimeStamp, operationName, suboperationName, targetURI, correlationID, statusCode, durationInMilliseconds, operationID
```

  <table>
    <thead>
      <tr>
        <th>operationName</th>
        <th>suboperationName</th>
        <th>targetURI</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>PutManagedClusterHandler.PUT</td>
        <td>Creating</td>
        <td>
          https://francecentral.management.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/providers/Microsoft.Network/locations/francecentral/setResourceOwnership?api-version=2022-07-01
        </td>
      </tr>
      <tr>
        <td>PutManagedClusterHandler.PUT</td>
        <td>Creating</td>
        <td>
          https://francecentral.management.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/providers/Microsoft.Network/locations/francecentral/setResourceOwnership?api-version=202
        </td>
      </tr>
      <tr>
        <td>PutManagedClusterHandler.PUT</td>
        <td>Creating</td>
        <td>
          https://francecentral.management.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/providers/Microsoft.Network/locations/francecentral/setResourceOwnership?api-version=2022-07-01
        </td>
      </tr>
    </tbody>
    </table>

> Note the **correlation ID** and Go to ARM:

```text
//17818e60-7ddc-4c69-b5de-03c27724da9d
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","EventServiceEntries")
| where TIMESTAMP > ago(14d)
| where subscriptionId has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where correlationId contains "17818e60-7ddc-4c69-b5de-03c27724da9d"
| where operationName notcontains "Microsoft.Authorization/policies/auditIfNotExists/action"
| where operationName notcontains "Microsoft.Authorization/policies/audit/action"
| where operationName notcontains "Microsoft.Authorization/policies/deployIfNotExists/action"
| where operationName contains "microsoft.network"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId , status, subStatus , resourceUri , eventName , operationId, armServiceRequestId, subscriptionId
| sort by PreciseTimeStamp desc nulls last
```

<table>
<colgroup>
<col style="width: 6%" />
<col style="width: 10%" />
<col style="width: 4%" />
<col style="width: 8%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 34%" />
<col style="width: 3%" />
<col style="width: 8%" />
<col style="width: 8%" />
<col style="width: 8%" />
</colgroup>
<thead>
<tr>
<th>PreciseTimeStamp</th>
<th><blockquote>
<p>operationName</p>
</blockquote></th>
<th><blockquote>
<p>resourceProvid er</p>
</blockquote></th>
<th><blockquote>
<p>correlationId</p>
</blockquote></th>
<th><blockquote>
<p>status</p>
</blockquote></th>
<th><blockquote>
<p>subStatus</p>
</blockquote></th>
<th><blockquote>
<p>resourceUri</p>
</blockquote></th>
<th style="text-align: center;">eventName</th>
<th>operationId</th>
<th>armServiceRequestId</th>
<th>subscriptionId</th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T12:45:19.</p>
<p>7823426Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>cf418810-080b-4265-95aa-</p>
<p>06b84caa2cdf</p></td>
<td><p>b018e1e9-0e2a-4501-ab45-</p>
<p>d363ba14b772</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:35:17.</p>
<p>9172158Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>NoConten t</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>96ca7b2d-939b-4d4e-9c03- 3c390be37e7d</td>
<td><p>93ec84c1-</p>
<p>cbfe-4de2-90b6-270aa7bfb</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
</tbody>
</table>

**More logs:**

<table>
<colgroup>
<col style="width: 6%" />
<col style="width: 10%" />
<col style="width: 4%" />
<col style="width: 8%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 34%" />
<col style="width: 3%" />
<col style="width: 8%" />
<col style="width: 8%" />
<col style="width: 8%" />
</colgroup>
<thead>
<tr>
<th></th>
<th></th>
<th></th>
<th></th>
<th style="text-align: center;"></th>
<th></th>
<th><blockquote>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></th>
<th></th>
<th></th>
<th>87d</th>
<th></th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T12:35:17.</p>
<p>6933011Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td>96ca7b2d-939b-4d4e-9c03- 3c390be37e7d</td>
<td><p>93ec84c1-</p>
<p>cbfe-4de2-90b6-270aa7bfb 87d</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:35:17.</p>
<p>6280369Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>OK</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>98e640ca-da7d-4881-9b5c- cab1396afc9f</td>
<td><p>b018e1e9-0e2a-4501-ab45-</p>
<p>d363ba14b772</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:35:17.</p>
<p>4191774Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td>98e640ca-da7d-4881-9b5c- cab1396afc9f</td>
<td><p>b018e1e9-0e2a-4501-ab45-</p>
<p>d363ba14b772</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:14:02.</p>
<p>0891667Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>a130d88a-2282-45f6-ac1b-</p>
<p>eb78fc96e7c7</p></td>
<td>9d45fba5-3e66-4ccc-840d- a9b99ff43585</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:04:00.</p>
<p>2911382Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>NoConten t</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>4163a76b-791c-4efb- bee1-47afd088f327</td>
<td><p>38902aa7-</p>
<p>fda6-4e50-9727-0c37b43a3</p>
<p>3d1</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:04:00.</p>
<p>2196885Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td>4163a76b-791c-4efb- bee1-47afd088f327</td>
<td><p>38902aa7-</p>
<p>fda6-4e50-9727-0c37b43a3</p>
<p>3d1</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:04:00.</p>
<p>1845329Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>OK</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan
cers/kubernetes</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>95fe0734-af11-4973-8085- f70405649ea2</td>
<td>9d45fba5-3e66-4ccc-840d- a9b99ff43585</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:03:59.</p>
<p>9643626Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td>95fe0734-af11-4973-8085- f70405649ea2</td>
<td>9d45fba5-3e66-4ccc-840d- a9b99ff43585</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:03:16.</p>
<p>9880558Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>588cd53b-</p>
<p>eb70-4db5-8447-</p>
<p>eaf26497813a</p></td>
<td><p>3b342bef-</p>
<p>f197-4368-9f35-2b04af66f4f 9</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:32.</p>
<p>8071545Z</p></td>
<td><blockquote>
<p>Microsoft.Network/locations/setReso urceOwnership/action</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Accepted</td>
<td><blockquote>
<p>Accepted</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/providers/Microsoft.Network/locations/francecentral</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>c0a2587b-</p>
<p>b375-4070-8c01-5c27464d8</p>
<p>3db</p></td>
<td>778eea40-98d6-405d-af0c- ea3ae9aac820</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:32.</p>
<p>7288580Z</p></td>
<td><blockquote>
<p>Microsoft.Network/locations/setReso urceOwnership/action</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/providers/Microsoft.Network/locations/francecentral</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><p>c0a2587b-</p>
<p>b375-4070-8c01-5c27464d8</p>
<p>3db</p></td>
<td>778eea40-98d6-405d-af0c- ea3ae9aac820</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:25.</p>
<p>9278954Z</p></td>
<td><blockquote>
<p>Microsoft.Network/virtualNetworks/ write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/virtualNet</p>
<p>works/aks-vnet-29823133</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>6ee6f320-2056-481d- b836-50bb56a029f9</td>
<td>c80518c1-7350-4ee7-8fb4- b5cb66529714</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:25.</p>
<p>0954613Z</p></td>
<td><blockquote>
<p>Microsoft.Network/networkSecurityG roups/write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/networkS</p>
<p>ecurityGroups/aks-agentpool-29823133-nsg</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>cb4b665d-2a09-456a-bfe9- f14a8c15ce17</td>
<td>6f25f8f3-09f3-4eea-ba9f- a32556f468f5</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:23.</p>
<p>1717608Z</p></td>
<td><blockquote>
<p>Microsoft.Network/virtualNetworks/ write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Accepted</td>
<td><blockquote>
<p>Created</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/virtualNet
works/aks-vnet-29823133</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>7ef60c21-7b23-4611-a536-</p>
<p>fed991ef2664</p></td>
<td>c80518c1-7350-4ee7-8fb4- b5cb66529714</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:22.</p>
<p>6676037Z</p></td>
<td><blockquote>
<p>Microsoft.Network/virtualNetworks/ write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/virtualNet</p>
<p>works/aks-vnet-29823133</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><p>7ef60c21-7b23-4611-a536-</p>
<p>fed991ef2664</p></td>
<td>c80518c1-7350-4ee7-8fb4- b5cb66529714</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:20.</p>
<p>3993294Z</p></td>
<td><blockquote>
<p>Microsoft.Network/networkSecurityG roups/write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Accepted</td>
<td><blockquote>
<p>Created</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/networkS</p>
<p>ecurityGroups/aks-agentpool-29823133-nsg</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>18177c24-b614-48ae-b3b3-</p>
<p>ab9da5ef38cf</p></td>
<td>6f25f8f3-09f3-4eea-ba9f- a32556f468f5</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:20.</p>
<p>1552363Z</p></td>
<td><blockquote>
<p>Microsoft.Network/networkSecurityG roups/write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/networkS</p>
<p>ecurityGroups/aks-agentpool-29823133-nsg</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><p>18177c24-b614-48ae-b3b3-</p>
<p>ab9da5ef38cf</p></td>
<td>6f25f8f3-09f3-4eea-ba9f- a32556f468f5</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:16.</p>
<p>5057344Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>NoConten t</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>07d4f337-</p>
<p>ec7a-4e04-90a2-8ee040318</p>
<p>5a5</p></td>
<td><p>e1b2df62-</p>
<p>b85f-46be-8eb8-5c98c2b18 f28</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:16.</p>
<p>3891275Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><p>07d4f337-</p>
<p>ec7a-4e04-90a2-8ee040318</p>
<p>5a5</p></td>
<td><p>e1b2df62-</p>
<p>b85f-46be-8eb8-5c98c2b18 f28</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:16.</p>
<p>3479226Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>OK</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>ca4c66e1-dcd0-4747-8d80- ff7fb3be6c04</td>
<td><p>254e9255-3968-4e43-af06-</p>
<p>e81c6ab24fe8</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:16.</p>
<p>0502352Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA
ddresses/12498857-13b0-4113-806a-c631da6e48da</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>50171154-1483-490d-8e5a-</p>
<p>575af1cd3c27</p></td>
<td>a4470ee5-8268-4b2c-b2e4- ac3217562334</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:15.</p>
<p>3085762Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td>ca4c66e1-dcd0-4747-8d80- ff7fb3be6c04</td>
<td><p>254e9255-3968-4e43-af06-</p>
<p>e81c6ab24fe8</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:13.</p>
<p>4893965Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>NoConten t</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>9f0b483b-be5b-4382- b43a-08e34b9e0b9d</td>
<td>b8adfbd0-e19f-4029-80de- b5152430a90e</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:13.</p>
<p>4518011Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td>9f0b483b-be5b-4382- b43a-08e34b9e0b9d</td>
<td>b8adfbd0-e19f-4029-80de- b5152430a90e</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:13.</p>
<p>2028689Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>Created</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>e0255231-fcca-4195-</p>
<p>a072-6e9d8f878d6b</p></td>
<td><p>3b342bef-</p>
<p>f197-4368-9f35-2b04af66f4f 9</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:12.</p>
<p>8131833Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><p>e0255231-fcca-4195-</p>
<p>a072-6e9d8f878d6b</p></td>
<td><p>3b342bef-</p>
<p>f197-4368-9f35-2b04af66f4f 9</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:10.</p>
<p>9364582Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Accepted</td>
<td><blockquote>
<p>Created</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/12498857-13b0-4113-806a-c631da6e48da</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>f93963d7-c1fa-4973-9e87- e95e2b770094</td>
<td>a4470ee5-8268-4b2c-b2e4- ac3217562334</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:10.</p>
<p>6040214Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/12498857-13b0-4113-806a-c631da6e48da</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td>f93963d7-c1fa-4973-9e87- e95e2b770094</td>
<td>a4470ee5-8268-4b2c-b2e4- ac3217562334</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
</tbody>
</table>
#### Owner and Contributors

**Owner:** Saber MHEDHBI <mhedhbisaber@microsoft.com>

**Contributors:**

- Saber MHEDHBI <mhedhbisaber@microsoft.com>

---

## Scenario 18: Service-Connector-with-AKS
> 来源: ado-wiki-b-Service-Connector-with-AKS.md | 适用: 适用范围未明确

### 排查步骤

#### Service-Connector-with-AKS


#### Description

Service Connector: Service Connector helps you connect Azure compute services to other backing services. Service Connector configures the network settings and connection information (for example, generating environment variables) between compute services and target backing services in management plane. Developers use their preferred SDK or library that consumes the connection information to do data plane operations against the target backing service.

<https://learn.microsoft.com/en-us/azure/service-connector/overview#what-is-service-connector-used-for>

#### Feature with AKS

Create a new Azure Kubernetes Service (AKS) cluster to connect your AKS resource to other Azure services.

[Create a service connection in Azure Kubernetes Service (AKS) from the Azure portal | Microsoft Learn](https://learn.microsoft.com/en-us/azure/service-connector/quickstart-portal-aks-connection?tabs=UMI)

#### Triage

When there is an error, check the error message first to decide whether this is an extension agent error, or a Service Connector specific error.

If the error is related to **extension creation** or **helm installation**, it is an extension agent error. The typical errors are like:

* Unable to get a response from the agent in time
* Extension pods can't be scheduled if all the node pools in the cluster are "CriticalAddonsOnly" tainted
* Timed out waiting for resource readiness
* Unable to download the Helm chart from the repo URL
* Helm chart rendering failed with given values
* Resource already exists in your cluster
* Operation is already in progress for Helm

For any errors else, it is more likely a Service Connector specific error. Typical errors are like:

* Operation returned an invalid status code: Conflict
* You do not have permission to perform ... If access was recently granted, please refresh your credentials.
* The subscription is not registered to use namespace 'Microsoft.KubernetesConfiguration'

#### Troubleshoot

If this is an extension agent error:

* Try the extension agent [troubleshooting doc.](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/cluster-extension-deployment-errors)
* Create an incident for the extension agent team: Cluster Configuration / Cluster Configuration Triage.

If this is a Service Connector specific error:

* Try the Service Connector for AKS [troubleshooting doc](https://learn.microsoft.com/en-us/azure/service-connector/how-to-use-service-connector-in-aks#common-errors-and-mitigations).
* Collect information according to [Service Connector for AKS logs](https://learn.microsoft.com/en-us/azure/service-connector/how-to-use-service-connector-in-aks#check-kubernetes-cluster-logs).
* Create an incident for the Service Connector team: Service Connector/Azure Service Connector Team, with the information gathered in the second step.

#### Owner and Contributors

**Owner:** Megha Dubey <meghadubey@microsoft.com>

---

## Scenario 19: AKS Backup Troubleshooting
> 来源: ado-wiki-b-aks-backup-troubleshooting.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Backup Troubleshooting

#### Summary

Guide for troubleshooting Azure Backup installation and operation issues on AKS clusters. The backup extension is an Azure Arc-enabled Kubernetes cluster extension delivered via Helm Chart.

#### Prerequisites Checklist

##### Required Resource Providers

```bash
Microsoft.KubernetesConfiguration
Microsoft.DataProtection
Microsoft.ContainerService
```

Register with: `az provider register --namespace <namespace>`

##### Backup Vault

- Must be in the same region as the AKS cluster
- Must have **Trusted Access** enabled to bypass kube-apiserver endpoint
- Role: `Microsoft.DataProtection/backupVaults/backup-operator`

##### Enable Trusted Access

```bash
az aks trustedaccess rolebinding create \
  --resource-group <aksclusterrg> \
  --cluster-name <aksclustername> \
  --name <randomRoleBindingName> \
  --source-resource-id $(az dataprotection backup-vault show --resource-group <vaultrg> --vault <VaultName> --query id -o tsv) \
  --roles Microsoft.DataProtection/backupVaults/backup-operator
```

##### CSI Drivers (Kubernetes >= 1.21.1)

```bash
az aks update \
  --name myAKSCluster \
  --resource-group myResourceGroup \
  --enable-disk-driver \
  --enable-file-driver \
  --enable-blob-driver \
  --enable-snapshot-controller
```

Verify: `storageProfile` should show `"enabled": true` for all drivers.

##### Network Requirements

- Firewall: Allow access to MCR (Microsoft Container Registry)
- Azure Policy: If enforced, add `dataprotection-microsoft` namespace to exception list
- NSG: Inbound rules for service tags `azurebackup` and `azurecloud`
- Blob container must not contain existing unrelated files

##### Required FQDNs

```
mcr.microsoft.com:443 (HTTPS)
*.data.mcr.microsoft.com:443 (HTTPS)
mcr-0001.mcr-msedge.net:443 (HTTPS)
```

#### Common Installation Issues

##### Extension Install Hangs Until Timeout

**Symptom**: `az k8s-extension create` command hangs, eventually times out.

**Root Cause**: Network connectivity issue preventing the cluster from reaching MCR to download extension catalog manifest and Helm chart images.

**Error Indicators**:
```
failed to do request: Head "https://mcr.microsoft.com/v2/azurearck8s/extension-catalog/manifests/public": dial tcp: lookup mcr.microsoft.com: i/o timeout
```

**Resolution**:
1. Verify firewall/NSG rules allow outbound to MCR endpoints
2. Check DNS resolution from cluster nodes: `nslookup mcr.microsoft.com`
3. Verify no proxy is blocking HTTPS traffic to MCR
4. Check if the cluster is a private cluster and needs appropriate egress configuration

---

## Scenario 20: Validating Azure Policies in AKS
> 来源: ado-wiki-b-validating-azure-policies-in-aks.md | 适用: 适用范围未明确

### 排查步骤

#### Validating Azure Policies in AKS

#### Summary

Guide for validating and testing Azure Policy definitions in AKS using the Rego Playground. Useful when reproducing policy issues or verifying ConstraintTemplate/CRD definitions without needing a live cluster with policies enabled.

#### Existing Policies and How to Get Their Definition

List policies on a cluster:
```bash
kubectl get constrainttemplate
```

Built-in policy code available at: https://docs.microsoft.com/en-us/azure/aks/policy-reference

To get the Rego code:
1. Open a policy definition from the built-in list
2. Look for the `constraintTemplate` property and open the URL
3. In the YAML, copy the content after `rego: |` - this is the policy code

##### Alternative Way (from cluster)
```bash
kubectl describe constrainttemplate k8sazureenforceapparmor
```

#### Testing with Rego Playground

1. Paste the Rego code into the left pane of the [Rego Playground](https://play.openpolicyagent.org/)
2. In the top right pane, paste a pod definition in JSON format (from `kubectl get pod <POD_NAME> -o json`)
3. Hit "Evaluate" button
4. Check the Output pane at the bottom left for results

From there you can modify the pod definition to test what configurations trigger or pass the policy.

#### Samples

- AppArmor: https://play.openpolicyagent.org/p/EDFuwLv3L8
- Container Allowed Ports: https://play.openpolicyagent.org/p/5ZMFtiMyPu

#### References

- Secure your cluster with Azure Policy: https://docs.microsoft.com/en-us/azure/aks/use-azure-policy
- Azure Policy built-in definitions for AKS: https://docs.microsoft.com/en-us/azure/aks/policy-reference
- The Rego Playground: https://play.openpolicyagent.org/

---

## Scenario 21: How IP address allocation works in AKS and how to troubleshoot based on IP address
> 来源: ado-wiki-c-IP-Address-Allocation-AKS.md | 适用: 适用范围未明确

### 排查步骤

#### How IP address allocation works in AKS and how to troubleshoot based on IP address


#### Scope

Sometimes, the customers want to know/understand how the IP addresses are allocated for their nodes or pods inside the AKS clusters. They also might state that they have issues with IP addresses assignment or we simply need to troubleshoot things related to IP addresses.

In this Wiki I will:

  Explain how the IP address allocation works for both network plugins, Kubenet and Azure CNI, including an example

  Provide you a very useful Kusto query and based on that example I will show you how to investigate/troubleshooting different scenarios

For any question, clarification, improvement or in case this gets outdated, feel free to contact me on Teams or email: <andbar@microsoft.com>

#### Special thanks

Thank you Mohammed Abu Taleb for helping me with the Kusto query provided in this Wiki!

#### Theoretical explanation

In an AKS cluster, 5 IP addresses from a subnet will be reserved by Azure.

  x.x.x.0: Network address

  x.x.x.1: Reserved by Azure for the default gateway

  x.x.x.2, x.x.x.3: Reserved by Azure to map the Azure DNS IPs to the VNet space

  x.x.x.255: Network broadcast address

The IP address allocation will be done based on the first range of available IP address/first IP address taking in consideration the number.

##### Kubenet model

The first IP address of a node will be .4, then .5 and so on. If a node is deleted, its IP address will not be in use anymore and the next added node can assign it.

Pods receive an IP address from a logically different address space to the Azure virtual network subnet of the nodes. Network address translation (NAT) is then configured so that the pods can reach resources on the Azure virtual network. The source IP address of the traffic is NAT'd to the node's primary IP address. This approach greatly reduces the number of IP addresses that you need to reserve in your network space for pods to use.

##### Azure CNI model

The first IP address of a node will be .4 and the next IP addresses will be reserved for node s pods based on the max-pods parameter and so on.

If a node is deleted, its IP address and the ones reserved for the pods will be free and the next added node will get them assigned.

##### Practical example for Azure CNI

I create a cluster with Azure CNI 2 nodes and the default max-pods parameter: 30 pods per node. The nodes have the IP addresses .4 and .35. The  gap  between them is reserved for pods because the cluster is using Azure CNI.

![image.png](/.attachments/image-5b9dcc32-2131-43e3-8594-bb2328f07bee.png)

Then I scaled up one more node which got IP address .66.

![image.png](/.attachments/image-c8f0aae0-c23d-400d-8b1f-ed82a5315261.png)

The next step was to delete the instance 1. Now there is a gap for IP addresses .35-.65

![image.png](/.attachments/image-2699c647-5cef-4c72-bed6-8cc6bef0b39a.png)
![image.png](/.attachments/image-f7f855d3-a125-41f7-ad61-3dc87e8857f5.png)

Then I scaled up one more node and instance 3 was added. The IP allocation works like this: it is looking for the next available range. In this case, it was the one used before by instance 1, so instance 3 uses now IP address .35

![image.png](/.attachments/image-1bba2c37-3e1f-4ce4-bc96-bbd26d170971.png)

##### How to investigate/troubleshoot this kind of scenario (based on the above practical example)

For many reasons, we might need to troubleshooting this kind of scenario, maybe at a higher level. Further, I will present you a very powerful Kusto query and show you how to investigate, based on my above actions.

```kql
Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] https://nrp.kusto.windows.net/binrp
union cluster("nrp").database("mdsnrp").FrontendOperationEtwEvent
//| where PreciseTimeStamp > datetime(2020-07-10 00:00:00) and PreciseTimeStamp < datetime(2021-09-29 23:59:59)
| where PreciseTimeStamp > ago(5d)
| where SubscriptionId has "{SubscriptionID}"
| where ResourceGroup contains "{MC_ResourceGroup}"
| where HttpMethod == "PUT"
| project PreciseTimeStamp, Message, ResourceName, ResourceGroup, HttpMethod, OperationId, SubscriptionId,
EventCode, EventName
```

This will show you a lot of information, but customized properly, it will show you the needed information.

For example, let s check:

1   What used the IP address 10.240.0.35? We will customize the query like this:

```kql
Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] https://nrp.kusto.windows.net/binrp
union cluster("nrp").database("mdsnrp").FrontendOperationEtwEvent
//| where PreciseTimeStamp > datetime(2020-07-10 00:00:00) and PreciseTimeStamp < datetime(2021-09-29 23:59:59)
| where PreciseTimeStamp > ago(5d)
| where SubscriptionId has "{SubscriptionID}"
| where ResourceGroup contains "{MC_rgip_ip_westeurope}"
| where HttpMethod == "PUT"
| where Message startswith "Assigned ipaddress"
| where Message contains "10.240.0.35"
| project PreciseTimeStamp, Message
```

Output:

```text
2021-02-07 15:33:59.9617264

Assigned ipaddress 10.240.0.35 to ipconfig /subscriptions/SubscriptionID/resourceGroups/MC_rgip_ip_westeurope/providers/Microsoft.Network/networkInterfaces/|providers|Microsoft.Compute|virtualMachineScaleSets|aks-nodepool1-16552129-vmss|virtualMachines|1|networkInterfaces|aks-nodepool1-16552129-vmss/ipConfigurations/ipconfig1
```

```text
2021-02-07 15:59:19.0816620

Assigned ipaddress 10.240.0.35 to ipconfig /subscriptions/SubscriptionID/resourceGroups/MC_rgip_ip_westeurope/providers/Microsoft.Network/networkInterfaces/|providers|Microsoft.Compute|virtualMachineScaleSets|aks-nodepool1-16552129-vmss|virtualMachines|3|networkInterfaces|aks-nodepool1-16552129-vmss/ipConfigurations/ipconfig1
```

As we can see, we have two entries:

-one for aks-nodepool1-16552129-vmss000001 which was created the same time with the cluster

-one for aks-nodepool1-16552129-vmss000003 which I scaled up and got the IP address used by aks-nodepool1-16552129-vmss000001 before. That IP address was taken by aks-nodepool1-16552129-vmss000003 because it was the first available. Also, the range 10.240.0.36-10.240.0.65 will be reserved for pod s IP addresses. We will check that in example 2.

2   What IP addresses are used by a specific machine (including its pod): aks-nodepool1-16552129-vmss000003? We will customize the query like this:

```kql
Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] https://nrp.kusto.windows.net/binrp
union cluster("nrp").database("mdsnrp").FrontendOperationEtwEvent
//| where PreciseTimeStamp > datetime(2020-07-10 00:00:00) and PreciseTimeStamp < datetime(2021-09-29 23:59:59)
| where PreciseTimeStamp > ago(5d)
| where SubscriptionId has "{SubscriptionID}"
| where ResourceGroup contains "{MC_rgip_ip_westeurope}"
| where HttpMethod == "PUT"
| where Message startswith "IpConfigsBeingAssigned"
| where Message contains "/subscriptions/baa1edbb-xxxx-xxxx-xxx-ef510ec/resourceGroups/MC_RG/providers/Microsoft.Network/networkInterfaces/|providers|Microsoft.Compute|virtualMachineScaleSets|aks-nodepool1-16552129-vmss|virtualMachines|3"
| project PreciseTimeStamp, Message
```

Output (I will provide the PreciseTimeStamp, the output of a line as example and a screenshot with last which shows the instance, ipconfig and the IP address itself because the output is big and I don t want to make this Wiki full of logs):

```text
2021-02-07 15:59:19.0819736

IpConfigsBeingAssigned :

 IpconfigID : PrivateIPAddress : IPAddressVersion

/subscriptions/SubscriptionID/resourceGroups/MC_rgip_ip_westeurope/providers/Microsoft.Network/networkInterfaces/|providers|Microsoft.Compute|virtualMachineScaleSets|aks-nodepool1-16552129-vmss|virtualMachines|3|networkInterfaces|aks-nodepool1-16552129-vmss/ipConfigurations/ipconfig31 : 10.240.0.65 : IPv4
```

![image.png](/.attachments/image-59558cfa-7aab-459b-a7a2-ce330ecf78bf.png)

These scenarios are not the only ones you can use the above Kusto query. Feel free to use it and identify the best way it might fit your needs.

You can get back to me on Teams or email (<andbar@microsoft.com>) in case you find any other scenario that worth to be mentioned. Also, feel free to reach for any question, clarification, improvement or in case this gets outdated.

#### Reference links

IP addresses reserved by Azure

<https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq#are-there-any-restrictions-on-using-ip-addresses-within-these-subnets>

Kubenet

<https://docs.microsoft.com/en-us/azure/aks/configure-kubenet>

<https://docs.microsoft.com/en-us/azure/aks/concepts-network#kubenet-basic-networking>

Azure CNI

<https://docs.microsoft.com/en-us/azure/aks/configure-azure-cni>

<https://docs.microsoft.com/en-us/azure/aks/concepts-network#azure-cni-advanced-networking>

#### Owner and Contributors

**Owner:** Kavyasri Sadineni <ksadineni@microsoft.com>

**Contributors:**

- Kavyasri Sadineni <ksadineni@microsoft.com>
- Luis Alvarez <lualvare@microsoft.com>
- Enrique Lobo Breckenridge <enriquelo@microsoft.com>
- Andrei Barbu <andbar@microsoft.com>

---

## Scenario 22: Troubleshooting Flow
> 来源: ado-wiki-capturing-memory-dumps-aks-nodes.md | 适用: 适用范围未明确

### 排查步骤

##### 1. SSH into AKS node

Options:
- [Official docs](https://docs.microsoft.com/en-us/azure/aks/node-access)
- [kubectl-exec tool](https://github.com/mohatb/kubectl-exec)
- [kubego tool](https://github.com/mohatb/kubego)

Note: SSH into the node where the target pod resides.

##### 2. Identify container process ID

```bash
ps -ef | grep <pod-name>
```

##### 3. Generate core file with GDB

```bash
gdb -p <process-id>
(gdb) generate-core-file
(gdb) quit
```

Note: `gcore` command is an alias for `gdb` and can be used interchangeably.

##### 4. Copy core file

```bash
scp user@remote_host:/path/to/core /local/path
```

Core file is usually named `core` or `core.<process_id>` in the working directory.

---

## Scenario 23: Check whether overlake is enabled on the backend host of the AKS nodes
> 来源: ado-wiki-check-overlake-enabled-aks-nodes.md | 适用: 适用范围未明确

### 排查步骤

#### Check whether overlake is enabled on the backend host of the AKS nodes

> IMPORTANT NOTE: The information in this wiki is **STRICTLY** Microsoft Confidential. Do not share this information with customers under any circumstance. Any questions, please discuss with a TA.

#### Summary

This article aims to provide a method to check whether overlake is enabled on the backend host of the AKS nodes and check the historic agent pool/VMSS of the AKS cluster.

#### Details

##### What is Overlake?

Overlake expands the reach of Azure into Mission Critical and Cost Sensitive Workloads through the addition of dedicated hardware that increases performance, reduces jitter and improves latency resulting in more deterministic customer workloads.

- [Architecture Document](https://eng.ms/docs/cloud-ai-platform/azure-core/core-compute-and-host/general-purpose-host-arunki/host-networking/datapath-documentation/overlake/overview)

##### Kusto Query

Check the status of the current AKS nodes.

- If SocNodeId has a string of characters, it means overlake is enabled on the backend host.
- If SocNodeId is "00000000-0000-0000-0000-000000000000", it means overlake isn't enabled.

```kql
let qCCP = "<CCP_ID>";
let qNodePool = "";
let qInstance = "";
let AKSCCPlogsKusto = "https://aksccplogshk.eastasia.kusto.windows.net";
set best_effort=true;
let InjectBase10_Temp = (T:(*)) {
    let hextra_length = 6;
    let charList = "0123456789abcdefghijklmnopqrstuvwxyz";
    T
    | extend base36 = tolower(column_ifexists('base36', ''))
    | extend profile = column_ifexists('availabilityProfile', '')
    | extend hexatridecimal = iff(profile =~ 'AvailabilitySet', 'n/a', substring(base36, strlen(base36) - hextra_length, strlen(base36)))
    | extend parts = split(base36, '-')
    | extend ss_name = case(
        base36 contains "vmss", tostring(substring(base36, 0, indexof(base36, 'vmss') + 4)),
        profile =~ 'AvailabilitySet', strcat(parts[0], "-", parts[1], "-", parts[2]),
        substring(base36, 0, strlen(base36) - hextra_length)
    )
    | extend reversed = reverse(hexatridecimal)
    | extend power_0 = toint(indexof(charList, substring(reversed, 0, 1))) * pow(36, 0)
    | extend power_1 = toint(indexof(charList, substring(reversed, 1, 1))) * pow(36, 1)
    | extend power_2 = toint(indexof(charList, substring(reversed, 2, 1))) * pow(36, 2)
    | extend power_3 = toint(indexof(charList, substring(reversed, 3, 1))) * pow(36, 3)
    | extend power_4 = toint(indexof(charList, substring(reversed, 4, 1))) * pow(36, 4)
    | extend power_5 = toint(indexof(charList, substring(reversed, 5, 1))) * pow(36, 5)
    | extend sum_of_powers = toint(power_0 + power_1 + power_2 + power_3 + power_4 + power_5)
    | extend base10 = case(
        profile =~ 'AvailabilitySet', base36,
        profile =~ 'VirtualMachines', base36,
        isnotempty(hexatridecimal), strcat('_', ss_name, '_', sum_of_powers),
        ''
    )
    | project-away reversed, power_0, power_1, power_2, power_3, power_4, power_5, sum_of_powers, parts, profile
};
let nodePools = materialize(
    cluster(AKSprodURI()).database('AKSprod').AgentPoolSnapshot
    | where PreciseTimeStamp > ago(1h)
    | where cluster_id =~ qCCP and (isempty(qNodePool) or name == qNodePool)
    | summarize
        take_any(managedClusterResourceGroup, subscription, orchestratorVersion, osSku, vmSize, distro, configurationVersion, agentPoolVersionProfile, osType, availabilityProfile, mode)
        by pool = name, cluster_id
    | extend nodeImageReference = tostring(agentPoolVersionProfile.nodeImageReference.id)
    | extend isWindows = osType =~ "windows"
);
let managedRG = toscalar(nodePools | take 1 | project managedClusterResourceGroup);
let subscription = toscalar(nodePools | take 1 | project subscription);
let noNodePools = datatable( pool:string ) ['']
| extend cluster_id=qCCP, managedClusterResourceGroup=managedRG, subscription=subscription, isWindows=false;
let allNodePools = union nodePools, noNodePools;
let infrainfo = materialize(
    cluster('AzureCM').database('AzureCM').LogContainerSnapshot
    | where subscriptionId contains subscription
    | where PreciseTimeStamp >= ago(2h)
    | where CloudName == 'Public' and Tenant !has 'TMBox'
    | distinct roleInstanceName, subscriptionId, creationTime, virtualMachineUniqueId, Tenant, containerId, nodeId, containerType
    | join kind=inner(
    cluster('azuredcm').database('AzureDCMDb').ResourceSnapshotHistoryV1
    | distinct nodeId = ResourceId, SocNodeId = PairId, CpuArchitecture
    ) on nodeId
);
cluster('akshuba.centralus').database('AKSccplogs').KubeAudit
| where PreciseTimeStamp > ago(1h)
| where cluster_id =~ qCCP and objectRef.resource == 'nodes'
| where verb in ('patch', 'update') and level !in ('Metadata')
| extend node = tostring(objectRef.name)
| summarize hint.num_partitions = 24 hint.strategy=shuffle hint.shufflekey=node
    take_any(cluster_id, objectRef, requestObject, responseStatus),
    take_anyif(responseObject, responseObject != 'na')
    by node
| where requestObject.kind !in ('Binding', 'DeleteOptions')
| extend metadata = responseObject.metadata
| extend created = todatetime(metadata.creationTimestamp)
| extend metaSKU = tostring(metadata.labels['node.kubernetes.io/instance-type'])
| mv-apply address = coalesce(responseObject.status.addresses, dynamic([{"type": "InternalIP","address":""}])) on
(
    where address.type == "InternalIP" | project internal_ip = tostring(address.address)
)
| extend base36 = node
| extend internal_ip = coalesce(internal_ip, "No Data")
| extend created = coalesce(created, datetime(null))
| extend poolFromName = case (
    base36 startswith "aks-", tostring(split(base36, '-')[1]),
    base36 startswith "aks", substring(base36, 3, strlen(base36) - 9),
    ""
)
| extend pool = coalesce(
    tostring(metadata.labels['kubernetes.azure.com/agentpool']),
    tostring(metadata.labels['agentpool']),
    tostring(metadata.labels['karpenter.sh/nodepool']),
    poolFromName
)
| extend isUnmanagedNode = (pool == "" or isnotempty(metadata.labels['karpenter.sh/nodepool']))
| extend containerdRuntimeVersion = tostring(responseObject.status.nodeInfo.containerRuntimeVersion)
| extend kubeletVersion = tostring(responseObject.status.nodeInfo.kubeletVersion)
| extend isStretch = case(
    isempty(responseObject.metadata.labels), 'Unknown',
    iff(responseObject has "kubernetes.azure.com/stretch", "True", "False")
)
| where isempty(qNodePool) or pool == qNodePool
| join kind=leftouter allNodePools on cluster_id, pool
| invoke InjectBase10_Temp()
| extend base10 = column_ifexists("base10", '')
| where isempty(qInstance) or base10 == qInstance
| project cluster_id, base36, roleInstanceName=base10, hexatridecimal, pool, vmSize, orchestratorVersion
| join kind=leftouter infrainfo on roleInstanceName
| extend overlakeStatus = iif(SocNodeId == "00000000-0000-0000-0000-000000000000", "FALSE", "TRUE")
| project pool, vmSize, base36, roleInstanceName, orchestratorVersion, overlakeStatus, SocNodeId, creationTime, nodeId, virtualMachineUniqueId
| sort by base36
```

##### Previous breakdown steps with Kusto, dridash and ASC

```kql
cluster('AzureCM').database('AzureCM').LogContainerSnapshot
| where subscriptionId == "<subscriptionId>"
| where roleInstanceName contains "<vmssName>"
| where PreciseTimeStamp >= ago(9h)
| project  roleInstanceName, containerType, Tenant, nodeId, containerId
| distinct roleInstanceName, containerType, Tenant, nodeId, containerId
| join kind=inner(
    cluster('azuredcm').database('AzureDCMDb').ResourceSnapshotHistoryV1
    | project nodeId = ResourceId, SocNodeId = PairId, CpuArchitecture
) on nodeId
| project roleInstanceName, containerType, Tenant, nodeId, containerId, SocNodeId, CpuArchitecture
| distinct roleInstanceName, containerType, Tenant, nodeId, containerId, SocNodeId, CpuArchitecture
```

**dridash in Azure Data Explorer**

Search the NodeId in [aka.ms/dridash](https://dataexplorer.azure.com/dashboards/bea4ccac-baf1-45f3-b160-533232cbfdaa).

- "True/10" - Enabled
- "False" - Not Enabled

**Note:** If you fail to get result from Azurehn database, you need to join to AznwKustoReader group. Navigate to IDWeb and select the one with the Description, "Azure Network Kusto Data Reader".
<https://idweb.microsoft.com/IdentityManagement/aspx/common/GlobalSearchResult.aspx?searchtype=e0c132db-08d8-4258-8bce-561687a8a51e&content=%20AznwKustoReader>

**You can get the NodeId from ASC.**

#### Check the historic agent pool/VMSS of the AKS cluster

```kql
let startTime = ago(1d);
let subID = "<Subscription_Id>";
let cluster = "<Cluster_Name>";
cluster('akshuba.centralus').database('AKSprod').ManagedClusterSnapshot
| where TIMESTAMP > startTime
| where subscription == subID
| where clusterName in (cluster)
| distinct managedClusterResourceGroup,clusterName
| lookup kind=leftouter (
cluster('azcrp.kusto.windows.net').database('crp_allprod').VmssVMApiQosEvent
    | where subscriptionId == subID
    | distinct vMScaleSetName,resourceGroupName,subscriptionId
    ) on $left.managedClusterResourceGroup==$right.resourceGroupName
| lookup kind=leftouter (
cluster('azcrpbifollower.kusto.windows.net').database('bi_allprod').VMScaleSet
    | where SubscriptionId contains subID
    | summarize min(PreciseTimeStamp), max(PreciseTimeStamp) by vmssName=tolower(VMScaleSetName), VMScaleSetTimeCreated
    | project vmssName, VMScaleSetTimeCreated, StartTimeStamp=min_PreciseTimeStamp, EndTimeStamp=max_PreciseTimeStamp
    ) on $left.vMScaleSetName==$right.vmssName
| lookup kind=leftouter (
cluster('azurecm.kusto.windows.net').database('AzureCM').LogContainerSnapshot
    | where subscriptionId == subID
    | extend vmssName=tostring(split(roleInstanceName,'_')[1])
    | distinct vmssName, containerType
    ) on $left.vMScaleSetName==$right.vmssName
| sort by VMScaleSetTimeCreated desc
```

#### Reference

- <https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/677371/Project-Overlake>
- <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/928150/Overlake(SoC)-Node-Investigation_Restarts>
- <https://eng.ms/docs/cloud-ai-platform/ahsi-organization/ahsi/redsa-team/cloud-hardware-infrastructure-engineering-chie/csice-wiki/livesite-ops/overlake-playbook>

#### Owner and Contributors

**Owner:** Tom Zhu <zhuwei@microsoft.com>

---

## Scenario 24: CoreDNS and NodeLocalDNS in Kubernetes (AKS Focus)
> 来源: ado-wiki-coredns-nodelocaldns-aks.md | 适用: 适用范围未明确

### 排查步骤

#### CoreDNS and NodeLocalDNS in Kubernetes (AKS Focus)

#### Part I: CoreDNS Behavior in AKS

##### DNS Policies

| Policy | Behavior |
|---------|-----------|
| ClusterFirst | Pod → CoreDNS (10.0.0.10) → upstream DNS if not resolved |
| Default | Pod → node DNS (168.63.129.16) directly |

##### ClusterFirst Resolution Chain (ndots:5)

For FQDN `microsoft.com` with `ndots:5`:
1. microsoft.com.default.svc.cluster.local → NXDOMAIN
2. microsoft.com.svc.cluster.local → NXDOMAIN
3. microsoft.com.cluster.local → NXDOMAIN
4. microsoft.com.{private-dns}.internal.cloudapp.net → forwarded to Azure DNS
5. microsoft.com. → forwarded to upstream DNS

##### CoreDNS Logging

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns-custom
  namespace: kube-system
data:
  log.override: |
    log
```
Apply and restart: `kubectl -n kube-system rollout restart deployment coredns`

##### Known Challenges

- **Network Bottlenecks**: All DNS queries traverse cluster CNI → latency/packet loss in large clusters
- **Conntrack Table Exhaustion**: UDP tracked in conntrack → thousands of short-lived entries → when full, queries dropped silently → DNS timeouts. Check: `conntrack -L | grep 10.0.0.10`
- **Load Imbalance**: 5-tuple hashing + Istio port reuse → traffic pinned to one CoreDNS pod → OOMKilled

#### Part II: NodeLocalDNS

Runs local DNS caching agent on each node (DaemonSet at 169.254.20.10):
- Reduces cross-node traffic
- Avoids conntrack pressure (TCP forwarding for cluster.local)
- Improves DNS latency and reliability

##### Limitations
- Requires DaemonSet (resource overhead)
- DNS downtime possible during upgrades
- User-managed in AKS (not built-in addon)

##### Debug Logs
Edit `node-local-dns` ConfigMap: replace `errors` with `log`, then restart DaemonSet.

#### LocalDNS (Microsoft native addon)

Microsoft has developed a native NodeLocalDNS add-on for AKS called **LocalDNS** (managed by AKS).

---

## Scenario 25: Troubleshooting Flow
> 来源: ado-wiki-disable-environment-variables-globally-on-aks.md | 适用: 适用范围未明确

### 排查步骤

1. **Download the ConfigMap file**:
   https://github.com/microsoft/OMS-docker/blob/ci_feature_prod/Kubernetes/container-azm-ms-agentconfig.yaml

2. **Modify the setting** — change:
   ```yaml
   [log_collection_settings.env_var]
     enabled = true
   ```
   to:
   ```yaml
   [log_collection_settings.env_var]
     enabled = false
   ```

3. **Apply the ConfigMap**:
   ```bash
   kubectl apply -f <FileName>
   ```

4. **Restart the OMS agent pods** to pick up the new config:
   ```bash
   kubectl delete pods -n kube-system -l component=oms-agent
   ```

5. **Verify** by running a Log Analytics query:
   ```kusto
   ContainerInventory
   | where TimeGenerated > ago(15m)
   | summarize count() by EnvironmentVar
   ```
   Go to AKS Cluster → Logs and run the query.

---

## Scenario 26: Installing KEDA on Azure Kubernetes Service Clusters
> 来源: ado-wiki-keda-implementation-aks.md | 适用: 适用范围未明确

### 排查步骤

#### Installing KEDA on Azure Kubernetes Service Clusters

#### Summary and Goals

This article shows you how to install the Kubernetes Event-driven Autoscaling (KEDA) to the Azure Kubernetes Service (AKS) by using Helm.

##### What is KEDA?

- KEDA is an open source component for event-driven autoscaling of workloads.
- KEDA scales workload dynamically based on the number of events received.
- KEDA extends K8s with a custom resource definition (CRD) called "ScaledObject" to describe how applications should be scaled in response to a specific traffic
- KEDA scaling is useful in scenarios where workloads receive bursts of traffic or handle high volumes of data.
- **KEDA is different than HPA**: KEDA is event-driven and scales based on the number of events, while HPA is metrics-driven based on the resource utilization like (CPU and memory).

##### Is Helm the only way to use KEDA?

AKS provides an add-on to simplify the KEDA installation. You can enable the KEDA using Azure CLI, or update the cluster later by adding (--enable-Keda) flag. The AKS KEDA add-on provides Basic common configuration (for the moment). You can check the Microsoft documentation on KEDA for more info: https://learn.microsoft.com/en-us/azure/aks/keda-deploy-add-on-cli

Currently, manual editing of KEDA YAML files is recommended for more customization. Therefore, in this guide, we'll create an AKS cluster (without the add-on) and use helm to install KEDA because we're looking to use Http-Scaled object, to scale based on the pending requests. And nginx application exposed with a cluster IP service in our cluster.

##### Prerequisites

- An Azure subscription.
- Azure CLI
- Helm CLI
- An AKS cluster with five nodes available.

#### Implementation Steps

##### Installing KEDA with Helm

1. Configure the KEDA Helm repo for use with Helm CLI:
   1. Add the KEDA Helm repo: `helm repo add kedacore https://kedacore.github.io/charts`
   2. Update the Helm repo: `helm repo update`

2. Run `helm install keda kedacore/keda --create-namespace keda` to install KEDA in the keda namespace. Once the Helm install completes, run `helm install http-add-on kedacore/keda-add-ons-http --namespace keda` to install the HTTP add-on.

3. Using `kubectl get po -n keda`, verify that the KEDA pods are running in the `keda` namespace.

   You can also list all of the KEDA custom resource definitions (CRDs) by running `kubectl get crd | grep keda`.

##### Deploying NGINX that scales via KEDA

The YAML code block below represents an NGINX deployment that will be scaled by KEDA. The deployment is configured to scale based on the number of pending requests to the NGINX service.

```yaml
#### Deployment of nginx, to be scaled by Keda http-add-on
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-http
spec:
  selector:
    matchLabels:
      app: nginx-http
  replicas: 1
  template:
    metadata:
      labels:
        app: nginx-http
    spec:
      containers:
        - name: nginx-http
          image: nginx
          resources:
            limits:
              memory: 256Mi
              cpu: 200m
          ports:
            - containerPort: 80
---
#### Expose nginx deployment as a service
apiVersion: v1
kind: Service
metadata:
  name: nginx-http-service
  labels:
    app: nginx-http
spec:
  selector:
    app: nginx-http
  ports:
    - protocol: TCP
      port: 8082
      targetPort: 80
---
#### The HTTPScaledObject configuration
kind: HTTPScaledObject
apiVersion: http.keda.sh/v1alpha1
metadata:
    name: nginx-http
spec:
    host: "nginx-http.default.svc.cluster.local"
    targetPendingRequests: 10
    scaleTargetRef:
        deployment: nginx-http
        service: nginx-http-service
        port: 8082
    replicas:
      min: 1
      max: 20
---
#### Load generator deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: load-http
  name: load-http
spec:
  replicas: 1
  selector:
    matchLabels:
      app: load-http
  template:
    metadata:
      labels:
        app: load-http
    spec:
      containers:
      - image: ubuntu:22.04
        command: ["/bin/sh"]
        args: ["-c","/usr/bin/apt update ; /usr/bin/apt install siege -y ; siege -d 1 -c 60 -t 3600s -H 'Host: nginx-http.default.svc.cluster.local' http://keda-add-ons-http-interceptor-proxy.keda.svc.cluster.local:8080"]
        name: load-http
        resources:
          limits:
            memory: 128Mi
            cpu: 500m
```

Verify deployment:

```sh
kubectl get po
kubectl describe httpscaledobjects.http.keda.sh nginx-http
```

#### References

- KEDA Overview: https://learn.microsoft.com/en-us/azure/aks/keda-about
- KEDA Add-on Deploy Guide: https://learn.microsoft.com/en-us/azure/aks/keda-deploy-add-on-cli

---

## Scenario 27: Logging Azure AD Users operation on AKS Cluster
> 来源: ado-wiki-logging-aad-users-operation-on-aks.md | 适用: 适用范围未明确

### 排查步骤

#### Logging Azure AD Users operation on AKS Cluster

We often need to know who executed an operation at the cluster level. For an AKS cluster with AAD Integration this is how you can achieve this:

1. Create an AAD Group in Azure Active Directory

We take the ObjectId of this Group as we'll need to add it later at the cluster creation time.

2. We create an AKS-AAD integrated cluster for testing purpose with the Azure CLI:

`az aks create -g aad -n aad --enable-aad --aad-admin-group-object-ids 7938ded3-6d6d-4116-b5d0-8ac7f734ec68 --aad-tenant-id 716e7f5b-8914-47f5-85f0-84db07e6xxxx --enable-azure-rbac --node-count 1 --generate-ssh-keys`

3. Create an AAD User and assign to the aksadmin Group.

4. Assign permission for respective Group:

`AKS_ID=$(az aks show --resource-group aad --name aad --query id -o tsv)`

`az role assignment create --assignee 7938ded3-6d6d-4116-b5d0-8ac7f734ec68 --role "Azure Kubernetes Service Cluster User Role" --scope $AKS_ID`

5. Creating Role/RoleBinding for that cluster. For this step, we need to get credentials for admin user (az aks get-credentials -n aks -g aks --admin)

```yaml
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: dev-user-full-access
rules:
- apiGroups: ["", "extensions", "apps"]
  resources: ["*"]
  verbs: ["*"]
- apiGroups: ["batch"]
  resources:
  - jobs
  - cronjobs
  verbs: ["*"]
```

```yaml
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: dev-user-access
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: dev-user-full-access
subjects:
- kind: Group
  namespace: default
  name: 7938ded3-6d6d-4116-b5d0-8ac7f734ec68
```

6. Login with AAD User and execute some operations on the cluster level.

7. We assume that we enabled the kube-audit and kube-audit-admin Settings in Log Analytics for this AKS Cluster. Execute the following Kusto query:

```kusto
AzureDiagnostics
| where log_s contains "nginx"
| where log_s contains "aksdev"
```

```kusto
AzureDiagnostics
| where TimeGenerated > ago(4h)
| where Category contains 'kube-audit'
| project TimeGenerated, Category , pod=tostring(pod_s), log=tostring(log_s)
| where log contains "ResponseComplete"
| extend audit=parse_json(log)
| project TimeGenerated, pod, requestURI=tostring(audit.requestURI), verb=tostring(audit.verb), status=tostring(audit.responseStatus.code), userAgent=tostring(audit.userAgent), user=tostring(audit.user.username),latency=datetime_diff('millisecond', todatetime(audit.stageTimestamp), todatetime(audit.requestReceivedTimestamp)), audit
| where user !in ("aksService", "masterclient", "nodeclient")
| sort by TimeGenerated asc
| summarize count() by user, userAgent
```

In the **log_s** part of the result will find the user that executed that operation.

---

## Scenario 28: A Golang based network connection monitor from AKS cluster with logging capabilities
> 来源: ado-wiki-network-connection-monitor-in-aks.md | 适用: 适用范围未明确

### 排查步骤

#### A Golang based network connection monitor from AKS cluster with logging capabilities

#### Summary and Goals

Microsoft Support engineers usually have cases where customers complain about network latencies for intra cluster resources or external destination.
This Golang based script is a Connection Monitor implementation with a small footprint that can run inside any customer Pod. Besides not having
high resource requirements, it provides the logging capabilities for latencies over predefined values.

#### Prerequisites

This script can be used from a standard VM or within a Pod and requires a Golang runtime/compiler if we'll not use the precompiled version.
Tested with a **nginx** pod with default Golang repository installation: 1.15.15

```bash
kubectl run nginx --image=nginx
kubectl exec -it nginx -- bash
apt update
apt install golang -y
```

#### Implementation Steps

Please copy the following Go file content locally:

```go
package main

import (
        "log"
        "fmt"
        "net"
        "os"
        "runtime"
        "strconv"
        "strings"
        "time"
        "context"
)

var (
        red    = "\x1b[31m"
        green  = "\x1b[32m"
        yellow = "\x1b[33m"
        blue   = "\x1b[34m"
        reset  = "\x1b[0m"
)

func main() {
        filenameSplit := strings.Split(os.Args[0], "/")
        filename := filenameSplit[len(filenameSplit)-1]

        if len(os.Args) < 4 {
                fmt.Printf("Usage: ./%v <ip> <port> <count> <delay ex: 5s, 5m, 2s, 2h> <threshold> \n", filename)
                return
        }

        var timeout time.Duration
        ip := os.Args[1]
        port := os.Args[2]
        count, _ := strconv.Atoi(os.Args[3])
        threshold, _ := strconv.Atoi(os.Args[5])

        if len(os.Args) == 6 {
                timeout, _ = time.ParseDuration(os.Args[4])
        }

        for i := 0; ; i++ {
                if count != -1 && i >= count {
                        break
                }

                beforeTime := time.Now()
                var d net.Dialer
                ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
                defer cancel()
                conn, err := d.DialContext(ctx, "tcp", ip+":"+port)
                if err != nil {
                        log.Fatalf("Failed to dial: %v", err)
                }
                roundedEndTime := time.Since(beforeTime).Round(time.Millisecond)
                conn.Close()

                if runtime.GOOS == "windows" {
                        red = ""
                        green = ""
                        yellow = ""
                        blue = ""
                        reset = ""
                }

                if err == nil {
                        fmt.Printf("%vConnected to %v:%v time=%v\n%v", green, ip, port, roundedEndTime, reset)
                        suf := roundedEndTime.String()
                        trimed := suf[:len(suf)-2]
                        intValue, _ := strconv.Atoi(trimed)
                        if intValue > threshold {
                                fmt.Println("Over Threshold Alert Raised")
                                f, err := os.OpenFile("output.txt", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0600)
                                if err != nil {
                                        panic(err)
                                }
                                defer f.Close()
                                currentTime := time.Now()
                                formatedTime := currentTime.Format("2 Jan 06 03:04PM")
                                strList := []string{formatedTime, trimed, ip, port, "\n"}
                                fileLogs := strings.Join(strList, "\t")
                                if _, err = f.WriteString(fileLogs); err != nil {
                                        panic(err)
                                }
                        }
                } else {
                        fmt.Printf("%vFailed to connect to %v:%v time=%v\n%v", red, ip, port, roundedEndTime, reset)
                }

                time.Sleep(timeout | time.Second)
        }
}
```

#### Usage

```bash
Usage: ./connectionmonitor <ip> <port> <count> <delay ex: 5s, 5m, 2s, 2h> <threshold>
```

- **ip**: Destination IP address of the endpoint we want to test
- **port**: Destination port of the endpoint
- **count**: Number of connection tests executed
- **delay**: Time delay added between consecutive tests in decimal + s/m (seconds/minutes)
- **threshold**: The Max value accepted for latency. If returned value will be higher than our configured **threshold** a logging line with timestamp will be added in **output.txt** file

As the returned values are written to **stdout**, they could be obtained from the Pod logs. If the threshold value has been exceeded we will see the following line in the output: **Over Threshold Alert Raised**

---

## Scenario 29: Publish your AKS Service with Azure Private Link and Front Door
> 来源: ado-wiki-publish-aks-services-private-link-front-door.md | 适用: 适用范围未明确

### 排查步骤

#### Publish your AKS Service with Azure Private Link and Front Door

#### Summary and Goals

This doc provides a general review of the AKS Private link feature, how to integrate with private endpoint to expose private AKS service outside.

#### Restrictions

- PLS does not support basic Load Balancer or IP-based Load Balancer.
- PLS connectivity is broken with Azure external Standard Load Balancer and floating ip enabled (default).
- To use managed private link service, users can either create an internal service by setting annotation `service.beta.kubernetes.io/azure-load-balancer-internal` to `true` or disable floating ip by setting annotation `service.beta.kubernetes.io/azure-disable-load-balancer-floating-ip` to `true`.
- Due to limitation of kubernetes#95555, when the service's externalTrafficPolicy set to Local, PLS need to use a different subnet from Pod's subnet. If the same subnet is required, then the service should use Cluster externalTrafficPolicy.
- PLS only works with IPv4 and cannot be deployed to an SLB with IPv6 frontend ipConfigurations. In dual-stack clusters, users cannot create a service with PLS if there's existing IPv6 service deployed on the same load balancer.

#### Implementation Steps

##### 1. Deploy and connect to private AKS cluster

```bash
az aks create --name PrivateAKSCluster --resource-group AKSRG --enable-managed-identity --node-count 3 --enable-private-cluster --disable-public-fqdn --enable-addons monitoring --generate-ssh-keys
sudo az aks get-credentials --resource-group AKSRG --name PrivateAKSCluster --overwrite-existing
```

##### 2. Setup a demo application with PLS annotations

Key annotations for the Service:

```yaml
annotations:
  service.beta.kubernetes.io/azure-load-balancer-internal: "true"
  service.beta.kubernetes.io/azure-pls-create: "true"
  service.beta.kubernetes.io/azure-pls-name: aksPLS
  service.beta.kubernetes.io/azure-pls-ip-configuration-subnet: AKSSUBNET
  service.beta.kubernetes.io/azure-pls-ip-configuration-ip-address-count: "1"
  service.beta.kubernetes.io/azure-pls-ip-configuration-ip-address: "10.224.0.141"
  service.beta.kubernetes.io/azure-pls-proxy-protocol: "false"
  service.beta.kubernetes.io/azure-pls-visibility: "*"
```

##### 3. Fix LinkedAuthorizationFailed error

If the service events show `LinkedAuthorizationFailed` with missing `Microsoft.Network/networkSecurityGroups/join/action`, assign Contributor role to AKS managed identity on the NSG:

```bash
az role assignment create --assignee "<cluster-msi-object-id>" --role "Contributor" --scope "/subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Network/networkSecurityGroups/<nsg-name>"
```

##### 4. Deploy Azure Front Door (Premium tier)

- Create Azure Front Door with **Premium** tier (required for Private Link Service).
- Set Origin type: Custom, Origin host name: PLS alias (e.g., `akspls.<guid>.eastus.azure.privatelinkservice`).
- Enable Private Link Service, select the PLS resource.
- Approve the private endpoint connection in Private Link Center.

##### 5. Configure Front Door settings

- Set forwarding protocol to **HTTP only** in the default route.
- Set health probe method to **GET** in the origin group.

##### 6. Access the application

Access via the Front Door endpoint hostname (e.g., `www-xxx.b01.azurefd.net`).

---

## Scenario 30: Troubleshooting Flow
> 来源: ado-wiki-pull-private-registry-images-from-aks-nodes.md | 适用: 适用范围未明确

### 排查步骤

##### 1. Access the Node

```bash
kubectl run node-access --image mcr.microsoft.com/mirror/docker/library/busybox:1.35 --overrides='{"spec": {"nodeName": "<node-name>","hostPID": true,"hostNetwork": true,"containers": [{"securityContext": {"privileged": true},"name":"nsenter","image": "mcr.microsoft.com/mirror/docker/library/busybox:1.35","stdin": true,"stdinOnce": true,"tty": true,"command": ["nsenter", "--target", "1", "--mount", "--uts", "--ipc", "--net", "--pid", "--", "bash", "-l"],"resources": {"limits": { "cpu": "100m", "memory": "256Mi" },"requests": { "cpu": "100m", "memory": "256Mi" }}}],"tolerations": [{ "key": "CriticalAddonsOnly", "operator": "Exists" },{ "effect": "NoExecute","operator": "Exists" }]}}' -it
```

##### 2. Install podman

```bash
apt-get update
apt-get install podman
```

##### 3. Configure registries.conf

Edit `/etc/containers/registries.conf` to set the private registry (e.g., docker.io) in `unqualified-search-registries`.

##### 4. Login to registry

```bash
podman login docker.io
```

##### 5. Pull from private registry

```bash
podman pull registry/username/image:tag
```

---

## Scenario 31: AKS Common Error Codes Reference
> 来源: mslearn-aks-error-codes-reference.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Common Error Codes Reference

> Source: [AKS common error codes](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/aks-error-code-page)
> Type: guide-draft (reference table)

#### Overview

Comprehensive index of AKS error codes organized by category with descriptions and mitigation links.

#### A-K Error Codes

| Error Code | Category | Summary |
|---|---|---|
| AADSTS7000222 / BadRequest / InvalidClientSecret | Auth | Expired/invalid service principal credentials |
| AKSCapacityError / AksCapacityHeavyUsage | Capacity | Insufficient Azure capacity in target region |
| AKSOperationPreempted | Operations | Operation interrupted by higher priority operation |
| AKS upgrade blocked | Upgrade | Version skew, incompatibility, unsupported upgrade path |
| Argument list too long | Application | Command line args exceed system limits in containers |
| AvailabilityZoneNotSupported | Creation | VM size/region doesn't support specified AZ |
| CannotDeleteLoadBalancerWithPrivateLinkService | Networking | Active private endpoint connections prevent deletion |
| Changing property imageReference not allowed | Upgrade | Attempting to change immutable VM properties |
| CniDownloadTimeoutVMExtensionError (41) | Provisioning | Network issues preventing CNI plugin download |
| CreateOrUpdateVirtualNetworkLinkFailed | DNS | Insufficient permissions on private DNS zones |
| CustomPrivateDNSZoneMissingPermissionError | DNS | SP lacks permissions on private DNS zone |
| DnsServiceIpOutOfServiceCidr | Networking | DNS service IP outside service CIDR range |
| ERR_VHD_FILE_NOT_FOUND (65) | Provisioning | Node image VHD unavailable |

#### L-S Error Codes

| Error Code | Category | Summary |
|---|---|---|
| LinkedAuthorizationFailed | Auth | Insufficient permissions for cross-subscription resources |
| LoadBalancerInUseByVirtualMachineScaleSet | Networking | LB actively used by VMSS |
| Missing or invalid service principal | Auth | SP doesn't exist, expired, or lacks permissions |
| MissingSubscriptionRegistration | Setup | Required resource providers not registered |
| NodePoolMcVersionIncompatible | Upgrade | Node pool version incompatible with control plane |
| OperationIsNotAllowed | Operations | Operation conflicts with cluster state |
| OperationNotAllowed / PublicIPCountLimitReached | Quota | Public IP quota exceeded |
| OutboundConnFailVMExtensionError (50) | Connectivity | Firewall/NSG/routing prevents outbound connections |
| QuotaExceeded / InsufficientVCPUQuota | Quota | Insufficient vCPU quota |
| RequestDisallowedByPolicy | Policy | Azure policy blocks the request |
| ServiceCidrOverlapExistingSubnetsCidr | Networking | K8s service CIDR conflicts with subnet |
| SubnetIsFull | Networking | All IPs in subnet allocated |
| SubscriptionRequestsThrottled (429) | Throttling | Rate limit exceeded |

#### T-Z Error Codes

| Error Code | Category | Summary |
|---|---|---|
| Throttled (429) | Throttling | Azure API throttling |
| TLS: client offered only unsupported versions | Security | TLS version mismatch |
| UnsatisfiablePDB | Upgrade | PDB constraints prevent node operations |
| VirtualNetworkNotInSucceededState | Networking | VNet in failed/updating state |
| VMExtensionProvisioningTimeout | Provisioning | Extension installation exceeded timeout |
| WINDOWS_CSE_ERROR_CHECK_API_SERVER_CONNECTIVITY (5) | Connectivity | Windows node API server connectivity check fails |
| ZonalAllocationFailed | Capacity | VM allocation fails due to capacity/zone constraints |

---

## Scenario 32: AKS Application Connection Issues Troubleshooting Guide
> 来源: mslearn-connection-issues-app-hosted-aks.md | 适用: 适用范围未明确

### 排查步骤

#### AKS Application Connection Issues Troubleshooting Guide

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/connection-issues-application-hosted-aks-cluster

#### Basic Request Flow

```
Client >> DNS >> LB/AppGW IP >> AKS Nodes >> Pods
```

Extra components possible: NGINX Ingress, AGIC, Azure Front Door, API Management, internal LB.

#### Inside-Out Troubleshooting Approach

##### Step 1: Check Pod Health

```bash
kubectl get pods -n <namespace> -o wide
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> [-c <container>] [--previous]
```

Test pod-level connectivity:
```bash
kubectl run -it --rm aks-ssh --image=debian:stable
apt-get update -y && apt-get install dnsutils curl netcat-traditional -y
curl -Iv http://<pod-ip>:<port>
nc -z -v <pod-ip> <port>  # for non-HTTP protocols
```

##### Step 2: Check Service

```bash
kubectl get svc -n <namespace>
kubectl describe svc <service-name> -n <namespace>
kubectl get endpoints
```

Verify:
- Pod IP appears in service Endpoints
- Labels/Selectors match between pod and service

#### ClusterIP Service Test
```bash
#### From test pod inside cluster:
curl -Iv http://<service-cluster-ip>:<port>
```

#### LoadBalancer Service Test
```bash
#### From outside cluster:
curl -Iv http://<external-ip>:<port>
```

If LoadBalancer fails:
- Check service events
- Verify NSGs allow incoming traffic on service port

##### Step 3: Check Ingress (if applicable)

```bash
kubectl get ing -n <namespace>
kubectl describe ing <ingress-name> -n <namespace>
kubectl get svc -n <ingress-namespace>  # check ingress controller service
kubectl logs <ingress-controller-pod> -n <ingress-namespace>
```

Verify:
- Backend services are running and responding on correct ports
- Ingress rules (host, path, backend) configured correctly
- Ingress controller logs show incoming requests

If no log entries for requests:
- Requests may not be reaching cluster
- Check LB/AppGW backend configuration
- Check NSG on AKS nodes/subnet

#### Common Issues

| Symptom | Likely Cause |
|---------|-------------|
| Pod not Running/Ready | Check events, logs, resource limits |
| Endpoints empty | Labels/Selectors mismatch |
| LB service timeout | NSG blocking, missing backend pool |
| Ingress 502/503 | Backend pod not ready, wrong port |
| Connection Timed Out | NSG, firewall, or network policy |

#### Key Tips

- Always get HTTP response codes at each hop to isolate the problem
- Packet captures useful for non-HTTP traffic
- NSG at subnet level is NOT managed by AKS (only NIC-level is)
- Check network policies if traffic blocked between namespaces

---

## Scenario 33: AKS Best Practices & FAQ
> 来源: onenote-aks-best-practices-faq.md | 适用: Mooncake ✅

### 排查步骤

#### AKS Best Practices & FAQ

> Source: Mooncake POD Support Notebook — ##Best Practice & FAQ
> Quality: guide-draft (pending review)

#### Agent Node Sizing for Production

- Use VMs with at least **8 CPU cores** (e.g., D4_v2) since K8s components consume CPU/memory on each node
  - See [AKS resource reservation](https://docs.microsoft.com/zh-cn/azure/aks/concepts-clusters-workloads#resource-reservations)
- Set a larger OS disk size at cluster creation: `--node-osdisk-size 128` (default 30GB is insufficient as all images are stored on OS disk)
- **Avoid B-series VMs** for production workloads:
  1. Burstable CPU capacity — not consistent performance
  2. Limited IOPS and throughput for Azure Disks — can be a serious bottleneck

#### NSG Rules

- **No inbound requirements** for AKS — everything is outbound
- SSH access to nodes is restricted by default (customer choice to open)
- Application Rules (FQDNs):
  - Constrain outbound to datacenter-specific `*azmk8s.io` (e.g., `*eastus.azmk8s.io`)
  - Required FQDNs: `k8s.gcr.io`, `storage.googleapis.com`, `*auth.docker.io`, `*cloudflare.docker.io`, `*registry-1.docker.io`
- Network Rule for Tunnel Front:
  - Protocol: TCP
  - Source: *
  - Destination: All Public IPs in the Azure Region
  - Port: 22

#### OOM Recovery

- To correct damage from OOM Killer (e.g., Node in failed state):
  1. **Drain and restart** each node one at a time
  2. `kubectl drain` evicts pods gracefully, allowing containers to terminate properly
  3. Respects PodDisruptionBudgets during eviction

#### Replica Set Reliability

- Reference: [More reliable Replica Sets in AKS](https://vincentlauzon.com/2018/05/15/more-reliable-replica-sets-in-aks-part-1/)

---

## Scenario 34: AKS Cross-Product Troubleshooting Ownership Matrix
> 来源: onenote-aks-cross-product-ownership.md | 适用: Mooncake ✅

### 排查步骤

#### AKS Cross-Product Troubleshooting Ownership Matrix

> Draft extracted from PG Sync meeting notes (FY20). Subject to updates.

#### Ownership Rules

| Cross-Product Scenario | Who Initiates Troubleshooting | Notes |
|---|---|---|
| AKS + Monitor (agent node insights/metrics on portal) | Monitor PG | Insights, metrics displayed on portal for agent nodes |
| AKS + Monitor (master node logs) | AKS PG | Control plane / master logs |
| AKS + Monitor (monitor-related pod issues) | AKS PG | e.g., omsagent pod crashes, log collection failures |
| AKS + AAD | AKS PG | Generally configuration issues; start with AKS PG |
| AKS + Networking (Calico network policy) | CSS initiates troubleshooting | CSS should start investigation, escalate to AKS PG if needed |
| AKS + Networking (Azure CNI / kubenet) | AKS PG or Networking PG | Depends on whether issue is AKS-managed or customer VNet config |

#### Source

- PG Sync meeting: 2020-05-14
- Discussed in: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/AKS/##Regular Sync up with PG/###FY20/20200514.md

#### Key Takeaways

1. For monitor-related issues, distinguish between **agent node metrics** (Monitor PG) vs **master/control plane logs** (AKS PG)
2. AAD integration issues almost always start with AKS PG regardless of AAD team involvement
3. CSS engineers should attempt Calico network policy troubleshooting before escalating
4. Reference: https://docs.azure.cn/zh-cn/aks/use-network-policies

---

## Scenario 35: AKS Docker Hub 迁移：使用 Flux GitOps 切换到 ACR
> 来源: onenote-aks-dockerhub-gitops-migration.md | 适用: Mooncake ✅

### 排查步骤

#### AKS Docker Hub 迁移：使用 Flux GitOps 切换到 ACR

> **来源**: MCVKB 18.36 | 作者: Simon Xin | 日期: 2022-02-11
> **背景**: 2022-06-30 起 Docker Hub 对 Azure IP 恢复限速，需迁移镜像到 ACR

---

#### 问题背景

Docker Hub 对未认证拉取限速：100 pulls/6h（匿名），200 pulls/6h（免费账号）。Microsoft 与 Docker 的豁免协议于 **2022-06-30 到期**。

---

#### Step 1: 识别依赖 docker.io 的镜像

启用 Container Insights 后，通过 Log Analytics 查询：

```kusto
let clustername = "<your_cluster_name>";
let timerange = 30m;
ContainerInventory
| where TimeGenerated > ago(timerange)
| where _ResourceId contains clustername and ContainerState !in ('Deleted','Terminated')
| summarize arg_max(TimeGenerated, ContainerState, Repository, Image, ImageTag) by ImageID, _ResourceId
| extend clustername = tostring(split(_ResourceId,'/')[-1])
| extend repository = iif(Repository<>'', Repository, 'docker.io')
| project clustername, repository, Image, ImageTag, ContainerState
```

> Workbook 可视化代码: https://raw.githubusercontent.com/simonxin/cluster-config/main/scripts/aksimageview.json

---

#### Step 2: 导入镜像到 ACR

```bash
az acr import \
  --name <your-acr> \
  --source docker.io/library/nginx:latest \
  --image nginx:latest
```

---

#### Step 3: 使用 Flux GitOps 管理迁移

##### 3.1 部署 Flux 到 AKS
```bash
flux bootstrap git \
  --url=ssh://git@github.com/<org>/cluster-config \
  --branch=main \
  --path=clusters/<cluster-name> \
  --private-key-file <path-to-ssh-key>
```

##### 3.2 注册 Git Source 和 Kustomization
```bash
flux create source git podinfo \
  --url=https://github.com/stefanprodan/podinfo \
  --branch=master --interval=30s \
  --export > ./clusters/<cluster-name>/podinfo-source.yaml

flux create kustomization podinfo \
  --target-namespace=default \
  --source=podinfo --path="./kustomize" \
  --prune=true --interval=5m \
  --export > ./clusters/<cluster-name>/podinfo-kustomization.yaml

git add -A && git commit -m "Add podinfo kustomization" && git push
```

##### 3.3 Kustomization Patch 替换镜像
创建 patch 文件 `podinfo-updates.yaml`：
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: not-used
spec:
  template:
    spec:
      containers:
        - image: <your-acr>.azurecr.cn/podinfo:6.0.3
          name: podinfod
```

在 `kustomization.yaml` 中引用 patch，然后推送：
```bash
git add -A && git commit -m "Replace docker.io image with ACR" && git push
```

##### 3.4 触发 Flux 应用
```bash
flux resume kustomization <kustomization-name>
```

---

#### 控制 Container Insights 成本

修改 `container-azm-ms-agentconfig.yaml` 关闭日志收集：
```yaml
#### 将 collection_settings.stdout/stderr 设为 false
```

```bash
kubectl apply -f container-azm-ms-agentconfig.yaml
```

---

#### 参考

- [Container insights agent data collection](https://docs.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-agent-config)
- [Import images to ACR](https://docs.microsoft.com/en-us/azure/container-registry/buffer-gate-public-content#import-images-to-an-azure-container-registry)
- [Flux GitOps docs](https://fluxcd.io/docs/components/source/)

---

## Scenario 36: Troubleshooting Flow
> 来源: onenote-aks-ephemeral-os-disk.md | 适用: 适用范围未明确

### 排查步骤

- 客户反映节点重启后数据丢失 → 确认是否使用了 Ephemeral OS Disk
- 确认 VM size 是否支持 ephemeral（检查 VM size 的 cache storage 大小 vs OS disk 大小）
- 生产环境若需持久化 node 数据（如自定义配置）→ 推荐使用 Managed Disk

---

## Scenario 37: AKS Key Vault CSI + Workload Identity 配置指南
> 来源: onenote-aks-keyvault-workload-identity.md | 适用: Mooncake ✅

### 排查步骤

#### AKS Key Vault CSI + Workload Identity 配置指南

> **来源**: MCVKB 18.41 | 作者: Icy Lin | 日期: 2022-11-22
> **前置条件**: 先配置 OIDC issuer + Workload Identity（参考 MCVKB 18.42）
> **注**: AAD pod identity 已于 2022-10-24 废弃，推荐使用 Workload Identity

---

#### 场景

使用 Azure Key Vault Provider for Secrets Store CSI Driver，通过 **Workload Identity** 访问 Key Vault 中的 Secret/Certificate，挂载到 AKS Pod。

---

#### Step 1: 启用 Key Vault Secrets Provider

```bash
#### 新集群
az aks create -n myAKSCluster -g myResourceGroup \
  --enable-addons azure-keyvault-secrets-provider \
  --enable-managed-identity

#### 现有集群
az aks enable-addons \
  --addons azure-keyvault-secrets-provider \
  --name myAKSCluster \
  --resource-group myResourceGroup
```

---

#### Step 2: 配置 SecretProviderClass

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: azure-kvname-workload-identity
spec:
  provider: azure
  parameters:
    usePodIdentity: "false"
    clientID: "<workload-identity-client-id>"
    keyvaultName: "<keyvault-name>"
    tenantId: "<tenant-id>"
    objects: |
      array:
        - |
          objectName: secret1
          objectType: secret
```

---

#### Step 3: 准备 Workload Identity 和 Key Vault 权限

参考 MCVKB 18.42（OIDC issuer 配置），确保：
- AKS 已启用 OIDC issuer
- 已创建 federated credential
- Service Account 已关联 workload identity
- Key Vault 中已给 Managed Identity 赋予 `Key Vault Secrets User` 角色

---

#### Step 4: 部署测试 Pod

```yaml
kind: Pod
apiVersion: v1
metadata:
  name: busybox-secrets-store
spec:
  serviceAccountName: workload-identity-sa
  containers:
    - name: busybox
      image: k8sgcr.azk8s.cn/e2e-test-images/busybox:1.29-1
      command: ["/bin/sleep", "10000"]
      volumeMounts:
      - name: secrets-store01-inline
        mountPath: "/mnt/secrets-store"
        readOnly: true
  volumes:
    - name: secrets-store01-inline
      csi:
        driver: secrets-store.csi.k8s.io
        readOnly: true
        volumeAttributes:
          secretProviderClass: "azure-kvname-workload-identity"
```

---

#### 验证

```bash
kubectl exec busybox-secrets-store -- ls /mnt/secrets-store
kubectl exec busybox-secrets-store -- cat /mnt/secrets-store/secret1
```

---

#### 参考

- [AKS CSI Secrets Store Driver (Mooncake)](https://docs.azure.cn/en-us/aks/csi-secrets-store-driver)
- [Azure Key Vault Provider for Secrets Store CSI Driver](https://azure.github.io/secrets-store-csi-driver-provider-azure/)

---

## Scenario 38: AKS Mooncake Support Tools Reference
> 来源: onenote-aks-mooncake-support-tools.md | 适用: Mooncake ✅

### 排查步骤

#### AKS Mooncake Support Tools Reference

> Source: OneNote - Mooncake POD Support Notebook

#### Access Prerequisite
Join MyAccess project for Mooncake AKS log access:
- Security group: `CME\cld-aks-kusto-access-partners-mc` (member of `CME\MC-CXSupport`)
- May take ~half a day to take effect

#### Tools

##### ASI (Azure Service Insights)
- URL: https://azureserviceinsights.trafficmanager.cn/
- Usage: Select "ARM resource id" and input AKS resource ARM ID

##### Geneva (Jarvis)
- URL: https://jarvis-west.dc.ad.msft.net/AB3A3E1C

##### Kusto
- Primary: `akscn.kusto.chinacloudapi.cn`
- Alternative: `mcakshuba.chinaeast2.kusto.chinacloudapi.cn` (use if primary has access issues)
- Auth type: Client Security: AAD-Federated (requires CME smart card)

##### AppLens
- URL: https://applens.chinacloudsites.cn/
- Usage: Select "ARM resource id" and input AKS resource ARM ID

#### Useful Scripts & Dashboards
- PowerShell tool for quick Kusto queries: [ADO Wiki](https://supportability.visualstudio.com/AzureContainers/_wiki/wikis/Containers%20Wiki/1280681/PowerShell-tool-for-quick-useful-Kusto-Queries)
- Portal Metrics for VMSS IOPS (Linux): [ADO Wiki](https://supportability.visualstudio.com/AzureContainers/_wiki/wikis/Containers%20Wiki/1280653/Get-Portal-Metrics-For-Vmss-iops-using-custom-metrics(Linux))
- Helm Chart for network traces on all nodes: [ADO Wiki](https://supportability.visualstudio.com/AzureContainers/_wiki/wikis/Containers%20Wiki/1280655/Helm-Chart-for-capturing-Network-Traces-on-all-nodes)

#### kubectl for Windows (Mooncake mirror)
- Download: https://mirror.azure.cn/kubernetes/kubectl/

---

## 附录: Kusto 诊断查询

### 来源: msi-connector.md

# MSI Connector 活动查询

## 查询语句

### 查询 MSI Connector 活动

```kql
union cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").MSIConnectorActivity
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
//| where PreciseTimeStamp > ago(1d)
| where subscriptionID == "{subscription}"
| where region == "{region}"
```

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照

---
