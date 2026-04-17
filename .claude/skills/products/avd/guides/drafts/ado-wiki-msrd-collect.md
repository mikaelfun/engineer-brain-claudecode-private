---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Tools and Data Collection/AVD/MSRD-Collect"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Tools%20and%20Data%20Collection/AVD/MSRD-Collect"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# MSRD-Collect (Microsoft Remote Desktop Collect)

PowerShell script for collecting diagnostic data for AVD, RDS, and Windows 365 Cloud PC troubleshooting.

## Requirements
- PowerShell 5.1 or newer
- Elevated (admin) rights — preferably Domain Admin or Domain User with local admin
- Secure DTM workspace for data submission
- If ExecutionPolicy blocks: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Force -Scope Process`
- PowerShell ISE is NOT supported

## Download
Latest version: https://aka.ms/MSRD-Collect (public link). Always use latest version.

## Usage for Windows 365 Connectivity Issues
- Machine context: **W365**
- Machine role: **Source** (user's local computer) or **Target** (Cloud PC)
- Scenario: **Core** (add additional scenarios as needed)

## Key Features
- Collects data for: deployment, configuration, session connectivity, profiles (FSLogix), Teams media optimization, MSIX App Attach, Remote Assistance
- **MSRD-Diag.html** diagnostics report provides extensive system overview to pinpoint known issues

## Links
- How to use: See ADO Wiki WindowsVirtualDesktop/1048609
- Sample action plans: See ADO Wiki WindowsVirtualDesktop/665072
- What data is collected: See ADO Wiki WindowsVirtualDesktop/665070
- Feedback: MSRDCollectTalk@microsoft.com (internal)
