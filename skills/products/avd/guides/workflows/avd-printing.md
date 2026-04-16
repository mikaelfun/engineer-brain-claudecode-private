# AVD 打印重定向 — 排查工作流

**来源草稿**: ado-wiki-a-twain-faq.md, ado-wiki-a-twain-setup-guide.md, ado-wiki-b-printer-redirection-on-avd-from-print-server.md, ado-wiki-b-raw-printing-setup-guide.md
**Kusto 引用**: (无)
**场景数**: 10
**生成日期**: 2026-04-07

---

## Scenario 1: [[_TOC_]]
> 来源: ado-wiki-a-twain-faq.md | 适用: \u901a\u7528 \u2705

### 排查步骤

### FAQ
| 1. What happens if you have an all in 1 device (printer + TWAIN scanner)?<br> |
| --- |
| **Answer:** If TWAIN redirection is enabled, then the scanner functionality supported by TWAIN will be supported independent of the printing support. As an example, if a customer wants to block printer redirection but supports TWAIN, only the scanning functionality of the device will be supported.<br> |
| 2. Do you support enabling/disabling specific TWAIN devices?<br> |
| ****Answer:**** **No. It is currently a global on/off. We will discuss this with Epic and other customers during Private Preview.** <br> |

## Scenario 2: Environment
> 来源: ado-wiki-b-printer-redirection-on-avd-from-print-server.md | 适用: \u901a\u7528 \u2705

### 排查步骤
To redirect printers from a Print Server on an Azure Virtual Desktop Environment, you need:
   - A Print Server (Windows Server 2016 or 2019)
   - A standalone virtual machine as Client Machine
   - Hybrid Azure Virtual Desktop environment

## Scenario 3: Print Server
> 来源: ado-wiki-b-printer-redirection-on-avd-from-print-server.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Create a Print Server (Windows Server 2019 or 2016 with the Printer Role)
2. Install a printer (physical printer not required)
   - Add a local printer with manual settings
   - Use an existing port (default)
   - Choose any listed driver
   - **Make sure to select "Share this printer"** so other machines on the network can find and use it

## Scenario 4: Standalone Virtual Machine (Jump Server)
> 来源: ado-wiki-b-printer-redirection-on-avd-from-print-server.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Create a standalone VM as jump server to AVD (also serves as client machine)
2. Access the Print Server and map the sample printer
3. Install the MSRD Client to access AVD infrastructure

## Scenario 5: Testing
> 来源: ado-wiki-b-printer-redirection-on-avd-from-print-server.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - The printer from the Print Server should appear in the AVD Session Host

## Scenario 6: Considerations / Troubleshooting Checklist
> 来源: ado-wiki-b-printer-redirection-on-avd-from-print-server.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Verify using the MSRD Version from the web, **not** the Microsoft Store version
   - Double check if printer redirection works via standard RDP
   - Verify that on the Client Machine, printers are being mapped correctly from the Print Server
   - RDP Properties may not play a critical role - in lab testing, even with printer/driver redirection disabled, the printer from Client Machine was still visible

## Scenario 7: RAW Printing Support — Setup Guide
> 来源: ado-wiki-b-raw-printing-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
By default, this feature is **off**. To enable it, follow the instructions below.

## Scenario 8: Enable RAW Printing via RDP Properties
> 来源: ado-wiki-b-raw-printing-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Sign in to the [Azure portal](https://portal.azure.com/).
1. In the search bar, type **Azure Virtual Desktop** and select the matching service entry.
1. Select **Host pools**, then select the host pool you want to configure.
1. Select **RDP Properties**, then select **Advanced**.
1. Add the RDP property based on the table below:
| RDP Property | Description |
|---|---|
| `SmartRawPrinters:s:*` | Enables RAW Printing for **all** printers |
| `SmartRawPrinters:s:Brothers;ZDesigner` | Enables RAW printing for printers with driver name/model starting with `Brothers` or `ZDesigner` |
*To determine the printer driver's name/model:*
1. Plug the printer into a local Windows endpoint.
1. Open Device Manager.
1. Navigate to Printer.
1. Right-click > **Properties** — the printer driver's name/model is listed there.

## Scenario 9: Determine the Printer Driver Name (in Remote Session)
> 来源: ado-wiki-b-raw-printing-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
When RAW printing is enabled, print jobs bypass Remote Desktop Easy Print. To confirm:
1. Connect to a remote session where printer redirection is enabled.
1. Open PowerShell in the remote session and run:
```powershell
   Get-Printer | Select-Object Name, DriverName | Sort-Object Name | FT -AutoSize
```
Example output:
```
   Name                                              DriverName
   ----                                              ----------
   HP LaserJet Pro M404dn (redirected 2)             HP LaserJet Pro M404dn PCL 6
   Microsoft Print to PDF (redirected 2)             Microsoft Print To PDF
```
When RAW printing is enabled, **DriverName** shows the actual local driver (not `Remote Desktop Easy Print`).

## Scenario 10: Validation Scenarios
> 来源: ado-wiki-b-raw-printing-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Launch into an AVD/W365 remote session.
1. Plug in a RAW-only printer to your local Windows endpoint.
1. Open a document.
1. Print on the printer.
