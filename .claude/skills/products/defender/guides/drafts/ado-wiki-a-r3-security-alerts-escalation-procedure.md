---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Escalations and procedures/Security Alerts & Containers Security Escalations (RomeDetection)/CRI handling process for CSS/Security alerts escalation to Product Group - ICM ticket escalation process"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Escalations%20and%20procedures/Security%20Alerts%20%26%20Containers%20Security%20Escalations%20(RomeDetection)/CRI%20handling%20process%20for%20CSS/Security%20alerts%20escalation%20to%20Product%20Group%20-%20ICM%20ticket%20escalation%20process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Alerts escalation procedure

[[_TOC_]]

## Security Alerts Escalation Flow

:::mermaid
graph TD
A(Alert investigation request ticket) --> |Investigate using our <a href='https://dev.azure.com/asim-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/10148/-Procedure-Microsoft-Defender-for-Cloud-Alerts-Escalation-Path'>Microsoft Defender for Cloud Alerts Escalation Path<a/>| C(Technical Advisor investigation using Troubleshooting Guide and Internal+External Document);
C -->E(Engineering help is required - verify alert boundaries <a href='https://dev.azure.com/asim-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/10162/-Boundaries-Microsoft-Defender-for-Cloud-alerts'>Boundaries - Microsoft Defender for Cloud alerts</a> );
E -->| Ask in scope of security alerts providers - False positive/alert content/Latency*/etc.| F(Identify the alert provider using these <a href='https://dev.azure.com/asim-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/10143/-Troubleshooting-Guide-Security-Alerts-initial-investigation?anchor=get-alerts-from-kusto'>Kusto queries<a/>);
F --> |Look for Alert Provider ICM queue based on <a href='https://msazure.visualstudio.com/One/_wiki/wikis/Rome%20Detection/37941/List-Of-Registered-Providers'>Alerts Providers List**</a>| H(Create CRI to the matching ICM queue);
E --> | Ask in scope of security alerts platform| L(Create CRI to Detection team using templates below);
:::


## Escalate To Alert Platform Engineering Team

Use one of the templates below for the relevant support topic:

| Support Topic | Template |
|--|--|
| Security Alerts False positive or False negative claims | [B261e2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=B261e2) |
| Suppress a Security Alert | [04d52A](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=04d52A) |
| Testing Security Alerts | [wN1H32](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=wN1H32) |

## Alert Published with Latency - How to Handle

Run the following query:

```kql
cluster('romeeus.eastus.kusto.windows.net').database('ProdAlerts').AllSecurityAlerts
| where SystemAlertId =='' // replace with systemAlertId
| project StartTimeUtc, EndTimeUtc, ProviderSendAlertTimeUtc=Metadata['DetectionInternalAlertsProcessing.PipelineReceiveTime'], ProviderName
```

Then two options:

