---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/MSConfig Application Reference_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/MSConfig%20Application%20Reference_RDP%20SSH"
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

MSConfig is a tool that comes with all Windows installations used to change how the VM boots. Use whenever troubleshooting requires managing startup services or boot configuration. Particularly relevant when a 3rd-party service is blocking boot or RDP access.

## MSConfig Startup Options

1.  **Normal startup** — Loads all drivers and services. This is the default value.
2.  **Diagnostic Startup** — Loads only basic device drivers and software upon start.
3.  **Selective startup** — More granular control; disable system services and/or startup items.

## Services Tab — Clean Boot

Use **Clean Boot** to determine if a 3rd-party service is causing issues:
1.  Run MSConfig
2.  Go to **Services** tab
3.  Check **Hide all Microsoft Services**
4.  Click **Disable all** — this disables all 3rd-party services
5.  Reboot and test. If issue resolves, re-enable services one by one to identify culprit.

**Note:** The General tab will automatically switch to *Selective Startup* when services are customized.

## Boot Tab Options

- **Safe Boot: Minimal** — Not supported in Azure
- **Safe Boot: Alternate Shell** — Not supported in Azure
- **Safe Boot: Active Directory Repair** — Supported
- **Safe Boot: Network** — Not supported in Azure
- **No GUI Boot** — Suppresses Windows loading screen
- **Boot Log** — Creates %SystemRoot%\ntbtlog.txt
- **OS Boot Information** — Shows driver names as they are loaded
- **Number of processors** — Limit the number of processors used at startup
- **Maximum memory** — Limit the maximum amount of RAM used at startup
- **PCI Lock** — Prevents Windows from reallocating I/O and IRQ resources on PCI bus
- **Debug** — Enables kernel-mode debugging

## Important Notes for Azure VMs

- Safe Boot modes (Minimal, Alternate Shell, Network) are **not supported** in Azure because the Guest OS cannot be accessed via console in those modes.
- Use [Serial Console](https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/serial-console-windows) for basic OS access when RDP is unavailable.
- If VM boots into Safe Mode accidentally and RDP is unavailable, use offline repair (attach disk to rescue VM and modify BCD/registry to revert boot settings).

## Recovery: VM stuck in Safe Mode or abnormal MSConfig boot

If a VM was set to boot with Safe Mode via MSConfig and is now inaccessible:

1.  Attach the OS disk to a rescue/repair VM
2.  Using bcdedit on the attached disk, check and remove safe boot flags:
    ```
    bcdedit /store <OsDrive>:\boot\bcd /deletevalue {default} safeboot
    ```
3.  Reattach disk and restart the original VM
