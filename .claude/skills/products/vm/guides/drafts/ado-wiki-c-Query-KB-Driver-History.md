---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Query for KB or Driver History_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/Query%20for%20KB%20or%20Driver%20History_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
---

[[_TOC_]]

## Summary

Reference guide for using the **Binary Search** tool to look up Windows driver version history and identify which KB introduced a specific driver version. Useful when troubleshooting VM connectivity or performance issues related to a specific driver.

## How to Use Binary Search

1.  Go to [Binary Search](https://trackit.microsoft.com/binarysearch/)
2.  In the **Product** search field, select the OS:
    - Windows Server 2016 → select **RS1 (Windows 10 1607/Windows Server 2016)**
    - Windows Server 2019 → select **RS5 (Windows 10 1809/Windows Server 2019)**
3.  In the binary search field, enter the driver/binary name (e.g., `netvsc.sys`)
4.  Click Search

## Reading the Results

- The tool shows all release versions of that driver and which KB introduced each version
- Compare the driver version on the customer's OS with the latest binary version
- Identify the most recent KB containing the latest driver version
- Click on the KB number → **Microsoft Update Catalog** → download the update
- If both Cumulative and Delta options are available, select the **Delta**

## Common Drivers for RDP/SSH Troubleshooting

| Driver | Function |
|---|---|
| `netvsc.sys` | Hyper-V network adapter driver — key for VM network connectivity |
| `vmbus.sys` | VMBus driver — Hyper-V guest communication |
| `storvsc.sys` | Storage VSC driver — virtual disk controller |
| `termdd.sys` | Terminal Services driver — RDP server component |
| `rdpdr.sys` | RDP device redirector |

## Workflow

1. Customer reports driver-related issue (network, RDP, storage)
2. Get current driver version from customer: `Get-Item C:\Windows\System32\drivers\<driver>.sys | Select-Object -ExpandProperty VersionInfo`
3. Look up driver in Binary Search to find latest version and KB
4. Identify if customer is on an outdated version
5. Direct customer to install the KB via Windows Update or offline DISM
