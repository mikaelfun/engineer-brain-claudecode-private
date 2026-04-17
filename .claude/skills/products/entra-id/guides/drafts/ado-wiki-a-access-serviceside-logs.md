---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/Access ServiceSide Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAccess%20ServiceSide%20Logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Access Service-Side Logs for Azure Active Directory

## Introduction

To access and query service-side logs for Azure AD (Cloud Identity) components, you must join the respective access groups via MyAccess/IDWeb.

## Access Requests

### MSODS & AAD Gateway

| Diagnostics Prod Namespace | MyAccess Project | Direct URL |
|---|---|---|
| AzureAD & MSODS EndPoints | AAD MSODS - MDS Table RO | [AAD MSODS - MDS Table RO](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/aadmsodsmdst-ds43) |
| Azure AD Gateway | AADGatewayMDS | [AAD Gateway MDS - 20178](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/aadgatewaymd-ae12) |

### Office 365 Suite UX

| FirstParty Prod NameSpace | IDWeb Security Group | Direct URL |
|---|---|---|
| O365 Suite EndPoints | o365prodcmaro | [Join Group](https://idweb/IdentityManagement/aspx/customized/PopupCustomizedObject.aspx?type=Group&id=1eaf86be-3ed6-4ac8-a6b2-100f9777ba56&_p=1) |

## Geneva (DGrep) Namespace Information

### MSODS PROD

| Namespace | Description | Events |
|---|---|---|
| msodsprod | MSODS Service Logs | ULSEvents, TofuEtwEvent |
| msodsprod | MSODS Auditing | IfxAuditLoggingCommon |

### MSODS Fairfax

Endpoint: **CA Fairfax**

| Namespace | Description | Events |
|---|---|---|
| msodsfairfax | MSODS Fairfax Service Logs | UlsEvents, TofuEtwEvent |
| msodsfairfax | MSODS Auditing | IfxAuditLoggingCommon |

### MSODS Mooncake

Endpoint: **CA Mooncake**

| Namespace | Description | Events |
|---|---|---|
| msodsgallatin | MSODS Gallatin Service Logs | UlsEvents, TofuEtwEvent |

### eSTS

| Namespace | Description | Events |
|---|---|---|
| AadEvoSTSPROD | eSTS Service Logs | DiagnosticTracesIfx, PerRequestTableIfx |

### AAD Gateway Diagnostics

| Namespace | Description | Events |
|---|---|---|
| aaddiaggateway | AAD Gateway Diagnostics | RequestEvent, RequestSummaryEvent |

### Office 365 Suite UX (FirstParty PROD)

| Namespace | Description | Events |
|---|---|---|
| o365SuiteProd | Office 365 Portal Logs | BoxLogEvent |

## Kusto Endpoint Information

### MSODS Public PROD

| Cluster | Region | Datacenter |
|---|---|---|
| https://msodseas.kusto.windows.net | East Asia | HK1R |
| https://msodsneu.kusto.windows.net | North Europe | DB3A, DB3R |
| https://msodsseas.kusto.windows.net | Southeast Asia | SG2R |
| https://msodsuseast.kusto.windows.net | East US | BL2 |
| https://msodsusncnt.kusto.windows.net | North Central US | CH1 |
| https://msodsusscnt.kusto.windows.net | South Central US | SN2 |
| https://msodsuswest.kusto.windows.net | West US | CO1, CO2, BY1 |
| https://msodsweu.kusto.windows.net | West Europe | AM3A, AM5R, AM1, AM3 |

### MSODS National Cloud

| Cluster | Environment |
|---|---|
| https://msodsff.kusto.windows.net | Fairfax |
| https://msodsmc.kusto.windows.net | Mooncake |
| https://msodsbf.kusto.windows.net | BlackForest |

### eSTS Public PROD

| Cluster | Region | Datacenter |
|---|---|---|
| https://estsdb3.kusto.windows.net | North Europe | DB3, DUB1, DUB2 |
| https://estsam2.kusto.windows.net | West Europe | AM2, AMS1, AMS2 |
| https://estsch1.kusto.windows.net | North Central US | CH1, CHI |
| https://estssn1.kusto.windows.net | South Central US | SN1, SAN, CHY |
| https://estsbl2.kusto.windows.net | East US | BL2, EST |
| https://estsby1.kusto.windows.net | West US | BY1, WST |
| https://estssin.kusto.windows.net | Southeast Asia | SIN, SIN1, SIN2 |
| https://estshkn.kusto.windows.net | East Asia | HKN, HKG1, HKG2 |

### eSTS National Cloud

| Cluster | Environment | Datacenter |
|---|---|---|
| https://estschina.kusto.windows.net | Mooncake | BJB, SHA |
| https://estsbf.kusto.windows.net | Black Forest | LEJ, FRA |
| https://estsff.kusto.windows.net | Fairfax | All prod (shared front-ends) |

## Setup Kusto Desktop Client

1. Install by accessing any eSTS Kusto endpoint in a browser (e.g. https://estsdb3.kusto.windows.net)
2. Open Kusto Application
3. Click '+' to add new connection
4. **Data Source** = Choose from Kusto Endpoints above
5. **Authentication** = Client Security: AAD-Federated
6. Authenticate via browser popup
7. If access denied, check RamWeb group membership

More details: https://aka.ms/Kusto
