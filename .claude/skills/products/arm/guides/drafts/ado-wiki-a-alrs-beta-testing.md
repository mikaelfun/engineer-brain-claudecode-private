---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Rack Scale/Readiness/Azure Local Rack Scale (ALRS) [aka AL multi-rack]  beta testing effort"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Rack%20Scale%2FReadiness%2FAzure%20Local%20Rack%20Scale%20(ALRS)%20%5Baka%20AL%20multi-rack%5D%20%20beta%20testing%20effort"
importDate: "2026-04-06"
type: troubleshooting-guide
---

 _Date of Last Full Review: N/A. It gets near to real-time updates everyday._

**WIP by the ALRS beta team:** Artur Oliveira, Carlos Natera, Lars Bentzen, Marius Buzenche, Mark Robbins, Nick Meader and Walter Santos.

<span style="background-color:yellow">**THIS IS A LIVING DOC. BOOKMARK IT AND KEEP COMING BACK TO IT FOR THE LATEST INFORMATION**</span>

[[_TOC_]]

# Environment
**Note:** The values below are unlikely to change but ALWAYS refer to [CSS - CSE01 Network information.xlsx](https://microsoft-my.sharepoint-df.com/:x:/p/badutta/IQCTVE9oPpg6RbpXqLurOszrAUWjB8EY9qwZIStzllf8iNU?e=Z76J03) for additional information and the latest values before proceeding with your deployment.

- **Tenant:** Microsoft (72f988bf-86f1-41af-91ab-2d7cd011db47).
- **Subscription:** Edge_AzureLocal_Production (dded2b99-4218-4521-875b-3652a68bb91f).
- **Location:** East US 2 EUAP (eastus2euap).

<span style="background-color:yellow">**[December 18th 2025]:** engineering will be transitioning the CSE01 environment we are testing on from Production (Microsoft - 72f988bf-86f1-41af-91ab-2d7cd011db47) into the pre-cert tenant. Before it can be moved you need to clean out ALL your ALRS resources by **December 31st**. After that time, they won't longer be approving PIM access requests. They don't have a date on when the new test environment will be available next year, but they don't anticipate it being available before **February 1st 2026**.</span>

# Access
1. If you aren't already involved on the ALRS beta-testing effort please reach our to Marius Buzenche or Walter Santos so they can assign you a L3 internal network within the `css-l3domain-1` L3 isolation domain for your testing (if there are still any available).
2. Fulfil the access requirements in [CSS_onboarding_intructions_for_Pub pr.docx](https://microsoft-my.sharepoint-df.com/:w:/p/badutta/IQCX9OrKX1XZQr7WIzne9ODaAbepTcAXM_TEMU5YClRo6Kc?e=IvXiRx).
3. Linked to the above, but please ALWAYS remember to follow the process and etiquette at [Canary Lab Usage Process - Overview](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_wiki/wikis/AzureForOperatorsIndustry.wiki/26432/Canary-Lab-Usage-Process).

# Comms Channels
Note: If you cannot join any of the channels below, reach out to one of the existing members of the ALRS beta team and they'll get you sorted.
- [Azure Local Rack Scale CSS Lab testing | Group Chat | Microsoft Teams](https://teams.microsoft.com/l/chat/19:678ef4922071490a9003034b9f171169@thread.v2/conversations?context=%7B%22contextType%22%3A%22chat%22%7D): the main group chat. For questions and anything else related to the ongoing testing effort.
- [ALRS beta testing sync-up | Meeting Chat | Microsoft Teams](https://teams.microsoft.com/l/chat/19:meeting_ZDQ3ZTM4ODYtNWU2Yi00MmJhLWI5Y2QtZGQwMmM5OWEzMjJk@thread.v2/conversations?context=%7B%22contextType%22%3A%22chat%22%7D): weekly internal sync.
- [CSS+Pathfinder collab - Azure Local Rack Scale - working session | Meeting Chat | Microsoft Teams](https://teams.microsoft.com/l/chat/19:meeting_OWFkMjg1NmYtODYwOS00NTgxLThiMGEtNjdjZjgwYzFjZjI0@thread.v2/conversations?context=%7B%22contextType%22%3A%22chat%22%7D): weekly sync-up call with Pathfinder, PG and Engineering.
- [ALRS (CSE01)/Nexus (Can1) EUAP Production Instances | Group Chat | Microsoft Teams](https://teams.microsoft.com/l/chat/19:91a8935d25444d6799bb4cf970a0b1ce@thread.v2/conversations?context=%7B%22contextType%22%3A%22chat%22%7D): mainly used to get your JIT `Contributor` role within the subscription approved.

# Documents and resources
-   [CSS_onboarding_intructions_for_Pub pr](https://microsoft-my.sharepoint-df.com/:f:/p/badutta/IgA7yS07K9gFQ4H54x6rfCDRAXxi8FD7zpJLqubOeVp7nP0?e=EoWOfZ): testing guidance and ARM templates. The Word document also contains information related to access, the ALRS canary lab usage etiquette, Azure Portal URL with the appropriate preview flags.
- [What are multi-rack deployments of Azure Local? (preview) - Azure Local | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-local/multi-rack/multi-rack-overview?view=azloc-2511): customer-facing documentation.

# Known issues and limitations
Most known issues and limitations are documented in:
1. [CSS_onboarding_intructions_for_Pub pr.docx](https://microsoft-my.sharepoint-df.com/:w:/p/badutta/IQCX9OrKX1XZQr7WIzne9ODaAbepTcAXM_TEMU5YClRo6Kc?e=3DW8uJ)
2. [CSS Bug Triage dashboard - Overview](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_dashboards/dashboard/84029828-d3bd-4287-9a63-5facebd1bcf4) (_formerly [Tenant Layer Bug Bash testing.loop](https://microsoft.sharepoint-df.com/:fl:/g/contentstorage/CSP_7fbf02c3-81d6-491d-9b81-e5fb43603180/IQDfzHOzZGk0QqbKQGuk02smAb6uXjTNrKIbqrGKOYo6gcc?e=Cc8vAi&nav=cz0lMkZjb250ZW50c3RvcmFnZSUyRkNTUF83ZmJmMDJjMy04MWQ2LTQ5MWQtOWI4MS1lNWZiNDM2MDMxODAmZD1iJTIxd3dLX2Y5YUJIVW1iZ2VYN1EyQXhnSDY5d3VSRnJ3UkpqbUhZWTlVczBndTlURXV1LTYzOFNaSk5mNDFaOU42cCZmPTAxUkFKQVRBTzdaUlozR1pESkdSQktOU1NBTk9TTkcyWkcmYz0lMkYmYT1Mb29wQXBwJnA9JTQwZmx1aWR4JTJGbG9vcC1wYWdlLWNvbnRhaW5lciZ4PSU3QiUyMnclMjIlM0ElMjJUMFJUVUh4dGFXTnliM052Wm5RdWMyaGhjbVZ3YjJsdWRDMWtaaTVqYjIxOFlpRjNkMHRmWmpsaFFraFZiV0puWlZnM1VUSkJlR2RJTmpsM2RWSkdjbmRTU21wdFNGbFpPVlZ6TUdkMU9WUkZkWFV0TmpNNFUxcEtUbVkwTVZvNVRqWndmREF4VWtGS1FWUkJTVEpUVVVKTk5WSXpWVVZhUVV0UFRrRmFSRkphUlZCV1FrWSUzRCUyMiUyQyUyMmklMjIlM0ElMjI0NjU1NmMyZC1hYWQyLTQ1MWQtYjkxYy1kMGMwMjlhNzMxNTQlMjIlN0Q%3D)_)
3. [Azure Local max - Known Issues - Documentation.docx](https://microsoft-my.sharepoint-df.com/:w:/p/sanjanamohan/IQA-bFkiOWsjRqo3nQ-tEmE9AURI2dWv0NSXQFV2-Va3Nk0?e=ZVqR1l) 

but there are a few things we have hit so far which are worth mentioning, so folks are aware of them and don't waste precious time unnecessarily:

## Be aware
- We recommend skipping the optional step to create a custom [Azure Local VM image](https://learn.microsoft.com/en-us/azure/azure-local/multi-rack/multi-rack-virtual-machine-image-storage-account?view=azloc-2511), as it is time-consuming, some of us have gone through it already to validate it works, and it doesn't really add much value to the testing we are doing. There are already a few images within the subscription that you can use instead.
- There are a few mismatches with the required parameters to create each of the resources depending on the interface being used (Az CLI, Azure Portal, ARM templates, etc.). We started collating that information at [input_parameters_mismatches.xlsx](https://microsofteur.sharepoint.com/:x:/t/AzureForOperatorsCSSHub/IQCIZRX9OwAZRaqEVnhnlX6xAYDo1Zf698NjuVvxlBMxqZo?e=2RivKg) if you want to confirm what you are observing. Please fix any errors and add any missing info so others can benefit from it.
- When creating Windows VMs via the CLI `az stack-hci-vm create` using the [winmulti-11-qcow2](https://ms.portal.azure.com/#@microsoft.onmicrosoft.com/resource/subscriptions/dded2b99-4218-4521-875b-3652a68bb91f/resourceGroups/dramasamy-cse01-8bb91f-wl-rg/providers/Microsoft.AzureStackHCI/galleryImages/winmulti-11-qcow2/overview) Azure Local VM image, the resulting VM doesn't have an account matching the username you provided via the `admin-username` parameter, so you will get a `Permission denied, please try again` error if you try to SSH or RDP to that VM using that account. To successfully SSH or RDP to the Windows VM use the `Administrator` or `azureuser` and the password provided via the `admin-password` parameter at creation time. We have reported this to PG/Dev to understand why the user specified at creation time is missing.
- Once created there is no way to see virtual networks (VNETs) subnets via the Azure Portal, nor these appear under the parent VNET JSON. At the moment VNET subnets can only be queried via the Azure CLI `az stack-hci-vm network vnet subnet show` provided you saved the values used at creation time. Otherwise you can use `az stack-hci-vm network vnet subnet list` first to list all subnets in your virtual network.
- Linux and Windows VMs are not provisioned with the DNS servers specified in the configuration of the Logical Network (LNET) or Virtual Network (VNET). As a result, external DNS name resolution fails. A workaround is to define the DNS configuration at the NIC level instead before creating the VMs. If you don't do that, you will need to manually configure the DNS server `10.156.1.4` for CSE01, or the one applicable to your test environment, within the VMs themselves as per the OS documentation.
- Public IP resources can only have a **name** value of up to 26 lowercase characters, or the create operation will fail. This is a bug an has been raised under [User Story 2539598 [BugBash-Product #43] Using more than 26 characters for the name of a public IP resource triggers an error](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_workitems/edit/2539598). If you get blocked by this issue, you can work around it by using **name** value containing 26 lowercase characters or less in the meantime.(https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_workitems/edit/2539598)
- NAT gateway inbound rules **name** values cannot contain uppercase characters, or the create operation will fail. This is a bug an has been raised under [User Story 2539469 [BugBash-Product #42] Using uppercase characters in the "name" field of NAT GW inbound rules as suggested in the docs and CLI he...](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_workitems/edit/2539469). If you get blocked by this issue, you can work around it by using inbound rules **name** values containing just lowercase characters in the meantime.
- If using the `az stack-hci-vm network nat create` to create a NAT gateway, due to the way the ALRS SDN resources relate to each other you cannot provide any inbound rules when first creating the NAT GW resources (see [User Story 2539466 [BugBash-Docs #29] Public docs missing steps to create NAT GW](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_workitems/edit/2539466) for full details if interested). Instead, you should follow a three steps sequence, i.e.:
  1. Create the NAT GW resource without any inbound rules.
  2. Associate the NAT GW with the VNET subnet where the NIC resources connected to the VMs that will be referenced by the NAT GW inbound rules exist.
  3. Update the NAT GW resource using the same `az stack-hci-vm network nat create` command used when you created it  in step (1), but now including the required inbound rules configuration.
