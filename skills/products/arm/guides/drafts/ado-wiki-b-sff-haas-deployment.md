---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Small Form Factor/Readiness/Lab deployments/Deploying Azure Local Small Form Factor on HaaS (Physical Hardware)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Small%20Form%20Factor%2FReadiness%2FLab%20deployments%2FDeploying%20Azure%20Local%20Small%20Form%20Factor%20on%20HaaS%20%28Physical%20Hardware%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

_Date of Last Full Review: 09/02/2025_

**Created by: Walter Santos**

_Reach out to Walter Santos (waltersantos) if you have any questions, or need any help while using this article._

[[_TOC_]]

# Background
Azure Local Linux Small Form Factor (SFF) requires physical hardware to act as the baremetal nodes of your deployment. Shipping the HW around isn't practical nor cost effective, and therefore we use Hardware as a Service (HaaS) from the Azure Stack CI team.

* * *

# Pre-requisites

## Permissions

_**Note:** you might already have some of these permissions or entitlements as part of your current role._

| Permission | Why needed? |
|--|--|
| [WA CTS -14817](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/wacts14817-huwx) | To access standard Azure ADO resources from Azure ADO projects (including the MSAzure/One project). See [User access policies](https://eng.ms/docs/more/azure-devops-support-azurewindows/accessandsecurity/user-access-policies/user-access-policies?tabs=MSAzure). |
| [edge_ci Readers](https://myaccess.microsoft.com/@microsoft.onmicrosoft.com#/access-packages/d55ad894-4c46-4787-8640-03cc2ece6b48) | To access the AzureStack CI (Azure Edge CI) repository. See [AzureStack CI](https://eng.ms/docs/initiatives/1es-permissions-service/perms/_services/f/f247eca5-fe1d-410e-a30e-f33bb6db9699). |
| [EdgeCI Services Users](https://aka.ms/joinci) | To be able to access to the EdgeCI Dashboard that hosts HaaS. See [How to Access HaaS](https://msazure.visualstudio.com/One/_wiki/wikis/AzureStack-CI/240512/About-HaaS?anchor=how-to-access-haas). |
| [JoinHaaS](http://aka.ms/JoinHaaS) | To be able to access the HaaS section of the EdgeCI dashboard. See [How to Access HaaS](https://msazure.visualstudio.com/One/_wiki/wikis/AzureStack-CI/240512/About-HaaS?anchor=how-to-access-haas). |
| [SG-AzSCI-Partners](https://idweb.microsoft.com/IdentityManagement/aspx/groups/AllGroups.aspx?popupFromClipboard=%2Fidentitymanagement%2Faspx%2FGroups%2FEditGroup.aspx%3Fid%3Deb058fb4-16f0-4228-9a33-0bb479545db7) | Required for triggering CI pipelines in Azure DevOps. See [Running Pipelines](https://msazure.visualstudio.com/One/_wiki/wikis/AzureStack-CI/231185/How-to-get-started?anchor=running-pipelines). |
| [AIO Readers](https://myaccess.microsoft.com/@microsoft.onmicrosoft.com#/access-packages/4a8b10f7-9620-4d1d-81eb-a195167dc3c0) | To access the azure-iot-operations-tests repository, which is a dependency to run the SFF Solution pipeline on physical hardware. See [Linux-SFF-Solution-Physical.yaml](https://msazure.visualstudio.com/One/_git/AzureStack-Solution-CI-Infra?path=%2FStartPipelines%2FTeams%2FSFF-SOLUTION%2FLinux-SFF-Solution-Physical.yaml) and [Azure IoT Operations](https://eng.ms/docs/initiatives/1es-permissions-service/perms/_services/f/f67d3cd4-186d-4d8e-9637-72d40f6695c3). |

* * *

# Capacity

Our team `SOL-CSS` has been a assigned 4 x SFF-HC1 + 1 x SFF-HC3 [quota](https://msazure.visualstudio.com/One/_wiki/wikis/AzureStack-CI/498988/Quota-Service-HaaS) under the `ALSFF` product family during HaaS onboarding. You can confirm that by heading to [Team Quotas and Capacity](https://edgeci.microsoft.com/dashboard/haas/quotas).

* * *

# Steps

1. Head to [HaaS > Reserve](https://aka.ms/haas), fill the values, and click the `Reserve` button:
  -- **Team:** `SOL-CSS`.
  -- **Product Family:** `ALSFF`.
  -- **Type:** `SFF-HC1` _(if deploying a 1-node cluster)_ or `SFF-HC3` _(if deploying a 3-nodes cluster)_.
  -- **End Date:** _<as needed> (see note below)_.
  -- **Capabilities:** _<leave empty> (default value)_.
  -- **OEM:** `Any OEM` _(default value)_ unless you need testing on specific HW.
  -- **Model:** `Any Model` _(default value)_ unless you need testing on specific HW.
  -- **Notes:** _<please add a self-contained note so the rest of the team knows what the HW is being used for>_.

_**Note:** maximum reservation time is 8 weeks, i.e.: initial reservation up to 4 weeks, followed by up to 4 extensions of up to 1 week each._

2. Make note of the `Environment ID` and the `Tag` of your reservation. _Note that you can change the tag to something more readable as long as it only contains alphanumeric characters and "-", if you do, please always keep your alias, e.g.: `waltersantos-sff-test-1-node`._

3. Navigate to [SFF Solution](https://dev.azure.com/msazure/One/_build?definitionId=398255&_a=summary) pipeline, click on the `Run pipeline` button, on the top right corner, and fill the values:

  -- **Subscription ID:** `cb7f0640-b6f8-4f68-a0db-3a6a3354d006` _(default value)_.
  -- **Alias:** _<an identifier for the deployment>_, e.g.: `waltersantos-sff`.
  -- **Azure location to deploy resources in:** `eastus` _(unless explicitly required to deploy in Canary in which case use `eastus2euap`)_.
  -- **Start with:** `hardware_bootstrap`.
  -- **Stop the pipeline after a certain stage:** `oem_bootstrap`.
  -- **Cleanup Azure resources after test:** `never`.
  -- **Number of nodes to deploy:** `1` or `3` _(as per your HaaS reservation)_.
  -- **ROE build type:** `buddy`.
  -- **HaaS team name for booking environments:** `SOL-CSS`.
  -- **HaaS environment ID for b88 hardware:** _<the `Environment ID` value resulting from step (2) above>._ If you didn't pre-reserved an environment leave this empty.
  -- **HaaS tag associated with the b88 environment:** _<the `Tag` value resulting from step (2) above>._ If you didn't pre-reserved an environment leave this empty.
  -- **Type of b88 hardware environment:** `SFF-HC1` or `SFF-HC3` _(as per your HaaS reservation)_.

  Then click on `Next: Resources` and finally on `Run`. Once it starts running the pipeline normally takes 2h30m to 3h to complete.

  **Note:** it is OK for some of the pipeline stages and jobs to fail, as long as the `Setup Pipeline` and `ASZ Pre-Deploy` ones complete.

  _If you aren't 100% sure if the bootstrap of your SFF node(s) completed successfully, reach out to Walter Santos for advice._

5. Retrieve the Ownership Voucher (OV) from the artifacts created by your pipeline run:
   `ArtifactCache` -> `Logs` -> `<device hostname>` -> `<machine name>.pem`

6. At this point, your node(s) should be bootstrapped with the SFF ROE image, for you to be able to complete the steps at https://github.com/Azure/AKS-Arc-Private-Previews to complete your SFF deployment. **Note:** you don't need to complete `Module 2: Machine Installation` as the SFF pipeline run takes care of that for you, so once you are done with `Module 1: Subscription Set Up` got straight to `Module 3: Connecting to Azure`.

* * *

# References
- [Hardware as a Service [HaaS]](https://msazure.visualstudio.com/One/_wiki/wikis/AzureStack-CI/240512/About-HaaS).
- [SFF Linux Solution pipeline](https://msazure.visualstudio.com/One/_git/AzureStack-Solution-CI-Infra?path=/StartPipelines/Teams/SFF-SOLUTION&anchor=sff-linux-solution-pipeline).
- [Longer-term reservations process and template](https://microsoft.sharepoint.com/:w:/t/ASZ886/Efhh7ZnQLFFNvQd6fIGF07oBkv-PEjWK-lVXLFPRcNPMBw?e=L3YvIS).
- [Project Glove Rock Private Preview](https://github.com/Azure/AKS-Arc-Private-Previews).
