---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Workflows/Device Redirection/Printer Redirection on AVD from a Print Server"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FWorkflows%2FDevice%20Redirection%2FPrinter%20Redirection%20on%20AVD%20from%20a%20Print%20Server"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Printer Redirection on AVD from a Print Server

## Environment

To redirect printers from a Print Server on an Azure Virtual Desktop Environment, you need:
- A Print Server (Windows Server 2016 or 2019)
- A standalone virtual machine as Client Machine
- Hybrid Azure Virtual Desktop environment

## Setup Steps

### Print Server
1. Create a Print Server (Windows Server 2019 or 2016 with the Printer Role)
2. Install a printer (physical printer not required)
   - Add a local printer with manual settings
   - Use an existing port (default)
   - Choose any listed driver
   - **Make sure to select "Share this printer"** so other machines on the network can find and use it

### Standalone Virtual Machine (Jump Server)
1. Create a standalone VM as jump server to AVD (also serves as client machine)
2. Access the Print Server and map the sample printer
3. Install the MSRD Client to access AVD infrastructure

### Testing
- The printer from the Print Server should appear in the AVD Session Host

## Considerations / Troubleshooting Checklist

- Verify using the MSRD Version from the web, **not** the Microsoft Store version
- Double check if printer redirection works via standard RDP
- Verify that on the Client Machine, printers are being mapped correctly from the Print Server
- RDP Properties may not play a critical role - in lab testing, even with printer/driver redirection disabled, the printer from Client Machine was still visible
