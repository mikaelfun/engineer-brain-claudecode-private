---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/[Product Knowledge] - Defender Profile Auto provisioning/[Technical Knowledge] - Enabling Containers plan and auto-provisioning at scale"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Workload%20Protections/Defender%20for%20Containers/%5BProduct%20Knowledge%5D%20-%20Defender%20Profile%20Auto%20provisioning/%5BTechnical%20Knowledge%5D%20-%20Enabling%20Containers%20plan%20and%20auto-provisioning%20at%20scale"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Enabling Containers plan and auto-provisioning at scale

## This is how containers bundles/auto provisioning works:
This is what happens when you enable containers bundle in the User Interface (UI)
1. Enable the containers bundle (using the RP request)

## This is what happens when you enable auto provisioning in the UI:
1. Register To AzureDefender feature flag
2. Assign 4 DeployIfNotExists (DINE) policies
3. Create 4 remediation tasks (according to the DeployIfNotExists (DINE) policies)

## How to setup containers bundle and auto provisioning at scale:

1. Enabling the Containers plan:
   - Using "Microsoft Defender for Containers should be enabled" recommendation

2. Containers auto provisioning:
    1. Register AzureDefender on subscription scope (customer can use a basic loop to iterate all subscriptions):
       ```bash
       az feature register --namespace Microsoft.ContainerService --name AKS-AzureDefender --subscription <subscription>
       ```

    2. Assign the following built-in DeployIfNotExists (DINE) policies on management group and create remediation task:
        1. Deploy Azure Policy Add-on to Azure Kubernetes Service clusters (`a8eff44f-8c92-45c3-a3fb-9880802d67a7`)
        2. [Preview]: Configure Azure Arc enabled Kubernetes clusters to install the Azure Policy extension (`0adc5395-9169-4b9b-8687-af838d69410a`)
        3. [Preview]: Configure Azure Kubernetes Service clusters to enable Defender profile (`64def556-fbad-4622-930e-72d1d5589bf5`)
        4. [Preview]: Configure Azure Arc enabled Kubernetes clusters to install Microsoft Defender for Cloud extension (`708b60a6-d253-4fe0-9114-4be4c00f012c`)

    3. How to assign policy and create remediation task:
       - Go to Azure Policy > Assignments > Select policy > Assign on management group scope > Create remediation task

**Note**: Customer still needs the necessary permissions for each operation.

| Author | Version | Date | Content |
|---|---|---|---|
| Lior Kesten | 0.1 | May 10 2022 | First draft for (TIVAN agent) PREVIEW |
