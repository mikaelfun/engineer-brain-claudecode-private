---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/RMS Connector/Troubleshooting Scenarios: RMS Connector/Scenario: RMS Connector TSG"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FRMS%20Connector%2FTroubleshooting%20Scenarios%3A%20RMS%20Connector%2FScenario%3A%20RMS%20Connector%20TSG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# RMS Connector TSG (Troubleshooting Guide)

## Introduction

The RMS Connector service integrates on-premises server applications (Exchange, SharePoint, FCI) with AIP/AADRM for encryption. It does NOT provide sensitivity label functionality.

**Key**: On-premises Exchange does not need Connector integration if user mailboxes are on-premises and only Outlook on Windows/Mac is used. Connector integration is needed only when Exchange servers themselves need RMS functionality (OWA, mobile mail clients with on-premises mailboxes).

## Step 1: Connector Connectivity

Before troubleshooting application integration, verify the Connector itself works.

### Admin Wizard
The RMS Connector administration tool runs as user context. The Connector service running as system context needs separate verification.

### Running as system context
1. Open an elevated command prompt.
2. Run `iisreset`.
3. Check the application event log for successful retrieval of authorized accounts (Event ID 1004 = success).

If Event 1004 is NOT logged → troubleshoot Connector-to-Azure connectivity first.

## Step 2: Service Authorizations

For Exchange/SharePoint/FCI to use the Connector, they must be authorized. See [Authorizing servers to use the RMS connector](https://learn.microsoft.com/en-us/azure/information-protection/install-configure-rms-connector#authorizing-servers-to-use-the-rms-connector).

## Step 3: Service Connectivity (Client Registry Settings)

Exchange/SharePoint/FCI servers require registry settings to discover/redirect to the Connector. See [Configuring servers for the Azure Rights Management connector](https://learn.microsoft.com/en-us/azure/information-protection/configure-servers-rms-connector).

Use `GenConnectorConfig.ps1` with `-CreateRegEditFiles` parameter to generate .reg files:
```powershell
.\GenConnectorConfig.ps1 -ConnectorUri http://MyConnector -CreateRegEditFiles
```

## Step 4: Service Troubleshooting

### Exchange Troubleshooting
1. Run `Get-IRMConfiguration` and save output.
2. Run `Test-IRMConfiguration -sender user@contoso.com` and save output.
3. Grab IRM Logs generated during test execution.
4. Note any RMS Connector errors in Windows Application event log.

**Common Error**: `VerifyMachineCertificateChainFailedException` → See [How To: Exchange cryptographic overrides](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/11297/How-To-Exchange-cryptographic-overrides).

#### IRM Logs
See [Information Rights Management logging](https://learn.microsoft.com/en-us/exchange/information-rights-management-logging-exchange-2013-help).

### SharePoint Troubleshooting

SharePoint uses MSIPC (like Office on Windows). MSIPC logs location:
`C:\ProgramData\Microsoft\MSIPC\Server`

**Note**: Some directories are hidden/system protected. Enable "Show hidden files" and uncheck "Hide protected operating system files" in Explorer.

Under `C:\ProgramData\Microsoft\MSIPC\Server` there will be SID-named directories for the SharePoint Farm accounts, each containing log files.

#### IRM-integrated document libraries
- Content stored unencrypted in library; protected on download.
- If download fails → troubleshoot SharePoint side.
- If file downloads but won't open → troubleshoot client side.

See internal KB for SharePoint IRM issues: KB4500944.

### FCI
FCI may be an RMS Connector client but no documented cases yet.
