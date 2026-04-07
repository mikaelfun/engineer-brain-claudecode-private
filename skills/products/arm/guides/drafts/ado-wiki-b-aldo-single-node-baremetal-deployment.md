---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Labs for ALDO CSS/Single Node/Baremetal Deployment"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Labs%20for%20ALDO%20CSS/Single%20Node/Baremetal%20Deployment"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Overview
---
This set of articles will guide you through all the steps to deploy a single node Azure Local disconnected operations environment in the AL CSS lab. Currently we have 14 nodes in this category, and before performing the exercise, the node should be reserved in our [Reservation System](https://microsoft.sharepoint.com/teams/AzureStackCSSTeams/SitePages/CSS-Labs-Reservation.aspx). 

:::template /.templates/Static/Azure-Local-Disconnected-Operations/Beta-Resources-%2D-Pre%2DGA/Deployment/Labs/Banner.md
:::

1. **Baremetal Deployment**
1. [VM Deployment (virtual)](VM-Deployment-virtual.md)
1. [DC Preparation](DC-Preparation.md)
1. [Azure Local Node Preparation](Azure-Local-Node-Preparation.md)
1. [Appliance Deployment](Appliance-Deployment.md)
1. [Azure Local Deployment](Azure-Local-Deployment.md)
1. [Post Steps and Cleanup](Post-Steps-and-Cleanup.md)

# Baremetal Deployment With Lab Menu System

To begin a baremetal deployment for one of the lab environments, you will need to start by accessing one of the console vms. See [Accessing Console VM](/Azure-Local-Disconnected-Operations/Beta-Resources-%2D-Pre%2DGA/Deployment/Labs-for-ALDO-CSS#accessing-console-vms) for access details. All lab deployments are initiated via the deployment menu system that has been developed, and is accessed with the following:

:::template /.templates/Dynamic/Azure-Local-Disconnected-Operations/Beta-Resources-%2D-Pre%2DGA/Deployment/Labs/Single-Node_Invoke-MenuSystem.md
:::

for a baremetal deploy, we will want to perform the following in the menu system

1. Reimage the nodes (`3`)
    
    [![Reimage Nodes](/.attachments/Lab-Deploy/Single/baremetal1_small.png)](/.attachments/Lab-Deploy/Single/baremetal1.png)

1. Select the environment (EX: `10`)

    [![Environment Selection](/.attachments/Lab-Deploy/Single/baremetal2_small.png)](/.attachments/Lab-Deploy/Single/baremetal2.png)

1. Edit the configuration (`Y`)

    [![Edit Configuration](/.attachments/Lab-Deploy/Single/baremetal3_small.png)](/.attachments/Lab-Deploy/Single/baremetal3.png)
    
1. Modify the selected ALdo version (`2`)

    [![Modify ALdo version](/.attachments/Lab-Deploy/Single/baremetal4_small.png)](/.attachments/Lab-Deploy/Single/baremetal4.png)

1. Specify the ALdo version (EX: `13217`) _Note: the versions listed will be the stable versions, and may differ from the screenshot provided_

    [![Select ALdo version](/.attachments/Lab-Deploy/Single/baremetal5_small.png)](/.attachments/Lab-Deploy/Single/baremetal5.png)

1. Confirm Configuration (`Enter`)

    [![Confirm Configuration](/.attachments/Lab-Deploy/Single/baremetal6_small.png)](/.attachments/Lab-Deploy/Single/baremetal6.png)

1. Start _Baremetal Deployment_ by typing the name of the cluster (EX: `ALCSS01`) where you will be provided the IP of the BMC to monitor progress (EX: `100.100.4.67`).

    [![Start Deployment and Monitor Progress](/.attachments/Lab-Deploy/Single/baremetal7_small.png)](/.attachments/Lab-Deploy/Single/baremetal7.png)

## Monitor Baremetal Deployment

1. Using the `Administrator credentials` for AL CSS Labs BMCs, log into the BMC identified in the previous step. **Note:** the BMC console will have a warning regarding the certificate, hit `Advanced` and `Continue` to access the login screen.

    [![BMC Warning](/.attachments/Lab-Deploy/Single/baremetal8_small.png)](/.attachments/Lab-Deploy/Single/baremetal8.png)

    [![BMC Console](/.attachments/Lab-Deploy/Single/baremetal9_small.png)](/.attachments/Lab-Deploy/Single/baremetal9.png)

1. After completion, you should be able to access the new node via RDP/RDCM using `local Administrator credentials` for ALdo environments. All of the next steps will take place on the newly deployed node rather than the current `Console Server`

# Next Steps

After the Baremetal Deployment is complete, the next steps will need to be performed by logging into the physical node. Click below to continue to VM Deployment:�[VM�Deployment�(virtual)](VM-Deployment-virtual.md)