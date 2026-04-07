---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/RAW Printing Support/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/In-Development%20Content/RAW%20Printing%20Support/Setup%20Guide"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# RAW Printing Support — Setup Guide

By default, this feature is **off**. To enable it, follow the instructions below.

## Enable RAW Printing via RDP Properties

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

## Determine the Printer Driver Name (in Remote Session)

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

## Validation Scenarios

1. Launch into an AVD/W365 remote session.
1. Plug in a RAW-only printer to your local Windows endpoint.
1. Open a document.
1. Print on the printer.