1. If ProviderSendAlertTimeUtc already contains most latency from StartTimeUtc/EndTimeUtc, open Customer Reported Incident directly on provider Incident Case Management group  [Alerts Providers List](https://msazure.visualstudio.com/One/_wiki/wikis/Rome%20Detection/37941/List-Of-Registered-Providers), which includes this query and results.  

\*\* For access to [Alerts Providers List](https://msazure.visualstudio.com/One/_wiki/wikis/Rome%20Detection/37941/List-Of-Registered-Providers) request permissions [here](https://myaccess.microsoft.com/@microsoft.onmicrosoft.com#/access-packages/19b43bd4-f31a-4f25-b074-2f2dd233e0bf). If you don't have access, refer to the table in the section below

2. ProviderSendAlertTimeUtc does not contain the latency - open Customer Reported Incident directly on alert platform team (Detection Team) which includes this query and results.

If email escalation is the only option:  
CC: [Azure Rome ILDC Detection Live Site](mailto:RomeDetectionLive@microsoft.com)

### MDC Alert Providers List

| Provider Name | Publisher name | Short Description | Contact (Owner DL) | LiveSite DL | IcM Group | CSS tickets DL |
| --- | --- | --- | --- | --- | --- | --- |
| Detection | Detection | Old Provider Name for internal ASC Detection team providers | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport using this template:�[B261e2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=B261e2)� | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| FirstParty-WAWS | Detection | - | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| FirstParty-LWAWS | Detection | - | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| IoTSecurity | Detection | IOT Security | [azureiotsecuritydevs](mailto:azureiotsecuritydevs@microsoft.com) | [azureiotsecuritydevs](mailto:azureiotsecuritydevs@microsoft.com) | Azure Security For IoT -> ARIoT - Azure IoT Security | [azureiotsecuritydevs](mailto:azureiotsecuritydevs@microsoft.com) |
| Detection-WarmPathV2 | Detection | WarmPath service detections | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| Detection-WarmPathV2-K8S | Detection | WarmPath service detections | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| Detection-Network | Detection | ASC Detection network stream alerts | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| Detection-AppServices | Detection | - | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport |  |
| AlertSimulator | Detection | Provider of simulated alerts | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| InternalTestProvider | InternalTestProvider | Internal provider for ASC detection tests | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| MSTIC Abuse Protection Service (previously called Sonar) | Detection | - | [Abhijeet Hatekar (MSTIC)](mailto:Abhijeet.Hatekar@microsoft.com)�(Eng),�[Amar Patel (C AND E)](mailto:amarpa@microsoft.com)�(PM) | - | - | - |
| MSTIC | ScubaDetectionPublisher | - | [MSTIC NRT Detections Developer](mailto:msticnrtdetect@microsoft.com) | [MSTIC NRT Detections Developer](mailto:msticnrtdetect@microsoft.com) | Scuba Security Platform -> MSTIC Engineering | [MSTIC NRT Detections Developer](mailto:msticnrtdetect@microsoft.com) |
| MDATP | ScubaDetectionPublisher | - | [Yodan Tauber | [m365duse@microsoft.com](mailto:m365duse@microsoft.com) | M365D Incident and Research / DevIncidentAndResearch | - |
| FilelessAttackDetection | ScubaDetectionPublisher | - | [PICISTeam](mailto:PMF@microsoft.com) | [PICoreDevs](mailto:picore@microsoft.com) | Process Investigator \ Triage | [PICoreDevs](mailto:picore@microsoft.com) |
| SipsIdmlDetections | SipsIdmlDetections | - | [Vijay kumar Venigalla](mailto:vvenigalla@microsoft.com),�[DKV ML ASC Detections Team](mailto:mdakv@microsoft.com) | [DKV ML ASC Detections Team](mailto:mdakv@microsoft.com) | Microsoft Defender for Cloud -> Microsoft Defender for Key Vault | [DKV ML ASC Detections Team](mailto:mdakv@microsoft.com) |
| CloudNetworkSecurity | CloudNetworkSecurity | - | [Qifei Xu](mailto:qifxu@microsoft.com),�[Amit Kumar](mailto:amku@microsoft.com)�[Anupam Vij (PM)](mailto:Anupam.Vij@microsoft.com) | [ddosdev@microsoft.com](mailto:ddosdev@microsoft.com) | Cloudnet\DDOS | [ddosdev@microsoft.com](mailto:ddosdev@microsoft.com) |
| AgentlessAMThreatDetections | AgentlessAMThreatDetections | - | [Guardians](mailto:royaari_team_fte@microsoft.com) | [Guardians](mailto:royaari_team_fte@microsoft.com) | Microsoft Defender for Cloud -> Guardians | [Guardians](mailto:royaari_team_fte@microsoft.com) |
| Servers | Servers | - | [Guardians](mailto:royaari_team_fte@microsoft.com) | [Gurdians](mailto:royaari_team_fte@microsoft.com) | Microsoft Defender for Cloud -> Gurdians | [Guardians](mailto:royaari_team_fte@microsoft.com) |
| RomeDataStorage | RomeDataStorage | - | [Guardians](mailto:royaari_team_fte@microsoft.com) | [Guardians](mailto:royaari_team_fte@microsoft.com) | Microsoft Defender for Cloud -> Guardians | [Guardians](mailto:royaari_team_fte@microsoft.com) |
| Arm | Arm | - | [Azure Storage Threat Detection](mailto:azurestoragetd@microsoft.com) | [Azure Storage Threat Detection � Live Site](mailto:azurestoragetdls@microsoft.com) | Microsoft Defender for Cloud -> Defender For Storage - ATP | [Azure Storage Threat Detection � Live Site](mailto:azurestoragetdls@microsoft.com) |
| Dns | Dns | - | [Azure Storage Threat Detection](mailto:azurestoragetd@microsoft.com) | [Azure Storage Threat Detection � Live Site](mailto:azurestoragetdls@microsoft.com) | Microsoft Defender for Cloud -> Defender For Storage - ATP | Microsoft Defender for Cloud -> Azure Storage Threat Detection |
| --- |  | [Azure Storage Threat Detection � Live Site](mailto:azurestoragetdls@microsoft.com) |  |  |  |  |
| SQLThreatDetection | SQLThreatDetection | SQL ATP alerts | [DB5 Threat Detection Service](mailto:db5tdservice@microsoft.com) | [DB5 Threat Detection Service](mailto:db5tdservice@microsoft.com) | [SQL DB -> SQL ATP](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=x1K1O1)� | [DB5 Threat Detection Service](mailto:db5tdservice@microsoft.com) |
| StorageThreatDetection | StorageThreatDetection | - | [Azure Storage Threat Detection](mailto:azurestoragetd@microsoft.com) | [Azure Storage Threat Detection � Live Site](mailto:azurestoragetdls@microsoft.com) | Microsoft Defender for Cloud -> Defender For Storage - ATP | [Azure Storage Threat Detection � Live Site](mailto:azurestoragetdls@microsoft.com) |
| CosmosDbThreatDetection | CosmosDbThreatDetection | - | [Azure Storage Threat Detection](mailto:azurestoragetd@microsoft.com) | [Azure Storage Threat Detection � Live Site](mailto:azurestoragetdls@microsoft.com) | Microsoft Defender for Cloud -> Defender For Storage - ATP | [Azure Storage Threat Detection � Live Site](mailto:azurestoragetdls@microsoft.com) |
| AF | AF | - | [AzureFraudTeam](mailto:azfraud@microsoft.com) | [AzureFraudTeam](mailto:azfraud@microsoft.com) | Azure Security Engineering -> Azure Fraud | [AzureFraudTeam](mailto:AzureFraudTeam@microsoft.com) |
| DefenderForDevOps | DefenderForDevOps | Detection (WarmPath) | [D4DPM@microsoft.com](mailto:D4DPM@microsoft.com);�[DfDDev@microsoft.com](mailto:DfDDev@microsoft.com) | ([mailto:michaellevy@microsoft.com](mailto:michaellevy@microsoft.com)),�[MPS ILDC - MDA TP - ER (Wolfpack)](mailto:mda-tp-wolfpack@microsoft.com) | [MPS ILDC - MDA TP - ER (Wolfpack)](mailto:mda-tp-wolfpack@microsoft.com) | Microsoft Defender for Cloud Apps/Threat Protection - Team ER (Wolfpack) |
| TrustedVM | TrustedVM | - | [Akash Gupta](mailto:akagu@microsoft.com),�[azsectvm@microsoft.com](mailto:azsectvm@microsoft.com) | [azsectvm@microsoft.com](mailto:azsectvm@microsoft.com) | Trusted Launch -> TVM | - |
| ArgDispatchersTestProvider | ArgDispatchersTestProvider | - | [ASC Accelerator ENG](mailto:ascacceleratoreng@microsoft.com) | [ASC Accelerator ENG](mailto:ascacceleratoreng@microsoft.com) | - | - |
| API-Defender | API-Defender | API Security Alerts | SHA Cloud Application Security - Eng�[shacaseng@microsoft.com](mailto:shacaseng@microsoft.com) | SHA Cloud Application Security - Eng�[shacaseng@microsoft.com](mailto:shacaseng@microsoft.com) | Cloud Application API Security -> Triage | SHA Cloud Application Security - Eng�[shacaseng@microsoft.com](mailto:shacaseng@microsoft.com) |
| DefenderForAI | DefenderForAI | Detection (WarmPath) | [itairosteam@microsoft.com](mailto:itairosteam@microsoft.com) | [itairosteam@microsoft.com](mailto:itairosteam@microsoft.com) |  |  |
| Cobra-Containers | Detection | - | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| Cobra-Containers-Dns | Detection | - | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| AntimalwarePublisher | Detection | - | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| Cobra-Containers-Proc | Detection | - | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| Cobra-Containers-Proc-PoC | Detection | - | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| Cobra-Containers-Dns-Blob | Detection | - | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| Cobra-AI-Sessions | Detection | - | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| Cobra-AI-Sessions-Inference | Detection | - | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| Alert-Grader | Detection | - | [RomeDetectionEng](mailto:RomeDetectionEng@microsoft.com) | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) | Microsoft Defender for Cloud -> RomeDetection/CustomerSupport | [RomeDetectionLive](mailto:RomeDetectionLive@microsoft.com) |
| SecurityForAIModelScan | AIModelScan | provider of model scan alerts | [s4ai-modelscan@microsoft.com](mailto:s4ai-modelscan@microsoft.com) | Microsoft Defender for Cloud -> Protectors Model Scan Team | Protectors Model Scan Team:�[d4ai-modelscan-alerts@service.microsoft.com](mailto:d4ai-modelscan-alerts@service.microsoft.com) | - |

---

### Acronyms List
- Customer Reported Incident (CRI)
- Incident Case Management (ICM)

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
