---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Collect Logs from VM_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FCollect%20Logs%20from%20VM_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Collect Logs from VM / Inspect IaaS Disk (RDP/SSH Troubleshooting)

## Summary

There are multiple ways to run an Inspect IaaS Disk. The default method should always be through [Azure Support Center (ASC)](https://azuresupportcenter.msftcloudes.com/caseoverview). At times the default method does not work for various reasons. If you are unable to collect Inspect IaaS Disk through ASC, ask the customer to manually collect them.

1. Azure Support Center
2. Collect from Customer manually

## Ways to Collect Inspect IaaS Disk

### Option 1 - Inspect IaaS Disk with ASC

1. Access [ASC](https://azuresupportcenter.msftcloudes.com/caseoverview) and navigate to **Resource Explorer**.
2. Choose the VM for which you desire to collect Inspect IaaS Disk and then click on the **Diagnostics** Tab.
3. Click on **Create Report**.
4. On the Create Report screen choose the following options and then click **Run**:
   - Mode: Diagnostic
   - Run Analyzer: Box unchecked
   - Analysis Start Time: Leave blank
   - Analysis End Time: Leave blank
5. When Inspect IaaS Disk (Diagnostics) completes, click the download button to download to your local machine.

### Option 2 - Manual Collection Inspect IaaS Disk with Customer

If all previous attempts to collect an Inspect IaaS Disk failed then the only option is to contact the customer and collect required information manually.

Please check the TSG below to collect the data manually:
[Logs Collection_AGEX](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495009/Log-Collection_AGEX#Windows-Manually-Collect-Logs)
