---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/RMS Connector/Learn: RMS Connector/Learn: Connector SPNs"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FRMS%20Connector%2FLearn%3A%20RMS%20Connector%2FLearn%3A%20Connector%20SPNs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# RMS Connector Service Principals (SPNs)

## Introduction

The RMS connector creates Azure AD service principals (SPs). There is a main connector SP, `Aadrm_S-1-7-0`. There are other SPs, for each authorized identity in the connector configuration (e.g. Exchange Servers).

## Inspecting Connector SPNs

To search Entra for the Connector service principals, use the Azure AZ PowerShell Module.

### Useful Commands

| Command | Description |
|---------|-------------|
| `Get-AzADServicePrincipal` | Retrieve a list of Entra Id service principals (SPs) |
| `Get-AzADServicePrincipal \| fl` | Retrieve a detailed list of Entra Id SPs |
| `Get-AzADServicePrincipal \| Sort-Object -Property DisplayName \| ft DisplayName,AppId,Id` | Retrieve a list ordered by DisplayName |
| `Get-AzADServicePrincipal \| Where-Object {$_.ServicePrincipalName -Match "aadrm"} \| fl` | Retrieve AADRM SPs with details |
| `Get-AzADServicePrincipal \| Where-Object {$_.ServicePrincipalName -Match "aadrm"} \| fl Id,AppId,ObjectType,DisplayName,ServicePrincipalName,ServicePrincipalType,AccountEnabled` | Succinct list of AADRM SPs |
| `Get-AzADServicePrincipal \| Where-Object {$_.Displayname -Match "Microsoft.Azure.ActiveDirectoryRightsManagement"} \| fl DisplayName,ServicePrincipalName,AdditionalProperties` | Get Connector SPNs including created date |
