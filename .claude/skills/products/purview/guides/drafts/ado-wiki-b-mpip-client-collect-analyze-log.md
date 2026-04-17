---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MPIP Client/How to: MPIP Client/How to: Collect and analyze MPIP Client log"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Client%2FHow%20to%3A%20MPIP%20Client%2FHow%20to%3A%20Collect%20and%20analyze%20MPIP%20Client%20log"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to: Collect and analyze MPIP Client log

Logging is by default enabled on MPIP client. Use this guide to analyze logs when investigating any MPIP client related issues.

## Prerequisites

- Download and install MSIPLogViewer application: MSIP.Tools.LogViewer.Setup.zip (available in ADO Wiki attachments)

## Step 1: Export and get the logs from the client machine

- Clear existing logs before collecting if the issue can be reproduced:
  - Open MPIP client → **Help and Feedback** → **Reset Settings**
  - Reproduce the issue
  - Go to **Help and Feedback** → **Export Logs** → saves to a compressed ZIP file
- Alternatively, manually copy all files from `%localappdata%\Microsoft\MSIP`

## Step 2: Extract and understand the ZIP structure

The exported ZIP contains:

| Folder | Contents |
|--------|----------|
| **MIP** | SDK logs and policy sqlite files for various applications used by MPIP client |
| **MSIP** | Extracted Policy.xml and MSIP logs for various applications |
| **MSIPC** | Encryption/decryption logs used by MSIPC-enabled apps (e.g., Office apps) |
| **Registry** | Registry export of MIP and MSIPC relevant configurations |
| **Windows Event Logs** | Application and System Event log exports |

## Step 3: Analyze logs using MSIPLogViewer

Start from logs under `\MSIP\Logs\`:

| Log file | Use when investigating |
|----------|----------------------|
| `MSIPViewer.iplog` | Opening encrypted file using AIP Viewer application |
| `MSIPApp.iplog` | Applying or removing label using MIP Client |
| `MSIPPowershell.iplog` | Applying, removing, or retrieving label using MIP Client PowerShell |

**Tips:**
- Use **Orange** and **Red** flags to quickly filter warnings and errors
- Search using the filename used to reproduce the issue
- Look at the **Message** column or bottom pane for detailed descriptions
- Verify these key events are successful:
  - `Acquired a token`
  - `Engine loaded for PolicyEngine`

### Analyzing policy loading issues (mip_sdk logs)

If there are policy loading issues, check the mip_sdk log:
- Located at: `..\MSIP\mip\<application>.exe\mip\logs\mip_sdk.miplog`
- Open with MSIPLogViewer
- Create filters for: `Sending HTTP request` and `Received HTTP response`
- Verify HTTP status codes in responses: **200, 301, 302, 304, 401** are expected; anything else is suspicious

## Step 4: Verify Policy Settings are retrieved correctly

- Open `Policy.xml` from `..\MSIP` folder (from the exported ZIP)
- Verify settings are correct and up-to-date as configured in the portal
