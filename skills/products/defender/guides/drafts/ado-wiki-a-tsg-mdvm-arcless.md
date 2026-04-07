---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Servers/Vulnerability Assessment/Built-in solution/MDVM - TVM/[Troubleshooting Guide] Microsoft Defender Vulnerability Management (MDVM) Arc-less (MDE native) integration"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Workload%20Protections/Defender%20for%20Servers/Vulnerability%20Assessment/Built-in%20solution/MDVM%20-%20TVM/%5BTroubleshooting%20Guide%5D%20Microsoft%20Defender%20Vulnerability%20Management%20(MDVM)%20Arc-less%20(MDE%20native)%20integration"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Scenarios 1
- I do not see my resources in the inventory.
- I do not see my resources in the Vulnerability Assessment recommendation.

## Known issues
- **The machine used to have an Azure Arc agent installed, which was removed, and the machine was onboarded to Microsoft Defender for Endpoint native integration and stopped reporting data**: Due to some retention internally in Microsoft Defender for Endpoint, such machines keep being reported to Microsoft Defender for Cloud with a stale Azure Id, thus are not part of the Arc-less processing. Since the Azure Id is stale, they are also not part of the Azure processing anymore and fall somewhere in between. We are working with Microsoft Defender for Endpoint to resolve this issue.
- For now, some tenants which have **a lot** of data are filtered out from processing in the Vulnerability Assessment service due to previous external limitations given by the Advanced Resource Graph team. We are actively working to get approval to open up the processing for all customers.

## How do I troubleshoot?
1. **Make sure Servers bundle P1/P2 is turned on for this subscription.**

2. **Make sure a Microsoft Defender for Endpoint designated subscription is selected for the tenant.**

3. **Find the machine's Microsoft Defender for Endpoint Device ID using one of these methods:**
    - The Microsoft Defender for Endpoint Portal’s address for this Virtual Machine:
![Microsoft Defender for Endpoint Portal](/.attachments/MDCTVM2-9cdc8d38-74c2-4828-b729-59cd505f2bff.png)
    - [**Windows**] Running this script on the machine and extract ‘senseId’ from output:
**Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows Advanced Threat Protection\' -Name senseId**
    - [**Linux**] Secure Shell into the machine, and run 'mdatp health'. Extract the 'edr_machine_id' value.
    - Using **Microsoft Defender Advanced Threat Protection Client Analyzer** – refer to [this page](https://dev.azure.com/Supportabilitywork/Azure%20Security/_wiki/wikis/Endpoint%20Protection%20Wiki/3192/Kusto-MachineID-InvestigationMachine) for details.

4. **Go to the dashboard:**
    - [Vulnerability Assessment Arc-less Customer Service and Support Dashboard](https://portal.microsoftgeneva.com/dashboard/RomeR3Prod/CSS%2520dashboards/VA%2520Arcless)
    - Enter both the Microsoft Defender for Endpoint machine ID and the tenant ID in the fields on top, select lookback time.

5. **Microsoft Defender for Endpoint/Microsoft Defender for Virtual Machine processing [Section 1]**
    - “1A. Machine reports reaching Microsoft Defender for Endpoint cloud“: If this table is empty, or you see only partial results and it is only reporting intermittently, there are issues with the Virtual Machine reporting to Microsoft Defender for Endpoint cloud backend.
    - “1B. Machine Profile was created in Microsoft Defender for Endpoint”: If this table is empty, but the machine reports are reaching Microsoft Defender for Endpoint cloud, there is some issue in Microsoft Defender for Endpoint’s processing. The entity for the machine was not created yet.
      - If there is data, check the value of the column “ExclusionState” – if the value is “Excluded”, it means that the customer has excluded the machine from Microsoft Defender for Endpoint’s full processing, thus its value will also be excluded from Microsoft Defender for Virtual Machine -> Microsoft Defender for Cloud.
    - “1C. Microsoft Defender for Virtual Machine Asset Data exists (TvmNaxosAssetSnapshot)”: If the machine is reporting but there is no data in this table, it means that the machine is communicating with Microsoft Defender for Endpoint, but it is not being processed by Microsoft Defender for Virtual Machine for some reason.
    - “1D. Microsoft Defender for Virtual Machine exported data to Microsoft Defender for Cloud”: if the machine is being processed by Microsoft Defender for Virtual Machine, but there is no data in this table, it means that Microsoft Defender for Virtual Machine does not export their results for this machine to Microsoft Defender for Cloud.
    - If you recognize any issues with the traces above:
       - Check that the Microsoft Defender for Endpoint license prerequisites and Microsoft Defender for Cloud workspace assignments were successful (Section 2 - To Be Determined).
       - **Please open a collaboration task with the Microsoft Defender for Endpoint support team to investigate and include this data**.

6. **Microsoft Defender for Cloud prerequisites [Section 2]**
    - “2A. Vulnerability Assessment service Arc-less designated subscription check results”:
      - If this table is empty, it means that the Arc-less data for the tenant is not being processed by the Microsoft Defender for Cloud Vulnerability Assessment service.
      - If the value of “hasDesignatedMdeSubscription” is “false”, it means that when Vulnerability Assessment checks that the tenant has indeed onboarded to Arc-less, it receives “no” as a result. Check the Arc-less onboarding again.
    - Was the Microsoft Defender for Endpoint license successfully created, and the Microsoft Defender for Cloud workspace successfully assigned on Microsoft Defender for Endpoint’s side? (Dashboard Widgets To Be Determined)

7. **Vulnerability Assessment service Failures [Section 3]**
    - “3A. Vulnerability Assessment service Azure Arc-less ids correlation result”:
      - If this table is empty, it means that the Arc-less data for the machine is not being processed by the Microsoft Defender for Cloud Vulnerability Assessment service.
      - If the message indicates failure, it means that the Vulnerability Assessment service failed to get the Arc-less subscription for the tenant. Check the Arc-less onboarding again.
    - “3B. Vulnerability Assessment service tenant data processing failures”: if there are entries in this table, look at the error description and open a ticket to the server Vulnerability Assessment team and include all data collected from the dashboard.
    - “3C. Vulnerability Assessment service sent sub-assessment”: if the Arc-less machine is processed in the Vulnerability Assessment service, but there are no entries for sent sub-assessments, open a ticket to the server Vulnerability Assessment team and include all data collected from the dashboard.

8. **Is the resource on Government Cloud?**
   Check that your customer is on Public Cloud. Enter this link (replace customer tenant id):
`https://login.microsoftonline.com/<customer tenant id>/.well-known/openid-configuration`

# Scenarios 2
- I am seeing the same Arc-less resource multiple times after reinstalling the Microsoft Defender for Endpoint agent.
- I am seeing stale Arc-less resources (that do not exist anymore).

## Known issues
- The component that should clean up stale Arc-less sub-assessments was not implemented yet.
- Important note: **The duplicates are not billed twice; they are just shown multiple times in the portal**.

# Scenarios 3
- I am seeing the same machine several times in the portal in multiple representations:
  - As Arc-less machine & Azure Arc
  - As Arc-less machine & Multi-cloud machine
  - As Arc-less machine & on-premises with Microsoft Monitoring Agent

## Known issues
- Arc-less machine & Azure Arc duplicate representation: can happen if a machine was onboarded to Arc-less integration, and the Microsoft Defender for Endpoint agent was installed natively, and later on, Azure Arc was installed on the machine. (Resolution Work In Progress)
- Arc-less machine & Multi-cloud machine duplicate representation: can happen if a Multi-cloud machine was onboarded to Arc-less integration natively, while being part of an active multi-cloud Microsoft Defender for Cloud connector.
- Arc-less machine & on-premises with Microsoft Monitoring Agent: can happen if both Microsoft Defender for Endpoint & Microsoft Monitoring Agent agents were installed natively on the machine.
- Important note: **The duplicates are not billed twice; they are just shown multiple times in the portal**.
