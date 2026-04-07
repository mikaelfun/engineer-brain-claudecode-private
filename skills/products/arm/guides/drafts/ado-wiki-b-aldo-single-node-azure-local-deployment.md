---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Labs for ALDO CSS/Single Node/Azure Local Deployment"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Labs%20for%20ALDO%20CSS/Single%20Node/Azure%20Local%20Deployment"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Overview
---
This set of articles will guide you through all the steps to deploy a single node Azure Local disconnected operations environment in the AL CSS lab. Currently we have 14 nodes in this category, and before performing the exercise, the node should be reserved in our [Reservation System](https://microsoft.sharepoint.com/teams/AzureStackCSSTeams/SitePages/CSS-Labs-Reservation.aspx). 

:::template /.templates/Static/Azure-Local-Disconnected-Operations/Beta-Resources-%2D-Pre%2DGA/Deployment/Labs/Banner.md
:::

1. [Baremetal Deployment](Baremetal-Deployment.md)
1. [VM Deployment (virtual)](VM-Deployment-virtual.md)
1. [DC Preparation](DC-Preparation.md)
1. [Azure Local Node Preparation](Azure-Local-Node-Preparation.md)
1. [Appliance Deployment](Appliance-Deployment.md)
1. **Azure Local Deployment**
1. [Post Steps and Cleanup](Post-Steps-and-Cleanup.md)

# Azure Local Deployment

At this point, all the prerequisites for deploying our Azure Local have been completed, and the rest of the steps are able to be completed from the Azure Local disconnected operations (ALdo) portal. Access the portal from [https://portal.autonomous.cloud.private](https://portal.autonomous.cloud.private) on the DC VM, using the `operator@vhci01.lab` credentials. 

1. To begin with the deployment, search for `Azure Local` in the portal

    [![Azure Local Search](/.attachments/Lab-Deploy/Single/deploy1_small.png)](/.attachments/Lab-Deploy/Single/deploy1.png)


1. Click `+ Create` to start the Azure Local wizard

    [![Create](/.attachments/Lab-Deploy/Single/deploy2_small.png)](/.attachments/Lab-Deploy/Single/deploy2.png)

1. Start by creating the new Key Vault (`1`), and click `Create` on the flyout (`Figure 1`), and then provide the vault permissions when it prompts (`Figure 2`). This is done first, as there is a 30+ minute countdown once created for the RBAC permissions to be fully configured, and we'll be waiting on one of the proceeding steps. 

1. Once the Key Vault is created, go back and configure the `vHCI01` for the Instance Name (`2`), add all 3 HCI nodes (`3`), and press the `Validate selected machines` button (`Figure 3`). Finally hit `Next: Configuration`.
    [![Deploy Overview](/.attachments/Lab-Deploy/Single/deploy3_small.png)](/.attachments/Lab-Deploy/Single/deploy3.png)
    
    Figure 1:
    [![Figure 1](/.attachments/Lab-Deploy/Single/deploy4_small.png)](/.attachments/Lab-Deploy/Single/deploy4.png)
    
    Figure 2:
    [![Figure 2](/.attachments/Lab-Deploy/Single/deploy5_small.png)](/.attachments/Lab-Deploy/Single/deploy5.png)
    
    Figure 3:
    [![Figure 3](/.attachments/Lab-Deploy/Single/deploy6_small.png)](/.attachments/Lab-Deploy/Single/deploy6.png)

1. On Configuration, change nothing and hit `Next`

    [![Configuration](/.attachments/Lab-Deploy/Single/deploy8_small.png)](/.attachments/Lab-Deploy/Single/deploy8.png)
1. On Networking, change the networking pattern to `Group management and compute traffic`
    
    [![Networking Pattern](/.attachments/Lab-Deploy/Single/deploy9_small.png)](/.attachments/Lab-Deploy/Single/deploy9.png)

    Then, we will need to add the appropriate NICs to Storage and Compute sections, and set their options. For each of **Compute_Management** and **Storage**, you will want to select either NIC or STORAGE for Compute and Storage respectively, adding # 1 (`1`) and then adding a second adapter (`2`) for each. You will also need to Customize network settings (`3`) for both Compute and Storage to disable RDMA as it is not supported on the Single-Node deployments (`Figure 1`). After everything is configured, you should end up with the settings show below (`Figure 2`). Using the file from the physical node in `C:\Scripts\ALdo\Nodes\vHCI01-Values.txt` populate the IP Addresses table as shown (`Figure 3`).  Once complete hit `Next: Management`.
    
    [![NIC Configuration](/.attachments/Lab-Deploy/Single/deploy11_small.png)](/.attachments/Lab-Deploy/Single/deploy11.png)

    Figure 1:
    [![Figure 1](/.attachments/Lab-Deploy/Single/deploy12_small.png)](/.attachments/Lab-Deploy/Single/deploy12.png)

    Figure 2:
    [![Figure 2](/.attachments/Lab-Deploy/Single/deploy13_small.png)](/.attachments/Lab-Deploy/Single/deploy13.png)

    Figure 3:
    [![Figure 3](/.attachments/Lab-Deploy/Single/deploy14_small.png)](/.attachments/Lab-Deploy/Single/deploy14.png)

1. Again using the values from the file from the physical node in `C:\Scripts\ALdo\Nodes\vHCI01-Values.txt` populate the Management information as shown, using the default ALdo credentials, and hit `Next: Security`

    [![Networking IP Configuration](/.attachments/Lab-Deploy/Single/deploy15_small.png)](/.attachments/Lab-Deploy/Single/deploy15.png)

1. For `Security`, `Advanced`, and `Tags` wizard steps, make no changes, and proceed to `Validation` step.

1. Wait for the resource creation to complete, and then wait at least 30 minutes from when we created and configured the KeyVault to start the validation. If you do not wait, you will be presented with an error and will need to wait anyway. _**Note:** This is a known upstream bug, and is on the backlog_. After waiting the appropriate period, you can proceed with the Validation, which may take 15 minutes to complete (`Figure 1`). Once complete, click `Next: Review + Create`
    
    [![Resource Creation](/.attachments/Lab-Deploy/Single/deploy16_small.png)](/.attachments/Lab-Deploy/Single/deploy16.png)

    Figure 1:
    [![Figure 1](/.attachments/Lab-Deploy/Single/deploy17_small.png)](/.attachments/Lab-Deploy/Single/deploy17.png)

1. Finally, we can kick off the deployment. Once started you will be brough to the deployment action plan where you can monitor progress. The progress does not live update, and at some point during the deployment the action plan may appear to be complete/gone, if this happens, browse to deployments and re-open the deployment for current status. Once complete, you should be presented with an updated end time on the parent step in the action plan, and you should have a fully deployed ALdo environment. (`Figure 1`)

    [![Deployment Action Plan](/.attachments/Lab-Deploy/Single/deploy18_small.png)](/.attachments/Lab-Deploy/Single/deploy18.png)

    Figure 1:
    [![Figure 1](/.attachments/Lab-Deploy/Single/deploy19_small.png)](/.attachments/Lab-Deploy/Single/deploy19.png)


# Next Steps

After the Azure Local Deployment is complete, there are some post steps and cleanup that should be completed. Click below to continue to the Post Steps and Cleanup:

[< Appliance Deployment](Appliance-Deployment.md) - Azure Local Deployment - [**Post Steps and Cleanup >**](Post-Steps-and-Cleanup.md)