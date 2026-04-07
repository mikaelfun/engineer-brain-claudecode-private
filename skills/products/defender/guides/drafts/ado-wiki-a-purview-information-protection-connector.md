---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Microsoft First Party Connectors/[TSG] - Microsoft Purview Information Protection"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FData%20Ingestion%20-%20Connectors%2FMicrosoft%20First%20Party%20Connectors%2F%5BTSG%5D%20-%20Microsoft%20Purview%20Information%20Protection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Background

Full doc is here: [Microsoft Purview Information Protection Help Guide](https://eng.ms/docs/security-compliance-identity-and-management-scim/modern-protection-soc-mps/sentinel/sentinel/microsoft-azure-sentinel/azure-sentinel-operational-guides/helpguides/connectors/microsoftpurviewinformationprotection/mpiphelpguide).

Microsoft Purview Information Protection data connector collects Office sensitivity label events and Azure Information Protection events that are published to Office. This is a Scuba routing rule based connector, similar to other Office connectors it collects the tenant audit logs through the Office Management API.
Unlike other Office-based connectors, this connector collects events from multiple Office services. Scuba polls the Office Management API and publishes to Log Analytics records based on the record type or operation name. By collecting a subset of events with a specific operation name we should automatically collect events from services that will add sensitivity label events in the future.
The following Audit logs are collected:

# Record Types

- AipDiscover
- AipFileDeleted
- AipHeartBeat
- AipProtectionAction
- AipScannerDiscoverEvent
- AipSensitivityLabelAction
- SensitivityLabelAction
- SensitivityLabelPolicyMatch
- SensitivityLabeledFileAction
- MIPLabel
- MipAutoLabelSharePointItem
- MipAutoLabelSharePointPolicyLocation
- MipAutoLabelExchangeItem
- MicrosoftTeamsSensitivityLabelAction

# Operations

- FileSensitivityLabelApplied
- FileSensitivityLabelChanged
- FileSensitivityLabelRemoved
- SensitivityLabelApplied
- SensitivityLabelRemoved
- SensitivityLabelRecommended
- SensitivityLabelUpdated
- SensitivityLabelChanged
- sitesensitivitylabelapplied
- sitesensitivitylabelchanged
- sitesensitivitylabelremoved
- documentsensitivitymismatchdetected

The collected record types and operations are defined in the [SecEng-Scuba-Platform](https://msazure.visualstudio.com/One/_git/SecEng-Scuba-Platform?path=%2Fsrc%2FPlatform%2FLogCollector%2FLogCollectorCommon%2FModels%2FO365%2FO365MIPMapping.cs&_a=contents&version=GBmaster) repo.

The Microsoft Purview Information Protection table is defined in the [AM-CMS-Artifacts repository](https://msazure.visualstudio.com/One/_git/AM-CMS-Artifacts?path=/content/NGSchemas/Sentinel/MicrosoftPurview.manifest.json).
